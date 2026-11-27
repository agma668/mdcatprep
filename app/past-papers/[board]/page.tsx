import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getSiteUrl } from "@/lib/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  KIND_DESCRIPTIONS,
  PAST_PAPERS,
  isOfficialKey,
  keyLabel,
  kindLabel,
  papersByExam,
  pastPaperBoardSlug,
  pastPaperLabel,
  groupSittings,
  paperRegion,
} from "@/lib/past-papers";

const siteUrl = getSiteUrl();

const linkFocus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]";

/**
 * Board slug: "uhs-mdcat" → the exam key the registry uses.
 *
 * Trailing separators are stripped on both sides of this contract. An exam named
 * "SZABMU MDCAT (reconducted)" collapsed to "szabmu-mdcat-reconducted-", so its page was only
 * reachable at a URL ending in a dash while the sitemap submitted the clean one — a 404 for every
 * crawler and a dead link for the board list.
 */
const boardSlug = pastPaperBoardSlug;

function examForSlug(slug: string): string | null {
  const wanted = slug.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return papersByExam().find((g) => boardSlug(g.key) === wanted)?.key ?? null;
}

export function generateStaticParams(): { board: string }[] {
  return papersByExam().map((g) => ({
    board: boardSlug(g.key),
  }));
}

type Props = { params: Promise<{ board: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { board } = await params;
  const exam = examForSlug(board);
  if (!exam) return { title: "Board not found" };
  const papers = PAST_PAPERS.filter((p) => p.exam === exam);
  const years = [...new Set(papers.map((p) => p.year).filter((y): y is number => y !== null))].sort((a, b) => b - a);
  return {
    title: `${exam} Past Papers ${years.length ? years[years.length - 1] : ""}${years.length > 1 ? `–${years[0]}` : ""} — All Codes & Answer Keys`,
    description: `Every ${exam} past paper we hold, sorted by year and paper code, with which codes carry an answer key. Honest labels: each item declares how it relates to the real sitting.`,
    alternates: { canonical: `/past-papers/${board}` },
    openGraph: {
      type: "website",
      url: `${siteUrl}/past-papers/${board}`,
      title: `${exam} Past Papers | MED Prep`,
      description: `${exam} papers by year and code, with answer-key labels.`,
      siteName: "MED Prep",
    },
  };
}

export default async function BoardPage({ params }: Props) {
  const { board } = await params;
  const exam = examForSlug(board);
  if (!exam) notFound();
  const papers = PAST_PAPERS.filter((p) => p.exam === exam);

  // Year groups, newest first; undated last.
  const boards = papersByExam();
  const yearKeys = [...new Set(papers.map((p) => p.year ?? null))].sort(
    (a, b) => (b ?? -1) - (a ?? -1)
  );

  return (
    <div className="min-h-screen bg-[var(--field-1)] font-sans text-[var(--steel-100)] antialiased">
      <Navbar />
      <main>
        <section className="relative pt-32 pb-10 overflow-hidden">
          <div className="container-page relative z-10">
            <Breadcrumbs
              items={[
                { name: "Home", href: "/" },
                { name: "Past papers", href: "/past-papers" },
                { name: exam },
              ]}
            />
            <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight">
              {exam} <span className="text-[var(--color-accent-light)]">Past Papers</span>
            </h1>
            {/^NUMS\b/i.test(exam) && (
              <p className="mt-4 max-w-2xl rounded-[var(--radius-md)] border border-[var(--line-2)] bg-white/[0.04] px-4 py-3 text-xs leading-relaxed text-[var(--steel-300)]">
                NUMS is a national university and sets its own entry test. Everything on this page is a
                NUMS sitting — none of it is a PMDC national or provincial MDCAT paper.{" "}
                <Link href="/past-papers" className="font-semibold text-[var(--signal-300)] underline underline-offset-4">
                  MDCAT papers, grouped by province
                </Link>
                .
              </p>
            )}
            <p className="mt-3 text-sm text-[var(--steel-400)]">
              {papers.length} paper{papers.length === 1 ? "" : "s"} · {new Set(papers.map(paperRegion)).size === 1
                ? [...new Set(papers.map(paperRegion))][0]
                : "grouped by province"}{" "}
              · grouped by year, one card per sitting · every item labelled with how it relates to the
              real sitting.
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="container-page space-y-10">
            {yearKeys.map((year) => {
              const rows = papers.filter((p) => (p.year ?? null) === year);
              return (
                <div key={year ?? "undated"}>
                  <h2 className="text-lg font-extrabold mb-3 flex items-center gap-3">
                    <span className="w-1.5 h-5 rounded-full bg-[var(--signal-500)]" aria-hidden="true" />
                    {year ?? "Undated"}
                    <span className="text-xs font-bold text-[var(--steel-500)]">
                      {groupSittings(rows).length} sitting{groupSittings(rows).length === 1 ? "" : "s"}
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {groupSittings(rows).map((s) => {
                      const keyed = { kind: s.kind, hasKey: s.hasKey };
                      return (
                        <div key={s.key} className="glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--line-2)] p-5">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-sm font-bold leading-snug">
                              {pastPaperLabel({ exam: s.exam, year: s.year })}
                            </h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--signal-300)] bg-[var(--signal-500)]/10 px-2 py-1 rounded-full shrink-0">
                              {kindLabel(s.kind)}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--steel-400)] mb-2">
                            {s.region ? `${s.region} · ` : ""}
                            {KIND_DESCRIPTIONS[s.kind]}
                          </p>
                          <p className="text-xs text-[var(--steel-300)]">
                            {isOfficialKey(keyed)
                              ? `Carries ${keyLabel(keyed)?.toLowerCase() ?? "an official key"}`
                              : s.hasKey
                                ? "An answer key circulates with this item (not an official key)"
                                : "No answer key"}
                          </p>
                          {s.codes.length > 0 && (
                            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--steel-300)]">
                              <span className="font-bold uppercase tracking-wider text-[var(--steel-500)]">
                                {s.codes.length === 1 ? "Code" : `${s.codes.length} codes`}
                              </span>
                              {s.codes.map((code) => (
                                <span key={code} className="rounded border border-[var(--line-2)] px-1.5 py-0.5 font-semibold">
                                  {code}
                                </span>
                              ))}
                            </div>
                          )}
                          {s.codes.length > 1 && (
                            <p className="text-xs text-[var(--steel-500)] mt-2">
                              One sitting: the codes differ in question order, not in syllabus.
                            </p>
                          )}
                          {s.papers.some((p) => p.id === "uhs-2025-d") && (
                            <Link
                              href="/past-papers/uhs-2025"
                              className={`mt-4 inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--signal-500)]/40 bg-[var(--signal-500)]/10 px-4 py-2 text-xs font-bold text-[var(--signal-300)] transition-colors hover:bg-[var(--signal-500)]/20 ${linkFocus}`}
                            >
                              Sit this paper timed — 180 questions, 180 minutes →
                            </Link>
                          )}
                          {s.papers.find((p) => p.note)?.note && (
                            <p className="text-xs text-[var(--steel-400)] mt-2 italic">
                              {s.papers.find((p) => p.note)?.note}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        {/* Lateral exits. This page used to carry one outbound link — back to the
            hub — so eleven boards with real paper lists were dead ends for a
            reader and for a crawler. */}
        <section className="pb-20">
          <div className="container-page">
            <h2 className="mb-2 text-xl font-extrabold">Other examining bodies</h2>
            <p className="mb-6 max-w-2xl text-sm text-[var(--steel-400)]">
              Papers are held for {boards.length} boards. Each board page lists its own sittings and
              says whether a key ships with every item.
            </p>
            <ul role="list" className="flex flex-wrap gap-2">
              {boards
                .filter((group) => group.key !== exam)
                .map((group) => (
                  <li key={group.key}>
                    <Link
                      href={`/past-papers/${boardSlug(group.key)}`}
                      className={`inline-flex items-baseline gap-2 rounded-[var(--radius-md)] border border-[var(--line-2)] bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-[var(--steel-200)] transition-colors hover:border-[var(--signal-500)]/40 hover:text-white ${linkFocus}`}
                    >
                      {group.key}
                      <span className="text-[10px] font-normal tabular-nums text-[var(--steel-500)]">
                        {group.papers.length}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
            <p className="mt-8 max-w-2xl text-sm leading-relaxed text-[var(--steel-300)]">
              Reading a paper is half the job.{" "}
              <Link
                href="/topicals"
                className={`font-semibold text-[var(--signal-300)] underline underline-offset-4 hover:text-[var(--signal-200)] ${linkFocus}`}
              >
                Drill the syllabus chapter by chapter
              </Link>{" "}
              or read the{" "}
              <Link
                href="/notes"
                className={`font-semibold text-[var(--signal-300)] underline underline-offset-4 hover:text-[var(--signal-200)] ${linkFocus}`}
              >
                notes for the same units
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
