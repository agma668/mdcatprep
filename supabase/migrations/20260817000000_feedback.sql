-- Site feedback.
--
-- A single, anonymous-by-default feedback form shown on every page. The form
-- asks for one thing only: the feedback message. No name, no extra questions.
--
--   - Students / visitors insert feedback. The student's auth id is captured
--     server-side (never asked for in the form) so admins can see who said it;
--     anonymous visitors leave a NULL user_id.
--   - Reading feedback is admin-only: the admin portal queries this table
--     server-side with the service role. Students never read others' feedback.
--
-- Idempotent: safe to run on the live project and on a fresh database.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  -- References profiles (not auth.users directly) so the admin portal can
  -- join student name/email; deleting a student still nulls this via cascade.
  user_id uuid references public.profiles (id) on delete set null,
  page text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.feedback enable row level security;

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);

-- Anyone may submit feedback: authenticated students attach their own user id,
-- anonymous visitors submit with a NULL user_id.
drop policy if exists "Anyone can submit feedback." on public.feedback;
create policy "Anyone can submit feedback." on public.feedback
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
