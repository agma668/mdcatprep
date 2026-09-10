import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * Returns the current authenticated user's profile (from `profiles`), read
 * with the service role so it never depends on the admin-gated RLS path.
 * Used by student pages (dashboard header/nav) to show the real full_name.
 *
 * Wrapped in React cache() so the dashboard layout and the page body share
 * one fetch per request instead of each paying a separate DB round-trip
 * (each dashboard render used to run this twice).
 */
export const getStudentProfile = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { user: null, profile: null }

  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('id, full_name, email, phone, exam_target, status, role, created_at')
    .eq('id', user.id)
    .single()

  return { user, profile }
})
