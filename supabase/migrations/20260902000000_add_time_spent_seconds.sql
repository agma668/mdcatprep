-- Add time_spent_seconds to question_attempts for timed practice tracking.
-- This is an additive, non-destructive change. Existing rows get NULL (no time data).
-- The column is nullable so old attempts are unaffected.

alter table public.question_attempts 
  add column if not exists time_spent_seconds integer;

comment on column public.question_attempts.time_spent_seconds is 
  'Seconds spent on this question during timed practice. NULL for untimed attempts.';
