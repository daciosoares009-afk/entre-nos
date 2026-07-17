create or replace function public.perform_ticket_check_in(ticket_code_input text)
returns table (result text, registration_number text, holder_name text, checked_in_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare ticket_record public.registrations%rowtype;
begin
  select * into ticket_record from public.registrations
  where ticket_code = ticket_code_input for update;
  if not found then return query select 'not_found'::text, null::text, null::text, null::timestamptz; return; end if;
  if ticket_record.payment_status <> 'paid' then
    return query select 'unpaid'::text, ticket_record.registration_number, ticket_record.name, ticket_record.checked_in_at; return;
  end if;
  if ticket_record.checked_in then
    return query select 'already_used'::text, ticket_record.registration_number, ticket_record.name, ticket_record.checked_in_at; return;
  end if;
  update public.registrations set checked_in = true, checked_in_at = now() where id = ticket_record.id;
  return query select 'accepted'::text, ticket_record.registration_number, ticket_record.name, now();
end; $$;
revoke all on function public.perform_ticket_check_in(text) from public, anon, authenticated;
grant execute on function public.perform_ticket_check_in(text) to service_role;
