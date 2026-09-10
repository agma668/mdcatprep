import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/Badge";
import { getSiteUrl } from "@/lib/site";
import { Calendar, Clock, ArrowLeft } from "lucide-react";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "MCJ Jhelum Entry Test Guide — Pattern, Syllabus & Preparation",
  description:
    "Complete Military College Jhelum (MCJ) entry test guide: the 200-mark test pattern, the four sections, subject-wise preparation strategy, a study plan, and exam-day tips.",
  keywords: [
    "MCJ Jhelum entry test pattern",
    "Military College Jhelum preparation guide",
    "MCJ entry test syllabus",
    "MCJ 200 marks test",
    "Military College Jhelum aptitude test",
    "how to get selected in MCJ",
    "MCJ math English science preparation",
    "military college entry test guide",
  ],
  openGraph: {
    type: "article",
    url: `${siteUrl}/blog/mcj-preparation-guide`,
    title: "MCJ Jhelum Entry Test Guide — Pattern, Syllabus & Preparation",
    description:
      "Military College Jhelum (MCJ) entry test pattern, syllabus and a full preparation strategy.",
    siteName: "Cadet Prep",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Military College Jhelum Entry Test Guide — Cadet College Prep" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MCJ Jhelum Entry Test Guide | Cadet College Prep",
    description: "MCJ entry test pattern, syllabus and preparation strategy.",
    images: [`${siteUrl}/og.png`],
  },
  alternates: {
    canonical: "/blog/mcj-preparation-guide",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "MCJ Jhelum Entry Test Guide — Pattern, Syllabus & Preparation",
  description:
    "Military College Jhelum (MCJ) entry test pattern, syllabus and preparation strategy.",
  url: `${siteUrl}/blog/mcj-preparation-guide`,
  author: {
    "@type": "Organization",
    name: "Cadet College Prep",
    url: siteUrl,
  },
  publisher: {
    "@type": "Organization",
    name: "Cadet College Prep",
    url: siteUrl,
  },
  datePublished: "2026-09-04",
  dateModified: "2026-09-04",
};

export default function MCJGuidePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
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
                <Badge variant="accent">MCJ</Badge>
                <span className="flex items-center gap-1 text-xs text-white/50">
                  <Calendar className="w-3 h-3" /> September 2026
                </span>
                <span className="flex items-center gap-1 text-xs text-white/50">
                  <Clock className="w-3 h-3" /> 7 min read
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                MCJ Jhelum Entry Test Guide — Pattern, Syllabus &amp; Preparation
              </h1>
              <p className="text-lg text-white/70 leading-relaxed">
                Everything you need to know about the Military College Jhelum
                entry test: the test pattern, what each section covers, how to
                prepare, and how to perform on exam day.
              </p>
            </div>

            <div className="prose-custom space-y-8 text-white/80 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  What is the MCJ Entry Test?
                </h2>
                <p>
                  Military College Jhelum (MCJ) is one of Pakistan&apos;s oldest
                  military colleges and admits students into Class 8 through a
                  competitive entry test. As a military college it is run
                  directly by the armed forces, and its test evaluates both
                  academic knowledge and problem-solving ability — not just what
                  you have memorised, but how clearly you can think under time
                  pressure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  MCJ Entry Test Pattern
                </h2>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] overflow-hidden">
                  <div className="grid grid-cols-12 bg-white/[0.04] px-5 py-3 border-b border-white/10 text-[10px] font-bold text-white/50 uppercase tracking-wider">
                    <div className="col-span-5">Section</div>
                    <div className="col-span-4">Topics</div>
                    <div className="col-span-3 text-right">Marks</div>
                  </div>
                  {[
                    { section: "A — Mathematics", topics: "Arithmetic, Algebra, Geometry", marks: "50" },
                    { section: "B — English + Urdu", topics: "Grammar, Comprehension, Urdu Grammar", marks: "50" },
                    { section: "C — General Science", topics: "Physics, Chemistry, Biology", marks: "50" },
                    { section: "D — Aptitude / Islamiat", topics: "IQ, Pattern Recognition, Islamiyat", marks: "50" },
                  ].map(({ section, topics, marks }, i) => (
                    <div key={section} className={`grid grid-cols-12 px-5 py-3.5 items-center ${i < 3 ? "border-b border-white/5" : ""}`}>
                      <div className="col-span-5 text-sm font-semibold text-white">{section}</div>
                      <div className="col-span-4 text-xs text-white/60">{topics}</div>
                      <div className="col-span-3 text-sm font-bold text-[var(--color-accent-light)] text-right">{marks}</div>
                    </div>
                  ))}
                  <div className="grid grid-cols-12 px-5 py-3 bg-white/[0.04] border-t border-white/10">
                    <div className="col-span-5 text-sm font-bold text-white">Total</div>
                    <div className="col-span-4 text-xs text-white/50">3 hours</div>
                    <div className="col-span-3 text-sm font-extrabold text-[var(--color-accent-light)] text-right">200</div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-white/60">
                  Exact section composition can change from year to year — always
                  confirm the current pattern and age limits in the official
                  announcement for your entry year.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Subject-Wise Preparation Strategy
                </h2>

                <div className="space-y-6">
                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                    <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Mathematics (50 marks)</h3>
                    <p className="text-sm">
                      Arithmetic, algebra and geometry at the Class 7–8 level.
                      Practise speed as much as accuracy — MCJ-style questions
                      reward candidates who can work cleanly and quickly. Cover
                      fractions, percentages, ratios, basic equations and
                      mensuration, and solve MCQs daily.
                    </p>
                  </div>

                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                    <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">English + Urdu (50 marks)</h3>
                    <p className="text-sm">
                      Grammar, vocabulary, comprehension — and Urdu grammar for
                      the Urdu portion. Read English daily, build word power, and
                      revise Urdu grammar rules from your Class 7–8 textbook.
                      Comprehension answers are almost always in the passage:
                      read the question before the text.
                    </p>
                  </div>

                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                    <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">General Science (50 marks)</h3>
                    <p className="text-sm">
                      Physics, chemistry and biology at the Class 7–8 level.
                      Focus on definitions, units, laws and everyday applications.
                      Make one-page notes per chapter for quick revision in the
                      final weeks.
                    </p>
                  </div>

                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                    <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Aptitude / Islamiat (50 marks)</h3>
                    <p className="text-sm">
                      The aptitude portion — IQ and pattern-recognition questions —
                      is what most students under-prepare. Practise number and
                      figure series, odd-one-out, and logical reasoning puzzles so
                      the patterns feel familiar on exam day. Study the Islamiat
                      syllabus prescribed for your class alongside it.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  3-Month Study Plan
                </h2>
                <div className="space-y-3">
                  {[
                    { month: "Month 1", task: "Cover the full Class 7–8 syllabus. Read your textbooks, make notes, and make sure every concept is understood — do not rush ahead to questions you can't yet solve." },
                    { month: "Month 2", task: "Switch to daily MCQ practice subject by subject, using Cadet College Prep's MCJ practice. Let your analytics show which topics are weak, then spend extra time there." },
                    { month: "Month 3", task: "Full-length timed practice and past-pattern revision. Re-attempt your weak topics, work on speed, and take at least one complete 200-mark run before the real test." },
                  ].map(({ month, task }) => (
                    <div key={month} className="flex gap-4 items-start">
                      <span className="shrink-0 text-xs font-bold text-[var(--color-accent-light)] bg-[var(--color-accent)]/15 px-3 py-1 rounded-full mt-0.5">
                        {month}
                      </span>
                      <p className="text-sm text-white/80">{task}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Exam Day Tips
                </h2>
                <ul className="space-y-2 text-sm list-disc list-inside text-white/80">
                  <li>Reach the centre at least 30 minutes early.</li>
                  <li>Carry your admit card and a valid photo ID.</li>
                  <li>Attempt the aptitude questions you recognise first — they cost the least time.</li>
                  <li>Don&apos;t spend too long on any single question — mark it and move on.</li>
                  <li>If there&apos;s negative marking, avoid blind guessing.</li>
                  <li>Stay calm. Clear thinking beats frantic speed every time.</li>
                </ul>
              </section>

              <section className="bg-white/[0.06] border border-white/15 rounded-[var(--radius-xl)] p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-3">
                  Ready to Start Preparing?
                </h3>
                <p className="text-sm text-white/70 mb-6 max-w-md mx-auto">
                  Join Cadet College Prep for free MCQ practice in Mathematics,
                  English, General Science and Aptitude — with analytics that show
                  you exactly where to improve.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-text-inverse)] font-bold hover:bg-[var(--color-accent-light)] transition-colors"
                  >
                    Sign Up Free
                  </Link>
                  <Link
                    href="/colleges/mcj"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-white/10 ring-1 ring-white/25 text-white font-bold hover:bg-white/20 transition-colors"
                  >
                    MCJ Practice Page
                  </Link>
                </div>
              </section>
            </div>
          </div>

          <div className="container-page max-w-3xl mt-16 pt-12 border-t border-white/10">
            <h2 className="text-xl font-extrabold text-white mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/blog/cch-preparation-guide" className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5 hover:bg-white/[0.09] transition-colors">
                <Badge variant="glass" className="mb-2 text-[10px]">CCH</Badge>
                <p className="text-sm font-bold text-white">How to Prepare for CCH Hasanabdal Entry Test</p>
              </Link>
              <Link href="/blog/cadet-vs-military-college" className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5 hover:bg-white/[0.09] transition-colors">
                <Badge variant="glass" className="mb-2 text-[10px]">Guide</Badge>
                <p className="text-sm font-bold text-white">Cadet College vs Military College — Which to Choose?</p>
              </Link>
            </div>
            <div className="mt-6 bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Practice MCJ MCQs Now</p>
                <p className="text-xs text-white/50 mt-0.5">Free exam-style questions for Military College Jhelum</p>
              </div>
              <Link href="/colleges/mcj" className="shrink-0 text-xs font-bold text-[var(--color-accent-light)] hover:underline">Start →</Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
