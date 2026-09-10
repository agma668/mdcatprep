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
