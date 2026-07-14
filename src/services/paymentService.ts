import { supabase } from './supabase';

export async function createMercadoPagoCheckout(registrationNumber: string, ticketCode: string) {
  if (!supabase) throw new Error('Supabase não configurado.');

  const { data, error } = await supabase.functions.invoke('create-mercado-pago-preference', {
    body: { registrationNumber, ticketCode },
  });

  if (error) throw new Error(error.message || 'Não foi possível iniciar o pagamento.');
  if (!data?.checkoutUrl) throw new Error(data?.error || 'Link de pagamento não recebido.');
  return data.checkoutUrl as string;
}
