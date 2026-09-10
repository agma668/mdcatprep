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