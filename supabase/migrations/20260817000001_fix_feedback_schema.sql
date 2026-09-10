-- Fix the live feedback table to match the app's simple anonymous design.
--
-- The live project (lsjwyqouzezabaxnlhjy) already has a `feedback` table with
-- an older, different schema (name, rating, is_visible) that was created
-- outside this migration history. The app expects: message (required),
-- user_id (nullable, links to profiles for admin display), page (nullable),
-- created_at. This migration reshapes the existing table in place.
--
-- The table is empty (verified), so dropping the old columns loses nothing.
-- Fully idempotent: safe on the live project and on a fresh database.
--
-- First run attempt failed with 2BP01 because the old table also had a policy
-- ("Anyone can read visible feedback") that depends on the is_visible column.
-- Step 1 therefore drops EVERY existing policy on the table before reshaping.

-- ---------------------------------------------------------------------------
-- 1. Drop all existing RLS policies on the table (they may reference old columns)
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'feedback'
  loop
    execute format('drop policy if exists %I on public.feedback', r.policyname);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Reshape columns (idempotent — safe whether or not the first run partially applied)
-- ---------------------------------------------------------------------------
alter table public.feedback add column if not exists user_id uuid references public.profiles (id) on delete set null;
alter table public.feedback add column if not exists page text;

-- Drop the old name/rating design — the form intentionally does not ask for
-- a name or any extra questions.
alter table public.feedback drop column if exists name;
alter table public.feedback drop column if exists rating;
alter table public.feedback drop column if exists is_visible;

alter table public.feedback enable row level security;

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);

-- ---------------------------------------------------------------------------
-- 3. Recreate the insert policy
-- ---------------------------------------------------------------------------
-- Anyone may submit feedback: authenticated students attach their own user id,
-- anonymous visitors submit with a NULL user_id.
drop policy if exists "Anyone can submit feedback." on public.feedback;
create policy "Anyone can submit feedback." on public.feedback
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
