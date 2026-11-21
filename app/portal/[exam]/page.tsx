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

  // This is the actual shared bank count, not a per-variant promise.
  const bankSize = PORTAL_BANK_COUNTS[config.bank];
  const hasPastPapers = config.bank === "mdcat";

  return (
    <main className="min-h-screen bg-[var(--field-1)] text-[var(--steel-100)]">
      <header className="sticky top-0 z-50 border-b border-[var(--line-2)] bg-[var(--field-0)]/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/exams" className="shrink-0 text-sm text-[var(--steel-400)] transition-colors hover:text-[var(--steel-100)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal-300)]">
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
            The bank count is shared across this portal&apos;s listed exam variants; it is not a separate count for each target test.
          </p>
        </div>
      </section>

      {config.subtests.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
          <div className="border-t-2 border-[var(--signal-500)] bg-[var(--srf-1)] px-5 py-7 sm:px-8">
            <div className="mb-7 flex flex-col gap-3 border-b border-[var(--line-1)] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[var(--steel-100)]">Choose your target test</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--steel-400)]">
                  These variants share this portal&apos;s question bank. Their syllabi and paper rules may differ, so read the description before starting.
                </p>
              </div>
              <span className="text-xs text-[var(--steel-400)]">{config.subtests.length} listed variants</span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {config.subtests.map((sub) => (
                <Link
                  key={sub.id}
                  href={`${config.route}?subtest=${sub.id}`}
                  className="group flex flex-col justify-between border border-[var(--line-2)] bg-[var(--field-1)] p-4 transition-colors duration-[var(--dur-1)] hover:border-[var(--signal-400)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]"
                >
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-[var(--signal-300)]">Target test</span>
                      <span className="rounded-[var(--r-1)] bg-[var(--srf-2)] px-2 py-1 text-[10px] text-[var(--steel-400)]">Shared bank</span>
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--steel-100)] transition-colors group-hover:text-[var(--signal-300)]">
                      {sub.name}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[var(--steel-400)]">
                      {sub.description}
                    </p>
                  </div>
                  <div className="mt-5 border-t border-[var(--line-1)] pt-3 text-xs font-semibold text-[var(--signal-300)]">
                    Open practice →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.62fr]">
          <div>
            <div className="mb-5 border-b border-[var(--line-1)] pb-4">
              <h2 className="text-xl font-semibold text-[var(--steel-100)]">Syllabus &amp; core subjects</h2>
              <p className="mt-2 text-sm text-[var(--steel-400)]">The subject areas listed for this preparation space.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {config.subjects.map((subject) => (
                <div key={subject.id} className="border-l-2 border-[var(--line-3)] bg-[var(--srf-1)] px-4 py-4 transition-colors hover:border-[var(--signal-400)]">
                  <h3 className="text-sm font-semibold text-[var(--steel-100)]">{subject.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--steel-400)]">
                    Listed as a core subject area for this exam family. Check the current official syllabus for the exact scope and weighting.
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="h-fit border-t-2 border-[var(--line-3)] bg-[var(--srf-1)] p-6">
            <h3 className="text-lg font-semibold text-[var(--steel-100)]">Prep space resources</h3>
            <ul className="mt-4 space-y-1 text-sm">
              {config.features.notes && (
                <li className="flex items-center justify-between gap-3 border-b border-[var(--line-1)] py-3">
                  <span className="font-medium text-[var(--steel-200)]">Master concept notes</span>
                  <Link href="/notes" className="shrink-0 text-xs font-semibold text-[var(--signal-300)] hover:underline">Access →</Link>
                </li>
              )}
              {hasPastPapers && (
                <li className="flex items-center justify-between gap-3 border-b border-[var(--line-1)] py-3">
                  <span className="font-medium text-[var(--steel-200)]">Released past papers</span>
                  <Link href="/past-papers" className="shrink-0 text-xs font-semibold text-[var(--signal-300)] hover:underline">View →</Link>
                </li>
              )}
              {config.features.flashcards && (
                <li className="flex items-center justify-between gap-3 border-b border-[var(--line-1)] py-3">
                  <span className="font-medium text-[var(--steel-200)]">Active recall flashcards</span>
                  <Link href="/flashcards" className="shrink-0 text-xs font-semibold text-[var(--signal-300)] hover:underline">Revise →</Link>
                </li>
              )}
              {config.features.psychTest && (
                <li className="flex items-center justify-between gap-3 border-b border-[var(--line-1)] py-3">
                  <span className="font-medium text-[var(--steel-200)]">NUMS psychological test</span>
                  <span className="rounded-[var(--r-1)] bg-[var(--tint-signal)] px-2 py-1 text-xs font-semibold text-[var(--signal-300)]">Exclusive</span>
                </li>
              )}
              {config.features.intelligenceTest && (
                <li className="flex items-center justify-between gap-3 border-b border-[var(--line-1)] py-3">
                  <span className="font-medium text-[var(--steel-200)]">Verbal &amp; non-verbal drills</span>
                  <span className="rounded-[var(--r-1)] bg-[var(--tint-warn)] px-2 py-1 text-xs font-semibold text-[var(--warn)]">PMA focus</span>
                </li>
              )}
              {!config.features.notes && !hasPastPapers && !config.features.flashcards && !config.features.psychTest && !config.features.intelligenceTest && (
                <li className="py-3 text-xs leading-relaxed text-[var(--steel-400)]">No additional resources are listed for this space yet.</li>
              )}
            </ul>

            <div className="mt-6 border-t border-[var(--line-1)] pt-4">
              <p className="text-xs leading-relaxed text-[var(--steel-400)]">
                Tools and content vary by preparation space. Check the test directory for current availability before relying on a particular feature.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <footer className="mt-8 border-t border-[var(--line-2)] bg-[var(--field-0)] px-4 py-8 text-center">
        <Link href="/exams" className="text-sm font-medium text-[var(--signal-300)] hover:underline">Explore all preparation spaces</Link>
        <p className="mt-2 text-xs text-[var(--steel-500)]">© {new Date().getFullYear()} MED Prep · {config.name}</p>
      </footer>
    </main>
  );
}
