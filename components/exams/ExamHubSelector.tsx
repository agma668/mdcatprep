'KeyFeatures: Multi-exam selector grid for Apex Pakistan education ecosystem'
import Link from 'next/link';
import { EXAMS_CONFIG } from '@/lib/exams-config';

export function ExamHubSelector() {
  const exams = Object.values(EXAMS_CONFIG);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-3">
          Apex Pakistan Educational Network
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
          Choose Your Competitive Exam Track
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto text-sm md:text-base">
          From medical college entrance and military commissions to engineering universities and professional MBBS exams — master your future on one unified platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="group relative bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Gradient Header Accent */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${exam.accentColor}`} />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">
                  {exam.badge}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {exam.subjects.length} Categories
                </span>
              </div>

              <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                {exam.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                {exam.tagline}
              </p>

              {/* Subject preview list */}
              <div className="space-y-2 mb-6">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Core Modules:</div>
                <ul className="space-y-1">
                  {exam.subjects.slice(0, 3).map((sub) => (
                    <li key={sub.id} className="text-xs text-foreground/80 flex items-center justify-between py-1 border-b border-border/50">
                      <span>{sub.name}</span>
                      <span className="text-muted-foreground">practice set</span>
                    </li>
                  ))}
                  {exam.subjects.length > 3 && (
                    <li className="text-xs text-accent font-medium pt-1">
                      + {exam.subjects.length - 3} more modules & topics
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {exam.features.mockTests && <span>• Mock Tests</span>}
                {exam.features.flashcards && <span>• Flashcards</span>}
                {exam.features.notes && <span>• Master Notes</span>}
              </div>

              <Link
                href={exam.route}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold shadow hover:opacity-90 transition-opacity"
              >
                <span>Enter Portal</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
