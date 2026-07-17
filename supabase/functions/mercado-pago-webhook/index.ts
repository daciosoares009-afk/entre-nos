import { createClient } from 'npm:@supabase/supabase-js@2';
import { catalog } from '../_shared/catalog.ts';

function getServiceRoleKey() {
  const legacyKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (legacyKey) return legacyKey;
  const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
  return keys.default as string | undefined;
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

async function hmacHex(secret: string, message: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function isValidSignature(request: Request, dataId: string, secret: string) {
  const signatureHeader = request.headers.get('x-signature') || '';
  const requestId = request.headers.get('x-request-id') || '';
  const parts = Object.fromEntries(signatureHeader.split(',').map((part) => part.trim().split('=', 2)));
  if (!parts.ts || !parts.v1) return false;

  const normalizedId = dataId.toLowerCase();
  const manifest = `${normalizedId ? `id:${normalizedId};` : ''}${requestId ? `request-id:${requestId};` : ''}ts:${parts.ts};`;
  const calculated = await hmacHex(secret, manifest);
  return constantTimeEqual(calculated, parts.v1);
}

function mapPaymentStatus(status: string) {
  if (status === 'approved') return 'paid';
  if (status === 'refunded' || status === 'charged_back') return 'refunded';
  if (status === 'cancelled' || status === 'rejected') return 'cancelled';
  if (status === 'in_process' || status === 'in_mediation') return 'under_review';
  return 'pending';
}

function mapOrderStatus(status: string, statusDetail: string) {
  if (status === 'processed' && statusDetail === 'accredited') return 'paid';
  if (status === 'refunded') return 'refunded';
  if (status === 'canceled' || status === 'cancelled' || status === 'failed' || status === 'expired') return 'cancelled';
  if (status === 'processing' || status === 'in_review') return 'under_review';
  return 'pending';
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('ok', { status: 200 });

  try {
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({} as { data?: { id?: string }; type?: string }));
    const dataId = String(url.searchParams.get('data.id') || body?.data?.id || '');
    const eventType = url.searchParams.get('type') || body?.type;
    if ((eventType !== 'payment' && eventType !== 'order') || !dataId) return new Response('ok', { status: 200 });

    const webhookSecret = Deno.env.get('MERCADO_PAGO_WEBHOOK_SECRET');
    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = getServiceRoleKey();
    if (!webhookSecret || !accessToken || !supabaseUrl || !serviceRoleKey) return new Response('missing configuration', { status: 503 });

    if (!(await isValidSignature(request, dataId, webhookSecret))) return new Response('invalid signature', { status: 401 });

    const resourceResponse = await fetch(
      eventType === 'order'
        ? `https://api.mercadopago.com/v1/orders/${encodeURIComponent(dataId)}`
        : `https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!resourceResponse.ok) return new Response(`${eventType} lookup failed`, { status: 502 });

    const resource = await resourceResponse.json();
    const orderPayment = eventType === 'order' ? resource?.transactions?.payments?.[0] : null;
    const orderNumber = String(resource.external_reference || '');
    if (!orderNumber) return new Response('ok', { status: 200 });

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { data: orderRegistrations, error: lookupError } = await supabase
      .from('registrations')
      .select('is_order_owner,wants_shirt,shirt_quantity,wants_button,button_quantity,wants_cup,cup_quantity,wants_mug,mug_quantity')
      .eq('order_number', orderNumber);
    if (lookupError || !orderRegistrations?.length) return new Response('registration not found', { status: 404 });

    const orderOwner = orderRegistrations.find((item) => item.is_order_owner) || orderRegistrations[0];

    const expectedAmount =
      orderRegistrations.length * catalog.ticket +
      (orderOwner.wants_shirt ? orderOwner.shirt_quantity * catalog.shirt : 0) +
      (orderOwner.wants_button ? orderOwner.button_quantity * catalog.button : 0) +
      (orderOwner.wants_cup ? orderOwner.cup_quantity * catalog.cup : 0) +
      (orderOwner.wants_mug ? orderOwner.mug_quantity * catalog.mug : 0);
    const receivedAmount = Number(eventType === 'order' ? resource.total_amount : resource.transaction_amount);
    const amountMatches = Math.abs(expectedAmount - receivedAmount) < 0.01;
    const providerStatus = String(eventType === 'order' ? resource.status : resource.status);
    const providerStatusDetail = String(eventType === 'order' ? resource.status_detail || orderPayment?.status_detail || '' : resource.status_detail || '');
    const status = amountMatches
      ? eventType === 'order'
        ? mapOrderStatus(providerStatus, providerStatusDetail)
        : mapPaymentStatus(providerStatus)
      : 'under_review';

    const { error: updateError } = await supabase
      .from('registrations')
      .update({
        payment_status: status,
        mercado_pago_preference_id: eventType === 'order' ? String(resource.id) : undefined,
        mercado_pago_payment_id: String(eventType === 'order' ? orderPayment?.id || resource.id : resource.id),
        mercado_pago_status: providerStatus,
        payment_updated_at: new Date().toISOString(),
      })
      .eq('order_number', orderNumber);

    if (updateError) return new Response('database update failed', { status: 500 });
    await supabase.from('payment_audit_log').insert({
      order_number: orderNumber,
      source: `webhook_${eventType}`,
      provider_id: String(eventType === 'order' ? orderPayment?.id || resource.id : resource.id),
      provider_status: providerStatus,
      local_status: status,
      detail: { status_detail: providerStatusDetail, amount_matches: amountMatches },
    });
    return new Response('ok', { status: 200 });
  } catch (error) {
    console.error('Mercado Pago webhook error', error);
    return new Response('internal error', { status: 500 });
  }
});
