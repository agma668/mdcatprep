import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { MeritEstimator } from "./MeritEstimator";
import {
  COLLEGE_MERITS,
  COLLEGE_UNIVERSITIES,
  ENTRY_TOTALS,
  PMDC_WEIGHTS,
} from "@/lib/merit";

export const metadata: Metadata = { title: "Merit Estimator" };

/**
 * Merit Estimator — aggregate + medical-college merit estimate.
 *
 * The "own name" for this feature (no competitor naming): the calculator
 * computes the PMDC aggregate and matches it honestly against sourced 2024
 * closing-merit bands. Server component loads the static data + renders the
 * interactive client calculator below.
 */
export default function MeritEstimatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <PageHeader
        eyebrow="Merit Estimator"
        title="Where does your aggregate stand?"
        description={
          <>
            Input your Matric / FSc / entry-test marks and we compute the
            PMDC aggregate, then match it honestly against last cycle&apos;s
            closing merits. The formula below is the published admission
            weightage — nothing invented.
          </>
        }
        actions={
          <span className="hidden items-center gap-1.5 rounded-md border border-[var(--color-primary)]/20 bg-[color:var(--color-primary)]/5 px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] md:inline-flex">
            <Calculator className="h-3.5 w-3.5" />
            {PMDC_WEIGHTS.matric * 100}% Matric · {PMDC_WEIGHTS.fsc * 100}% FSc ·{" "}
            {PMDC_WEIGHTS.entry * 100}% Entry
          </span>
        }
      />

      <MeritEstimator />

      {/* Honest, sourced reference table */}
      <section className="mt-12">
        <h2 className="mb-2 text-lg font-bold text-gradient-brand">
          Last cycle closing merits (reference)
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Historical 2024 figures used as an estimate, not a guarantee. Seat
          counts, quotas and provincial rounds move them every year.
        </p>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
            {COLLEGE_MERITS.map((c) => (
              <div
                key={`${c.university}-${c.college}`}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {c.college}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {COLLEGE_UNIVERSITIES[c.university]} · {c.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[var(--color-primary)]">
                    {c.closing2024.toFixed(1)}%
                  </p>
                  <p className="max-w-[160px] truncate text-[10px] text-muted-foreground">
                    {c.source}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>Entry-test totals for conversion:</span>
          {ENTRY_TOTALS.map((e) => (
            <span key={`${e.body}-${e.total}`} className="inline-flex items-center gap-1">
              {e.body} = {e.total} marks ({e.note})
            </span>
          ))}
          <Link
            href="/founder"
            className="inline-flex items-center gap-1 font-medium text-[var(--color-primary)] hover:underline"
          >
            Full methodology <ExternalLink className="h-3 w-3" />
          </Link>
        </p>
      </section>
    </div>
  );
}