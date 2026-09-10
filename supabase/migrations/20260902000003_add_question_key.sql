-- Stable content key for the curated exam-style bank (lib/resources.ts).
--
-- Client components (ExamStylePractice) record practice attempts against
-- this key instead of shipping database uuids or looking rows up by
-- question text. The key is a uuid v5 generated once by
-- scripts/add-question-keys.mjs and stored both in the file and here.
-- scripts/seed-resource-questions.mjs backfills it for the seeded rows and
-- sets it on new inserts (upsert keyed by question_text).
--
-- Apply via the Supabase SQL Editor (same as the other migrations — the
-- content-management migration notes that schema is applied there). Until
-- this is applied, the seed reports the column as missing and the attempt
-- action (recordAttemptByQuestionKey) falls back to exact question_text
-- resolution so the feature still works.
--
-- Idempotent: safe to re-run.

alter table public.questions add column if not exists question_key text;

comment on column public.questions.question_key is
  'Stable key from lib/resources.ts (uuid v5); null for non-bank questions.';

create unique index if not exists questions_question_key_idx
  on public.questions (question_key)
  where question_key is not null;