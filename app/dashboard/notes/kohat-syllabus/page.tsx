import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Kohat Cadet Entry-Test Syllabus' }
export const dynamic = 'force-dynamic'

const SECTIONS = [
  {
    title: 'Mathematics (50 Marks)',
    topics: [
      { title: 'Arithmetic', items: ['Number operations and properties', 'Fractions and decimals', 'Percentage and ratio', 'Profit, loss and discount', 'Simple and compound interest', 'Time, distance and speed'] },
      { title: 'Algebra', items: ['Algebraic expressions', 'Linear equations', 'Factorization', 'Indices (basic)', 'Word problems using algebra'] },
      { title: 'Geometry', items: ['Lines and angles', 'Triangles (types and properties)', 'Quadrilaterals', 'Circles (basic)', 'Area and perimeter'] },
      { title: 'Mensuration & Statistics', items: ['Volume of solids', 'Surface area', 'Mean, median and mode', 'Bar charts and frequency tables', 'Basic probability'] },
    ],
  },
  {
    title: 'English (50 Marks)',
    topics: [
      { title: 'Grammar', items: ['Parts of speech', 'Tenses', 'Active and passive voice', 'Articles and prepositions', 'Punctuation rules', 'Sentence correction'] },
      { title: 'Vocabulary', items: ['Synonyms and antonyms', 'One-word substitutions', 'Spellings', 'Word meanings and usage'] },
      { title: 'Comprehension', items: ['Passage reading', 'Answering questions from passage', 'Main idea and summary', 'Inference questions'] },
      { title: 'Writing', items: ['Letter writing (formal and informal)', 'Paragraph writing', 'Essay basics', 'Dialogue writing'] },
    ],
  },
  {
    title: 'General Science (50 Marks)',
    topics: [
      { title: 'Physics', items: ['Force, motion and energy', 'Light and sound', 'Heat and temperature', 'Electricity (basic)', 'Simple machines'] },
      { title: 'Chemistry', items: ['Matter and its states', 'Elements and compounds', 'Chemical reactions', 'Acids and bases', 'Mixtures'] },
      { title: 'Biology', items: ['Cell biology basics', 'Human body systems', 'Plant biology', 'Environment', 'Disease and prevention'] },
    ],
  },
  {
    title: 'GK & Urdu (50 Marks)',
    topics: [
      { title: 'General Knowledge', items: ['Pakistan geography', 'History of Pakistan', 'Current affairs', 'World capitals and currencies', 'Sports and awards', 'Important organizations (UN, OIC)'] },
      { title: 'Urdu', items: ['Haroof-e-Tahaji', 'Ism, sifat, fail', 'Singular and plural', 'Comprehension ( nazm / ghazal)', 'Letter and essay writing', 'Rumooz (punctuation)'] },
    ],
  },
]

export default async function KohatSyllabusPage() {
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
        <span className="inline-block px-3 py-1 rounded-full bg-violet-600 text-white text-xs font-semibold mb-3">
          Official · Kohat Cadet Entry Test
        </span>
        <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)]">
          Kohat Cadet College — Entry-Test Syllabus
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Complete syllabus for Kohat Cadet College Class 8 entry test
        </p>
      </div>

      <nav className="mb-8 flex flex-wrap gap-2">
        {SECTIONS.map(section => (
          <a
            key={section.title}
            href={`#${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            className="px-4 py-2 rounded-[var(--radius-md)] border border-white/10 text-sm font-medium text-white hover:border-violet-500 bg-white/[0.04]"
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
            <span className="w-1.5 h-6 rounded-full bg-violet-500" aria-hidden="true" />
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
                      <span className="text-violet-500 font-bold mt-0.5" aria-hidden="true">•</span>
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
