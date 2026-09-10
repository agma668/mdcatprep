'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { validateOpponent } from '@/lib/opponent-gate'
import { COLLEGE_SUBJECTS } from '@/lib/subjects'
import { fetchPublishedQuestions, shuffleQuestions } from '@/lib/questions-repo'
import type { QuizQuestion } from '@/lib/questions'
import {
  DUEL_QUESTION_COUNT,
  isDuelExpired,
  duelHasResult,
  computeDuelResult,
  fetchDuelById,
  fetchDuelAnswers,
  fetchQuestionsByIds,
  type DuelRow,
  type DuelResult,
  type DuelWinner,
} from '@/lib/duels-repo'
import { recordAttempt } from './practice'

const VALID_ANSWERS = ['A', 'B', 'C', 'D'] as const

/** Every subject a duel can be drawn from — the college test taxonomy. */
const DUEL_SUBJECTS: ReadonlySet<string> = new Set(
  Object.values(COLLEGE_SUBJECTS).flat()
)

/** Clamp duel answer time the same way practice clamps attempt time. */
function clampTime(seconds: number | null | undefined): number | null {
  return typeof seconds === 'number'
    ? Math.min(Math.max(Math.round(seconds), 0), 600)
    : null
}

async function currentUserId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user ? { supabase, userId: user.id } : null
}


export type CreateDuelResult =
  | { error: string }
  | { duelId: string; subject: string; questionCount: number }

async function createDuelInner(
  userId: string,
  opponentId: string,
  subject: string
): Promise<CreateDuelResult> {
  if (!DUEL_SUBJECTS.has(subject)) return { error: 'Unknown subject.' }

  const gate = await validateOpponent(opponentId, userId, {
    self: 'You cannot challenge yourself.',
    notApproved: 'Only approved students can be challenged.',
    notAccepting: 'This student is not accepting challenges right now.',
    staff: 'You cannot challenge staff accounts.',
  })
  if ('error' in gate) return { error: gate.error }

  // Draw the set NOW: 10 published questions from the chosen subject, frozen
  // as ids on the duel row. No cross-subject fill — the subject choice must
  // be real — and the set can never change after this point.
  const supabase = await createClient()
  const drawn = shuffleQuestions(
    await fetchPublishedQuestions(supabase, { subject, limit: DUEL_QUESTION_COUNT })
  ).slice(0, DUEL_QUESTION_COUNT)

  if (drawn.length < DUEL_QUESTION_COUNT) {
    return { error: `Not enough published questions in ${subject} yet (need ${DUEL_QUESTION_COUNT}).` }
  }

  const ids = drawn.map((q) => q.id).filter((id): id is string => !!id)
  if (ids.length < DUEL_QUESTION_COUNT) return { error: 'Question set could not be drawn.' }

  const { data, error } = await supabase
    .from('duels')
    .insert({
      challenger_id: userId,
      opponent_id: opponentId,
      subject,
      question_ids: ids,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    // Pre-migration: the duels table doesn't exist yet. Say so plainly
    // instead of echoing PostgREST's schema-cache error at a student.
    if (/does not exist|schema cache/i.test(error.message)) {
      return { error: "Duels aren't live yet — challenges become available soon." }
    }
    return { error: error.message }
  }
  return { duelId: data.id, subject, questionCount: ids.length }
}

/**
 * A challenges an approved student. The question set is drawn and frozen here
 * (same set for both players, never changes), and the duel is created pending
 * with a 48h expiry computed at read time.
 */
export async function createDuel(opponentId: string, subject: string): Promise<CreateDuelResult> {
  const me = await currentUserId()
  if (!me) return { error: 'Not authenticated' }
  return createDuelInner(me.userId, opponentId, subject)
}

/** Rematch: roles reversed, same subject, fresh question draw. A duel is
 *  rematchable once it has a terminal result — completed head-to-head OR a
 *  forfeit (the opponent lapsed past expiry). */
export async function rematchDuel(duelId: string): Promise<CreateDuelResult> {
  const me = await currentUserId()
  if (!me) return { error: 'Not authenticated' }

  const supabase = me.supabase
  const duel = await fetchDuelById(supabase, duelId)
  if (!duel) return { error: 'Duel not found.' }
  if (!duelHasResult(duel)) return { error: 'A duel can only be rematched after it completes.' }
  if (duel.challenger_id !== me.userId && duel.opponent_id !== me.userId) {
    return { error: 'You are not part of this duel.' }
  }
  const opponentId = duel.challenger_id === me.userId ? duel.opponent_id : duel.challenger_id
  return createDuelInner(me.userId, opponentId, duel.subject)
}

export interface DuelInboxEntry {
  duelId: string
  subject: string
  status: 'pending' | 'expired' | 'completed'
  createdAt: string
  /** Milliseconds left to play (pending only). */
  msLeft: number
  /** Epoch ms the challenge expires at — lets the card run a live countdown. */
  expiresAt: number
  role: 'challenger' | 'opponent'
  otherId: string
  otherName: string
  myFinished: boolean
  theirFinished: boolean
  result?: ReturnType<typeof computeDuelResult>
  winner: DuelWinner
}

/**
 * The inbox — pending challenges (with expiry), expired ones, and recent
 * completed duels with their results. Expiry is derived at read time; nothing
 * is ever written for an expired duel.
 */
export async function getMyDuels(): Promise<{ entries: DuelInboxEntry[] } | { error: string }> {
  const me = await currentUserId()
  if (!me) return { error: 'Not authenticated' }

  const { data: rows, error } = await me.supabase
    .from('duels')
    .select('id, challenger_id, opponent_id, subject, question_ids, status, challenger_finished_at, opponent_finished_at, created_at')
    .or(`challenger_id.eq.${me.userId},opponent_id.eq.${me.userId}`)
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }
  const duels = (rows ?? []) as DuelRow[]

  // Opponent display names (service read — profiles RLS would hide them).
  const service = createServiceClient()
  const otherIds = [...new Set(duels.map((d) => (d.challenger_id === me.userId ? d.opponent_id : d.challenger_id)))]
  const nameById = new Map<string, string>()
  if (otherIds.length > 0) {
    const { data: others } = await service
      .from('profiles')
      .select('id, full_name')
      .in('id', otherIds)
    for (const o of others ?? []) nameById.set(o.id, o.full_name || 'Student')
  }

  const now = Date.now()
  const entries: DuelInboxEntry[] = duels.map((duel) => {
    const isChallenger = duel.challenger_id === me.userId
    const myFinished = isChallenger ? !!duel.challenger_finished_at : !!duel.opponent_finished_at
    const theirFinished = isChallenger ? !!duel.opponent_finished_at : !!duel.challenger_finished_at
    const expired = isDuelExpired(duel, now)
    const otherId = isChallenger ? duel.opponent_id : duel.challenger_id

    // Forfeit: the challenge lapsed with exactly one side finished — that is
    // a terminal result (the finisher wins), derived at read time even though
    // the stored status is still 'pending'. Shown as completed for both.
    const forfeit = expired && !!duel.challenger_finished_at !== !!duel.opponent_finished_at

    let status: DuelInboxEntry['status'] = 'pending'
    if (duel.status === 'completed') status = 'completed'
    else if (expired) status = forfeit ? 'completed' : 'expired'

    return {
      duelId: duel.id,
      subject: duel.subject,
      status,
      createdAt: duel.created_at,
      msLeft: status === 'pending' ? new Date(duel.created_at).getTime() + 48 * 60 * 60 * 1000 - now : 0,
      expiresAt: new Date(duel.created_at).getTime() + 48 * 60 * 60 * 1000,
      role: isChallenger ? 'challenger' : 'opponent',
      otherId,
      otherName: nameById.get(otherId) || 'Student',
      myFinished,
      theirFinished,
      winner: null,
    }
  })

  // Attach results to completed duels (one query per duel is fine at inbox
  // scale; a join is a follow-up if volume grows).
  for (const entry of entries) {
    if (entry.status !== 'completed') continue
    const duel = duels.find((d) => d.id === entry.duelId)
    if (!duel) continue
    const answers = await fetchDuelAnswers(me.supabase, entry.duelId)
    const result = computeDuelResult(duel, answers)
    entry.result = result
    entry.winner = result.winner
  }

  return { entries }
}

export interface DuelPlayData {
  duel: DuelRow
  /** The signed-in student — which side of the scoreboard is "me". */
  myId: string
  /** The frozen set, in the order it was drawn (deterministic for both). */
  questions: QuizQuestion[]
  myAnswers: Record<string, { selectedAnswer: string; timeSeconds: number }>
  myFinished: boolean
  theirFinished: boolean
  opponentName: string
  expired: boolean
  /** Present once a terminal result exists — both players finished, OR a
   *  forfeit (one side finished, the other lapsed past expiry). While
   *  waiting it stays undefined so the surface shows an honest waiting
   *  state instead of a half-result. */
  result?: DuelResult
}

export type DuelPlayResult = { data: DuelPlayData } | { error: string }

/** The play surface's data: the frozen set + what I've already answered. */
export async function getDuelPlay(duelId: string): Promise<DuelPlayResult> {
  const me = await currentUserId()
  if (!me) return { error: 'Not authenticated' }

  const supabase = me.supabase
  const duel = await fetchDuelById(supabase, duelId)
  // RLS means a non-participant reads null — same honest error.
  if (!duel) return { error: 'Duel not found.' }

  const isChallenger = duel.challenger_id === me.userId
  const myFinished = isChallenger ? !!duel.challenger_finished_at : !!duel.opponent_finished_at
  const theirFinished = isChallenger ? !!duel.opponent_finished_at : !!duel.challenger_finished_at

  const questions = await fetchQuestionsByIds(supabase, duel.question_ids)
  // Deterministic order for BOTH players: the order the set was drawn.
  const byId = new Map(questions.map((q) => [q.id, q]))
  const ordered = duel.question_ids
    .map((id) => byId.get(id))
    .filter((q): q is NonNullable<typeof q> => !!q)

  const answers = await fetchDuelAnswers(supabase, duelId)
  const myAnswers: DuelPlayData['myAnswers'] = {}
  for (const a of answers) {
    if (a.student_id === me.userId) {
      myAnswers[a.question_id] = { selectedAnswer: a.selected_answer, timeSeconds: a.time_spent_seconds ?? 0 }
    }
  }

  const service = createServiceClient()
  const otherId = isChallenger ? duel.opponent_id : duel.challenger_id
  const { data: other } = await service
    .from('profiles')
    .select('full_name')
    .eq('id', otherId)
    .maybeSingle()

  const result = computeDuelResult(duel, answers)

  return {
    data: {
      duel,
      myId: me.userId,
      questions: ordered,
      myAnswers,
      myFinished,
      theirFinished,
      opponentName: other?.full_name || 'Student',
      expired: isDuelExpired(duel),
      // The comparison appears only once a terminal result exists (both
      // finished, or a forfeit) — while waiting it stays undefined so the
      // surface shows an honest waiting state instead of a half-result.
      result: result.complete ? result : undefined,
    },
  }
}

/**
 * Subjects the challenge picker can honestly offer: every college-test
 * subject that currently holds at least one full duel set (DUEL_QUESTION_COUNT
 * published questions). Counts come from the real question bank — a subject
 * the bank can't fill never appears in the picker.
 */
export async function getChallengeableSubjects(): Promise<
  { subjects: { name: string; count: number }[] } | { error: string }
> {
  const me = await currentUserId()
  if (!me) return { error: 'Not authenticated' }

  const counts: { name: string; count: number }[] = []
  for (const subject of DUEL_SUBJECTS) {
    const { count } = await me.supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .eq('subject', subject)
    if (count !== null && count >= DUEL_QUESTION_COUNT) {
      counts.push({ name: subject, count })
    }
  }
  return { subjects: counts }
}

export type SubmitDuelAnswerResult =
  | { error: string }
  | {
      success: true
      /** True when this exact answer was already recorded (retry). */
      alreadyRecorded: boolean
      isCorrect: boolean
      correctAnswer: string | null
    }

/**
 * Record one duel answer. THE real path: correctness is computed server-side
 * by the shared recordAttempt (question_attempts — goal/streak/rank all
 * move), then the duel's own row is upserted with the same pick + time.
 *
 * End-to-end idempotency: the caller passes a client-unique `clientAttemptId`
 * (one per duel question, stable across retries). Both writes key on it —
 * recordAttempt is idempotent by that key (an existing attempt row
 * short-circuits; a unique-violation race reports success), and the duel row
 * is idempotent by its unique (duel, student, question) constraint. So a wifi
 * flicker between the two writes can NEVER double-record: a retry finds the
 * attempt row under the same key (skips recordAttempt) and completes the duel
 * write; a retry after both landed returns alreadyRecorded. No stranded
 * answer, no double count.
 */
export async function submitDuelAnswer(
  duelId: string,
  questionId: string,
  selectedAnswer: string,
  timeSpentSeconds: number | undefined,
  clientAttemptId: string
): Promise<SubmitDuelAnswerResult> {
  const me = await currentUserId()
  if (!me) return { error: 'Not authenticated' }
  if (!(VALID_ANSWERS as readonly string[]).includes(selectedAnswer)) {
    return { error: 'Invalid answer.' }
  }
  if (!clientAttemptId) return { error: 'Missing attempt key.' }

  const supabase = me.supabase
  const duel = await fetchDuelById(supabase, duelId)
  if (!duel) return { error: 'Duel not found.' }
  if (duel.status === 'completed') return { error: 'This duel is already complete.' }
  if (isDuelExpired(duel)) return { error: 'This challenge has expired.' }
  if (!duel.question_ids.includes(questionId)) {
    return { error: 'Question is not part of this duel.' }
  }

  const isChallenger = duel.challenger_id === me.userId
  const myFinished = isChallenger ? duel.challenger_finished_at : duel.opponent_finished_at
  if (myFinished) return { error: 'You already finished this duel.' }

  // Idempotency guard: an already-recorded answer (retry / double-submit)
  // returns success without touching recordAttempt a second time — the row's
  // existence means recordAttempt already succeeded under the same key.
  const existing = await supabase
    .from('duel_answers')
    .select('id, is_correct')
    .eq('duel_id', duelId)
    .eq('student_id', me.userId)
    .eq('question_id', questionId)
    .maybeSingle()
  if (existing.data) {
    return {
      success: true,
      alreadyRecorded: true,
      isCorrect: existing.data.is_correct,
      correctAnswer: null,
    }
  }

  const clamped = clampTime(timeSpentSeconds)

  // 1) The real shared path — session-guarded, correctness server-side,
  //    idempotent under the caller's key (a retry of a half-finished first
  //    attempt short-circuits here instead of recording a second row).
  const recorded = await recordAttempt(questionId, selectedAnswer, clamped ?? undefined, clientAttemptId)
  if ('error' in recorded) return { error: recorded.error }
  if (!recorded.success) return { error: 'Could not record answer.' }

  // 2) The duel's own row (idempotent by the unique constraint).
  const { error: answerError } = await supabase
    .from('duel_answers')
    .upsert(
      {
        duel_id: duelId,
        student_id: me.userId,
        question_id: questionId,
        selected_answer: selectedAnswer,
        is_correct: !!recorded.isCorrect,
        time_spent_seconds: clamped,
      },
      { onConflict: 'duel_id,student_id,question_id', ignoreDuplicates: true }
    )
  if (answerError) return { error: answerError.message }

  // 3) Finish detection: when I've answered all 10, mark my side done; when
  //    both sides are done, complete the duel (the trigger enforces both).
  const mine = await fetchDuelAnswers(supabase, duelId)
  const myCount = mine.filter((a) => a.student_id === me.userId).length
  const myColumn = isChallenger ? 'challenger_finished_at' : 'opponent_finished_at'
  const theirColumn = isChallenger ? 'opponent_finished_at' : 'challenger_finished_at'

  if (myCount >= DUEL_QUESTION_COUNT) {
    const now = new Date().toISOString()
    await supabase.from('duels').update({ [myColumn]: now }).eq('id', duelId)
    const refreshed = await fetchDuelById(supabase, duelId)
    if (refreshed && refreshed[theirColumn]) {
      await supabase.from('duels').update({ status: 'completed' }).eq('id', duelId)
    }
  }

  return {
    success: true,
    alreadyRecorded: false,
    isCorrect: !!recorded.isCorrect,
    correctAnswer: recorded.correctAnswer,
  }
}