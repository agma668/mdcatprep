'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CARDS_BY_ID } from '@/lib/flashcards/flashcards-data'
import { scheduleCard, type CardRating } from '@/lib/flashcards/srs'

// Flashcard review actions. Card CONTENT is static (shipped in code); only
// per-student review state is persisted, into flashcard_reviews (RLS: a
// student can only ever read/write rows with their own student_id).
//
// Every read FAILS OPEN: if the flashcard_reviews table isn't applied yet (or
// Supabase stalls), the UI shows all-new decks instead of an error. Grading a
// card, by contrast, is honest — it returns an error the UI can toast rather
// than silently pretending progress was saved.

const VALID_RATINGS: readonly CardRating[] = ['again', 'hard', 'good', 'easy']

export interface ReviewRow {
  card_id: string
  due_at: string
  interval_days: number
  repetitions: number
  ease_factor: number
  last_rating: string | null
  last_reviewed_at: string | null
  times_correct: number
  times_wrong: number
}

export interface ReviewStatePayload {
  /** card_id -> review row. Missing id = never reviewed (new). */
  byCard: Record<string, ReviewRow>
  /** True when the table read failed — the UI shows all-new and hides stats. */
  unavailable: boolean
}

export async function getFlashcardReviewState(): Promise<ReviewStatePayload> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { byCard: {}, unavailable: true }

  // Page past PostgREST's row cap so long-time students never silently lose
  // review state (same pattern as the habit snapshot).
  const rows: ReviewRow[] = []
  for (let page = 0; page < 8; page++) {
    const from = page * 1000
    const { data, error } = await supabase
      .from('flashcard_reviews')
      .select(
        'card_id, due_at, interval_days, repetitions, ease_factor, last_rating, last_reviewed_at, times_correct, times_wrong'
      )
      .eq('student_id', user.id)
      .order('card_id')
      .range(from, from + 999)
    if (error || !data) break
    rows.push(...(data as ReviewRow[]))
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

export interface GradeResult {
  success: boolean
  error?: string
  /** Updated scheduling state for optimistic UI (null when failed). */
  next?: {
    cardId: string
    dueAt: string
    intervalDays: number
    repetitions: number
    easeFactor: number
    isLearning: boolean
  }
}

export async function gradeFlashcard(
  cardId: string,
  rating: string
): Promise<GradeResult> {
  if (!VALID_RATINGS.includes(rating as CardRating)) {
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

  // Current state (if any) for this card.
  const { data: existing } = await supabase
    .from('flashcard_reviews')
    .select(
      'ease_factor, interval_days, repetitions, times_correct, times_wrong'
    )
    .eq('student_id', user.id)
    .eq('card_id', cardId)
    .maybeSingle()

  const prev = existing ?? {
    ease_factor: 2.5,
    interval_days: 0,
    repetitions: 0,
    times_correct: 0,
    times_wrong: 0,
  }

  const next = scheduleCard(
    {
      easeFactor: Number(prev.ease_factor) || 2.5,
      intervalDays: prev.interval_days ?? 0,
      repetitions: prev.repetitions ?? 0,
    },
    rating as CardRating
  )

  const nowIso = new Date().toISOString()
  const wasCorrect = rating !== 'again'

  const { error } = await supabase.from('flashcard_reviews').upsert(
    {
      student_id: user.id,
      card_id: cardId,
      ease_factor: next.easeFactor,
      interval_days: next.intervalDays,
      repetitions: next.repetitions,
      due_at: next.dueAt,
      last_reviewed_at: nowIso,
      last_rating: rating,
      times_correct: (prev.times_correct ?? 0) + (wasCorrect ? 1 : 0),
      times_wrong: (prev.times_wrong ?? 0) + (wasCorrect ? 0 : 1),
    },
    { onConflict: 'student_id,card_id' }
  )

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/flashcards')
  return {
    success: true,
    next: {
      cardId,
      dueAt: next.dueAt,
      intervalDays: next.intervalDays,
      repetitions: next.repetitions,
      easeFactor: next.easeFactor,
      isLearning: next.isLearning,
    },
  }
}

/** Reset one card's review history (student-initiated "start this card over"). */
export async function resetFlashcard(cardId: string): Promise<{ success: boolean; error?: string }> {
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
