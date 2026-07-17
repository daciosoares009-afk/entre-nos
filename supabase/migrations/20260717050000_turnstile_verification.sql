alter table public.registrations add column if not exists turnstile_verified_at timestamptz;

-- Pedidos anteriores à implantação são preservados para não bloquear pagamentos já iniciados.
update public.registrations
set turnstile_verified_at = created_at
where turnstile_verified_at is null;
