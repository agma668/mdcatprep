import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Check, GraduationCap } from "lucide-react";

import { SignupForm } from "@/app/signup/SignupForm";
import { StartDemo, type DemoDeck, type DemoQuestion } from "@/components/start/StartDemo";
import { AUTO_APPROVE_SIGNUPS } from "@/lib/signup-approval";
import { MDCAT_QUESTIONS } from "@/lib/mdcat";
import { NUST_NET_BANK } from "@/lib/nust-questions";
import { USAT_ELITE_BANK } from "@/lib/usat-comprehensive-bank";
import { PMA_QUESTIONS } from "@/lib/pma-questions";
import { FLASHCARD_DECKS } from "@/lib/flashcards/flashcards-data";
import { toQuizQuestion } from "@/lib/questions";
import { isTestSlug, START_TESTS, TEST_SLUGS, type StartTest } from "@/lib/test-start";

// Utility pages, like /signup: the form is the point, so they stay out of the
// index and out of the sitemap.
export function generateStaticParams() {
  return TEST_SLUGS.map((test) => ({ test }));
}

// Eight slugs exist and nothing else does. Without this an unknown slug still
// rendered the not-found boundary, but after `searchParams` was awaited the
// response had already begun streaming, so the status line said 200. The router
// refusing the param is both earlier and correct.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ test: string }>;
}): Promise<Metadata> {
  const { test } = await params;
  if (!isTestSlug(test)) return { title: "Not found" };
  const config = START_TESTS[test];
  return {
    title: `${config.label} prep — try the demo, then create your account`,
    description: config.blurb,
    robots: { index: false, follow: false },
  };
}

type RawQuestion = {
  key?: string;
  subject?: string;
  category?: string;
  topic?: string;
  figure?: unknown;
  [key: string]: unknown;
};

const BANK_FOR = {
  medical: MDCAT_QUESTIONS as unknown as RawQuestion[],
  nust: NUST_NET_BANK as unknown as RawQuestion[],
  usat: USAT_ELITE_BANK as unknown as RawQuestion[],
  pma: PMA_QUESTIONS as unknown as RawQuestion[],
};

const DEMO_SIZE = 5;
const PAGE_SIZE_OF_DECKS = 2;
const CARDS_PER_DECK = 6;

/**
 * Five questions, one from each subject the paper draws on, taken in bank order
 * rather than shuffled — the same URL shows the same demo to everybody, so a
 * screenshot of the demo means something.
 */
function pickDemoQuestions(config: StartTest): DemoQuestion[] {
  const bank = BANK_FOR[config.bank].filter((q) => {
    // Figure questions need the SVG renderer to make sense; the demo is text.
    if (q.figure) return false;
    // ISSB screens on reasoning only, so its demo shows reasoning only.
    if (config.slug === "issb" && q.category === "Academic") return false;
    return true;
  });

  const bySubject = new Map<string, RawQuestion[]>();
  for (const question of bank) {
    const subject = question.subject ?? question.category ?? "General";
    const list = bySubject.get(subject);
    if (list) list.push(question);
    else bySubject.set(subject, [question]);
  }

  const picked: DemoQuestion[] = [];
  const subjects = [...bySubject.keys()];
  for (let round = 0; picked.length < DEMO_SIZE; round += 1) {
    let advanced = false;
    for (const subject of subjects) {
      const question = bySubject.get(subject)?.[round];
      if (!question) continue;
      advanced = true;
      const normalized = toQuizQuestion(question as never);
      const options: [string, string, string, string] = [
        normalized.option_a,
        normalized.option_b,
        normalized.option_c ?? "—",
        normalized.option_d ?? "—",
      ];
      const answerIndex = ["A", "B", "C", "D"].indexOf(
        normalized.correct_answer.trim().toUpperCase().slice(0, 1)
      );
      if (answerIndex < 0) continue;
      picked.push({
        key: normalized.key ?? normalized.id ?? `${subject}-${round}`,
        subject: normalized.subject || subject,
        topic: normalized.topic,
        prompt: normalized.question_text,
        options,
        answer: answerIndex,
        explanation: normalized.explanation ?? "",
      });
      if (picked.length === DEMO_SIZE) break;
    }
    if (!advanced) break;
  }
  return picked;
}

function pickDemoDecks(config: StartTest): DemoDeck[] {
  if (config.deckSubjects.length === 0) return [];
  // A deck that names the tests it was written for is only shown on those
  // tests — the USAT vocabulary deck has no business on the MDCAT page — while
  // a deck with no `tests` list is a PMDC-family subject deck and travels.
  const decks = FLASHCARD_DECKS.filter(
    (deck) =>
      config.deckSubjects.includes(deck.subject) &&
      (!deck.tests || deck.tests.some((testId) => config.deckTests.includes(testId)))
  );
  return decks.slice(0, PAGE_SIZE_OF_DECKS).map((deck) => ({
    id: deck.id,
    title: deck.title.length > 44 ? `${deck.title.slice(0, 43)}…` : deck.title,
    subject: deck.subject,
    cards: deck.cards.slice(0, CARDS_PER_DECK).map((card) => ({
      front: card.front,
      back: card.back,
    })),
  }));
}

// Deliberately NOT reading `searchParams`: awaiting it opts the route out of
// prerendering, the response then starts streaming before the page can decide a
// slug does not exist, and `/start/nope` answered 200 with the 404 body. With
// the query string left alone, the eight slugs prerender, `dynamicParams =
// false` covers everything else, and a referral code still works from /signup.
export default async function TestStartPage({ params }: { params: Promise<{ test: string }> }) {
  const { test } = await params;
  if (!isTestSlug(test)) notFound();
  const config = START_TESTS[test];

  const questions = pickDemoQuestions(config);
  const decks = pickDemoDecks(config);
  const totalQuestions = BANK_FOR[config.bank].length;

  return (
    <div className="landing-canvas min-h-screen text-white">
      <div className="mx-auto w-full max-w-[76rem] px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="MED Prep — home" className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] gradient-brand text-[var(--on-cta)] text-base font-bold">
              M
            </span>
            <span className="text-lg font-bold tracking-tight text-white">MED Prep</span>
          </Link>
          <div className="flex items-center gap-3 text-xs font-semibold text-white/55">
            <Link href="/exams" className="hover:text-white">
              All tests
            </Link>
            <span aria-hidden="true" className="text-white/20">
              /
            </span>
            <span className="text-white/80">{config.label}</span>
          </div>
        </header>

        {/* Reading order on a phone is heading -> account -> demo. It used to be
            heading -> five questions -> account, so the form a visitor came for
            sat underneath a whole drill and the page read as "practise first,
            sign up if you feel like it". One grid, two placements: on lg the
            heading and the demo share the left column and the card is the
            sticky right column; on a phone the card moves above the demo. */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-x-10 lg:gap-y-0">
          <section
            aria-labelledby="start-heading"
            className="min-w-0 lg:col-start-1 lg:row-start-1"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">
              <GraduationCap aria-hidden="true" className="h-3.5 w-3.5" />
              {config.label}
            </p>

            <h1
              id="start-heading"
              className="mt-4 text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.6rem]"
            >
              {config.headline}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
              {config.blurb}
            </p>

            {config.secondary && (
              <p className="mt-4 text-xs text-white/50">
                Also open:{" "}
                <Link
                  href={config.secondary.href}
                  className="inline-flex items-center gap-1 font-semibold text-white/80 hover:text-white"
                >
                  {config.secondary.label}
                  <ArrowRight aria-hidden="true" className="h-3 w-3" />
                </Link>
              </p>
            )}
          </section>

          <aside
            id="signup"
            className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-8"
          >
            <div className="rounded-[20px] border border-white/10 bg-[var(--srf-1)] p-5 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] sm:p-6">
              <h2 className="text-xl font-extrabold tracking-tight text-white">
                Create your {config.label} account
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--steel-300)]">
                {AUTO_APPROVE_SIGNUPS
                  ? "Free during the beta. No card, and the account is active straight away."
                  : "Free during the beta. Accounts are reviewed before they open."}
              </p>

              <ul className="mt-4 space-y-1.5 text-[13px] text-[var(--steel-300)]">
                {[
                  `${totalQuestions.toLocaleString()} ${config.bankLabel} questions`,
                  "Answers with a worked rationale",
                  decks.length > 0 ? "Spaced-repetition decks" : "Intelligence drills",
                  "Progress kept across devices",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--signal-300)]" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-5 border-t border-[var(--line-2)] pt-5">
                <SignupForm
                  refCode=""
                  defaultExam={config.signupExam}
                  autoApprove={AUTO_APPROVE_SIGNUPS}
                />
              </div>
            </div>

            <p className="mt-3 px-1 text-[11px] leading-relaxed text-white/40">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-white/70 hover:text-white">
                Sign in
              </Link>
              . Or keep practising without one —{" "}
              <Link href={config.drill.href} className="font-semibold text-white/70 hover:text-white">
                {config.label} drill
              </Link>
              .
            </p>
          </aside>

          <div className="min-w-0 lg:col-start-1 lg:row-start-2">
            <StartDemo
              label={config.label}
              bankLabel={config.bankLabel}
              totalQuestions={totalQuestions}
              questions={questions}
              decks={decks}
              decksNote={config.decksNote}
              drillHref={config.drill.href}
              drillLabel={config.drill.label}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
