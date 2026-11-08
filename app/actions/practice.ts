'use server'

import { createClient } from '@/lib/supabase/server'

export type RecordAttemptResult =
  | { error: string }
  | { success: true; isCorrect: boolean; correctAnswer: string | null }

const VALID_ANSWERS = ['A', 'B', 'C', 'D'] as const

/** A unique-violation PostgREST error (used to treat a raced keyed insert as
 *  an already-recorded success instead of an error). */
function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === '23505'
}

/** A missing-column error — Postgres code 42703, or PostgREST's own PGRST204
 *  ("Could not find the 'X' column of 'Y' in the schema cache"), which it
 *  returns for unknown columns on INSERT before Postgres is ever reached.
 *  Used by the pre-migration fallback that drops the not-yet-existing
 *  client_attempt_id field and retries. */
function isMissingColumnError(error: { code?: string } | null): boolean {
  return error?.code === '42703' || error?.code === 'PGRST204'
}

/**
 * Records a student's answer to a published question. The student id comes
 * from the session (never from client input), the correctness is computed
 * server-side from the stored correct_answer (never sent by the client), and
 * RLS additionally constrains attempts to the caller's own student_id.
 *
 * Idempotency: when `clientAttemptId` is supplied (a client-unique key per
 * logical submission — duel answers and offline-sync entries), the SAME key
 * can never record twice: an existing attempt row with the key short-circuits
 * before any insert, and a concurrent race that loses the unique-index insert
 * is reported as success. A retried or re-sent submission therefore can't
 * double-count a scored answer even when the first attempt died mid-flight.
 */
export async function recordAttempt(
  questionId: string,
  selectedAnswer: string,
  timeSpentSeconds?: number,
  clientAttemptId?: string
): Promise<RecordAttemptResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (!(VALID_ANSWERS as readonly string[]).includes(selectedAnswer)) {
    return { error: 'Invalid answer.' }
  }

  const { data: question, error: qError } = await supabase
    .from('questions')
    .select('id, status, correct_answer')
    .eq('id', questionId)
    .single()

  if (qError || !question) return { error: 'Question not found.' }
  return insertAttempt(supabase, user, question, selectedAnswer, timeSpentSeconds, clientAttemptId)
}

/**
 * Records an attempt for a question from the curated exam-style bank
 * (lib/resources.ts), identified by its stable question_key. The key path is
 * preferred — it survives answer rebalances and never depends on question
 * text. Until the question_key column migration
 * (supabase/migrations/20260902000003_add_question_key.sql) is applied to
 * the database, the key lookup can't find rows, so this falls back to an
 * exact question_text match (the same text the seed upsert keys on). Same
 * guarantees as recordAttempt: student id from session, correctness computed
 * server-side, RLS intact.
 */
export async function recordAttemptByQuestionKey(
  questionKey: string,
  selectedAnswer: string,
  questionText?: string,
  timeSpentSeconds?: number,
  clientAttemptId?: string
): Promise<RecordAttemptResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (!(VALID_ANSWERS as readonly string[]).includes(selectedAnswer)) {
    return { error: 'Invalid answer.' }
  }
  if (!questionKey) return { error: 'Invalid question.' }

  // Preferred: resolve by the stable key.
  const byKey = await supabase
    .from('questions')
    .select('id, status, correct_answer')
    .eq('question_key', questionKey)
    .maybeSingle()

  let question = byKey.data
  if (byKey.error || !byKey.data) {
    // Key column missing (pre-migration) or key not found — fall back to the
    // exact question text, which the seed upsert keeps in sync.
    if (!questionText) return { error: 'Question not found.' }
    const byText = await supabase
      .from('questions')
      .select('id, status, correct_answer')
      .eq('question_text', questionText)
      .maybeSingle()
    if (byText.error) return { error: 'Question not found.' }
    question = byText.data
  }

  if (!question) return { error: 'Question not found.' }
  return insertAttempt(supabase, user, question, selectedAnswer, timeSpentSeconds, clientAttemptId)
}

// Shared insert: correctness from the stored key, time clamped, attempt
// retried without time if the column is missing (older schemas). When a
// client_attempt_id is supplied, a unique-violation race on that key is
// reported as success (already recorded) so the caller's downstream write
// still completes — never as an error that would trigger a double-record.
async function insertAttempt(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: { id: string },
  question: { id: string; status: string; correct_answer: string },
  selectedAnswer: string,
  timeSpentSeconds?: number,
  clientAttemptId?: string
): Promise<RecordAttemptResult> {
  if (question.status !== 'published') return { error: 'This question is not available.' }

  // One idempotency check for both UUID-backed and bundled-key questions.
  // Reusing a key for a different question/answer is rejected rather than
  // incorrectly reporting an unrelated attempt as successful.
  if (clientAttemptId) {
    const existing = await supabase
      .from('question_attempts')
      .select('id, is_correct, question_id, selected_answer')
      .eq('client_attempt_id', clientAttemptId)
      .maybeSingle()

    if (existing.error) return { error: existing.error.message }
    if (existing.data) {
      if (existing.data.question_id !== question.id || existing.data.selected_answer !== selectedAnswer) {
        return { error: 'This attempt ID has already been used for another answer.' }
      }
      return {
        success: true,
        isCorrect: existing.data.is_correct,
        correctAnswer: question.correct_answer,
      }
    }
  }

  const isCorrect = question.correct_answer === selectedAnswer

  // Clamp time to a sane range (0–600 seconds per question)
  const clampedTime = typeof timeSpentSeconds === 'number'
    ? Math.min(Math.max(Math.round(timeSpentSeconds), 0), 600)
    : null

  const insertData: Record<string, unknown> = {
    question_id: question.id,
    student_id: user.id,
    selected_answer: selectedAnswer,
    is_correct: isCorrect,
  }

  // Only include time_spent_seconds if the column exists (won't error if it doesn't)
  if (clampedTime !== null) {
    insertData.time_spent_seconds = clampedTime
  }
  if (clientAttemptId) {
    insertData.client_attempt_id = clientAttemptId
  }

  const { error } = await supabase.from('question_attempts').insert(insertData)

  // Unique violation on client_attempt_id: a concurrent/retried submission
  // with the same key already inserted the row. Treat it as success (the
  // answer is recorded) — the key makes the outcome unambiguous.
  if (error && isUniqueViolation(error) && clientAttemptId) {
    const existing = await supabase
      .from('question_attempts')
      .select('is_correct, question_id, selected_answer')
      .eq('client_attempt_id', clientAttemptId)
      .maybeSingle()
    if (existing.data) {
      if (existing.data.question_id !== question.id || existing.data.selected_answer !== selectedAnswer) {
        return { error: 'This attempt ID has already been used for another answer.' }
      }
      return {
        success: true,
        isCorrect: existing.data.is_correct,
        correctAnswer: question.correct_answer,
      }
    }
    return { error: error.message }
  }

  // Pre-migration resilience (same discipline as the time column below): the
  // client_attempt_id column only exists after the duels migration is pasted,
  // so before the paste a keyed insert fails (PGRST204/42703) — drop the key
  // and retry so the attempt still records (idempotency arrives with the
  // paste). If the time column is ALSO missing on this old schema, drop it.
  if (error && isMissingColumnError(error) && clientAttemptId && 'client_attempt_id' in insertData) {
    delete insertData.client_attempt_id
    const retry = await supabase.from('question_attempts').insert(insertData)
    if (retry.error && isMissingColumnError(retry.error) && clampedTime !== null) {
      delete insertData.time_spent_seconds
      const retry2 = await supabase.from('question_attempts').insert(insertData)
      if (retry2.error) return { error: retry2.error.message }
    } else if (retry.error) {
      return { error: retry.error.message }
    }
  } else if (error && clampedTime !== null) {
    // If the insert fails (e.g. time_spent_seconds column doesn't exist yet),
    // retry without the time field so the attempt is still recorded.
    delete insertData.time_spent_seconds
    const retry = await supabase.from('question_attempts').insert(insertData)
    if (retry.error) return { error: retry.error.message }
  } else if (error) {
    return { error: error.message }
  }

  return {
    success: true,
    isCorrect,
    correctAnswer: question.correct_answer,
  }
}