import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env'

/**
 * Server (RLS, cookie-bound) Supabase client.
 *
 * Throws a descriptive error when the deployment is missing its env vars —
 * deliberately NOT a null return, so the 100+ call sites keep their types
 * and behavior. Public readers (daily quiz, public stats) already wrap this
 * in try/catch and degrade to fallbacks; protected pages sit behind the
 * proxy, which fails closed to /login. The old form was a `!` assertion that
 * crashed with "supabaseUrl is required" far from the cause.
 */
export async function createClient() {
  const url = getSupabaseUrl()
  const anonKey = getSupabaseAnonKey()
  if (!url || !anonKey) {
    throw new Error(
      'Supabase is not configured on this deployment: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are missing (set them in the host dashboard, then rebuild).'
    )
  }

  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
