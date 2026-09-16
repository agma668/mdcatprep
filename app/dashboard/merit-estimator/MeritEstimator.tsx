"use client";

import { useState } from "react";
import {
  CheckCircle2,
  MinusCircle,
  Gauge,
  TrendingUp,
  Info,
} from "lucide-react";
import {
  computeAggregate,
  classifyAggregate,
  matchColleges,
  requiredMDCAT,
  toPct,
  COLLEGE_MERITS,
  COLLEGE_UNIVERSITIES,
  ENTRY_TOTALS,
  PMDC_WEIGHTS,
} from "@/lib/merit";

/** Interactive Merit Estimator — client calculator over lib/merit.ts. */
export function MeritEstimator() {
  const [matric, setMatric] = useState("");
  const [matricTotal, setMatricTotal] = useState("1100");
  const [fsc, setFsc] = useState("");
  const [fscTotal, setFscTotal] = useState("1100");
  const [entryMode, setEntryMode] = useState<"pct" | "marks">("marks");
  const [entryTotal, setEntryTotal] = useState("200");
  const [entryPct, setEntryPct] = useState("");
  const [target, setTarget] = useState("90");
  const [computed, setComputed] = useState<{ aggregate: number; band: ReturnType<typeof classifyAggregate> } | null>(null);

  const matricPct = toPct(Number(matric), Number(matricTotal));
  const fscPct = toPct(Number(fsc), Number(fscTotal));
  const entryPctValue =
    entryMode === "marks"
      ? toPct(Number(entryPct), Number(entryTotal))
      : Number(entryPct);

  const run = () => {
    try {
      const aggregate = computeAggregate({ matricPct, fscPct, entryPct: entryPctValue });
      setComputed({ aggregate, band: classifyAggregate(aggregate) });
    } catch {
      setComputed(null);
    }
  };

  const reqTarget = requiredMDCAT(Number(target) || 0, matricPct || 0, fscPct || 0);
  const colleges = computed ? matchColleges(computed.aggregate) : null;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-2 md:p-6">
        {/* Left: inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-muted-foreground">
              Matric % (obtained)
              <input
                inputMode="decimal"
                value={matric}
                onChange={(e) => setMatric(e.target.value)}
                placeholder="e.g. 950 / 1100 → 86%"
                className="mt-1 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </label>
            <label className="text-xs font-semibold text-muted-foreground">
              Matric total
              <input
                inputMode="decimal"
                value={matricTotal}
                onChange={(e) => setMatricTotal(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-muted-foreground">
              FSc % (obtained)
              <input
                inputMode="decimal"
                value={fsc}
                onChange={(e) => setFsc(e.target.value)}
                placeholder="e.g. 1000 / 1100 → 91%"
                className="mt-1 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </label>
            <label className="text-xs font-semibold text-muted-foreground">
              FSc total
              <input
                inputMode="decimal"
                value={fscTotal}
                onChange={(e) => setFscTotal(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </label>
          </div>

          <div className="rounded-md border border-border bg-secondary/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Entry test</span>
              <div className="flex gap-1 rounded-md bg-secondary p-0.5">
                {(["marks", "pct"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setEntryMode(m)}
                    className={`rounded px-2 py-0.5 text-[11px] font-semibold transition ${
                      entryMode === m
                        ? "bg-[var(--color-primary)] text-[var(--field-0)]"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m === "marks" ? "Marks" : "%"}
                  </button>
                ))}
              </div>
            </div>
            <div className={`grid ${entryMode === "marks" ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
              <label className="text-xs font-semibold text-muted-foreground">
                {entryMode === "marks" ? "Obtained" : "Score %"}
                <input
                  inputMode="decimal"
                  value={entryPct}
                  onChange={(e) => setEntryPct(e.target.value)}
                  placeholder={entryMode === "marks" ? "e.g. 175 / 200" : "e.g. 87"}
                  className="mt-1 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </label>
              {entryMode === "marks" && (
                <label className="text-xs font-semibold text-muted-foreground">
                  Test total
                  <input
                    inputMode="decimal"
                    value={entryTotal}
                    onChange={(e) => setEntryTotal(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </label>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {ENTRY_TOTALS.map((e) => (
                <button
                  key={`${e.body}-${e.total}`}
                  type="button"
                  onClick={() => setEntryTotal(String(e.total))}
                  className="text-[11px] text-muted-foreground hover:text-[var(--color-primary)]"
                >
                  {e.body.split(" ")[0]} = {e.total}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={run}
            disabled={!matric || !fsc || !entryPct}
            className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
          >
            Calculate my aggregate
          </button>
        </div>

        {/* Right: result */}
        <div className="flex flex-col gap-4">
          {!computed ? (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-md border border-dashed border-border p-6 text-center">
              <Gauge className="mb-3 h-10 w-10 text-[var(--color-primary)]/40" />
              <p className="text-sm text-muted-foreground">
                Enter your marks above, then hit Calculate. You&apos;ll see your
                PMDC aggregate, its band, and which colleges are historically
                in range — with an honest caveat, never a false guarantee.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Aggregate
                  </p>
                  <p className="text-4xl font-extrabold text-gradient-brand">
                    {computed.aggregate.toFixed(2)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-muted-foreground">Band</p>
                  <span className="mt-1 inline-block rounded-md bg-[var(--color-primary)]/10 px-2 py-0.5 text-sm font-bold text-[var(--color-primary)]">
                    {computed.band.label}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{computed.band.reading}</p>

              <div className="rounded-md border border-border bg-secondary/30 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                  Historical reach
                </p>
                {colleges && colleges.reachable.length > 0 && (
                  <div className="mb-2">
                    <p className="mb-1 text-[11px] font-semibold text-emerald-500">
                      Probably within reach ({colleges.reachable.length})
                    </p>
                    <ul className="space-y-1">
                      {colleges.reachable.map((c) => (
                        <li key={c.college} className="flex items-center gap-1.5 text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          <span className="font-medium">{c.college}</span>
                          <span className="ml-auto text-muted-foreground">≤ {c.closing2024.toFixed(1)}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {colleges && colleges.close.length > 0 && (
                  <div>
                    <p className="mb-1 text-[11px] font-semibold text-amber-500">
                      Close to cutoff (±1 pt) — last year&apos;s luck matters
                    </p>
                    <ul className="space-y-1">
                      {colleges.close.map((c) => (
                        <li key={c.college} className="flex items-center gap-1.5 text-xs">
                          <MinusCircle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                          <span className="font-medium">{c.college}</span>
                          <span className="ml-auto text-muted-foreground">{c.closing2024.toFixed(1)}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {colleges && colleges.reachable.length === 0 && colleges.close.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Below this cycle&apos;s published range — stronger entry/FSc
                    scores push it up. See the MDCAT target below.
                  </p>
                )}
                <div className="mt-3 border-t border-border/60 pt-2">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                    <Info className="h-3 w-3" />
                    Historical estimate, not a guarantee. Quotas and rounds change yearly.
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-border bg-secondary/30 p-3">
                <p className="mb-2 text-xs font-bold text-foreground">
                  Entry-test needed for a {Number(target) || 0}% target
                </p>
                <p className="text-xl font-bold text-[var(--color-primary)]">
                  {reqTarget.toFixed(1)}%{" "}
                  <span className="text-xs font-medium text-muted-foreground">of entry-test</span>
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Given your Matric {matricPct.toFixed(0)}% + FSc {fscPct.toFixed(0)}%.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-sm font-semibold text-muted-foreground">Target %</label>
                  <input
                    inputMode="decimal"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-20 rounded-md border border-border bg-secondary/50 px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
        Formula: ({PMDC_WEIGHTS.matric * 100}% × Matric) + ({PMDC_WEIGHTS.fsc * 100}% × FSc) + (
        {PMDC_WEIGHTS.entry * 100}% × Entry). Weights per PMDC published admission policy. Band
        labels and college figures are historical references for planning — they are not an
        admission promise.
      </p>
    </div>
  );
}