import type { Metadata } from "next";
import Link from "next/link";
import { formatReviewedOn } from "@/lib/dated-claims";
import { getSiteUrl } from "@/lib/site";

/**
 * LUMS — the honest version.
 *
 * LUMS does not set its own subject entrance paper for SBASSE. An applicant
 * submits one of SAT, ACT or LCAT. So this page cannot offer "LUMS practice" in
 * the same sense as the NET or GIKI pages, and it does not pretend to: it gives
 * the published requirement, the LCAT structure LUMS publishes, and a plain
 * statement of what our bank does and does not cover.
 */

const CHECKED_ON = "2026-11-28";
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "LUMS SBASSE Admission Test — SAT, ACT or LCAT (No LUMS Paper)",
  description:
    "LUMS does not set its own engineering entrance test: SBASSE applicants submit SAT, ACT or LCAT. Here is the published LCAT structure, the deadline dates, and what it means for practice.",
  keywords: ["LUMS admission test", "LCAT pattern", "LUMS SBASSE SAT", "LCAT 2027"],
  alternates: { canonical: "/lums/practice" },
  openGraph: {
    type: "website",
    url: `${siteUrl}/lums/practice`,
    title: "LUMS SBASSE Admission Test — SAT, ACT or LCAT (No LUMS Paper)",
    description:
      "There is no LUMS science entrance paper. Applicants submit SAT, ACT or LCAT — with the LCAT structure published by LUMS.",
  },
};

const REQUIREMENT = [
  { k: "LUMS paper?", v: "None" },
  { k: "Accepted", v: "SAT · ACT · LCAT" },
  { k: "LCAT format", v: "Paper-based MCQ" },
  { k: "LCAT length", v: "4 sections · ~3 hours" },
];

const DATES = [
  { k: "Application deadline", v: "27 Jan 2027" },
  { k: "SAT (latest sitting)", v: "by 6 Mar 2027" },
  { k: "LCAT", v: "21 Mar 2027" },
  { k: "ACT (latest sitting)", v: "by 10 Apr 2027" },
];

const SECTIONS = [
  { name: "Verbal 1", detail: "Craft & structure · information & ideas" },
  { name: "Verbal 2", detail: "Standard English conventions · expression of ideas" },
  { name: "Math 1", detail: "Algebra · advanced mathematics" },
  { name: "Math 2", detail: "Problem-solving & data analysis · geometry & trigonometry" },
];

export default function LUMSPracticePage() {
  return (
    <div className="min-h-screen bg-[var(--field-1)] text-[var(--steel-100)]">
      <main className="mx-auto max-w-3xl px-4 py-16">
        <Link href="/portal/nust" className="text-xs text-[var(--steel-400)] underline underline-offset-4 hover:text-[var(--steel-100)]">
          ← Engineering portal
        </Link>

        <h1 className="mt-4 text-2xl md:text-3xl font-extrabold tracking-tight">
          LUMS SBASSE — the test you actually take
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--steel-400)]">
          LUMS does not set its own subject entrance paper for engineering or the sciences. An SBASSE
          applicant submits <strong className="text-[var(--steel-100)]">one of SAT, ACT or LCAT</strong>.
          The same requirement applies to the other LUMS undergraduate programmes, so there is no
          separate LUMS science test to drill — and any page that sells you one is inventing it.
        </p>

        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {REQUIREMENT.map((f) => (
            <div key={f.k} className="rounded-2xl border border-[var(--line-2)] bg-[var(--srf-1)] p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--steel-400)]">{f.k}</div>
              <div className="mt-1 text-sm font-extrabold text-[var(--steel-100)]">{f.v}</div>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-[var(--line-2)] bg-[var(--srf-1)] p-5 sm:p-6">
          <h2 className="text-lg font-bold">LCAT, as LUMS publishes it</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SECTIONS.map((s) => (
              <div key={s.name} className="rounded-xl border border-[var(--line-2)] bg-[var(--srf-2)] p-4">
                <div className="text-sm font-bold">{s.name}</div>
                <div className="mt-1 text-xs leading-relaxed text-[var(--steel-400)]">{s.detail}</div>
              </div>
            ))}
          </div>
          <ul className="mt-4 space-y-1.5 text-xs leading-relaxed text-[var(--steel-400)]">
            <li>Four sections — two verbal, two mathematical — of about 40 minutes each, roughly three hours in total.</li>
            <li>Paper-based multiple choice; calculators are not permitted.</li>
            <li>LUMS publishes a sample LCAT paper, linked below.</li>
          </ul>
        </section>

        <section className="mt-6 rounded-2xl border border-[var(--line-2)] bg-[var(--srf-1)] p-5 sm:p-6">
          <h2 className="text-lg font-bold">Fall 2027 dates, as published</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {DATES.map((d) => (
              <div key={d.k}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--steel-400)]">{d.k}</div>
                <div className="mt-1 text-sm font-extrabold tabular-nums">{d.v}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[var(--steel-400)]">
            These are the dates LUMS publishes for the Fall 2027 cycle. A later cycle will move them;
            confirm on the admissions site before booking a sitting.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-dashed border-[var(--line-2)] bg-[var(--srf-1)] p-5 sm:p-6">
          <h2 className="text-base font-bold">What this site can and cannot give you</h2>
          <p className="mt-2 text-xs leading-relaxed text-[var(--steel-400)]">
            We hold no LCAT-format bank and no LCAT past papers, so we do not offer a LUMS drill. Our
            engineering bank is written for NET/GIKI-level Mathematics and Physics, and our English
            items are SAT-style reading and writing — useful ground for the LCAT verbal and maths
            sections, but not a simulation of its blueprint. Treat any practice here as content
            revision, not as LCAT timing or scoring.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">
            <Link href="/nust/practice" className="font-semibold text-[var(--signal-300)] underline underline-offset-4">
              Maths &amp; English practice (NET/GIKI-level)
            </Link>
            <a
              href="https://lums.edu.pk/sites/default/files/sample_lcat_2025.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--signal-300)] underline underline-offset-4"
            >
              Official LCAT sample paper
            </a>
            <a
              href="https://admission.lums.edu.pk/testing-admissions"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--signal-300)] underline underline-offset-4"
            >
              LUMS testing requirements
            </a>
            <a
              href="https://admission.lums.edu.pk/critical-dates-all-programmes"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--signal-300)] underline underline-offset-4"
            >
              Critical dates
            </a>
          </div>
        </section>

        <p className="mt-6 text-xs leading-relaxed text-[var(--steel-400)]">
          Last checked {formatReviewedOn(CHECKED_ON)}. The other engineering tests have their own pages:{" "}
          <Link href="/nust/practice" className="font-semibold text-[var(--signal-300)] underline underline-offset-4">
            NUST NET
          </Link>{" "}
          ·{" "}
          <Link href="/giki/practice" className="font-semibold text-[var(--signal-300)] underline underline-offset-4">
            GIKI
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
