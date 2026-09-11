// Public (browser-inlined) configuration, read through one seam.
//
// NEXT_PUBLIC_* variables are inlined into the client bundle at BUILD time —
// they must exist when `next build` runs, not just at runtime. Two failure
// modes have both been observed live (2026-09-10 outage):
//   1. vars MISSING on the host → every `process.env.X!` reader crashed;
//   2. vars PRESENT but WRONG ("Invalid API key" on sign-in) — a stale or
//      mistyped anon key is worse than a missing one because the fallback
//      never triggered.
//
// Fix for both: the Supabase project URL and anon key are PUBLISHABLE values
// — they ship in every visitor's browser bundle in any Supabase app, and
// row-level security is the actual boundary — so we embed them as built-in
// fallbacks AND validate any env-provided pair before trusting it. A JWT
// anon key carries its project `ref` in the payload, which must match the
// URL's subdomain; a mismatched or undecodable-but-mismatching pair is
// replaced wholesale by the built-in pair (never a half-and-half mix).
// The service-role key is a real secret and is NOT embedded.

const BUILTIN_SUPABASE_URL = 'https://lsjwyqouzezabaxnlhjy.supabase.co'

// Anon (publishable) key — `role: "anon"` JWT for the project above.
const BUILTIN_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzand5cW91emV6YWJheG5saGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNTY5MjcsImV4cCI6MjEwMDYzMjkyN30.K3yYEEgI4LFY9PDjnE0Qz_AzL8lwP32Ilaq16nk4yoQ'

/** Project ref encoded in a JWT-style anon key, or null (new-style opaque key). */
function anonKeyRef(key: string): string | null {
  try {
    const payload = key.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4))
    const ref = JSON.parse(json)?.ref
    return typeof ref === 'string' && ref ? ref : null
  } catch {
    return null
  }
}

/** Subdomain (project ref) of a Supabase URL. */
function urlRef(url: string): string | null {
  const match = /^https:\/\/([^.]+)\.supabase\.(?:co|in)/.exec(url)
  return match?.[1] ?? null
}

/**
 * A JWT-style key must name the same project as the URL. New-style opaque
 * keys (no `ref` claim) can't be validated locally, so they're trusted.
 */
function isKeyUsableForUrl(key: string, url: string): boolean {
  const keyRef = anonKeyRef(key)
  if (!keyRef) return true
  const target = urlRef(url)
  return !target || keyRef === target
}

interface ResolvedConfig {
  url: string
  anonKey: string
  usedFallback: boolean
}

function resolve(): ResolvedConfig {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (envUrl && envKey && isKeyUsableForUrl(envKey, envUrl)) {
    return { url: envUrl.replace(/\/+$/, ''), anonKey: envKey, usedFallback: false }
  }

  // Missing OR broken (e.g. stale key that doesn't match the project) env
  // config: use the built-in publishable pair as a unit.
  return { url: BUILTIN_SUPABASE_URL, anonKey: BUILTIN_SUPABASE_ANON_KEY, usedFallback: true }
}

/** Supabase project URL — validated env vars, or the built-in publishable pair. */
export function getSupabaseUrl(): string {
  return resolve().url
}

/** Supabase anon (publishable) key — validated env vars, or the built-in pair. */
export function getSupabaseAnonKey(): string {
  return resolve().anonKey
}

/** True when the publishable auth config is present (always, via env or fallback). */
export function isPublicAuthConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey())
}

/** True when the built-in fallbacks are in use (host vars missing or broken). */
export function isUsingBuiltinAuthFallback(): boolean {
  return resolve().usedFallback
}

/**
 * The embedded publishable pair, as a unit. Runtime self-heal uses this to
 * retry auth once when the host-configured anon key turns out to be DEAD
 * (present, structurally valid, but rejected by Supabase with 401 "Invalid
 * API key" — observed live 2026-09-11: a stale key pasted into the host
 * dashboard passes every static check here, so only the gateway itself can
 * arbitrate). Never used when the fallback is already active — there is
 * nothing to heal to.
 */
export function getBuiltinAuthConfig(): { url: string; anonKey: string } {
  return { url: BUILTIN_SUPABASE_URL, anonKey: BUILTIN_SUPABASE_ANON_KEY }
}

/**
 * True when an error is Supabase's gateway rejecting the API key itself
 * (401 "Invalid API key"). Distinct from "Invalid login credentials" (the
 * key works, the password doesn't) — only the former warrants a heal retry.
 */
export function isInvalidApiKeyError(err: unknown): boolean {
  const message = (err as { message?: string } | null)?.message ?? String(err ?? '')
  return /invalid api key/i.test(message)
}
