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
