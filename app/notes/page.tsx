import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getSiteUrl } from "@/lib/site";
import { BookOpen, FileText, Globe, ShieldCheck } from "lucide-react";
import { PUBLIC_NOTES_SUBJECTS, countBlocks, countTopics } from "@/lib/public-notes";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "MDCAT Notes — Biology, Chemistry, Physics, English (Free, All PMDC Units)",
  description:
    "Free MDCAT notes for every PMDC syllabus unit: core concepts in easy language plus exam-depth revision notes built from the past-paper corpus. Read online, no signup.",
  keywords: [
    "MDCAT notes",
    "MDCAT notes free",
    "MDCAT biology notes",
    "MDCAT chemistry notes",
    "MDCAT physics notes",
    "MDCAT english notes",
    "PMDC MDCAT syllabus notes",
    "NUMS preparation notes",
  ],
  openGraph: {
    type: "website",
    url: `${siteUrl}/notes`,
    title: "Free MDCAT Notes — Every PMDC Unit | MED Prep",
    description:
      "Biology, Chemistry, Physics and English notes for MDCAT and NUMS — core concepts plus exam-depth revision, free and without a signup wall.",
    siteName: "MED Prep",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Free MDCAT notes — MED Prep" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free MDCAT Notes — Every PMDC Unit | MED Prep",
    description: "Biology, Chemistry, Physics and English notes for MDCAT and NUMS, free.",
    images: [`${siteUrl}/og.png`],
  },
  alternates: { canonical: "/notes" },
};

export default function NotesHubPage() {
  return (
    <div className="min-h-screen bg-[var(--field-1)] font-sans text-[var(--steel-100)] antialiased">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-12 overflow-hidden">
          <div className="container-page relative z-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Free MDCAT <span className="text-[var(--color-accent-light)]">Notes</span>
            </h1>
            <p className="text-lg text-[var(--steel-300)] max-w-2xl">
              Every PMDC MDCAT syllabus unit, explained in easy language — then taken to exam depth
              with fact-level revision notes derived from the past-paper corpus. Read online, free,
              no account needed.
            </p>
          </div>
        </section>

        {/* Subject pages */}
        <section className="pb-16">
          <div className="container-page">
            <h2 className="text-xl font-extrabold mb-2">Choose your subject</h2>
            <p className="text-sm text-[var(--steel-400)] mb-8">
              Core concepts first, exam-depth notes underneath — each page ends with a one-click
              practice drill on the same subject.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PUBLIC_NOTES_SUBJECTS.map((s) => {
                const blocks = countBlocks(s);
                const units = s.deep.length;
                return (
                  <Link
                    key={s.slug}
                    href={`/notes/${s.slug}`}
                    className="group block glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--line-2)] p-6 hover:border-[var(--signal-500)]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)] bg-white/[0.06] border border-[var(--line-2)] text-xl" aria-hidden="true">
                          {s.emoji}
                        </span>
                        <div>
                          <h3 className="text-base font-bold group-hover:text-[var(--color-accent-light)] transition-colors">
                            {s.name} notes
                          </h3>
                          <p className="text-xs text-[var(--steel-400)]">{s.weight} · PMDC MDCAT</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--signal-300)] bg-[var(--signal-500)]/10 px-2 py-1 rounded-full">
                        Free
                      </span>
                    </div>
                    <p className="text-sm text-[var(--steel-300)] leading-relaxed mb-4">{s.blurb}</p>
                    {/* Counts are computed from the real note data — never literals. */}
                    <p className="text-xs text-[var(--steel-400)]">
                      {units > 0
                        ? `${units} syllabus units · ${blocks.toLocaleString("en-US")} revision facts`
                        : `${countTopics([s.concept])} topic guides · ${blocks} revision points`}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Everything else we publish */}
        <section className="pb-16">
          <div className="container-page">
            <h2 className="text-xl font-extrabold mb-2">More free study material</h2>
            <p className="text-sm text-[var(--steel-400)] mb-8">
              Notes are the start — pair them with questions and papers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/topicals"
                className="group block glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--line-2)] p-5 hover:border-[var(--signal-500)]/40 transition-colors"
              >
                <FileText className="w-5 h-5 text-[var(--signal-300)] mb-3" aria-hidden="true" />
                <h3 className="text-sm font-bold mb-1 group-hover:text-[var(--color-accent-light)] transition-colors">
                  Topical MCQs — chapter-wise
                </h3>
                <p className="text-xs text-[var(--steel-400)] leading-relaxed">
                  Drill any Biology, Chemistry or Physics chapter with instant explanations — no
                  signup needed.
                </p>
              </Link>
              <Link
                href="/notes/usat-m"
                className="group block glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--line-2)] p-5 hover:border-[var(--signal-500)]/40 transition-colors"
              >
                <BookOpen className="w-5 h-5 text-[var(--signal-300)] mb-3" aria-hidden="true" />
                <h3 className="text-sm font-bold mb-1 group-hover:text-[var(--color-accent-light)] transition-colors">
                  HEC USAT-M notes
                </h3>
                <p className="text-xs text-[var(--steel-400)] leading-relaxed">
                  Every section by the official weightage — verbal, quantitative, physics, chemistry,
                  biology — free to read.
                </p>
              </Link>
              <Link
                href="/past-papers"
                className="group block glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--line-2)] p-5 hover:border-[var(--signal-500)]/40 transition-colors"
              >
                <BookOpen className="w-5 h-5 text-[var(--signal-300)] mb-3" aria-hidden="true" />
                <h3 className="text-sm font-bold mb-1 group-hover:text-[var(--color-accent-light)] transition-colors">
                  Past papers by board
                </h3>
                <p className="text-xs text-[var(--steel-400)] leading-relaxed">
                  MDCAT &amp; NUMS papers from 2019–2025, sorted by examining body and year, with
                  answer-key labels.
                </p>
              </Link>
              <Link
                href="/signup"
                className="group block glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--line-2)] p-5 hover:border-[var(--signal-500)]/40 transition-colors"
              >
                <ShieldCheck className="w-5 h-5 text-[var(--signal-300)] mb-3" aria-hidden="true" />
                <h3 className="text-sm font-bold mb-1 group-hover:text-[var(--color-accent-light)] transition-colors">
                  Protected Master Notes reader
                </h3>
                <p className="text-xs text-[var(--steel-400)] leading-relaxed">
                  The full white-paper master notes in a watermarked reader — free account
                  required, never downloadable.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* In-app pointer (honest: needs a free account) */}
        <section className="pb-20">
          <div className="container-page">
            <div className="bg-white/[0.06] border border-[var(--line-3)] rounded-[var(--radius-xl)] p-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Globe className="w-5 h-5 text-[var(--signal-300)]" aria-hidden="true" />
                <h2 className="text-xl font-bold">Inside the platform</h2>
              </div>
              <p className="text-sm text-[var(--steel-300)] mb-6 max-w-lg mx-auto">
                With a free account you also get interactive diagrams, mindmaps, flashcards, a
                mistake notebook and full-length mocks — every notes page links straight into a
                practice session on the same topic.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-gradient-to-r from-[var(--cta-from)] to-[var(--cta-to)] text-[var(--on-cta)] font-bold hover:opacity-90 transition-opacity"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/flashcards"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-white/10 ring-1 ring-[var(--line-3)] text-[var(--steel-100)] font-bold hover:bg-white/[0.14] transition-colors"
                >
                  Try Flashcards — No Signup
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
