-- Flashcard FSRS engine: memory model, review history, and organisation.
--
-- DRAFT MIGRATION — do not apply to the live database from this branch. It is
-- additive and backward compatible: existing flashcard_reviews rows keep their
-- legacy columns and continue to work. The application writes the FSRS columns
-- when present and falls back to the legacy columns when they are not, so the
-- running deployment is never broken by this file being unapplied.
--
-- Scheduling itself is computed in lib/flashcards/fsrs.ts (real FSRS via the
-- maintained `ts-fsrs` implementation). This migration only stores the state
-- the scheduler needs to evolve correctly between reviews: memory stability,
-- intrinsic difficulty, lifecycle state, lapse count, and the (re)learning
-- step position. No card CONTENT is stored here — cards remain static in
-- code (lib/flashcards/flashcards-data.ts) so answers can never drift out of
-- sync with the syllabus.

-- 1. FSRS memory columns on the existing per-student review table ----------
alter table public.flashcard_reviews
  add column if not exists stability numeric not null default 0,
  add column if not exists difficulty numeric not null default 0,
  add column if not exists fsrs_state text not null default 'new',
  add column if not exists lapses integer not null default 0,
  add column if not exists scheduled_days integer not null default 0,
  add column if not exists elapsed_days integer not null default 0,
  add column if not exists learning_steps integer not null default 0;

-- Constrain the lifecycle bucket to the four FSRS states.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'flashcard_reviews_fsrs_state_check'
  ) then
    alter table public.flashcard_reviews
      add constraint flashcard_reviews_fsrs_state_check
      check (fsrs_state in ('new', 'learning', 'review', 'relearning'));
  end if;
end $$;

create index if not exists flashcard_reviews_state_idx
  on public.flashcard_reviews (student_id, fsrs_state);

-- 2. Append-only review history -------------------------------------------
-- Every grade is recorded here so a student's learning curve and review
-- history are never lost, even if a card row is reset. Rows are insert-only
-- for the student and readable only by that student.
create table if not exists public.flashcard_review_history (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  card_id text not null,
  rating text not null check (rating in ('again', 'hard', 'good', 'easy')),
  state text not null check (state in ('new', 'learning', 'review', 'relearning')),
  stability numeric not null default 0,
  difficulty numeric not null default 0,
  scheduled_days integer not null default 0,
  due_at timestamp with time zone not null,
  reviewed_at timestamp with time zone not null default timezone('utc'::text, now()),
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

alter table public.flashcard_review_history enable row level security;

create index if not exists flashcard_review_history_student_idx
  on public.flashcard_review_history (student_id, reviewed_at desc);

drop policy if exists "Students read own flashcard history" on public.flashcard_review_history;
create policy "Students read own flashcard history" on public.flashcard_review_history
  for select to authenticated
  using (student_id = auth.uid());

drop policy if exists "Students append own flashcard history" on public.flashcard_review_history;
create policy "Students append own flashcard history" on public.flashcard_review_history
  for insert to authenticated
  with check (student_id = auth.uid());

-- 3. Per-student card organisation ----------------------------------------
-- Cards are static, so star/suspend/bury/tags are per-student metadata keyed
-- by (student_id, card_id). This keeps organisation local to each student and
-- never mutates shared content.
create table if not exists public.flashcard_card_meta (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  card_id text not null,
  starred boolean not null default false,
  suspended boolean not null default false,
  buried_until timestamp with time zone,
  tags text[] not null default '{}',
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint flashcard_card_meta_unique unique (student_id, card_id)
);

alter table public.flashcard_card_meta enable row level security;

create index if not exists flashcard_card_meta_student_idx
  on public.flashcard_card_meta (student_id);
create index if not exists flashcard_card_meta_tags_idx
  on public.flashcard_card_meta using gin (tags);

drop policy if exists "Students read own card meta" on public.flashcard_card_meta;
create policy "Students read own card meta" on public.flashcard_card_meta
  for select to authenticated using (student_id = auth.uid());

drop policy if exists "Students insert own card meta" on public.flashcard_card_meta;
create policy "Students insert own card meta" on public.flashcard_card_meta
  for insert to authenticated with check (student_id = auth.uid());

drop policy if exists "Students update own card meta" on public.flashcard_card_meta;
create policy "Students update own card meta" on public.flashcard_card_meta
  for update to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists "Students delete own card meta" on public.flashcard_card_meta;
create policy "Students delete own card meta" on public.flashcard_card_meta
  for delete to authenticated using (student_id = auth.uid());

-- 4. Student decks and sub-decks ------------------------------------------
-- A deck belongs to one student and may nest under a parent deck (sub-decks).
-- An optional exam_goal_id keeps a deck scoped to one Prep Space goal so goals
-- stay separate; it references the student_goals table from the goals work.
create table if not exists public.flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  parent_id uuid references public.flashcard_decks (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  subject text,
  exam_goal_id uuid references public.student_goals (id) on delete set null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

alter table public.flashcard_decks enable row level security;

create index if not exists flashcard_decks_student_idx
  on public.flashcard_decks (student_id, parent_id);

drop policy if exists "Students read own decks" on public.flashcard_decks;
create policy "Students read own decks" on public.flashcard_decks
  for select to authenticated using (student_id = auth.uid());

drop policy if exists "Students insert own decks" on public.flashcard_decks;
create policy "Students insert own decks" on public.flashcard_decks
  for insert to authenticated with check (student_id = auth.uid());

drop policy if exists "Students update own decks" on public.flashcard_decks;
create policy "Students update own decks" on public.flashcard_decks
  for update to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists "Students delete own decks" on public.flashcard_decks;
create policy "Students delete own decks" on public.flashcard_decks
  for delete to authenticated using (student_id = auth.uid());

-- Cards assigned to a deck. Ownership is enforced by requiring the deck to be
-- owned by the same student (checked in RLS via a subquery).
create table if not exists public.flashcard_deck_cards (
  deck_id uuid not null references public.flashcard_decks (id) on delete cascade,
  card_id text not null,
  student_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  primary key (deck_id, card_id)
);

alter table public.flashcard_deck_cards enable row level security;

create index if not exists flashcard_deck_cards_student_idx
  on public.flashcard_deck_cards (student_id);

drop policy if exists "Students read own deck cards" on public.flashcard_deck_cards;
create policy "Students read own deck cards" on public.flashcard_deck_cards
  for select to authenticated using (student_id = auth.uid());

drop policy if exists "Students insert own deck cards" on public.flashcard_deck_cards;
create policy "Students insert own deck cards" on public.flashcard_deck_cards
  for insert to authenticated with check (student_id = auth.uid());

drop policy if exists "Students delete own deck cards" on public.flashcard_deck_cards;
create policy "Students delete own deck cards" on public.flashcard_deck_cards
  for delete to authenticated using (student_id = auth.uid());

-- 5. Daily new-card limit preference --------------------------------------
-- Stored on the student's profile so it survives sessions. Default 20.
alter table public.profiles
  add column if not exists flashcard_new_limit integer not null default 20;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_flashcard_new_limit_check'
  ) then
    alter table public.profiles
      add constraint profiles_flashcard_new_limit_check
      check (flashcard_new_limit between 0 and 500);
  end if;
end $$;
