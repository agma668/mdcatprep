import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenCheck,
  FileText,
  Layers,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { ExamPaper } from "@/components/landing/ExamPaper";
import { FAQ, FAQS } from "@/components/landing/FAQ";
import { RegisterSection } from "@/components/landing/RegisterSection";
import { Footer } from "@/components/landing/Footer";
import { getPublicStats } from "@/lib/public-stats";
import { getSiteUrl, SITE_NAME } from "@/lib/site";
import { PAST_PAPERS, PAST_PAPER_COUNT, isOfficialKey, papersByYear } from "@/lib/past-papers";

const siteUrl = getSiteUrl();

// Names only the tests that have a real practice surface on this site \u2014 the
// H1, metadata and JSON-LD must not claim an exam the bank does not serve.
const homeDescription =
  "Free exam-style MCQ practice for MDCAT, NUMS, NUST NET, GIKI, LUMS, HEC USAT and PMA \u2014 an explanation behind every answer, past papers with keys, and study notes.";

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
  name: "MDCAT, NUMS, NET, USAT & PMA Entry Test Preparation",
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
  title: "MDCAT, NUMS, NUST, GIKI, USAT & PMA Test Preparation \u2014 Free",
  description: homeDescription,
};

// Numbers come from the live seam in lib/public-stats.ts; ISR refreshes them.
export const revalidate = 60;

const display = { fontFamily: "var(--font-display)" } as const;

// Every tile points at a real practice surface. GIKI and LUMS sit inside the
// engineering portal's shared bank, exactly like the unified-portal
// architecture says they should.
const TESTS = [
  { href: "/topicals", name: "MDCAT", track: "Medical", body: "Chapter-wise topicals, released papers and a diagnostic for the PMDC syllabus.", span: "lg:col-span-6" },
  { href: "/past-papers", name: "NUMS", track: "Medical", body: "Released NUMS papers sorted by year, each labelled with how it relates to the real sitting.", span: "lg:col-span-6" },
  { href: "/nust/practice", name: "NUST NET", track: "Engineering", body: "Maths, physics, chemistry and English.", span: "lg:col-span-4" },
  { href: "/nust/practice", name: "GIKI", track: "Engineering", body: "Shares the engineering bank with NET.", span: "lg:col-span-4" },
  { href: "/nust/practice", name: "LUMS", track: "Engineering", body: "Shares the engineering bank with NET.", span: "lg:col-span-4" },
  { href: "/usat/practice", name: "HEC USAT", track: "University admission", body: "Quantitative, verbal and science sections.", span: "lg:col-span-6" },
  { href: "/pma/practice", name: "PMA & ISSB", track: "Defence", body: "Verbal and non-verbal intelligence, initial academic test.", span: "lg:col-span-6" },
];

const PRACTICE = [
  { href: "/topicals", title: "Topical MCQs", body: "Chapter-wise questions for Biology, Chemistry and Physics. Answer, see why, move on.", Icon: BookOpenCheck, span: "lg:col-span-7" },
  { href: "/past-papers", title: "Past papers", body: "Released MDCAT and NUMS papers, sorted by board and year.", Icon: FileText, span: "lg:col-span-5" },
  { href: "/daily-quiz", title: "Daily quiz", body: "A short set every day, so practice becomes a habit instead of a plan.", Icon: Sparkles, span: "lg:col-span-4" },
  { href: "/flashcards", title: "Flashcards", body: "Spaced-repetition cards for the facts that keep repeating in the paper.", Icon: Layers, span: "lg:col-span-4" },
  { href: "/notes", title: "Concept notes", body: "Short notes written from the PMDC syllabus for every topic you miss.", Icon: NotebookPen, span: "lg:col-span-4" },
];

const STEPS = [
  { title: "Take the diagnostic", body: "Ten questions across five subjects, about two minutes. It shows where you are strong and where you are not." },
  { title: "Practise by topic", body: "Work through chapter-wise MCQs. Every answer comes with its explanation." },
  { title: "Redo what you missed", body: "Wrong answers collect in your mistake notebook so you can drill them until they stick." },
];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]";

export default async function Home() {
  const stats = await getPublicStats();
  const mcqs = stats.hero.mcqs;

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
        <section className="relative isolate overflow-hidden">
          <div aria-hidden="true" className="omr-field absolute inset-0 -z-10" />
          <div className="container-page pb-16 pt-28 sm:pb-24 sm:pt-36">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              <div>
                <p className="inline-flex items-center gap-2 rounded-[var(--r-pill)] border border-[var(--line-brass)] bg-[var(--tint-brass)] px-3.5 py-1.5 text-sm text-[var(--steel-100)]">
                  <span className="font-semibold text-[var(--champagne)]">100% free</span>
                  <span className="text-[var(--steel-300)]">no fees, no card, nothing locked</span>
                </p>
                <h1
                  style={display}
                  className="mt-6 max-w-[19ch] text-[2.4rem] font-bold leading-[1.04] tracking-tight text-[var(--steel-100)] sm:text-[3.2rem] lg:text-[3.7rem]"
                >
                  Practise for your entry test the way the paper asks.
                </h1>
                <p className="mt-6 max-w-[50ch] text-base leading-relaxed text-[var(--steel-300)] sm:text-lg">
                  Exam-style MCQs for MDCAT, NUMS, NUST, GIKI, LUMS, USAT and PMA, with an explanation behind every answer and the real past papers the boards have released.
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link href="/diagnostic" className="btn-primary inline-flex min-h-[52px] items-center justify-center px-7 text-base">
                    Take the 2-minute diagnostic
                  </Link>
                  <Link href="/past-papers" className="btn-secondary inline-flex min-h-[52px] items-center justify-center px-7 text-base">
                    Browse past papers
                  </Link>
                </div>
                <p className="mt-5 max-w-[52ch] text-sm leading-relaxed text-[var(--steel-400)]">
                  Questions are original and built from the official syllabi. The past papers are the real released papers.
                </p>
              </div>
              <ExamPaper />
            </div>

            <dl className="mt-14 grid grid-cols-3 overflow-hidden rounded-[var(--r-4)] border border-[var(--line-2)] bg-[var(--srf-1)]/70 backdrop-blur-sm sm:mt-20">
              <div className="px-4 py-5 sm:px-8 sm:py-6">
                <dd style={display} className="text-3xl font-bold tabular-nums text-[var(--steel-100)] sm:text-4xl">{mcqs.toLocaleString("en-US")}</dd>
                <dt className="mt-1 text-sm text-[var(--steel-300)]">Practice MCQs</dt>
              </div>
              <div className="border-l border-[var(--line-2)] px-4 py-5 sm:px-8 sm:py-6">
                <dd style={display} className="text-3xl font-bold tabular-nums text-[var(--steel-100)] sm:text-4xl">{PAST_PAPER_COUNT}</dd>
                <dt className="mt-1 text-sm text-[var(--steel-300)]">Past papers</dt>
              </div>
              <div className="border-l border-[var(--line-2)] px-4 py-5 sm:px-8 sm:py-6">
                <dd style={display} className="text-3xl font-bold tabular-nums text-[var(--steel-100)] sm:text-4xl">{stats.hero.subjects}</dd>
                <dt className="mt-1 text-sm text-[var(--steel-300)]">Subjects</dt>
              </div>
            </dl>
          </div>
        </section>

        {/* Pick your test: one tile per test. The empty bubble in the corner
            fills when you reach for it, like marking an answer. */}
        <section id="other-exams" className="py-16 sm:py-24">
          <div className="container-page">
            <h2 style={display} className="max-w-[22ch] text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Which test are you sitting?
            </h2>
            <p className="mt-4 max-w-[56ch] text-[var(--steel-300)]">
              One account covers all of them. The medical track is the deepest today; the others are smaller and growing.
            </p>
            <ul className="mt-10 grid gap-4 lg:grid-cols-12">
              {TESTS.map((t) => (
                <li key={t.name} className={t.span}>
                  <Link
                    href={t.href}
                    className={`group relative flex h-full min-h-[150px] flex-col justify-between gap-6 overflow-hidden rounded-[var(--r-4)] border border-[var(--line-2)] bg-[var(--srf-1)] p-6 shadow-[var(--shadow-card)] transition-colors duration-[var(--dur-1)] hover:border-[var(--line-signal)] hover:bg-[var(--srf-2)] ${focusRing}`}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute right-5 top-5 h-5 w-5 rounded-full border-2 border-[var(--steel-600)] transition-[background-color,border-color,box-shadow] duration-[var(--dur-2)] group-hover:border-[var(--signal-400)] group-hover:bg-[var(--signal-400)] group-hover:shadow-[var(--glow-signal-sm)]"
                    />
                    <span className="text-sm text-[var(--steel-400)]">{t.track}</span>
                    <span>
                      <span style={display} className="block text-2xl font-bold tracking-tight text-[var(--steel-100)]">{t.name}</span>
                      <span className="mt-1.5 block max-w-[48ch] text-sm leading-relaxed text-[var(--steel-300)]">{t.body}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-[var(--steel-300)]">
              Questions or study material?{" "}
              <a
                href="https://chat.whatsapp.com/GbhjI1A6FvBBtAd4PZR2NU"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[var(--signal-300)] underline underline-offset-4 hover:text-[var(--signal-200)]"
              >
                Join the WhatsApp group
              </a>
              .
            </p>
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
                Real papers, sorted by board and year
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
              <Link href="/past-papers" className="btn-secondary mt-7 inline-flex min-h-[48px] items-center justify-center px-6">
                Open the past papers
              </Link>
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
