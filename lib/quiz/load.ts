import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { fetchPublishedQuestions } from '@/lib/questions-repo'
import type { QuizQuestion } from '@/lib/questions'
import {
  buildQuizPlan,
  selectQuestionsForPlan,
  type Availability,
  type PlannedSection,
  type QuestionPoolItem,
  type QuizPlan,
} from './blueprint'
import { getVerifiedBlueprint } from './registry'

export interface BlueprintQuiz {
  plan: QuizPlan
  questions: QuizQuestion[]
  shortfall: PlannedSection[]
}

/**
 * Build a quiz for a verified blueprint from the published bank.
 *
 * Only verified blueprints resolve (getVerifiedBlueprint returns null
 * otherwise), so a crafted URL can never present an unverified pattern as an
 * exam simulation. Questions are selected deterministically and never reused
 * across sections.
 */
export async function loadBlueprintQuiz(
  blueprintId: string,
  total: number
): Promise<BlueprintQuiz | null> {
  const blueprint = getVerifiedBlueprint(blueprintId)
  if (!blueprint) return null

  const supabase = await createClient()

  // Fetch each section's subject once, keeping the full question bodies so the
  // selected ids can be rendered without a second round-trip.
  const questionById = new Map<string, QuizQuestion>()
  const pool: QuestionPoolItem[] = []
  for (const section of blueprint.sections) {
    const rows = await fetchPublishedQuestions(supabase, { subject: section.subject })
    for (const q of rows) {
      if (!q.id || questionById.has(q.id)) continue
      questionById.set(q.id, q)
      pool.push({ id: q.id, subject: q.subject, topic: q.topic })
    }
  }

  const availability: Availability = {}
  for (const item of pool) {
    availability[item.subject] = (availability[item.subject] ?? 0) + 1
  }

  const plan = buildQuizPlan(blueprint, total, availability)
  const { ids, shortfall } = selectQuestionsForPlan(plan, pool)
  const questions = ids.map((id) => questionById.get(id)).filter((q): q is QuizQuestion => Boolean(q))

  return { plan, questions, shortfall }
}
