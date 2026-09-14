-- Bookmarks (question flagging) — the UWorld-signature "flag for review"
-- backed by a real table. Students flag any question during practice and
-- revisit it from /dashboard/bookmarks.
--
-- Idempotent: safe to re-run. Apply via the Supabase SQL Editor (paste).

create table if not exists public.question_bookmarks (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  student_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (question_id, student_id)
);

alter table public.question_bookmarks enable row level security;

create index if not exists question_bookmarks_student_idx
  on public.question_bookmarks (student_id, created_at desc);

drop policy if exists "Students manage their own bookmarks." on public.question_bookmarks;
create policy "Students manage their own bookmarks."
  on public.question_bookmarks
  for all to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());
