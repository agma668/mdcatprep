import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { formatReviewedOn } from "@/lib/dated-claims";
import { getSiteUrl } from "@/lib/site";
import { ArrowRight, FileText, ShieldCheck } from "lucide-react";

/**
 * The MDCAT syllabus page.
 *
 * Every number below is transcribed from PM&amp;DC's own 24-page Uniform
 * Curriculum MDCAT-2025 (the copy the site holds at
 * data/papers/pmdc/2025-2026-curriculum.pdf, downloaded 2026-11-28): 180 MCQs,
 * 180 minutes, 81/45/36/9/9, 15/70/15 difficulty, 55% MBBS and 50% BDS pass
 * marks, no negative marking.
 *
 * What this page deliberately does NOT contain: a unit-by-unit topic tree, and
 * any topic-level weightage. PM&amp;DC publishes no per-topic weighting, and the
 * unit list in the PDF is a two-column table that does not survive text
 * extraction cleanly — transcribing it by hand is a separate, reviewable job.
 * A guessed outline would look more useful than the real one and be worse.
 */

const siteUrl = getSiteUrl();
const CHECKED_ON = "2026-11-28";

const CURRICULUM_URL =
  "https://pmdc.pk/Documents/Syllabus/Uniform%20Curriculum%20MDCAT-2025%20%20Final%20(26-05-2025).pdf";

const SECTIONS = [
  {
    name: "Biology",
    mcqs: 81,
    pct: 45,
    covers: "Units 1–16, from acellular life and biological molecules through inheritance, circulation, immunity, respiration, digestion and homeostasis.",
    href: "/topicals",
    cta: "Biology chapter drills",
  },
  {
    name: "Chemistry",
    mcqs: 45,
    pct: 25,
    covers: "Physical, inorganic and organic chemistry — atomic structure, gases, equilibrium, thermochemistry, electrochemistry, transition elements, organic functional groups and macromolecules.",
    href: "/topicals",
    cta: "Chemistry chapter drills",
  },
  {
    name: "Physics",
    mcqs: 36,
    pct: 20,
    covers: "Vectors and motion through work and energy, rotation, fluids, waves, thermodynamics, electrostatics, current, electromagnetism, electronics, modern physics and nuclear physics.",
    href: "/topicals",
    cta: "Physics chapter drills",
  },
  {
    name: "English",
    mcqs: 9,
    pct: 5,
    covers: "Reading comprehension, formal and functional grammar, and writing skills.",
    href: "/notes/english",
    cta: "English notes",
  },
  {
    name: "Logical Reasoning",
    mcqs: 9,
    pct: 5,
    covers: "Critical thinking: arguments, assumptions, logical deduction and the reasoning patterns the paper uses.",
    href: "/practice/session",
    cta: "Start a reasoning run",
  },
] as const;

export const metadata: Metadata = {
  title: "MDCAT Syllabus 2026 — Official PMDC Pattern & Weightage",
  description:
    "PM&DC's MDCAT curriculum as published: 180 MCQs in 180 minutes, Biology 81, Chemistry 45, Physics 36, English 9, Logical Reasoning 9, no negative marking, 55% MBBS and 50% BDS pass marks.",
  keywords: [
    "MDCAT syllabus 2026",
    "MDCAT syllabus 2026 pdf download",
    "MDCAT syllabus 2026 sindh",
    "MDCAT syllabus 2026 kpk",
    "MDCAT paper pattern 2026",
    "MDCAT weightage",
  ],
  alternates: { canonical: "/syllabus/mdcat" },
  openGraph: {
    type: "article",
    url: `${siteUrl}/syllabus/mdcat`,
    title: "MDCAT Syllabus 2026 — Official PMDC Pattern & Weightage",
    description:
      "The official MDCAT pattern: 180 MCQs, subject weightage, difficulty split and pass marks, cited to the PM&DC curriculum.",
  },
};

export default function MdcatSyllabusPage() {
  const totalPct = SECTIONS.reduce((n, s) => n + s.pct, 0);
  const totalMcqs = SECTIONS.reduce((n, s) => n + s.mcqs, 0);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <FileText className="h-4 w-4" aria-hidden="true" />
            Official syllabus · transcribed from the PM&amp;DC curriculum
          </div>

          <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            MDCAT syllabus and paper pattern
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            The national MDCAT is one paper for every province: 180 multiple-choice questions in 180
            minutes, paper-based, with no negative marking. PM&amp;DC sets the curriculum; the
            provincial universities (UHS, KMU, SZABMU, SIBA and BUMHS) conduct the sitting.
          </p>

          {/* Headline facts */}
          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { k: "Questions", v: "180" },
              { k: "Time", v: "180 min" },
              { k: "Negative marking", v: "None" },
              { k: "Pass marks", v: "55% / 50%" },
            ].map((item) => (
              <div key={item.k} className="rounded-2xl border border-border bg-card p-4">
                <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {item.k}
                </dt>
                <dd className="mt-1 text-2xl font-extrabold tabular-nums">{item.v}</dd>
              </div>
            ))}
          </dl>

          {/* Subject split */}
          <section className="mt-10">
            <h2 className="text-xl font-bold">Subject weightage</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Biology carries almost half the paper. That is the whole reason a weak Biology topic
              costs more marks than a weak English one.
            </p>

            <div className="mt-5 overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-card text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Section
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-bold">
                      MCQs
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-bold">
                      Weight
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SECTIONS.map((s) => (
                    <tr key={s.name} className="border-t border-border align-top">
                      <th scope="row" className="px-4 py-3 font-semibold">
                        {s.name}
                        <p className="mt-1 max-w-md text-xs font-normal leading-relaxed text-muted-foreground">
                          {s.covers}
                        </p>
                      </th>
                      <td className="px-4 py-3 text-right font-bold tabular-nums">{s.mcqs}</td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums">{s.pct}%</td>
                    </tr>
                  ))}
                  <tr className="border-t border-border bg-card/60">
                    <th scope="row" className="px-4 py-3 font-extrabold">
                      Total
                    </th>
                    <td className="px-4 py-3 text-right font-extrabold tabular-nums">{totalMcqs}</td>
                    <td className="px-4 py-3 text-right font-extrabold tabular-nums">{totalPct}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Difficulty + rules */}
          <section className="mt-10 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="text-lg font-bold">Difficulty split</h2>
              <ul className="mt-3 space-y-3">
                {[
                  { label: "Easy", pct: 15 },
                  { label: "Moderate", pct: 70 },
                  { label: "Difficult", pct: 15 },
                ].map((d) => (
                  <li key={d.label}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-semibold">{d.label}</span>
                      <span className="font-bold tabular-nums">{d.pct}%</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-accent"
                        style={{ width: `${d.pct}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Seven in ten questions are meant to be moderate. The paper is not a trick paper — it
                rewards coverage of the whole syllabus over speed on hard items.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                Rules that affect your score
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong className="text-foreground">No negative marking.</strong> A blank answer
                  scores exactly what a wrong one does — nothing — so there is never a reason to
                  leave a question empty.
                </li>
                <li>
                  <strong className="text-foreground">55% to pass for MBBS, 50% for BDS.</strong> A
                  pass is an eligibility gate, not a seat; merit is a separate calculation.
                </li>
                <li>
                  <strong className="text-foreground">The paper is in English.</strong> The English
                  section is small, but every other section is read in it.
                </li>
                <li>
                  <strong className="text-foreground">One national curriculum.</strong> Provinces
                  differ in who conducts the test and in their textbooks, not in the syllabus PM&amp;DC
                  publishes.
                </li>
              </ul>
            </div>
          </section>

          {/* Status of the 2026/2027 cycle */}
          <section className="mt-10 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-lg font-bold">Which syllabus applies right now</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              This is PM&amp;DC&apos;s <strong className="text-foreground">Uniform Curriculum MDCAT-2025</strong>.
              PM&amp;DC stated that the same curriculum applies to MDCAT 2026, and has published no
              replacement for a later sitting. If a new curriculum is issued, this page is wrong until
              it is updated — the official PDF linked below is always the authority.
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <a
                href={CURRICULUM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-accent hover:underline"
              >
                Official curriculum PDF (PM&amp;DC) <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </a>
              <span className="text-muted-foreground">
                Transcribed and last checked {formatReviewedOn(CHECKED_ON)}.
              </span>
            </p>
          </section>

          {/* What is not here */}
          <section className="mt-6 rounded-2xl border border-dashed border-border p-5 sm:p-6">
            <h2 className="text-base font-bold">What this page does not claim</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              There is no topic-level weightage here, because PM&amp;DC publishes none — the
              81/45/36/9/9 split is per subject, not per chapter. Any site quoting &ldquo;5 MCQs from
              this chapter&rdquo; is describing its own guess or a past paper, not the syllabus. Our
              weak-topic ranking is built from your own answers for the same reason.
            </p>
          </section>

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Sitting NUMS instead — or as well? It is a different paper with its own weightings; the{" "}
            <Link href="/syllabus/nums" className="font-semibold text-accent underline underline-offset-4">
              NUMS MDCAT syllabus page
            </Link>{" "}
            transcribes NUMS&apos;s 2026 Table of Specifications.
          </p>

          {/* Practice links */}
          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            <Link
              href="/topicals"
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent/50"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-accent">Practice</div>
              <div className="mt-1 font-bold">Chapter-wise drills</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Pick a chapter and answer it with explanations on.
              </p>
            </Link>
            <Link
              href="/past-papers"
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent/50"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-accent">Papers</div>
              <div className="mt-1 font-bold">Sittings under this syllabus</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Papers from 2025 onwards use this curriculum; earlier ones contain removed topics.
              </p>
            </Link>
            <Link
              href="/merit-calculator"
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent/50"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-accent">Merit</div>
              <div className="mt-1 font-bold">Aggregate calculator</div>
              <p className="mt-1 text-xs text-muted-foreground">
                What your marks add up to, and the MDCAT score a target needs.
              </p>
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
