import { calculateTotal } from '../data/products';
import type { RegistrationFormData } from '../schemas/registrationSchema';
import { supabase } from './supabase';
import { createRegistrationNumber, createTicketCode } from '../utils/ids';
import { sanitizeText } from '../utils/format';
import type { RegistrationSummary, Ticket } from '../types';

export async function createRegistration(data: RegistrationFormData): Promise<RegistrationSummary> {
  if (!supabase) {
    throw new Error('Supabase não configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
  }

  const registrationNumber = createRegistrationNumber();
  const ticketCode = createTicketCode();
  const totalAmount = calculateTotal(data);

  const payload = {
    registration_number: registrationNumber,
    name: sanitizeText(data.name),
    email: sanitizeText(data.email).toLowerCase(),
    phone: data.phone,
    age: data.age,
    city: sanitizeText(data.city),
    state: sanitizeText(data.state).toUpperCase(),
    wants_shirt: data.wantsShirt,
    shirt_color: data.wantsShirt ? data.shirtColor : null,
    shirt_size: data.wantsShirt ? data.shirtSize : null,
    shirt_quantity: data.wantsShirt ? data.shirtQuantity : 0,
    wants_button: data.wantsButton,
    button_quantity: data.wantsButton ? data.buttonQuantity : 0,
    total_amount: totalAmount,
    payment_status: 'pending',
    ticket_code: ticketCode,
    checked_in: false,
    accepted_terms: data.acceptedTerms,
    image_authorization: data.imageAuthorization,
    privacy_consent: data.privacyConsent,
  };

  const { error } = await supabase.from('registrations').insert(payload);
  if (error) throw new Error(error.message);

  return {
    registrationNumber,
    ticketCode,
    name: payload.name,
    wantsShirt: data.wantsShirt,
    shirtColor: data.shirtColor,
    shirtSize: data.shirtSize,
    shirtQuantity: payload.shirt_quantity,
    wantsButton: data.wantsButton,
    buttonQuantity: payload.button_quantity,
    totalAmount,
  };
}

export async function getTicketByCode(code: string): Promise<Ticket | null> {
  if (!supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { data, error } = await supabase.rpc('get_public_ticket', {
    ticket_code_input: code,
  });

  if (error) throw new Error(error.message);
  return data?.[0] ? (data[0] as Ticket) : null;
}
