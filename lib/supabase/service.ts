import { createServerClient } from '@supabase/ssr'

// Service-role client that bypasses RLS. Server-side only — never expose it
// to the client. Used for trusted operations like promoting an admin profile.
export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // Service-role operations don't touch user cookies.
        },
      },
    }
  )
}
