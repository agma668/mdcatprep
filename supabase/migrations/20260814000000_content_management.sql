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
