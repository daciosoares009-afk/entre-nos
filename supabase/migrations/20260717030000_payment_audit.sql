create table if not exists public.payment_audit_log (
  id bigint generated always as identity primary key,
  order_number text,
  source text not null,
  provider_id text,
  provider_status text,
  local_status text,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists payment_audit_order_idx on public.payment_audit_log (order_number, created_at desc);
alter table public.payment_audit_log enable row level security;
revoke all on public.payment_audit_log from anon, authenticated;
