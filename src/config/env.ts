export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  paymentUrl: (import.meta.env.VITE_PAYMENT_URL as string | undefined) || '#pagamento-pendente',
  whatsappNumber: (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) || '5585999999999',
  publicSiteUrl: (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined) || window.location.origin,
};

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
