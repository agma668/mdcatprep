import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { ExamPaper } from "@/components/landing/ExamPaper";
import { FAQ, FAQS } from "@/components/landing/FAQ";
import { RegisterSection } from "@/components/landing/RegisterSection";
import { Footer } from "@/components/landing/Footer";
import { getPublicStats } from "@/lib/public-stats";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { PAST_PAPERS, PAST_PAPER_COUNT, isOfficialKey, papersByYear } from "@/lib/past-papers";

const siteUrl = getSiteUrl();

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
  name: "MDCAT & NUMS Medical Entrance Test Preparation",
  description: SITE_DESCRIPTION,
  url: siteUrl,
  provider: { "@type": "Organization", name: SITE_NAME, url: siteUrl },
  learningResourceType: ["MCQ Practice", "Mock Test", "Study Notes"],
  educationalUse: "practice",
  isAccessibleForFree: true,
  inLanguage: ["en", "ur"],
  about: ["MDCAT", "NUMS", "UHS Medical Entrance", "SZABMU Test", "KMU CAT"],
  audience: { "@type": "EducationalAudience", educationalRole: "student" },
};

export const metadata: Metadata = {
  title: "MDCAT & NUMS Medical Entrance Test Preparation",
  description:
    "Structured preparation for MDCAT, NUMS, UHS, SZABMU, KMU and all medical university entry tests in Pakistan. Exam-style MCQ practice, past papers sorted by board and year, and study notes.",
};

// Numbers come from the live seam in lib/public-stats.ts; ISR refreshes them.
export const revalidate = 60;

const display = { fontFamily: "var(--font-display)" } as const;

const PRACTICE = [
  { href: "/topicals", title: "Topical MCQs", body: "Chapter-wise questions for Biology, Chemistry and Physics. Answer, see why, move on." },
  { href: "/past-papers", title: "Past papers", body: "Released MDCAT and NUMS papers, sorted by board and year." },
  { href: "/daily-quiz", title: "Daily quiz", body: "A short set every day, so practice becomes a habit instead of a plan." },
  { href: "/flashcards", title: "Flashcards", body: "Spaced-repetition cards for the facts that keep repeating in the paper." },
  { href: "/notes", title: "Concept notes", body: "Short notes written from the PMDC syllabus for every topic you miss." },
];

const STEPS = [
  { title: "Take the diagnostic", body: "Ten questions across five subjects, about two minutes. It shows where you are strong and where you are not." },
  { title: "Practise by topic", body: "Work through chapter-wise MCQs. Every answer comes with its explanation." },
  { title: "Redo what you missed", body: "Wrong answers collect in your mistake notebook so you can drill them until they stick." },
];

const OTHER_EXAMS = [
  { href: "/usat/practice", name: "HEC USAT", body: "Quantitative, verbal and science sections." },
  { href: "/pma/practice", name: "PMA & ISSB", body: "Verbal and non-verbal intelligence, initial academic test." },
  { href: "/nust/practice", name: "NUST, GIKI, LUMS", body: "Maths, physics, chemistry and English." },
];

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
        {/* Hero: one thing dominates. The sample question is answerable, so the
            first thing a student does here is the thing the site is for. */}
        <section className="container-page pb-16 pt-28 sm:pb-24 sm:pt-36">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="inline-flex items-center gap-2 rounded-[var(--r-pill)] border border-[var(--line-2)] bg-[var(--srf-1)] px-3 py-1.5 text-sm text-[var(--steel-200)]">
                <span className="font-semibold text-[var(--brass)]">Free</span>
                for every student in Pakistan
              </p>
              <h1
                style={display}
                className="mt-5 max-w-[16ch] text-[2.5rem] font-bold leading-[1.06] tracking-tight text-[var(--steel-100)] sm:text-5xl lg:text-[3.6rem]"
              >
                Practise MDCAT and NUMS the way the paper asks.
              </h1>
              <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-[var(--steel-300)] sm:text-lg">
                Exam-style MCQs with an explanation behind every answer, plus the real past papers the boards have released, sorted by board and year.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/diagnostic" className="btn-primary inline-flex min-h-[48px] items-center justify-center px-6 text-base">
                  Take the 2-minute diagnostic
                </Link>
                <Link href="/past-papers" className="btn-secondary inline-flex min-h-[48px] items-center justify-center px-6 text-base">
                  Browse past papers
                </Link>
              </div>
              <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-[var(--line-1)] pt-6">
                <div>
                  <dt className="text-sm text-[var(--steel-400)]">Practice MCQs</dt>
                  <dd className="text-2xl font-semibold tabular-nums text-[var(--steel-100)]">{mcqs.toLocaleString("en-US")}</dd>
                </div>
                <div>
                  <dt className="text-sm text-[var(--steel-400)]">Past papers</dt>
                  <dd className="text-2xl font-semibold tabular-nums text-[var(--steel-100)]">{PAST_PAPER_COUNT}</dd>
                </div>
                <div>
                  <dt className="text-sm text-[var(--steel-400)]">Subjects</dt>
                  <dd className="text-2xl font-semibold tabular-nums text-[var(--steel-100)]">{stats.hero.subjects}</dd>
                </div>
              </dl>
            </div>
            <ExamPaper />
          </div>
        </section>

        <section id="features" className="border-t border-[var(--line-1)] bg-[var(--field-2)] py-16 sm:py-24">
          <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <h2 style={display} className="max-w-[14ch] text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Everything you practise with, in one place
              </h2>
              <p className="mt-4 max-w-[44ch] text-[var(--steel-300)]">
                No coaching centre, no fee. Open any of these without an account; sign in when you want your progress saved.
              </p>
            </div>
            <ul className="divide-y divide-[var(--line-1)] border-y border-[var(--line-1)]">
              {PRACTICE.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="group flex min-h-[64px] items-center justify-between gap-6 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]"
                  >
                    <span>
                      <span className="block text-lg font-semibold text-[var(--steel-100)] group-hover:text-[var(--signal-200)]">{p.title}</span>
                      <span className="mt-0.5 block max-w-[52ch] text-sm text-[var(--steel-300)]">{p.body}</span>
                    </span>
                    <span aria-hidden="true" className="text-[var(--steel-500)] transition-transform duration-[var(--dur-2)] group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="past-papers" className="py-16 sm:py-24">
          <div className="container-page">
            <h2 style={display} className="max-w-[20ch] text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Real papers, sorted by board and year
            </h2>
            <p className="mt-4 max-w-[60ch] text-[var(--steel-300)]">
              <span className="tabular-nums">{PAST_PAPER_COUNT}</span> papers
              {firstYear && lastYear ? (
                <>
                  {" "}from <span className="tabular-nums">{firstYear}</span> to <span className="tabular-nums">{lastYear}</span>
                </>
              ) : null}
              . <span className="tabular-nums">{keyed}</span> come with an official answer key. The rest say so on the card, so a missing key is never mistaken for a wrong answer.
            </p>
            <div className="mt-8 divide-y divide-[var(--line-1)] border-y border-[var(--line-1)]">
              {dated.map((g) => {
                const boards = Array.from(new Set(g.papers.map((p) => p.exam.replace(/ MDCAT.*$/, ""))));
                return (
                  <div key={g.key} className="grid gap-2 py-4 sm:grid-cols-[6rem_1fr] sm:items-baseline">
                    <span className="text-xl font-semibold tabular-nums text-[var(--steel-100)]">{g.key}</span>
                    <span className="flex flex-wrap gap-2">
                      {boards.map((b) => (
                        <span key={b} className="rounded-[var(--r-2)] border border-[var(--line-2)] bg-[var(--srf-1)] px-2.5 py-1 text-sm text-[var(--steel-200)]">
                          {b}
                        </span>
                      ))}
                    </span>
                  </div>
                );
              })}
            </div>
            <Link href="/past-papers" className="btn-secondary mt-8 inline-flex min-h-[48px] items-center justify-center px-6">
              Open the past papers
            </Link>
          </div>
        </section>

        <section id="how-it-works" className="border-t border-[var(--line-1)] bg-[var(--field-2)] py-16 sm:py-24">
          <div className="container-page">
            <h2 style={display} className="max-w-[18ch] text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Three steps, repeated daily
            </h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
              {STEPS.map((s, i) => (
                <li key={s.title} className="border-t border-[var(--line-3)] pt-5">
                  <span className="text-sm font-semibold tabular-nums text-[var(--signal-300)]">Step {i + 1}</span>
                  <h3 className="mt-2 text-xl font-semibold text-[var(--steel-100)]">{s.title}</h3>
                  <p className="mt-2 max-w-[40ch] text-[var(--steel-300)]">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="other-exams" className="py-16 sm:py-20">
          <div className="container-page">
            <h2 style={display} className="text-2xl font-bold tracking-tight sm:text-3xl">
              Preparing for something else too?
            </h2>
            <p className="mt-3 max-w-[56ch] text-[var(--steel-300)]">The same account covers these tests. They are smaller than the medical track, and growing.</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {OTHER_EXAMS.map((e) => (
                <li key={e.href}>
                  <Link
                    href={e.href}
                    className="block h-full rounded-[var(--r-3)] border border-[var(--line-2)] bg-[var(--srf-1)] p-4 transition-colors duration-[var(--dur-1)] hover:border-[var(--line-3)] hover:bg-[var(--srf-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]"
                  >
                    <span className="block font-semibold text-[var(--steel-100)]">{e.name}</span>
                    <span className="mt-1 block text-sm text-[var(--steel-300)]">{e.body}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-[var(--steel-300)]">
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

        <section id="faq">
          <FAQ />
        </section>
        <section id="register">
          <RegisterSection mcqs={mcqs} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
