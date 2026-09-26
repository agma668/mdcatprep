'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'
import { triageFeedback, formatTriagePrefix } from '@/lib/jev'

const MAX_LENGTH = 2000
const MIN_LENGTH = 3

export type SubmitFeedbackResult = { success: true } | { error: string }

/**
 * Saves one piece of feedback. The form only asks for the message itself —
 * the signed-in student's id is captured server-side (not from the form) so
 * admins can see who gave the feedback without the student typing anything.
 * Anonymous visitors submit with a NULL user_id.
 *
 * Jev triage (lib/jev.ts) classifies the message before insert. The contract
 * is fail-open: when triage fails or the key is missing, the row is stored
 * exactly as before — the prefix is appended ONLY on a genuine result, so a
 * missing label never masquerades as a real one.
 */
export async function submitFeedback(
  message: string,
  page?: string
): Promise<SubmitFeedbackResult> {
  const clean = message.trim()

  if (clean.length < MIN_LENGTH) {
    return { error: 'Please write a little more before sending.' }
  }
  if (clean.length > MAX_LENGTH) {
    return { error: `Please keep feedback under ${MAX_LENGTH} characters.` }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const triage = await triageFeedback(clean)
  const stored = triage ? `${formatTriagePrefix(triage)} ${clean}` : clean

  const { error } = await supabase.from('feedback').insert({
    message: stored,
    user_id: user?.id ?? null,
    page: page?.slice(0, 200) || null,
  })

  if (error) {
    console.error('Failed to save feedback:', error.message)
    return { error: 'Something went wrong. Please try again.' }
  }

  return { success: true }
}

export type DeleteFeedbackResult = { success: true } | { error: string }

/** Admin-only: permanently removes one feedback entry. */
export async function deleteFeedback(feedbackId: string): Promise<DeleteFeedbackResult> {
  await requireAdmin()

  const service = createServiceClient()
  const { error } = await service.from('feedback').delete().eq('id', feedbackId)

  if (error) {
    console.error('Failed to delete feedback:', error.message)
    return { error: 'Something went wrong. Please try again.' }
  }

  revalidatePath('/admin/feedback')
  revalidatePath('/admin')
  return { success: true }
}
