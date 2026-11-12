-- =============================================================================
-- Student goals: close cross-student goal references and stale-primary switch
-- Apex Pakistan / MED Prep
--
-- Follow-up to 20261112000000_student_goals_foundation.sql.
--
-- 1. mistake_reviews, review_flashcards and flashcard_decks already had an
--    exam_goal_id column, but their foreign keys only checked that the goal
--    existed. They did not check that the goal belonged to the same student.
--    Replace those single-column FKs with composite (goal, student) FKs so a
--    student can never attach another student's goal to their own row.
--
-- 2. The student_goals update policy rejected every update to an active goal
--    whose exam variant had been retired. set_primary_goal() first demotes the
--    existing primary while leaving status = 'active', so that rejected update
--    made primary switching impossible after a variant retirement. The RPC is
--    now SECURITY DEFINER but keeps its explicit caller, ownership and active-
--    variant checks. Direct student updates remain governed by the existing
--    RLS policy and still cannot reactivate a retired goal.
--
-- This migration does not rewrite earlier migrations and does not backfill
-- historical goal references. It aborts with a clear error if cross-student
-- references already exist, so an operator can repair them deliberately.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Refuse to install the composite FKs over known cross-student references
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1
    from public.mistake_reviews r
    join public.student_goals g on g.id = r.exam_goal_id
    where r.student_id <> g.student_id
  ) then
    raise exception
      'Cross-student mistake_reviews.exam_goal_id references exist; repair them before applying this migration';
  end if;

  if exists (
    select 1
    from public.review_flashcards r
    join public.student_goals g on g.id = r.exam_goal_id
    where r.student_id <> g.student_id
  ) then
    raise exception
      'Cross-student review_flashcards.exam_goal_id references exist; repair them before applying this migration';
  end if;

  if exists (
    select 1
    from public.flashcard_decks d
    join public.student_goals g on g.id = d.exam_goal_id
    where d.student_id <> g.student_id
  ) then
    raise exception
      'Cross-student flashcard_decks.exam_goal_id references exist; repair them before applying this migration';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Replace the single-column goal FKs with ownership-aware FKs
-- ---------------------------------------------------------------------------
alter table public.mistake_reviews
  drop constraint if exists mistake_reviews_exam_goal_id_fkey;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'mistake_reviews_exam_goal_owner_fkey'
      and conrelid = 'public.mistake_reviews'::regclass
  ) then
    alter table public.mistake_reviews
      add constraint mistake_reviews_exam_goal_owner_fkey
      foreign key (exam_goal_id, student_id)
      references public.student_goals (id, student_id)
      on delete set null (exam_goal_id);
  end if;
end $$;

alter table public.review_flashcards
  drop constraint if exists review_flashcards_exam_goal_id_fkey;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'review_flashcards_exam_goal_owner_fkey'
      and conrelid = 'public.review_flashcards'::regclass
  ) then
    alter table public.review_flashcards
      add constraint review_flashcards_exam_goal_owner_fkey
      foreign key (exam_goal_id, student_id)
      references public.student_goals (id, student_id)
      on delete set null (exam_goal_id);
  end if;
end $$;

alter table public.flashcard_decks
  drop constraint if exists flashcard_decks_exam_goal_id_fkey;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'flashcard_decks_exam_goal_owner_fkey'
      and conrelid = 'public.flashcard_decks'::regclass
  ) then
    alter table public.flashcard_decks
      add constraint flashcard_decks_exam_goal_owner_fkey
      foreign key (exam_goal_id, student_id)
      references public.student_goals (id, student_id)
      on delete set null (exam_goal_id);
  end if;
end $$;

-- Support parent-goal deletes and updates through the new composite FKs.
create index if not exists review_flashcards_goal_owner_idx
  on public.review_flashcards (student_id, exam_goal_id);

create index if not exists flashcard_decks_goal_owner_idx
  on public.flashcard_decks (student_id, exam_goal_id);

-- ---------------------------------------------------------------------------
-- 3. Let the narrowly scoped primary RPC demote a retired stale primary
-- ---------------------------------------------------------------------------
-- The table update policy intentionally rejects active goals on a retired
-- variant, so an invoker-rights RPC cannot clear the old primary. This function
-- is the only privileged path: it still derives the student from auth.uid(),
-- filters both updates by that student, and requires the target goal to be
-- active on an active exam and variant. Direct table updates keep the stricter
-- RLS policy and still cannot reactivate a retired goal.
create or replace function public.set_primary_goal(p_goal_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student uuid := auth.uid();
begin
  if v_student is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  update public.student_goals
    set is_primary = false
    where student_id = v_student
      and is_primary
      and id <> p_goal_id;

  update public.student_goals
    set is_primary = true
    where id = p_goal_id
      and student_id = v_student
      and status = 'active'
      and exists (
        select 1
        from public.exam_variants v
        join public.exam_registry e on e.id = v.exam_id
        where v.id = student_goals.variant_id
          and v.exam_id = student_goals.exam_id
          and v.status = 'active'
          and e.status = 'active'
      );

  if not found then
    raise exception 'Goal not found or not active' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.set_primary_goal(uuid) from public, anon;
grant execute on function public.set_primary_goal(uuid) to authenticated;

comment on function public.set_primary_goal(uuid) is
  'Atomically makes one active goal primary for the calling student. SECURITY DEFINER is limited to this RPC; both updates are scoped to auth.uid() and the target must be active on an active exam/variant.';
