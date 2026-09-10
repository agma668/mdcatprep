import { createServerClient } from '@supabase/ssr'
import { getSupabaseUrl } from '@/lib/env'

/**
 * Service-role client that bypasses RLS. Server-side only — never expose it
 * to the client.
 *
 * Throws a descriptive error when the deployment is missing its env vars —
 * deliberately NOT a null return, so call sites keep their types. Public
 * readers (landing stats, daily quiz) already wrap this in try/catch and
 * render fallbacks; everything else sits behind auth gates. The old form was
 * a `!` assertion that crashed with "supabaseUrl is required" far from the
 * cause.
 */
export function createServiceClient() {
  const url = getSupabaseUrl()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throw new Error(
      'Supabase is not configured on this deployment: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are missing (set them in the host dashboard, then rebuild).'
    )
  }

  return createServerClient(url, serviceKey, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {
        // Service-role operations don't touch user cookies.
      },
    },
  })
}
