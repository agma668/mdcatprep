import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getSiteUrl } from "@/lib/site";
import {
  TOPICALS_CHAPTER_COUNT,
  TOPICALS_SUBJECTS,
  TOPICALS_TOTAL,
} from "@/lib/topicals";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "MDCAT Topical MCQs — Chapter-wise Practice by Subject (Free)",
  description:
    "Chapter-wise MDCAT topical MCQs for Biology, Chemistry and Physics: pick a subject, pick a chapter, drill with instant explanations. Free, no signup needed.",
  keywords: [
    "MDCAT topical MCQs",
    "MDCAT chapter wise questions",
    "MDCAT biology chapter wise MCQs",
    "MDCAT physics topical practice",
    "MDCAT chemistry chapter wise MCQs",
  ],
  openGraph: {
    type: "website",
    url: `${siteUrl}/topicals`,
    title: "MDCAT Topical MCQs — Chapter-wise | MED Prep",
    description:
      "Chapter-wise MDCAT MCQs for Biology, Chemistry and Physics — drill any chapter with instant explanations, free.",
    siteName: "MED Prep",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "MDCAT topical MCQs — MED Prep" }],
  },
  alternates: { canonical: "/topicals" },
};

export default function TopicalsHubPage() {
  return (
    <div className="min-h-screen bg-[var(--field-1)] font-sans text-[var(--steel-100)] antialiased">
      <Navbar />
      <main>
        <section className="relative pt-32 pb-10 overflow-hidden">
          <div className="container-page relative z-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Topical <span className="text-[var(--color-accent-light)]">MCQs</span>
            </h1>
            <p className="text-lg text-[var(--steel-300)] max-w-2xl">
              Practice one chapter at a time — the way the exam actually tests you. Pick a subject,
              pick a chapter, drill with instant explanations. Answers are tracked on your device
              only; sign in to have attempts count toward your progress.
            </p>
            <p className="mt-3 text-sm text-[var(--steel-400)]">
              {TOPICALS_TOTAL.toLocaleString("en-US")} questions across {TOPICALS_CHAPTER_COUNT}{" "}
              chapters, all three science subjects · free, no signup needed.
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="container-page space-y-12">
            {TOPICALS_SUBJECTS.map((s) => (
              <div key={s.slug}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)] bg-white/[0.06] border border-[var(--line-2)] text-xl" aria-hidden="true">
                    {s.icon}
                  </span>
                  <div>
                    <h2 className="text-xl font-extrabold">{s.name}</h2>
                    <p className="text-xs text-[var(--steel-400)]">
                      {s.count.toLocaleString("en-US")} questions · {s.chapters.length} chapters
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {s.chapters.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/topicals/${s.slug}/${c.slug}`}
                      className="group block glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--line-2)] px-5 py-4 hover:border-[var(--signal-500)]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-bold group-hover:text-[var(--color-accent-light)] transition-colors leading-snug">
                          {c.title}
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--steel-400)] bg-white/[0.06] px-2 py-1 rounded-full shrink-0">
                          {c.count} Qs
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Honest source note — required by the honesty rule. */}
            <p className="text-xs text-[var(--steel-500)] max-w-3xl">
              Sourcing: topical questions come from a third-party question-bank extraction (MCQ
              Universe) compiled by the founder, not from real MDCAT sittings — no question on this
              page claims a past-paper year. Original MED Prep exam-style questions live in the
              signed-in practice area.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
