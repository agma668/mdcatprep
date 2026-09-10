'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const selectCls =
  'px-3 py-1.5 border border-white/10 rounded-[var(--radius-md)] text-sm bg-white/[0.06] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]'

export function QuestionFilters({
  subjects,
  topics,
  difficulties,
  current,
}: {
  subjects: string[]
  topics: string[]
  difficulties: string[]
  current: {
    subject?: string
    topic?: string
    difficulty?: string
    status?: string
    source?: string
  }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/admin/questions?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <select
        className={selectCls}
        value={current.subject ?? ''}
        onChange={e => update('subject', e.target.value)}
      >
        <option value="">All subjects</option>
        {subjects.map(s => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        className={selectCls}
        value={current.topic ?? ''}
        onChange={e => update('topic', e.target.value)}
      >
        <option value="">All topics</option>
        {topics.map(t => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        className={selectCls}
        value={current.difficulty ?? ''}
        onChange={e => update('difficulty', e.target.value)}
      >
        <option value="">All difficulties</option>
        {difficulties.map(d => (
          <option key={d} value={d}>
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </option>
        ))}
      </select>
      <select
        className={selectCls}
        value={current.status ?? ''}
        onChange={e => update('status', e.target.value)}
      >
        <option value="">All statuses</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>
      <select
        className={selectCls}
        value={current.source ?? ''}
        onChange={e => update('source', e.target.value)}
      >
        <option value="">All sources</option>
        <option value="admin">Admin</option>
        <option value="ai">AI (draft)</option>
        <option value="imported">Imported</option>
      </select>
    </div>
  )
}
