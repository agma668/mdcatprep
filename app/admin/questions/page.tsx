import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminEmail } from '@/lib/auth'
import { QuestionManager } from './QuestionManager'
import { QuestionFilters } from './QuestionFilters'

export const metadata: Metadata = { title: 'Questions / MCQs' }

export const dynamic = 'force-dynamic'

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; topic?: string; difficulty?: string; status?: string; source?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!isAdminEmail(user.email)) redirect('/dashboard')

  const { subject, topic, difficulty, status, source } = await searchParams

  const service = createServiceClient()

  // Filter options derived from live data.
  const [allRows, listResult] = await Promise.all([
    service.from('questions').select('subject, topic, difficulty'),
    (() => {
      let query = service
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })
      if (subject) query = query.eq('subject', subject)
      if (topic) query = query.eq('topic', topic)
      if (difficulty) query = query.eq('difficulty', difficulty)
      if (status) query = query.eq('status', status)
      if (source) query = query.eq('source', source)
      return query
    })(),
  ])

  const rows = allRows.data ?? []
  const subjects = [...new Set(rows.map(r => r.subject).filter(Boolean))].sort()
  const topics = [...new Set(rows.map(r => r.topic).filter(Boolean))].sort()
  const difficulties = [...new Set(rows.map(r => r.difficulty).filter(Boolean))].sort()

  if (listResult.error) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load questions: {listResult.error.message}
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          Questions / MCQs
        </h1>
        <p className="text-white/70 mt-1">
          Create, publish, and manage practice questions. Published questions
          appear instantly in student practice.
        </p>
      </div>

      <QuestionFilters
        subjects={subjects}
        topics={topics}
        difficulties={difficulties}
        current={{ subject, topic, difficulty, status, source }}
      />

      <QuestionManager
        initialQuestions={listResult.data ?? []}
        subjects={subjects}
        topics={topics}
        difficulties={difficulties}
      />
    </div>
  )
}
