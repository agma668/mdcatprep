import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MDCAT_QUESTIONS } from "@/lib/mdcat";
import { USAT_ELITE_BANK } from "@/lib/usat-comprehensive-bank";
import { usatChapterTopics } from "@/lib/usat-drill";
import { PracticeSession } from "@/components/practice/PracticeSession";
import { toQuizQuestion } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Practice Session",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Dedicated full-focus practice surface. Lives OUTSIDE the /dashboard tree so
 * the sidebar, nav and stats never compete with the question — one question,
 * four options, keyboard-driven (see the key legend in PracticeSession).
 *
 * ?subject=Islamiat   drill one subject from the exam-style bank
 * ?college=cch        context for the back link / header only
 * ?count=10           cap the run at N questions
 * ?bank=usat          run the HEC USAT-M bank (default: the MDCAT bank)
 * ?group=<chapter>    (USAT only) run one drill chapter, e.g.
 *                     "Pipes, Cisterns & Work" — topics are resolved by
 *                     lib/usat-drill.ts, the same file that derives the
 *                     chapter map the drill UI renders
 *
 * Questions come from the bundled banks, selected by ?bank — no Supabase
 * read, so this page boots as fast as a static asset after the auth check.
 */
export default async function PracticeSessionPage({
  searchParams,
}: {
  searchParams: Promise<{
    subject?: string;
    college?: string;
    count?: string;
    bank?: string;
    group?: string;
  }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const subject = params.subject?.trim() || null;
  const college = params.college?.trim() || null;
  const requestedCount = Number.parseInt(params.count ?? "", 10);
  const bankParam = params.bank?.trim().toLowerCase() === "usat" ? "usat" : "mdcat";
  const group = params.group?.trim() || null;

  // Normalise bundled questions to the shared quiz model once, here at the
  // data seam (resources' optional `college` disagrees with the row shape).
  const sourceBank = bankParam === "usat" ? USAT_ELITE_BANK : MDCAT_QUESTIONS;
  const bank = sourceBank.map((q) => toQuizQuestion(q));
  let questions = bank;

  // A USAT chapter run filters to the chapter's member topics (resolved from
  // the same derivation the drill UI renders) and unions the explicit
  // ?subject so links can carry both without double-filtering conflicts.
  let chapterSubject: string | null = null;
  if (bankParam === "usat" && group) {
    const resolved = usatChapterTopics(USAT_ELITE_BANK, group);
    if (resolved && resolved.topics.size > 0) {
      const wantedTopics = [...resolved.topics].map((t) => t.toLowerCase());
      chapterSubject = resolved.subject;
      questions = questions.filter(
        (q) =>
          q.subject === chapterSubject &&
          typeof q.topic === "string" &&
          wantedTopics.includes(q.topic.toLowerCase())
      );
    }
    // Unknown chapter names fall through to the plain subject run below —
    // never an empty session invented out of a mistyped link.
  }
  if (subject) {
    const wanted = subject.toLowerCase();
    questions = questions.filter((q) => q.subject.toLowerCase() === wanted);
  }
  if (!Number.isNaN(requestedCount) && requestedCount > 0) {
    questions = questions.slice(0, requestedCount);
  }

  const subjectLabel =
    bankParam === "usat"
      ? (subjectLabelFor(group, chapterSubject, subject))
      : (subject ?? undefined);
  const homeHref = college
    ? `/dashboard/practice?college=${encodeURIComponent(college)}`
    : "/dashboard/practice";

  if (questions.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="glass-tile-glow w-full max-w-md rounded-[var(--radius-xl)] border border-white/10 p-10 text-center">
          <h1 className="text-xl font-extrabold text-white">No questions here yet</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            {subject
              ? `We don't have ${subject} questions in this practice bank yet.`
              : "This practice bank is empty right now."}
          </p>
          <a
            href={homeHref}
            className="mt-6 inline-flex rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-2.5 text-sm font-bold text-[var(--color-text-inverse)] transition-colors hover:bg-[var(--color-primary-light)]"
          >
            Back to Practice
          </a>
        </div>
      </div>
    );
  }

  // Keep per-bank sessions separate so a subject run never resumes a full run
  // (or vice-versa) after a reload — and so the MDCAT and USAT runs can never
  // inherit each other's answered state. Group runs key their own resume slot.
  const sessionKey = `ccp-session:${bankParam}:${group ?? subject ?? "full"}:${questions.length}`;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-primary/30 selection:text-white">
      <PracticeSession
        questions={questions}
        sessionKey={sessionKey}
        subjectLabel={subjectLabel}
        homeHref={homeHref}
      />
    </main>
  );
}

/** Header chip text for a USAT run: the chapter, its subject, or the bank. */
function subjectLabelFor(
  group: string | null,
  chapterSubject: string | null,
  subject: string | null
): string {
  if (group) {
    return chapterSubject ? `${chapterSubject} · ${group}` : group;
  }
  return subject ?? "HEC USAT-M";
}
