import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminEmail } from '@/lib/auth'

/**
 * OAuth return route (Supabase PKCE). After Google consent the browser lands
 * here with ?code= (and, when the student came from a referral link, ?ref=);
 * we exchange the code for a session cookie and route exactly the way login()
 * does — admin emails straight to /admin, everyone else by their profile
 * status (approved → /dashboard, pending → /pending, rejected → /rejected,
 * suspended → /suspended). The handle_new_user trigger has already created
 * the profile as student/pending by the time Google redirects back, so the
 * approval gate holds for Google signups without any new DB logic.
 *
 * Referral attribution travels through the OAuth round-trip as ?ref= (the
 * signup form appends it to the OAuth redirectTo; Supabase preserves the
 * query when appending its code). Only first-time attribution is written —
 * a later Google sign-in can never re-point an already-attributed student.
 *
 * Any failure (no code, rejected consent, exchange error) returns to /login
 * with ?error=google so the form can say what happened instead of silently
 * sitting there.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const refCode = searchParams.get('ref')?.trim() || null
  const requestedExam = searchParams.get('exam_target')?.trim() || null
  const allowedExamTargets = new Set([
    'MDCAT',
    'NUMS',
    'MBBS Notes',
    'HEC Balochistan Scholarship — Pre-Medical',
    'HEC USAT',
    'HEC USAT-M',
    'HEC USAT-E',
    'NUST (NET)',
    'GIKI',
    'LUMS',
    'PMA Long Course',
    'ISSB Intelligence',
  ])
  const examTarget = requestedExam && allowedExamTargets.has(requestedExam) ? requestedExam : null

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Profile reads need the service role. Missing key (a secret, no
        // fallback) must not 500 the callback: allowlisted admins still route
        // to /admin, everyone else routes by the profile-less default
        // (/pending) exactly as login() degrades.
        let profile: { role?: string | null; status?: string | null; referred_by?: string | null; exam_target?: string | null } | null = null
        let service: ReturnType<typeof createServiceClient> | null = null
        try {
          service = createServiceClient()
          const { data } = await service
            .from('profiles')
            .select('role, status, referred_by, exam_target')
            .eq('id', user.id)
            .single()
          profile = data
        } catch {
          service = null
        }

        // A selected preparation path from the signup screen is applied
        // only to a new profile that does not already have a target. A later
        // Google sign-in can never overwrite an existing student's choice.
        if (service && profile && !profile.exam_target && examTarget) {
          const { error: examUpdateError } = await service
            .from('profiles')
            .update({ exam_target: examTarget })
            .eq('id', user.id)
          if (examUpdateError) {
            console.error('Failed to save Google signup exam target:', examUpdateError.message)
          }
        }

        // Allowlist email OR a DB-assigned admin role both route to the
        // admin panel — same rule as login().
        if (isAdminEmail(user.email) || profile?.role === 'admin') {
          return NextResponse.redirect(`${origin}/admin`)
        }

        // Same rule as signup(): resolve the referral code to a referrer and
        // attribute once. Bookkeeping must never break the sign-in flow, and
        // pre-migration databases (no referred_by column) degrade to a log.
        if (service && profile && !profile.referred_by && refCode) {
          try {
            const { data: referrer } = await service
              .from('profiles')
              .select('id')
              .eq('referral_code', refCode.toUpperCase())
              .maybeSingle()
            if (referrer && referrer.id !== user.id) {
              await service
                .from('profiles')
                .update({ referred_by: referrer.id })
                .eq('id', user.id)
            }
          } catch (err) {
            console.error('Referral attribution skipped:', (err as Error).message)
          }
        }

        const destination =
          profile?.status === 'approved'
            ? '/dashboard'
            : profile?.status === 'rejected'
              ? '/rejected'
              : profile?.status === 'suspended'
                ? '/suspended'
                : '/pending'
        return NextResponse.redirect(`${origin}${destination}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=google`)
}
