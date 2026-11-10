import { ExamHubSelector } from "@/components/exams/ExamHubSelector";
import Link from "next/link";

export const metadata = {
  title: "Choose Your Preparation Space",
  description: "Explore distinct preparation spaces for Pakistan's medical, engineering, scholarship and defence entry tests. See available tools and readiness before you begin.",
};

export default function ExamsHubPage() {
  return (
    <main className="min-h-screen bg-[var(--field-1)] text-[var(--steel-100)]">
      <header className="sticky top-0 z-50 border-b border-[var(--line-2)] bg-[var(--field-0)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-3 rounded-[var(--r-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal-300)]">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[var(--brass)]" />
            <span className="text-base font-bold tracking-tight">MED Prep</span>
            <span className="hidden border-l border-[var(--line-2)] pl-3 text-xs text-[var(--steel-400)] sm:inline">Preparation spaces</span>
          </Link>
          <nav aria-label="Account navigation" className="flex items-center gap-3">
            <Link href="/" className="hidden text-sm text-[var(--steel-300)] transition-colors hover:text-[var(--steel-100)] sm:inline">Home</Link>
            <Link href="/login" className="rounded-[var(--r-1)] px-3 py-2 text-sm font-medium text-[var(--steel-300)] transition-colors hover:text-[var(--steel-100)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]">Sign in</Link>
            <Link href="/signup" className="inline-flex min-h-10 items-center justify-center rounded-[var(--r-2)] bg-[linear-gradient(180deg,var(--cta-from)_0%,var(--cta-to)_100%)] px-4 py-2 text-sm font-semibold text-[var(--on-cta)] shadow-[var(--shadow-cta)] transition-[filter] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]">Create account</Link>
          </nav>
        </div>
      </header>

      <ExamHubSelector />

      <footer className="border-t border-[var(--line-2)] bg-[var(--field-0)] px-4 py-8 text-center">
        <p className="text-sm text-[var(--steel-300)]">© {new Date().getFullYear()} MED Prep</p>
        <p className="mt-2 text-xs text-[var(--steel-400)]">Exam-specific practice, with availability stated plainly.</p>
      </footer>
    </main>
  );
}
