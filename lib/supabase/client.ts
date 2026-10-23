import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env'

/**
 * Browser Supabase client.
 *
 * The publishable URL/anon key resolve from env vars ONLY — no embedded
 * fallback project (removed 2026-10-23). When the host config is missing or
 * mismatched, lib/env.ts throws its descriptive error here, surfacing as a
 * visible failure instead of silently pointing the browser at the previous
 * owner's Supabase project.
 *
 * The client resolves asynchronously (one cached promise per page load); all
 * call sites await it.
 */

let resolved: Promise<SupabaseClient> | null = null

async function resolveClient(): Promise<SupabaseClient> {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey())
}

export function createClient(): Promise<SupabaseClient> {
  resolved ??= resolveClient()
  return resolved
}

export type BrowserSupabase = SupabaseClient
