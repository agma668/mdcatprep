import { EXAMS_CONFIG, ExamCategory } from "@/lib/exams-config";
import { PORTAL_BANK_COUNTS } from "@/lib/stats";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{ exam: string }>;
}

export async function generateStaticParams() {
  return Object.keys(EXAMS_CONFIG).map((exam) => ({ exam }));
}

export default async function ExamPortalPage({ params }: PageProps) {
  const { exam } = await params;
  const config = EXAMS_CONFIG[exam as ExamCategory];

  if (!config) {
    notFound();
  }

  // Real bank size from lib/stats.ts — the same derived source every other
  // surface reads, so the portal can never advertise a count the bank does
  // not hold. (The old hand-typed "220+ MCQs" per subject was pure fiction.)
  const bankSize = PORTAL_BANK_COUNTS[config.bank];
  const hasPastPapers = config.bank === 'mdcat'; // only the medical track holds real released papers

  return (
    <main className="min-h-screen bg-[var(--field-1)] text-[var(--steel-100)]">
      <header className="sticky top-0 z-50 border-b border-[var(--line-2)] bg-[var(--field-0)]/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/exams" className="shrink-0 text-sm text-[var(--steel-400)] transition-colors hover:text-[var(--steel-100)]">
              ← All spaces
            </Link>
            <span aria-hidden="true" className="text-[var(--steel-600)]">/</span>
            <span className="truncate text-sm font-semibold text-[var(--steel-100)]">{config.name}</span>
          </div>
          <span className="hidden rounded-[var(--r-pill)] border border-[var(--line-signal)] bg-[var(--tint-signal)] px-3 py-1 text-xs font-semibold text-[var(--signal-300)] sm:inline-flex">
            {config.badge}
          </span>
        </div>
      </header>

      <section className="border-b border-[var(--line-2)] bg-[var(--field-2)] px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-xs font-semibold text-[var(--signal-300)]">PREPARATION SPACE</p>
          <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight text-[var(--steel-100)] sm:text-5xl">
            {config.name}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[var(--steel-300)] sm:text-lg">
            {config.tagline}.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {config.features.practice && (
              <Link
                href={config.practiceRoute ?? config.route}
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--r-2)] bg-[linear-gradient(180deg,var(--cta-from)_0%,var(--cta-to)_100%)] px-5 py-3 text-sm font-semibold text-[var(--on-cta)] shadow-[var(--shadow-cta)] transition-[filter,transform] hover:-translate-y-px hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]"
              >
                Start practice
              </Link>
            )}
            {config.features.mockTests && (
              <Link
                href="/dashboard/mock-test"
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--r-2)] border border-[var(--line-3)] bg-[var(--srf-1)] px-5 py-3 text-sm font-semibold text-[var(--steel-100)] transition-colors hover:bg-[var(--srf-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]"
              >
                Open mock-test workspace
              </Link>
            )}
            <span className="text-xs text-[var(--steel-400)] tabular-nums">
              {bankSize.toLocaleString("en-US")} questions in the shared {config.bank.toUpperCase()} bank
            </span>
          </div>
          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-[var(--steel-400)]">
            Bank size is shared across this portal&apos;s listed exam variants; it is not a separate count for each target test.
          </p>
        </div>
      </section>

        {/* Sub-Tests Selector Section (Boss requirement: select exact test inside portal) */}
        {config.subtests && config.subtests.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
            <div className="border-t-2 border-[var(--signal-500)] bg-[var(--srf-1)] px-5 py-7 sm:px-8">
              <div className="mb-7 flex flex-col gap-3 border-b border-[var(--line-1)] pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--steel-100)]">Choose your target test</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--steel-400)]">
                    These variants share this portal&apos;s question bank. Their syllabi and paper rules may differ, so check the description before starting.
                  </p>
                </div>
                <span className="text-xs text-[var(--steel-400)]">{config.subtests.length} listed variants</span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {config.subtests.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`${config.route}?subtest=${sub.id}`}
                    className="group flex flex-col justify-between border border-[var(--line-2)] bg-[var(--field-1)] p-4 transition-colors duration-[var(--dur-1)] hover:border-[var(--signal-400)]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[var(--signal-300)]">Target test</span>
                        {/* The bank is shared across a portal's subtests — say
                            that plainly instead of per-card "Active" badges
                            that implied bespoke question sets. */}
                        <span className="rounded-[var(--r-1)] bg-[var(--srf-2)] px-2 py-1 text-[10px] text-[var(--steel-400)]">
                          Shared bank
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-[var(--steel-100)] transition-colors group-hover:text-[var(--signal-300)]">
                        {sub.name}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[var(--steel-400)]">
                        {sub.description}
                      </p>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-[var(--line-1)] pt-3 text-xs font-semibold text-[var(--signal-300)]">
                      <span>Open practice →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Subject Breakdown & Features */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.62fr]">
            {/* Subjects List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="mb-5 border-b border-[var(--line-1)] pb-4">
                <h2 className="text-xl font-semibold text-[var(--steel-100)]">Syllabus &amp; core subjects</h2>
                <p className="mt-2 text-sm text-[var(--steel-400)]">The subject areas listed for this preparation space.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {config.subjects.map((sub) => (
                  <div key={sub.id} className="border-l-2 border-[var(--line-3)] bg-[var(--srf-1)] px-4 py-4 transition-colors hover:border-[var(--signal-400)]">
                    <h3 className="text-sm font-semibold text-[var(--steel-100)]">{sub.name}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--steel-400)]">
                      Chapter-wise practice drills, explanations behind every answer, and exam-pattern questions.
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Access Card */}
            <aside className="h-fit border-t-2 border-[var(--line-3)] bg-[var(--srf-1)] p-6">
              <h3 className="text-lg font-semibold text-[var(--steel-100)]">Prep space resources</h3>
              <ul className="mt-4 space-y-1 text-sm">
                {config.features.notes && (
                  <li className="flex items-center justify-between gap-3 border-b border-[var(--line-1)] py-3">
                    <span className="text-foreground font-medium">Master Concept Notes</span>
                    <Link href="/notes" className="shrink-0 text-xs font-semibold text-[var(--signal-300)] hover:underline">Access →</Link>
                  </li>
                )}
                {hasPastPapers && (
                  <li className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-foreground font-medium">Released Past Papers</span>
                    <Link href="/past-papers" className="text-xs text-accent font-semibold hover:underline">View →</Link>
                  </li>
                )}
                {config.features.flashcards && (
                  <li className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-foreground font-medium">Active Recall Flashcards</span>
                    <Link href="/flashcards" className="text-xs text-accent font-semibold hover:underline">Revise →</Link>
                  </li>
                )}
                {config.features.psychTest && (
                  <li className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-foreground font-medium">NUMS Psychological Test</span>
                    <span className="rounded-[var(--r-1)] bg-[var(--tint-signal)] px-2 py-1 text-xs font-semibold text-[var(--signal-300)]">Exclusive</span>
                  </li>
                )}
                {config.features.intelligenceTest && (
                  <li className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-foreground font-medium">Verbal & Non-Verbal IQ</span>
                    <span className="rounded-[var(--r-1)] bg-[var(--tint-warn)] px-2 py-1 text-xs font-semibold text-[var(--warn)]">PMA Focus</span>
                  </li>
                )}
              </ul>

              <div className="mt-6 border-t border-[var(--line-1)] pt-4">
                <p className="text-xs leading-relaxed text-[var(--steel-400)]">
                  Tools and content vary by preparation space. Check the current status on the test directory before relying on a particular feature.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-8 border-t border-[var(--line-2)] bg-[var(--field-0)] px-4 py-8 text-center">
        <Link href="/exams" className="text-sm font-medium text-[var(--signal-300)] hover:underline">Explore all preparation spaces</Link>
        <p className="mt-2 text-xs text-[var(--steel-500)]">© {new Date().getFullYear()} MED Prep · {config.name}</p>
      </footer>
    </main>
  );
}
