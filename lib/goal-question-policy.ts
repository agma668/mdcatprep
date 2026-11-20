export type GoalScope = {
  id: string
  student_id: string
  exam_id: string
  variant_id: string
  status: string
}

export type QuestionMapping = {
  question_id: string
  exam_id: string
  variant_id: string
  access_level: string
  review_state: string
}

export type QuestionRecord = {
  id: string
  subject: string | null
  topic: string | null
  question_text: string | null
  option_a: string | null
  option_b: string | null
  option_c: string | null
  option_d: string | null
  correct_answer?: string | null
  explanation?: string | null
  difficulty: string | null
  college: string | null
}

export type SafeGoalQuestion = Omit<QuestionRecord, 'correct_answer' | 'explanation'>

/** Paid mappings intentionally fail closed until entitlement checks exist. */
export function isDeliverablePublicSampleMapping(
  mapping: QuestionMapping,
  goal: GoalScope
): boolean {
  return goal.status === 'active'
    && mapping.exam_id === goal.exam_id
    && mapping.variant_id === goal.variant_id
    && mapping.access_level === 'public_sample'
    && mapping.review_state === 'approved'
}

/** Explicit allow-list DTO: answer keys and explanations never cross this boundary. */
export function toSafeGoalQuestion(row: QuestionRecord): SafeGoalQuestion {
  return {
    id: row.id,
    subject: row.subject,
    topic: row.topic,
    question_text: row.question_text,
    option_a: row.option_a,
    option_b: row.option_b,
    option_c: row.option_c,
    option_d: row.option_d,
    difficulty: row.difficulty,
    college: row.college,
  }
}
