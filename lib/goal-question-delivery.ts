import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * Goal-scoped question delivery.
 *
 * This first slice intentionally serves ONLY reviewed public_sample mappings.
 * goal_access is denied until a real entitlement resolver exists. The mapping
 * table is queried with the service role only after the caller's identity and
 * active goal have been verified with the cookie-bound RLS client.
 *
 * Keep this module server-only. Never return correct_answer or explanation in
 * the initial question DTO.
 */

import {
  isDeliverablePublicSampleMapping,
  toSafeGoalQuestion,
  type GoalScope,
  type QuestionMapping,
  type QuestionRecord,
  type SafeGoalQuestion,
} from '@/lib/goal-question-policy'

export type GoalQuestionSet = {
  goalId: string
  examId: string
  variantId: string
  questions: SafeGoalQuestion[]
}

async function resolveOwnedActiveGoal(goalId: string): Promise<GoalScope | null> {
  if (!goalId || goalId.length > 100) return null

  const session = await createClient()
  const { data: { user }, error: authError } = await session.auth.getUser()
  if (authError || !user) return null

  const { data, error } = await session
    .from('student_goals')
    .select('id, student_id, exam_id, variant_id, status')
    .eq('id', goalId)
    .eq('student_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (error || !data) return null
  return data as GoalScope
}

async function isActiveExamVariant(
  service: ReturnType<typeof createServiceClient>,
  goal: GoalScope
): Promise<boolean> {
  const [{ data: exam, error: examError }, { data: variant, error: variantError }] = await Promise.all([
    service.from('exam_registry').select('id').eq('id', goal.exam_id).eq('status', 'active').maybeSingle(),
    service.from('exam_variants').select('id').eq('id', goal.variant_id).eq('exam_id', goal.exam_id).eq('status', 'active').maybeSingle(),
  ])
  return !examError && !!exam && !variantError && !!variant
}

/**
 * Fetch only published questions explicitly mapped to this active goal's
 * exact exam + variant and approved as public samples. Paid/goal_access content
 * is deliberately unavailable until entitlement enforcement is implemented.
 */
export async function fetchGoalPublicSampleQuestions(
  goalId: string,
  requestedLimit = 20
): Promise<GoalQuestionSet | null> {
  const goal = await resolveOwnedActiveGoal(goalId)
  if (!goal) return null

  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.floor(requestedLimit), 1), 50)
    : 20

  try {
    const service = createServiceClient()
    if (!(await isActiveExamVariant(service, goal))) return null
    const { data: mappings, error: mappingError } = await service
      .from('question_exam_map')
      .select('question_id, exam_id, variant_id, access_level, review_state')
      .eq('exam_id', goal.exam_id)
      .eq('variant_id', goal.variant_id)
      .eq('access_level', 'public_sample')
      .eq('review_state', 'approved')
      .limit(250)

    if (mappingError || !mappings?.length) return null

    const approvedIds = (mappings as QuestionMapping[])
      .filter((mapping) => isDeliverablePublicSampleMapping(mapping, goal))
      .map((mapping) => mapping.question_id)

    if (!approvedIds.length) {
      return { goalId: goal.id, examId: goal.exam_id, variantId: goal.variant_id, questions: [] }
    }

    const { data: rows, error: questionError } = await service
      .from('questions')
      .select('id, subject, topic, question_text, option_a, option_b, option_c, option_d, difficulty, college')
      .eq('status', 'published')
      .in('id', approvedIds)
      .limit(limit)

    if (questionError || !rows) return null

    return {
      goalId: goal.id,
      examId: goal.exam_id,
      variantId: goal.variant_id,
      questions: (rows as QuestionRecord[]).map(toSafeGoalQuestion),
    }
  } catch {
    // Missing service credentials or an unavailable privileged query must fail closed.
    return null
  }
}

/**
 * Resolve a single answer only after an authenticated server action asks for
 * it. The caller must still validate the selected answer and record the
 * attempt; this helper never writes progress or returns data to a client by
 * itself. Only approved public_sample mappings are accepted in this slice.
 */
export async function getGoalPublicSampleAnswer(
  goalId: string,
  questionId: string
): Promise<{ questionId: string; correctAnswer: string; explanation: string | null } | null> {
  if (!questionId || questionId.length > 100) return null

  const goal = await resolveOwnedActiveGoal(goalId)
  if (!goal) return null

  try {
    const service = createServiceClient()
    const { data: mappings, error: mappingError } = await service
      .from('question_exam_map')
      .select('question_id, exam_id, variant_id, access_level, review_state')
      .eq('question_id', questionId)
      .eq('exam_id', goal.exam_id)
      .eq('variant_id', goal.variant_id)
      .eq('access_level', 'public_sample')
      .eq('review_state', 'approved')
      .limit(1)

    const mapping = (mappings?.[0] ?? null) as QuestionMapping | null
    if (mappingError || !mapping || !isDeliverablePublicSampleMapping(mapping, goal)) return null

    const { data: question, error: questionError } = await service
      .from('questions')
      .select('id, status, correct_answer, explanation')
      .eq('id', questionId)
      .eq('status', 'published')
      .maybeSingle()

    if (questionError || !question?.correct_answer) return null

    return {
      questionId: question.id,
      correctAnswer: question.correct_answer,
      explanation: question.explanation ?? null,
    }
  } catch {
    return null
  }
}
