import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env'

/**
 * Browser Supabase client. Returns null instead of crashing when the
 * deployment is missing its public env vars (they are inlined at build time,
 * so a rebuild after adding them is also required) — callers show an honest
 * "not configured" message rather than throwing deep inside @supabase/ssr.
 */
export function createClient() {
  const url = getSupabaseUrl()
  const anonKey = getSupabaseAnonKey()
  if (!url || !anonKey) return null
  return createBrowserClient(url, anonKey)
}

type BrowserSupabase = NonNullable<ReturnType<typeof createClient>>
export type { BrowserSupabase }
