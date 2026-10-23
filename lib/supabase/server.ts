import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env'

async function build(url: string, anonKey: string) {
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

/**
 * Server (RLS, cookie-bound) Supabase client.
 *
 * Resolves from env vars only — no embedded fallback project (removed
 * 2026-10-23; a missing/broken host config throws lib/env.ts's descriptive
 * error instead of silently pointing at the previous owner's Supabase).
 */
export async function createClient() {
  return build(getSupabaseUrl(), getSupabaseAnonKey())
}

