import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminEmail } from '@/lib/auth'
import { isInvalidApiKeyError } from '@/lib/env'

/**
 * One owner of the admin-panel entry check, shared by every /admin page.
 *
 * Admin identity is the same rule the login router, OAuth callback, and proxy
 * all apply: allowlisted email OR profiles.role === 'admin'. The profile read
 * needs the service role (the RLS path is admin-gated), which is a real
 * secret with no embedded fallback — so when a deployment lacks a WORKING
 * service key, the panel still renders for allowlisted admins with an honest
 * configuration notice (ServiceKeyNotice) instead of a raw gateway error.
 */
export type AdminContext =
  | { kind: 'ok'; service: ReturnType<typeof createServiceClient> }
  | { kind: 'unauthenticated' }
  | { kind: 'forbidden' }
  | { kind: 'missing-service-key' }
  | { kind: 'bad-service-key' }

/**
 * Arbitrate the service key against the gateway. A present-but-wrong value
 * constructs fine and only fails on first use (observed live 2026-09-11: the
 * dashboard said the var was set while every query answered "Invalid API
 * key"), so one cheap query decides — rather than trusting the host config.
 */
async function checkService(): Promise<
  { ok: true; service: ReturnType<typeof createServiceClient> } | { ok: false; reason: 'missing' | 'unauthorized' }
> {
  let service: ReturnType<typeof createServiceClient>
  try {
    service = createServiceClient()
  } catch {
    // Thrown at construction: var absent, or a publishable key pasted into
    // the secret slot (the error names the mistake).
    return { ok: false, reason: 'missing' }
  }

  try {
    const { error } = await service.from('profiles').select('id').limit(1)
    if (error && /invalid api key/i.test(error.message)) {
      return { ok: false, reason: 'unauthorized' }
    }
    // Any other error (table missing, network blip) is not a key problem —
    // hand back the client and let the page's own error handling deal with it.
    return { ok: true, service }
  } catch (err) {
    if (isInvalidApiKeyError(err)) return { ok: false, reason: 'unauthorized' }
    return { ok: true, service }
  }
}

export async function getAdminContext(): Promise<AdminContext> {
  const supabase = await createClient()

  // Middleware already protects this route; double-check here server-side.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { kind: 'unauthenticated' }

  let serviceCheck: Awaited<ReturnType<typeof checkService>> | null = null

  if (!isAdminEmail(user.email)) {
    // Confirm the DB-assigned role. Without a working service key the role
    // can't be verified, so non-allowlisted users are not admins here.
    serviceCheck = await checkService()
    if (!serviceCheck.ok) return { kind: 'forbidden' }
    const { data: profile } = await serviceCheck.service
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') return { kind: 'forbidden' }
  }

  if (!serviceCheck) serviceCheck = await checkService()
  if (!serviceCheck.ok) {
    return serviceCheck.reason === 'unauthorized'
      ? { kind: 'bad-service-key' }
      : { kind: 'missing-service-key' }
  }
  return { kind: 'ok', service: serviceCheck.service }
}

/** Applies the redirect outcomes; narrows ctx to the renderable kinds. */
export async function resolveAdminContext(): Promise<
  Exclude<AdminContext, { kind: 'unauthenticated' } | { kind: 'forbidden' }>
> {
  const ctx = await getAdminContext()
  if (ctx.kind === 'unauthenticated') redirect('/login')
  if (ctx.kind === 'forbidden') redirect('/dashboard')
  return ctx
}

/** Honest in-panel notice for the two service-key failure modes. */
export function ServiceKeyNotice({ kind }: { kind: 'missing-service-key' | 'bad-service-key' }) {
  const bad = kind === 'bad-service-key'
  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto w-full">
      <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-amber-500/25 bg-amber-500/[0.06] p-6">
        <h1 className="text-lg font-bold text-white">
          {bad ? 'The service key value is being rejected' : 'Panel data needs one server setting'}
        </h1>
        <p className="mt-2 text-sm text-white/70 leading-relaxed">
          {bad ? (
            <>
              Supabase answers <span className="text-rose-400">&ldquo;Invalid API key&rdquo;</span> for the{' '}
              <code className="px-1.5 py-0.5 bg-white/[0.08] border border-white/10 rounded text-xs font-mono">
                SUPABASE_SERVICE_ROLE_KEY
              </code>{' '}
              that is set on this deployment — the value is stale, revoked, or not actually the service_role
              secret.
            </>
          ) : (
            <>
              This deployment is missing the{' '}
              <code className="px-1.5 py-0.5 bg-white/[0.08] border border-white/10 rounded text-xs font-mono">
                SUPABASE_SERVICE_ROLE_KEY
              </code>{' '}
              environment variable, so student and content data cannot be loaded here.
            </>
          )}
        </p>
        <ol className="mt-3 list-decimal list-inside space-y-1.5 text-sm text-white/70 leading-relaxed">
          <li>
            Open Supabase → Project Settings → <span className="text-white/90">API Keys</span> and copy the{' '}
            <span className="text-white/90">service_role</span> secret (legacy section — NOT the publishable
            anon key).
          </li>
          <li>
            Vercel → Settings → Environment Variables → set{' '}
            <code className="px-1.5 py-0.5 bg-white/[0.08] border border-white/10 rounded text-xs font-mono">
              SUPABASE_SERVICE_ROLE_KEY
            </code>{' '}
            to that exact value (no quotes, no trailing spaces).
          </li>
          <li>Redeploy — env changes never apply to an already-running build.</li>
        </ol>
      </div>
    </div>
  )
}
