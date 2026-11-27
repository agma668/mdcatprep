import type { Metadata } from "next";
import Link from "next/link";
import { NUST_NET_BANK } from "@/lib/nust-questions";
import { EngineeringDrill } from "@/components/practice/EngineeringDrill";
import { formatReviewedOn } from "@/lib/dated-claims";
import { getSiteUrl } from "@/lib/site";

/**
 * GIKI practice — Physics, Mathematics and English.
 *
 * GIKI publishes an admission-test syllabus PDF and a sample paper, and it
 * publishes its merit weightage (test 85%, SSC 15%). It does **not** publish a
 * public MCQ count, a duration, a per-subject percentage split or a negative
 * marking rule that we could verify. Those four cells say "not published"
 * rather than borrowing a number from a coaching site.
 */

const CHECKED_ON = "2026-11-28";
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "GIKI Admission Test Practice — Maths, Physics, English",
  description:
    "GIKI's own admission test covers intermediate Physics, Mathematics and English, and counts for 85% of merit. Practise those subjects free, with the reasoning behind every answer.",
  keywords: ["GIKI test practice", "GIKI admission test pattern", "GIKI entry test MCQs"],
  alternates: { canonical: "/giki/practice" },
  openGraph: {
    type: "website",
    url: `${siteUrl}/giki/practice`,
    title: "GIKI Admission Test Practice — Maths, Physics, English",
    description:
      "Physics, Mathematics and English practice for GIKI's own admission test, which carries 85% of admission merit.",
  },
};

const PUBLISHED = [
  { k: "Subjects", v: "Physics, Mathematics, English" },
  { k: "Merit weight", v: "Test 85% · SSC 15%" },
  { k: "Format", v: "Computer-based" },
  { k: "Negative marking", v: "Not published" },
];

export default function GIKIPracticePage() {
  return (
    <EngineeringDrill
      bank={NUST_NET_BANK}
      subjects={["Mathematics", "Physics", "English"]}
      testLabel="GIKI subjects"
      breadcrumb={{ href: "/portal/nust", label: "Engineering portal" }}
      signupExam="nust"
      footerLabel="GIKI admission-test practice."
    >
      <header className="mb-10">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          GIKI admission test practice
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--steel-400)]">
          GIKI runs its own test rather than using NET. It is built on intermediate-level Physics and
          Mathematics, with English assessed too, and it carries 85% of the admission merit.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PUBLISHED.map((f) => (
          <div key={f.k} className="rounded-2xl border border-[var(--line-2)] bg-[var(--srf-1)] p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--steel-400)]">{f.k}</div>
            <div className="mt-1 text-sm font-extrabold text-[var(--steel-100)]">{f.v}</div>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-dashed border-[var(--line-2)] bg-[var(--srf-1)] p-5 sm:p-6">
        <h2 className="text-base font-bold">What GIKI does not publish</h2>
        <p className="mt-2 text-xs leading-relaxed text-[var(--steel-400)]">
          We could not find an official statement of the number of MCQs, the test duration, the
          per-subject weighting, or a negative-marking rule. GIKI publishes the syllabus and a sample
          paper instead. So this page does not show a GIKI pattern card with invented numbers — if
          those details matter to your preparation, read the official syllabus and sample paper below,
          and check the admission portal before the test.
        </p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">
          <a
            href="https://giki.edu.pk/wp-content/uploads/2023/10/GIKI_Engineering_Computing_Syllabus.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--signal-300)] underline underline-offset-4"
          >
            Official syllabus PDF
          </a>
          <a
            href="https://giki.edu.pk/admissions/admissions-undergraduates/undergraduate-admission-test-syllabus"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--signal-300)] underline underline-offset-4"
          >
            Syllabus and sample paper page
          </a>
          <a
            href="https://giki.edu.pk/admissions/admissions-undergraduates/eligibility-criteria"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--signal-300)] underline underline-offset-4"
          >
            Eligibility and weightage
          </a>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--line-2)] bg-[var(--srf-1)] p-5">
          <h2 className="text-sm font-bold">The paper, as published</h2>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[var(--steel-400)]">
            <li>Multiple-choice questions on Pakistani intermediate Physics and Mathematics.</li>
            <li>English is assessed as well, because the medium of instruction is English.</li>
            <li>The engineering/computing test is separate from the GCAT used for BS Management Sciences.</li>
            <li>Merit: 85% test, 15% SSC or the equivalent prior qualification.</li>
            <li>GIKI states there are no quotas, reserved seats or admission by donation.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-[var(--line-2)] bg-[var(--srf-1)] p-5">
          <h2 className="text-sm font-bold">Important about this bank</h2>
          <p className="mt-2 text-xs leading-relaxed text-[var(--steel-400)]">
            These questions are ours, written to cover the same intermediate Physics, Mathematics and
            English ground the GIKI syllabus lists. They are not GIKI questions and this is not a GIKI
            past paper — GIKI has not released one. Use it to practise the content, not to predict a
            score.
          </p>
        </div>
      </section>

      <p className="mt-6 text-xs leading-relaxed text-[var(--steel-400)]">
        Sources: GIKI admission selection, eligibility criteria, the undergraduate admissions policy
        and the engineering/computing syllabus PDF. Last checked {formatReviewedOn(CHECKED_ON)}.
        Comparing with{" "}
        <Link href="/nust/practice" className="font-semibold text-[var(--signal-300)] underline underline-offset-4">
          NUST NET
        </Link>{" "}
        or{" "}
        <Link href="/lums/practice" className="font-semibold text-[var(--signal-300)] underline underline-offset-4">
          LUMS
        </Link>
        ?
      </p>
    </EngineeringDrill>
  );
}
