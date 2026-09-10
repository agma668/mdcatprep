import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env'

/**
 * Browser Supabase client. Always constructible: the publishable URL and anon
 * key resolve from env vars or the built-in publishable fallbacks in
 * lib/env.ts, so sign-in works on every deployment with zero host config.
 */
export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey())
}

export type BrowserSupabase = ReturnType<typeof createClient>
