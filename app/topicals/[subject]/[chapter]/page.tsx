import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getSiteUrl } from "@/lib/site";
import { TOPICALS_SUBJECTS, topicalChapter } from "@/lib/topicals";
import { TopicalDrill } from "@/components/practice/TopicalDrill";

const siteUrl = getSiteUrl();

type Props = { params: Promise<{ subject: string; chapter: string }> };

export function generateStaticParams(): { subject: string; chapter: string }[] {
  const out: { subject: string; chapter: string }[] = [];
  for (const s of TOPICALS_SUBJECTS) {
    for (const c of s.chapters) out.push({ subject: s.slug, chapter: c.slug });
  }
  return out;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject, chapter } = await params;
  const found = topicalChapter(subject, chapter);
  if (!found) return { title: "Topical practice not found" };
  const title = `${found.chapter.title} MDCAT MCQs — ${found.subject.name} Chapter-wise Practice`;
  return {
    title,
    description: `${found.chapter.count} chapter-wise MDCAT ${found.subject.name.toLowerCase()} MCQs on ${found.chapter.title} with instant explanations. Free topical practice, no signup needed.`,
    alternates: { canonical: `/topicals/${subject}/${chapter}` },
    openGraph: {
      type: "website",
      url: `${siteUrl}/topicals/${subject}/${chapter}`,
      title: `${title} | MED Prep`,
      description: `${found.chapter.count} MDCAT ${found.subject.name.toLowerCase()} MCQs on ${found.chapter.title} — free chapter-wise practice.`,
      siteName: "MED Prep",
    },
  };
}

export default async function TopicalChapterPage({ params }: Props) {
  const { subject, chapter } = await params;
  const found = topicalChapter(subject, chapter);
  if (!found) notFound();
  const { subject: s, chapter: c, questions } = found;

  return (
    <div className="min-h-screen bg-[var(--field-1)] font-sans text-[var(--steel-100)] antialiased">
      <Navbar />
      <main>
        <section className="relative pt-28 pb-8 overflow-hidden">
          <div className="container-page relative z-10">
            <Link
              href="/topicals"
              className="text-sm font-medium text-[var(--signal-300)] hover:underline"
            >
              ← All topical MCQs
            </Link>
            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
              {c.title}{" "}
              <span className="text-[var(--color-accent-light)]">— {s.name} MCQs</span>
            </h1>
            <p className="mt-2 text-sm text-[var(--steel-400)]">
              {questions.length} chapter-wise questions · instant explanations · guest-friendly
              (progress stays on your device).
            </p>
          </div>
        </section>

        <section className="pb-16">
          <div className="container-page">
            <TopicalDrill questions={questions} subjectName={s.name} chapterTitle={c.title} />
            <p className="mt-10 text-xs text-[var(--steel-500)] max-w-2xl mx-auto text-center">
              Sourcing: chapter-wise questions from a third-party question-bank extraction (MCQ
              Universe) compiled by the founder. These are practice questions, not past-paper
              items — nothing here claims a real exam year.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
