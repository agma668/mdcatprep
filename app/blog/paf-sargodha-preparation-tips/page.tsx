import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/Badge";
import { getSiteUrl } from "@/lib/site";
import { Calendar, Clock, ArrowLeft } from "lucide-react";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "PAF College Sargodha Entry Test Guide — Pattern, Syllabus & Preparation",
  description:
    "The complete PAF College Sargodha entry test guide: the 200-mark, 4-section pattern, the Analytical Reasoning section that makes PAF different, and a subject-wise preparation plan.",
  keywords: [
    "PAF Sargodha entry test preparation",
    "PAF College Sargodha test pattern",
    "PAF Sargodha 200 marks 4 sections",
    "PAF Sargodha analytical reasoning",
    "PAF Sargodha Class 8 entry syllabus",
    "PAF Sargodha math preparation",
    "PAF Sargodha English preparation",
    "PAF Sargodha General Knowledge preparation",
    "how to get selected in PAF College Sargodha",
    "PAF Sargodha study plan",
  ],
  openGraph: {
    type: "article",
    url: `${siteUrl}/blog/paf-sargodha-preparation-tips`,
    title: "PAF College Sargodha Entry Test Guide — Pattern, Syllabus & Preparation",
    description:
      "The complete PAF College Sargodha entry test guide: pattern, syllabus and a subject-wise study plan.",
    siteName: "Cadet Prep",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "PAF College Sargodha Entry Test Guide — Cadet College Prep" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PAF Sargodha Entry Test Guide | Cadet College Prep",
    description: "Complete guide to the PAF College Sargodha entry test pattern and syllabus.",
    images: [`${siteUrl}/og.png`],
  },
  alternates: {
    canonical: "/blog/paf-sargodha-preparation-tips",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "PAF College Sargodha Entry Test Guide — Pattern, Syllabus & Preparation",
  description:
    "The complete PAF College Sargodha entry test guide: the 200-mark pattern, syllabus and a subject-wise preparation plan.",
  url: `${siteUrl}/blog/paf-sargodha-preparation-tips`,
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
  datePublished: "2026-08-25",
  dateModified: "2026-09-04",
};

export default function PAFSargodhaGuidePage() {
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
                <Badge variant="accent">PAF Sargodha</Badge>
                <span className="flex items-center gap-1 text-xs text-white/50">
                  <Calendar className="w-3 h-3" /> Updated September 2026
                </span>
                <span className="flex items-center gap-1 text-xs text-white/50">
                  <Clock className="w-3 h-3" /> 8 min read
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                PAF College Sargodha Entry Test Guide — Pattern, Syllabus &amp; Preparation
              </h1>
              <p className="text-lg text-white/70 leading-relaxed">
                What PAF College Sargodha actually tests — the 200-mark, 4-section
                pattern, the Analytical Reasoning section that makes this entry test
                different, and how to prepare for each part.
              </p>
            </div>

            <div className="prose-custom space-y-8 text-white/80 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  What is the PAF Sargodha Entry Test?
                </h2>
                <p>
                  PAF College Sargodha is the Pakistan Air Force&apos;s cadet college,
                  and its Class 8 entry test is built around four areas: Mathematics,
                  English, General Knowledge and Analytical Reasoning. The format
                  below is what this site publishes on the PAF Sargodha college page
                  and in the PAF Sargodha Class 8 syllabus notes.
                </p>
                <p className="mt-3 text-sm text-white/60">
                  Age limits, application windows and exact test dates are set by the
                  college&apos;s own official announcement each year — confirm those with
                  the college before planning around them.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  PAF Sargodha Test Pattern — 200 Marks, 4 Sections
                </h2>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] overflow-hidden">
                  <div className="grid grid-cols-2 bg-white/[0.04] px-6 py-3 border-b border-white/10">
                    <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Section</span>
                    <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Marks</span>
                  </div>
                  {[
                    ["A — Mathematics", "50"],
                    ["B — English", "50"],
                    ["C — General Knowledge", "50"],
                    ["D — Analytical Reasoning", "50"],
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
                  The college page lists the test as 200 marks over 4 sections, roughly
                  3 hours long. The Analytical section is unique to PAF — it is what
                  separates this preparation from the other cadet college tests we cover.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Section A — Mathematics (50 Marks)
                </h2>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Arithmetic</h3>
                  <p className="text-sm">
                    Number system and operations; fractions, decimals and percentages;
                    ratio and proportion; profit, loss and discount; simple and
                    compound interest; time, speed and distance.
                  </p>
                </div>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6 mt-4">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Algebra</h3>
                  <p className="text-sm">
                    Linear equations in one variable; simultaneous equations;
                    algebraic expressions and factorization; basic quadratic
                    equations; indices and surds.
                  </p>
                </div>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6 mt-4">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Geometry</h3>
                  <p className="text-sm">
                    Angles and triangles; circle theorems; area and perimeter of plane
                    figures; volume and surface area of solids; the Pythagoras theorem.
                  </p>
                </div>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6 mt-4">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Statistics</h3>
                  <p className="text-sm">
                    Data collection and representation; mean, median and mode;
                    frequency tables and bar charts; basic probability.
                  </p>
                </div>
                <p className="mt-4 text-sm">
                  Math rewards speed as much as knowledge — drill the routine
                  question types until they are automatic, then work on pacing.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Section B — English (50 Marks)
                </h2>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Grammar</h3>
                  <p className="text-sm">
                    Tenses (present, past, future); active and passive voice; direct
                    and indirect speech; articles and prepositions; subject-verb
                    agreement; pairs of words.
                  </p>
                </div>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6 mt-4">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Vocabulary</h3>
                  <p className="text-sm">
                    Synonyms and antonyms; one-word substitutions; idioms and phrases;
                    spellings and word meanings.
                  </p>
                </div>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6 mt-4">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Comprehension &amp; Writing</h3>
                  <p className="text-sm">
                    Reading passages of roughly 300&ndash;400 words with inferential
                    questions, summary and main-idea questions, and contextual
                    vocabulary; plus essay writing — narrative and descriptive essays,
                    paragraph development, coherence and cohesion.
                  </p>
                </div>
                <p className="mt-4 text-sm">
                  Daily reading is the honest shortcut here — it builds vocabulary,
                  comprehension speed and essay instincts at the same time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Section C — General Knowledge (50 Marks)
                </h2>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Pakistan Studies</h3>
                  <p className="text-sm">
                    History of Pakistan (1857&ndash;1947); important dates and events;
                    geography of Pakistan; famous personalities.
                  </p>
                </div>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6 mt-4">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Current Affairs</h3>
                  <p className="text-sm">
                    Major world events; sports achievements; scientific discoveries;
                    Pakistani awards and honours.
                  </p>
                </div>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6 mt-4">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">World Knowledge</h3>
                  <p className="text-sm">
                    Capitals and currencies; international organizations; important
                    treaties and agreements; world geography basics.
                  </p>
                </div>
                <p className="mt-4 text-sm">
                  General Knowledge is the section where daily, low-effort reading
                  beats last-week cramming — start the habit early.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Section D — Analytical Reasoning (50 Marks)
                </h2>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Logic &amp; Reasoning</h3>
                  <p className="text-sm">
                    Number and letter series; coding and decoding; blood relations;
                    direction sense; syllogisms; statements and conclusions.
                  </p>
                </div>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6 mt-4">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Problem Solving</h3>
                  <p className="text-sm">
                    Puzzles and patterns; missing figures; analogies; classification
                    (odd one out); Venn diagrams.
                  </p>
                </div>
                <p className="mt-4 text-sm">
                  This is the section that makes PAF Sargodha different from the other
                  cadet college tests — it tests how you think, not what you memorised.
                  Practise the pattern types above until the logic is familiar, because
                  the question types repeat even when the content changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  A Realistic 4-Week Study Plan
                </h2>
                <div className="space-y-4">
                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5">
                    <p className="text-sm font-bold text-white">Week 1 — Foundations</p>
                    <p className="mt-1 text-sm text-white/70">
                      Diagnose your starting level, then build math arithmetic and
                      English grammar fluency. Fix every wrong answer the same day.
                    </p>
                  </div>
                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5">
                    <p className="text-sm font-bold text-white">Week 2 — Core syllabus</p>
                    <p className="mt-1 text-sm text-white/70">
                      Cover algebra, geometry and statistics; English vocabulary and
                      comprehension; science and Pakistan studies topics by chapter.
                    </p>
                  </div>
                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5">
                    <p className="text-sm font-bold text-white">Week 3 — Analytical Reasoning &amp; weak areas</p>
                    <p className="mt-1 text-sm text-white/70">
                      Add daily series, coding and puzzle practice; re-drill the
                      subjects where your accuracy is lowest.
                    </p>
                  </div>
                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5">
                    <p className="text-sm font-bold text-white">Week 4 — Test tempo</p>
                    <p className="mt-1 text-sm text-white/70">
                      Answer full 50-question subject runs under time pressure and
                      review accuracy and speed together.
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm">
                  Ten to fifteen focused questions a day beats cramming — steady
                  repetition is what makes the wide syllabus stick.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5">
                    <p className="text-sm font-bold text-white">
                      What makes the PAF Sargodha test different from other cadet college tests?
                    </p>
                    <p className="mt-1 text-sm text-white/70">
                      The Analytical Reasoning section (50 marks). Other cadet colleges
                      test math, English, science and knowledge; PAF adds a full section
                      of logic, patterns and problem solving that other formats do not have.
                    </p>
                  </div>
                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5">
                    <p className="text-sm font-bold text-white">
                      Do I need to prepare for essay writing?
                    </p>
                    <p className="mt-1 text-sm text-white/70">
                      The site&apos;s English syllabus lists essay writing — narrative and
                      descriptive essays, paragraph development, coherence and cohesion
                      — so yes, practise writing under time pressure, not just MCQs.
                    </p>
                  </div>
                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5">
                    <p className="text-sm font-bold text-white">
                      Is 4 weeks enough to prepare?
                    </p>
                    <p className="mt-1 text-sm text-white/70">
                      Four focused weeks will genuinely raise your score, especially in
                      General Knowledge and Analytical Reasoning. If your test is further
                      out, spread the same plan over 8&ndash;12 weeks with lighter daily work.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  The Honest Bottom Line
                </h2>
                <p>
                  We only publish what this site can back with real sources: the
                  200-mark, 4-section pattern above comes from the PAF Sargodha college
                  page, and every topic list comes from the PAF Sargodha Class 8 entry
                  syllabus in the notes. What we do not publish — exact age limits,
                  the application deadline, the test date — comes from the college&apos;s
                  official announcement, so confirm those directly before planning
                  around them.
                </p>
                <p className="mt-3">
                  Prepare all four sections steadily — and treat Analytical Reasoning
                  as the subject it is — and the test itself stops being the unknown.
                </p>
              </section>

              <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm font-bold text-white mb-3">More from the blog</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link href="/blog/cch-preparation-guide" className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5 hover:bg-white/[0.09] transition-colors">
                    <Badge variant="glass" className="mb-2 text-[10px]">Guide</Badge>
                    <p className="text-sm font-bold text-white">How to Prepare for CCH Hasanabdal Entry Test 2026</p>
                  </Link>
                  <Link href="/blog/kohat-preparation-guide" className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5 hover:bg-white/[0.09] transition-colors">
                    <Badge variant="glass" className="mb-2 text-[10px]">Guide</Badge>
                    <p className="text-sm font-bold text-white">Kohat Cadet College Entry Test Guide</p>
                  </Link>
                </div>
              </div>
              <div className="mt-6 bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Practice PAF Sargodha MCQs Now</p>
                  <p className="text-xs text-white/50 mt-0.5">Free exam-style questions for PAF College Sargodha</p>
                </div>
                <Link href="/colleges/paf-sargodha" className="shrink-0 text-xs font-bold text-[var(--color-accent-light)] hover:underline">Start →</Link>
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
