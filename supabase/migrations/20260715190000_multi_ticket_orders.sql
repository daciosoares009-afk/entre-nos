alter table public.registrations add column if not exists order_number text;
alter table public.registrations add column if not exists is_order_owner boolean not null default true;

update public.registrations
set order_number = registration_number
where order_number is null or btrim(order_number) = '';

alter table public.registrations alter column order_number set not null;

alter table public.registrations drop constraint if exists registrations_email_phone_key;

create unique index if not exists registrations_owner_email_phone_key
on public.registrations (email, phone)
where is_order_owner = true;

create unique index if not exists registrations_order_owner_key
on public.registrations (order_number)
where is_order_owner = true;

create unique index if not exists registrations_order_holder_name_key
on public.registrations (order_number, lower(btrim(name)));

create index if not exists registrations_order_number_idx
on public.registrations (order_number);

create or replace function public.set_registration_order_defaults()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null or btrim(new.order_number) = '' then
    new.order_number = new.registration_number;
  end if;
  return new;
end;
$$;

drop trigger if exists registrations_order_defaults on public.registrations;
create trigger registrations_order_defaults
before insert on public.registrations
for each row execute function public.set_registration_order_defaults();
