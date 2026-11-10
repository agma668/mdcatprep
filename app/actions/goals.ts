'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// Student Prep Space goals (GitHub issue #2).
//
// This is the only application entry point for writing student_goals. It never
// sends exam_id, variant_id or student_id on update: the database revokes those
// columns from authenticated users, so a goal can never be repointed or handed
// to another account even if a client sends extra fields. Ownership is always
// derived from the session, never from the request body.

export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived'

export interface StudentGoal {
  id: string
  examId: string
  examTitle: string
  variantId: string
  variantTitle: string
  targetDate: string | null
  status: GoalStatus
  isPrimary: boolean
  createdAt: string
}

export interface ExamOption {
  id: string
  title: string
  variants: { id: string; title: string }[]
}

type Result = { success: boolean; error?: string }

type GoalRow = {
  id: string
  exam_id: string
  variant_id: string
  target_date: string | null
  status: GoalStatus
  is_primary: boolean
  created_at: string
}

function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
  const msg = (error.message ?? '').toLowerCase()
  return msg.includes('student_goals') && msg.includes('does not exist')
}

function friendlyGoalError(error: { code?: string; message?: string }): string {
  if (error.code === '23505') {
    return 'You already have an active goal for this exam variant, or another primary goal.'
  }
  if (error.code === '42501') {
    return 'That goal can no longer be changed (its exam variant may be retired).'
  }
  return error.message ?? 'Could not save the goal.'
}

/** The signed-in student's goals, primary first. */
export async function getMyGoals(): Promise<StudentGoal[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: goals, error } = await supabase
    .from('student_goals')
    .select('id, exam_id, variant_id, target_date, status, is_primary, created_at')
    .eq('student_id', user.id)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true })
  if (error || !goals) return []

  const rows = goals as GoalRow[]
  if (rows.length === 0) return []

  const variantIds = [...new Set(rows.map((g) => g.variant_id))]
  const examIds = [...new Set(rows.map((g) => g.exam_id))]

  const [{ data: variants }, { data: exams }] = await Promise.all([
    supabase.from('exam_variants').select('id, title').in('id', variantIds),
    supabase.from('exam_registry').select('id, title').in('id', examIds),
  ])

  const variantTitle = new Map(
    ((variants ?? []) as { id: string; title: string }[]).map((v) => [v.id, v.title])
  )
  const examTitle = new Map(
    ((exams ?? []) as { id: string; title: string }[]).map((e) => [e.id, e.title])
  )

  return rows.map((g) => ({
    id: g.id,
    examId: g.exam_id,
    examTitle: examTitle.get(g.exam_id) ?? g.exam_id,
    variantId: g.variant_id,
    variantTitle: variantTitle.get(g.variant_id) ?? g.variant_id,
    targetDate: g.target_date,
    status: g.status,
    isPrimary: g.is_primary,
    createdAt: g.created_at,
  }))
}

/** Active exams and their active variants, for the goal picker. */
export async function getAvailableExams(): Promise<ExamOption[]> {
  const supabase = await createClient()
  const { data: exams } = await supabase
    .from('exam_registry')
    .select('id, title')
    .eq('status', 'active')
    .order('title', { ascending: true })
  if (!exams) return []

  const { data: variants } = await supabase
    .from('exam_variants')
    .select('id, exam_id, title')
    .eq('status', 'active')
    .order('title', { ascending: true })

  const byExam = new Map<string, { id: string; title: string }[]>()
  for (const v of (variants ?? []) as { id: string; exam_id: string; title: string }[]) {
    const list = byExam.get(v.exam_id) ?? []
    list.push({ id: v.id, title: v.title })
    byExam.set(v.exam_id, list)
  }

  return (exams as { id: string; title: string }[])
    .map((e) => ({ id: e.id, title: e.title, variants: byExam.get(e.id) ?? [] }))
    .filter((e) => e.variants.length > 0)
}

/**
 * Create a goal for the signed-in student. The first active goal becomes
 * primary; otherwise the student chooses explicitly via setPrimaryGoal.
 */
export async function createStudentGoal(input: {
  examId: string
  variantId: string
  targetDate?: string | null
}): Promise<Result & { goalId?: string }> {
  const examId = input.examId.trim()
  const variantId = input.variantId.trim()
  if (!examId || !variantId) return { success: false, error: 'Choose an exam and variant.' }

  const targetDate = input.targetDate?.trim() || null
  if (targetDate && !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    return { success: false, error: 'Target date must be YYYY-MM-DD.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Verify the variant really belongs to the exam and is active. RLS enforces
  // this too; the check produces a clear message instead of a policy error.
  const { data: variant } = await supabase
    .from('exam_variants')
    .select('id')
    .eq('id', variantId)
    .eq('exam_id', examId)
    .eq('status', 'active')
    .maybeSingle()
  if (!variant) return { success: false, error: 'That exam variant is not available.' }

  const { count } = await supabase
    .from('student_goals')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .eq('status', 'active')
  const isFirstActive = (count ?? 0) === 0

  const { data, error } = await supabase
    .from('student_goals')
    .insert({
      student_id: user.id,
      exam_id: examId,
      variant_id: variantId,
      target_date: targetDate,
      status: 'active',
      is_primary: isFirstActive,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: friendlyGoalError(error) }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/goals')
  return { success: true, goalId: (data as { id: string }).id }
}

/** Change only target date or lifecycle status. Identity is never writable. */
export async function updateStudentGoal(
  goalId: string,
  patch: { targetDate?: string | null; status?: GoalStatus }
): Promise<Result> {
  const update: { target_date?: string | null; status?: GoalStatus } = {}

  if (patch.targetDate !== undefined) {
    const targetDate = patch.targetDate?.trim() || null
    if (targetDate && !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      return { success: false, error: 'Target date must be YYYY-MM-DD.' }
    }
    update.target_date = targetDate
  }

  if (patch.status !== undefined) {
    if (!['active', 'paused', 'completed', 'archived'].includes(patch.status)) {
      return { success: false, error: 'Unknown goal status.' }
    }
    update.status = patch.status
  }

  if (Object.keys(update).length === 0) return { success: false, error: 'Nothing to update.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('student_goals')
    .update(update)
    .eq('id', goalId)
    .eq('student_id', user.id)
  if (error) {
    if (isMissingTable(error)) {
      return { success: false, error: 'Goals are not enabled on this database yet.' }
    }
    return { success: false, error: friendlyGoalError(error) }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/goals')
  return { success: true }
}

/** Atomically make one active goal primary (clears the previous primary). */
export async function setPrimaryGoal(goalId: string): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase.rpc('set_primary_goal', { p_goal_id: goalId })
  if (error) {
    if (error.code === 'P0002') return { success: false, error: 'That goal is not active.' }
    return { success: false, error: friendlyGoalError(error) }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/goals')
  return { success: true }
}

/** Archive (never delete) a goal, preserving its history. */
export async function archiveGoal(goalId: string): Promise<Result> {
  return updateStudentGoal(goalId, { status: 'archived' })
}
