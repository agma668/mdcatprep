import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminEmail } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env'

export async function updateSession(request: NextRequest) {
  // The publishable URL/anon key resolve from env vars or the built-in
  // fallbacks in lib/env.ts, so this client can always be built — a missing
  // env can never crash the proxy and 500 the whole site (the 2026-09-10
  // outage signature).

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Do not run code between createServerClient and
  // supabaseResponse.cookies.set. A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT USE getSession HERE! It only reads from cookies,
  // which might be spoofed. getUser makes an API request to validate.
  //
  // getUser() performs a network call — if Supabase is unreachable it can
  // reject, and an escaping rejection 500s every page. Treat it as "no
  // session" (the page-level fail-open behavior covers public routes;
  // protected routes still fail closed via the proxy catch).
  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }))

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
