import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { PublicMeritCalculator } from "@/components/merit/PublicMeritCalculator";
import { formatReviewedOn } from "@/lib/dated-claims";
import { getSiteUrl } from "@/lib/site";
import { ArrowRight, Calculator, ShieldCheck } from "lucide-react";

/**
 * The public aggregate calculator.
 *
 * It lives here because it was previously only at /dashboard/merit-estimator —
 * behind sign-in and inside the `/dashboard` path robots.txt disallows — so the
 * one tool students search for by name could never be crawled or used without an
 * account. The arithmetic is unchanged (lib/merit.ts); what is new is that the
 * weightage is cited instead of asserted, and the page refuses to publish the
 * college closing-merit table, whose sources are community-tracked rather than
 * official.
 */

const siteUrl = getSiteUrl();
const CHECKED_ON = "2026-11-28";

const REGULATIONS_URL =
  "https://pmdc.pk/Documents/law/PM%26DC%20(ADMISSIONS,%20CURRICULUM%20AND%20CONDUCT)%20POLICY%20AND%20REGULATIONS%202026.pdf";

export const metadata: Metadata = {
  title: "MDCAT Aggregate Calculator — PMDC 10 / 40 / 50 Formula",
  description:
    "Calculate your MDCAT aggregate from SSC, HSSC and MDCAT marks using PMDC's published 10% / 40% / 50% weightage — and see the MDCAT score a target aggregate needs. No account, no payment.",
  keywords: [
    "MDCAT aggregate calculator",
    "MDCAT merit calculator 2026",
    "MDCAT aggregate formula",
    "MDCAT merit formula",
    "aggregate calculator 2026 sindh",
  ],
  alternates: { canonical: "/merit-calculator" },
  openGraph: {
    type: "website",
    url: `${siteUrl}/merit-calculator`,
    title: "MDCAT Aggregate Calculator — PMDC 10 / 40 / 50 Formula",
    description:
      "Your MDCAT aggregate from SSC, HSSC and MDCAT marks, using PMDC's published weightage — plus the score a target aggregate needs.",
  },
};

export default function MeritCalculatorPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <div className="mb-8 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Calculator className="h-4 w-4" aria-hidden="true" />
            Public tool · no account needed
          </div>

          <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            MDCAT aggregate calculator
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Your medical admission aggregate is 10% SSC, 40% HSSC and 50% MDCAT. This page applies
            exactly that, shows each component&apos;s contribution, and solves it backwards for the
            MDCAT score a target aggregate would need.
          </p>

          <div className="mt-8">
            <PublicMeritCalculator />
          </div>

          {/* Source */}
          <section className="mt-10 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              Where the weightage comes from
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              PM&amp;DC&apos;s{" "}
              <a
                href={REGULATIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent hover:underline"
              >
                Admissions, Curriculum and Conduct Policy and Regulations 2026
              </a>{" "}
              (notified 12 October 2026) sets the merit weightage used here: 50% for the admission
              test, 40% for HSSC, 10% for SSC. The pass marks (55% MBBS, 50% BDS) and the 60% HSSC
              eligibility gate come from that regulation and from PM&amp;DC&apos;s{" "}
              <a
                href="https://pmdc.pk/Documents/Syllabus/Uniform%20Curriculum%20MDCAT-2025%20%20Final%20(26-05-2025).pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent hover:underline"
              >
                MDCAT curriculum
              </a>
              .
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Weightage and gates last checked against the PM&amp;DC documents on{" "}
              {formatReviewedOn(CHECKED_ON)}. If a later notification changes them, this page is
              wrong until it is updated — check the regulation before you rely on the number.
            </p>
          </section>

          {/* What it refuses to do */}
          <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-lg font-bold">What this page will not tell you</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Which college you will get into.</strong> Closing
                merits move every year with seat counts, quota rounds and the paper&apos;s difficulty.
                The college-wise bands in the signed-in dashboard are historical and community-tracked;
                they are not published here as if they were official cutoffs.
              </li>
              <li>
                <strong className="text-foreground">A predicted MDCAT score.</strong> Practice
                performance is not a score predictor, and nothing on this site pretends to be one.
              </li>
              <li>
                <strong className="text-foreground">Private-college or quota-specific merit.</strong>{" "}
                Each admitting university publishes its own criteria for those seats; read its
                prospectus.
              </li>
            </ul>
          </section>

          {/* Next steps */}
          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            <Link
              href="/syllabus/mdcat"
              className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent/50"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-accent">Syllabus</div>
              <div className="mt-1 font-bold">MDCAT pattern and weightage</div>
              <p className="mt-1 text-xs text-muted-foreground">
                180 MCQs, subject split, difficulty levels and pass marks — with the official source.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-accent">
                Read <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </span>
            </Link>
            <Link
              href="/practice/session"
              className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent/50"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-accent">Practice</div>
              <div className="mt-1 font-bold">Start a practice run</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Exam-style questions with an explanation behind every answer.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-accent">
                Practise <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </span>
            </Link>
            <Link
              href="/past-papers"
              className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent/50"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-accent">Papers</div>
              <div className="mt-1 font-bold">Released past papers</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Every paper labelled by how it relates to the real sitting, with which codes carry a key.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-accent">
                Browse <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </span>
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
