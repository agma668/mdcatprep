import Link from 'next/link';
import { ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-extrabold tracking-tight">
            <span className="h-3 w-3 rounded-full bg-accent" aria-hidden="true" />
            APEX PAKISTAN
          </Link>
          <nav className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/exams" className="text-muted-foreground transition-colors hover:text-foreground">
              Explore exams
            </Link>
            <Link href="/signup" className="rounded-xl bg-accent px-4 py-2 text-accent-foreground">
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:py-24">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          Free beta access
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
          Start preparing without a payment.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Apex is currently in beta. You can create an account without entering payment details
          and explore the preparation spaces and features that are available today.
        </p>

        <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-border bg-card p-6 text-left shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-accent/10 p-3 text-accent">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Apex beta</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Rs. 0 to create an account during the beta.
              </p>
            </div>
          </div>

          <ul className="mt-6 space-y-3 text-sm text-foreground/90">
            <li className="flex gap-2">
              <span className="text-emerald-400" aria-hidden="true">✓</span>
              No payment details are required to sign up.
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400" aria-hidden="true">✓</span>
              Explore exam-specific preparation spaces from one account.
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400" aria-hidden="true">✓</span>
              Availability is shown by each exam space; some content and tools are still in progress.
            </li>
          </ul>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90"
            >
              Create a free account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/exams"
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-bold transition-colors hover:bg-secondary"
            >
              View exam spaces
            </Link>
          </div>
        </div>

        <p className="mx-auto mt-7 max-w-xl text-xs leading-relaxed text-muted-foreground">
          This page does not activate a pass, grant exam access or take payment. No paid checkout
          is currently offered. If access options change later, the available terms will be shown
          clearly before any purchase is possible.
        </p>
      </section>

      <footer className="border-t border-border px-4 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Apex Pakistan.
      </footer>
    </main>
  );
}
