'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'
import { sendStudentStatusEmail } from '@/lib/email'

// Service-role client for admin mutations. IMPORTANT: it must NOT carry the
// caller's session cookies — if supabase-js finds a session it sends the
// user's access token (role `authenticated`) and the profiles RLS gate
// (is_admin) applies. createServiceClient() passes empty cookies, so requests
// go out with the service key and bypass RLS.

// Admin identity is verified centrally in lib/admin-auth.ts (allowlisted
// email, no profiles/RLS dependency).

export async function approveStudent(studentId: string) {
  await requireAdmin()
  const adminClient = createServiceClient()

  // 1. Update status
  const { error } = await adminClient
    .from('profiles')
    .update({ status: 'approved' })
    .eq('id', studentId)

  if (error) return { error: error.message }

  // 2. Notify the student via EmailJS (server-side)
  const { data: profile } = await adminClient
    .from('profiles')
    .select('email, full_name')
    .eq('id', studentId)
    .single()

  if (profile?.email) {
    await sendStudentStatusEmail({
      student_name: profile.full_name || '',
      email: profile.email,
      status: 'approved',
    })
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function rejectStudent(studentId: string) {
  await requireAdmin()
  const adminClient = createServiceClient()

  const { error } = await adminClient
    .from('profiles')
    .update({ status: 'rejected' })
    .eq('id', studentId)

  if (error) return { error: error.message }

  // Notify the student via EmailJS (server-side)
  const { data: profile } = await adminClient
    .from('profiles')
    .select('email, full_name')
    .eq('id', studentId)
    .single()

  if (profile?.email) {
    await sendStudentStatusEmail({
      student_name: profile.full_name || '',
      email: profile.email,
      status: 'rejected',
    })
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function suspendStudent(studentId: string) {
  await requireAdmin()
  const adminClient = createServiceClient()

  const { error } = await adminClient
    .from('profiles')
    .update({ status: 'suspended' })
    .eq('id', studentId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function unsuspendStudent(studentId: string) {
  await requireAdmin()
  const adminClient = createServiceClient()

  // Unsuspending restores normal access — status goes back to approved.
  const { error } = await adminClient
    .from('profiles')
    .update({ status: 'approved' })
    .eq('id', studentId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function removeStudent(studentId: string) {
  await requireAdmin()
  const adminClient = createServiceClient()

  // Deleting the auth user cascades to the profile row (FK on delete cascade).
  const { error } = await adminClient.auth.admin.deleteUser(studentId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}
