import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const prices = { ticket: 15, shirt: 45, cup: 12, mug: 40 };
const defaultSiteUrl = 'https://entre-nos-eta.vercel.app';

function getPublicSiteOrigin(value: string | undefined) {
  try {
    const url = new URL(value || defaultSiteUrl);
    if (url.protocol !== 'https:') return defaultSiteUrl;
    return url.origin;
  } catch {
    return defaultSiteUrl;
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

function getServiceRoleKey() {
  const legacyKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (legacyKey) return legacyKey;
  const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
  return keys.default as string | undefined;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);

  try {
    const accessToken = Deno.env
      .get('MERCADO_PAGO_ACCESS_TOKEN')
      ?.trim()
      .replace(/^Bearer\s+/i, '')
      .replace(/^['"]|['"]$/g, '')
      .trim();
    const siteUrl = getPublicSiteOrigin(Deno.env.get('PUBLIC_SITE_URL'));
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = getServiceRoleKey();
    if (accessToken && !accessToken.startsWith('APP_USR-')) {
      return json({ error: 'O segredo configurado não é um Access Token de produção do Mercado Pago. Ele deve começar com APP_USR-.' }, 503);
    }
    if (!accessToken || !siteUrl || !supabaseUrl || !serviceRoleKey) {
      return json({ error: 'Integração de pagamento não configurada.' }, 503);
    }

    const { registrationNumber, ticketCode } = await request.json();
    if (!registrationNumber || !ticketCode) return json({ error: 'Inscrição inválida.' }, 400);

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { data: registration, error: registrationError } = await supabase
      .from('registrations')
      .select('registration_number,order_number,is_order_owner,ticket_code,name,email,payment_status')
      .eq('registration_number', registrationNumber)
      .eq('ticket_code', ticketCode)
      .single();

    if (registrationError || !registration) return json({ error: 'Inscrição não encontrada.' }, 404);
    const orderNumber = registration.order_number || registration.registration_number;
    const { data: orderRegistrations, error: orderError } = await supabase
      .from('registrations')
      .select('registration_number,name,email,is_order_owner,wants_shirt,shirt_color,shirt_size,shirt_quantity,wants_cup,cup_quantity,wants_mug,mug_quantity,payment_status')
      .eq('order_number', orderNumber);

    if (orderError || !orderRegistrations?.length) return json({ error: 'Compra não encontrada.' }, 404);
    if (orderRegistrations.every((item) => item.payment_status === 'paid')) return json({ error: 'Esta compra já está paga.' }, 409);

    const orderOwner = orderRegistrations.find((item) => item.is_order_owner) || orderRegistrations[0];
    const ticketQuantity = orderRegistrations.length;

    const items: Array<Record<string, unknown>> = [
      { id: 'ingresso-entre-nos', title: 'Ingresso Entre Nós Experience', quantity: ticketQuantity, currency_id: 'BRL', unit_price: prices.ticket },
    ];
    if (orderOwner.wants_shirt && orderOwner.shirt_quantity > 0) {
      items.push({ id: 'camiseta-entre-nos', title: `Camiseta Entre Nós - ${orderOwner.shirt_color} ${orderOwner.shirt_size}`, quantity: orderOwner.shirt_quantity, currency_id: 'BRL', unit_price: prices.shirt });
    }
    if (orderOwner.wants_cup && orderOwner.cup_quantity > 0) {
      items.push({ id: 'copo-entre-nos', title: 'Copo acrílico Entre Nós', quantity: orderOwner.cup_quantity, currency_id: 'BRL', unit_price: prices.cup });
    }
    if (orderOwner.wants_mug && orderOwner.mug_quantity > 0) {
      items.push({ id: 'caneca-entre-nos', title: 'Caneca Entre Nós', quantity: orderOwner.mug_quantity, currency_id: 'BRL', unit_price: prices.mug });
    }
    const serverTotal = items.reduce((total, item) => total + Number(item.unit_price) * Number(item.quantity), 0);

    const preferenceResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': `entre-nos-${orderNumber}` },
      body: JSON.stringify({
        items,
        payer: { name: orderOwner.name, email: orderOwner.email },
        external_reference: orderNumber,
        notification_url: `${supabaseUrl}/functions/v1/mercado-pago-webhook`,
        statement_descriptor: 'ENTRE NOS',
        back_urls: {
          success: `${siteUrl}/sucesso?payment=approved`,
          pending: `${siteUrl}/sucesso?payment=pending`,
          failure: `${siteUrl}/sucesso?payment=failure`,
        },
        auto_return: 'approved',
      }),
    });

    const preference = await preferenceResponse.json();
    if (!preferenceResponse.ok || !preference.id || !preference.init_point) {
      const diagnosticCodes = [
        typeof preference?.error === 'string' ? preference.error : '',
        ...(Array.isArray(preference?.cause) ? preference.cause.map((item: { code?: string }) => item?.code || '') : []),
      ].filter(Boolean).slice(0, 4);
      const diagnosticSuffix = diagnosticCodes.length > 0 ? ` Código: ${diagnosticCodes.join(', ')}.` : '';
      const technicalMessage = typeof preference?.message === 'string'
        ? preference.message.replace(/[\r\n]+/g, ' ').slice(0, 240)
        : '';
      const mercadoPagoRequestId = preferenceResponse.headers.get('x-request-id') || '';

      console.error('Mercado Pago preference error', {
        status: preferenceResponse.status,
        error: preference?.error,
        message: preference?.message,
        cause: Array.isArray(preference?.cause) ? preference.cause.map((item: { code?: string }) => item?.code).filter(Boolean) : [],
      });

      if (preferenceResponse.status === 401) {
        return json({ error: 'O Mercado Pago recusou o Access Token (erro 401). Gere uma nova credencial de produção na conta do vendedor e atualize o segredo no Supabase.' }, 502);
      }

      if (preferenceResponse.status === 403) {
        const identityResponse = await fetch('https://api.mercadolibre.com/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const identityStatus = identityResponse.status;
        const detail = [diagnosticCodes.join(', '), technicalMessage].filter(Boolean).join(' — ');
        const requestReference = mercadoPagoRequestId ? ` Referência: ${mercadoPagoRequestId}.` : '';
        const identityDetail = identityResponse.ok
          ? ' O token autenticou a conta, mas a política do Mercado Pago bloqueou o Checkout Pro.'
          : ` A verificação da própria conta também foi recusada (HTTP ${identityStatus}), indicando bloqueio da conta ou da credencial.`;
        return json({ error: `O Mercado Pago recusou a criação do pagamento (erro 403).${detail ? ` Detalhe: ${detail}.` : ''}${identityDetail}${requestReference}` }, 502);
      }

      if (preferenceResponse.status === 400) {
        const detail = [diagnosticCodes.join(', '), technicalMessage].filter(Boolean).join(' — ');
        const requestReference = mercadoPagoRequestId ? ` Referência: ${mercadoPagoRequestId}.` : '';
        return json({ error: `O Mercado Pago recusou os dados do checkout (erro 400).${detail ? ` Detalhe: ${detail}.` : diagnosticSuffix}${requestReference}` }, 502);
      }

      return json({ error: 'O Mercado Pago não conseguiu criar a cobrança neste momento. Tente novamente em alguns instantes.' }, 502);
    }

    const { error: updateError } = await supabase.from('registrations').update({ mercado_pago_preference_id: preference.id, total_amount: serverTotal }).eq('order_number', orderNumber);
    if (updateError) console.error('Preference tracking update error', updateError);
    return json({ checkoutUrl: preference.init_point, preferenceId: preference.id });
  } catch (error) {
    console.error('Create preference error', error);
    return json({ error: 'Erro inesperado ao iniciar o pagamento.' }, 500);
  }
});
