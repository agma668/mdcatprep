-- Past-paper provenance for questions.
--
-- Why: students want to know *which year* a question actually came from, and the
-- product had nowhere to record it. Today every question in the bank is
-- original exam-style writing, so these columns are deliberately NULL for all
-- of them — a year is only ever written when the question genuinely came from
-- the paper it names. lib/past-papers.ts holds the real papers ready to tag.
--
-- Columns:
--   past_paper_exam     examining body, e.g. 'UHS MDCAT'  (NULL = original)
--   past_paper_year     e.g. 2025                          (NULL = original)
--   past_paper_section  paper code/variant, e.g. 'Code D'  (optional)
--
-- Apply via the Supabase SQL Editor (same flow as the other migrations).
-- Until it is applied the app keeps working: lib/questions-repo.ts tries to
-- read these columns and falls back to the base column list when Postgres
-- reports them unknown, so the year badge simply stays hidden.
--
-- Idempotent: safe to re-run.

alter table public.questions add column if not exists past_paper_exam text;
alter table public.questions add column if not exists past_paper_year integer;
alter table public.questions add column if not exists past_paper_section text;

comment on column public.questions.past_paper_exam is
  'Examining body of the real past paper this question came from; NULL for original exam-style questions.';
comment on column public.questions.past_paper_year is
  'Year of the real past paper this question came from; NULL for original exam-style questions.';

-- Supports "browse the bank by year" and "by paper" once papers are ingested.
create index if not exists questions_past_paper_idx
  on public.questions (past_paper_year, past_paper_exam)
  where past_paper_year is not null;
