import type { Metadata } from 'next'
import { fmtInt, fmtUTCDate, fmtUTCTime } from "@/lib/fmt";
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/auth'
import {
  getTrafficAnalytics,
  type Num,
} from '@/lib/admin-analytics'
import {
  LineAreaChart,
  BarList,
  DeltaChip,
  Panel,
} from '@/components/admin/charts'
import {
  Eye,
  MousePointerClick,
  UserPlus,
  Users,
  Activity,
  Bug,
} from 'lucide-react'

export const metadata: Metadata = { title: 'Traffic Analytics' }

export const dynamic = 'force-dynamic'

/** Em dash for a failed count — never a fabricated zero. */
function n(v: Num): string {
  return v === null ? '—' : fmtInt(v)
}

function fmtWhen(iso: string | null): string {
  if (!iso) return 'never'
  const d = new Date(iso)
  const mins = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

const KPIS: {
  key: 'views' | 'clicks' | 'signups' | 'visitors'
  label: string
  hint: string
}[] = [
  { key: 'views', label: 'Page views · 30 days', hint: 'landings on the site' },
  { key: 'clicks', label: 'CTA clicks · 30 days', hint: 'tracked buttons & links' },
  { key: 'signups', label: 'Signups · 30 days', hint: 'real (non-demo) accounts' },
  { key: 'visitors', label: 'Signed-in visitors · 7 days', hint: 'distinct accounts seen' },
]

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!isAdminEmail(user.email)) redirect('/dashboard')

  const t = await getTrafficAnalytics()

  const ctaTotal =
    t?.ctaEvents.reduce((s, e) => s + e.count, 0) ?? 0

  const kpiValues: Record<
    (typeof KPIS)[number]['key'],
    { num: Num; delta?: { current: Num; previous: Num } }
  > = {
    views: { num: t?.views30 ?? null, delta: { current: t?.views30 ?? null, previous: t?.viewsPrev30 ?? null } },
    clicks: { num: ctaTotal > 0 ? ctaTotal : (t?.ctaEvents.length ? null : 0) },
    signups: { num: t?.signups30 ?? null, delta: { current: t?.signups30 ?? null, previous: t?.signupsPrev30 ?? null } },
    visitors: { num: t?.signedInVisitors7d ?? null },
  }

  const kpiIcons = { views: Eye, clicks: MousePointerClick, signups: UserPlus, visitors: Users }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-primary-light)]">
            Admin · Analytics
          </p>
          <h1 className="text-2xl font-extrabold text-white mt-1">Traffic &amp; Engagement</h1>
          <p className="text-sm text-white/50 mt-1 max-w-2xl">
            What students actually do on the site — views, clicks, signups and the
            errors their devices hit. From the site&apos;s own privacy-first
            telemetry (opt-out-able, anonymous, UTC days); demo accounts never count.
          </p>
        </div>
        <p className="text-xs text-white/40">
          Telemetry last seen: <span className="text-white/70">{fmtWhen(t?.lastEventAt ?? null)}</span>
        </p>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map(({ key, label, hint }) => {
          const v = kpiValues[key]
          const Icon = kpiIcons[key]
          return (
            <div
              key={key}
              className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <Icon className="h-5 w-5 text-white/40" aria-hidden="true" />
                {v.delta ? <DeltaChip current={v.delta.current} previous={v.delta.previous} /> : <span className="text-[10px] text-white/40">{v.num === null ? '' : hint}</span>}
              </div>
              <p className="text-2xl font-extrabold tabular-nums text-white">{n(v.num)}</p>
              <p className="text-xs text-white/45 mt-1">{label}</p>
              {v.delta && <p className="text-[10px] text-white/30 mt-0.5">{hint}</p>}
            </div>
          )
        })}
      </div>

      {/* ── Traffic graph ── */}
      <div className="mt-6">
        <Panel
          title="Daily traffic — last 30 days"
          sub="Page views (line) with signup days marked amber. UTC days."
        >
          {t ? (
            <LineAreaChart data={t.series} />
          ) : (
            <p className="text-sm text-white/40">Telemetry unavailable right now.</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] text-white/40">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="h-0.5 w-4 rounded bg-[var(--color-primary-light)]" />
              page views / day
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-amber-400" />
              a signup day
            </span>
          </div>
        </Panel>
      </div>

      {/* ── Top pages + CTA clicks ── */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Top pages" sub="Where the last 30 days of views landed.">
          <BarList items={t?.topPages ?? []} unit="views" />
        </Panel>
        <Panel
          title="Click events"
          sub="Tracked buttons and links. CTAs began reporting when instrumentation shipped — the list fills as traffic grows."
        >
          <BarList items={t?.ctaEvents ?? []} />
        </Panel>
      </div>

      {/* ── Client errors ── */}
      <div className="mt-6">
        <Panel
          title="Client errors — last 7 days"
          sub="Crashes and failed loads reported by real student devices. Grouped by message + page."
        >
          {!t || t.errors7dTotal === null ? (
            <p className="text-sm text-white/40">Error telemetry unavailable right now.</p>
          ) : t.errors7d.length === 0 ? (
            <p className="text-sm text-[var(--color-success)] flex items-center gap-2">
              <Bug className="h-4 w-4" aria-hidden="true" /> No client errors reported in the last 7 days.
            </p>
          ) : (
            <>
              <ul className="space-y-3">
                {t.errors7d.map((e) => (
                  <li
                    key={`${e.day}-${e.page ?? ''}-${e.message.slice(0, 24)}`}
                    className="rounded-[var(--radius-md)] border border-white/[0.07] bg-white/[0.03] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-rose-300/90 break-words leading-snug">{e.message}</p>
                      <span className="shrink-0 rounded-full bg-rose-500/15 text-rose-300 text-[10px] font-bold px-2 py-0.5 tabular-nums">
                        ×{e.count}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/35 mt-1">
                      {e.page ?? 'unknown page'} · first seen {e.day}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[10px] text-white/35">
                {n(t.errors7dTotal)} error reports total in the window.
              </p>
            </>
          )}
        </Panel>
      </div>

      {/* ── Honesty footer ── */}
      <p className="mt-6 flex items-start gap-2 text-[11px] text-white/35 leading-relaxed max-w-3xl">
        <Activity className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />
        Counts come from the site&apos;s own telemetry — students can switch it off
        from Profile → Privacy, so treat these as floors, not censuses. Anonymous
        visitors carry no identity (the signed-in visitor figure undercounts by
        design); windows are UTC days; failed queries show — rather than a
        guessed zero.
      </p>

      <div className="mt-6">
        <Link href="/admin" className="text-xs text-[var(--color-primary-light)] hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  )
}
