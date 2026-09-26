import { EXAMS_CONFIG, ExamCategory } from '@/lib/exams-config';
import { notFound } from 'next/navigation';
import Link from 'next/link';

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

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/exams" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                ← All Portals
              </Link>
              <span className="text-border">/</span>
              <span className="font-extrabold text-sm text-foreground">{config.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-semibold">
                {config.badge}
              </span>
            </div>
          </div>
        </header>

        {/* Portal Hero */}
        <section className="relative overflow-hidden border-b border-border bg-card/30 py-16 px-4">
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.accentColor}`} />
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
              {config.name}
            </h1>
            <p className="text-muted-foreground mt-3 text-base md:text-lg max-w-2xl mx-auto">
              {config.tagline}. Master every topic with chapter-wise practice, simulated mock tests, and verified master notes.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              {config.features.practice && (
                <Link
                  href={`${config.route}`}
                  className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow hover:opacity-90 transition-opacity"
                >
                  Start Practice Session
                </Link>
              )}
              {config.features.mockTests && (
                <Link
                  href="/dashboard/mock-test"
                  className="px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm border border-border hover:bg-muted transition-colors"
                >
                  Take Mock Test
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Subject Breakdown & Features */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Subjects List */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-foreground">Syllabus & Core Subjects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.subjects.map((sub) => (
                  <div key={sub.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-accent/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                        {sub.count}+ MCQs
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground text-base">{sub.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Chapter-wise practice drills, explanation notes, and exam-pattern questions.
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Access Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 h-fit">
              <h3 className="font-bold text-foreground text-lg">Portal Resources</h3>
              <ul className="space-y-3 text-sm">
                {config.features.notes && (
                  <li className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-foreground font-medium">Master Concept Notes</span>
                    <Link href="/notes" className="text-xs text-accent font-semibold hover:underline">Access →</Link>
                  </li>
                )}
                {config.features.pastPapers && (
                  <li className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-foreground font-medium">Sourced Past Papers</span>
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
                    <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent font-bold">Exclusive</span>
                  </li>
                )}
                {config.features.intelligenceTest && (
                  <li className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-foreground font-medium">Verbal & Non-Verbal IQ</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold">PMA Focus</span>
                  </li>
                )}
              </ul>

              <div className="pt-4 border-t border-border">
                <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 text-xs text-foreground/90">
                  <span className="font-bold text-accent">Pro Tip:</span> Upgrade to Apex All-Access Pass to unlock unlimited mock tests and AI doubt solving across all exam portals.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Apex Pakistan Educational Network. {config.name} Portal.</p>
      </footer>
    </main>
  );
}
