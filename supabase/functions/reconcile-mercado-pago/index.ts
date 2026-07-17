import { createClient } from 'npm:@supabase/supabase-js@2';
import { getServiceRoleKey, json } from '../_shared/http.ts';

function localStatus(status: string, detail = '') {
  if (status === 'approved' || (status === 'processed' && detail === 'accredited')) return 'paid';
  if (['refunded', 'charged_back'].includes(status)) return 'refunded';
  if (['cancelled', 'canceled', 'rejected', 'failed', 'expired'].includes(status)) return 'cancelled';
  if (['in_process', 'in_mediation', 'processing', 'in_review'].includes(status)) return 'under_review';
  return 'pending';
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);
  const cronSecret = Deno.env.get('CRON_SECRET');
  if (!cronSecret || request.headers.get('Authorization') !== `Bearer ${cronSecret}`) return json({ error: 'Acesso não autorizado.' }, 401);
  const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')?.trim().replace(/^Bearer\s+/i, '');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = getServiceRoleKey();
  if (!accessToken || !supabaseUrl || !serviceRoleKey) return json({ error: 'Integração não configurada.' }, 503);
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const since = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString();
  const { data: owners, error } = await supabase.from('registrations')
    .select('order_number,total_amount,mercado_pago_preference_id,mercado_pago_payment_id,payment_status')
    .eq('is_order_owner', true).gte('created_at', since)
    .or('mercado_pago_payment_id.not.is.null,mercado_pago_preference_id.not.is.null').limit(200);
  if (error) return json({ error: 'Falha ao listar pagamentos.' }, 500);
  let updated = 0; let failed = 0;
  for (const owner of owners || []) {
    try {
      const orderId = String(owner.mercado_pago_preference_id || '');
      const paymentId = String(owner.mercado_pago_payment_id || '');
      const isOrder = orderId.startsWith('ORD');
      const searchByReference = !isOrder && !paymentId;
      const url = isOrder
        ? `https://api.mercadopago.com/v1/orders/${encodeURIComponent(orderId)}`
        : searchByReference
          ? `https://api.mercadopago.com/v1/payments/search?${new URLSearchParams({ external_reference: owner.order_number, sort: 'date_created', criteria: 'desc', limit: '10' })}`
          : `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`;
      const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!response.ok) { failed += 1; continue; }
      const responseBody = await response.json();
      const resource = searchByReference ? responseBody?.results?.[0] : responseBody;
      if (!resource) continue;
      const payment = isOrder ? resource?.transactions?.payments?.[0] : resource;
      const providerStatus = String(isOrder ? resource.status || payment?.status || '' : resource.status || '');
      const detail = String(isOrder ? resource.status_detail || payment?.status_detail || '' : resource.status_detail || '');
      let status = localStatus(providerStatus, detail);
      const received = Number(isOrder ? resource.total_paid_amount || resource.total_amount : resource.transaction_amount);
      if (status === 'paid' && Math.abs(received - Number(owner.total_amount)) >= 0.01) status = 'under_review';
      if (owner.payment_status === 'paid' && ['pending', 'under_review', 'cancelled'].includes(status)) status = 'paid';
      const providerResolvedId = String(payment?.id || resource.id || paymentId);
      const changed = status !== owner.payment_status;
      const { error: updateError } = await supabase.from('registrations').update({ payment_status: status, mercado_pago_status: providerStatus, mercado_pago_payment_id: providerResolvedId, payment_updated_at: new Date().toISOString() }).eq('order_number', owner.order_number);
      if (updateError) { failed += 1; continue; }
      if (changed) {
        await supabase.from('payment_audit_log').insert({ order_number: owner.order_number, source: 'scheduled_reconciliation', provider_id: providerResolvedId, provider_status: providerStatus, local_status: status, detail: { status_detail: detail, received_amount: received } });
        updated += 1;
      }
    } catch (itemError) { console.error('Reconcile item error', owner.order_number, itemError); failed += 1; }
  }
  return json({ checked: owners?.length || 0, updated, failed });
});
