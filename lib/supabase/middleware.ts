import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminEmail } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'
import {
  getBuiltinAuthConfig,
  getSupabaseAnonKey,
  getSupabaseUrl,
  isUsingBuiltinAuthFallback,
} from '@/lib/env'

function isInvalidKeyError(err: unknown): boolean {
  const message =
    (err as { message?: string } | null)?.message ?? (typeof err === 'string' ? err : '')
  return /invalid api key/i.test(message)
}

export async function updateSession(request: NextRequest) {
  // The publishable URL/anon key resolve from env vars or the built-in
  // fallbacks in lib/env.ts, so this client can always be built — a missing
  // env can never crash the proxy and 500 the whole site (the 2026-09-10
  // outage signature).
  //
  // A PRESENT but DEAD host key (Supabase answers 401 "Invalid API key" — a
  // stale/revoked key pasted into the host dashboard, observed live
  // 2026-09-11) cannot be detected statically, so a rejection with that
  // message swaps the client to the embedded publishable pair and the session
  // read is retried once. Without this, a signed-in user is bounced to /login
  // on every protected route by a key that cannot validate anyone.

  let supabaseResponse = NextResponse.next({
    request,
  })

  const cookies = {
    getAll() {
      return request.cookies.getAll()
    },
    setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
      cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
      supabaseResponse = NextResponse.next({
        request,
      })
      cookiesToSet.forEach(({ name, value, options }) =>
        supabaseResponse.cookies.set(name, value, options)
      )
    },
  }

  let user: Awaited<ReturnType<typeof readUser>> | null = null

  async function readUser(url: string, anonKey: string) {
    const supabase = createServerClient(url, anonKey, { cookies })
    // getUser() performs a network call — if Supabase is unreachable it can
    // reject, and an escaping rejection 500s every page. Treat it as "no
    // session" (public routes fail open; protected routes fail closed).
    // A key-level rejection ("Invalid API key") is rethrown so the caller's
    // self-heal can retry against the embedded publishable pair — whether
    // auth-js surfaces it as a thrown error or a resolved `error`.
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        if (isInvalidKeyError(error)) throw error
        return null
      }
      return data.user
    } catch (err) {
      if (isInvalidKeyError(err)) throw err
      return null
    }
  }

  try {
    user = await readUser(getSupabaseUrl(), getSupabaseAnonKey())
  } catch (err) {
    // 401 "Invalid API key": the host-configured publishable pair is dead —
    // heal to the embedded pair (which is what every other layer in this
    // request path resolves to after the heal) and re-read the session once.
    if (isInvalidKeyError(err) && !isUsingBuiltinAuthFallback()) {
      const builtin = getBuiltinAuthConfig()
      user = await readUser(builtin.url, builtin.anonKey).catch(() => null)
    }
  }

  // IMPORTANT: DO NOT USE getSession HERE! It only reads from cookies,
  // which might be spoofed. getUser makes an API request to validate.

  // Admin emails bypass the student approval flow entirely.
  const isAdmin = isAdminEmail(user?.email)

  const { pathname } = request.nextUrl

  // Protected Routes Check
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!user) {
      // no user, redirect to login page
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Read status/role with the service role — the RLS path is admin-gated in
    // the live DB and must not decide student access. When the deployment is
    // missing the service key (it is a secret and has no fallback), degrade:
    // admins still pass (they never needed this read), everyone else is
    // treated as pending rather than crashing the proxy.
    let profile: { role?: string | null; status?: string | null } | null = null
    try {
      const service = createServiceClient()
      const { data } = await service
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single()
      profile = data
    } catch {
      profile = null
    }

    // 1. Enforce the approval gate for protected routes. Admins bypass it
    //    entirely — including the missing-profile case — so an admin can never
    //    be bounced by the approval gate. Pending students go to /pending,
    //    rejected students to /rejected, and suspended students to /suspended.
    if ((!profile || profile.status !== 'approved') && !isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname =
        profile?.status === 'rejected'
          ? '/rejected'
          : profile?.status === 'suspended'
            ? '/suspended'
            : '/pending'
      return NextResponse.redirect(url)
    }

    // 2. Check role for admin routes
    if (pathname.startsWith('/admin')) {
      if (!isAdmin && profile?.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  // Auth Routes Check - redirect logged-in users away from auth pages
  if (pathname === '/login' || pathname === '/signup') {
    if (user) {
      const url = request.nextUrl.clone()
      url.pathname = isAdmin ? '/admin' : '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
