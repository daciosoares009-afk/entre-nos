import type { RegistrationFormData } from '../schemas/registrationSchema';
import type { RegistrationSummary, Ticket } from '../types';
import { supabase } from './supabase';

async function edgeError(error: unknown, fallback: string) {
  const response = (error as { context?: Response })?.context;
  if (response) {
    const payload = await response.clone().json().catch(() => null) as { error?: string } | null;
    if (payload?.error) return payload.error;
  }
  return fallback;
}

export async function createRegistration(data: RegistrationFormData, turnstileToken: string): Promise<RegistrationSummary> {
  if (!supabase) throw new Error('Supabase não configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
  const { data: response, error } = await supabase.functions.invoke('create-registration', { body: { ...data, turnstileToken } });
  if (error) throw new Error(await edgeError(error, 'Não foi possível registrar a inscrição. Tente novamente em alguns instantes.'));
  if (!response?.registrationNumber || !response?.ticketCode) throw new Error('Resposta inválida do serviço de inscrição.');
  return response as RegistrationSummary;
}

export async function getTicketByCode(code: string): Promise<Ticket | null> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { data, error } = await supabase.rpc('get_public_ticket', { ticket_code_input: code });
  if (error) throw new Error(error.message);
  return data?.[0] ? (data[0] as Ticket) : null;
}

export async function recoverRegistration(registrationNumber: string, recoveryToken: string): Promise<RegistrationSummary> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { data, error } = await supabase.functions.invoke('recover-registration', { body: { registrationNumber, recoveryToken } });
  if (error) throw new Error(await edgeError(error, 'Não foi possível recuperar a inscrição.'));
  return data as RegistrationSummary;
}
