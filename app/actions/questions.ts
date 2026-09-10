'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'
import { cleanString } from '@/lib/utils'

const VALID_ANSWERS = ['A', 'B', 'C', 'D'] as const
const VALID_STATUSES = ['draft', 'published', 'archived'] as const

export type QuestionInput = {
  subject: string
  topic: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  explanation: string
  difficulty: string
  college: string
}

function parseQuestionForm(formData: FormData): QuestionInput {
  const input: QuestionInput = {
    subject: cleanString(formData.get('subject'), 100),
    topic: cleanString(formData.get('topic'), 100),
    question_text: cleanString(formData.get('question_text'), 2000),
    option_a: cleanString(formData.get('option_a'), 500),
    option_b: cleanString(formData.get('option_b'), 500),
    option_c: cleanString(formData.get('option_c'), 500),
    option_d: cleanString(formData.get('option_d'), 500),
    correct_answer: cleanString(formData.get('correct_answer'), 10).toUpperCase(),
    explanation: cleanString(formData.get('explanation'), 2000),
    difficulty: cleanString(formData.get('difficulty'), 50),
    college: cleanString(formData.get('college'), 100),
  }
  return input
}

function validateQuestion(input: QuestionInput): string | null {
  if (!input.question_text) return 'Question text is required.'
  if (!input.subject) return 'Subject is required.'
  if (!input.option_a || !input.option_b) return 'Options A and B are required.'
  if (!(VALID_ANSWERS as readonly string[]).includes(input.correct_answer)) {
    return 'Correct answer must be A, B, C, or D.'
  }
  return null
}

export async function createQuestion(
  formData: FormData,
  status: 'draft' | 'published' = 'draft'
) {
  await requireAdmin()
  const input = parseQuestionForm(formData)
  const validationError = validateQuestion(input)
  if (validationError) return { error: validationError }
  if (!(VALID_STATUSES as readonly string[]).includes(status)) {
    return { error: 'Invalid status.' }
  }

  const service = createServiceClient()
  const { error } = await service.from('questions').insert({
    ...input,
    topic: input.topic || null,
    option_c: input.option_c || null,
    option_d: input.option_d || null,
    explanation: input.explanation || null,
    difficulty: input.difficulty || null,
    college: input.college || null,
    status,
    source: 'admin',
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/questions')
  return { success: true, message: status === 'published' ? 'Question created and published.' : 'Question saved as draft.' }
}

export async function updateQuestion(questionId: string, formData: FormData) {
  await requireAdmin()
  const input = parseQuestionForm(formData)
  const validationError = validateQuestion(input)
  if (validationError) return { error: validationError }

  const service = createServiceClient()
  const { error } = await service
    .from('questions')
    .update({
      ...input,
      topic: input.topic || null,
      option_c: input.option_c || null,
      option_d: input.option_d || null,
      explanation: input.explanation || null,
      difficulty: input.difficulty || null,
      college: input.college || null,
    })
    .eq('id', questionId)

  if (error) return { error: error.message }

  revalidatePath('/admin/questions')
  return { success: true, message: 'Question updated.' }
}

export async function setQuestionStatus(questionId: string, status: string) {
  await requireAdmin()
  if (!(VALID_STATUSES as readonly string[]).includes(status)) {
    return { error: 'Invalid status.' }
  }

  const service = createServiceClient()
  const { error } = await service
    .from('questions')
    .update({ status })
    .eq('id', questionId)

  if (error) return { error: error.message }

  revalidatePath('/admin/questions')
  revalidatePath('/dashboard/practice')
  return { success: true }
}

export async function deleteQuestion(questionId: string) {
  await requireAdmin()

  const service = createServiceClient()
  const { error } = await service.from('questions').delete().eq('id', questionId)
  if (error) return { error: error.message }

  revalidatePath('/admin/questions')
  revalidatePath('/dashboard/practice')
  return { success: true }
}
