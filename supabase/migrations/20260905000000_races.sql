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
