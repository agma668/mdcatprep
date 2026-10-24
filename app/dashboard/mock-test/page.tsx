import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { USAT_MOCK_SPLIT, USAT_MOCK_TOTAL } from '@/lib/usat-mock'
import {
  buildNetMockSections,
  netMockMinutes,
} from '@/lib/nust-mock'
import { NUST_NET_BANK } from '@/lib/nust-questions'
import {
  buildPmaMockSections,
  pmaMockMinutes,
} from '@/lib/pma-mock'
import { PMA_QUESTIONS } from '@/lib/pma-questions'
import { MockTestSetup } from './MockTestSetup'

export const metadata: Metadata = { title: 'Mock Test' }
export const dynamic = 'force-dynamic'

/**
 * The HEC USAT-M scholarship paper's sections come from the USAT mock lib so
 * the format card, the assembled paper and the pattern line it names can never
 * drift apart — one split, three readers.
 */
const USAT_M_FORMAT = {
  id: 'usat-m',
  name: 'HEC USAT-M Scholarship Mock',
  duration: 100,
  totalMarks: USAT_MOCK_TOTAL,
  description:
    'The Balochistan / ex-FATA scholarship pattern — Verbal 26 · Quantitative 32 · Physics 11 · Chemistry 11 · Biology 20, 50% pass — sectioned like the real paper, served from the dedicated USAT bank.',
  sections: USAT_MOCK_SPLIT.map((s) => ({ name: s.subject, questions: s.count, marks: s.count })),
}

/**
 * The NET-Engineering paper's sections derive from the bundled bank at render
 * time (each official-paper share clamped to what the bank holds), so the
 * format card and the assembled paper can never drift apart — one clamp, two
 * readers, the same rule the USAT format card follows.
 */
const NET_FORMAT = {
  id: 'net-eng',
  name: 'NUST NET-Engineering Mock',
  duration: netMockMinutes(NUST_NET_BANK),
  totalMarks: buildNetMockSections(NUST_NET_BANK).reduce((sum, s) => sum + s.count, 0),
  description:
    'The official NET-Engineering weighting — Mathematics 50% · Physics 30% · English 20% (200 MCQs · 180 min · no negative, verbatim from nust.edu.pk), served from the NET bank and paced at the real 0.9 min per MCQ. Chemistry is not on the official engineering paper. The bank currently holds 81 questions, so this runs scaled-down, not 200.',
  sections: buildNetMockSections(NUST_NET_BANK).map((s) => ({
    name: s.subject,
    questions: s.count,
    marks: s.count,
  })),
}

const PMA_BANK = PMA_QUESTIONS

/**
 * The military papers derive from the bundled PMA bank at render time, the
 * same one-clamp-two-readers rule the USAT and NET format cards follow. The
 * descriptions name the honesty out loud: no official counts exist anywhere,
 * so the clock is this site's own pacing, and the questions are original.
 */
const PMA_FORMAT = {
  id: 'pma-initials',
  name: 'PMA Long Course Initials Mock',
  duration: pmaMockMinutes(PMA_BANK, 'pma'),
  totalMarks: buildPmaMockSections(PMA_BANK, 'pma').reduce((sum, s) => sum + s.count, 0),
  description:
    'An original paper-style simulation of the PMA Long Course initial test — Verbal · Non-Verbal · Academic, in the reported paper order. joinpakarmy.gov.pk publishes no question counts or timings, so this runs scaled to the bundled PMA bank (41 questions) at our own pacing (0.75 min per verbal item, 1 min per non-verbal/academic). Original sample questions — not official PMA papers.',
  sections: buildPmaMockSections(PMA_BANK, 'pma').map((s) => ({
    name: s.category,
    questions: s.count,
    marks: s.count,
  })),
}

const ISSB_FORMAT = {
  id: 'issb-intelligence',
  name: 'ISSB Intelligence Mock',
  duration: pmaMockMinutes(PMA_BANK, 'issb'),
  totalMarks: buildPmaMockSections(PMA_BANK, 'issb').reduce((sum, s) => sum + s.count, 0),
  description:
    'The intelligence-only variant of the same bank — Verbal + Non-Verbal, the sections ISSB preparation drills. Same original paper-style rules as the PMA initials mock: scaled to the bank, clocked at our own pacing, no negative marking. Original sample questions — not official ISSB papers.',
  sections: buildPmaMockSections(PMA_BANK, 'issb').map((s) => ({
    name: s.category,
    questions: s.count,
    marks: s.count,
  })),
}

const TEST_FORMATS = [
  {
    id: 'full',
    name: 'MDCAT-Weighted Full Mock',
    duration: 180, // 3 hours
    totalMarks: 100,
    sections: [
      { name: 'Biology', questions: 34, marks: 34 },
      { name: 'Chemistry', questions: 24, marks: 24 },
      { name: 'Physics', questions: 30, marks: 30 },
      { name: 'English', questions: 12, marks: 12 },
    ],
  },
  {
    id: 'bio-heavy',
    name: 'Biology Focus (60 min)',
    duration: 60,
    totalMarks: 40,
    sections: [
      { name: 'Biology', questions: 40, marks: 40 },
    ],
  },
  {
    id: 'quick',
    name: 'Quick Practice (30 min)',
    duration: 30,
    totalMarks: 25,
    sections: [
      { name: 'Mixed', questions: 25, marks: 25 },
    ],
  },
  USAT_M_FORMAT,
  NET_FORMAT,
  PMA_FORMAT,
  ISSB_FORMAT,
]

export default async function MockTestPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      <PageHeader
        eyebrow="Full-length simulation"
        title="Mock Test"
        description="Timed, sectioned mock tests. The board mocks weight the PMDC MDCAT paper — Biology heaviest, then Physics and Chemistry, then English — and pull from the academy question bank; the HEC USAT-M paper runs its official scholarship split (100 MCQs · 100 minutes); the NUST NET-Engineering mock runs NUST's official Math 50% · Physics 30% · English 20% weighting, scaled to the NET bank at real paper pacing; the military mocks run the PMA-style paper and its ISSB intelligence-only variant, assembled from the bundled PMA bank. 1 mark per MCQ."
      />
      <MockTestSetup formats={TEST_FORMATS} />
    </div>
  )
}
