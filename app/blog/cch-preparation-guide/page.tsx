import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/Badge";
import { getSiteUrl } from "@/lib/site";
import { Calendar, Clock, ArrowLeft } from "lucide-react";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "How to Prepare for CCH Hasanabdal Entry Test 2026 — Complete Guide",
  description:
    "A complete step-by-step guide to preparing for the Cadet College Hasanabdal (CCH) entry test in 2026. Covers the full syllabus, subject-wise study plan, exam pattern, and last-minute tips.",
  keywords: [
    "CCH Hasanabdal entry test preparation",
    "CCH entry test 2026 guide",
    "CCH syllabus complete",
    "Cadet College Hasanabdal admission test",
    "CCH math preparation",
    "CCH English preparation",
    "CCH science preparation",
    "CCH Islamiat preparation",
    "how to get selected in CCH",
    "CCH entry test tips",
  ],
  openGraph: {
    type: "article",
    url: `${siteUrl}/blog/cch-preparation-guide`,
    title: "How to Prepare for CCH Hasanabdal Entry Test 2026 — Complete Guide",
    description:
      "A complete step-by-step guide to preparing for the CCH Hasanabdal entry test. Syllabus, study plan and exam tips.",
    siteName: "Cadet Prep",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "CCH Hasanabdal Entry Test Preparation Guide — Cadet College Prep" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CCH Entry Test Preparation Guide 2026 | Cadet College Prep",
    description: "Complete guide to CCH Hasanabdal entry test preparation.",
    images: [`${siteUrl}/og.png`],
  },
  alternates: {
    canonical: "/blog/cch-preparation-guide",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Prepare for CCH Hasanabdal Entry Test 2026 — Complete Guide",
  description:
    "A complete step-by-step guide to preparing for the CCH Hasanabdal entry test.",
  url: `${siteUrl}/blog/cch-preparation-guide`,
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
  datePublished: "2026-08-15",
  dateModified: "2026-08-15",
};

export default function CCHGuidePage() {
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
                <Badge variant="accent">CCH</Badge>
                <span className="flex items-center gap-1 text-xs text-white/50">
                  <Calendar className="w-3 h-3" /> August 2026
                </span>
                <span className="flex items-center gap-1 text-xs text-white/50">
                  <Clock className="w-3 h-3" /> 8 min read
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                How to Prepare for CCH Hasanabdal Entry Test 2026 — Complete Guide
              </h1>
              <p className="text-lg text-white/70 leading-relaxed">
                Everything you need to know about the CCH entry test: syllabus,
                study plan, subject-wise strategy, and tips to get selected.
              </p>
            </div>

            <div className="prose-custom space-y-8 text-white/80 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  What is the CCH Entry Test?
                </h2>
                <p>
                  Cadet College Hasanabdal (CCH) is one of Pakistan&apos;s most
                  prestigious cadet colleges. The entry test is highly competitive,
                  with thousands of students applying each year for limited seats.
                  The test evaluates your knowledge in four key areas: Mathematics,
                  English, General Science and Islamiat.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  CCH Entry Test Pattern 2026
                </h2>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] overflow-hidden">
                  <div className="grid grid-cols-2 bg-white/[0.04] px-6 py-3 border-b border-white/10">
                    <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Section</span>
                    <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Marks</span>
                  </div>
                  {[
                    ["A — Mathematics", "50"],
                    ["B — English + Islamiat", "40 + 10"],
                    ["C — General Science (25 MCQs)", "50"],
                    ["D — Urdu", "50"],
                    ["Total", "200"],
                  ].map(([section, marks], i) => (
                    <div
                      key={section}
                      className={`grid grid-cols-2 px-6 py-3 ${i < 4 ? "border-b border-white/5" : ""} ${i === 4 ? "bg-white/[0.04] font-bold" : ""}`}
                    >
                      <span className="text-sm text-white/80">{section}</span>
                      <span className="text-sm text-[var(--color-accent-light)] font-semibold">{marks}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-white/60">
                  The test is typically 3 hours long. Negative marking may apply —
                  always check the official announcement for the current year.
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
                      Focus on arithmetic, algebra, geometry, percentages, ratios and
                      basic trigonometry. Practice MCQs daily — speed and accuracy
                      both matter. Cover the Class 7 and Class 8 maths syllabus
                      thoroughly.
                    </p>
                  </div>

                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                    <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">English (40 marks)</h3>
                    <p className="text-sm">
                      Grammar, vocabulary, comprehension and sentence correction are
                      key. Read English newspapers daily. Practice synonyms, antonyms,
                      and active/passive voice transformations.
                    </p>
                  </div>

                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                    <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">General Science (50 marks)</h3>
                    <p className="text-sm">
                      Covers physics, chemistry and biology at the Class 7–8 level.
                      Focus on definitions, basic experiments, and real-world
                      applications. Make short notes for quick revision.
                    </p>
                  </div>

                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                    <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Islamiat &amp; Urdu</h3>
                    <p className="text-sm">
                      For Islamiat, study the syllabus prescribed by the college.
                      For Urdu, focus on comprehension, grammar rules, and basic
                      literature questions.
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
                    { month: "Month 1", task: "Cover the full syllabus. Read textbooks, make notes. Focus on understanding concepts — don't rush." },
                    { month: "Month 2", task: "Practice MCQs daily. Use Cadet College Prep's question bank for subject-wise practice. Identify weak areas from your analytics." },
                    { month: "Month 3", task: "Full-length mock tests. Revise weak topics. Work on speed and accuracy. Stay calm and confident." },
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
                  <li>Read every question carefully before answering.</li>
                  <li>Don&apos;t spend too long on any single question — move on and come back.</li>
                  <li>If there&apos;s negative marking, avoid guessing blindly.</li>
                  <li>Stay calm. You&apos;ve prepared for this.</li>
                </ul>
              </section>

              <section className="bg-white/[0.06] border border-white/15 rounded-[var(--radius-xl)] p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-3">
                  Ready to Start Preparing?
                </h3>
                <p className="text-sm text-white/70 mb-6 max-w-md mx-auto">
                  Join Cadet College Prep for free MCQ practice, study notes, analytics and
                  WhatsApp mentorship — everything you need to get selected.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-text-inverse)] font-bold hover:bg-[var(--color-accent-light)] transition-colors"
                  >
                    Sign Up Free
                  </Link>
                  <Link
                    href="/colleges/cch"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-white/10 ring-1 ring-white/25 text-white font-bold hover:bg-white/20 transition-colors"
                  >
                    CCH Practice Page
                  </Link>
                </div>
              </section>
            </div>
          </div>

          <div className="container-page max-w-3xl mt-16 pt-12 border-t border-white/10">
            <h2 className="text-xl font-extrabold text-white mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/blog/paf-sargodha-preparation-tips" className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5 hover:bg-white/[0.09] transition-colors">
                <Badge variant="glass" className="mb-2 text-[10px]">PAF Sargodha</Badge>
                <p className="text-sm font-bold text-white">Top 10 Tips to Pass PAF Sargodha Entry Test</p>
              </Link>
              <Link href="/blog/cadet-vs-military-college" className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5 hover:bg-white/[0.09] transition-colors">
                <Badge variant="glass" className="mb-2 text-[10px]">Guide</Badge>
                <p className="text-sm font-bold text-white">Cadet College vs Military College — Which to Choose?</p>
              </Link>
            </div>
            <div className="mt-6 bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Practice CCH MCQs Now</p>
                <p className="text-xs text-white/50 mt-0.5">Free exam-style questions for CCH Hasanabdal</p>
              </div>
              <Link href="/colleges/cch" className="shrink-0 text-xs font-bold text-[var(--color-accent-light)] hover:underline">Start →</Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
