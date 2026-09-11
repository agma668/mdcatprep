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
 *
 * Key-name tolerance: hosts end up with either the legacy or the newer
 * Supabase secret-key name. A PUBLISHABLE key pasted into the secret slot is
 * detected up front (via the JWT `role` claim) and rejected with copy that
 * names the actual mistake — otherwise every service call would fail with an
 * opaque gateway "Invalid API key" that looks identical to a stale value.
 */
export function createServiceClient() {
  const url = getSupabaseUrl()
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim()

  if (!url || !serviceKey) {
    throw new Error(
      'Supabase service role is not configured on this deployment: SUPABASE_SERVICE_ROLE_KEY is missing (set it in the host dashboard, then rebuild).'
    )
  }

  const role = serviceKeyJwtRole(serviceKey)
  if (role && role !== 'service_role') {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY holds a "${role}" key — that is the publishable value. Copy the service_role secret from Supabase → Project Settings → API instead.`
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

/** Role claim of a JWT-style key, or null (new-style opaque secret key). */
function serviceKeyJwtRole(key: string): string | null {
  try {
    const payload = key.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4))
    const role = JSON.parse(json)?.role
    return typeof role === 'string' && role ? role : null
  } catch {
    return null
  }
}
