import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getSiteUrl } from "@/lib/site";
import { MDCAT_QUESTIONS } from "@/lib/mdcat";
import {
  KIND_DESCRIPTIONS,
  OFFICIAL_PAPER_COUNT,
  PAST_PAPER_COUNT,
  PAST_PAPER_UNDATED_COUNT,
  PAST_PAPER_YEARS,
  isOfficialKey,
  keyLabel,
  kindLabel,
  paperCountsByKind,
  papersByYear,
  pastPaperLabel,
} from "@/lib/past-papers";
import { BANK_BY_SECTION, BANK_TOTAL, formatStat } from "@/lib/stats";
import { CalendarDays, KeyRound, MapPin, ShieldCheck, ArrowRight } from "lucide-react";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "MDCAT & NUMS Past Papers by Year — Official, Recreated & Mock, With Keys",
  description:
    "Every paper we hold, by year and examining body — UHS, BUMHS Bolan, KMU, SZABMU, DUHS, SIBA, ETEA and NUMS — with which codes carry a key. Each item is labelled with how it relates to the real sitting, so nothing we hold can read as the paper that was sat when it is not.",
  keywords: [
    "MDCAT past papers year wise",
    "MDCAT past papers with answer key",
    "NUMS past papers 2025",
    "NUMS MDCAT past paper",
    "NUMS MDCAT 2024 paper with key",
    "UHS MDCAT past paper 2025",
    "KMU MDCAT past paper",
    "SZABMU MDCAT past paper",
    "MDCAT topical questions",
  ],
  openGraph: {
    type: "website",
    url: `${siteUrl}/past-papers`,
    title: "MDCAT & NUMS Past Papers by Year | MED Prep",
    description: "Papers by year and examining body for MDCAT and NUMS, with keys — each labelled with how it relates to the real sitting.",
    siteName: "MED Prep",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "MDCAT past papers by year — MED Prep" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MDCAT & NUMS Past Papers by Year | MED Prep",
    description: "MDCAT and NUMS papers by year and examining body, with keys.",
    images: [`${siteUrl}/og.png`],
  },
  alternates: { canonical: "/past-papers" },
};

// Counted once, at module scope — this page is static. BANK_TOTAL and the
// per-section split come from lib/stats.ts so this page cannot disagree with
// the hero about how big the bank is.
const TAGGED_TOTAL = MDCAT_QUESTIONS.filter((q) => q.pastPaper).length;
const YEARS = papersByYear();
const KINDS = paperCountsByKind();
// `PAST_PAPER_YEARS` excludes undated items, so the oldest/newest span never
// silently absorbs the "Undated" group as if it were a year.
const OLDEST = PAST_PAPER_YEARS[PAST_PAPER_YEARS.length - 1];
const NEWEST = PAST_PAPER_YEARS[0];
const SPAN = OLDEST === undefined ? "" : OLDEST === NEWEST ? String(OLDEST) : `${OLDEST}–${NEWEST}`;

export default function PastPapersPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
      <Navbar />
      <main>
        <section className="relative pt-32 pb-12 overflow-hidden">
          <div className="container-page relative z-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Past Papers <span className="text-[var(--color-accent-light)]">by Year</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl">
              Every paper we hold for the medical entry tests, sorted by year and examining body — MDCAT
              and NUMS — so you know exactly which sessions and paper codes exist, which ones come with a
              key, and how each item relates to the paper that was actually sat.
            </p>
          </div>
        </section>

        {/* Year groups */}
        <section className="pb-16">
          <div className="container-page">
            <div className="space-y-10">
              {YEARS.map(({ key, papers }) => (
                <div key={key}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/15 text-[var(--color-primary-light)]">
                      <CalendarDays className="h-4 w-4" />
                    </span>
                    <h2 className="text-2xl font-extrabold tracking-tight">{key}</h2>
                    <span className="text-xs font-bold text-white/40">
                      {papers.length} paper{papers.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {papers.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.06] p-5 transition-all hover:border-white/15 hover:bg-white/[0.09]"
                      >
                        <p className="mb-2 font-bold text-white">{pastPaperLabel(p)}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-white/50">
                          {/* The kind badge is not decoration: it is the thing that
                              stops a reconstruction reading as the sat paper. */}
                          <span
                            className={
                              p.kind === "official"
                                ? "inline-flex items-center rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-2 py-0.5 font-semibold text-[var(--color-primary-light)]"
                                : "inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 font-semibold text-white/60"
                            }
                          >
                            {kindLabel(p.kind)}
                          </span>
                          {p.region && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {p.region}
                            </span>
                          )}
                          {keyLabel(p) && (
                            <span
                              className={
                                isOfficialKey(p)
                                  ? "inline-flex items-center gap-1 text-[var(--color-primary-light)]"
                                  : "inline-flex items-center gap-1 text-white/50"
                              }
                            >
                              <KeyRound className="h-3 w-3" /> {keyLabel(p)}
                            </span>
                          )}
                        </div>
                        {p.note && (
                          <p className="mt-3 text-xs leading-relaxed text-white/40">{p.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Kind legend. A reader has to be able to tell the paper that was sat from
            a reconstruction, so the labels are explained rather than assumed. */}
        <section className="pb-16">
          <div className="container-page">
            <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.06] p-6 sm:p-8">
              <h2 className="mb-2 text-2xl font-extrabold tracking-tight">What each label means</h2>
              <p className="mb-6 max-w-2xl text-sm text-white/60">
                Not everything that circulates as a &ldquo;past paper&rdquo; is the paper that was sat — much
                of it is reconstructed from candidate recall afterwards, or written by an academy as a
                practice test. Every item we hold carries a label saying which it is, and a key that ships
                with a reconstruction is called an answer key, never an official one. {" "}
                <span className="text-white/75">
                  Everything listed on this page today is an official sitting
                </span>{" "}
                — the other labels exist so that a reconstruction cannot be added later without saying so.
              </p>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {KINDS.map(({ kind, label, count }) => (
                  <div
                    key={kind}
                    className="rounded-[var(--radius-md)] border border-white/10 bg-white/[0.04] p-4"
                  >
                    <dt className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-bold text-white">{label}</span>
                      <span className="text-sm font-extrabold tabular-nums text-[var(--color-primary-light)]">
                        {count}
                      </span>
                    </dt>
                    <dd className="mt-1.5 text-xs leading-relaxed text-white/55">
                      {KIND_DESCRIPTIONS[kind]}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Coverage */}
        <section className="pb-16">
          <div className="container-page">
            <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.06] p-6 sm:p-8">
              <h2 className="mb-2 text-2xl font-extrabold tracking-tight">Topical practice coverage</h2>
              <p className="mb-6 max-w-2xl text-sm text-white/60">
                Practise any of these sections by chapter and topic. {BANK_TOTAL} exam-style questions, all
                written for the PMDC/NUMS syllabus — nothing re-hosted from a commercial compilation.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {BANK_BY_SECTION.map(({ name, count }) => (
                  <div key={name} className="rounded-[var(--radius-md)] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-2xl font-extrabold tabular-nums text-[var(--color-primary-light)]">
                      {formatStat(count)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-white/60">{name}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard/practice"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary-light)] hover:underline"
              >
                Start a topical drill <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Honesty note */}
        <section className="pb-24">
          <div className="container-page">
            <div className="flex items-start gap-4 rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.03] p-6">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/15 text-[var(--color-primary-light)]">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <h3 className="mb-1 font-bold text-white">Where the year tag comes from</h3>
                <p className="max-w-3xl text-sm leading-relaxed text-white/60">
                  A question shows a year badge only when it genuinely came from the paper named — never as
                  decoration. All {BANK_TOTAL} questions in the bank today are original exam-style writing
                  written from the syllabus, so {" "}
                  <span className="font-semibold text-white/80">
                    {TAGGED_TOTAL === 0 ? "none carry a year" : `${TAGGED_TOTAL} carry a year`}
                  </span>{" "}
                  and the badge stays hidden rather than guessing. We hold {PAST_PAPER_COUNT} papers
                  {SPAN && <> ({SPAN})</>}{" "}
                  {
                    // Both counts move together, so the sentence has to stay true
                    // whether or not a reconstruction has been added yet.
                    OFFICIAL_PAPER_COUNT === PAST_PAPER_COUNT
                      ? ", every one an official sitting"
                      : `, ${OFFICIAL_PAPER_COUNT} of them official sittings and the rest reconstructions, campus tests or mocks`
                  }
                  {" "}
                  — each labelled above, so the paper that was sat is always distinguishable from a
                  reconstruction — ready to tag as they are worked through.
                  {PAST_PAPER_UNDATED_COUNT > 0 && (
                    <>
                      {" "}
                      A further {PAST_PAPER_UNDATED_COUNT} carry no year on the file at all and are grouped
                      as <span className="font-semibold text-white/80">Undated</span> rather than filed
                      under a year we would be guessing.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
