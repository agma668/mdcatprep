import { Clock } from "lucide-react";

/**
 * Format an ISO timestamp as "Updated [human date] at [human time] UTC" — the
 * one place every public number gets its honesty stamp. Use near any stat
 * that came from a live query so a visitor can tell when the figure was
 * computed (the page is revalidated every 60 s in production — see
 * `app/page.tsx`'s `revalidate`).
 */
export function formatStatsAsOf(asOf: string): string {
  const d = new Date(asOf);
  if (Number.isNaN(d.getTime())) return "Updated recently";
  const date = d.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  });
  return `Updated ${date} at ${time} UTC`;
}

export function StatsAsOf({
  asOf,
  className = "",
}: {
  asOf: string;
  className?: string;
}) {
  return (
    <p
      className={
        // 11px steel rather than 10px caps at 40% white: the tracked-out
        // uppercase treatment read as a decorative label, and this line is
        // meant to be read — it is the provenance of every number near it.
        "inline-flex items-center gap-1.5 text-[11px] text-[var(--steel-400)] " +
        className
      }
    >
      <Clock aria-hidden="true" className="h-3 w-3" />
      <span>{formatStatsAsOf(asOf)}</span>
    </p>
  );
}
