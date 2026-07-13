import type { SponsorFormData } from '../schemas/sponsorSchema';
import { sanitizeText } from '../utils/format';
import { supabase } from './supabase';

export async function createSponsorRequest(data: SponsorFormData) {
  if (!supabase) {
    throw new Error('Supabase não configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
  }

  const { error } = await supabase.from('sponsor_requests').insert({
    company_name: sanitizeText(data.companyName),
    responsible_name: sanitizeText(data.responsibleName),
    email: sanitizeText(data.email).toLowerCase(),
    phone: data.phone,
    city: sanitizeText(data.city),
    cnpj: data.cnpj ? sanitizeText(data.cnpj) : null,
    support_type: sanitizeText(data.supportType),
    message: sanitizeText(data.message),
    status: 'new',
  });

  if (error) throw new Error(error.message);
}
