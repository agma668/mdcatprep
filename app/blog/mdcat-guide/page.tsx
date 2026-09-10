import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/Badge";
import { getSiteUrl, getWhatsAppLink } from "@/lib/site";
import { Calendar, Clock, ArrowLeft } from "lucide-react";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "MDCAT 2026 Complete Guide — Pattern, Syllabus & Study Plan",
  description:
    "The complete MDCAT 2026 guide: official PMDC marks distribution (Biology 68, Chemistry 56, Physics 56, English 20), the exam date, syllabus strategy and a week-by-week study plan.",
  keywords: [
    "MDCAT 2026",
    "MDCAT guide",
    "PMDC MDCAT syllabus",
    "MDCAT marks distribution",
    "MDCAT preparation plan",
    "MDCAT exam date 2026",
    "MDCAT biology chemistry physics english",
  ],
  openGraph: {
    type: "article",
    url: `${siteUrl}/blog/mdcat-guide`,
    title: "MDCAT 2026 Complete Guide — Pattern, Syllabus & Study Plan | MED Prep",
    description:
      "The complete MDCAT 2026 guide: pattern, syllabus strategy and study plan.",
    siteName: "MED Prep",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "MDCAT 2026 Complete Guide — MED Prep" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MDCAT 2026 Complete Guide | MED Prep",
    description: "Pattern, syllabus and study plan for MDCAT 2026.",
    images: [`${siteUrl}/og.png`],
  },
  alternates: { canonical: "/blog/mdcat-guide" },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "MDCAT 2026 Complete Guide — Pattern, Syllabus & Study Plan",
  description:
    "The complete MDCAT 2026 guide: pattern, syllabus strategy and study plan.",
  url: `${siteUrl}/blog/mdcat-guide`,
  author: {
    "@type": "Organization",
    name: "MED Prep",
    url: siteUrl,
  },
  publisher: {
    "@type": "Organization",
    name: "MED Prep",
    url: siteUrl,
  },
  datePublished: "2026-09-10",
  dateModified: "2026-09-10",
};

export default function MDCATGuidePage() {
  return (
    <div className="min-h-screen bg-field font-sans text-white antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Navbar />
      <main>
        <article className="pt-32 pb-20">
          <div className="container-page max-w-3xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-[var(--color-accent-light)] transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>

            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="accent">MDCAT</Badge>
                <span className="flex items-center gap-1 text-xs text-white/50">
                  <Calendar className="w-3 h-3" /> September 2026
                </span>
                <span className="flex items-center gap-1 text-xs text-white/50">
                  <Clock className="w-3 h-3" /> 8 min read
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                MDCAT 2026 Complete Guide — Pattern, Syllabus &amp; Study Plan
              </h1>
              <p className="text-lg text-white/70 leading-relaxed">
                Everything you need to know about MDCAT 2026: the official PMDC
                pattern, the syllabus units that carry the most marks, and a
                study plan that fits the time you actually have left.
              </p>
            </div>

            <div className="prose-custom space-y-8 text-white/80 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  What is the MDCAT?
                </h2>
                <p>
                  The Medical and Dental College Admission Test (MDCAT) is the
                  single standardized entrance exam for MBBS and BDS admission
                  in Pakistan, conducted under the Pakistan Medical &amp; Dental
                  Council (PMDC). Every public medical college uses it, and so
                  do most private ones. It is a paper-based MCQ exam — 200
                  questions, no negative marking — and your score decides the
                  merit list you either make or don&apos;t.
                </p>
                <p className="mt-3">
                  One rule above all: check{" "}
                  <a href="https://pmdc.pk/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-light)] underline hover:no-underline">
                    pmdc.pk
                  </a>{" "}
                  for official announcements. Dates, curriculum and registration
                  windows are only official there.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  MDCAT 2026 Exam Date
                </h2>
                <p>
                  The MDCAT 2026 exam is scheduled for{" "}
                  <strong className="text-white">Sunday, September 20, 2026</strong>{" "}
                  — PMDC rescheduled it from the original August date, so if you
                  planned around August, recalibrate now. NUMS runs its own test
                  separately:{" "}
                  <strong className="text-white">Sunday, September 13, 2026</strong>{" "}
                  (via{" "}
                  <a href="https://numspak.edu.pk/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-light)] underline hover:no-underline">
                    numspak.edu.pk
                  </a>
                  ). If you are sitting both, that gives you a NUMS first, then
                  MDCAT a week later — a built-in second chance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  The Official Pattern: Where the 200 Marks Live
                </h2>
                <p>
                  The PMDC curriculum fixes the marks distribution. Study it
                  before anything else, because your prep hours should follow
                  the marks, not your comfort zone:
                </p>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] overflow-hidden">
                  <div className="grid grid-cols-3 bg-white/[0.04] px-6 py-3 border-b border-white/10">
                    <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Subject</span>
                    <span className="text-xs font-bold text-white/60 uppercase tracking-wider">MCQs</span>
                    <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Share</span>
                  </div>
                  {[
                    ["Biology", "68", "34%"],
                    ["Chemistry", "56", "28%"],
                    ["Physics", "56", "28%"],
                    ["English", "20", "10%"],
                    ["Total", "200", "100%"],
                  ].map(([subject, mcqs, share], i) => (
                    <div
                      key={subject}
                      className={`grid grid-cols-3 px-6 py-3 ${i < 4 ? "border-b border-white/5" : ""} ${i === 4 ? "bg-white/[0.04] font-bold" : ""}`}
                    >
                      <span className="text-sm text-white/80">{subject}</span>
                      <span className="text-sm text-[var(--color-accent-light)] font-semibold">{mcqs}</span>
                      <span className="text-sm text-white/60">{share}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4">
                  Read that table again: <strong className="text-white">Biology alone is a third of your score</strong> —
                  more than Physics and English combined. Students who treat the
                  three sciences equally are leaving marks on the table. And
                  English, at 20 marks, is the classic &quot;small subject, big
                  regret&quot; — merit margins are often smaller than 20 marks.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  The Syllabus That Actually Matters
                </h2>
                <p>
                  The PMDC curriculum lists the exact units per subject — do not
                  study from any academy&apos;s &quot;guess syllabus.&quot; The
                  honest strategy for the time you have:
                </p>
                <ul className="space-y-2 mt-3">
                  <li className="flex gap-2">
                    <span className="text-[var(--color-accent-light)] font-bold mt-0.5" aria-hidden="true">•</span>
                    <span><strong className="text-white">Biology:</strong> every unit, with extra weight on cell biology, human systems (digestive, circulatory, respiratory, excretory), genetics and coordination. Fact-dense and rewarding for memorizers.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--color-accent-light)] font-bold mt-0.5" aria-hidden="true">•</span>
                    <span><strong className="text-white">Chemistry:</strong> physical chemistry numericals (thermochemistry, equilibrium, electrochemistry) plus organic reaction mechanisms. Inorganic trends over rote lists.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--color-accent-light)] font-bold mt-0.5" aria-hidden="true">•</span>
                    <span><strong className="text-white">Physics:</strong> conceptual MCQs dominate — mechanics, waves, electricity, modern physics. Formula families beat formula dumps.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--color-accent-light)] font-bold mt-0.5" aria-hidden="true">•</span>
                    <span><strong className="text-white">English:</strong> grammar precision (articles, prepositions, subject-verb agreement) and vocabulary in context. This section is coachable fast.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  The Study Plan (Whatever Time You Have Left)
                </h2>
                <div className="space-y-4">
                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5">
                    <h3 className="font-bold text-white mb-2">With 2+ months</h3>
                    <p className="text-sm">
                      First pass through every syllabus unit with notes, one
                      topic-wise MCQ set per unit as you finish it, then full
                      mock tests weekly. Keep a mistake book — the questions you
                      get wrong are the syllabus.
                    </p>
                  </div>
                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5">
                    <h3 className="font-bold text-white mb-2">With 2–4 weeks</h3>
                    <p className="text-sm">
                      No more first passes. Alternate: one day revising a high-weight unit, one day timed practice. Two full mocks per week, reviewed the same day. English grammar daily in 20-minute sprints — highest marks-per-hour in the whole exam.
                    </p>
                  </div>
                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5">
                    <h3 className="font-bold text-white mb-2">Final week (that&apos;s now)</h3>
                    <p className="text-sm">
                      Only revision and mocks — no new topics. Rerun your mistake book, drill Biology&apos;s fact-heavy units daily (they fade fastest), sleep properly the last two nights. A sharp mind on Sunday beats one more late-night chapter.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Exam-Day Rules That Cost Marks When Ignored
                </h2>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="text-[var(--color-accent-light)] font-bold mt-0.5" aria-hidden="true">•</span>
                    <span><strong className="text-white">No negative marking</strong> — an unanswered question is a guaranteed zero, a guessed one is a free lottery ticket. Never leave blanks.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--color-accent-light)] font-bold mt-0.5" aria-hidden="true">•</span>
                    <span><strong className="text-white">Budget ~50 seconds per MCQ.</strong> Flag and move on when stuck; return in the review window with a fresh mind.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--color-accent-light)] font-bold mt-0.5" aria-hidden="true">•</span>
                    <span><strong className="text-white">Fill the answer sheet as you go</strong>, not in a final-minute panic — misalignment disasters are real.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Start Practising Today
                </h2>
                <p>
                  MED Prep has exam-style MCQs across all four subjects, full
                  mock tests and master notes — free, forever. Sign up, take a
                  mock, and let the analytics tell you exactly where your next
                  marks are hiding.
                </p>
                <div className="flex flex-wrap gap-3 mt-5">
                  <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-text-inverse)] font-bold hover:bg-[var(--color-accent-light)] transition-colors">
                    Start Free Practice
                  </Link>
                  <Link href="/resources" className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-white/10 ring-1 ring-white/25 text-white font-bold hover:bg-white/20 transition-colors">
                    Free Master Notes
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
