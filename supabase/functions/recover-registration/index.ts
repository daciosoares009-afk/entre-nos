import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, getServiceRoleKey, json, sha256 } from '../_shared/http.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = getServiceRoleKey();
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Serviço indisponível.' }, 503);
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const requesterHash = await sha256(`${Deno.env.get('RATE_LIMIT_SALT') || supabaseUrl}:${ip}`);
    const { data: allowed } = await supabase.rpc('consume_rate_limit', { scope_input: 'recovery', requester_hash_input: requesterHash, limit_input: 10, window_minutes_input: 60 });
    if (allowed === false) return json({ error: 'Muitas tentativas. Aguarde uma hora.' }, 429);
    const { registrationNumber, recoveryToken } = await request.json();
    if (typeof registrationNumber !== 'string' || typeof recoveryToken !== 'string' || recoveryToken.length < 24) return json({ error: 'Número ou código de recuperação inválido.' }, 400);
    const tokenHash = await sha256(recoveryToken.trim().toUpperCase());
    const { data: owner } = await supabase.from('registrations').select('*').eq('order_number', registrationNumber.trim().toUpperCase()).eq('is_order_owner', true).eq('recovery_token_hash', tokenHash).maybeSingle();
    if (!owner) return json({ error: 'Número ou código de recuperação inválido.' }, 404);
    const { data: rows, error } = await supabase.from('registrations').select('registration_number,ticket_code,name').eq('order_number', owner.order_number).order('created_at');
    if (error || !rows?.length) return json({ error: 'Não foi possível recuperar a inscrição.' }, 500);
    return json({ registrationNumber: owner.order_number, ticketCode: rows[0].ticket_code, recoveryToken, name: rows[0].name, ticketQuantity: rows.length, tickets: rows.map((row) => ({ registrationNumber: row.registration_number, ticketCode: row.ticket_code, name: row.name })), wantsShirt: owner.wants_shirt, shirtColor: owner.shirt_color || '', shirtSize: owner.shirt_size || '', shirtQuantity: owner.shirt_quantity, wantsButton: owner.wants_button, buttonQuantity: owner.button_quantity, wantsCup: owner.wants_cup, cupQuantity: owner.cup_quantity, wantsMug: owner.wants_mug, mugQuantity: owner.mug_quantity, totalAmount: Number(owner.total_amount) });
  } catch (error) { console.error('Recovery error', error); return json({ error: 'Não foi possível recuperar a inscrição.' }, 500); }
});
