import { supabase } from './supabase';

export async function createMercadoPagoCheckout(registrationNumber: string, ticketCode: string) {
  if (!supabase) throw new Error('Supabase não configurado.');

  const { data, error } = await supabase.functions.invoke('create-mercado-pago-preference', {
    body: { registrationNumber, ticketCode },
  });

  if (error) {
    const response = (error as { context?: Response }).context;
    if (response) {
      const payload = await response.clone().json().catch(() => null) as { error?: string } | null;
      if (payload?.error) throw new Error(payload.error);
    }
    throw new Error('Não foi possível iniciar o pagamento. Tente novamente em alguns instantes.');
  }
  if (!data?.checkoutUrl) throw new Error(data?.error || 'Link de pagamento não recebido.');
  return data.checkoutUrl as string;
}
