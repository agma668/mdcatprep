import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { getSiteUrl } from '@/lib/site'
import {
  UHS_2025_DURATION_MINUTES,
  UHS_2025_PAPER,
  UHS_2025_SECTIONS,
} from '@/lib/uhs-2025-paper'
import type { QuizQuestion } from '@/lib/questions'
import { Uhs2025Sitting } from '@/components/past-papers/Uhs2025Sitting'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'UHS MDCAT 2025 Paper ID-D — Sit the 180-Question Paper Timed',
  description:
    'The UHS MDCAT 2025 Paper ID-D as a timed sitting: 180 questions in the printed order, 180 minutes, marked against the official key dated 26-10-2025. Biology 81 · Chemistry 45 · Physics 36 · English 9 · Logical Reasoning 9.',
  alternates: { canonical: '/past-papers/uhs-2025' },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/past-papers/uhs-2025`,
    title: 'UHS MDCAT 2025 Paper ID-D — Timed Sitting | MED Prep',
    description:
      'Sit the real UHS 2025 paper: 180 questions, 180 minutes, official key. No sign-in needed to start.',
    siteName: 'MED Prep',
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: 'UHS MDCAT 2025 Paper ID-D timed sitting' }],
  },
}

/**
 * The paper's own order is kept: a real sitting is not a shuffled drill, and
 * question 1 of the paper is question 1 here. Provenance rides on every row so
 * an attempt recorded elsewhere can never be mistaken for an original question.
 */
const QUESTIONS: QuizQuestion[] = UHS_2025_PAPER.map((q) => ({
  key: q.key,
  subject: q.subject,
  topic: null,
  question_text: q.question_text,
  option_a: q.option_a,
  option_b: q.option_b,
  option_c: q.option_c,
  option_d: q.option_d,
  correct_answer: q.correct_answer,
  explanation: null,
  difficulty: null,
  college: null,
  past_paper_exam: 'UHS MDCAT',
  past_paper_year: 2025,
  past_paper_section: q.subject,
}))

export default function Uhs2025PaperPage() {
  return (
    <div className="dark-surface min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
      <Navbar />
      <main className="pb-20 pt-28">
        <div className="container-page">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs font-semibold text-[var(--steel-400)]">
            <Link href="/past-papers" className="underline underline-offset-4 hover:text-white">
              Past papers
            </Link>
            <span className="mx-2 text-[var(--steel-600)]">/</span>
            <Link href="/past-papers/uhs-mdcat" className="underline underline-offset-4 hover:text-white">
              UHS MDCAT
            </Link>
            <span className="mx-2 text-[var(--steel-600)]">/</span>
            <span className="text-[var(--steel-300)]">2025 · Paper ID-D</span>
          </nav>

          <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            UHS MDCAT 2025 — Paper ID-D, as a timed sitting
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--steel-300)]">
            The paper as it was sat, in its printed order, marked against the official UHS answer key
            dated 26-10-2025 that ships in the same file. No sign-in, no download, no reconstruction:
            180 questions from the paper itself.
          </p>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--steel-500)]">Questions</dt>
              <dd className="mt-0.5 font-extrabold text-white">{UHS_2025_PAPER.length}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--steel-500)]">Time</dt>
              <dd className="mt-0.5 font-extrabold text-white">{UHS_2025_DURATION_MINUTES} minutes</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--steel-500)]">Key</dt>
              <dd className="mt-0.5 font-extrabold text-white">Official UHS, 26 Oct 2025</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--steel-500)]">Sections</dt>
              <dd className="mt-0.5 font-extrabold text-white">
                {UHS_2025_SECTIONS.map((s) => `${s.name} ${s.questions}`).join(' · ')}
              </dd>
            </div>
          </dl>

          <div className="mt-8">
            <Uhs2025Sitting questions={QUESTIONS} durationMinutes={UHS_2025_DURATION_MINUTES} />
          </div>

          <section className="mt-10 max-w-3xl text-sm leading-relaxed text-[var(--steel-400)]">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--steel-300)]">
              What this sitting does and does not claim
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>The questions, their order and the answer letters come from the UHS 2025 Paper ID-D file and its printed key. Nothing is rewritten or reordered.</li>
              <li>No explanations are attached, because the paper does not carry any. Inventing them would undermine the one thing this page is for.</li>
              <li>No negative marking is applied: the score counts answers that match the key.</li>
              <li>Results are not stored against an account on this page; signed-in practice attempts are recorded separately.</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
