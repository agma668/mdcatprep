import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getSiteUrl } from "@/lib/site";
import {
  KIND_DESCRIPTIONS,
  PAST_PAPERS,
  isOfficialKey,
  keyLabel,
  kindLabel,
  papersByExam,
  pastPaperLabel,
} from "@/lib/past-papers";

const siteUrl = getSiteUrl();

/** Board slug: "uhs-mdcat" → the exam key the registry uses. */
function examForSlug(slug: string): string | null {
  return (
    papersByExam().find((g) => g.key.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug)?.key ??
    null
  );
}

export function generateStaticParams(): { board: string }[] {
  return papersByExam().map((g) => ({
    board: g.key.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
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
  const yearKeys = [...new Set(papers.map((p) => p.year ?? null))].sort(
    (a, b) => (b ?? -1) - (a ?? -1)
  );

  return (
    <div className="min-h-screen bg-[var(--field-1)] font-sans text-[var(--steel-100)] antialiased">
      <Navbar />
      <main>
        <section className="relative pt-32 pb-10 overflow-hidden">
          <div className="container-page relative z-10">
            <Link href="/past-papers" className="text-sm font-medium text-[var(--signal-300)] hover:underline">
              ← All past papers
            </Link>
            <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight">
              {exam} <span className="text-[var(--color-accent-light)]">Past Papers</span>
            </h1>
            <p className="mt-3 text-sm text-[var(--steel-400)]">
              {papers.length} paper{papers.length === 1 ? "" : "s"} · grouped by year · every item
              labelled with how it relates to the real sitting.
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
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {rows.map((p) => (
                      <div key={p.id} className="glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--line-2)] p-5">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-sm font-bold leading-snug">{pastPaperLabel(p)}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--signal-300)] bg-[var(--signal-500)]/10 px-2 py-1 rounded-full shrink-0">
                            {kindLabel(p.kind)}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--steel-400)] mb-2">
                          {p.region ? `${p.region} · ` : ""}
                          {KIND_DESCRIPTIONS[p.kind]}
                        </p>
                        <p className="text-xs text-[var(--steel-300)]">
                          {isOfficialKey(p)
                            ? `Carries ${keyLabel(p)?.toLowerCase() ?? "an official key"}`
                            : p.hasKey
                              ? "An answer key circulates with this item (not an official key)"
                              : "No answer key"}
                        </p>
                        {p.note && <p className="text-xs text-[var(--steel-400)] mt-2 italic">{p.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
