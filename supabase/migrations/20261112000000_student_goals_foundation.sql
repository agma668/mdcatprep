-- =============================================================================
-- DRAFT — Student Prep Space goals foundation (GitHub issue #2).
-- Additive and idempotent. DO NOT APPLY to the live Supabase project until the
-- companion RLS tests and a local review pass.
--
-- Builds on 20261109000000_exam_registry_and_student_goals.sql, which created
-- the exam catalogue and the first student_goals cut. This migration closes the
-- gaps that made that table a registry rather than a usable goals system:
--   * duplicate active goals for the same variant,
--   * students being able to rewrite ownership or repoint a goal,
--   * no atomic primary-goal switch,
--   * no way for attempts/bookmarks/flashcard reviews to name a goal,
--   * catalogue/mapping writes still reachable by student-facing roles.
--
-- Deliberately NOT included:
--   * any backfill of historical attempts/bookmarks/reviews. Legacy rows stay
--     goal_id = NULL forever unless a future, evidence-based migration says
--     otherwise.
--   * any change to profiles.exam_target, which remains a free-text note.
--   * any exam/variant seed data.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Stable identifier shapes
-- ---------------------------------------------------------------------------
-- Exam and variant ids are the stable join keys used by goals, mappings and
-- progress. Keep them lowercase kebab-case. NOT VALID avoids rewriting any
-- existing rows while still rejecting bad new ids.

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'exam_registry_id_format'
      and conrelid = 'public.exam_registry'::regclass
  ) then
    alter table public.exam_registry
      add constraint exam_registry_id_format
      check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$') not valid;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'exam_variants_id_format'
      and conrelid = 'public.exam_variants'::regclass
  ) then
    alter table public.exam_variants
      add constraint exam_variants_id_format
      check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$') not valid;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'exam_variants_slug_format'
      and conrelid = 'public.exam_variants'::regclass
  ) then
    alter table public.exam_variants
      add constraint exam_variants_slug_format
      check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$') not valid;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Goal identity and duplicate-active rules
-- ---------------------------------------------------------------------------
-- One active goal per (student, exam, variant). Archived/paused goals do not
-- count, so a student may return to a variant later without resurrecting the
-- old row. If a database already contains duplicates this index fails loudly
-- instead of silently archiving a student's goal.
create unique index if not exists student_goals_one_active_per_variant_idx
  on public.student_goals(student_id, exam_id, variant_id)
  where status = 'active';

-- Composite key used by attempts/bookmarks/reviews so a goal reference can
-- never point at another student's goal.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'student_goals_id_student_key'
      and conrelid = 'public.student_goals'::regclass
  ) then
    alter table public.student_goals
      add constraint student_goals_id_student_key unique (id, student_id);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Goal lifecycle normalisation
-- ---------------------------------------------------------------------------
-- A non-active goal can never be primary, and a primary goal must be active.
-- This also lets a student archive their primary goal in one update without
-- having to clear is_primary first. updated_at is maintained server-side so it
-- can stay outside the student-writable column set.
create or replace function public.student_goals_normalise()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status <> 'active' then
    new.is_primary := false;
  end if;
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists student_goals_normalise_trg on public.student_goals;
create trigger student_goals_normalise_trg
  before insert or update on public.student_goals
  for each row execute function public.student_goals_normalise();

-- ---------------------------------------------------------------------------
-- 4. Atomic primary-goal switch
-- ---------------------------------------------------------------------------
-- Clearing the old primary and setting the new one in one transaction avoids a
-- window with no primary and avoids the partial unique index racing itself.
-- SECURITY INVOKER: RLS and the caller's column privileges still apply.
create or replace function public.set_primary_goal(p_goal_id uuid)
returns void
language plpgsql
security invoker
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

-- ---------------------------------------------------------------------------
-- 5. Student-writable surface
-- ---------------------------------------------------------------------------
-- Students may create goals and change only lifecycle fields. exam_id,
-- variant_id, student_id, id and timestamps are not updatable, so a goal can
-- never be repointed at another variant or handed to another account.
revoke insert, update, delete, truncate, references, trigger
  on public.student_goals from authenticated;
grant insert (student_id, exam_id, variant_id, target_date, status, is_primary)
  on public.student_goals to authenticated;
grant update (status, target_date, is_primary)
  on public.student_goals to authenticated;

drop policy if exists "Students update own preparation goals" on public.student_goals;
create policy "Students update own preparation goals"
  on public.student_goals for update to authenticated
  using (student_id = (select auth.uid()))
  with check (
    student_id = (select auth.uid())
    and (
      status <> 'active'
      or exists (
        select 1
        from public.exam_variants v
        join public.exam_registry e on e.id = v.exam_id
        where v.id = student_goals.variant_id
          and v.exam_id = student_goals.exam_id
          and v.status = 'active'
          and e.status = 'active'
      )
    )
  );

-- ---------------------------------------------------------------------------
-- 6. Catalogue and mapping stay read-only for students
-- ---------------------------------------------------------------------------
-- RLS already has no write policies for these tables; explicit revokes also
-- remove any default table privileges a hosted project may have granted.
revoke insert, update, delete, truncate, references, trigger
  on public.exam_registry,
     public.exam_variants,
     public.assessment_profiles,
     public.question_exam_map
  from anon, authenticated;
revoke all on public.question_exam_map from anon, authenticated;
grant select on public.exam_registry, public.exam_variants, public.assessment_profiles
  to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 7. Goal references on progress rows
-- ---------------------------------------------------------------------------
-- Nullable by design. Legacy rows are never backfilled: without evidence we
-- cannot know which goal an old attempt belonged to. New writes opt in when a
-- practice session is goal-scoped.
alter table public.question_attempts add column if not exists goal_id uuid;
alter table public.question_bookmarks add column if not exists goal_id uuid;
alter table public.flashcard_reviews add column if not exists goal_id uuid;

-- The composite foreign key checks ownership: a student can attach only a goal
-- that belongs to them. ON DELETE SET NULL (goal_id) keeps the progress row if
-- a goal is ever hard-deleted, without nulling the required student_id.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'question_attempts_goal_owner_fkey'
      and conrelid = 'public.question_attempts'::regclass
  ) then
    alter table public.question_attempts
      add constraint question_attempts_goal_owner_fkey
      foreign key (goal_id, student_id)
      references public.student_goals(id, student_id)
      on delete set null (goal_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'question_bookmarks_goal_owner_fkey'
      and conrelid = 'public.question_bookmarks'::regclass
  ) then
    alter table public.question_bookmarks
      add constraint question_bookmarks_goal_owner_fkey
      foreign key (goal_id, student_id)
      references public.student_goals(id, student_id)
      on delete set null (goal_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'flashcard_reviews_goal_owner_fkey'
      and conrelid = 'public.flashcard_reviews'::regclass
  ) then
    alter table public.flashcard_reviews
      add constraint flashcard_reviews_goal_owner_fkey
      foreign key (goal_id, student_id)
      references public.student_goals(id, student_id)
      on delete set null (goal_id);
  end if;
end $$;

create index if not exists question_attempts_goal_idx
  on public.question_attempts(goal_id) where goal_id is not null;
create index if not exists question_bookmarks_goal_idx
  on public.question_bookmarks(goal_id) where goal_id is not null;
create index if not exists flashcard_reviews_goal_idx
  on public.flashcard_reviews(goal_id) where goal_id is not null;

-- ---------------------------------------------------------------------------
-- 8. Documentation
-- ---------------------------------------------------------------------------
comment on column public.question_attempts.goal_id is
  'Prep Space goal this attempt belongs to. NULL for legacy rows; never backfilled without evidence.';
comment on column public.question_bookmarks.goal_id is
  'Prep Space goal this bookmark belongs to. NULL for legacy rows; never backfilled without evidence.';
comment on column public.flashcard_reviews.goal_id is
  'Prep Space goal this card review belongs to. NULL for legacy rows; never backfilled without evidence.';
comment on function public.set_primary_goal(uuid) is
  'Atomically makes one active goal primary for the calling student. SECURITY INVOKER; RLS applies.';
comment on column public.profiles.exam_target is
  'Free-text profile note. Not a Prep Space goal; goals live in public.student_goals.';

comment on table public.student_goals is
  'A student can prepare for multiple exam variants. One active goal per variant; at most one active primary goal per student.';
