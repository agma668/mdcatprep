import type { Metadata } from "next";
import Link from "next/link";
import { NUST_NET_BANK } from "@/lib/nust-questions";
import { EngineeringDrill } from "@/components/practice/EngineeringDrill";
import { formatReviewedOn } from "@/lib/dated-claims";
import { getSiteUrl } from "@/lib/site";

/**
 * NUST NET practice — NUST only.
 *
 * This route used to be titled "NUST NET, GIKI & LUMS" and drilled maths,
 * physics, chemistry and English for all three. Two of those claims were false:
 * NET-Engineering has no chemistry section, and LUMS does not set a subject test
 * at all. The official weightings below come from NUST's own pages; the split
 * pages for GIKI and LUMS carry their own sources.
 */

const CHECKED_ON = "2026-11-28";
const siteUrl = getSiteUrl();
const NET_SUBJECTS = ["Mathematics", "Physics", "English"] as const;

export const metadata: Metadata = {
  title: "NUST NET Practice — Maths 50%, Physics 30%, English 20%",
  description:
    "Free NUST NET-Engineering practice: 200 MCQs in 180 minutes, no negative marking, Mathematics 50% / Physics 30% / English 20% — with the reasoning behind every answer.",
  keywords: ["NUST NET practice", "NET engineering pattern", "NUST entry test MCQs", "NET 2027"],
  alternates: { canonical: "/nust/practice" },
  openGraph: {
    type: "website",
    url: `${siteUrl}/nust/practice`,
    title: "NUST NET Practice — Maths 50%, Physics 30%, English 20%",
    description:
      "NUST NET-Engineering practice on the official weightings: 200 MCQs, 180 minutes, no negative marking.",
  },
};

const FACTS = [
  { k: "Paper", v: "200 MCQs · 200 marks" },
  { k: "Time", v: "180 minutes" },
  { k: "Negative marking", v: "None" },
  { k: "Merit weight", v: "NET 75% · HSSC 15% · SSC 10%" },
];

const WEIGHTING = [
  { subject: "Mathematics", pct: 50, mcqs: 100 },
  { subject: "Physics", pct: 30, mcqs: 60 },
  { subject: "English", pct: 20, mcqs: 40 },
];

export default function NUSTPracticePage() {
  const netCount = NUST_NET_BANK.filter((q) => NET_SUBJECTS.includes(q.subject as (typeof NET_SUBJECTS)[number])).length;

  return (
    <EngineeringDrill
      bank={NUST_NET_BANK}
      subjects={NET_SUBJECTS}
      testLabel="NET-Engineering bank"
      breadcrumb={{ href: "/portal/nust", label: "Engineering portal" }}
      signupExam="nust"
      footerLabel="NUST NET practice."
    >
      <header className="mb-10">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          NUST NET practice — Engineering &amp; Computing
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--steel-400)]">
          One paper, three subjects, no chemistry section — that is the part most NET pages get wrong.
          Everything below is what NUST publishes about its own test.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FACTS.map((f) => (
          <div key={f.k} className="rounded-2xl border border-[var(--line-2)] bg-[var(--srf-1)] p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--steel-400)]">{f.k}</div>
            <div className="mt-1 text-sm font-extrabold tabular-nums text-[var(--steel-100)]">{f.v}</div>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-[var(--line-2)] bg-[var(--srf-1)] p-5 sm:p-6">
        <h2 className="text-lg font-bold">Subject weightage (NET-Engineering)</h2>
        <div className="mt-4 space-y-3">
          {WEIGHTING.map((w) => (
            <div key={w.subject}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-semibold">{w.subject}</span>
                <span className="tabular-nums text-[var(--steel-400)]">
                  {w.pct}% · about {w.mcqs} of 200
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-[var(--srf-3)]">
                <div className="h-2 rounded-full bg-[var(--signal-500)]" style={{ width: `${w.pct}%` }} aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-[var(--steel-400)]">
          NUST publishes the split as percentages, not per-subject MCQ counts; the counts above are that
          percentage of the 200-question paper. Chemistry is not a section of NET-Engineering — NUST
          puts it in the separate NET-Applied Sciences paper for pre-medical candidates (Biology 50%,
          Chemistry 30%, English 20%).
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--line-2)] bg-[var(--srf-1)] p-5">
          <h2 className="text-sm font-bold">How the test is sat</h2>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[var(--steel-400)]">
            <li>Computer-based at Islamabad and Quetta; paper-based at Karachi and Gilgit.</li>
            <li>Four series in a year; your best score is the one used.</li>
            <li>One attempt per discipline in any single series.</li>
            <li>Questions come from the HSSC textbooks; the English paper follows the SAT pattern.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-[var(--line-2)] bg-[var(--srf-1)] p-5">
          <h2 className="text-sm font-bold">What this bank is — and is not</h2>
          <p className="mt-2 text-xs leading-relaxed text-[var(--steel-400)]">
            {netCount} original questions across the three NET subjects — not 200, and not taken from a
            NUST paper. It is practice on the published subjects, not a leaked paper and not a score
            predictor. The chemistry items in the wider bank are hidden here because the paper does not
            contain them.
          </p>
        </div>
      </section>

      <p className="mt-6 text-xs leading-relaxed text-[var(--steel-400)]">
        Sources:{" "}
        <a href="https://nust.edu.pk/admissions/undergraduates/subjects-included-in-net-with-weightings" target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--signal-300)] underline underline-offset-4">
          NET subjects and weightings
        </a>{" "}
        ·{" "}
        <a href="https://nust.edu.pk/admissions/undergraduates/merit-criteria-for-admission-on-net-basis" target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--signal-300)] underline underline-offset-4">
          merit criteria
        </a>{" "}
        ·{" "}
        <a href="https://ugadmissions.nust.edu.pk/PublishingImages/UG_Brochure_2026.pdf" target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--signal-300)] underline underline-offset-4">
          UG brochure
        </a>
        . Last checked {formatReviewedOn(CHECKED_ON)}. Other engineering tests:{" "}
        <Link href="/giki/practice" className="font-semibold text-[var(--signal-300)] underline underline-offset-4">
          GIKI
        </Link>{" "}
        ·{" "}
        <Link href="/lums/practice" className="font-semibold text-[var(--signal-300)] underline underline-offset-4">
          LUMS
        </Link>
        .
      </p>
    </EngineeringDrill>
  );
}
