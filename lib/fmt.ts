/**
 * Deterministic formatting — the ONE seam for numbers/dates rendered by
 * server components (Impeccable pass, 2026-09: the React #418 fix).
 *
 * WHY THIS EXISTS: bare `n.toLocaleString()` / `d.toLocaleTimeString()`
 * format with the AMBIENT locale — the server renders en-US (Node ICU), the
 * student's phone hydrates with its own locale (often ur-PK), and React 418s
 * on the differing text. Every formatter here pins locale + timeZone so the
 * server and every device produce byte-identical output. Rule: a server
 * component NEVER calls Intl APIs without a pinned locale — use these.
 */

/** Grouped integer, always en-US ("12,345") — safe for any device locale. */
export function fmtInt(n: number): string {
  return new Intl.NumberFormat("en-US").format(n)
}

/** "14:07 UTC" — pinned clock for "data as of" stamps. */
export function fmtUTCTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso
  return (
    d.toLocaleTimeString("en-GB", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
    }) + " UTC"
  )
}

/** "3 Sep 2026" — pinned date for tables/records (never ambiguous). */
export function fmtUTCDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso
  return d.toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
