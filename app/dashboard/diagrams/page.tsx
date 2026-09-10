import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { DIAGRAMS } from '@/lib/diagrams/diagrams-data'
import { MINDMAPS } from '@/lib/diagrams/mindmaps-data'
import { DiagramsMindmapsClient } from './DiagramsMindmapsClient'

export const metadata: Metadata = { title: 'Diagrams & Mindmaps' }
export const dynamic = 'force-dynamic'

export default async function DiagramsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
      <PageHeader
        eyebrow="See it, label it, remember it"
        title="Diagrams & Mindmaps"
        description="Tap a hotspot on any exam diagram to test yourself, or collapse a mindmap to the branches you still need. Everything is drawn from the PMDC syllabus — no images to download, works offline."
      />
      <DiagramsMindmapsClient diagrams={DIAGRAMS} mindmaps={MINDMAPS} />
    </div>
  )
}
