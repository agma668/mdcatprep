import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminEmail } from '@/lib/auth'

/**
 * One owner of the admin-panel entry check, shared by every /admin page.
 *
 * Admin identity is the same rule the login router, OAuth callback, and proxy
 * all apply: allowlisted email OR profiles.role === 'admin'. The profile read
 * needs the service role (the RLS path is admin-gated), which is a real
 * secret with no embedded fallback — so when a deployment lacks the key, the
 * panel still renders for allowlisted admins and the page shows an honest
 * configuration notice (MissingServiceKeyNotice) instead of a 500.
 */
export type AdminContext =
  | { kind: 'ok'; service: ReturnType<typeof createServiceClient> }
  | { kind: 'unauthenticated' }
  | { kind: 'forbidden' }
  | { kind: 'missing-service-key' }

export async function getAdminContext(): Promise<AdminContext> {
  const supabase = await createClient()

  // Middleware already protects this route; double-check here server-side.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { kind: 'unauthenticated' }

  let roleAdmin = false
  if (!isAdminEmail(user.email)) {
    try {
      const service = createServiceClient()
      const { data: profile } = await service
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      roleAdmin = profile?.role === 'admin'
    } catch {
      // Missing service key (or DB unreachable) — fall through to the
      // email check below; DB-role admins simply can't be confirmed here.
      roleAdmin = false
    }
    if (!roleAdmin) return { kind: 'forbidden' }
  }

  try {
    return { kind: 'ok', service: createServiceClient() }
  } catch {
    return { kind: 'missing-service-key' }
  }
}

/** Applies the redirect outcomes; narrows ctx to the two renderable kinds. */
export async function resolveAdminContext(): Promise<
  Extract<AdminContext, { kind: 'ok' | 'missing-service-key' }>
> {
  const ctx = await getAdminContext()
  if (ctx.kind === 'unauthenticated') redirect('/login')
  if (ctx.kind === 'forbidden') redirect('/dashboard')
  return ctx
}

/** Honest in-panel notice shown when the service-role key is not configured. */
export function MissingServiceKeyNotice() {
  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto w-full">
      <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-amber-500/25 bg-amber-500/[0.06] p-6">
        <h1 className="text-lg font-bold text-white">Panel data needs one server setting</h1>
        <p className="mt-2 text-sm text-white/70 leading-relaxed">
          You are signed in as an admin, but this deployment is missing the{' '}
          <code className="px-1.5 py-0.5 bg-white/[0.08] border border-white/10 rounded text-xs font-mono">
            SUPABASE_SERVICE_ROLE_KEY
          </code>{' '}
          environment variable, so student and content data cannot be loaded here.
        </p>
        <p className="mt-3 text-sm text-white/70 leading-relaxed">
          Fix: Vercel → Settings → Environment Variables → add{' '}
          <code className="px-1.5 py-0.5 bg-white/[0.08] border border-white/10 rounded text-xs font-mono">
            SUPABASE_SERVICE_ROLE_KEY
          </code>{' '}
          (Supabase → Project Settings → API → service_role key), then redeploy.
        </p>
      </div>
    </div>
  )
}
