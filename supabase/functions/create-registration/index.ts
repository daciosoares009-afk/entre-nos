import { createClient } from 'npm:@supabase/supabase-js@2';
import { calculateServerTotal, catalog } from '../_shared/catalog.ts';
import { cleanText, corsHeaders, getServiceRoleKey, json, sha256 } from '../_shared/http.ts';

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function randomCode(length: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}
function integer(value: unknown, minimum: number, maximum: number) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) throw new Error('Dados da inscrição inválidos.');
  return number;
}
function requiredText(value: unknown, minimum: number, maximum: number) {
  const text = cleanText(value, maximum);
  if (text.length < minimum) throw new Error('Preencha todos os dados obrigatórios.');
  return text;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = getServiceRoleKey();
    if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Serviço de inscrição indisponível.' }, 503);
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('cf-connecting-ip') || 'unknown';
    const requesterHash = await sha256(`${Deno.env.get('RATE_LIMIT_SALT') || supabaseUrl}:${ip}`);
    const { data: allowed, error: rateError } = await supabase.rpc('consume_rate_limit', {
      scope_input: 'registration', requester_hash_input: requesterHash, limit_input: 8, window_minutes_input: 60,
    });
    if (rateError) console.error('Rate limit error', rateError);
    if (allowed === false) return json({ error: 'Muitas tentativas. Aguarde uma hora ou fale com o suporte.' }, 429);

    const body = await request.json();
    if (body.acceptedTerms !== true || body.privacyConsent !== true) return json({ error: 'Aceite os termos e a Política de Privacidade.' }, 400);
    const name = requiredText(body.name, 3, 120);
    const email = cleanText(body.email, 160).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Informe um e-mail válido.' }, 400);
    const phone = cleanText(body.phone, 24).replace(/[^\d+()\s-]/g, '');
    if (phone.replace(/\D/g, '').length < 10) return json({ error: 'Informe um telefone válido.' }, 400);
    const age = integer(body.age, 18, 120);
    const city = requiredText(body.city, 2, 80);
    const state = requiredText(body.state, 2, 2).toUpperCase();
    const ticketQuantity = integer(body.ticketQuantity ?? 1, 1, 10);
    const additional = Array.isArray(body.additionalTicketNames) ? body.additionalTicketNames.map((item: unknown) => requiredText(item, 3, 120)) : [];
    const holderNames = [name, ...additional];
    if (holderNames.length !== ticketQuantity) return json({ error: 'Informe o nome de todos os titulares.' }, 400);
    if (new Set(holderNames.map((item) => item.toLocaleLowerCase('pt-BR'))).size !== holderNames.length) return json({ error: 'Cada ingresso precisa ter um titular diferente.' }, 400);

    const wantsShirt = body.wantsShirt === true;
    const wantsButton = body.wantsButton === true;
    const wantsCup = body.wantsCup === true;
    const wantsMug = body.wantsMug === true;
    const shirtQuantity = wantsShirt ? integer(body.shirtQuantity ?? 1, 1, 10) : 0;
    const buttonQuantity = wantsButton ? integer(body.buttonQuantity ?? 1, 1, 20) : 0;
    const cupQuantity = wantsCup ? integer(body.cupQuantity ?? 1, 1, 20) : 0;
    const mugQuantity = wantsMug ? integer(body.mugQuantity ?? 1, 1, 20) : 0;
    const shirtColor = wantsShirt ? cleanText(body.shirtColor, 10) : null;
    const shirtSize = wantsShirt ? cleanText(body.shirtSize, 4) : null;
    if (wantsShirt && (!['branca', 'preta'].includes(shirtColor || '') || !['PP', 'P', 'M', 'G', 'GG', 'XGG'].includes(shirtSize || ''))) return json({ error: 'Escolha a cor e o tamanho da camiseta.' }, 400);

    const now = new Date();
    const stamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}`;
    const registrationNumber = `EN-${stamp}-${randomCode(12)}`;
    const recoveryToken = randomCode(32);
    const recoveryTokenHash = await sha256(recoveryToken);
    const tickets = holderNames.map((holderName, index) => ({ name: holderName, registrationNumber: index === 0 ? registrationNumber : `${registrationNumber}-${index + 1}`, ticketCode: `EN-${randomCode(20)}` }));
    const totalAmount = calculateServerTotal({ ticketQuantity, wantsShirt, shirtQuantity, wantsButton, buttonQuantity, wantsCup, cupQuantity, wantsMug, mugQuantity });
    const common = { email, phone, age, city, state, payment_status: 'pending', checked_in: false, accepted_terms: true, image_authorization: body.imageAuthorization === true, privacy_consent: true, terms_version: '2026-07-17', privacy_version: '2026-07-17' };
    const payload = tickets.map((ticket, index) => ({
      ...common, registration_number: ticket.registrationNumber, order_number: registrationNumber, is_order_owner: index === 0, name: ticket.name, ticket_code: ticket.ticketCode,
      recovery_token_hash: index === 0 ? recoveryTokenHash : null,
      wants_shirt: index === 0 && wantsShirt, shirt_color: index === 0 ? shirtColor : null, shirt_size: index === 0 ? shirtSize : null, shirt_quantity: index === 0 ? shirtQuantity : 0,
      wants_button: index === 0 && wantsButton, button_quantity: index === 0 ? buttonQuantity : 0,
      wants_cup: index === 0 && wantsCup, cup_quantity: index === 0 ? cupQuantity : 0,
      wants_mug: index === 0 && wantsMug, mug_quantity: index === 0 ? mugQuantity : 0,
      total_amount: index === 0 ? totalAmount : catalog.ticket,
    }));
    const { error } = await supabase.from('registrations').insert(payload);
    if (error) { console.error('Registration insert error', error); return json({ error: 'Não foi possível concluir a inscrição. Tente novamente.' }, 500); }
    return json({ registrationNumber, ticketCode: tickets[0].ticketCode, recoveryToken, name, ticketQuantity, tickets, wantsShirt, shirtColor, shirtSize, shirtQuantity, wantsButton, buttonQuantity, wantsCup, cupQuantity, wantsMug, mugQuantity, totalAmount }, 201);
  } catch (error) {
    console.error('Create registration error', error);
    return json({ error: error instanceof Error ? error.message : 'Dados da inscrição inválidos.' }, 400);
  }
});
