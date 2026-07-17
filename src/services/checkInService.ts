import { supabase } from './supabase';

export type CheckInResult = {
  result: 'accepted' | 'already_used' | 'unpaid' | 'not_found';
  registration_number?: string;
  holder_name?: string;
  checked_in_at?: string;
};

export async function checkInTicket(ticketCode: string): Promise<CheckInResult> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { data, error } = await supabase.functions.invoke('check-in-ticket', { body: { ticketCode } });
  if (error) {
    const response = (error as { context?: Response }).context;
    const payload = response ? await response.clone().json().catch(() => null) as { error?: string } | null : null;
    throw new Error(payload?.error || 'Não foi possível registrar a entrada.');
  }
  return data as CheckInResult;
}
