import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/Badge";
import { getSiteUrl } from "@/lib/site";
import { Calendar, Clock, ArrowLeft } from "lucide-react";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Kohat Cadet College Entry Test Guide — Pattern, Syllabus & Preparation",
  description:
    "The complete Cadet College Kohat entry test guide: the 200-mark, 4-section pattern, what each section covers, and a subject-wise preparation plan — built from the Kohat syllabus published on this site.",
  keywords: [
    "Kohat Cadet College entry test preparation",
    "Cadet College Kohat test pattern",
    "Kohat cadet Class 8 entry syllabus",
    "Kohat cadet math preparation",
    "Kohat cadet English preparation",
    "Kohat cadet General Science preparation",
    "Kohat cadet General Knowledge preparation",
    "Kohat cadet Urdu syllabus",
    "how to prepare for Cadet College Kohat",
  ],
  openGraph: {
    type: "article",
    url: `${siteUrl}/blog/kohat-preparation-guide`,
    title: "Kohat Cadet College Entry Test Guide — Pattern, Syllabus & Preparation",
    description:
      "The complete Kohat Cadet College entry test guide: pattern, syllabus and a subject-wise study plan.",
    siteName: "Cadet Prep",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Kohat Cadet College Entry Test Preparation Guide — Cadet College Prep" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kohat Cadet Entry Test Preparation Guide | Cadet College Prep",
    description: "Complete guide to the Cadet College Kohat entry test pattern and syllabus.",
    images: [`${siteUrl}/og.png`],
  },
  alternates: {
    canonical: "/blog/kohat-preparation-guide",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Kohat Cadet College Entry Test Guide — Pattern, Syllabus & Preparation",
  description:
    "The complete Cadet College Kohat entry test guide: the 200-mark pattern, syllabus and a subject-wise preparation plan.",
  url: `${siteUrl}/blog/kohat-preparation-guide`,
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

export default function KohatGuidePage() {
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
                <Badge variant="accent">Kohat</Badge>
                <span className="flex items-center gap-1 text-xs text-white/50">
                  <Calendar className="w-3 h-3" /> September 2026
                </span>
                <span className="flex items-center gap-1 text-xs text-white/50">
                  <Clock className="w-3 h-3" /> 7 min read
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Kohat Cadet College Entry Test Guide — Pattern, Syllabus &amp; Preparation
              </h1>
              <p className="text-lg text-white/70 leading-relaxed">
                Everything we publish about the Cadet College Kohat entry test — the
                200-mark pattern, what each section actually covers, and a
                subject-wise plan to prepare for it.
              </p>
            </div>

            <div className="prose-custom space-y-8 text-white/80 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  What is the Kohat Entry Test?
                </h2>
                <p>
                  Cadet College Kohat is one of Pakistan&apos;s cadet colleges, and on
                  this site it is a key gateway college for students from Khyber
                  Pakhtunkhwa. Its entry test follows the same broad shape as the
                  other cadet colleges we cover: a written MCQ test for Class 8
                  entry, testing four areas — Mathematics, English, General Science,
                  and General Knowledge with Urdu.
                </p>
                <p className="mt-3 text-sm text-white/60">
                  What follows is drawn only from what this site publishes about
                  Kohat — the college page and the Kohat Class 8 entry syllabus in
                  the notes. Age limits, application windows and exact test dates
                  are set by the college&apos;s own official announcement each year,
                  so always confirm those with the college before applying.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Kohat Entry Test Pattern — 200 Marks, 4 Sections
                </h2>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] overflow-hidden">
                  <div className="grid grid-cols-2 bg-white/[0.04] px-6 py-3 border-b border-white/10">
                    <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Section</span>
                    <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Marks</span>
                  </div>
                  {[
                    ["A — Mathematics", "50"],
                    ["B — English", "50"],
                    ["C — General Science", "50"],
                    ["D — General Knowledge + Urdu", "50"],
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
                  The college page lists the test as 200 marks over 4 sections,
                  roughly 3 hours long. Every section carries equal weight, so
                  there is no&nbsp;single subject you can afford to skip.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Section A — Mathematics (50 Marks)
                </h2>
                <div className="space-y-6">
                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                    <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Arithmetic</h3>
                    <p className="text-sm">
                      Number operations and properties, fractions and decimals,
                      percentage and ratio, profit loss and discount, simple and
                      compound interest, time distance and speed.
                    </p>
                  </div>
                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                    <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Algebra</h3>
                    <p className="text-sm">
                      Algebraic expressions, linear equations, factorization,
                      basic indices, and word problems solved with algebra.
                    </p>
                  </div>
                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                    <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Geometry, Mensuration &amp; Statistics</h3>
                    <p className="text-sm">
                      Lines and angles, triangles, quadrilaterals, basic circles,
                      area and perimeter; volume and surface area of solids; mean,
                      median and mode, bar charts and frequency tables, and basic
                      probability.
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm">
                  Arithmetic and algebra dominate the early questions — drill those
                  until they are automatic, then move to geometry and data. Practise
                  with speed: in a 3-hour, 200-mark test, time per question matters.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Section B — English (50 Marks)
                </h2>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Grammar</h3>
                  <p className="text-sm">
                    Parts of speech, tenses, active and passive voice, articles and
                    prepositions, punctuation rules and sentence correction.
                  </p>
                </div>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6 mt-4">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Vocabulary</h3>
                  <p className="text-sm">
                    Synonyms and antonyms, one-word substitutions, spellings, and
                    word meanings and usage.
                  </p>
                </div>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6 mt-4">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Comprehension &amp; Writing</h3>
                  <p className="text-sm">
                    Passage reading with questions, main idea, summary and
                    inference; plus letter writing (formal and informal), paragraph
                    writing, essay basics and dialogue writing.
                  </p>
                </div>
                <p className="mt-4 text-sm">
                  Grammar and vocabulary are the fastest to improve in a short time —
                  read the explanations after every MCQ, not just the answers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Section C — General Science (50 Marks)
                </h2>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Physics</h3>
                  <p className="text-sm">
                    Force, motion and energy; light and sound; heat and temperature;
                    basic electricity; simple machines.
                  </p>
                </div>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6 mt-4">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Chemistry</h3>
                  <p className="text-sm">
                    Matter and its states; elements and compounds; chemical
                    reactions; acids and bases; mixtures.
                  </p>
                </div>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6 mt-4">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Biology</h3>
                  <p className="text-sm">
                    Cell biology basics; human body systems; plant biology;
                    environment; disease and prevention.
                  </p>
                </div>
                <p className="mt-4 text-sm">
                  The syllabus is Class 8 level, but the questions reward students
                  who understood the ideas rather than memorised definitions —
                  pay attention to the &ldquo;why&rdquo; in every explanation.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Section D — General Knowledge + Urdu (50 Marks)
                </h2>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">General Knowledge</h3>
                  <p className="text-sm">
                    Pakistan geography, history of Pakistan, current affairs, world
                    capitals and currencies, sports and awards, and important
                    organizations such as the UN and OIC.
                  </p>
                </div>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6 mt-4">
                  <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-3">Urdu</h3>
                  <p className="text-sm">
                    Haroof-e-Tahaji, ism/sifat/fail, singular and plural,
                    comprehension (nazm/ghazal), letter and essay writing, and
                    rumooz (punctuation).
                  </p>
                </div>
                <p className="mt-4 text-sm">
                  General Knowledge rewards daily, low-effort reading — Pakistan
                  studies and current affairs shift each year, so build the habit
                  early. Urdu needs handwriting practice for the writing questions,
                  not just reading.
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
                      Diagnose your starting level, then work Mathematics arithmetic
                      and English grammar daily. Fix every wrong answer before moving on.
                    </p>
                  </div>
                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5">
                    <p className="text-sm font-bold text-white">Week 2 — Core syllabus</p>
                    <p className="mt-1 text-sm text-white/70">
                      Cover algebra, geometry and mensuration; English vocabulary and
                      comprehension; science topics by chapter.
                    </p>
                  </div>
                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5">
                    <p className="text-sm font-bold text-white">Week 3 — GK, Urdu &amp; weak areas</p>
                    <p className="mt-1 text-sm text-white/70">
                      Add daily Pakistan studies and current affairs; practise Urdu
                      writing questions; re-drill the subjects where your accuracy
                      is lowest.
                    </p>
                  </div>
                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5">
                    <p className="text-sm font-bold text-white">Week 4 — Test tempo</p>
                    <p className="mt-1 text-sm text-white/70">
                      Answer full 50-question subject runs under time pressure; review
                      accuracy and speed together — the goal is right answers quickly.
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm">
                  Ten to fifteen focused questions a day beats cramming — the streak
                  matters because the syllabus is wide and steady repetition is what
                  makes it stick.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  How This Site Helps You Prepare
                </h2>
                <p>
                  Every Kohat section above is a real subject area you can practise
                  here: pick Kohat in the practice selector and answer exam-style
                  MCQs in Mathematics, English, General Science and General
                  Knowledge, with instant explanations. Your goal, streak and
                  accuracy tracking keep you honest day to day, and the free
                  diagnostic tells you which section to attack first.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  The Honest Bottom Line
                </h2>
                <p>
                  We only publish what we can back with real sources: the 200-mark,
                  4-section pattern and the full Class 8 syllabus above come from
                  the Kohat page and syllabus notes on this site. What we do not
                  publish — exact age limits, the application deadline, the test
                  date — comes from the college&apos;s official announcement, and you
                  should confirm those directly before planning around them.
                </p>
                <p className="mt-3">
                  Prepare the four sections consistently, and the test itself stops
                  being the unknown.
                </p>
              </section>

              <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm font-bold text-white mb-3">More from the blog</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link href="/blog/cch-preparation-guide" className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5 hover:bg-white/[0.09] transition-colors">
                    <Badge variant="glass" className="mb-2 text-[10px]">Guide</Badge>
                    <p className="text-sm font-bold text-white">How to Prepare for CCH Hasanabdal Entry Test 2026</p>
                  </Link>
                  <Link href="/blog/mcj-preparation-guide" className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5 hover:bg-white/[0.09] transition-colors">
                    <Badge variant="glass" className="mb-2 text-[10px]">Guide</Badge>
                    <p className="text-sm font-bold text-white">MCJ Jhelum Entry Test Guide — Pattern, Syllabus &amp; Preparation</p>
                  </Link>
                </div>
              </div>
              <div className="mt-6 bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Practice Kohat MCQs Now</p>
                  <p className="text-xs text-white/50 mt-0.5">Free exam-style questions for Cadet College Kohat</p>
                </div>
                <Link href="/colleges/kohat" className="shrink-0 text-xs font-bold text-[var(--color-accent-light)] hover:underline">Start →</Link>
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
