import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getSiteUrl } from "@/lib/site";
import { ArrowLeft } from "lucide-react";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "CCH Entry Test Syllabus 2026 — Complete Topic-Wise Breakdown",
  description:
    "Full topic-wise syllabus for Cadet College Hasanabdal (CCH) entry test 2026. Every topic under Mathematics, English, General Science, Islamiat and Urdu — with marks distribution.",
  keywords: [
    "CCH entry test syllabus 2026",
    "CCH Hasanabdal syllabus",
    "CCH syllabus complete",
    "CCH math syllabus",
    "CCH English syllabus",
    "CCH science syllabus",
    "CCH Islamiat syllabus",
    "CCH Urdu syllabus",
    "Cadet College Hasanabdal topics",
    "CCH preparation topics list",
  ],
  openGraph: {
    type: "article",
    url: `${siteUrl}/colleges/cch/syllabus`,
    title: "CCH Entry Test Syllabus 2026 — Complete Topic-Wise Breakdown | Cadet College Prep",
    description:
      "Full topic-wise syllabus for CCH Hasanabdal entry test. Every topic under all 4 sections.",
    siteName: "Cadet Prep",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "CCH Entry Test Syllabus 2026 — Cadet College Prep" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CCH Syllabus 2026 | Cadet College Prep",
    description: "Complete topic-wise syllabus for CCH Hasanabdal entry test.",
    images: [`${siteUrl}/og.png`],
  },
  alternates: { canonical: "/colleges/cch/syllabus" },
};

const syllabusJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "CCH Entry Test Syllabus 2026 — Complete Topic-Wise Breakdown",
  description:
    "Full topic-wise syllabus for Cadet College Hasanabdal entry test covering Mathematics, English, General Science, Islamiat and Urdu.",
  url: `${siteUrl}/colleges/cch/syllabus`,
  author: { "@type": "Organization", name: "Cadet Prep (Cadet College Prep)", url: siteUrl },
  publisher: { "@type": "Organization", name: "Cadet Prep (Cadet College Prep)", url: siteUrl },
  datePublished: "2026-08-15",
  dateModified: "2026-08-15",
};

const SECTIONS = [
  {
    title: "Mathematics",
    marks: 50,
    accent: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    topics: [
      { unit: "Arithmetic", items: ["Addition, Subtraction, Multiplication, Division", "Fractions and Decimals", "Percentages", "Ratio and Proportion", "Profit and Loss", "Simple and Compound Interest", "Time, Speed and Distance", "Work and Time Problems"] },
      { unit: "Algebra", items: ["Basic Algebraic Expressions", "Linear Equations (one variable)", "Simplification of Expressions", "Factorization", "Basic Quadratic Concepts"] },
      { unit: "Geometry", items: ["Lines, Angles and Triangles", "Quadrilaterals and Polygons", "Circles — Area and Circumference", "Perimeter and Area of Figures", "Volume of Cubes and Cuboids"] },
      { unit: "Statistics", items: ["Mean, Median, Mode (basic)", "Reading Bar Charts and Graphs", "Probability (simple events)"] },
    ],
  },
  {
    title: "English",
    marks: 40,
    accent: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
    topics: [
      { unit: "Grammar", items: ["Parts of Speech", "Tenses (Present, Past, Future)", "Active and Passive Voice", "Direct and Indirect Speech", "Articles (a, an, the)", "Prepositions", "Subject-Verb Agreement"] },
      { unit: "Vocabulary", items: ["Synonyms and Antonyms", "One-Word Substitutions", "Idioms and Phrases", "Word Meanings from Context"] },
      { unit: "Comprehension", items: ["Reading Comprehension Passages", "Sentence Completion", "Sentence Correction", "Paragraph Ordering"] },
    ],
  },
  {
    title: "General Science",
    marks: 50,
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    topics: [
      { unit: "Physics", items: ["Force, Motion and Energy", "Light and Sound", "Heat and Temperature", "Electricity (basic concepts)", "Simple Machines"] },
      { unit: "Chemistry", items: ["Elements, Compounds and Mixtures", "States of Matter", "Acids, Bases and Salts", "Chemical Reactions (basic)", "Air and Water"] },
      { unit: "Biology", items: ["Cells — Structure and Function", "Human Body Systems (basic)", "Plants and Photosynthesis", "Disease and Hygiene", "Ecology (basic concepts)"] },
    ],
  },
  {
    title: "Islamiat + Urdu",
    marks: 60,
    accent: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    topics: [
      { unit: "Islamiat (10 marks)", items: ["Kalima and its meaning", "Five Pillars of Islam", "Seerat of Holy Prophet ﷺ", "Important Surahs and Ayahs", "Islamic History basics"] },
      { unit: "Urdu (50 marks)", items: ["Comprehension ( Nasr )", "Grammar — Ism, Fail, Harf", "Sentence Correction", "Paragraph Writing basics", "Poetry — Ghazal and Nazm identification", "Letter / Application writing"] },
    ],
  },
];

export default function CCHSyllabusPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(syllabusJsonLd) }} />
      <Navbar />
      <main>
        <article className="pt-32 pb-20">
          <div className="container-page max-w-4xl">
            <Link href="/colleges/cch" className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-[var(--color-accent-light)] transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" /> Back to CCH Prep
            </Link>

            <div className="mb-12">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                CCH Entry Test Syllabus <span className="text-[var(--color-accent-light)]">2026</span>
              </h1>
              <p className="text-lg text-white/70 leading-relaxed max-w-2xl">
                Complete topic-wise breakdown of the Cadet College Hasanabdal entry test.
                Total: <strong className="text-white">200 marks</strong> across 4 sections in <strong className="text-white">3 hours</strong>.
              </p>
            </div>

            <div className="space-y-10">
              {SECTIONS.map(({ title, marks, accent, bg, topics }) => (
                <section key={title}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className={`text-lg font-extrabold ${accent}`}>{title}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${bg} ${accent}`}>
                      {marks} marks
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topics.map(({ unit, items }) => (
                      <div key={unit} className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5">
                        <h3 className="text-sm font-bold text-white mb-3">{unit}</h3>
                        <ul className="space-y-1.5">
                          {items.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-xs text-white/70">
                              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${accent.replace("text-", "bg-")}`} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-14 bg-white/[0.06] border border-white/15 rounded-[var(--radius-xl)] p-8 text-center">
              <h2 className="text-xl font-bold text-white mb-3">Ready to Cover This Syllabus?</h2>
              <p className="text-sm text-white/70 mb-6 max-w-md mx-auto">
                Cadet College Prep has MCQs for every topic listed above. Practice subject-wise, track your progress, and identify weak areas.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-text-inverse)] font-bold hover:bg-[var(--color-accent-light)] transition-colors">
                  Sign Up Free
                </Link>
                <Link href="/blog/cch-preparation-guide" className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-white/10 ring-1 ring-white/25 text-white font-bold hover:bg-white/20 transition-colors">
                  Read the Full Guide
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
