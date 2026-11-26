'use server'

// Two per-question actions the player could not do before:
//
//   saveQuestionAsCard  one tap turns the question in front of you — right or
//                       wrong — into a review card (front: the stem; back: the
//                       keyed answer plus the written rationale). Saved cards
//                       live in the same review_flashcards table the mistake
//                       notebook writes to, so they schedule like every other
//                       card instead of sitting in a second, dead list.
//   reportQuestion      a wrong key, a typo or a missing figure goes to a human,
//                       with a receipt. It writes to the existing `feedback`
//                       table so admin triage needs no new surface.
//
// Both are idempotent enough to survive a double tap: the card insert checks
// for an existing row first, and a repeated report is just a second message.

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { REPORT_REASONS } from '@/lib/question-reports'

/** Long enough for a real stem and a real explanation, short enough to cap abuse. */
const MAX_CARD_FIELD = 1600
const MAX_REPORT_DETAIL = 400
const MAX_PROMPT_IN_REPORT = 300

export type SaveCardInput = {
  /** DB id when the question came from the bank; null for bundled questions. */
  questionId?: string | null
  front: string
  back: string
  subject?: string | null
  topic?: string | null
}

export type SaveCardResult =
  | { success: true; alreadyExisted: boolean }
  | { error: string; needsAuth?: boolean }

export async function saveQuestionAsCard(input: SaveCardInput): Promise<SaveCardResult> {
  const front = (input.front ?? '').trim().slice(0, MAX_CARD_FIELD)
  const back = (input.back ?? '').trim().slice(0, MAX_CARD_FIELD)
  if (front.length < 5) return { error: 'There is no question text to make a card from.' }
  if (back.length < 2) return { error: 'This question has no answer to put on the back.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // Guests are told the truth rather than shown a silent no-op: nothing is
  // written for them anywhere in this app (see lib/offline-sync.ts).
  if (!user) return { error: 'Sign in to keep this card.', needsAuth: true }

  // One card per source question. Bundled questions have no row id, so their
  // identity is the stem itself.
  const existingQuery = supabase
    .from('review_flashcards')
    .select('id')
    .eq('student_id', user.id)
  const { data: existing } = input.questionId
    ? await existingQuery.eq('source_question_id', input.questionId).maybeSingle()
    : await existingQuery.eq('front', front).maybeSingle()
  if (existing?.id) return { success: true, alreadyExisted: true }

  const { error } = await supabase.from('review_flashcards').insert({
    student_id: user.id,
    source_question_id: input.questionId ?? null,
    subject: input.subject?.slice(0, 80) ?? null,
    topic: input.topic?.slice(0, 120) ?? null,
    front,
    back,
  })
  if (error) {
    console.error('Could not save question card:', error.message)
    return { error: 'Could not save the card. Try again in a moment.' }
  }

  revalidatePath('/dashboard/flashcards')
  return { success: true, alreadyExisted: false }
}

export type ReportInput = {
  questionId?: string | null
  prompt: string
  subject?: string | null
  page?: string | null
  reason: string
  detail?: string
}

export type ReportResult = { success: true } | { error: string }

export async function reportQuestion(input: ReportInput): Promise<ReportResult> {
  const reason = REPORT_REASONS.find((r) => r === input.reason)
  if (!reason) return { error: 'Pick a reason first.' }

  const prompt = (input.prompt ?? '').trim().slice(0, MAX_PROMPT_IN_REPORT)
  if (prompt.length < 5) return { error: 'This question has no text to report.' }
  const detail = (input.detail ?? '').trim().slice(0, MAX_REPORT_DETAIL)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Structured into the one line an admin already reads in /admin/feedback,
  // with the id kept intact so the question can be found and fixed.
  const message = [
    `[Question report] ${reason}`,
    `Question: ${prompt}`,
    input.questionId ? `Question id: ${input.questionId}` : 'Bundled question (no bank id)',
    input.subject ? `Subject: ${input.subject}` : null,
    detail ? `Note: ${detail}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const { error } = await supabase.from('feedback').insert({
    message,
    user_id: user?.id ?? null,
    page: (input.page ?? '/practice/session').slice(0, 200),
  })
  if (error) {
    console.error('Could not save question report:', error.message)
    return { error: 'Could not send the report. Try again in a moment.' }
  }
  return { success: true }
}
