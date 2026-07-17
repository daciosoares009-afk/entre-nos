drop index if exists public.registrations_owner_email_phone_key;

alter table public.registrations
  add column if not exists recovery_token_hash text,
  add column if not exists terms_version text not null default '2026-07-17',
  add column if not exists privacy_version text not null default '2026-07-17';

create index if not exists registrations_owner_contact_idx
  on public.registrations (lower(email), phone, created_at desc)
  where is_order_owner = true;

create table if not exists public.request_rate_limits (
  scope text not null,
  requester_hash text not null,
  bucket timestamptz not null,
  request_count integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (scope, requester_hash, bucket)
);
alter table public.request_rate_limits enable row level security;
revoke all on public.request_rate_limits from anon, authenticated;

create or replace function public.consume_rate_limit(scope_input text, requester_hash_input text, limit_input integer, window_minutes_input integer default 60)
returns boolean language plpgsql security definer set search_path = public as $$
declare current_bucket timestamptz; current_count integer;
begin
  if limit_input < 1 or window_minutes_input < 1 then return false; end if;
  current_bucket := to_timestamp(floor(extract(epoch from now()) / (window_minutes_input * 60)) * (window_minutes_input * 60));
  insert into public.request_rate_limits (scope, requester_hash, bucket, request_count)
  values (scope_input, requester_hash_input, current_bucket, 1)
  on conflict (scope, requester_hash, bucket) do update
    set request_count = public.request_rate_limits.request_count + 1, updated_at = now()
  returning request_count into current_count;
  delete from public.request_rate_limits where bucket < now() - interval '2 days';
  return current_count <= limit_input;
end; $$;
revoke all on function public.consume_rate_limit(text, text, integer, integer) from public;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to service_role;
