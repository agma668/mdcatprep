// Public (browser-inlined) configuration, read through one seam.
//
// NEXT_PUBLIC_* variables are inlined into the client bundle at BUILD time —
// they must exist when `next build` runs, not just at runtime.
//
// The Supabase project URL and anon key are PUBLISHABLE values — they ship in
// every visitor's browser bundle in any Supabase app, and row-level security
// is the actual boundary. They resolve from env vars ONLY: there is NO
// embedded fallback project (removed 2026-10-23 — the old embedded pair
// pointed at a Supabase project on the previous owner's account, and a
// missing or broken host config must fail loudly instead of silently serving
// that account's database). A JWT anon key carries its project `ref` in the
// payload, which must match the URL's subdomain; a mismatched pair — or a
// secret key pasted into the public slot — is rejected. The service-role key
// is a real secret and is read in lib/supabase/service.ts.

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

/** Role claim of a JWT-style key, or null (new-style opaque key). */
function anonKeyRole(key: string): string | null {
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

/**
 * A JWT-style key must name the same project as the URL and must actually be
 * a PUBLISHABLE key: a service-role/secret key pasted into the public slot
 * would "work" while leaking a real secret into every visitor's browser
 * bundle. New-style opaque keys (sb_publishable_, no `ref`/`role` claims)
 * can't be validated locally, so they're trusted by shape.
 */
function isKeyUsableForUrl(key: string, url: string): boolean {
  if (/^sb_secret_/.test(key)) return false
  const role = anonKeyRole(key)
  if (role && role !== 'anon') return false
  const keyRef = anonKeyRef(key)
  if (!keyRef) return true
  const target = urlRef(url)
  return !target || keyRef === target
}

// Supabase has shipped two key namings (legacy `anon` JWTs and the newer
// "publishable" keys) and hosts end up with either var name — accept them
// all. Each name is a static member expression so build-time inlining keeps
// working for the client bundle.
function readEnvUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    undefined
  )
}

function readEnvKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_API_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
    undefined
  )
}

function resolve(): { url: string; anonKey: string } {
  const envUrl = readEnvUrl()
  const envKey = readEnvKey()

  if (!envUrl || !envKey) {
    throw new Error(
      'Supabase publishable config is missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the host dashboard, then rebuild (NEXT_PUBLIC_* values are inlined at build time, never at runtime).'
    )
  }

  if (!isKeyUsableForUrl(envKey, envUrl)) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY does not match NEXT_PUBLIC_SUPABASE_URL — the key belongs to a different project, or a secret key was pasted into the public slot. Copy the publishable anon key of the same project as the URL, then rebuild.'
    )
  }

  return { url: envUrl.replace(/\/+$/, ''), anonKey: envKey }
}

/** Supabase project URL — env vars only; throws a descriptive error when missing/mismatched. */
export function getSupabaseUrl(): string {
  return resolve().url
}

/**
 * The project ref (URL subdomain) this deployment resolves to. Reads the raw
 * env vars WITHOUT throwing, so /api/health can diagnose a missing config
 * from the outside instead of crashing with it.
 */
export function getSupabaseProjectRef(): string | null {
  const envUrl = readEnvUrl()
  return envUrl ? urlRef(envUrl) : null
}

/** Supabase anon (publishable) key — env vars only; throws when missing/mismatched. */
export function getSupabaseAnonKey(): string {
  return resolve().anonKey
}

/** True when a complete, well-formed publishable env pair is configured. */
export function isPublicAuthConfigured(): boolean {
  const envUrl = readEnvUrl()
  const envKey = readEnvKey()
  return Boolean(envUrl && envKey && isKeyUsableForUrl(envKey, envUrl))
}

/**
 * True when an error is Supabase's gateway rejecting the API key itself
 * (401 "Invalid API key"). Distinct from "Invalid login credentials" (the
 * key works, the password doesn't). With the embedded fallback gone there is
 * nothing to heal to, but the distinction still drives honest error copy.
 */
export function isInvalidApiKeyError(err: unknown): boolean {
  const message = (err as { message?: string } | null)?.message ?? String(err ?? '')
  return /invalid api key/i.test(message)
}
