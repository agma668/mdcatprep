import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { createClient } from '@/lib/supabase/server'
import { getAvailableExams, getMyGoals } from '@/app/actions/goals'
import { GoalsClient } from './GoalsClient'

export const metadata: Metadata = { title: 'My Prep Goals' }

export const dynamic = 'force-dynamic'

export default async function GoalsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [goals, exams] = await Promise.all([getMyGoals(), getAvailableExams()])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <PageHeader
        eyebrow="Your preparation"
        title="My Prep Goals"
        description="Save the exams you are actually preparing for. Each goal is stored on your account — a profile target is only a note."
      />
      <GoalsClient goals={goals} exams={exams} />
    </div>
  )
}
