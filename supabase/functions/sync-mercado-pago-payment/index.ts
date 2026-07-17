import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
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

function mapOrderStatus(status: string, detail: string) {
  if (status === 'processed' && detail === 'accredited') return 'paid';
  if (status === 'refunded') return 'refunded';
  if (['canceled', 'cancelled', 'failed', 'expired'].includes(status)) return 'cancelled';
  if (['processing', 'in_review'].includes(status)) return 'under_review';
  return 'pending';
}

function mapPaymentStatus(status: string) {
  if (status === 'approved') return 'paid';
  if (status === 'refunded' || status === 'charged_back') return 'refunded';
  if (status === 'cancelled' || status === 'rejected') return 'cancelled';
  if (status === 'in_process' || status === 'in_mediation') return 'under_review';
  return 'pending';
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);

  try {
    const accessToken = normalizeAccessToken(Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN'));
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = getServiceRoleKey();
    if (!accessToken || !supabaseUrl || !serviceRoleKey) return json({ error: 'Integração não configurada.' }, 503);

    const { registrationNumber, ticketCode } = await request.json();
    if (!registrationNumber || !ticketCode) return json({ error: 'Inscrição inválida.' }, 400);

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { data: registration } = await supabase
      .from('registrations')
      .select('registration_number,order_number,ticket_code')
      .eq('registration_number', registrationNumber)
      .eq('ticket_code', ticketCode)
      .single();
    if (!registration) return json({ error: 'Inscrição não encontrada.' }, 404);

    const orderNumber = registration.order_number || registration.registration_number;
    const { data: orderRegistrations } = await supabase
      .from('registrations')
      .select('is_order_owner,wants_shirt,shirt_quantity,wants_cup,cup_quantity,wants_mug,mug_quantity,payment_status,mercado_pago_preference_id')
      .eq('order_number', orderNumber);
    if (!orderRegistrations?.length) return json({ error: 'Compra não encontrada.' }, 404);
    if (orderRegistrations.every((item) => item.payment_status === 'paid')) return json({ paymentStatus: 'paid' });

    const owner = orderRegistrations.find((item) => item.is_order_owner) || orderRegistrations[0];
    const expectedAmount =
      orderRegistrations.length * 15 +
      (owner.wants_shirt ? owner.shirt_quantity * 45 : 0) +
      (owner.wants_cup ? owner.cup_quantity * 12 : 0) +
      (owner.wants_mug ? owner.mug_quantity * 40 : 0);

    const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
    let order: Record<string, any> | null = null;
    const storedOrderId = String(owner.mercado_pago_preference_id || '');
    if (storedOrderId.startsWith('ORD')) {
      const response = await fetch(`https://api.mercadopago.com/v1/orders/${encodeURIComponent(storedOrderId)}`, { headers });
      if (response.ok) order = await response.json();
    }

    if (!order) {
      const end = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      const begin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const query = new URLSearchParams({
        begin_date: begin,
        end_date: end,
        external_reference: orderNumber,
        type: 'online',
        page: '1',
        page_size: '10',
        sort_by: 'created_date',
        sort_order: 'desc',
      });
      const response = await fetch(`https://api.mercadopago.com/v1/orders?${query}`, { headers });
      if (response.ok) {
        const result = await response.json();
        order = Array.isArray(result?.data) ? result.data[0] || null : null;
      }
    }

    let providerStatus = 'pending';
    let paymentStatus = 'pending';
    let providerId = '';
    let orderId = '';
    let receivedAmount = 0;

    if (order) {
      const payment = order?.transactions?.payments?.[0];
      providerStatus = String(order.status || payment?.status || 'pending');
      paymentStatus = mapOrderStatus(providerStatus, String(order.status_detail || payment?.status_detail || ''));
      providerId = String(payment?.id || order.id || '');
      orderId = String(order.id || '');
      receivedAmount = Number(order.total_paid_amount || order.total_amount || 0);
    } else {
      const query = new URLSearchParams({ external_reference: orderNumber, sort: 'date_created', criteria: 'desc', limit: '10' });
      const response = await fetch(`https://api.mercadopago.com/v1/payments/search?${query}`, { headers });
      if (response.ok) {
        const result = await response.json();
        const payment = Array.isArray(result?.results) ? result.results[0] : null;
        if (payment) {
          providerStatus = String(payment.status || 'pending');
          paymentStatus = mapPaymentStatus(providerStatus);
          providerId = String(payment.id || '');
          receivedAmount = Number(payment.transaction_amount || 0);
        }
      }
    }

    if (paymentStatus === 'paid' && Math.abs(receivedAmount - expectedAmount) >= 0.01) paymentStatus = 'under_review';
    const update: Record<string, unknown> = {
      payment_status: paymentStatus,
      mercado_pago_status: providerStatus,
      payment_updated_at: new Date().toISOString(),
    };
    if (providerId) update.mercado_pago_payment_id = providerId;
    if (orderId) update.mercado_pago_preference_id = orderId;
    await supabase.from('registrations').update(update).eq('order_number', orderNumber);

    return json({ paymentStatus });
  } catch (error) {
    console.error('Sync Mercado Pago payment error', error);
    return json({ error: 'Não foi possível consultar o pagamento.' }, 500);
  }
});
