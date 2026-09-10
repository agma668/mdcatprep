'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminEmail } from '@/lib/auth'
import { sendEnrollmentEmail } from '@/lib/email'
import { getSiteUrl } from '@/lib/site'

export async function login(formData: FormData) {
  try {
    return await performLogin(formData)
  } catch (err) {
    // A thrown misconfiguration (missing env) or unreachable Supabase must
    // reach the student as a form message — never as a hung button or a 500.
    console.error('login failed:', err)
    return {
      error:
        'Sign-in is temporarily unavailable — the server could not reach its database. Please try again shortly.',
    }
  }
}

async function performLogin(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  // The destination is RETURNED, never redirected server-side: a server-action
  // redirect-response can fail to drive the client router when a session
  // already exists (observed live: signing in from a stale /login left the
  // button on "Signing in..." forever, no navigation, no error). Returning the
  // target lets the form navigate explicitly with router.replace — middleware
  // still enforces every gate on that navigation, so nothing is weakened.

  // Admin emails always bypass the student approval gate and go straight to /admin.
  if (isAdminEmail(authData.user.email)) {
    revalidatePath('/admin', 'layout')
    return { success: true, redirectTo: '/admin' }
  }

  // Read the student's profile with the service role. The anon/RLS path is
  // admin-gated in the live DB and must not decide student access. When the
  // deployment is missing the service key (a secret, no fallback), degrade to
  // "pending" instead of 500ing — the password check above already succeeded.
  let profile: { role?: string | null; status?: string | null } | null = null
  try {
    const adminSupabase = createServiceClient()
    const { data } = await adminSupabase
      .from('profiles')
      .select('role, status')
      .eq('id', authData.user.id)
      .single()
    profile = data
  } catch {
    profile = null
  }

  // DB-assigned admins route to the admin panel too (the allowlist above is
  // the fallback; the profiles.role column is the source of truth the
  // middleware gate also honors).
  if (profile?.role === 'admin') {
    revalidatePath('/admin', 'layout')
    return { success: true, redirectTo: '/admin' }
  }

  // The real gate is admin payment approval. Pending (or missing) students go
  // to the pending page; rejected students to the rejected page; suspended
  // students to the suspended page.
  if (!profile || profile.status !== 'approved') {
    return {
      success: true,
      redirectTo:
        profile?.status === 'rejected'
          ? '/rejected'
          : profile?.status === 'suspended'
            ? '/suspended'
            : '/pending',
    }
  }

  revalidatePath('/dashboard', 'layout')
  return { success: true, redirectTo: '/dashboard' }
}

export async function signup(formData: FormData) {
  const email = (formData.get('email') as string)?.trim() || ''
  const password = (formData.get('password') as string) || ''
  const full_name = (formData.get('full_name') as string)?.trim() || ''
  const phone = (formData.get('phone') as string)?.trim() || null
  const exam_target = (formData.get('exam_target') as string)?.trim() || null
  // Referral attribution (auto-counted — no manual tallying anywhere).
  const refCode = (formData.get('ref') as string)?.trim() || null

  // Server-side validation — the browser is not the security boundary
  // (observed live: a one-character password was accepted end-to-end).
  if (!full_name) return { error: 'Please enter your full name.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters long.' }

  let adminSupabase: ReturnType<typeof createServiceClient>
  try {
    adminSupabase = createServiceClient()
  } catch {
    return {
      error:
        'Signup is temporarily unavailable — the server is missing its database configuration. Please contact the site owner.',
    }
  }

  // Create the auth user directly with the service role and mark the email as
  // confirmed, so signup never depends on confirmation-email delivery (which
  // is currently failing in the Supabase project). The real access gate is
  // admin payment approval. Password login still works normally.
  const { data: authData, error } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, phone, exam_target },
  })

  if (error) {
    return { error: error.message }
  }

  if (!authData.user) {
    return { error: 'Could not create account. Please try again.' }
  }

  const isAdmin = isAdminEmail(email)

  // The signup trigger creates the profile as student/pending. Fill in the
  // enrollment fields the trigger does not set, and promote admin emails.
  const { error: updateError } = await adminSupabase
    .from('profiles')
    .update(
      isAdmin
        ? { role: 'admin', status: 'approved', phone, exam_target }
        : { phone, exam_target }
    )
    .eq('id', authData.user.id)

  if (updateError) {
    // Not fatal: the profile still exists (student/pending) from the trigger,
    // and admin emails bypass approval checks in login and middleware anyway.
    console.error('Failed to update profile after signup:', updateError.message)
  }

  // Attribute the referral: the new student points back at whoever shared
  // their link. Counting + the 10-referral auto-approval happen entirely in
  // the database (see 20260903000003_referral_signup_count.sql) the moment
  // this attribution lands — a signup counts immediately, never manually.
  if (!isAdmin && refCode) {
    try {
      const { data: referrer } = await adminSupabase
        .from('profiles')
        .select('id')
        .eq('referral_code', refCode.toUpperCase())
        .maybeSingle()
      if (referrer && referrer.id !== authData.user.id) {
        await adminSupabase.from('profiles').update({ referred_by: referrer.id }).eq('id', authData.user.id)
      }
    } catch (err) {
      // Referral columns may not exist yet (pre-migration) — the signup must
      // never fail because of attribution bookkeeping.
      console.error('Referral attribution skipped:', (err as Error).message)
    }
  }

  // Notify the admin about a new student application.
  if (!isAdmin) {
    await sendEnrollmentEmail({ student_name: full_name, phone, exam_target, email })
  }

  return {
    success: true,
    message: isAdmin
      ? 'Signup successful. You can now log in to the admin panel.'
      // Honest about the process: activation is a manual admin approval, and
      // no email is sent (EmailJS/Resend vars are unset) — the student checks
      // their status by logging in.
      : 'Signup successful. Your application is under review — once an admin approves it you can log in and start preparing. No email is sent; check your status by signing in.',
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function deleteAccount() {
  // Permanently deletes the signed-in student: auth user + profile + every
  // cascade-wired row (attempts, quiz sessions, push subscriptions). Notes
  // they uploaded lose their author link (on delete set null) and feedback
  // keeps no pointer to them. The database is wired so one admin.deleteUser
  // call is a complete erasure — verified across the migrations.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You are not signed in.' }

  // Never delete an admin account through this student flow.
  if (isAdminEmail(user.email)) {
    return { error: 'Admin accounts cannot be deleted from the profile page.' }
  }

  const adminSupabase = createServiceClient()
  const { error } = await adminSupabase.auth.admin.deleteUser(user.id)
  if (error) return { error: error.message }

  await supabase.auth.signOut().catch(() => {})
  redirect('/account-deleted')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email) return { error: 'Enter your email address.' }

  const origin = getSiteUrl()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }
  if (password !== confirm) {
    return { error: 'Passwords do not match.' }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }
  return { success: true }
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const full_name = (formData.get('full_name') as string)?.trim().slice(0, 200)
  const phone = (formData.get('phone') as string)?.trim().slice(0, 50) || null
  const exam_target = (formData.get('exam_target') as string)?.trim().slice(0, 200) || null

  if (!full_name) return { error: 'Full name is required.' }

  const adminSupabase = createServiceClient()
  const { error } = await adminSupabase
    .from('profiles')
    .update({ full_name, phone, exam_target })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/analytics')
  return { success: true, message: 'Profile updated.' }
}
