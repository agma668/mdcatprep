-- Harden trigger-only referral/profile functions.
--
-- These functions are invoked only by their attached table triggers. Keep
-- SECURITY DEFINER because signup/profile trigger writes must work independently
-- of the inserting role's profile-table privileges, but remove API-role EXECUTE
-- grants and pin every function to an empty search_path.
--
-- All relation references are schema-qualified. PostgreSQL built-ins resolve
-- from pg_catalog even when search_path is empty.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.profiles (id, full_name, email, role, status)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    'student',
    'pending'
  );
  return new;
end;
$function$;

create or replace function public.generate_referral_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.referral_code is null then
    new.referral_code := pg_catalog.upper(
      pg_catalog.substr(
        pg_catalog.md5(pg_catalog.random()::text || new.id::text),
        1,
        8
      )
    );
  end if;
  return new;
end;
$function$;

create or replace function public.count_referral_on_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_total integer;
begin
  -- Fires on INSERT (old rows are all-null) and on UPDATE of referred_by.
  -- A repeated update to the same referrer is a no-op, preventing count farming.
  if new.referred_by is not null
     and new.referred_by is distinct from old.referred_by then
    update public.profiles
       set referred_signups = coalesce(referred_signups, 0) + 1
     where id = new.referred_by
    returning referred_signups into v_total;

    -- Ten signups through a referral link approve a waiting referrer.
    if v_total >= 10 then
      update public.profiles
         set status = 'approved',
             auto_approved_at = pg_catalog.now()
       where id = new.referred_by
         and status = 'pending';
    end if;
  end if;
  return new;
end;
$function$;

-- Trigger execution does not require the invoking API role to hold EXECUTE.
-- Revoke both PUBLIC's default grant and explicit grants on each API role.
revoke all privileges on function public.handle_new_user()
  from public, anon, authenticated, service_role, supabase_auth_admin;
revoke all privileges on function public.generate_referral_code()
  from public, anon, authenticated, service_role;
revoke all privileges on function public.count_referral_on_signup()
  from public, anon, authenticated, service_role;

comment on function public.handle_new_user() is
  'Trigger-only profile creation for auth.users inserts; not callable through the Data API.';
comment on function public.generate_referral_code() is
  'Trigger-only referral-code generation for profile inserts; not callable through the Data API.';
comment on function public.count_referral_on_signup() is
  'Trigger-only referral attribution counting and threshold approval; not callable through the Data API.';
