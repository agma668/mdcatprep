"use client";

import { useMemo, useState } from "react";
import {
  classifyAggregate,
  computeAggregate,
  ENTRY_TOTALS,
  PMDC_WEIGHTS,
  requiredMDCAT,
  toPct,
} from "@/lib/merit";

/**
 * The public aggregate calculator.
 *
 * Why this is a separate component from the dashboard estimator: that one
 * shipped a hardcoded "Safe Merit Benchmark — 90%+ for King Edward / AKU",
 * which is a prediction with no source behind it. This one shows only what the
 * regulation says: the three weights, the arithmetic, the two eligibility gates
 * and the score a given target would require. Nothing here is a guarantee, and
 * the page says so.
 *
 * All the maths lives in lib/merit.ts (pure, already relied on by the dashboard
 * and by the required-score helper); this file is input state and formatting.
 */

const num = (v: string) => (v.trim() === "" ? NaN : Number(v));

function fmt(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

export function PublicMeritCalculator() {
  const [matric, setMatric] = useState("1050");
  const [matricTotal, setMatricTotal] = useState("1100");
  const [hssc, setHssc] = useState("980");
  const [hsscTotal, setHsscTotal] = useState("1100");
  const [entry, setEntry] = useState("150");
  const [entryTotal, setEntryTotal] = useState("200");
  const [target, setTarget] = useState("90");

  const values = useMemo(() => {
    const matricPct = toPct(num(matric), num(matricTotal));
    const hsscPct = toPct(num(hssc), num(hsscTotal));
    const entryPct = toPct(num(entry), num(entryTotal));
    const complete =
      Number.isFinite(matricPct) &&
      Number.isFinite(hsscPct) &&
      Number.isFinite(entryPct) &&
      num(matricTotal) > 0 &&
      num(hsscTotal) > 0 &&
      num(entryTotal) > 0 &&
      [matric, hssc, entry].every((v) => v.trim() !== "");
    return { matricPct, hsscPct, entryPct, complete };
  }, [matric, matricTotal, hssc, hsscTotal, entry, entryTotal]);

  const aggregate = values.complete
    ? computeAggregate({
        matricPct: values.matricPct,
        fscPct: values.hsscPct,
        entryPct: values.entryPct,
      })
    : null;

  const band = aggregate === null ? null : classifyAggregate(aggregate);

  /**
   * The highest aggregate these matric/HSSC marks can reach, i.e. with a
   * perfect entry test. Used to refuse the "you need 100% MDCAT" output when
   * the target is arithmetically impossible.
   */
  const ceiling =
    values.complete && values.matricPct >= 0 && values.hsscPct >= 0
      ? values.matricPct * PMDC_WEIGHTS.matric +
        values.hsscPct * PMDC_WEIGHTS.fsc +
        100 * PMDC_WEIGHTS.entry
      : null;

  const targetNum = num(target);
  const needed =
    values.complete && Number.isFinite(targetNum) && targetNum >= 0 && targetNum <= 100
      ? requiredMDCAT(targetNum, values.matricPct, values.hsscPct)
      : null;
  const reachable = ceiling !== null && Number.isFinite(targetNum) ? targetNum <= ceiling + 0.005 : false;

  const hsscGate = values.complete ? values.hsscPct >= 60 : null;
  const mdcatPassMbbs = values.complete ? values.entryPct >= 55 : null;
  const mdcatPassBds = values.complete ? values.entryPct >= 50 : null;

  const field =
    "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-accent";
  const label = "block text-xs font-semibold text-muted-foreground mb-1";

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Inputs */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-lg font-bold">Your marks</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Enter marks as printed on your result card. Totals are yours to set — boards differ.
          </p>

          <div className="mt-5 space-y-5">
            <fieldset>
              <legend className="text-sm font-bold">Matric / SSC (10% weight)</legend>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <label className={label} htmlFor="matric-obtained">
                    Obtained
                  </label>
                  <input
                    id="matric-obtained"
                    className={field}
                    type="number"
                    inputMode="numeric"
                    value={matric}
                    onChange={(e) => setMatric(e.target.value)}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="matric-total">
                    Total
                  </label>
                  <input
                    id="matric-total"
                    className={field}
                    type="number"
                    inputMode="numeric"
                    value={matricTotal}
                    onChange={(e) => setMatricTotal(e.target.value)}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-bold">FSc / HSSC pre-medical (40% weight)</legend>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <label className={label} htmlFor="hssc-obtained">
                    Obtained
                  </label>
                  <input
                    id="hssc-obtained"
                    className={field}
                    type="number"
                    inputMode="numeric"
                    value={hssc}
                    onChange={(e) => setHssc(e.target.value)}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="hssc-total">
                    Total
                  </label>
                  <input
                    id="hssc-total"
                    className={field}
                    type="number"
                    inputMode="numeric"
                    value={hsscTotal}
                    onChange={(e) => setHsscTotal(e.target.value)}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-bold">MDCAT (50% weight)</legend>
              <div className="mt-2 grid grid-cols-[1fr_9rem] gap-3">
                <div>
                  <label className={label} htmlFor="entry-obtained">
                    Obtained
                  </label>
                  <input
                    id="entry-obtained"
                    className={field}
                    type="number"
                    inputMode="numeric"
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="entry-total">
                    Out of
                  </label>
                  <input
                    id="entry-total"
                    className={field}
                    type="number"
                    inputMode="numeric"
                    value={entryTotal}
                    onChange={(e) => setEntryTotal(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {ENTRY_TOTALS.map((t) => (
                  <button
                    key={`${t.body}-${t.total}`}
                    type="button"
                    onClick={() => setEntryTotal(String(t.total))}
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
                      entryTotal === String(t.total)
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.total} marks · {t.note}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        {/* Result */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-lg font-bold">Aggregate</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {fmt(PMDC_WEIGHTS.matric * 100, 0)}% SSC + {fmt(PMDC_WEIGHTS.fsc * 100, 0)}% HSSC +{" "}
            {fmt(PMDC_WEIGHTS.entry * 100, 0)}% MDCAT
          </p>

          <div className="mt-4 rounded-xl bg-background p-4 text-center">
            <div className="text-4xl font-extrabold tabular-nums text-accent">
              {aggregate === null ? "—" : `${fmt(aggregate)}%`}
            </div>
            <div className="mt-1 text-xs font-semibold text-muted-foreground">
              {band ? band.label : "Fill in all three marks"}
            </div>
          </div>

          {band && aggregate !== null && (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{band.reading}</p>
          )}

          <dl className="mt-5 space-y-2 text-xs">
            <div className="flex items-baseline justify-between gap-3 border-t border-border/60 pt-2">
              <dt className="text-muted-foreground">SSC contribution</dt>
              <dd className="font-bold tabular-nums">
                {values.complete ? `${fmt(values.matricPct * PMDC_WEIGHTS.matric)} pts` : "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">HSSC contribution</dt>
              <dd className="font-bold tabular-nums">
                {values.complete ? `${fmt(values.hsscPct * PMDC_WEIGHTS.fsc)} pts` : "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">MDCAT contribution</dt>
              <dd className="font-bold tabular-nums">
                {values.complete ? `${fmt(values.entryPct * PMDC_WEIGHTS.entry)} pts` : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Reverse calculation */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-bold">What MDCAT score do I need?</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Set a target aggregate. The answer is the MDCAT percentage your current SSC and HSSC marks
          would need to reach it — the same formula solved backwards.
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div className="w-40">
            <label className={label} htmlFor="target-aggregate">
              Target aggregate %
            </label>
            <input
              id="target-aggregate"
              className={field}
              type="number"
              inputMode="decimal"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <div className="text-sm">
            {needed === null ? (
              <span className="text-muted-foreground">Enter all three marks above.</span>
            ) : !reachable ? (
              <span className="font-semibold text-amber-500">
                Not reachable — even 100% in MDCAT tops out at {fmt(ceiling ?? 0)}% with these marks.
              </span>
            ) : (
              <span>
                You need{" "}
                <strong className="tabular-nums text-accent">
                  {fmt(needed)}% ({fmt((needed / 100) * num(entryTotal), 0)} marks)
                </strong>{" "}
                in MDCAT.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Eligibility gates */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-bold">Eligibility gates</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Merit is calculated only after these are cleared. They are separate from the aggregate
          and cannot be compensated by a higher MDCAT score.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex items-start justify-between gap-3 border-b border-border/60 pb-2">
            <span>HSSC / FSc at least 60%</span>
            <span className={`font-bold ${hsscGate === null ? "text-muted-foreground" : hsscGate ? "text-emerald-500" : "text-red-500"}`}>
              {hsscGate === null ? "—" : hsscGate ? "met" : `${fmt(values.hsscPct, 1)}%`}
            </span>
          </li>
          <li className="flex items-start justify-between gap-3 border-b border-border/60 pb-2">
            <span>MDCAT at least 55% for MBBS</span>
            <span className={`font-bold ${mdcatPassMbbs === null ? "text-muted-foreground" : mdcatPassMbbs ? "text-emerald-500" : "text-red-500"}`}>
              {mdcatPassMbbs === null ? "—" : mdcatPassMbbs ? "met" : `${fmt(values.entryPct, 1)}%`}
            </span>
          </li>
          <li className="flex items-start justify-between gap-3">
            <span>MDCAT at least 50% for BDS</span>
            <span className={`font-bold ${mdcatPassBds === null ? "text-muted-foreground" : mdcatPassBds ? "text-emerald-500" : "text-red-500"}`}>
              {mdcatPassBds === null ? "—" : mdcatPassBds ? "met" : `${fmt(values.entryPct, 1)}%`}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
