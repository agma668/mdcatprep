import { createServerClient } from '@supabase/ssr'
import { getSupabaseUrl } from '@/lib/env'

/**
 * Service-role client that bypasses RLS. Server-side only — never expose it
 * to the client.
 *
 * The service-role key is a REAL SECRET and cannot be embedded as a fallback
 * (unlike the publishable URL/anon pair in lib/env.ts), so this still throws
 * a descriptive error when the deployment lacks it. Call sites keep their
 * types; guarded readers degrade gracefully; unguarded ones are wrapped by
 * the calling action's try/catch so students get an honest message instead
 * of a 500.
 */
export function createServiceClient() {
  const url = getSupabaseUrl()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throw new Error(
      'Supabase service role is not configured on this deployment: SUPABASE_SERVICE_ROLE_KEY is missing (set it in the host dashboard, then rebuild).'
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
