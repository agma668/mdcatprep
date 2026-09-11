-- =============================================================================
-- MDCAT Prep — complete database setup (combined from supabase/migrations/*)
-- Generated 2026-09-11; run ONCE on an EMPTY Supabase project.
--
-- How to apply:
--   1. Supabase dashboard → select the project → SQL Editor → New query
--   2. Paste this entire file → Run
--   3. Refresh the app — no redeploy needed for schema changes.
--
-- Migrations are concatenated in filename (chronological) order, exactly as
-- they were applied to the original project, so the final schema is identical.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 20260811000000_init_auth.sql
-- -----------------------------------------------------------------------------
-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  email text,
  role text check (role in ('student', 'admin')) default 'student',
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

-- Removed: Users can update own profile. (To prevent privilege escalation of role/status)

-- Function to handle new user signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
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
$$;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 20260812000000_fix_profiles_rls_and_enrollment.sql
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 20260813000000_add_suspended_status.sql
-- -----------------------------------------------------------------------------
-- Allow the 'suspended' status in profiles.status.
--
-- The admin panel can suspend an approved student (losing dashboard access)
-- and unsuspend them later. The initial schema restricted status to
-- ('pending', 'approved', 'rejected'); this widens it to include 'suspended'.
--
-- Idempotent: safe to run on the live project (lsjwyqouzezabaxnlhjy) and on a
-- fresh database that replays migrations.

alter table public.profiles
  drop constraint if exists profiles_status_check;

alter table public.profiles
  add constraint profiles_status_check
  check (status in ('pending', 'approved', 'rejected', 'suspended'));

-- -----------------------------------------------------------------------------
-- 20260814000000_content_management.sql
-- -----------------------------------------------------------------------------
-- Phase 1: Content management system — questions, notes, question_attempts.
--
-- NOTE: This schema (tables, columns, constraints, and RLS policies below) has
-- ALREADY been applied to the live project (lsjwyqouzezabaxnlhjy) directly via
-- the Supabase SQL Editor. This file exists so a fresh database that replays
-- the migration history ends up identical. It is idempotent, so running it on
-- the live project again is harmless.
--
-- Architecture:
--   Google Drive = actual file storage (source of truth for large files)
--   Supabase    = metadata / database
--   Vercel      = application
--
-- AI compatibility (Phase 1H): a separate AI project can later insert
-- questions with source='ai' and status='draft' (never auto-published) for an
-- admin to review and publish.

-- ---------------------------------------------------------------------------
-- QUESTIONS
-- ---------------------------------------------------------------------------

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  topic text,
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text,
  option_d text,
  correct_answer text not null check (correct_answer in ('A', 'B', 'C', 'D')),
  explanation text,
  difficulty text,
  college text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users (id) on delete set null,
  updated_at timestamp with time zone,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  source text not null default 'admin' check (source in ('admin', 'ai', 'imported')),
  -- For AI-generated questions: the note the question was generated from.
  source_note_id uuid
);

alter table public.questions enable row level security;

create index if not exists questions_status_idx on public.questions (status);
create index if not exists questions_subject_idx on public.questions (subject);
create index if not exists questions_topic_idx on public.questions (topic);
create index if not exists questions_difficulty_idx on public.questions (difficulty);

-- Students may read published questions only. Admin CRUD runs server-side with
-- the service role, so no INSERT/UPDATE/DELETE policies for the public roles.
drop policy if exists "Students can read published questions." on public.questions;
create policy "Students can read published questions." on public.questions
  for select to authenticated
  using (status = 'published');

-- ---------------------------------------------------------------------------
-- NOTES
-- ---------------------------------------------------------------------------

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  title text not null,
  drive_link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  description text,
  topic text,
  college text,
  uploaded_by uuid references auth.users (id) on delete set null,
  uploader_name text,
  note_type text not null default 'student' check (note_type in ('official', 'student')),
  status text not null default 'pending_review' check (status in ('draft', 'published', 'hidden', 'pending_review')),
  file_name text,
  file_type text,
  file_size bigint,
  storage_provider text check (storage_provider in ('google_drive', 'supabase', 'external')),
  drive_file_id text,
  updated_at timestamp with time zone
);

alter table public.notes enable row level security;

create index if not exists notes_status_idx on public.notes (status);
create index if not exists notes_type_idx on public.notes (note_type);
create index if not exists notes_uploaded_by_idx on public.notes (uploaded_by);

-- Students can read published official notes and their own student notes
-- (all statuses, so they can see "pending review" / "hidden" on their own).
drop policy if exists "Students can read published official notes." on public.notes;
create policy "Students can read published official notes." on public.notes
  for select to authenticated
  using (note_type = 'official' and status = 'published');

drop policy if exists "Students can read their own student notes." on public.notes;
create policy "Students can read their own student notes." on public.notes
  for select to authenticated
  using (note_type = 'student' and uploaded_by = auth.uid());

-- Students may insert/update/delete only their own student notes. Official
-- notes and other students' notes are off-limits. Admin CRUD runs server-side
-- with the service role.
drop policy if exists "Students can insert their own student notes." on public.notes;
create policy "Students can insert their own student notes." on public.notes
  for insert to authenticated
  with check (note_type = 'student' and uploaded_by = auth.uid());

drop policy if exists "Students can update their own student notes." on public.notes;
create policy "Students can update their own student notes." on public.notes
  for update to authenticated
  using (note_type = 'student' and uploaded_by = auth.uid())
  with check (note_type = 'student' and uploaded_by = auth.uid());

drop policy if exists "Students can delete their own student notes." on public.notes;
create policy "Students can delete their own student notes." on public.notes
  for delete to authenticated
  using (note_type = 'student' and uploaded_by = auth.uid());

-- ---------------------------------------------------------------------------
-- QUESTION ATTEMPTS
-- ---------------------------------------------------------------------------

create table if not exists public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  student_id uuid not null references auth.users (id) on delete cascade,
  selected_answer text not null check (selected_answer in ('A', 'B', 'C', 'D')),
  is_correct boolean not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.question_attempts enable row level security;

create index if not exists question_attempts_student_idx on public.question_attempts (student_id);
create index if not exists question_attempts_question_idx on public.question_attempts (question_id);

-- Students can create and read only their own attempts. Correctness is
-- computed server-side; RLS guarantees attempts cannot be forged for another
-- student.
drop policy if exists "Students can read their own attempts." on public.question_attempts;
create policy "Students can read their own attempts." on public.question_attempts
  for select to authenticated
  using (student_id = auth.uid());

drop policy if exists "Students can insert their own attempts." on public.question_attempts;
create policy "Students can insert their own attempts." on public.question_attempts
  for insert to authenticated
  with check (student_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 20260814000001_fix_content_rls.sql
-- -----------------------------------------------------------------------------
-- Fix content-management RLS so student notes are private.
--
-- The live project (lsjwyqouzezabaxnlhjy) had notes policies that were too
-- permissive: an authenticated student could READ another student's private
-- note, INSERT a note claiming another student's uploader id, and DELETE
-- another student's note. This migration removes EVERY policy on the three
-- content tables (whatever they are called) and recreates the intended,
-- least-privilege set.
--
-- Idempotent: safe to run again on the live project and on a fresh database.
-- Run in: Supabase Dashboard → SQL Editor → New query → paste → Run.

-- ---------------------------------------------------------------------------
-- 1. Drop every existing policy on the content tables
-- ---------------------------------------------------------------------------

do $$
declare
  r record;
begin
  for r in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('notes', 'questions', 'question_attempts')
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Make sure RLS is enabled (policies only take effect when it is)
-- ---------------------------------------------------------------------------

alter table public.notes enable row level security;
alter table public.questions enable row level security;
alter table public.question_attempts enable row level security;

-- ---------------------------------------------------------------------------
-- 3. NOTES — students see published official notes + their own student notes.
--    They may only insert/update/delete their OWN student notes.
-- ---------------------------------------------------------------------------

create policy "Students can read published official notes." on public.notes
  for select to authenticated
  using (note_type = 'official' and status = 'published');

create policy "Students can read their own student notes." on public.notes
  for select to authenticated
  using (note_type = 'student' and uploaded_by = auth.uid());

create policy "Students can insert their own student notes." on public.notes
  for insert to authenticated
  with check (note_type = 'student' and uploaded_by = auth.uid());

create policy "Students can update their own student notes." on public.notes
  for update to authenticated
  using (note_type = 'student' and uploaded_by = auth.uid())
  with check (note_type = 'student' and uploaded_by = auth.uid());

create policy "Students can delete their own student notes." on public.notes
  for delete to authenticated
  using (note_type = 'student' and uploaded_by = auth.uid());

-- ---------------------------------------------------------------------------
-- 4. QUESTIONS — students read published questions only. Admin CRUD happens
--    server-side with the service role, so no write policies are needed.
-- ---------------------------------------------------------------------------

create policy "Students can read published questions." on public.questions
  for select to authenticated
  using (status = 'published');

-- ---------------------------------------------------------------------------
-- 5. QUESTION ATTEMPTS — students create and read only their own attempts.
-- ---------------------------------------------------------------------------

create policy "Students can read their own attempts." on public.question_attempts
  for select to authenticated
  using (student_id = auth.uid());

create policy "Students can insert their own attempts." on public.question_attempts
  for insert to authenticated
  with check (student_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 20260817000000_feedback.sql
-- -----------------------------------------------------------------------------
-- Site feedback.
--
-- A single, anonymous-by-default feedback form shown on every page. The form
-- asks for one thing only: the feedback message. No name, no extra questions.
--
--   - Students / visitors insert feedback. The student's auth id is captured
--     server-side (never asked for in the form) so admins can see who said it;
--     anonymous visitors leave a NULL user_id.
--   - Reading feedback is admin-only: the admin portal queries this table
--     server-side with the service role. Students never read others' feedback.
--
-- Idempotent: safe to run on the live project and on a fresh database.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  -- References profiles (not auth.users directly) so the admin portal can
  -- join student name/email; deleting a student still nulls this via cascade.
  user_id uuid references public.profiles (id) on delete set null,
  page text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.feedback enable row level security;

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);

-- Anyone may submit feedback: authenticated students attach their own user id,
-- anonymous visitors submit with a NULL user_id.
drop policy if exists "Anyone can submit feedback." on public.feedback;
create policy "Anyone can submit feedback." on public.feedback
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 20260817000001_fix_feedback_schema.sql
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 20260818000000_referral_system.sql
-- -----------------------------------------------------------------------------
-- Referral system
alter table public.profiles
  add column if not exists referral_code text unique,
  add column if not exists referred_by uuid references public.profiles (id) on delete set null;

create index if not exists profiles_referral_code_idx on public.profiles (referral_code);

-- Auto-generate referral codes
create or replace function public.generate_referral_code()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.referral_code is null then
    new.referral_code := upper(substr(md5(random()::text || new.id::text), 1, 8));
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_create_referral on public.profiles;
create trigger on_profile_create_referral
  before insert on public.profiles
  for each row execute procedure public.generate_referral_code();

-- -----------------------------------------------------------------------------
-- 20260901000000_allow_published_student_notes.sql
-- -----------------------------------------------------------------------------
-- Allow all authenticated students to read published notes (both official and
-- student-submitted).  Previously, the RLS only let students read published
-- *official* notes and their *own* student notes, so approved student notes
-- were invisible to everyone except the uploader.

-- Drop the old restrictive policy first.
DROP POLICY IF EXISTS "Students can read published official notes." ON public.notes;

-- New policy: any authenticated user can read any published note.
CREATE POLICY "Students can read published notes." ON public.notes
  FOR SELECT TO authenticated
  USING (status = 'published');

-- -----------------------------------------------------------------------------
-- 20260902000000_add_time_spent_seconds.sql
-- -----------------------------------------------------------------------------
-- Add time_spent_seconds to question_attempts for timed practice tracking.
-- This is an additive, non-destructive change. Existing rows get NULL (no time data).
-- The column is nullable so old attempts are unaffected.

alter table public.question_attempts 
  add column if not exists time_spent_seconds integer;

comment on column public.question_attempts.time_spent_seconds is 
  'Seconds spent on this question during timed practice. NULL for untimed attempts.';

-- -----------------------------------------------------------------------------
-- 20260902000001_whatsapp_subscribers.sql
-- -----------------------------------------------------------------------------
-- WhatsApp bot subscribers table
create table if not exists public.whatsapp_subscribers (
  id uuid primary key default gen_random_uuid(),
  phone_number text unique not null,
  is_active boolean not null default true,
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unsubscribed_at timestamp with time zone,
  student_id uuid references auth.users (id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.whatsapp_subscribers enable row level security;

create index if not exists whatsapp_subscribers_phone_idx on public.whatsapp_subscribers (phone_number);
create index if not exists whatsapp_subscribers_active_idx on public.whatsapp_subscribers (is_active);

-- Only service role can access (bot runs server-side)
create policy "Service role full access" on public.whatsapp_subscribers
  for all to service_role
  using (true)
  with check (true);

-- -----------------------------------------------------------------------------
-- 20260902000002_push_subscriptions.sql
-- -----------------------------------------------------------------------------
-- Push notification subscriptions table
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text unique not null,
  p256dh text not null default '',
  auth text not null default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.push_subscriptions enable row level security;

create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);
create index if not exists push_subscriptions_endpoint_idx on public.push_subscriptions (endpoint);

-- Users can manage their own subscriptions
create policy "Users can read own subscriptions" on public.push_subscriptions
  for select to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own subscriptions" on public.push_subscriptions
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can delete own subscriptions" on public.push_subscriptions
  for delete to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 20260902000003_add_question_key.sql
-- -----------------------------------------------------------------------------
-- Stable content key for the curated exam-style bank (lib/resources.ts).
--
-- Client components (ExamStylePractice) record practice attempts against
-- this key instead of shipping database uuids or looking rows up by
-- question text. The key is a uuid v5 generated once by
-- scripts/add-question-keys.mjs and stored both in the file and here.
-- scripts/seed-resource-questions.mjs backfills it for the seeded rows and
-- sets it on new inserts (upsert keyed by question_text).
--
-- Apply via the Supabase SQL Editor (same as the other migrations — the
-- content-management migration notes that schema is applied there). Until
-- this is applied, the seed reports the column as missing and the attempt
-- action (recordAttemptByQuestionKey) falls back to exact question_text
-- resolution so the feature still works.
--
-- Idempotent: safe to re-run.

alter table public.questions add column if not exists question_key text;

comment on column public.questions.question_key is
  'Stable key from lib/resources.ts (uuid v5); null for non-bank questions.';

create unique index if not exists questions_question_key_idx
  on public.questions (question_key)
  where question_key is not null;
-- -----------------------------------------------------------------------------
-- 20260903000000_client_telemetry.sql
-- -----------------------------------------------------------------------------
-- Client telemetry: anonymous page-view counts and client-side error reports.
--
-- Purpose: see how the product is used (which pages get visited) and catch
-- crashes the server never sees (JS errors, failed hydration) — the web
-- equivalent of crash reporting. Written server-side via the service role by
-- the /api/telemetry route; clients never touch this table directly, so there
-- is no public insert policy and no spam surface.
--
-- Privacy: stores only what is needed — event name, page url, error message
-- and stack, plus the signed-in user's id (NULL for anonymous visitors). No
-- IPs, no user agents, no free-text. Rows for a deleted account disappear via
-- the cascade. Idempotent: safe on the live project and on a fresh database.

create table if not exists public.client_telemetry (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- NULL for anonymous visitors; cascade removes a deleted user's events.
  user_id uuid references auth.users (id) on delete cascade,
  -- 'page_view' | 'event' | 'error'
  type text not null check (type in ('page_view', 'event', 'error')),
  name text not null,
  url text,
  message text,
  stack text,
  meta jsonb not null default '{}'::jsonb
);

alter table public.client_telemetry enable row level security;

create index if not exists client_telemetry_created_at_idx
  on public.client_telemetry (created_at desc);

create index if not exists client_telemetry_type_idx
  on public.client_telemetry (type, created_at desc);

-- -----------------------------------------------------------------------------
-- 20260903000001_leaderboard_function.sql
-- -----------------------------------------------------------------------------
-- Sidebar leaderboard: top students by all-time questions attempted.
--
-- Purpose: the dashboard sidebar ranks the top five approved students. Doing
-- that client-side breaks the moment question_attempts exceeds PostgREST's
-- 1000-row fetch cap (the old code silently ranked only the first 1000 rows),
-- and it forced every dashboard render to download the whole attempts table.
-- This function does the aggregation inside Postgres, so the dashboard reads
-- exactly five rows per render.
--
-- Ranking: total attempts desc, then accuracy desc. "Current streak" counts
-- consecutive UTC study days ending today (or yesterday when today has none),
-- matching the analytics module's UTC day-key semantics. Runs as the caller
-- (service role) so RLS is bypassed exactly as the old client queries were.
-- Idempotent: safe on the live project and on a fresh database. Execute only
-- by the service role via lib/leaderboard.ts.
--
-- Founder/owner accounts are excluded so the board shows students, not the
-- people running the site (same list as LEADERBOARD_EXCLUDED_EMAILS in
-- lib/leaderboard.ts — keep the two in sync).

create or replace function public.leaderboard(p_limit integer default 5)
returns table (
  rank      bigint,
  name      text,
  streak    integer,
  accuracy  integer,
  questions bigint
)
language sql
stable
as $$
  with totals as (
    select qa.student_id,
           count(*) as questions,
           round(
             100.0 * count(*) filter (where qa.is_correct) / nullif(count(*), 0)
           )::integer as accuracy
    from public.question_attempts qa
    group by qa.student_id
  ),
  ranked as (
    select t.student_id,
           t.questions,
           t.accuracy,
           row_number() over (
             order by t.questions desc, t.accuracy desc, t.student_id
           ) as rn
    from totals t
    join public.profiles pr on pr.id = t.student_id
    where pr.status = 'approved'
      and lower(coalesce(pr.email, '')) not in (
        'admin@medprep.pk'
      )
  ),
  leaders as (
    select * from ranked where rn <= p_limit
  ),
  days as (
    select distinct qa.student_id,
                    (qa.created_at at time zone 'utc')::date as d
    from public.question_attempts qa
    where qa.student_id in (select student_id from leaders)
  ),
  runs as (
    -- Consecutive study days share one group id (gaps-and-islands on dates).
    select d.student_id,
           d.d,
           d.d - (row_number() over (
             partition by d.student_id order by d.d
           ))::integer as grp
    from days d
  ),
  active as (
    -- The run touching today, or yesterday when today has no activity.
    select r.student_id,
           max(case when r.d = current_date or r.d = current_date - 1 then r.grp end) as grp
    from runs r
    group by r.student_id
  )
  select l.rn::bigint as rank,
         coalesce(pr.full_name, 'Student') as name,
         (select count(*)::integer
          from runs r
          where r.student_id = l.student_id and r.grp = a.grp) as streak,
         l.accuracy,
         l.questions
  from leaders l
  join public.profiles pr on pr.id = l.student_id
  left join active a on a.student_id = l.student_id
  order by l.rn;
$$;

-- Aggregated totals only — still, keep it off the public surface; only the
-- service role (server-side dashboard render) needs to call it.
revoke all on function public.leaderboard(integer) from public, anon, authenticated;
grant execute on function public.leaderboard(integer) to service_role;

-- -----------------------------------------------------------------------------
-- 20260903000002_referral_auto_approve.sql
-- -----------------------------------------------------------------------------
-- Referral auto-approval: no manual counting anywhere.
--
-- Every time a student transitions INTO 'approved', their referrer (profiles.referred_by)
-- gains +1 approved referral automatically. When that counter reaches 10 the referrer is
-- auto-approved on the spot — no admin click, no SQL, no counting. This is database-driven
-- so it works for approvals made through the admin UI, a script, or the SQL editor alike.
--
-- Depends on the referral_system migration (referral_code / referred_by columns +
-- auto-generated codes). Idempotent: safe on a fresh database and on the live project.
--
-- NOTE: only transitions after this migration lands are counted — referrals approved
-- earlier do not backfill. Auto-approval only promotes status 'pending'; accounts that
-- were rejected or suspended keep their state (an admin can still approve them normally,
-- which then counts toward the referrer).

alter table public.profiles
  add column if not exists approved_referrals integer not null default 0,
  add column if not exists auto_approved_at timestamptz;

create or replace function public.count_referral_on_approval()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_total integer;
begin
  if new.status = 'approved'
     and old.status is distinct from 'approved'
     and new.referred_by is not null then
    update public.profiles
       set approved_referrals = coalesce(approved_referrals, 0) + 1
     where id = new.referred_by
    returning approved_referrals into v_total;

    -- 10 approved referrals = instant access for the waiting referrer.
    if v_total >= 10 then
      update public.profiles
         set status = 'approved',
             auto_approved_at = now()
       where id = new.referred_by
         and status = 'pending';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_student_approved on public.profiles;
create trigger on_student_approved
  after update of status on public.profiles
  for each row execute procedure public.count_referral_on_approval();

-- Anyone can see the counter; only the service role mutates profiles.
comment on table public.profiles is 'Student profiles; referral auto-approval counts approved referrals per profile.';

-- -----------------------------------------------------------------------------
-- 20260903000003_referral_signup_count.sql
-- -----------------------------------------------------------------------------
-- Referral auto-approval: count SIGNUPS, not approvals.
--
-- The founder's model: a waiting student shares their link; the moment 10
-- people have signed up through it they are approved automatically — nobody
-- waits for each friend to finish admin approval, and nobody counts by hand.
--
-- Replaces 20260903000002's approach (which counted referred students only
-- after they were themselves approved). Attribution happens in the signup
-- action via `update profiles set referred_by = ...`, so the trigger fires on
-- that update (and on direct inserts that already carry referred_by). The
-- counter column is renamed approved_referrals -> referred_signups to tell
-- the truth about what it counts.
--
-- Idempotent: drop-then-create everywhere; safe to re-run.

drop trigger if exists on_student_approved on public.profiles;
drop function if exists public.count_referral_on_approval();

alter table public.profiles
  rename column approved_referrals to referred_signups;

create or replace function public.count_referral_on_signup()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_total integer;
begin
  -- Fires on INSERT (old rows are all-null) and on UPDATE of referred_by
  -- (the signup action's attribution write). A repeated update to the same
  -- referrer is a no-op, so nobody can farm counts.
  if new.referred_by is not null
     and new.referred_by is distinct from old.referred_by then
    update public.profiles
       set referred_signups = coalesce(referred_signups, 0) + 1
     where id = new.referred_by
    returning referred_signups into v_total;

    -- 10 people through your link = instant access for a waiting referrer.
    if v_total >= 10 then
      update public.profiles
         set status = 'approved',
             auto_approved_at = now()
       where id = new.referred_by
         and status = 'pending';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_referral_attributed on public.profiles;
create trigger on_referral_attributed
  after insert or update of referred_by on public.profiles
  for each row execute procedure public.count_referral_on_signup();

-- -----------------------------------------------------------------------------
-- 20260904000000_duels.sql
-- -----------------------------------------------------------------------------
-- =============================================================================
-- Duels v1 — async head-to-head practice between approved students.
--
-- Model (fixed decisions from the spec, rest settled by the pass):
--   * A challenges an approved student; B plays within 48h of creation.
--   * BOTH students answer the SAME 10 questions from a chosen subject. The
--     set is drawn at challenge time and FROZEN as ids on the duel row — it
--     can never change (an update trigger raises on any attempt to move it).
--   * Duel answers also flow through the real recordAttempt path (server
--     action), so duels genuinely count toward goal/streak/rank.
--   * Winner = more correct answers; tie -> lower total time spent; still
--     tied -> draw. Computed at read time from duel_answers (no stored
--     result snapshot to drift).
--   * Expiry: 48h after creation, DERIVED at read time (no cron, no stored
--     column). A pending duel past 48h is simply never completed.
--   * FORFEIT: when one side finished all 10 and the other lapsed past the
--     48h expiry, the duel is DERIVED at read time as a forfeit win for the
--     finisher (score = what they answered; no stored status change — the
--     trigger still requires both finish timestamps for a stored 'completed').
--   * Idempotent recording: question_attempts gains a nullable
--     client_attempt_id (partial unique index) so a retried or re-sent
--     submission — a duel answer replayed after a wifi flicker, or an
--     offline-sync entry re-sent after a crash — can never double-record a
--     scored answer.
--   * Demos cannot play (validation lives in the server action — they have
--     no passwords and no UI affordance; RLS only gates participation).
--
-- Idempotent: every statement is re-runnable (if not exists / drop policy
-- if exists / create or replace / drop trigger if exists).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- duels — one row per challenge; the frozen question set lives on the row.
-- ---------------------------------------------------------------------------
create table if not exists public.duels (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid not null references auth.users (id) on delete cascade,
  opponent_id uuid not null references auth.users (id) on delete cascade,
  subject text not null,
  -- The exact set both players answer, drawn at challenge time. Immutable
  -- after creation (see duels_guard_update below) — fairness depends on it.
  question_ids uuid[] not null,
  status text not null default 'pending'
    check (status in ('pending', 'completed')),
  challenger_finished_at timestamp with time zone,
  opponent_finished_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint duels_no_self_challenge check (challenger_id <> opponent_id),
  constraint duels_question_set_size check (cardinality(question_ids) = 10)
);

alter table public.duels enable row level security;

create index if not exists duels_challenger_idx
  on public.duels (challenger_id, status, created_at desc);
create index if not exists duels_opponent_idx
  on public.duels (opponent_id, status, created_at desc);

-- Participants see their own duels (incoming + outgoing); nobody else does.
drop policy if exists "Duels are visible to participants" on public.duels;
create policy "Duels are visible to participants" on public.duels
  for select to authenticated
  using (challenger_id = auth.uid() or opponent_id = auth.uid());

-- A student can only create duels they themselves are challenging in.
-- (Whether the opponent is approved / real / not a demo is validated in the
-- server action — RLS cannot read the opponent profile without a helper.)
drop policy if exists "Students create duels they challenge in" on public.duels;
create policy "Students create duels they challenge in" on public.duels
  for insert to authenticated
  with check (challenger_id = auth.uid() and status = 'pending');

-- Participants update their own duel (finish timestamps, status finalize).
-- The trigger below still refuses any tampering with the core fields.
drop policy if exists "Participants update their own duel" on public.duels;
create policy "Participants update their own duel" on public.duels
  for update to authenticated
  using (challenger_id = auth.uid() or opponent_id = auth.uid())
  with check (challenger_id = auth.uid() or opponent_id = auth.uid());

-- The challenge's core is frozen at creation; completed is a real terminal
-- state. Guards the fixed decision "the set can never change" even against a
-- malicious participant hitting PostgREST directly.
create or replace function public.duels_guard_update()
returns trigger
language plpgsql
as $$
begin
  if new.challenger_id is distinct from old.challenger_id
     or new.opponent_id is distinct from old.opponent_id
     or new.subject is distinct from old.subject
     or new.question_ids is distinct from old.question_ids then
    raise exception 'Duel core fields (players, subject, question set) are immutable';
  end if;
  if new.status = 'completed'
     and (new.challenger_finished_at is null or new.opponent_finished_at is null) then
    raise exception 'A duel can only complete once both players have finished';
  end if;
  if old.status = 'completed' and new.status is distinct from 'completed' then
    raise exception 'A completed duel cannot be reopened';
  end if;
  return new;
end;
$$;

drop trigger if exists duels_guard_update on public.duels;
create trigger duels_guard_update
  before update on public.duels
  for each row execute procedure public.duels_guard_update();

-- ---------------------------------------------------------------------------
-- duel_answers — one row per (duel, student, question). The result is
-- derived from these rows at read time (score, time, winner).
-- ---------------------------------------------------------------------------
create table if not exists public.duel_answers (
  id uuid primary key default gen_random_uuid(),
  duel_id uuid not null references public.duels (id) on delete cascade,
  student_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  selected_answer text not null check (selected_answer in ('A', 'B', 'C', 'D')),
  is_correct boolean not null,
  time_spent_seconds integer
    check (time_spent_seconds is null or (time_spent_seconds >= 0 and time_spent_seconds <= 600)),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Idempotency guard: a double-submit (retry, double-click, replayed action)
  -- can never create a second answer row for the same question.
  constraint duel_answers_one_answer_per_question unique (duel_id, student_id, question_id)
);

alter table public.duel_answers enable row level security;

create index if not exists duel_answers_duel_idx
  on public.duel_answers (duel_id, student_id);
create index if not exists duel_answers_student_idx
  on public.duel_answers (student_id);

drop policy if exists "Duel answers are visible to duel participants" on public.duel_answers;
create policy "Duel answers are visible to duel participants" on public.duel_answers
  for select to authenticated
  using (
    exists (
      select 1 from public.duels d
      where d.id = duel_id
        and (d.challenger_id = auth.uid() or d.opponent_id = auth.uid())
    )
  );

-- Students record only their own answers, only inside duels they are part of.
drop policy if exists "Students record their own duel answers" on public.duel_answers;
create policy "Students record their own duel answers" on public.duel_answers
  for insert to authenticated
  with check (
    student_id = auth.uid()
    and exists (
      select 1 from public.duels d
      where d.id = duel_id
        and (d.challenger_id = auth.uid() or d.opponent_id = auth.uid())
    )
  );

-- No update/delete policies in v1: duel answers are append-only once written
-- (a wrong pick is a wrong pick — the attempt is already in question_attempts).

-- ---------------------------------------------------------------------------
-- End-to-end idempotency for answer recording (duels AND the offline sync
-- queue): a client-supplied key on question_attempts so a retried or re-sent
-- submission can never double-record a scored answer, even when the first
-- attempt died mid-flight (e.g. between the question_attempts insert and the
-- duel_answers write). Nullable + partial unique index: existing rows are
-- untouched and unkeyed submissions keep their old behavior.
-- ---------------------------------------------------------------------------
alter table public.question_attempts
  add column if not exists client_attempt_id text;

create unique index if not exists question_attempts_client_attempt_id_key
  on public.question_attempts (client_attempt_id)
  where client_attempt_id is not null;
-- -----------------------------------------------------------------------------
-- 20260905000000_races.sql
-- -----------------------------------------------------------------------------
-- Races: week-long analytics duels.
--
-- The founder's "challenge a friend" model: A challenges an approved student
-- B on a metric ('questions' = more questions answered in the window wins;
-- 'accuracy' = higher accuracy in the window wins). BOTH students simply
-- practice normally for 7 days — every answer already flows through the
-- shared recordAttempt path into question_attempts — and the winner is
-- DERIVED at read time from those real rows (created_at within the race's
-- 7-day window). Nothing about the outcome is ever stored, so there is no
-- snapshot to drift and nothing to game by writing a status.
--
-- Lifecycle (all derived, no cron, no stored status):
--   created        -> race is live for exactly RACE_WINDOW (7 days)
--   within window  -> inbox shows live totals for both sides
--   window passed  -> winner computed at read from window attempts
-- Rematch = a fresh race row (same pair, metric chosen again); a guard
-- trigger prevents a duplicate race between the same pair while any race
-- between them is still inside its window.
--
-- Accuracy races require a minimum number of window attempts before accuracy
-- decides anything (1/1 = 100% must not beat 400/500 = 80%): a side below
-- the floor cannot win on accuracy. Mirrors lib/races-repo.ts (keep in sync).

create table if not exists public.races (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid not null references auth.users (id) on delete cascade,
  opponent_id uuid not null references auth.users (id) on delete cascade,
  metric text not null check (metric in ('questions', 'accuracy')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint races_no_self_challenge check (challenger_id <> opponent_id)
);

alter table public.races enable row level security;

create index if not exists races_challenger_idx
  on public.races (challenger_id, created_at desc);
create index if not exists races_opponent_idx
  on public.races (opponent_id, created_at desc);

drop policy if exists "Races are visible to participants" on public.races;
create policy "Races are visible to participants" on public.races
  for select to authenticated
  using (challenger_id = auth.uid() or opponent_id = auth.uid());

drop policy if exists "Students create races they challenge in" on public.races;
create policy "Students create races they challenge in" on public.races
  for insert to authenticated
  with check (challenger_id = auth.uid());

-- One race per pair per window: a rematch is only possible once the current
-- race between them has finished (i.e. its created_at is outside 7 days).
create or replace function public.races_guard_insert()
returns trigger
language plpgsql
as $$
declare
  overlap bigint;
begin
  if new.challenger_id = new.opponent_id then
    raise exception 'A student cannot race themselves';
  end if;
  select count(*) into overlap
  from public.races r
  where r.created_at > timezone('utc'::text, now()) - interval '7 days'
    and ((r.challenger_id = new.challenger_id and r.opponent_id = new.opponent_id)
      or (r.challenger_id = new.opponent_id and r.opponent_id = new.challenger_id));
  if overlap > 0 then
    raise exception 'A race between these two students is already running';
  end if;
  return new;
end;
$$;

drop trigger if exists races_guard_insert on public.races;
create trigger races_guard_insert
  before insert on public.races
  for each row execute procedure public.races_guard_insert();

-- -----------------------------------------------------------------------------
-- 20260910000000_flashcards.sql
-- -----------------------------------------------------------------------------
-- Flashcards: per-student spaced-repetition review state.
--
-- The CARDS themselves are static content shipped in code (lib/flashcards/
-- flashcards-data.ts, built from the PMDC MDCAT syllabus) — never stored in
-- the database. Only per-student review state lives here: when a card is next
-- due, how hard the student found it, and their current streak through the
-- deck. No answers are stored, so nothing about card content can drift out of
-- sync with the syllabus.
--
-- Scheduling is computed in lib/flashcards/srs.ts (SM-2-lite) at answer time
-- and written into due_at / interval_days / ease_factor. A daily review
-- session is: "all cards where due_at <= now, oldest due first, capped at
-- DAILY_REVIEW_LIMIT" — no cron needed.
--
-- If a student reviews a card that has no row here (every brand-new card),
-- the action upserts one on the fly; the deck UI fails open to "all cards
-- new" when this table isn't applied yet.

create table if not exists public.flashcard_reviews (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  card_id text not null,
  -- SM-2-lite state:
  ease_factor numeric not null default 2.5 check (ease_factor >= 1.3 and ease_factor <= 3.2),
  interval_days integer not null default 0 check (interval_days >= 0),
  repetitions integer not null default 0 check (repetitions >= 0),
  due_at timestamp with time zone not null default timezone('utc'::text, now()),
  last_reviewed_at timestamp with time zone,
  last_rating text check (last_rating in ('again', 'hard', 'good', 'easy')),
  -- Deck-scoped counters kept here so the UI never aggregates client-side:
  times_correct integer not null default 0,
  times_wrong integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint flashcard_reviews_unique_card unique (student_id, card_id)
);

alter table public.flashcard_reviews enable row level security;

-- Fast session query: due cards for one student, oldest due first.
create index if not exists flashcard_reviews_due_idx
  on public.flashcard_reviews (student_id, due_at);

create index if not exists flashcard_reviews_card_idx
  on public.flashcard_reviews (card_id);

drop policy if exists "Students read own flashcard reviews" on public.flashcard_reviews;
create policy "Students read own flashcard reviews" on public.flashcard_reviews
  for select to authenticated
  using (student_id = auth.uid());

drop policy if exists "Students upsert own flashcard reviews" on public.flashcard_reviews;
create policy "Students upsert own flashcard reviews" on public.flashcard_reviews
  for insert to authenticated
  with check (student_id = auth.uid());

drop policy if exists "Students update own flashcard reviews" on public.flashcard_reviews;
create policy "Students update own flashcard reviews" on public.flashcard_reviews
  for update to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- resetFlashcard() deletes a row when a student restarts a card. Without this
-- policy the delete silently matched nothing under RLS (delete reports
-- success with zero affected rows), so "reset" appeared to work but the
-- schedule never cleared.
drop policy if exists "Students delete own flashcard reviews" on public.flashcard_reviews;
create policy "Students delete own flashcard reviews" on public.flashcard_reviews
  for delete to authenticated
  using (student_id = auth.uid());
