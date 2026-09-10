// Public (browser-inlined) configuration, read through one seam.
//
// NEXT_PUBLIC_* variables are inlined into the client bundle at BUILD time —
// they must exist when `next build` runs, not just at runtime. When they are
// missing on the host (the 2026-09-10 outage: sign-in silently broken, then
// the whole site 500ing through the proxy), every reader used to dereference
// `process.env.X!` and crash somewhere far from the cause.
//
// Fix: the Supabase project URL and anon key are PUBLISHABLE values — they
// ship in every visitor's browser bundle in any Supabase app, and row-level
// security is the actual boundary — so we embed them as built-in fallbacks.
// Any deployment (Vercel preview, fork, production) works with zero setup,
// while explicit env vars still win when present. The service-role key is a
// real secret and is NOT embedded: it must come from the environment.

const BUILTIN_SUPABASE_URL = 'https://lsjwyqouzezabaxnlhjy.supabase.co'

// Anon (publishable) key — `role: "anon"` JWT for the project above.
const BUILTIN_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzand5cW91emV6YWJheG5saGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNTY5MjcsImV4cCI6MjEwMDYzMjkyN30.K3yYEEgI4LFY9PDjnE0Qz_AzL8lwP32Ilaq16nk4yoQ'

/** Supabase project URL — env var if set, built-in publishable fallback otherwise. */
export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  return url ? url.replace(/\/+$/, '') : BUILTIN_SUPABASE_URL
}

/** Supabase anon (publishable) key — env var if set, built-in fallback otherwise. */
export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || BUILTIN_SUPABASE_ANON_KEY
}

/** True when the publishable auth config is present (always, via env or fallback). */
export function isPublicAuthConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey())
}

/** True when the built-in fallbacks are in use (i.e. host env vars were not set). */
export function isUsingBuiltinAuthFallback(): boolean {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  )
}
