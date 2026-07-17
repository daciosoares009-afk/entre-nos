import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, getServiceRoleKey, json } from '../_shared/http.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = getServiceRoleKey();
    const authorization = request.headers.get('Authorization') || '';
    if (!supabaseUrl || !anonKey || !serviceRoleKey || !authorization.startsWith('Bearer ')) return json({ error: 'Acesso não autorizado.' }, 401);

    const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    const staffEmails = (Deno.env.get('CHECKIN_STAFF_EMAILS') || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);
    if (authError || !user?.email || !staffEmails.includes(user.email.toLowerCase())) return json({ error: 'Esta conta não pertence à equipe de check-in.' }, 403);

    const { ticketCode } = await request.json();
    if (typeof ticketCode !== 'string' || ticketCode.length < 8 || ticketCode.length > 40) return json({ error: 'Código de ingresso inválido.' }, 400);
    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { data, error } = await admin.rpc('perform_ticket_check_in', { ticket_code_input: ticketCode.trim().toUpperCase() });
    if (error) { console.error('Check-in RPC error', error); return json({ error: 'Não foi possível registrar a entrada.' }, 500); }
    return json(data?.[0] || { result: 'not_found' });
  } catch (error) {
    console.error('Check-in error', error);
    return json({ error: 'Não foi possível registrar a entrada.' }, 500);
  }
});
