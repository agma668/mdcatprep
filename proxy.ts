import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// The proxy (Next.js middleware) runs on every page/API request. When it
// throws, Vercel answers a bare "Internal Server Error" for the whole site —
// pages AND static metadata routes alike — which is exactly the production
// outage of 2026-09-10: one crashed middleware took every route down while
// middleware-excluded assets kept serving. Never let an error escape:
//
//   public routes  → fail OPEN (serve the page; Supabase clients on the page
//                    fail open too)
//   /dashboard, /admin → fail CLOSED (redirect to /login — without a working
//                    session we cannot verify approval status, so protected
//                    pages must not render)

export async function proxy(request: NextRequest) {
  try {
    return await updateSession(request)
  } catch {
    const { pathname } = request.nextUrl
    const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
    if (isProtected) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sw.js (the service-worker script — fetched on every SW update check
     *   and must never carry session-refresh overhead)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
