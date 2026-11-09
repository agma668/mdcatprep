'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CARDS_BY_ID, FLASHCARD_DECKS } from '@/lib/flashcards/flashcards-data'
import { queueSize, summariseReviewState, type FlashcardSummary } from '@/lib/flashcards/dashboard'
import type { CardRating } from '@/lib/flashcards/srs'
import {
  emptyFsrsState,
  isFsrsRating,
  previewFsrs,
  scheduleFsrs,
  type FsrsState,
} from '@/lib/flashcards/fsrs'
import type {
  GradeResult,
  ResetResult,
  ReviewRow,
  ReviewStatePayload,
} from '@/lib/flashcards/types'

// Flashcard review actions. Card CONTENT is static (shipped in code); only
// per-student review state is persisted, into flashcard_reviews (RLS: a
// student can only ever read/write rows with their own student_id).
//
// Scheduling now uses the real FSRS algorithm (lib/flashcards/fsrs.ts), which
// persists memory stability, difficulty and lifecycle state. Because the
// FSRS columns are added by a draft migration that may not be applied in every
// environment yet, this module writes them optimistically and falls back to
// the legacy columns when they are absent — so an un-migrated deployment keeps
// working exactly as before the upgrade.
//
// Every read FAILS OPEN: if the flashcard_reviews table isn't applied yet (or
// Supabase stalls), the UI shows all-new decks instead of an error. Grading a
// card, by contrast, is honest — it returns an error the UI can toast rather
// than silently pretending progress was saved.

const VALID_RATINGS: readonly CardRating[] = ['again', 'hard', 'good', 'easy']

// Legacy `ease_factor` is constrained to [1.3, 3.2]; FSRS difficulty is 0–10.
// We mirror difficulty into ease only for backward-compatible reads.
function isLifecycle(value: string | undefined): value is FsrsState['state'] {
  return value === 'new' || value === 'learning' || value === 'review' || value === 'relearning'
}

/** The subset of persisted columns the scheduler reads (either schema). */
type StoredReviewRow = {
  due_at?: string
  stability?: number
  difficulty?: number
  fsrs_state?: string
  scheduled_days?: number
  elapsed_days?: number
  learning_steps?: number
  repetitions?: number
  lapses?: number
  interval_days?: number
  ease_factor?: number
  times_wrong?: number
  times_correct?: number
  last_reviewed_at?: string | null
}

function difficultyToEase(difficulty: number): number {
  const ease = 3.2 - (Math.min(10, Math.max(0, difficulty)) / 10) * 1.9
  return Math.min(3.2, Math.max(1.3, Number(ease.toFixed(3))))
}

function easeToDifficulty(ease: number): number {
  const d = ((3.2 - ease) / 1.9) * 10
  return Math.min(10, Math.max(0, Number(d.toFixed(3))))
}

/**
 * Reconstruct a usable FSRS state from whatever the row carries. New rows (or
 * rows written before the FSRS migration) only have the legacy columns, so we
 * seed stability/difficulty from them; the next review then evolves correctly
 * under FSRS. This never invents progress — a never-reviewed card stays new.
 */
function stateFromRow(row: StoredReviewRow | null, now: Date): FsrsState {
  if (!row) return emptyFsrsState(now)

  if (typeof row.stability === 'number' && row.stability > 0 && isLifecycle(row.fsrs_state)) {
    return {
      due: row.due_at ?? now.toISOString(),
      stability: Number(row.stability),
      difficulty: Number(row.difficulty) || 5,
      scheduledDays: Number(row.scheduled_days ?? row.interval_days ?? 0),
      elapsedDays: Number(row.elapsed_days ?? 0),
      learningSteps: Number(row.learning_steps ?? 0),
      reps: Number(row.repetitions ?? 0),
      lapses: Number(row.lapses ?? 0),
      state: row.fsrs_state,
      lastReview: row.last_reviewed_at ?? null,
    }
  }

  // Legacy / never-reviewed fallback.
  const reviewed = Boolean(row.last_reviewed_at)
  const interval = Number(row.interval_days ?? 0)
  const lifecycle: FsrsState['state'] = !reviewed
    ? 'new'
    : interval > 0
      ? 'review'
      : 'learning'
  return {
    due: row.due_at ?? now.toISOString(),
    stability: reviewed ? Math.max(interval, 0.1) : 0,
    difficulty: easeToDifficulty(Number(row.ease_factor) || 2.5),
    scheduledDays: interval,
    elapsedDays: 0,
    learningSteps: 0,
    reps: Number(row.repetitions ?? 0),
    lapses: Number(row.times_wrong ?? 0),
    state: lifecycle,
    lastReview: row.last_reviewed_at ?? null,
  }
}

export async function getFlashcardReviewState(): Promise<ReviewStatePayload> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { byCard: {}, unavailable: true }

  // Page past PostgREST's row cap so long-time students never silently lose
  // review state (same pattern as the habit snapshot). `*` keeps this working
  // whether or not the FSRS columns are present.
  const rows: ReviewRow[] = []
  for (let page = 0; page < 8; page++) {
    const from = page * 1000
    const { data, error } = await supabase
      .from('flashcard_reviews')
      .select('*')
      .eq('student_id', user.id)
      .order('card_id')
      .range(from, from + 999)
    if (error || !data) break
    rows.push(...(data as unknown as ReviewRow[]))
    if (data.length < 1000) break
  }

  const byCard: Record<string, ReviewRow> = {}
  for (const row of rows) byCard[row.card_id] = row
  return { byCard, unavailable: rows.length === 0 && (await probeFailed(supabase, user.id)) }
}

/**
 * Distinguishes "no rows yet" (a genuinely new student) from "table missing /
 * read error" so the UI can hide due-count stats instead of showing a fake
 * all-zero state. One cheap probe select; errors => unavailable.
 */
async function probeFailed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('flashcard_reviews')
    .select('card_id')
    .eq('student_id', userId)
    .limit(1)
  return Boolean(error)
}

export async function gradeFlashcard(
  cardId: string,
  rating: string
): Promise<GradeResult> {
  if (!VALID_RATINGS.includes(rating as CardRating) || !isFsrsRating(rating)) {
    return { success: false, error: 'Invalid rating.' }
  }
  // Unknown card id: not in the shipped decks (or tampered client payload).
  if (!CARDS_BY_ID.has(cardId)) {
    return { success: false, error: 'Unknown card.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const now = new Date()

  // Current state (if any) for this card. `*` tolerates either schema.
  const { data: existing } = await supabase
    .from('flashcard_reviews')
    .select('*')
    .eq('student_id', user.id)
    .eq('card_id', cardId)
    .maybeSingle()

  const prev = existing as StoredReviewRow | null
  const state = stateFromRow(prev, now)
  const { card: next, log } = scheduleFsrs(state, rating, now)

  const wasCorrect = rating !== 'again'
  const dueAt = next.due
  const intervalDays = next.scheduledDays
  const isLearning = next.state === 'learning' || next.state === 'relearning'
  const easeFactor = difficultyToEase(next.difficulty)

  const timesCorrect = (prev?.times_correct ?? 0) + (wasCorrect ? 1 : 0)
  const timesWrong = (prev?.times_wrong ?? 0) + (wasCorrect ? 0 : 1)

  // Full FSRS row (requires the draft migration).
  const fsrsRow = {
    student_id: user.id,
    card_id: cardId,
    // legacy columns, kept populated for older readers
    ease_factor: easeFactor,
    interval_days: intervalDays,
    repetitions: next.reps,
    due_at: dueAt,
    last_reviewed_at: now.toISOString(),
    last_rating: rating,
    times_correct: timesCorrect,
    times_wrong: timesWrong,
    // FSRS memory model
    stability: next.stability,
    difficulty: next.difficulty,
    fsrs_state: next.state,
    lapses: next.lapses,
    scheduled_days: next.scheduledDays,
    elapsed_days: next.elapsedDays,
    learning_steps: next.learningSteps,
  }

  let error = (
    await supabase
      .from('flashcard_reviews')
      .upsert(fsrsRow, { onConflict: 'student_id,card_id' })
  ).error

  if (error && isMissingColumn(error)) {
    // Pre-migration environment: persist the legacy-compatible columns only.
    // Due date and interval still come from FSRS, so scheduling stays correct.
    const legacyRow = {
      student_id: user.id,
      card_id: cardId,
      ease_factor: easeFactor,
      interval_days: intervalDays,
      repetitions: next.reps,
      due_at: dueAt,
      last_reviewed_at: now.toISOString(),
      last_rating: rating,
      times_correct: timesCorrect,
      times_wrong: timesWrong,
    }
    error = (
      await supabase
        .from('flashcard_reviews')
        .upsert(legacyRow, { onConflict: 'student_id,card_id' })
    ).error
  }

  if (error) {
    return { success: false, error: error.message }
  }

  // Append to review history when available (best-effort: a missing history
  // table must never fail the grade itself).
  await supabase.from('flashcard_review_history').insert({
    student_id: user.id,
    card_id: cardId,
    rating,
    state: log.state,
    stability: log.stability,
    difficulty: log.difficulty,
    scheduled_days: log.scheduledDays,
    due_at: log.due,
    reviewed_at: log.review,
  })

  revalidatePath('/dashboard/flashcards')
  return {
    success: true,
    next: {
      cardId,
      dueAt,
      intervalDays,
      repetitions: next.reps,
      easeFactor,
      isLearning,
      difficulty: next.difficulty,
      stability: next.stability,
      state: next.state,
      scheduledDays: next.scheduledDays,
    },
  }
}

/** Preview the next interval for each rating without committing a review. */
export async function previewFlashcardIntervals(
  cardId: string
): Promise<Record<CardRating, string> | null> {
  if (!CARDS_BY_ID.has(cardId)) return null
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const now = new Date()
  const { data } = await supabase
    .from('flashcard_reviews')
    .select('*')
    .eq('student_id', user.id)
    .eq('card_id', cardId)
    .maybeSingle()

  const preview = previewFsrs(stateFromRow(data as StoredReviewRow | null, now), now)
  return {
    again: intervalLabelFor(preview.again),
    hard: intervalLabelFor(preview.hard),
    good: intervalLabelFor(preview.good),
    easy: intervalLabelFor(preview.easy),
  }
}

function intervalLabelFor(state: FsrsState): string {
  if (state.state === 'new') return 'new'
  const days = state.scheduledDays
  if (days <= 0) return '<1d'
  if (days < 30) return `${days}d`
  if (days < 365) return `${Math.round(days / 30)}mo`
  return `${Math.round(days / 365)}y`
}

/** Reset one card's review history (student-initiated "start this card over"). */
export async function resetFlashcard(cardId: string): Promise<ResetResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('flashcard_reviews')
    .delete()
    .eq('student_id', user.id)
    .eq('card_id', cardId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/flashcards')
  return { success: true }
}

/** Detect PostgREST's "column does not exist" so we can fall back safely. */
function isMissingColumn(error: { code?: string; message?: string }): boolean {
  if (!error) return false
  if (error.code === 'PGRST204' || error.code === '42703') return true
  const msg = (error.message ?? '').toLowerCase()
  return msg.includes('column') && (msg.includes('does not exist') || msg.includes('schema cache'))
}

// ---------------------------------------------------------------------------
// Review dashboard (issue #5, section C)
// ---------------------------------------------------------------------------

const DEFAULT_DAILY_NEW_LIMIT = 20

export interface FlashcardDashboardPayload {
  summary: FlashcardSummary
  dailyNewLimit: number
  queueSize: number
  /** True when review state could not be read (table not applied yet). */
  unavailable: boolean
}

/** Summary of new/due/learning/relearning cards and the 7-day workload. */
export async function getFlashcardDashboard(): Promise<FlashcardDashboardPayload> {
  const state = await getFlashcardReviewState()
  const cardIds = allCardIds()
  const summary = summariseReviewState(cardIds, state.byCard)
  const dailyNewLimit = await readDailyNewLimit()
  return {
    summary,
    dailyNewLimit,
    queueSize: queueSize(summary, dailyNewLimit),
    unavailable: state.unavailable,
  }
}

/** Read the student's daily new-card limit, defaulting when unset/missing. */
export async function readDailyNewLimit(): Promise<number> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return DEFAULT_DAILY_NEW_LIMIT

  const { data, error } = await supabase
    .from('profiles')
    .select('flashcard_new_limit')
    .eq('id', user.id)
    .maybeSingle()
  if (error || !data) return DEFAULT_DAILY_NEW_LIMIT
  const value = Number((data as { flashcard_new_limit?: number }).flashcard_new_limit)
  return Number.isFinite(value) ? value : DEFAULT_DAILY_NEW_LIMIT
}

/** Persist a new daily new-card limit (0–500, clamped). */
export async function setDailyNewLimit(
  limit: number
): Promise<{ success: boolean; error?: string; dailyNewLimit?: number }> {
  if (!Number.isFinite(limit)) return { success: false, error: 'Invalid limit.' }
  const clamped = Math.min(500, Math.max(0, Math.floor(limit)))

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ flashcard_new_limit: clamped })
    .eq('id', user.id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/flashcards')
  return { success: true, dailyNewLimit: clamped }
}

export interface FlashcardHistoryEntry {
  card_id: string
  rating: string
  state: string
  reviewed_at: string
}

/** Recent review history, newest first (empty when the table is not applied). */
export async function getFlashcardHistory(limit = 20): Promise<FlashcardHistoryEntry[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('flashcard_review_history')
    .select('card_id, rating, state, reviewed_at')
    .eq('student_id', user.id)
    .order('reviewed_at', { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100))
  if (error) return []
  return (data ?? []) as FlashcardHistoryEntry[]
}

/** Stable, ordered list of every shipped card id across all decks. */
function allCardIds(): string[] {
  const ids: string[] = []
  for (const deck of FLASHCARD_DECKS) {
    for (const card of deck.cards) ids.push(card.id)
  }
  return ids
}
