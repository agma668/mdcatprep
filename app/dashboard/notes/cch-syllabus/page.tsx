import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CCH_SYLLABUS_META, CCH_SYLLABUS_SECTIONS } from '@/lib/cch-syllabus'
import type { NoteBlock } from '@/lib/master-notes'
import Link from 'next/link'

export const metadata: Metadata = { title: 'CCH Entry-Test Syllabus' }

export const dynamic = 'force-dynamic'

function BlockText({ block }: { block: NoteBlock }) {
  if (block.type === 'bullet') {
    return (
      <li className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
        <span className="text-[var(--color-primary)] font-bold mt-0.5" aria-hidden="true">
          •
        </span>
        <span>{block.text}</span>
      </li>
    )
  }
  return <p className="text-sm text-[var(--color-text-secondary)]">{block.text}</p>
}

export default async function CchSyllabusPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <Link
          href="/dashboard/notes"
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          ← Back to Important Notes
        </Link>
      </div>

      <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 mb-8">
        <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-primary)] text-[var(--color-text-inverse)] text-xs font-semibold mb-3">
          {CCH_SYLLABUS_META.badge}
        </span>
        <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)]">
          {CCH_SYLLABUS_META.title}
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">{CCH_SYLLABUS_META.subtitle}</p>
        <a
          href="/cch-2026-syllabus.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/25 text-[var(--color-primary)] text-sm font-semibold hover:bg-[var(--color-primary)]/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          Download 2026 Syllabus (PDF)
        </a>
      </div>

      {/* Jump links */}
      <nav className="mb-8 flex flex-wrap gap-2">
        {CCH_SYLLABUS_SECTIONS.map(section => (
          <a
            key={section.title}
            href={`#${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            className="px-4 py-2 rounded-[var(--radius-md)] border border-white/10 text-sm font-medium text-white hover:border-[var(--color-primary)] bg-white/[0.04]"
          >
            {section.title}
          </a>
        ))}
      </nav>

      {CCH_SYLLABUS_SECTIONS.map(section => (
        <section
          key={section.title}
          id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
          className="mb-10 scroll-mt-24"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-6 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />
            <h2 className="text-xl font-extrabold text-[var(--color-text-primary)]">
              {section.title}
            </h2>
          </div>
          <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-5">
            <div className="space-y-2.5">
              {section.topics[0].blocks.map((block, i) =>
                block.type === 'bullet' ? (
                  <ul key={i} className="space-y-1.5">
                    <BlockText block={block} />
                  </ul>
                ) : (
                  <BlockText key={i} block={block} />
                )
              )}
            </div>
          </div>
        </section>
      ))}

      <div className="mt-8">
        <Link
          href="/dashboard/notes"
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          ← Back to Important Notes
        </Link>
      </div>
    </div>
  )
}
