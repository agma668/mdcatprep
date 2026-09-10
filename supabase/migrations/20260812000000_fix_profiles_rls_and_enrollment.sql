-- Fix profiles RLS / admin access and complete the enrollment schema.
-- Idempotent: safe to run on the live project (lsjwyqouzezabaxnlhjy) as well as
-- on a fresh database that replays the migration history.

-- 1. Enrollment fields used by the admin panel and the enrollment email.
--    (The live DB already has these columns; IF NOT EXISTS keeps this safe.)
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists exam_target text;

-- 2. Root cause of "permission denied for function is_admin": the live DB
--    gates profiles reads with an is_admin() helper that was never granted
--    EXECUTE to the roles that evaluate RLS policies. Grant EXECUTE only if
--    the function exists. This does NOT weaken RLS — policies still decide
--    which rows a role can see; it only lets the policy call the helper.
do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_admin'
  ) then
    execute 'grant execute on function public.is_admin() to anon, authenticated, service_role';
  end if;
end $$;

-- 3. Students read only their own profile. Admin reads happen server-side with
--    the service role after verifying the admin email, so no public read
--    policy is needed (the old "viewable by everyone" policy is dropped).
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Students can view their own profile." on public.profiles;
create policy "Students can view their own profile." on public.profiles
  for select to authenticated
  using (auth.uid() = id);
