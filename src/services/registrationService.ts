import { calculateTotal, productConfig } from '../data/products';
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
  const holderNames = [data.name, ...data.additionalTicketNames].map(sanitizeText);
  const tickets = holderNames.map((name, index) => ({
    name,
    registrationNumber: index === 0 ? registrationNumber : `${registrationNumber}-${index + 1}`,
    ticketCode: createTicketCode(),
  }));
  const ticketCode = tickets[0].ticketCode;
  const totalAmount = calculateTotal(data);

  const commonPayload = {
    email: sanitizeText(data.email).toLowerCase(),
    phone: data.phone,
    age: data.age,
    city: sanitizeText(data.city),
    state: sanitizeText(data.state).toUpperCase(),
    payment_status: 'pending',
    checked_in: false,
    accepted_terms: data.acceptedTerms,
    image_authorization: data.imageAuthorization,
    privacy_consent: data.privacyConsent,
  };

  const payload = tickets.map((ticket, index) => {
    const isOrderOwner = index === 0;
    return {
      ...commonPayload,
      registration_number: ticket.registrationNumber,
      order_number: registrationNumber,
      is_order_owner: isOrderOwner,
      name: ticket.name,
      wants_shirt: isOrderOwner && data.wantsShirt,
      shirt_color: isOrderOwner && data.wantsShirt ? data.shirtColor : null,
      shirt_size: isOrderOwner && data.wantsShirt ? data.shirtSize : null,
      shirt_quantity: isOrderOwner && data.wantsShirt ? data.shirtQuantity : 0,
      wants_button: isOrderOwner && data.wantsButton,
      button_quantity: isOrderOwner && data.wantsButton ? data.buttonQuantity : 0,
      wants_cup: isOrderOwner && data.wantsCup,
      cup_quantity: isOrderOwner && data.wantsCup ? data.cupQuantity : 0,
      wants_mug: isOrderOwner && data.wantsMug,
      mug_quantity: isOrderOwner && data.wantsMug ? data.mugQuantity : 0,
      total_amount: isOrderOwner ? totalAmount : productConfig.ticketPrice,
      ticket_code: ticket.ticketCode,
    };
  });

  const { error } = await supabase.from('registrations').insert(payload);
  if (error) {
    if (error.code === '23505' && error.message.includes('registrations_owner_email_phone_key')) {
      throw new Error('Já existe uma inscrição com este e-mail e telefone. Use outros dados para uma nova inscrição ou entre em contato pelo WhatsApp para recuperar a inscrição existente.');
    }
    if (error.code === '23505' && error.message.includes('registrations_order_holder_name_key')) {
      throw new Error('Todos os ingressos da compra precisam ter nomes de titulares diferentes.');
    }
    throw new Error('Não foi possível registrar a inscrição. Tente novamente em alguns instantes.');
  }

  return {
    registrationNumber,
    ticketCode,
    name: tickets[0].name,
    ticketQuantity: tickets.length,
    tickets,
    wantsShirt: data.wantsShirt,
    shirtColor: data.shirtColor,
    shirtSize: data.shirtSize,
    shirtQuantity: payload[0].shirt_quantity,
    wantsButton: data.wantsButton,
    buttonQuantity: payload[0].button_quantity,
    wantsCup: data.wantsCup,
    cupQuantity: payload[0].cup_quantity,
    wantsMug: data.wantsMug,
    mugQuantity: payload[0].mug_quantity,
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
