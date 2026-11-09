-- =============================================================================
-- Mistake Recovery and Mastery Recheck Engine  (GitHub issue #4)
-- Apex Pakistan / MED Prep
--
-- DRAFT MIGRATION — do not apply to the live database from this branch.
--
-- Adds a server-backed mistake review table with classification, per-miss
-- reasons, mastery tracking and optional exam-goal scoping, plus a table for
-- flashcards generated from a missed question. Students can only ever see or
-- modify their own rows (RLS). Historical attempts are never deleted by this
-- migration and no existing row is modified.
--
-- Depends on (already applied): question_attempts, questions, and the
-- student_goals table from 20261109000000_exam_registry_and_student_goals.sql.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Mistake reviews
-- ---------------------------------------------------------------------------
create table if not exists public.mistake_reviews (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  attempt_id uuid references public.question_attempts (id) on delete set null,

  -- Optional Prep Space goal this mistake belongs to, so separate goals stay
  -- separate. Null for legacy rows recorded before goal-aware actions.
  exam_goal_id uuid references public.student_goals (id) on delete set null,

  classification text not null
    check (classification in ('incorrect', 'guessed_correct', 'guessed_incorrect',
                              'slow', 'flagged', 'repeatedly_missed')),
  mastered boolean not null default false,
  mastered_at timestamp with time zone,

  miss_reason text check (
    miss_reason is null or miss_reason in (
      'did_not_know_concept', 'forgot_fact', 'misunderstood_question',
      'confused_two_concepts', 'calculation_error', 'careless_error',
      'time_management_issue'
    )
  ),

  -- Self-reported confidence at the time of the attempt (1-5).
  confidence integer check (confidence >= 1 and confidence <= 5),

  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- Duplicate prevention. A plain unique constraint treats NULL attempt_id as
-- distinct, so a question reviewed without an attempt row could be inserted
-- twice. Two partial unique indexes cover both cases exactly.
create unique index if not exists mistake_reviews_with_attempt_key
  on public.mistake_reviews (student_id, question_id, attempt_id)
  where attempt_id is not null;

create unique index if not exists mistake_reviews_no_attempt_key
  on public.mistake_reviews (student_id, question_id)
  where attempt_id is null;

create index if not exists mistake_reviews_student_idx
  on public.mistake_reviews (student_id, classification, mastered, created_at desc);

create index if not exists mistake_reviews_question_idx
  on public.mistake_reviews (question_id);

create index if not exists mistake_reviews_not_mastered_idx
  on public.mistake_reviews (student_id, mastered)
  where not mastered;

create index if not exists mistake_reviews_goal_idx
  on public.mistake_reviews (student_id, exam_goal_id);

-- ---------------------------------------------------------------------------
-- 2. RLS: owner-only access
-- ---------------------------------------------------------------------------
alter table public.mistake_reviews enable row level security;

drop policy if exists "Students read own mistake reviews" on public.mistake_reviews;
create policy "Students read own mistake reviews"
  on public.mistake_reviews for select to authenticated
  using (student_id = (select auth.uid()));

drop policy if exists "Students insert own mistake reviews" on public.mistake_reviews;
create policy "Students insert own mistake reviews"
  on public.mistake_reviews for insert to authenticated
  with check (student_id = (select auth.uid()));

drop policy if exists "Students update own mistake reviews" on public.mistake_reviews;
create policy "Students update own mistake reviews"
  on public.mistake_reviews for update to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));

-- Students may remove a review they own; historical attempts are untouched.
drop policy if exists "Students delete own mistake reviews" on public.mistake_reviews;
create policy "Students delete own mistake reviews"
  on public.mistake_reviews for delete to authenticated
  using (student_id = (select auth.uid()));

grant select, insert, update, delete on public.mistake_reviews to authenticated;
grant all on public.mistake_reviews to service_role;

-- ---------------------------------------------------------------------------
-- 3. Flashcards generated from a missed question
--    Preserves the source question, related topic, optional exam goal and
--    creation date. Content is a private per-student note, never shared.
-- ---------------------------------------------------------------------------
create table if not exists public.review_flashcards (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  source_question_id uuid references public.questions (id) on delete set null,
  source_mistake_id uuid references public.mistake_reviews (id) on delete set null,
  exam_goal_id uuid references public.student_goals (id) on delete set null,
  subject text,
  topic text,
  front text not null check (char_length(front) between 1 and 4000),
  back text not null check (char_length(back) between 1 and 8000),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists review_flashcards_student_idx
  on public.review_flashcards (student_id, created_at desc);

-- One card per source mistake prevents duplicate conversion on repeated taps.
create unique index if not exists review_flashcards_source_mistake_key
  on public.review_flashcards (student_id, source_mistake_id)
  where source_mistake_id is not null;

alter table public.review_flashcards enable row level security;

drop policy if exists "Students read own review flashcards" on public.review_flashcards;
create policy "Students read own review flashcards"
  on public.review_flashcards for select to authenticated
  using (student_id = (select auth.uid()));

drop policy if exists "Students insert own review flashcards" on public.review_flashcards;
create policy "Students insert own review flashcards"
  on public.review_flashcards for insert to authenticated
  with check (student_id = (select auth.uid()));

drop policy if exists "Students update own review flashcards" on public.review_flashcards;
create policy "Students update own review flashcards"
  on public.review_flashcards for update to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));

drop policy if exists "Students delete own review flashcards" on public.review_flashcards;
create policy "Students delete own review flashcards"
  on public.review_flashcards for delete to authenticated
  using (student_id = (select auth.uid()));

grant select, insert, update, delete on public.review_flashcards to authenticated;
grant all on public.review_flashcards to service_role;

comment on table public.mistake_reviews is
  'Per-student mistake reviews: classification, miss reason, optional exam goal
   and evidence-based mastery. RLS isolates each student''s rows.';
comment on table public.review_flashcards is
  'Flashcards generated from a missed question, preserving the source question,
   topic, exam goal and creation date. Private to the owning student.';
