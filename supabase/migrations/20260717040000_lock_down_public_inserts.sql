-- Execute somente depois de publicar as Edge Functions create-registration e
-- create-sponsor-request e o frontend que as utiliza.
drop policy if exists "Public can create registrations" on public.registrations;
drop policy if exists "Public can create sponsor requests" on public.sponsor_requests;
revoke insert on public.registrations from anon;
revoke insert on public.sponsor_requests from anon;
