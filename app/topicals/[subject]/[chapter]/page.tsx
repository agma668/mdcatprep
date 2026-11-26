import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getSiteUrl } from "@/lib/site";
import { TOPICALS_SUBJECTS, isSetChapter, topicalChapter } from "@/lib/topicals";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PUBLIC_NOTES_SUBJECTS } from "@/lib/public-notes";
import { TopicalDrill } from "@/components/practice/TopicalDrill";

const siteUrl = getSiteUrl();

const linkFocus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]";

type Props = { params: Promise<{ subject: string; chapter: string }> };

export function generateStaticParams(): { subject: string; chapter: string }[] {
  const out: { subject: string; chapter: string }[] = [];
  for (const s of TOPICALS_SUBJECTS) {
    // Sets are prerendered too — they are re-grouped in the hub UI, not moved or removed.
    for (const c of [...s.chapters, ...s.sets]) out.push({ subject: s.slug, chapter: c.slug });
  }
  return out;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject, chapter } = await params;
  const found = topicalChapter(subject, chapter);
  if (!found) return { title: "Topical practice not found" };
  const isSet = isSetChapter(found.chapter.title);
  // A whole-paper set is not a chapter, so the metadata must not call it
  // "chapter-wise"; the set name also describes an extraction, not an official sitting.
  const title = isSet
    ? `${found.chapter.title} — ${found.subject.name} MCQs`
    : `${found.chapter.title} MDCAT MCQs — ${found.subject.name} Chapter-wise Practice`;
  const description = isSet
    ? `${found.chapter.count} MDCAT ${found.subject.name.toLowerCase()} MCQs from the ${found.chapter.title} set with instant explanations. Free practice, no signup needed.`
    : `${found.chapter.count} chapter-wise MDCAT ${found.subject.name.toLowerCase()} MCQs on ${found.chapter.title} with instant explanations. Free topical practice, no signup needed.`;
  return {
    title,
    description,
    alternates: { canonical: `/topicals/${subject}/${chapter}` },
    openGraph: {
      type: "website",
      url: `${siteUrl}/topicals/${subject}/${chapter}`,
      title: `${title} | MED Prep`,
      description: `${found.chapter.count} MDCAT ${found.subject.name.toLowerCase()} MCQs on ${found.chapter.title} — free practice.`,
      siteName: "MED Prep",
    },
  };
}

export default async function TopicalChapterPage({ params }: Props) {
  const { subject, chapter } = await params;
  const found = topicalChapter(subject, chapter);
  if (!found) notFound();
  const { subject: s, chapter: c, questions } = found;
  // Chapters are the sibling links this page never had. Both lists come from the
  // subject the route already resolved, so an entry cannot outlive its page.
  const siblingChapters = s.chapters.filter((ch) => ch.slug !== c.slug);
  const siblingSets = s.sets.filter((set) => set.slug !== c.slug);
  const notesSlug = PUBLIC_NOTES_SUBJECTS.some((n) => n.slug === s.slug) ? s.slug : null;
  const isSet = isSetChapter(c.title);
  // The two banks have different provenance, so they get different sourcing notes. A set can hold
  // both, and then it says so rather than crediting one origin for all of it.
  const founderRows = questions.filter((q) => q.source.startsWith("Founder bank")).length;
  const keyedRows = questions.filter((q) => q.correct_answer !== null).length;
  const keyNote =
    keyedRows === questions.length
      ? ""
      : keyedRows === 0
        ? " None of these questions had a printed answer key in their source, so the drill runs in practice-only mode and scores nothing."
        : ` ${questions.length - keyedRows} of them had no printed answer key and run as practice-only, unscored.`;
  const mixedOrigin = founderRows > 0 && founderRows < questions.length;
  const sourcingNote = (mixedOrigin
    ? `Sourcing: ${founderRows} of these ${questions.length} questions come from the founder's own papers, the rest from a third-party question-bank extraction (MCQ Universe) compiled by MED Prep. The set name follows the source file; nothing here is presented as a verified official paper.`
    : founderRows > 0
      ? "Sourcing: every question here comes from the founder's own papers. The set name follows the source file, and no item is presented as a verified official paper."
      : isSet
        ? "Sourcing: this set is named after the year of a third-party question-bank extraction (MCQ Universe) compiled by MED Prep. It is not a verified official paper, and no item here is presented as one."
        : "Sourcing: chapter-wise questions from a third-party question-bank extraction (MCQ Universe) compiled by MED Prep. These are practice questions, not past-paper items — nothing here claims a real exam year.") + keyNote;

  return (
    <div className="min-h-screen bg-[var(--field-1)] font-sans text-[var(--steel-100)] antialiased">
      <Navbar />
      <main>
        <section className="relative pt-28 pb-8 overflow-hidden">
          <div className="container-page relative z-10">
            <Breadcrumbs
              items={[
                { name: "Home", href: "/" },
                { name: "Topical MCQs", href: "/topicals" },
                { name: s.name, href: `/topicals#${s.slug}` },
                { name: c.title },
              ]}
            />
            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
              {c.title}{" "}
              <span className="text-[var(--color-accent-light)]">— {s.name} MCQs</span>
            </h1>
            <p className="mt-2 text-sm text-[var(--steel-400)]">
              {questions.length} {isSet ? "questions in this set" : "chapter-wise questions"} ·
              the answer appears instantly where the source printed a key · guest-friendly (progress
              stays on your device).
            </p>
          </div>
        </section>

        <section className="pb-16">
          <div className="container-page">
            <TopicalDrill questions={questions} subjectName={s.name} chapterTitle={c.title} />

            {/* Lateral links. A drill page used to carry two outbound links — its
                parent hub and the footer — so the pages holding the deepest
                content on the site were a crawl cul-de-sac. Every entry here is
                derived from the same registry the route resolves. */}
            <nav
              aria-label={`More ${s.name} practice`}
              className="mt-14 border-t border-[var(--line-1)] pt-10"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-lg font-extrabold text-[var(--steel-100)]">
                  More {s.name} practice
                </h2>
                <Link
                  href={`/topicals#${s.slug}`}
                  className={`text-sm font-semibold text-[var(--signal-300)] underline underline-offset-4 hover:text-[var(--signal-200)] ${linkFocus}`}
                >
                  All {s.name} chapters →
                </Link>
              </div>

              {siblingChapters.length > 0 && (
                <ul role="list" className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                  {siblingChapters.map((chapter) => (
                    <li key={chapter.slug}>
                      <Link
                        href={`/topicals/${s.slug}/${chapter.slug}`}
                        className={`group flex items-baseline justify-between gap-3 text-sm ${linkFocus}`}
                      >
                        <span className="text-[var(--steel-200)] transition-colors group-hover:text-[var(--steel-100)] group-hover:underline">
                          {chapter.title}
                        </span>
                        <span className="shrink-0 text-[11px] tabular-nums text-[var(--steel-500)]">
                          {chapter.count} Qs
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {siblingSets.length > 0 && (
                <div className="mt-6">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--steel-400)]">
                    Whole-paper sets in {s.name}
                  </p>
                  <ul role="list" className="flex flex-wrap gap-2">
                    {siblingSets.map((set) => (
                      <li key={set.slug}>
                        <Link
                          href={`/topicals/${s.slug}/${set.slug}`}
                          className={`inline-flex items-baseline gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--line-2)] px-3 py-1.5 text-xs font-semibold text-[var(--steel-200)] hover:border-[var(--signal-500)]/40 ${linkFocus}`}
                        >
                          {set.title}
                          <span className="text-[10px] font-normal tabular-nums text-[var(--steel-500)]">
                            {set.count}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {notesSlug && (
                <p className="mt-6 text-sm leading-relaxed text-[var(--steel-300)]">
                  Reading before drilling works better: the{" "}
                  <Link
                    href={`/notes/${notesSlug}`}
                    className={`font-semibold text-[var(--signal-300)] underline underline-offset-4 hover:text-[var(--signal-200)] ${linkFocus}`}
                  >
                    {s.name} notes
                  </Link>{" "}
                  cover the same syllabus units this chapter asks about.
                </p>
              )}
            </nav>
            <p className="mt-10 text-xs text-[var(--steel-500)] max-w-2xl mx-auto text-center">
              {sourcingNote}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
