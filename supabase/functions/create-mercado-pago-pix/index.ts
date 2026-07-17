import { createClient } from 'npm:@supabase/supabase-js@2';
import { catalog } from '../_shared/catalog.ts';

const defaultSiteUrl = 'https://entre-nos-eta.vercel.app';
const genericPaymentError = 'Não foi possível processar o pagamento no momento. Tente novamente em instantes.';
const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('PUBLIC_SITE_URL') || defaultSiteUrl,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

function getServiceRoleKey() {
  const legacyKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (legacyKey) return legacyKey;
  const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
  return keys.default as string | undefined;
}

function normalizeAccessToken(value: string | undefined) {
  return value?.trim().replace(/^Bearer\s+/i, '').replace(/^['"]|['"]$/g, '').trim();
}

function getErrorDetail(payload: Record<string, unknown>) {
  const error = typeof payload?.error === 'string' ? payload.error : '';
  const message = typeof payload?.message === 'string' ? payload.message.replace(/[\r\n]+/g, ' ').slice(0, 240) : '';
  const errors = Array.isArray(payload?.errors)
    ? payload.errors
      .map((item: { code?: string; message?: string; detail?: string }) => [item?.code, item?.message || item?.detail].filter(Boolean).join(': '))
      .filter(Boolean)
      .slice(0, 3)
      .join(', ')
    : '';
  const cause = Array.isArray(payload?.cause)
    ? payload.cause.map((item: { code?: string; description?: string }) => item?.code || item?.description || '').filter(Boolean).slice(0, 3).join(', ')
    : '';
  return [error, message, errors, cause].filter(Boolean).join(' — ');
}

async function readOrder(accessToken: string, orderId: string) {
  const response = await fetch(`https://api.mercadopago.com/v1/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;
  return response.json();
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);

  try {
    const accessToken = normalizeAccessToken(Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN'));
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = getServiceRoleKey();
    if (!accessToken || !supabaseUrl || !serviceRoleKey) {
      console.error('Mercado Pago Pix configuration is incomplete', { accessToken: Boolean(accessToken), supabaseUrl: Boolean(supabaseUrl), serviceRoleKey: Boolean(serviceRoleKey) });
      return json({ error: genericPaymentError }, 503);
    }
    const { registrationNumber, ticketCode } = await request.json();
    if (!registrationNumber || !ticketCode) return json({ error: 'Inscrição inválida.' }, 400);

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { data: registration, error: registrationError } = await supabase
      .from('registrations')
      .select('registration_number,order_number,ticket_code,payment_status,turnstile_verified_at')
      .eq('registration_number', registrationNumber)
      .eq('ticket_code', ticketCode)
      .single();

    if (registrationError || !registration) return json({ error: 'Inscrição não encontrada.' }, 404);
    if (!registration.turnstile_verified_at) return json({ error: 'Verificação de segurança necessária para iniciar o pagamento.' }, 403);
    const orderNumber = registration.order_number || registration.registration_number;
    const { data: orderRegistrations, error: orderError } = await supabase
      .from('registrations')
      .select('registration_number,name,email,is_order_owner,wants_shirt,shirt_quantity,wants_cup,cup_quantity,wants_mug,mug_quantity,payment_status')
      .eq('order_number', orderNumber);

    if (orderError || !orderRegistrations?.length) return json({ error: 'Compra não encontrada.' }, 404);
    if (orderRegistrations.every((item) => item.payment_status === 'paid')) return json({ error: 'Esta compra já está paga.' }, 409);

    const orderOwner = orderRegistrations.find((item) => item.is_order_owner) || orderRegistrations[0];
    const total =
      orderRegistrations.length * catalog.ticket +
      (orderOwner.wants_shirt ? orderOwner.shirt_quantity * catalog.shirt : 0) +
      (orderOwner.wants_cup ? orderOwner.cup_quantity * catalog.cup : 0) +
      (orderOwner.wants_mug ? orderOwner.mug_quantity * catalog.mug : 0);
    const amount = total.toFixed(2);

    const orderResponse = await fetch('https://api.mercadopago.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `entre-nos-pix-${orderNumber}-${Math.floor(Date.now() / 600000)}`,
      },
      body: JSON.stringify({
        type: 'online',
        total_amount: amount,
        external_reference: orderNumber,
        processing_mode: 'automatic',
        transactions: {
          payments: [{
            amount,
            payment_method: { id: 'pix', type: 'bank_transfer' },
            expiration_time: 'PT24H',
          }],
        },
        payer: { email: orderOwner.email },
      }),
    });

    let mercadoPagoOrder = await orderResponse.json();
    if (!orderResponse.ok || !mercadoPagoOrder?.id) {
      const detail = getErrorDetail(mercadoPagoOrder || {});
      const reference = orderResponse.headers.get('x-request-id');
      console.error('Mercado Pago Pix Order error', { status: orderResponse.status, detail, reference });
      return json({ error: genericPaymentError }, 502);
    }

    let payment = mercadoPagoOrder?.transactions?.payments?.[0];
    let paymentMethod = payment?.payment_method;
    if (!paymentMethod?.qr_code && mercadoPagoOrder.status === 'processing') {
      await new Promise((resolve) => setTimeout(resolve, 800));
      mercadoPagoOrder = (await readOrder(accessToken, String(mercadoPagoOrder.id))) || mercadoPagoOrder;
      payment = mercadoPagoOrder?.transactions?.payments?.[0];
      paymentMethod = payment?.payment_method;
    }

    if (!paymentMethod?.qr_code || !paymentMethod?.qr_code_base64) {
      console.error('Mercado Pago Pix QR Code missing', { orderId: mercadoPagoOrder?.id, status: mercadoPagoOrder?.status });
      return json({ error: genericPaymentError }, 502);
    }

    const { error: updateError } = await supabase
      .from('registrations')
      .update({
        mercado_pago_preference_id: String(mercadoPagoOrder.id),
        mercado_pago_payment_id: String(payment?.id || mercadoPagoOrder.id),
        mercado_pago_status: String(payment?.status || mercadoPagoOrder.status || 'action_required'),
        payment_updated_at: new Date().toISOString(),
        total_amount: total,
      })
      .eq('order_number', orderNumber);
    if (updateError) console.error('Pix Order tracking update error', updateError);

    return json({
      orderId: String(mercadoPagoOrder.id),
      paymentId: String(payment?.id || ''),
      qrCode: paymentMethod.qr_code,
      qrCodeBase64: paymentMethod.qr_code_base64,
      ticketUrl: paymentMethod.ticket_url || '',
      amount: total,
      expiresIn: '24 horas',
    });
  } catch (error) {
    console.error('Create Pix Order error', error);
    return json({ error: genericPaymentError }, 500);
  }
});
