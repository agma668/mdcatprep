import { ExamHubSelector } from '@/components/exams/ExamHubSelector';
import { PORTAL_BANK_COUNTS } from '@/lib/stats';
import Link from 'next/link';

export const metadata = {
  title: 'Choose Your Test — Free Preparation for Every Major Entry Test',
  description: 'One free platform for MDCAT, NUMS, NUST NET, GIKI, LUMS, HEC USAT and PMA. Pick your test — each card shows what is open today and what is still being built.',
  // Without an explicit canonical this page inherited the site root, so it claimed to be a duplicate
  // of the homepage.
  alternates: { canonical: '/exams' },
};

export default function ExamsHubPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="font-extrabold text-lg text-foreground flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent" />
              MED Prep <span className="text-xs text-muted-foreground font-normal">Prep Spaces</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/notes" className="hidden text-xs font-semibold text-muted-foreground hover:text-foreground sm:block">
                Notes
              </Link>
              <Link href="/flashcards" className="hidden text-xs font-semibold text-muted-foreground hover:text-foreground sm:block">
                Flashcards
              </Link>
              <Link href="/login" className="text-xs font-semibold hover:text-accent transition-colors">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold shadow hover:opacity-90 transition-opacity"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </header>

        {/* Hero & Hub Selector */}
        <section className="py-12">
          {/* Counts are server-derived and passed in, so a card can never
              advertise a bank size the bank does not hold. Shared banks are
              labelled as shared in the registry summary. */}
          <ExamHubSelector
            counts={{
              'pmdc-mdcat': PORTAL_BANK_COUNTS.mdcat,
              'nust-net-engineering': PORTAL_BANK_COUNTS.nust,
              'hec-usat': PORTAL_BANK_COUNTS.usat,
              'pma-long-course': PORTAL_BANK_COUNTS.pma,
            }}
          />
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <nav aria-label="Footer" className="mb-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link href="/notes" className="hover:text-foreground">Notes</Link>
          <Link href="/flashcards" className="hover:text-foreground">Flashcards</Link>
          <Link href="/past-papers" className="hover:text-foreground">Past papers</Link>
          <Link href="/syllabus/mdcat" className="hover:text-foreground">MDCAT syllabus</Link>
          <Link href="/merit-calculator" className="hover:text-foreground">Merit calculator</Link>
          <Link href="/blog" className="hover:text-foreground">Blog</Link>
          <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
        </nav>
        <p>© {new Date().getFullYear()} MED Prep. All rights reserved.</p>
        {/* "Original PMDC, HEC and military-syllabus material" claimed authorship
            of material no one here wrote. This says what is actually true. */}
        <p className="mx-auto mt-1 max-w-xl">
          Questions are written by us from each test&apos;s published syllabus. Released papers are
          the boards&apos; own and labelled as such. Not affiliated with PMDC, NUMS, NUST, HEC or ISSB.
        </p>
      </footer>
    </main>
  );
}
