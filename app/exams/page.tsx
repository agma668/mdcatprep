import { ExamHubSelector } from '@/components/exams/ExamHubSelector';
import Link from 'next/link';

export const metadata = {
  title: 'Apex Pakistan — National Competitive Exam Preparation Hub',
  description: 'MDCAT, PMA Long Course, NUST NET, HEC USAT & MBBS Professional Exam preparation platform.',
};

export default function ExamsHubPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="font-extrabold text-lg text-foreground flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent animate-pulse" />
              Apex Pakistan <span className="text-xs text-muted-foreground font-normal">Unified Portal</span>
            </Link>
            <div className="flex items-center gap-4">
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
          <ExamHubSelector />
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Apex Pakistan Educational Network. All rights reserved.</p>
        <p className="mt-1">Honesty is our product. Original PMDC, HEC, and military-syllabus prep material.</p>
      </footer>
    </main>
  );
}
