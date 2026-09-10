import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata: Metadata = { title: 'PAF Sargodha Entry-Test Syllabus' }
export const dynamic = 'force-dynamic'

const SECTIONS = [
  {
    title: 'Mathematics (50 Marks)',
    topics: [
      { title: 'Arithmetic', items: ['Number system and operations', 'Fractions, decimals and percentages', 'Ratio and proportion', 'Profit, loss and discount', 'Simple and compound interest', 'Time, speed and distance'] },
      { title: 'Algebra', items: ['Linear equations in one variable', 'Simultaneous equations', 'Algebraic expressions and factorization', 'Quadratic equations (basic)', 'Indices and surds'] },
      { title: 'Geometry', items: ['Angles and triangles', 'Circle theorems', 'Area and perimeter of plane figures', 'Volume and surface area of solids', 'Pythagoras theorem'] },
      { title: 'Statistics', items: ['Data collection and representation', 'Mean, median and mode', 'Frequency tables and bar charts', 'Basic probability'] },
    ],
  },
  {
    title: 'English (50 Marks)',
    topics: [
      { title: 'Grammar', items: ['Tenses (present, past, future)', 'Active and passive voice', 'Direct and indirect speech', 'Articles and prepositions', 'Subject-verb agreement', 'Pairs of words (usage)'] },
      { title: 'Vocabulary', items: ['Synonyms and antonyms', 'One-word substitutions', 'Idioms and phrases', 'Spellings and word meanings'] },
      { title: 'Comprehension', items: ['Reading comprehension passages (300-400 words)', 'Answering inferential questions', 'Summary and main idea identification', 'Contextual vocabulary meaning'] },
      { title: 'Essay Writing', items: ['Narrative essays', 'Descriptive essays', 'Paragraph development', 'Coherence and cohesion'] },
    ],
  },
  {
    title: 'General Knowledge (50 Marks)',
    topics: [
      { title: 'Pakistan Studies', items: ['History of Pakistan (1857–1947)', 'Important dates and events', 'Geography of Pakistan', 'Famous personalities'] },
      { title: 'Current Affairs', items: ['Major world events', 'Sports achievements', 'Scientific discoveries', 'Awards and honours (Pakistani)'] },
      { title: 'World Knowledge', items: ['Capitals and currencies', 'International organizations', 'Important treaties and agreements', 'World geography basics'] },
    ],
  },
  {
    title: 'Analytical Reasoning (50 Marks)',
    topics: [
      { title: 'Logic & Reasoning', items: ['Number and letter series', 'Coding and decoding', 'Blood relations', 'Direction sense', 'Syllogisms', 'Statement and conclusions'] },
      { title: 'Problem Solving', items: ['Puzzles and patterns', 'Missing figures', 'Analogies', 'Classification (odd one out)', 'Venn diagrams'] },
    ],
  },
]

export default async function PafSargodhaSyllabusPage() {
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
        <span className="inline-block px-3 py-1 rounded-full bg-sky-600 text-white text-xs font-semibold mb-3">
          Official · PAF Sargodha Entry Test
        </span>
        <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)]">
          PAF Sargodha Entry-Test Syllabus
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Complete syllabus for PAF College Sargodha Class 8 entry test
        </p>
      </div>

      <nav className="mb-8 flex flex-wrap gap-2">
        {SECTIONS.map(section => (
          <a
            key={section.title}
            href={`#${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            className="px-4 py-2 rounded-[var(--radius-md)] border border-white/10 text-sm font-medium text-white hover:border-sky-500 bg-white/[0.04]"
          >
            {section.title}
          </a>
        ))}
      </nav>

      {SECTIONS.map(section => (
        <section
          key={section.title}
          id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
          className="mb-10 scroll-mt-24"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-6 rounded-full bg-sky-500" aria-hidden="true" />
            <h2 className="text-xl font-extrabold text-[var(--color-text-primary)]">
              {section.title}
            </h2>
          </div>
          <div className="space-y-4">
            {section.topics.map(topic => (
              <div key={topic.title} className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-5">
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
                  {topic.title}
                </h3>
                <ul className="space-y-1.5">
                  {topic.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                      <span className="text-sky-500 font-bold mt-0.5" aria-hidden="true">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
