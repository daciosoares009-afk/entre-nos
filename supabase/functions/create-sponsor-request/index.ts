import { createClient } from 'npm:@supabase/supabase-js@2';
import { cleanText, corsHeaders, getServiceRoleKey, json, sha256 } from '../_shared/http.ts';
import { verifyTurnstile } from '../_shared/turnstile.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = getServiceRoleKey();
    if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Serviço indisponível.' }, 503);
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const requesterHash = await sha256(`${Deno.env.get('RATE_LIMIT_SALT') || supabaseUrl}:${ip}`);
    const { data: allowed } = await supabase.rpc('consume_rate_limit', { scope_input: 'sponsor', requester_hash_input: requesterHash, limit_input: 5, window_minutes_input: 60 });
    if (allowed === false) return json({ error: 'Muitas tentativas. Aguarde uma hora ou fale com o suporte.' }, 429);
    const body = await request.json();
    if (!(await verifyTurnstile(request, body.turnstileToken, 'sponsor'))) return json({ error: 'Verificação de segurança inválida ou expirada. Tente novamente.' }, 403);
    if (body.acceptedTerms !== true) return json({ error: 'Você precisa aceitar os termos.' }, 400);
    const companyName = cleanText(body.companyName, 120);
    const responsibleName = cleanText(body.responsibleName, 120);
    const email = cleanText(body.email, 160).toLowerCase();
    const phone = cleanText(body.phone, 24).replace(/[^\d+()\s-]/g, '');
    const city = cleanText(body.city, 80);
    const supportType = cleanText(body.supportType, 80);
    const message = cleanText(body.message, 1000);
    if (companyName.length < 2 || responsibleName.length < 3 || city.length < 2 || supportType.length < 2 || message.length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.replace(/\D/g, '').length < 10) return json({ error: 'Revise os dados informados.' }, 400);
    const { error } = await supabase.from('sponsor_requests').insert({ company_name: companyName, responsible_name: responsibleName, email, phone, city, cnpj: cleanText(body.cnpj, 20) || null, support_type: supportType, message, status: 'new' });
    if (error) { console.error('Sponsor insert error', error); return json({ error: 'Não foi possível enviar a proposta.' }, 500); }
    return json({ ok: true }, 201);
  } catch (error) {
    console.error('Sponsor request error', error);
    return json({ error: 'Não foi possível enviar a proposta.' }, 500);
  }
});
