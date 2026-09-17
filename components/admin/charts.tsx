import type { ReactNode } from "react";
import { fmtInt, fmtUTCDate, fmtUTCTime } from "@/lib/fmt";

/**
 * Dependency-free SVG chart primitives for the admin analytics page — the
 * house pattern (no chart libraries per board rules). All components are
 * pure server renders: no client JS, no hydration surface, and they print
 * fine if an admin ever prints the page.
 */

/** Rounds a max to a nice ceiling so the y-axis isn't "37.4". */
function niceMax(v: number): number {
  if (v <= 5) return 5;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const unit = v / pow;
  const niceUnit = unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10;
  return niceUnit * pow;
}

function shortDay(iso: string): string {
  // "2026-09-16" → "Sep 16" without pulling a date library.
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[(m ?? 1) - 1]} ${d ?? 1}`;
}

export interface DayPoint {
  day: string;
  views: number;
  signups: number;
}

/**
 * The traffic graph: daily page views as a line + soft area fill, with the
 * daily signups overlaid as amber dots (a signup is rare enough that a dot
 * reads better than a second line). Grid lines, min/max/last annotations.
 */
export function LineAreaChart({ data }: { data: DayPoint[] }) {
  const W = 720;
  const H = 240;
  const PAD_L = 34;
  const PAD_R = 10;
  const PAD_T = 14;
  const PAD_B = 24;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const maxViews = Math.max(...data.map((d) => d.views), 1);
  const ceiling = niceMax(maxViews);
  const x = (i: number) => PAD_L + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => PAD_T + innerH - (v / ceiling) * innerH;

  const linePts = data.map((d, i) => `${x(i).toFixed(1)},${y(d.views).toFixed(1)}`).join(" ");
  const areaPts = `${PAD_L},${y(0)} ${linePts} ${x(data.length - 1).toFixed(1)},${y(0)}`;

  const maxIdx = data.reduce((m, d, i) => (d.views > data[m].views ? i : m), 0);
  const lastIdx = data.length - 1;
  const gridVals = [ceiling, ceiling / 2, 0];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label={`Daily page views over the last ${data.length} days, peak ${data[maxIdx]?.views ?? 0}`}
    >
      {gridVals.map((gv) => (
        <g key={gv}>
          <line x1={PAD_L} x2={W - PAD_R} y1={y(gv)} y2={y(gv)} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          <text x={PAD_L - 6} y={y(gv) + 3} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.35)">
            {gv}
          </text>
        </g>
      ))}

      <polygon points={areaPts} fill="url(#viewsFill)" />
      <polyline points={linePts} fill="none" stroke="var(--color-primary-light, #93c5fd)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {data.map((d, i) =>
        d.signups > 0 ? (
          <circle key={d.day} cx={x(i)} cy={y(d.views)} r={3} fill="#fbbf24" stroke="rgba(0,0,0,0.4)" strokeWidth="1">
            <title>{`${shortDay(d.day)}: ${d.views} views · ${d.signups} signups`}</title>
          </circle>
        ) : null
      )}

      {/* Peak and latest annotations — the two numbers an admin actually asks for. */}
      <circle cx={x(maxIdx)} cy={y(data[maxIdx]?.views ?? 0)} r={3} fill="var(--color-primary-light, #93c5fd)" />
      <text x={x(maxIdx)} y={Math.max(y(data[maxIdx]?.views ?? 0) - 8, 10)} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.55)">
        peak {data[maxIdx]?.views ?? 0}
      </text>
      <circle cx={x(lastIdx)} cy={y(data[lastIdx]?.views ?? 0)} r={3} fill="var(--color-primary-light, #93c5fd)" />
      <text x={x(lastIdx) - 4} y={Math.max(y(data[lastIdx]?.views ?? 0) - 8, 10)} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.55)">
        {data[lastIdx]?.views ?? 0}
      </text>

      {[0, Math.floor(data.length / 2), lastIdx].map((i) => (
        <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === lastIdx ? "end" : "middle"} fontSize="9" fill="rgba(255,255,255,0.35)">
          {shortDay(data[i]?.day ?? "")}
        </text>
      ))}

      <defs>
        <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary-light, #93c5fd)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--color-primary-light, #93c5fd)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Labelled share bars — top pages, CTA clicks. Same anatomy as the admin
 *  dashboard's "By subject" rows, so the two pages read as one system. */
export function BarList({ items, unit }: { items: { name: string; count: number }[]; unit?: string }) {
  const max = Math.max(...items.map((i) => i.count), 1);
  if (items.length === 0) {
    return <p className="text-sm text-white/40">No data yet — telemetry rows land as students visit.</p>;
  }
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.name}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-white/75" title={item.name}>
              {item.name}
            </span>
            <span className="shrink-0 tabular-nums text-white/45">
              {fmtInt(item.count)}
              {unit ? ` ${unit}` : ""}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-primary)]/70"
              style={{ width: `${Math.max((item.count / max) * 100, 2)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Green/red/neutral % change vs the previous window. */
export function DeltaChip({ current, previous }: { current: number | null; previous: number | null }) {
  if (current === null || previous === null || previous === 0) {
    return <span className="text-[10px] text-white/45">— vs prev 30d</span>;
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;
  return (
    <span className={`text-[10px] font-semibold ${up ? "text-[var(--color-success)]" : "text-rose-400"}`}>
      {up ? "▲" : "▼"} {Math.abs(pct)}% vs prev 30d
    </span>
  );
}

export function Panel({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <section className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {sub ? <p className="text-xs text-white/40 mt-0.5">{sub}</p> : null}
      </div>
      {children}
    </section>
  );
}
