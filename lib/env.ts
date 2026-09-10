// Public (browser-inlined) configuration, read through one seam.
//
// NEXT_PUBLIC_* variables are inlined into the client bundle at BUILD time —
// they must exist when `next build` runs, not just at runtime. When they are
// missing on the host (the 2026-09-10 outage: sign-in silently broken, then
// the whole site 500ing through the proxy), every reader used to dereference
// `process.env.X!` and crash somewhere far from the cause.
//
// These helpers never throw: callers branch on the boolean and show an honest
// message ("the server isn't configured yet") instead of dying opaquely.

/** Supabase project URL, or null when the deployment is missing it. */
export function getSupabaseUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  return url ? url.replace(/\/+$/, '') : null
}

/** Supabase anon (publishable) key, or null when the deployment is missing it. */
export function getSupabaseAnonKey(): string | null {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  return key || null
}

/** True when the browser-side Supabase env (build-time inlined) is present. */
export function isPublicAuthConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey())
}
