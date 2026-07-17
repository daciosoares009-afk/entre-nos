import type { SponsorFormData } from '../schemas/sponsorSchema';
import { supabase } from './supabase';

export async function createSponsorRequest(data: SponsorFormData) {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { error } = await supabase.functions.invoke('create-sponsor-request', { body: data });
  if (error) {
    const response = (error as { context?: Response }).context;
    if (response) {
      const payload = await response.clone().json().catch(() => null) as { error?: string } | null;
      if (payload?.error) throw new Error(payload.error);
    }
    throw new Error('Não foi possível enviar a proposta. Tente novamente.');
  }
}
