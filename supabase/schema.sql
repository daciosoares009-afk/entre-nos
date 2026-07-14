create extension if not exists pgcrypto;

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  registration_number text not null unique,
  name text not null check (char_length(name) between 3 and 120),
  email text not null,
  phone text not null,
  age integer not null check (age between 12 and 120),
  city text not null,
  state char(2) not null,
  wants_shirt boolean not null default false,
  shirt_color text check (shirt_color in ('branca', 'preta') or shirt_color is null),
  shirt_size text check (shirt_size in ('PP', 'P', 'M', 'G', 'GG', 'XGG') or shirt_size is null),
  shirt_quantity integer not null default 0 check (shirt_quantity between 0 and 10),
  wants_button boolean not null default false,
  button_quantity integer not null default 0 check (button_quantity between 0 and 20),
  wants_cup boolean not null default false,
  cup_quantity integer not null default 0 check (cup_quantity between 0 and 20),
  wants_mug boolean not null default false,
  mug_quantity integer not null default 0 check (mug_quantity between 0 and 20),
  total_amount numeric(10,2) not null default 0 check (total_amount >= 0),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'under_review', 'paid', 'cancelled', 'refunded')),
  ticket_code text not null unique,
  checked_in boolean not null default false,
  checked_in_at timestamptz,
  accepted_terms boolean not null check (accepted_terms = true),
  image_authorization boolean not null default false,
  privacy_consent boolean not null check (privacy_consent = true),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email, phone)
);

alter table public.registrations add column if not exists wants_cup boolean not null default false;
alter table public.registrations add column if not exists cup_quantity integer not null default 0 check (cup_quantity between 0 and 20);
alter table public.registrations add column if not exists wants_mug boolean not null default false;
alter table public.registrations add column if not exists mug_quantity integer not null default 0 check (mug_quantity between 0 and 20);

create table if not exists public.sponsor_requests (
  id uuid primary key default gen_random_uuid(),
  company_name text not null check (char_length(company_name) between 2 and 120),
  responsible_name text not null check (char_length(responsible_name) between 3 and 120),
  email text not null,
  phone text not null,
  city text not null,
  cnpj text,
  support_type text not null,
  message text not null check (char_length(message) between 10 and 1000),
  status text not null default 'new' check (status in ('new', 'contacted', 'negotiating', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists registrations_updated_at on public.registrations;
create trigger registrations_updated_at
before update on public.registrations
for each row execute function public.set_updated_at();

drop trigger if exists sponsor_requests_updated_at on public.sponsor_requests;
create trigger sponsor_requests_updated_at
before update on public.sponsor_requests
for each row execute function public.set_updated_at();

alter table public.registrations enable row level security;
alter table public.sponsor_requests enable row level security;

drop policy if exists "Public can create registrations" on public.registrations;
create policy "Public can create registrations"
on public.registrations
for insert
to anon
with check (
  accepted_terms = true
  and privacy_consent = true
  and payment_status = 'pending'
  and checked_in = false
);

drop policy if exists "Public can create sponsor requests" on public.sponsor_requests;
create policy "Public can create sponsor requests"
on public.sponsor_requests
for insert
to anon
with check (status = 'new');

create or replace function public.get_public_ticket(ticket_code_input text)
returns table (
  registration_number text,
  name text,
  ticket_code text,
  payment_status text,
  checked_in boolean
)
language sql
security definer
set search_path = public
as $$
  select
    r.registration_number,
    r.name,
    r.ticket_code,
    r.payment_status,
    r.checked_in
  from public.registrations r
  where r.ticket_code = ticket_code_input
  limit 1;
$$;

revoke all on function public.get_public_ticket(text) from public;
grant execute on function public.get_public_ticket(text) to anon, authenticated;

revoke all on public.registrations from anon;
revoke all on public.sponsor_requests from anon;
grant insert on public.registrations to anon;
grant insert on public.sponsor_requests to anon;
