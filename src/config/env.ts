export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  paymentUrl: (import.meta.env.VITE_PAYMENT_URL as string | undefined) || '#pagamento-pendente',
  whatsappNumber: (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) || '556194540469',
  instagramUsername: (import.meta.env.VITE_INSTAGRAM_USERNAME as string | undefined) || 'entrenos_.oficial',
  publicSiteUrl: (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined) || window.location.origin,
};

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
