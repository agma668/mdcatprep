import { TrendingUp } from "lucide-react";
import type { AccuracyDataPoint } from "@/types/analytics";

const W = 600;
const H = 180;
const PAD = { top: 16, right: 16, bottom: 36, left: 40 };

function toSvgCoords(
  points: { accuracy: number }[],
  width: number,
  height: number,
  pad: typeof PAD
) {
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const minY = 40;
  const maxY = 100;

  return points.map((p, i) => {
    const x = pad.left + (i / (points.length - 1)) * innerW;
    const y = pad.top + innerH - ((p.accuracy - minY) / (maxY - minY)) * innerH;
    return { x, y, accuracy: p.accuracy };
  });
}

export function AccuracyTrendChart({ data }: { data: AccuracyDataPoint[] }) {
  const hasEnough = data.length >= 2;

  return (
    <div
      className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-6"
      role="region"
      aria-labelledby="accuracy-trend-title"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2
            id="accuracy-trend-title"
            className="text-base font-bold text-[var(--color-text-primary)]"
          >
            Accuracy Trend
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">Last 30 days</p>
        </div>
        {hasEnough && (
          <div className="text-right">
            <p className="text-2xl font-extrabold text-[var(--color-primary)]">
              {data[data.length - 1].accuracy}%
            </p>
            <p
              className={`text-xs font-semibold ${
                data[data.length - 1].accuracy >= data[0].accuracy
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-error)]"
              }`}
            >
              {data[data.length - 1].accuracy >= data[0].accuracy ? "↑" : "↓"}{" "}
              {Math.abs(data[data.length - 1].accuracy - data[0].accuracy)}pp vs 30d ago
            </p>
          </div>
        )}
      </div>

      {!hasEnough ? (
        <div className="py-10 text-center">
          <TrendingUp
            className="w-8 h-8 mx-auto mb-2 block text-[var(--color-text-muted)]"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            Not enough practice data yet
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm mx-auto">
            Answer questions on at least two days to see your accuracy trend here.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full min-w-[280px]"
            role="img"
            aria-label="Line chart showing accuracy trend over 30 days"
          >
            <defs>
              <linearGradient id="accuracy-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#0f4c2a" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            {[40, 55, 70, 85, 100].map((v) => {
              const y = PAD.top + (H - PAD.top - PAD.bottom) - ((v - 40) / (100 - 40)) * (H - PAD.top - PAD.bottom);
              return (
                <g key={v}>
                  <line
                    x1={PAD.left}
                    y1={y}
                    x2={W - PAD.right}
                    y2={y}
                    stroke="var(--color-border)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={PAD.left - 6}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="var(--color-text-muted)"
                  >
                    {v}%
                  </text>
                </g>
              );
            })}

            {/* X-axis labels (every 7th point) */}
            {data.filter((_, i) => i % 7 === 0).map((d, idx) => {
              const x = PAD.left + (idx * 7 / (data.length - 1)) * (W - PAD.left - PAD.right);
              return (
                <text
                  key={d.date}
                  x={x}
                  y={H - PAD.bottom + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--color-text-muted)"
                >
                  {d.date.slice(5)}
                </text>
              );
            })}

            {/* Area + line */}
            {(() => {
              const coords = toSvgCoords(data, W, H, PAD);
              const pathD = coords
                .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
                .join(" ");
              const areaD = [
                pathD,
                `L ${coords[coords.length - 1].x.toFixed(1)} ${(H - PAD.bottom).toFixed(1)}`,
                `L ${coords[0].x.toFixed(1)} ${(H - PAD.bottom).toFixed(1)}`,
                "Z",
              ].join(" ");
              return (
                <>
                  <path d={areaD} fill="url(#accuracy-gradient)" />
                  <path
                    d={pathD}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <circle
                    cx={coords[coords.length - 1].x}
                    cy={coords[coords.length - 1].y}
                    r="5"
                    fill="var(--color-primary)"
                    stroke="white"
                    strokeWidth="2"
                  />
                </>
              );
            })()}
          </svg>
        </div>
      )}
    </div>
  );
}
