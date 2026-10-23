import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminEmail } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env'

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  return NextResponse.redirect(url)
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  // The publishable URL/anon key resolve from env vars ONLY — no embedded
  // fallback project (removed 2026-10-23). A missing/broken host config
  // cannot crash the proxy: the read below is wrapped, a failure is treated
  // as "no session", and protected routes fail closed to /login.

  let supabaseResponse = NextResponse.next({
    request,
  })

  // FAST PATH — requests with no sb-* cookies cannot be authenticated by any
  // configuration (healthy or self-healed), so skip straight to the answer.
  // This is consistency hygiene, NOT a measured latency win: auth-js's
  // getUser() happens to short-circuit without a network call when no session
  // cookie exists (warm anonymous /login was ~14 ms before this path
  // existed), and this makes the no-network guarantee ours instead of a
  // library implementation detail, while skipping client construction.
  // Behavior is identical either way: protected routes fail closed, public
  // routes render. (The real user-facing fix for slow sign-in was prefetching
  // /login and /signup in the landing navbar; the rest of /login's TTFB is
  // network distance to the edge, which no middleware change can remove.)
  const hasAuthCookies = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith('sb-'))
  if (!hasAuthCookies) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
      return redirectToLogin(request)
    }
    return supabaseResponse
  }

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

  async function readUser(url: string, anonKey: string) {
    const supabase = createServerClient(url, anonKey, { cookies })
    // getUser() performs a network call — if Supabase is unreachable it can
    // reject, and an escaping rejection 500s every page. Treat ANY failure —
    // including a key-level "Invalid API key" rejection — as "no session"
    // (public routes fail open; protected routes fail closed). There is no
    // embedded pair to heal to anymore, so a dead host key degrades to the
    // same signed-out treatment instead of crashing the proxy.
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) return null
      return data.user
    } catch {
      return null
    }
  }

  let user: Awaited<ReturnType<typeof readUser>> | null = null
  try {
    user = await readUser(getSupabaseUrl(), getSupabaseAnonKey())
  } catch {
    // Missing/broken publishable env (lib/env.ts throws) → no session.
    user = null
  }

  // IMPORTANT: DO NOT USE getSession HERE! It only reads from cookies,
  // which might be spoofed. getUser makes an API request to validate.

  // Admin emails bypass the student approval flow entirely.
  const isAdmin = isAdminEmail(user?.email)

  // Protected Routes Check
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!user) {
      return redirectToLogin(request)
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
