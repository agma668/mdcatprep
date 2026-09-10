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

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const service = createServiceClient()
        const { data: profile } = await service
          .from('profiles')
          .select('status, referred_by')
          .eq('id', user.id)
          .single()

        if (isAdminEmail(user.email)) {
          return NextResponse.redirect(`${origin}/admin`)
        }

        // Same rule as signup(): resolve the referral code to a referrer and
        // attribute once. Bookkeeping must never break the sign-in flow, and
        // pre-migration databases (no referred_by column) degrade to a log.
        if (profile && !profile.referred_by && refCode) {
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
