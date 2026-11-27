import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Brain,
  Calculator,
  Cpu,
  FileText,
  GraduationCap,
  Layers,
  NotebookPen,
  Shield,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { FAQ, FAQS } from "@/components/landing/FAQ";
import { RegisterSection } from "@/components/landing/RegisterSection";
import { PrepMap } from "@/components/landing/PrepMap";
import { Footer } from "@/components/landing/Footer";
import { getPublicStats } from "@/lib/public-stats";
import { PORTAL_BANK_COUNTS } from "@/lib/stats";
import { getSiteUrl, SITE_NAME } from "@/lib/site";
import { PAST_PAPERS, PAST_PAPER_COUNT, isOfficialKey, papersByYear } from "@/lib/past-papers";

const siteUrl = getSiteUrl();

// Names only the tests that have a real practice surface on this site \u2014 the
// H1, metadata and JSON-LD must not claim an exam the bank does not serve.
const homeDescription =
  "Free exam-style MCQ practice for MDCAT, NUMS, NUST NET, GIKI, LUMS, HEC USAT, PMA and ISSB \u2014 an explanation behind every answer, released board papers where they exist, and study notes.";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

const learningResourceJsonLd = {
  "@context": "https://schema.org",
  "@type": "LearningResource",
  name: "MDCAT, NUMS, NUST NET, GIKI, LUMS, USAT, PMA & ISSB Entry Test Preparation",
  description: homeDescription,
  url: siteUrl,
  provider: { "@type": "Organization", name: SITE_NAME, url: siteUrl },
  learningResourceType: ["MCQ Practice", "Mock Test", "Study Notes"],
  educationalUse: "practice",
  isAccessibleForFree: true,
  inLanguage: ["en", "ur"],
  about: ["MDCAT", "NUMS", "UHS Medical Entrance", "SZABMU Test", "KMU CAT", "NUST NET", "HEC USAT", "PMA Long Course"],
  audience: { "@type": "EducationalAudience", educationalRole: "student" },
};

export const metadata: Metadata = {
  // No test leads the title: a browser tab and a search result are read before
  // any hero copy, and "MDCAT, NUMS, ..." told every other aspirant this was a
  // medical site.
  title: "Entry Test Practice \u2014 MDCAT, NUMS, NUST, USAT, PMA & More",
  description: homeDescription,
};

// Numbers come from the live seam in lib/public-stats.ts; ISR refreshes them.
export const revalidate = 60;

const display = { fontFamily: "var(--font-display)" } as const;

// Every tile points at that exam's own start page (/start/<test>): the demo
// questions from its bank, the decks whose subjects it examines, and the signup
// form already set to that test. GIKI and LUMS sit inside the engineering
// portal's shared bank, exactly like the unified-portal architecture says they
// should.
// Eight tests, eight identical tiles. The medical papers used to take two
// half-width cards on the top row while the rest shared a row underneath, so
// the grid itself said "medical site" before anyone read a word. Every tile is
// now the same size and the families are interleaved, because a NUST or PMA
// aspirant has to see their paper given the same weight as MDCAT.
// The tile's own line is its real bank size (tileMeta below), so the list
// carries no second sentence to compete with it.
const TESTS = [
  { href: "/start/mdcat", name: "MDCAT", track: "Medical" },
  { href: "/start/nust", name: "NUST NET", track: "Engineering" },
  { href: "/start/nums", name: "NUMS", track: "Medical" },
  { href: "/start/giki", name: "GIKI", track: "Engineering" },
  { href: "/start/usat", name: "HEC USAT", track: "University admission" },
  { href: "/start/lums", name: "LUMS", track: "University admission" },
  { href: "/start/pma", name: "PMA", track: "Defence" },
  { href: "/start/issb", name: "ISSB", track: "Defence" },
];

const PRACTICE = [
  { href: "/topicals", title: "Topical MCQs", body: "Chapter-wise questions for Biology, Chemistry and Physics. Answer, see why, move on.", Icon: BookOpenCheck, span: "lg:col-span-7" },
  { href: "/past-papers", title: "Past papers", body: "Released medical board papers, plus syllabus-built banks for the engineering, USAT and defence tests.", Icon: FileText, span: "lg:col-span-5" },
  { href: "/daily-quiz", title: "Daily quiz", body: "A short set every day, so practice becomes a habit instead of a plan.", Icon: Sparkles, span: "lg:col-span-4" },
  { href: "/flashcards", title: "Flashcards", body: "Spaced-repetition cards for the facts that keep repeating in the paper.", Icon: Layers, span: "lg:col-span-4" },
  { href: "/notes", title: "Concept notes", body: "Short notes for the topic you miss, written from each test's official syllabus.", Icon: NotebookPen, span: "lg:col-span-4" },
];

const STEPS = [
  { title: "Take the diagnostic", body: "Ten questions across four subjects, about two minutes. It shows where you are strong and where you are not." },
  { title: "Practise by topic", body: "Work through chapter-wise MCQs. Every answer comes with its explanation." },
  { title: "Redo what you missed", body: "Wrong answers collect in your mistake notebook so you can drill them until they stick." },
];

// The promises this product refuses to make. Every prep site writes a wall of
// outcomes it cannot control; the one thing a student can actually check is
// what is missing here, so the list is stated plainly and kept short.
const LIMITS = [
  {
    title: "No guaranteed score, seat or rank",
    body: "Practising moves your own accuracy, and the dashboard shows it moving. What that becomes on the day is decided by the paper, the merit list and factors no website sees.",
  },
  {
    title: "No invented papers",
    body: "NUST, GIKI, LUMS, USAT, PMA and ISSB do not release their papers, so none are sold as past papers here. Only the medical boards' released papers are called that.",
  },
  {
    title: "No calculator where the centre bans one",
    body: "MDCAT, NUMS and USAT do not permit calculators. The one inside the drill is labelled a practice aid, not an allowance — nothing here is built assuming you will have it.",
  },
  {
    title: "No 'proven' study schedule",
    body: "There is no timetable that guarantees admission. The plan here is practice, read the explanation, retry what you missed — measured against your own attempts, not a promise.",
  },
  {
    title: "No fake students or padded numbers",
    body: "Every number on this page is counted from real accounts and real answers. Demo accounts are excluded from the totals and from the leaderboard above.",
  },
];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]";

// One glyph per paper. A medical cross for MDCAT, engineers' tools for NET and
// GIKI, a cap for admissions, a shield for defence. The hero used to show a
// Biology sample question, which told seven of the eight audiences that the
// product was not theirs; this plate says the opposite in one glance.
const TEST_ICONS: Record<string, typeof Stethoscope> = {
  MDCAT: Stethoscope,
  NUMS: FileText,
  "NUST NET": Calculator,
  GIKI: Cpu,
  "HEC USAT": GraduationCap,
  LUMS: BookOpen,
  PMA: Shield,
  ISSB: Brain,
};

export default async function Home() {
  const stats = await getPublicStats();
  const mcqs = stats.hero.mcqs;

  // A tile that shows its real bank size is proof; the old copy ("shares the
  // engineering bank") told a GIKI student there was nothing here for them.
  const tileMeta: Record<string, string> = {
    MDCAT: `${mcqs.toLocaleString("en-US")} questions`,
    NUMS: `${PAST_PAPER_COUNT} released papers`,
    "NUST NET": `${PORTAL_BANK_COUNTS.nust} questions`,
    GIKI: `${PORTAL_BANK_COUNTS.nust} shared questions`,
    LUMS: `${PORTAL_BANK_COUNTS.nust} shared questions`,
    "HEC USAT": `${PORTAL_BANK_COUNTS.usat} questions`,
    PMA: `${PORTAL_BANK_COUNTS.pma} questions`,
    ISSB: "reasoning drills",
  };

  const dated = papersByYear().filter((g) => /^\d{4}$/.test(g.key));
  const keyed = PAST_PAPERS.filter(isOfficialKey).length;
  const firstYear = dated.length ? dated[dated.length - 1].key : null;
  const lastYear = dated.length ? dated[0].key : null;

  return (
    <div className="landing-canvas min-h-screen font-sans text-[var(--steel-100)] antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResourceJsonLd) }} />
      <Navbar />
      <main>
        {/* Hero: answer a question. The backdrop is an OMR answer sheet, the
            bubble grid every entry-test student has filled in with a pencil. */}
        {/* Merge resolution (2026-11-22): the OMR hero comes from origin/main; the badge keeps this
            branch's truthful "Free during beta" wording instead of "100% free", which the access
            policy no longer promises. */}
        <section aria-label="Hero" className="relative isolate">
          <div className="container-page pb-16 pt-28 sm:pb-24 sm:pt-36">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-0">
              <div className="hero-intro lg:pr-14">
                <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--champagne)]">
                  <span aria-hidden="true" className="hero-live-dot" />
                  Free during beta
                </p>
                <h1
                  style={display}
                  className="mt-5 max-w-[20ch] text-[2.5rem] font-bold leading-[1.04] tracking-[-0.038em] text-[var(--steel-100)] sm:text-[3.1rem] lg:text-[3.35rem]"
                >
                  Practise for your entry test the way the paper asks.
                </h1>
                <p className="mt-6 max-w-[48ch] text-base leading-relaxed text-[var(--steel-300)] sm:text-[1.0625rem]">
                  Exam-style MCQs for MDCAT, NUMS, NUST NET, GIKI, LUMS, HEC USAT, PMA and ISSB.
                  Every answer carries its key and the reasoning behind it, and where a board
                  releases its paper you can read that paper here in full.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/diagnostic"
                    className={`btn-primary group inline-flex min-h-[52px] w-full items-center justify-center gap-2 px-7 text-base sm:w-auto ${focusRing}`}
                  >
                    Take the 2-minute diagnostic
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform duration-[var(--dur-2)] group-hover:translate-x-0.5"
                    />
                  </Link>
                  <Link
                    href="#other-exams"
                    className="btn-secondary inline-flex min-h-[52px] items-center justify-center px-7 text-base"
                  >
                    See every test
                  </Link>
                </div>
              </div>



              {/* The first two minutes, drawn. Not a stat plate, and no longer a
                  second call to action either: the primary button to its left
                  goes to the same page. This is the shape of what that button
                  opens — ten questions across four subjects, no account, a
                  result broken down by subject. Every number here is what
                  /diagnostic actually draws. */}
              <aside
                aria-label="The diagnostic"
                className="lg:flex lg:flex-col lg:justify-center lg:self-stretch lg:border-l lg:border-[var(--line-2)] lg:pl-14"
              >
                <div className="rounded-[var(--r-4)] border border-[var(--line-2)] bg-[var(--srf-1)] p-6 shadow-[var(--shadow-md)] sm:max-w-[30rem] sm:p-7 lg:max-w-none">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--steel-400)]">
                    Free diagnostic
                  </p>
                  <p style={display} className="mt-4 text-[1.6rem] font-bold leading-[1.15] tracking-tight text-[var(--steel-100)]">
                    Ten questions.{" "}
                    <br className="hidden sm:block" />
                    {" "}
                    An honest starting point.
                  </p>
                  <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-[var(--steel-300)]">
                    Drawn from Biology, Chemistry, Physics and English, with no account and
                    nothing to install. The result breaks down by subject.
                  </p>
                  <ol aria-hidden="true" className="mt-6 flex items-center gap-1.5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <li
                        key={i}
                        className="h-9 flex-1 rounded-[3px] bg-[var(--srf-3)] ring-1 ring-inset ring-[var(--line-1)]"
                      />
                    ))}
                  </ol>
                  <div className="mt-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--steel-500)]">
                    <span>Question 1</span>
                    <span>10</span>
                  </div>
                </div>
              </aside>


            </div>

            {/* Pick your test — inside the hero on purpose. A visitor decides in the
                first seconds whether this site serves their paper, so the tests we
                actually run are part of the first screen, not a section three
                scrolls down. The empty bubble in each corner fills when you reach
                for it, like marking an answer. */}
            <div id="other-exams" className="mt-16 sm:mt-20">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <h2 style={display} className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                  Which test are you sitting?
                </h2>
                <p className="max-w-[46ch] text-sm text-[var(--steel-400)] sm:text-right">
                  All eight, one account, free during beta. Where a board releases its paper we carry it; where it doesn&apos;t, the bank is built from that test&apos;s own syllabus.
                </p>
              </div>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {TESTS.map((t) => {
                  const Icon = TEST_ICONS[t.name] ?? BookOpenCheck;
                  return (
                    <li key={t.name}>
                      <Link
                        href={t.href}
                        className={`group relative flex h-full min-h-[136px] flex-col justify-between gap-4 overflow-hidden rounded-[var(--r-4)] border border-[var(--line-2)] bg-[var(--srf-1)] p-5 shadow-[var(--shadow-card)] transition-[background-color,border-color,transform] duration-[var(--dur-2)] hover:-translate-y-0.5 hover:border-[var(--line-signal)] hover:bg-[var(--srf-2)] ${focusRing}`}
                      >
                        <span
                          aria-hidden="true"
                          className="absolute right-4 top-4 h-4 w-4 rounded-full border-2 border-[var(--steel-600)] transition-[background-color,border-color,box-shadow] duration-[var(--dur-2)] group-hover:border-[var(--signal-400)] group-hover:bg-[var(--signal-400)] group-hover:shadow-[var(--glow-signal-sm)]"
                        />
                        <span className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--r-1)] border border-[var(--line-2)] bg-[var(--field-2)] text-[var(--signal-400)] transition-colors group-hover:border-[var(--line-signal)] group-hover:text-[var(--signal-300)]">
                            <Icon aria-hidden="true" size={15} strokeWidth={1.8} />
                          </span>
                          <span style={display} className="text-lg font-bold tracking-tight text-[var(--steel-100)]">
                            {t.name}
                          </span>
                        </span>
                        <span>
                          <span className="block text-[11px] uppercase tracking-[0.14em] text-[var(--steel-400)]">{t.track}</span>
                          <span className="mt-1 block text-[11px] font-semibold tabular-nums text-[var(--steel-400)]">{tileMeta[t.name]}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* A hairline seam above the numbers, so the hero band and the
                stat band read as two machined panels rather than one long
                scroll. Borrowed from the cadet site's section-glow-divider. */}
            <dl className="section-seam mt-10 grid grid-cols-3 overflow-hidden rounded-[var(--r-4)] border border-[var(--line-2)] bg-[var(--srf-1)]/70 backdrop-blur-sm">
              <div className="px-4 py-5 sm:px-8 sm:py-6">
                <dd style={display} className="text-3xl font-bold tabular-nums text-[var(--steel-100)] sm:text-4xl">{mcqs.toLocaleString("en-US")}</dd>
                <dt className="mt-1 text-sm text-[var(--steel-300)]">Practice MCQs</dt>
              </div>
              <div className="border-l border-[var(--line-2)] px-4 py-5 sm:px-8 sm:py-6">
                <dd style={display} className="text-3xl font-bold tabular-nums text-[var(--steel-100)] sm:text-4xl">{PAST_PAPER_COUNT}</dd>
                <dt className="mt-1 text-sm text-[var(--steel-300)]">Past papers</dt>
              </div>
              <div className="border-l border-[var(--line-2)] px-4 py-5 sm:px-8 sm:py-6">
                <dd style={display} className="text-3xl font-bold tabular-nums text-[var(--steel-100)] sm:text-4xl">{TESTS.length}</dd>
                <dt className="mt-1 text-sm text-[var(--steel-300)]">Test tracks</dt>
              </div>
            </dl>
          </div>
        </section>

        <section id="features" className="border-y border-[var(--line-1)] bg-[var(--field-2)] py-16 sm:py-24">
          <div className="container-page">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <h2 style={display} className="max-w-[18ch] text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Everything you practise with, in one place
              </h2>
              <p className="max-w-[40ch] text-[var(--steel-300)]">
                No coaching centre, no fee. Open any of these without an account; sign in when you want your progress saved.
              </p>
            </div>
            <ul className="mt-10 grid gap-4 lg:grid-cols-12">
              {PRACTICE.map(({ href, title, body, Icon, span }) => (
                <li key={href} className={span}>
                  <Link
                    href={href}
                    className={`group flex h-full flex-col gap-5 rounded-[var(--r-4)] border border-[var(--line-2)] bg-[var(--srf-1)] p-6 shadow-[var(--shadow-card)] transition-colors duration-[var(--dur-1)] hover:border-[var(--line-signal)] hover:bg-[var(--srf-2)] sm:p-7 ${focusRing}`}
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--r-2)] border border-[var(--line-signal)] bg-[var(--tint-signal)] text-[var(--signal-300)]">
                      <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <span>
                      <span style={display} className="block text-xl font-semibold text-[var(--steel-100)]">{title}</span>
                      <span className="mt-1.5 block max-w-[46ch] text-sm leading-relaxed text-[var(--steel-300)]">{body}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="past-papers" className="py-16 sm:py-24">
          <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 style={display} className="max-w-[16ch] text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                The papers medical boards actually released
              </h2>
              <p className="mt-4 max-w-[46ch] text-[var(--steel-300)]">
                <span className="tabular-nums">{PAST_PAPER_COUNT}</span> papers
                {firstYear && lastYear ? (
                  <>
                    {" "}from <span className="tabular-nums">{firstYear}</span> to <span className="tabular-nums">{lastYear}</span>
                  </>
                ) : null}
                . <span className="tabular-nums">{keyed}</span> come with an official answer key. The rest say so on the card, so a missing key is never mistaken for a wrong answer.
              </p>
              <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-[var(--steel-400)]">
                Only medical boards publish their papers. NUST, GIKI, LUMS, USAT, PMA and ISSB do not, so
                those banks are written from each test&apos;s own syllabus — nothing here is dressed up as a
                real paper.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link href="/past-papers" className="btn-secondary inline-flex min-h-[48px] items-center justify-center px-6">
                  Open the past papers
                </Link>
                <Link
                  href="#other-exams"
                  className="text-sm font-semibold text-[var(--signal-300)] underline underline-offset-4 hover:text-[var(--signal-200)]"
                >
                  Preparing for a different test? →
                </Link>
              </div>
              <p className="mt-6 max-w-[46ch] text-xs leading-relaxed text-[var(--steel-400)]">
                Practising for{" "}
                <Link href="/nust/practice" className="font-semibold text-[var(--steel-200)] underline underline-offset-4">
                  NUST NET
                </Link>
                ,{" "}
                <Link href="/giki/practice" className="font-semibold text-[var(--steel-200)] underline underline-offset-4">
                  GIKI
                </Link>
                ,{" "}
                <Link href="/lums/practice" className="font-semibold text-[var(--steel-200)] underline underline-offset-4">
                  LUMS
                </Link>
                ,{" "}
                <Link href="/usat/practice" className="font-semibold text-[var(--steel-200)] underline underline-offset-4">
                  HEC USAT
                </Link>{" "}
                or{" "}
                <Link href="/pma/practice" className="font-semibold text-[var(--steel-200)] underline underline-offset-4">
                  PMA / ISSB
                </Link>
                ? Those banks are open too.
              </p>
            </div>
            <ol className="relative ml-3 border-l border-[var(--line-3)]">
              {dated.map((g) => {
                const boards = Array.from(new Set(g.papers.map((p) => p.exam.replace(/ MDCAT.*$/, ""))));
                return (
                  <li key={g.key} className="relative pb-8 pl-8 last:pb-0">
                    <span aria-hidden="true" className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-[var(--signal-400)] bg-[var(--field-1)]" />
                    <div className="flex items-baseline gap-3">
                      <span style={display} className="text-2xl font-bold tabular-nums text-[var(--steel-100)]">{g.key}</span>
                      <span className="text-sm text-[var(--steel-400)]">
                        {g.papers.length} {g.papers.length === 1 ? "paper" : "papers"}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {boards.map((b) => (
                        <span key={b} className="rounded-[var(--r-2)] border border-[var(--line-2)] bg-[var(--srf-1)] px-2.5 py-1 text-sm text-[var(--steel-200)]">
                          {b}
                        </span>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section id="how-it-works" className="border-t border-[var(--line-1)] bg-[var(--field-2)] py-16 sm:py-24">
          <div className="container-page">
            <h2 style={display} className="max-w-[18ch] text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Three steps, repeated daily
            </h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative">
                  {i < STEPS.length - 1 ? (
                    <span aria-hidden="true" className="absolute left-12 top-[18px] hidden h-px w-[calc(100%-2rem)] bg-[var(--line-3)] md:block" />
                  ) : null}
                  <span
                    style={display}
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--signal-400)] bg-[var(--tint-signal)] text-base font-bold tabular-nums text-[var(--signal-200)]"
                  >
                    {i + 1}
                  </span>
                  <h3 style={display} className="mt-5 text-xl font-semibold text-[var(--steel-100)]">{s.title}</h3>
                  <p className="mt-2 max-w-[38ch] leading-relaxed text-[var(--steel-300)]">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* The prep map sits after the method and before the FAQ: a reader who
            has decided the product is for them gets the whole library here,
            and a crawler gets a path to every page we publish. */}
        <PrepMap />

        {/* What we do not claim. Sits immediately before the FAQ, because the
            questions people actually ask are mostly versions of "is this too
            good to be true". Answering that with a list of refusals is cheaper
            and more honest than another promise. */}
        <section
          id="limits"
          aria-labelledby="limits-heading"
          className="border-t border-[var(--line-1)] py-16 sm:py-24"
        >
          <div className="container-page">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--steel-400)]">
                  The limits
                </p>
                <h2
                  id="limits-heading"
                  style={display}
                  className="mt-4 max-w-[18ch] text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
                >
                  What we do not claim
                </h2>
                <p className="mt-4 max-w-[46ch] leading-relaxed text-[var(--steel-300)]">
                  A prep site cannot promise you a seat. Here is the short list of
                  things you will not find written anywhere on these pages — check
                  them against any other site you are comparing us to.
                </p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {LIMITS.map(({ title, body }) => (
                  <li
                    key={title}
                    className="rounded-[var(--r-3)] border border-[var(--line-2)] bg-[var(--srf-1)] p-5"
                  >
                    <p className="text-sm font-semibold text-[var(--steel-100)]">{title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--steel-300)]">{body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="faq">
          <FAQ />
        </section>
        <section id="register">
          <RegisterSection mcqs={mcqs} subjects={stats.hero.subjects} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
