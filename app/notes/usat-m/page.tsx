import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getSiteUrl } from "@/lib/site";
import {
  USAT_M_NOTES_PREAMBLE,
  USAT_M_NOTES_SECTIONS,
  USAT_M_NOTES_NOTE,
} from "@/lib/usat-notes";
import { countTopics } from "@/lib/public-notes";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "HEC USAT-M Notes — Every Section by Official Weightage, Free",
  description: USAT_M_NOTES_PREAMBLE,
  keywords: [
    "HEC USAT notes",
    "USAT-M preparation notes",
    "USAT pre-medical syllabus",
    "HEC test verbal reasoning notes",
    "HEC USAT quantitative notes",
  ],
  openGraph: {
    type: "website",
    url: `${siteUrl}/notes/usat-m`,
    title: "Free HEC USAT-M Notes | MED Prep",
    description: USAT_M_NOTES_PREAMBLE,
    siteName: "MED Prep",
    images: [
      { url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "HEC USAT-M notes — MED Prep" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free HEC USAT-M Notes | MED Prep",
    description: USAT_M_NOTES_PREAMBLE,
    images: [`${siteUrl}/og.png`],
  },
  alternates: { canonical: "/notes/usat-m" },
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default function UsatMNotesPage() {
  const totalTopics = countTopics(USAT_M_NOTES_SECTIONS);

  return (
    <div className="min-h-screen bg-[var(--field-1)] font-sans text-[var(--steel-100)] antialiased">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-10 overflow-hidden">
          <div className="container-page relative z-10">
            <Link href="/notes" className="text-sm font-medium text-[var(--signal-300)] hover:underline">
              ← All Notes
            </Link>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight">
              HEC <span className="text-[var(--color-accent-light)]">USAT-M Notes</span>
            </h1>
            <p className="mt-4 text-lg text-[var(--steel-300)] max-w-2xl">{USAT_M_NOTES_PREAMBLE}</p>
            <p className="mt-3 text-sm text-[var(--steel-400)]">
              {USAT_M_NOTES_SECTIONS.length} sections · {totalTopics} topic guides · free, no signup
              needed.
            </p>
          </div>
        </section>

        {/* Table of contents */}
        <section className="pb-12">
          <div className="container-page">
            <nav aria-label="On this page" className="mb-10">
              <div className="flex flex-wrap gap-2">
                {USAT_M_NOTES_SECTIONS.map((section) => (
                  <a
                    key={section.title}
                    href={`#${slugify(section.title)}`}
                    className="px-4 py-2 rounded-[var(--radius-md)] border border-[var(--line-2)] text-sm font-medium text-[var(--steel-200)] hover:border-[var(--signal-500)] bg-white/[0.04]"
                  >
                    {section.title.replace(/^\d+\.\s*/, "")}
                  </a>
                ))}
                <a
                  href="/usat/practice"
                  className="px-4 py-2 rounded-[var(--radius-md)] border border-[var(--signal-500)]/40 text-sm font-semibold text-[var(--signal-300)] hover:bg-[var(--signal-500)]/10"
                >
                  Practice the USAT bank →
                </a>
              </div>
            </nav>

            {/* Sections */}
            <div className="space-y-10">
              {USAT_M_NOTES_SECTIONS.map((section) => (
                <div key={section.title} id={slugify(section.title)} className="scroll-mt-28">
                  <h2 className="text-xl font-extrabold mb-4">{section.title}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.topics.map((topic) => (
                      <div
                        key={topic.title}
                        className="glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--line-2)] p-5 md:p-6"
                      >
                        <h3 className="font-semibold text-[var(--steel-100)] mb-3">{topic.title}</h3>
                        <div className="space-y-2.5">
                          {topic.blocks.map((block, j) =>
                            block.type === "bullet" ? (
                              <li key={j} className="flex items-start gap-2 text-sm text-[var(--steel-300)] list-none">
                                <span className="text-[var(--signal-400)] font-bold mt-0.5" aria-hidden="true">
                                  •
                                </span>
                                <span>{block.text}</span>
                              </li>
                            ) : block.text.startsWith("Think like this:") ? (
                              <div
                                key={j}
                                className="mt-3 rounded-[var(--radius-md)] bg-[var(--signal-500)]/10 border border-[var(--signal-500)]/25 px-4 py-3"
                              >
                                <p className="text-sm text-[var(--steel-200)]">
                                  <span className="font-semibold text-[var(--signal-300)]">
                                    Think like this:{" "}
                                  </span>
                                  {block.text.replace(/^Think like this:\s*/, "")}
                                </p>
                              </div>
                            ) : (
                              <p key={j} className="text-sm text-[var(--steel-300)]">
                                {block.text}
                              </p>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Honesty note + cross-links */}
            <p className="mt-10 text-xs text-[var(--steel-400)] max-w-3xl leading-relaxed">
              {USAT_M_NOTES_NOTE}
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/usat/practice"
                className="group block glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--line-2)] p-5 hover:border-[var(--signal-500)]/40 transition-colors"
              >
                <h3 className="text-sm font-bold mb-1 group-hover:text-[var(--color-accent-light)] transition-colors">
                  USAT practice bank
                </h3>
                <p className="text-xs text-[var(--steel-400)] leading-relaxed">
                  Original exam-style MCQs by subject, with rationale for every answer.
                </p>
              </Link>
              <Link
                href="/flashcards"
                className="group block glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--line-2)] p-5 hover:border-[var(--signal-500)]/40 transition-colors"
              >
                <h3 className="text-sm font-bold mb-1 group-hover:text-[var(--color-accent-light)] transition-colors">
                  USAT flashcards
                </h3>
                <p className="text-xs text-[var(--steel-400)] leading-relaxed">
                  Formulas, rapid science facts and high-yield vocabulary decks.
                </p>
              </Link>
              <Link
                href="/notes"
                className="group block glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--line-2)] p-5 hover:border-[var(--signal-500)]/40 transition-colors"
              >
                <h3 className="text-sm font-bold mb-1 group-hover:text-[var(--color-accent-light)] transition-colors">
                  All notes
                </h3>
                <p className="text-xs text-[var(--steel-400)] leading-relaxed">
                  MDCAT subject notes and the USAT-M guide, free to read.
                </p>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
