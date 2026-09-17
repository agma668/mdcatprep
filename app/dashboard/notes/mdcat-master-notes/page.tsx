import { TrackedLink } from '@/components/TrackedLink';
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Lightbulb } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  MCAT_NOTES_PREAMBLE,
  MCAT_NOTES_SECTIONS,
  MCAT_NOTES_META,
  MCAT_DEEP_SECTIONS,
} from '@/lib/mcat-notes'
import Link from 'next/link'

export const metadata: Metadata = { title: 'MDCAT Master Concept Notes' }
export const dynamic = 'force-dynamic'

type NoteBlock = { type: "para" | "bullet"; text: string }
type NoteSection = { title: string; topics: { title: string; blocks: NoteBlock[] }[] }

function BlockText({ block }: { block: NoteBlock }) {
  const isThink = block.text.startsWith('Think like this:')
  if (isThink) {
    return (
      <div className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/25 px-4 py-3">
        <p className="text-sm text-[var(--color-text-primary)]">
          <span className="font-semibold text-[var(--color-primary)]">
            <Lightbulb className="w-4 h-4 inline-block mr-1 -mt-1 align-middle" aria-hidden="true" />
            Think like this:
          </span>{' '}
          {block.text.replace(/^Think like this:\s*/, '')}
        </p>
      </div>
    )
  }
  if (block.type === 'bullet') {
    return (
      <li className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
        <span className="text-[var(--color-primary)] font-bold mt-0.5" aria-hidden="true">•</span>
        <span>{block.text}</span>
      </li>
    )
  }
  return <p className="text-sm text-[var(--color-text-secondary)]">{block.text}</p>
}

function TopicCard({ topic }: { topic: NoteSection['topics'][number] }) {
  return (
    <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-5">
      {topic.title && <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">{topic.title}</h3>}
      <div className="space-y-2.5">
        {topic.blocks.map((block, i) =>
          block.type === 'bullet' ? (
            <ul key={i} className="space-y-1.5"><BlockText block={block} /></ul>
          ) : (
            <BlockText key={i} block={block} />
          )
        )}
      </div>
    </div>
  )
}

export default async function McatMasterNotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <TrackedLink to="/dashboard/notes" className="text-sm font-medium text-[var(--color-primary)] hover:underline" label="master-notes">
          ← Back to Important Notes
        </TrackedLink>
      </div>
      <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 mb-8">
        <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-primary)] text-[var(--color-text-inverse)] text-xs font-semibold mb-3">
          {MCAT_NOTES_META.badge}
        </span>
        <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)]">{MCAT_NOTES_META.title}</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">{MCAT_NOTES_META.subtitle}</p>
      </div>
      {MCAT_NOTES_PREAMBLE.length > 0 && (
        <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-6 mb-8">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">How to use these notes</h2>
          <div className="space-y-2.5">
            {MCAT_NOTES_PREAMBLE.map((block, i) => <BlockText key={i} block={block} />)}
          </div>
        </div>
      )}
      <nav className="mb-8 flex flex-wrap gap-2">
        {MCAT_NOTES_SECTIONS.map(section => (
          <a key={section.title} href={`#${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            className="px-4 py-2 rounded-[var(--radius-md)] border border-white/10 text-sm font-medium text-white hover:border-[var(--color-primary)] bg-white/[0.04]">
            {section.title}
          </a>
        ))}
      </nav>
      {MCAT_NOTES_SECTIONS.map(section => (
        <section key={section.title} id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="mb-10 scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-6 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />
            <h2 className="text-xl font-extrabold text-[var(--color-text-primary)]">{section.title}</h2>
          </div>
          <div className="space-y-4">
            {section.topics.map((topic, i) => <TopicCard key={`${section.title}-${i}`} topic={topic} />)}
          </div>
        </section>
      ))}

      <div className="flex items-center gap-3 mb-2 mt-12">
        <span className="w-1.5 h-8 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />
        <h2 className="text-2xl font-extrabold text-[var(--color-text-primary)]">Exam-Depth Master Notes</h2>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8">
        Fact-level revision notes derived from the MDCAT past-paper corpus — every major unit,
        bucket by bucket. “×n” marks how many corpus questions ask the same fact (×3 = near-certain
        repeat).
      </p>

      {MCAT_DEEP_SECTIONS.map(section => (
        <section key={section.title} id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="mb-10 scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-6 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />
            <h2 className="text-xl font-extrabold text-[var(--color-text-primary)]">{section.title}</h2>
          </div>
          <div className="space-y-4">
            {section.topics.map((topic, i) => <TopicCard key={`${section.title}-${i}`} topic={topic} />)}
          </div>
        </section>
      ))}
      <div className="mt-8">
        <TrackedLink to="/dashboard/notes" className="text-sm font-medium text-[var(--color-primary)] hover:underline" label="master-notes">
          ← Back to Important Notes
        </TrackedLink>
      </div>
    </div>
  )
}