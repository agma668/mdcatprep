-- Apex exam registry, assessment profiles, preparation goals and reviewed content map.
--
-- This migration is additive. It deliberately does not:
--   * alter existing question/attempt/bookmark/flashcard rows;
--   * infer exam ownership for legacy activity;
--   * seed exams or publish question content;
--   * grant students direct access to question_exam_map;
--   * change the existing questions RLS policy.
--
-- Those steps require goal-aware application actions, official blueprint review,
-- and a separately tested canonical question-ingestion pipeline.

create table if not exists public.exam_registry (
  id text primary key,
  slug text not null unique,
  title text not null,
  category text not null,
  description text,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'retired')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.exam_variants (
  id text primary key,
  exam_id text not null references public.exam_registry(id) on delete restrict,
  slug text not null,
  title text not null,
  paper_profile jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'retired')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint exam_variants_exam_slug_key unique (exam_id, slug),
  constraint exam_variants_id_exam_key unique (id, exam_id)
);

create table if not exists public.assessment_profiles (
  id uuid primary key default gen_random_uuid(),
  exam_id text not null,
  variant_id text not null,
  version text not null,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'retired')),
  source_url text,
  verified_at timestamptz,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint assessment_profiles_variant_version_key unique (variant_id, version),
  constraint assessment_profiles_variant_exam_fkey
    foreign key (variant_id, exam_id)
    references public.exam_variants(id, exam_id) on delete restrict
);

create table if not exists public.student_goals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  exam_id text not null,
  variant_id text not null,
  target_date date,
  status text not null default 'active'
    check (status in ('active', 'paused', 'completed', 'archived')),
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint student_goals_variant_exam_fkey
    foreign key (variant_id, exam_id)
    references public.exam_variants(id, exam_id) on delete restrict,
  constraint student_goals_scope_key unique (id, student_id, exam_id, variant_id),
  constraint student_goals_primary_active_check
    check (not is_primary or status = 'active')
);

create table if not exists public.question_exam_map (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  exam_id text not null,
  variant_id text not null,
  syllabus_topic_id text,
  access_level text not null default 'goal_access'
    check (access_level in ('public_sample', 'goal_access', 'admin_draft')),
  review_state text not null default 'pending'
    check (review_state in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint question_exam_map_question_variant_key unique (question_id, variant_id),
  constraint question_exam_map_variant_exam_fkey
    foreign key (variant_id, exam_id)
    references public.exam_variants(id, exam_id) on delete restrict
);

create index if not exists student_goals_student_status_idx
  on public.student_goals(student_id, status, created_at desc);

create unique index if not exists student_goals_one_active_primary_idx
  on public.student_goals(student_id)
  where is_primary and status = 'active';

create index if not exists question_exam_map_variant_review_idx
  on public.question_exam_map(variant_id, review_state);

alter table public.exam_registry enable row level security;
alter table public.exam_variants enable row level security;
alter table public.assessment_profiles enable row level security;
alter table public.student_goals enable row level security;
alter table public.question_exam_map enable row level security;

drop policy if exists "Active exam catalogue is public" on public.exam_registry;
create policy "Active exam catalogue is public"
  on public.exam_registry for select to anon, authenticated
  using (status = 'active');

drop policy if exists "Active variants of active exams are public" on public.exam_variants;
create policy "Active variants of active exams are public"
  on public.exam_variants for select to anon, authenticated
  using (
    status = 'active'
    and exists (
      select 1 from public.exam_registry e
      where e.id = exam_variants.exam_id and e.status = 'active'
    )
  );

drop policy if exists "Active assessment profiles are public" on public.assessment_profiles;
create policy "Active assessment profiles are public"
  on public.assessment_profiles for select to anon, authenticated
  using (
    status = 'active'
    and exists (
      select 1
      from public.exam_variants v
      join public.exam_registry e on e.id = v.exam_id
      where v.id = assessment_profiles.variant_id
        and v.exam_id = assessment_profiles.exam_id
        and v.status = 'active'
        and e.status = 'active'
    )
  );

drop policy if exists "Students read own preparation goals" on public.student_goals;
create policy "Students read own preparation goals"
  on public.student_goals for select to authenticated
  using (student_id = (select auth.uid()));

drop policy if exists "Students create own preparation goals" on public.student_goals;
create policy "Students create own preparation goals"
  on public.student_goals for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and exists (
      select 1
      from public.exam_variants v
      join public.exam_registry e on e.id = v.exam_id
      where v.id = student_goals.variant_id
        and v.exam_id = student_goals.exam_id
        and v.status = 'active'
        and e.status = 'active'
    )
  );

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

-- Goals with progress are archived, not deleted. This preserves the history
-- referenced by the later goal-scoped attempt/bookmark/review migration.
grant select on public.exam_registry, public.exam_variants, public.assessment_profiles
  to anon, authenticated;
grant select, insert, update on public.student_goals to authenticated;
grant all on public.exam_registry, public.exam_variants, public.assessment_profiles,
  public.student_goals, public.question_exam_map to service_role;

comment on table public.exam_registry is
  'Apex exam catalogue. Only active records are visible to public clients.';
comment on table public.exam_variants is
  'Official paper or stream variants for one Apex exam. Variant identity is separate from year/version.';
comment on table public.assessment_profiles is
  'Versioned official paper patterns and source provenance for a particular exam variant.';
comment on table public.student_goals is
  'A student can prepare for multiple exam variants; progress is attached to one goal.';
comment on table public.question_exam_map is
  'Reviewed mapping from canonical question rows to explicit exam variants. No student Data API access is granted.';
