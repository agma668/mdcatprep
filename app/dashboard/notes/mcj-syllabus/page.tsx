import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata: Metadata = { title: 'MCJ Entry-Test Syllabus' }
export const dynamic = 'force-dynamic'

const SECTIONS = [
  {
    title: 'Mathematics (50 Marks)',
    topics: [
      { title: 'Arithmetic', items: ['Whole numbers, fractions and decimals', 'Percentage, ratio and proportion', 'Profit and loss', 'Simple interest', 'Unitary method', 'Time and work'] },
      { title: 'Algebra', items: ['Basic algebraic expressions', 'Linear equations', 'Simple simultaneous equations', 'Factorization (basic)', 'Exponents and powers'] },
      { title: 'Geometry', items: ['Lines, angles and triangles', 'Properties of quadrilaterals', 'Circle (basic properties)', 'Perimeter and area', 'Volume of cuboid and cylinder'] },
      { title: 'Mensuration', items: ['Surface area of cube, cuboid', 'Volume conversions', 'Pythagoras theorem applications', 'Practical geometry constructions'] },
    ],
  },
  {
    title: 'English & Urdu (50 Marks)',
    topics: [
      { title: 'English Grammar', items: ['Tenses', 'Articles (a, an, the)', 'Prepositions', 'Active and passive voice', 'Direct and indirect narration', 'Punctuation'] },
      { title: 'English Vocabulary', items: ['Synonyms and antonyms', 'One-word substitutions', 'Correct spellings', 'Word meanings'] },
      { title: 'English Comprehension', items: ['Passage reading and answering', 'Main idea identification', 'Inferential questions', 'Context clues'] },
      { title: 'Urdu', items: ['Haroof-e-Tahaji', 'Alfaaz ki taareef', 'Mutalqa (singular/plural)', 'Ism faail mafrool', 'Comprehension (nazm aur ghazal)', 'Inshaiya (essay writing)'] },
    ],
  },
  {
    title: 'General Science (50 Marks)',
    topics: [
      { title: 'Physics', items: ['Force and motion', 'Energy and its forms', 'Light and sound', 'Heat and temperature', 'Simple machines'] },
      { title: 'Chemistry', items: ['Elements and compounds', 'States of matter', 'Chemical reactions (basic)', 'Acids, bases and salts', 'Mixtures and solutions'] },
      { title: 'Biology', items: ['Cell structure', 'Human body systems', 'Plants and photosynthesis', 'Environment and ecosystems', 'Health and hygiene'] },
    ],
  },
  {
    title: 'Aptitude & Islamiat (50 Marks)',
    topics: [
      { title: 'Aptitude', items: ['Number series and patterns', 'Verbal reasoning', 'Non-verbal reasoning (figures)', 'Coding-decoding', 'Blood relations', 'Direction and distance'] },
      { title: 'Islamiat', items: ['Seerat-un-Nabi (PBUH)', 'Important events in Islamic history', 'Farz and wajibat', 'Pillars of Islam', 'Quranic verses (selected)', 'Hadith (selected)'] },
    ],
  },
]

export default async function McjSyllabusPage() {
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
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold mb-3">
          Official · MCJ Jhelum Entry Test
        </span>
        <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)]">
          Military College Jhelum — Entry-Test Syllabus
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Complete syllabus for MCJ Jhelum Class 8 entry test
        </p>
      </div>

      <nav className="mb-8 flex flex-wrap gap-2">
        {SECTIONS.map(section => (
          <a
            key={section.title}
            href={`#${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            className="px-4 py-2 rounded-[var(--radius-md)] border border-white/10 text-sm font-medium text-white hover:border-emerald-500 bg-white/[0.04]"
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
            <span className="w-1.5 h-6 rounded-full bg-emerald-500" aria-hidden="true" />
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
                      <span className="text-emerald-500 font-bold mt-0.5" aria-hidden="true">•</span>
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
