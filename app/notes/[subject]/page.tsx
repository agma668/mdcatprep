import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getSiteUrl } from "@/lib/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { topicalSubject } from "@/lib/topicals";
import {
  PUBLIC_NOTES_SUBJECTS,
  countTopics,
  type NoteBlock,
  type NoteSection,
} from "@/lib/public-notes";

const siteUrl = getSiteUrl();

const linkFocus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]";

/** The dashboard page's anchor scheme: every heading gets a stable id. */
function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

type Props = { params: Promise<{ subject: string }> };

export function generateStaticParams(): { subject: string }[] {
  return PUBLIC_NOTES_SUBJECTS.map((s) => ({ subject: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug } = await params;
  const subject = PUBLIC_NOTES_SUBJECTS.find((s) => s.slug === slug);
  if (!subject) return { title: "Notes not found" };
  const title =
    subject.deep.length > 0
      ? `${subject.name} MDCAT Notes — Every PMDC Unit, Easy Language, Free`
      : `${subject.name} MDCAT Notes — Easy Language, Free`;
  return {
    title,
    description: subject.blurb,
    keywords: [
      `${subject.name.toLowerCase()} MDCAT notes`,
      `MDCAT ${subject.name.toLowerCase()} notes pdf`,
      "PMDC MDCAT syllabus notes",
      "MDCAT notes online free",
    ],
    openGraph: {
      type: "website",
      url: `${siteUrl}/notes/${subject.slug}`,
      title: `${subject.name} MDCAT Notes | MED Prep`,
      description: subject.blurb,
      siteName: "MED Prep",
      images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: `${subject.name} MDCAT notes — MED Prep` }],
    },
    alternates: { canonical: `/notes/${subject.slug}` },
  };
}

/** Shared with the dashboard's Think-like-this treatment: same vocabulary. */
function BlockText({ block }: { block: NoteBlock }) {
  const isThink = block.text.startsWith("Think like this:");
  if (isThink) {
    return (
      <div className="mt-3 rounded-[var(--radius-md)] bg-[var(--signal-500)]/10 border border-[var(--signal-500)]/25 px-4 py-3">
        <p className="text-sm text-[var(--steel-200)]">
          <span className="font-semibold text-[var(--signal-300)]">Think like this: </span>
          {block.text.replace(/^Think like this:\s*/, "")}
        </p>
      </div>
    );
  }
  if (block.type === "bullet") {
    return (
      <li className="flex items-start gap-2 text-sm text-[var(--steel-300)]">
        <span className="text-[var(--signal-400)] font-bold mt-0.5" aria-hidden="true">
          •
        </span>
        <span>{block.text}</span>
      </li>
    );
  }
  return <p className="text-sm text-[var(--steel-300)]">{block.text}</p>;
}

/** One section = one card; the deep corpus uses the same shape as concept notes. */
function SectionCard({ section, compact = false }: { section: NoteSection; compact?: boolean }) {
  return (
    <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--line-2)] p-5 md:p-6">
      {section.title && (
        <h3 className="font-semibold text-[var(--steel-100)] mb-3">{section.title}</h3>
      )}
      <div className="space-y-2.5">
        {section.topics.map((topic, i) =>
          compact ? (
            /* Deep corpus buckets are title-less: render their blocks flat. */
            <div key={i} className="space-y-2.5">
              {topic.blocks.map((block, j) => (
                <BlockText key={j} block={block} />
              ))}
            </div>
          ) : (
            <div key={i} className="space-y-2.5">
              {topic.title && (
                <h4 className="text-sm font-semibold text-[var(--steel-200)]">{topic.title}</h4>
              )}
              {topic.blocks.map((block, j) => (
                <BlockText key={j} block={block} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default async function SubjectNotesPage({ params }: Props) {
  const { subject: slug } = await params;
  const subject = PUBLIC_NOTES_SUBJECTS.find((s) => s.slug === slug);
  if (!subject) notFound();

  const deepTopics = countTopics(subject.deep);
  const hasDeep = subject.deep.length > 0;
  // The chapters we actually hold questions for, resolved from the same registry
  // the drill route uses — so this list can never point at a page that 404s.
  const drills = topicalSubject(subject.slug);
  const otherSubjects = PUBLIC_NOTES_SUBJECTS.filter((s) => s.slug !== subject.slug);

  return (
    <div className="min-h-screen bg-[var(--field-1)] font-sans text-[var(--steel-100)] antialiased">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-10 overflow-hidden">
          <div className="container-page relative z-10">
            <Breadcrumbs
              items={[
                { name: "Home", href: "/" },
                { name: "Notes", href: "/notes" },
                { name: `${subject.name} notes` },
              ]}
            />
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight">
              {subject.name} <span className="text-[var(--color-accent-light)]">MDCAT Notes</span>
            </h1>
            <p className="mt-4 text-lg text-[var(--steel-300)] max-w-2xl">{subject.blurb}</p>
            <p className="mt-3 text-sm text-[var(--steel-400)]">
              Written from the PMDC MDCAT syllabus · {subject.weight} in the national exam · free,
              no signup needed.
            </p>
          </div>
        </section>

        {/* Table of contents — real anchors into the page below. */}
        <section className="pb-12">
          <div className="container-page">
            <nav aria-label="On this page" className="mb-10">
              <div className="flex flex-wrap gap-2">
                <a
                  href="#concepts"
                  className="px-4 py-2 rounded-[var(--radius-md)] border border-[var(--line-2)] text-sm font-medium text-[var(--steel-200)] hover:border-[var(--signal-500)] bg-white/[0.04]"
                >
                  Core concepts
                </a>
                {hasDeep && (
                  <a
                    href="#exam-depth"
                    className="px-4 py-2 rounded-[var(--radius-md)] border border-[var(--line-2)] text-sm font-medium text-[var(--steel-200)] hover:border-[var(--signal-500)] bg-white/[0.04]"
                  >
                    Exam-depth notes ({subject.deep.length} units)
                  </a>
                )}
                {hasDeep &&
                  subject.deep.map((s) => (
                    <a
                      key={s.title}
                      href={`#${slugify(s.title)}`}
                      className="px-4 py-2 rounded-[var(--radius-md)] border border-[var(--line-2)] text-sm font-medium text-[var(--steel-300)] hover:border-[var(--signal-500)] bg-white/[0.04]"
                    >
                      {s.title}
                    </a>
                  ))}
              </div>
            </nav>

            {/* Core concept notes (the light overview). */}
            <section id="concepts" className="mb-14 scroll-mt-24">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-1.5 h-6 rounded-full bg-[var(--signal-500)]" aria-hidden="true" />
                <h2 className="text-xl font-extrabold">Core concepts — {subject.name}</h2>
              </div>
              <SectionCard section={subject.concept} />
            </section>

            {/* Exam-depth corpus notes. */}
            {hasDeep && (
              <section id="exam-depth" className="mb-14 scroll-mt-24">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-1.5 h-8 rounded-full bg-[var(--signal-500)]" aria-hidden="true" />
                  <h2 className="text-2xl font-extrabold">Exam-depth notes — {subject.name}</h2>
                </div>
                <p className="text-sm text-[var(--steel-400)] mb-6 max-w-3xl">
                  Fact-level revision notes derived from the MDCAT past-paper corpus — every major
                  PMDC unit, bucket by bucket. “×n” on a fact marks how many corpus questions ask
                  the same thing (×3 = a near-certain repeat).
                </p>
                <div className="space-y-4">
                  {subject.deep.map((s) => (
                    <div key={s.title} id={slugify(s.title)} className="scroll-mt-24">
                      <SectionCard section={s} compact />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Chapters with questions behind them. Reading a unit and answering
                its questions in the same sitting is the whole point of keeping
                notes and drills on one site. */}
            {drills && drills.chapters.length > 0 && (
              <section className="mb-14">
                <div className="mb-2 flex items-center gap-3">
                  <span className="h-6 w-1.5 rounded-full bg-[var(--signal-500)]" aria-hidden="true" />
                  <h2 className="text-xl font-extrabold">
                    Practise {subject.name}, chapter by chapter
                  </h2>
                </div>
                <p className="mb-6 max-w-3xl text-sm text-[var(--steel-400)]">
                  {drills.chapters.length} {subject.name} chapters with questions behind them. Read the
                  unit above, then answer its questions while it is still fresh.
                </p>
                <ul role="list" className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                  {drills.chapters.map((chapter) => (
                    <li key={chapter.slug}>
                      <Link
                        href={`/topicals/${drills.slug}/${chapter.slug}`}
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
                <div className="mt-7 flex flex-wrap items-baseline gap-x-5 gap-y-2 text-sm">
                  <span className="text-[var(--steel-400)]">Other subjects:</span>
                  {otherSubjects.map((sibling) => (
                    <Link
                      key={sibling.slug}
                      href={`/notes/${sibling.slug}`}
                      className={`font-semibold text-[var(--signal-300)] underline underline-offset-4 hover:text-[var(--signal-200)] ${linkFocus}`}
                    >
                      {sibling.name}
                    </Link>
                  ))}
                  <Link
                    href="/notes/usat-m"
                    className={`font-semibold text-[var(--signal-300)] underline underline-offset-4 hover:text-[var(--signal-200)] ${linkFocus}`}
                  >
                    HEC USAT-M
                  </Link>
                </div>
              </section>
            )}

            {/* Next step: turn reading into practice. */}
            <section className="bg-white/[0.06] border border-[var(--line-3)] rounded-[var(--radius-xl)] p-8 text-center">
              <h2 className="text-xl font-bold mb-3">
                Read it. Then prove it with {subject.name} MCQs.
              </h2>
              <p className="text-sm text-[var(--steel-300)] mb-6 max-w-md mx-auto">
                {deepTopics > 0
                  ? `${deepTopics} fact buckets on this page, and an exam-style ${subject.name} drill one click away — instant explanations, streaks, progress tracking. Free during beta.`
                  : `An exam-style ${subject.name} drill is one click away — instant explanations, streaks and progress tracking. Free during beta.`}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-gradient-to-r from-[var(--cta-from)] to-[var(--cta-to)] text-[var(--on-cta)] font-bold hover:opacity-90 transition-opacity"
                >
                  Practice {subject.name} Free
                </Link>
                <Link
                  href="/past-papers"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-white/10 ring-1 ring-[var(--line-3)] text-[var(--steel-100)] font-bold hover:bg-white/[0.14] transition-colors"
                >
                  Browse Past Papers
                </Link>
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
