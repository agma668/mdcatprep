import type { Metadata } from 'next'
import { resolveAdminContext, ServiceKeyNotice } from '@/lib/admin-context'
import { normalizeFeedbackRow } from '@/lib/feedback'
import { FeedbackList } from './FeedbackList'

export const metadata: Metadata = { title: 'Feedback' }

export const dynamic = 'force-dynamic'

export default async function AdminFeedbackPage() {
  const ctx = await resolveAdminContext()
  if (ctx.kind !== 'ok') return <ServiceKeyNotice kind={ctx.kind} />
  const service = ctx.service
  const { data, error } = await service
    .from('feedback')
    .select('id, message, page, created_at, user_id, profile:profiles(full_name, email)')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load feedback: {error.message}
      </div>
    )
  }

  const feedback = (data ?? []).map(normalizeFeedbackRow)

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Student Feedback
          </h1>
          <p className="text-white/70 mt-1">
            What students and visitors are saying about the site.
          </p>
        </div>
        <span className="text-sm font-semibold text-white/45 bg-[var(--color-surface-3)] px-3 py-1.5 rounded-full">
          {feedback.length} {feedback.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      <FeedbackList initialFeedback={feedback} />
    </div>
  )
}
