import { resolveAdminContext, ServiceKeyNotice } from '@/lib/admin-context'
import { normalizeFeedbackRow } from '@/lib/feedback'
import { fmtUTCDate } from '@/lib/fmt'
import Link from 'next/link'
import { StudentTable } from './StudentTable'

// Auth-gated admin page: render per-request, never prerender at build time
// (the build has no user session — and with env vars missing at build, a
// prerender attempt here used to fail the whole deployment).
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const ctx = await resolveAdminContext()
  if (ctx.kind !== 'ok') return <ServiceKeyNotice kind={ctx.kind} />
  const service = ctx.service
  const [profilesResult, feedbackResult] = await Promise.all([
    service
      .from('profiles')
      .select('id, full_name, email, phone, exam_target, status, role, created_at, referred_by')
      .eq('role', 'student')
      .order('created_at', { ascending: false }),
    service
      .from('feedback')
      .select('id, message, page, created_at, user_id, profile:profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  if (profilesResult.error) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load students: {profilesResult.error.message}
      </div>
    )
  }

  const students = profilesResult.data || []
  const recentFeedback = (feedbackResult.data || []).map(normalizeFeedbackRow).slice(0, 3)

  // ── Referral leaderboard — who brought whom ────────────────────────────────
  // Counted from live signup attribution (profiles.referred_by, set by the
  // signup action and counted by a DB trigger) — nothing tallied by hand.
  // Referrers can be any profile (including an admin sharing his own link),
  // so names resolve from a dedicated fetch instead of assuming every
  // referrer sits in the student list above.
  const referrerIds = [
    ...new Set(students.map((s) => s.referred_by).filter((v): v is string => Boolean(v))),
  ]
  const referrerMap = new Map<
    string,
    { full_name: string | null; email: string | null; referral_code: string | null }
  >()
  if (referrerIds.length > 0) {
    const { data: referrerRows } = await service
      .from('profiles')
      .select('id, full_name, email, referral_code')
      .in('id', referrerIds)
    for (const r of referrerRows || []) referrerMap.set(r.id, r)
  }
  const referrerName = (id: string) => {
    const r = referrerMap.get(id)
    return r?.full_name || r?.email || 'Unknown'
  }
  const referralLeaders = referrerIds
    .map((id) => {
      const brought = students.filter((s) => s.referred_by === id)
      const referrer = referrerMap.get(id)
      return {
        id,
        name: referrerName(id),
        email: referrer?.email || '',
        code: referrer?.referral_code || '',
        total: brought.length,
        approved: brought.filter((s) => s.status === 'approved').length,
        latest: brought
          .map((s) => s.created_at)
          .sort()
          [brought.length - 1] ?? '',
      }
    })
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
  const referredStudents = students.filter((s) => s.referred_by)
  const recentReferred = referredStudents
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5)
    .map((s) => ({
      id: s.id,
      name: s.full_name || s.email,
      when: s.created_at,
      by: s.referred_by ? referrerName(s.referred_by) : '',
    }))
  const counts = {
    total: students.length,
    approved: students.filter(p => p.status === 'approved').length,
    pending: students.filter(p => p.status === 'pending').length,
    rejected: students.filter(p => p.status === 'rejected').length,
    suspended: students.filter(p => p.status === 'suspended').length,
  }

  // ── Signups per target exam — the demand map ──────────────────────────────
  // Grouped live from profiles.exam_target (the track each student picks at
  // signup), never hand-tallied. Values are the exact strings SignupForm
  // offers; any legacy/free-text target rolls up into the Other row instead
  // of being dropped, so every signup is counted somewhere.
  const KNOWN_EXAM_TARGETS = [
    'MDCAT',
    'NUMS',
    'HEC USAT-M',
    'NUST (NET)',
    'GIKI',
    'LUMS',
    'HEC USAT-E',
    'PMA Long Course',
    'ISSB Intelligence',
    'MBBS Notes',
  ] as const
  const byExam = new Map<string, { total: number; approved: number; latest: string }>()
  for (const target of KNOWN_EXAM_TARGETS) byExam.set(target, { total: 0, approved: 0, latest: '' })
  const other = { total: 0, approved: 0, latest: '' }
  for (const s of students) {
    const bucket = byExam.has(s.exam_target ?? '') ? byExam.get(s.exam_target ?? '')! : other
    bucket.total += 1
    if (s.status === 'approved') bucket.approved += 1
    if (s.created_at > bucket.latest) bucket.latest = s.created_at
  }
  const examRows = [
    ...[...byExam.entries()].map(([exam, b]) => ({ exam, ...b })),
    ...(other.total > 0 ? [{ exam: 'Other / custom', ...other }] : []),
  ].sort((a, b) => b.total - a.total || a.exam.localeCompare(b.exam))

  const cards = [
    { label: 'Total Students', value: counts.total, icon: '👥', color: 'text-[var(--color-primary)]' },
    { label: 'Approved', value: counts.approved, icon: '✅', color: 'text-[var(--color-success)]' },
    { label: 'Pending', value: counts.pending, icon: '⏳', color: 'text-amber-400' },
    { label: 'Rejected', value: counts.rejected, icon: '❌', color: 'text-rose-400' },
    { label: 'Suspended', value: counts.suspended, icon: '🚫', color: 'text-white/70' },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-white/70 mt-1">Manage student applications and accounts.</p>
      </div>

      {/* Summary cards — live counts from the profiles table */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {cards.map(({ label, value, icon, color }) => (
          <div
            key={label}
            className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-5"
          >
            <p className="text-xl mb-1" aria-hidden="true">{icon}</p>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-xs text-white/45 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Signups per target exam — live demand per test track */}
      <section
        aria-label="Students per exam"
        className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 mb-8"
      >
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-bold text-white">Students per Test</h2>
          <p className="text-xs text-white/45 mt-0.5">
            Signups grouped by the exam track each student chose at signup —
            counted live from the profiles table.
          </p>
        </div>
        <ul className="divide-y divide-white/10">
          {examRows.map((row) => (
            <li key={row.exam} className="px-6 py-3 flex items-center gap-4">
              <span className="text-sm font-semibold text-white flex-1 min-w-0 truncate">{row.exam}</span>
              <div className="hidden sm:block w-40 h-1.5 rounded-full bg-white/[0.06] overflow-hidden" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)]"
                  style={{ width: counts.total > 0 ? `${Math.max(2, (row.total / counts.total) * 100)}%` : '0%' }}
                />
              </div>
              <span className="text-sm font-bold text-white tabular-nums w-10 text-right">{row.total}</span>
              <span className="text-xs text-white/45 w-20 text-right">{row.approved} approved</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Recent feedback — newest submissions, full list on /admin/feedback */}
      <section
        aria-label="Recent feedback"
        className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 mb-8"
      >
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-white">Recent Feedback</h2>
            <p className="text-xs text-white/45 mt-0.5">
              Latest submissions from students and visitors.
            </p>
          </div>
          <Link
            href="/admin/feedback"
            className="shrink-0 text-sm font-semibold text-[var(--color-primary)] hover:underline"
          >
            View all →
          </Link>
        </div>
        {recentFeedback.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-white/45">
            No feedback yet. The floating feedback button is on every page — once
            students use it, their feedback shows up here.
          </p>
        ) : (
          <ul className="divide-y divide-white/10">
            {recentFeedback.map((f) => {
              const author = f.profile
              return (
                <li key={f.id} className="px-6 py-4">
                  <p className="text-sm text-white leading-relaxed whitespace-pre-wrap break-words line-clamp-3">
                    “{f.message}”
                  </p>
                  <p className="mt-1.5 text-xs text-white/45">
                    {author?.full_name || author?.email || 'Anonymous'}
                    {' · '}
                    {fmtUTCDate(f.created_at)}
                    {f.page ? ` · ${f.page}` : ''}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Referrals — who brought how many students, ranked */}
      <section
        aria-label="Referral leaderboard"
        className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 mb-8"
      >
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-white">Referrals</h2>
            <p className="text-xs text-white/45 mt-0.5">
              Who brought how many students — counted live from signup attribution.
            </p>
          </div>
          <span className="shrink-0 text-xs text-white/45">
            {referredStudents.length} of {counts.total} joined via a referral link
          </span>
        </div>
        {referralLeaders.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-white/45">
            No referrals yet. When a student signs up through a shared
            <code className="mx-1 px-1.5 py-0.5 bg-white/[0.06] border border-white/10 rounded text-xs">/signup?ref=CODE</code>
            link, they show up under the friend who invited them.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-white/10">
              {referralLeaders.map((leader, i) => (
                <li key={leader.id} className="px-6 py-4 flex items-center gap-4">
                  {/* Rank — brass-toned for the top recruiter only */}
                  <span
                    className={
                      i === 0
                        ? 'w-7 h-7 shrink-0 rounded-full bg-[#C9A24B]/15 text-[#C9A24B] text-sm font-bold flex items-center justify-center'
                        : 'w-7 h-7 shrink-0 rounded-full bg-white/[0.06] text-white/50 text-sm font-bold flex items-center justify-center'
                    }
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {leader.name}
                      {leader.code && (
                        <code className="ml-2 px-1.5 py-0.5 bg-white/[0.06] border border-white/10 rounded text-[10px] font-mono text-white/40 align-middle">
                          {leader.code}
                        </code>
                      )}
                    </p>
                    <p className="text-xs text-white/45 truncate">{leader.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white">
                      {leader.total} <span className="text-xs font-normal text-white/45">brought</span>
                    </p>
                    <p className="text-xs text-white/45">{leader.approved} approved</p>
                  </div>
                </li>
              ))}
            </ul>
            {recentReferred.length > 0 && (
              <p className="px-6 py-3 border-t border-[var(--color-border)] text-xs text-white/45">
                Latest: {recentReferred.map((r) => `${r.name} (by ${r.by})`).join(', ')}
              </p>
            )}
          </>
        )}
      </section>

      <div
        id="students"
        className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 overflow-hidden"
      >
        <StudentTable initialProfiles={students} />
      </div>
    </div>
  )
}
