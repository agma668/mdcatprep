import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  getBuiltinAuthConfig,
  getSupabaseAnonKey,
  getSupabaseUrl,
  isUsingBuiltinAuthFallback,
} from '@/lib/env'

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
 * Always constructible: the publishable URL/anon key resolve from env vars or
 * the built-in publishable fallbacks in lib/env.ts — a deployment can never
 * crash here for missing config (the 2026-09-10 outage signature).
 */
export async function createClient() {
  return build(getSupabaseUrl(), getSupabaseAnonKey())
}

/**
 * Client built from the EMBEDDED publishable pair, used only by the auth
 * self-heal: when the host-configured anon key turns out to be dead (Supabase
 * answers 401 "Invalid API key" — observed live 2026-09-11 with a stale key
 * pasted into the host dashboard), auth actions retry once against the
 * built-in pair. Pointless when the fallback is already active (nothing to
 * heal to), which `canSelfHealAuth()` reports.
 */
export async function createBuiltinClient() {
  const { url, anonKey } = getBuiltinAuthConfig()
  return build(url, anonKey)
}

/** True when a 401 "Invalid API key" should trigger the builtin-pair retry. */
export function canSelfHealAuth() {
  return !isUsingBuiltinAuthFallback()
}
