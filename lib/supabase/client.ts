import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  getBuiltinAuthConfig,
  getSupabaseAnonKey,
  getSupabaseUrl,
  isUsingBuiltinAuthFallback,
} from '@/lib/env'

/**
 * Browser Supabase client with runtime self-heal.
 *
 * The publishable URL/anon key resolve from env vars or the built-in
 * fallbacks in lib/env.ts, so the client is always constructible. But a host
 * env var can be PRESENT and still DEAD (stale/revoked key pasted into the
 * host dashboard — observed live 2026-09-11: sign-in answered "Invalid API
 * key" on every attempt while the static checks all passed). Only the
 * Supabase gateway can arbitrate, so the first createClient() call per page
 * load probes /auth/v1/health once: a definitive 401 swaps the session to the
 * embedded publishable pair. An unreachable gateway (our own network down)
 * never triggers a swap.
 *
 * The client resolves asynchronously (one cached promise per page load); all
 * call sites await it.
 */

let resolved: Promise<SupabaseClient> | null = null

/** true = key accepted; false = key rejected (401); null = can't tell. */
async function probeAuthGateway(url: string, anonKey: string): Promise<boolean | null> {
  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: anonKey },
      signal: AbortSignal.timeout(5000),
    })
    return res.ok
  } catch {
    return null
  }
}

async function resolveClient(): Promise<SupabaseClient> {
  const url = getSupabaseUrl()
  const anonKey = getSupabaseAnonKey()
  const client = createBrowserClient(url, anonKey)

  if (!isUsingBuiltinAuthFallback()) {
    const healthy = await probeAuthGateway(url, anonKey)
    if (healthy === false) {
      const builtin = getBuiltinAuthConfig()
      return createBrowserClient(builtin.url, builtin.anonKey)
    }
  }

  return client
}

export function createClient(): Promise<SupabaseClient> {
  resolved ??= resolveClient()
  return resolved
}

export type BrowserSupabase = SupabaseClient
