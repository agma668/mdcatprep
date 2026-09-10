import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { PassagePractice } from './PassagePractice'

export const metadata: Metadata = { title: 'Passage Practice' }

export const dynamic = 'force-dynamic'

export default async function PassagePracticePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
      <Link
        href="/dashboard/practice/English"
        className="text-sm font-medium text-[var(--color-primary)] hover:underline"
      >
        ← English
      </Link>
      <PageHeader
        className="mt-4"
        eyebrow="English paper practice"
        title="Passage Practice"
        description="In the MDCAT English section you read a short passage and answer questions on it. Practise with the passages below, then check your answers."
      />

      <PassagePractice />
    </div>
  )
}
