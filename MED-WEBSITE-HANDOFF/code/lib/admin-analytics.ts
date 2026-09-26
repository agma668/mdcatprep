import { createServiceClient } from "@/lib/supabase/service";
import { DEMO_EMAIL_SUFFIX } from "@/lib/demo";

/**
 * The traffic/engagement analytics seam for /admin/analytics — the one data
 * source the traffic page reads. Everything comes from the site's own
 * privacy-first telemetry table (client_telemetry: page_view / event /
 * error rows written server-side by /api/telemetry) plus profiles.created_at
 * for signups. No third-party analytics: the numbers here are the same events
 * the site itself records, so the page can never show a number the product
 * did not actually produce.
 *
 * Every query is bounded (window + limit) and fails SOFT: a failed query
 * yields null/empty and the card renders an em dash, never a fabricated zero.
 * The window is UTC days — good enough for trend-reading, and stated as such
 * on the page. Demo accounts are excluded from signup counts.
 */

export type Num = number | null;

export interface DayPoint {
  day: string; // YYYY-MM-DD (UTC)
  views: number;
  signups: number;
}

export interface NamedCount {
  name: string;
  count: number;
}

export interface ErrorReport {
  day: string;
  message: string;
  page: string | null;
  count: number;
}

export interface TrafficAnalytics {
  /** Page views + signups per day, last 30 days (oldest first), zero-filled. */
  series: DayPoint[];
  /** Page views, last 30 days. */
  views30: Num;
  /** Page views the 30 days BEFORE that — for the delta chip. */
  viewsPrev30: Num;
  /** Top pages by views, last 30 days (query strings stripped). */
  topPages: NamedCount[];
  /** Tracked CTA/product events, last 30 days, by event name (ctas labelled). */
  ctaEvents: NamedCount[];
  /** Signups (non-demo profiles created), last 30 days. */
  signups30: Num;
  signupsPrev30: Num;
  /** Distinct signed-in visitors seen in the last 7 days (honest limitation:
   *  anonymous visitors carry no id and are NOT counted — the page says so). */
  signedInVisitors7d: Num;
  /** Client error reports, last 7 days, grouped by message+page, top 6. */
  errors7d: ErrorReport[];
  errors7dTotal: Num;
  /** When the freshest telemetry row was written (null = never/empty). */
  lastEventAt: string | null;
}

const DAY_MS = 86_400_000;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Zero-filled UTC day series covering the last `days` days through today. */
function emptySeries(days: number): DayPoint[] {
  const out: DayPoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    out.push({ day: dayKey(new Date(today.getTime() - i * DAY_MS)), views: 0, signups: 0 });
  }
  return out;
}

export async function getTrafficAnalytics(): Promise<TrafficAnalytics | null> {
  let service: ReturnType<typeof createServiceClient>;
  try {
    service = createServiceClient();
  } catch {
    // Missing env (local build/prerender) — fail open to honest empties.
    return null;
  }

  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * DAY_MS).toISOString();
  const sincePrev30 = new Date(now.getTime() - 60 * DAY_MS).toISOString();
  const since7 = new Date(now.getTime() - 7 * DAY_MS).toISOString();

  const series = emptySeries(30);
  const seriesIdx = new Map(series.map((p, i) => [p.day, i]));

  try {
    // 1. Page views, last 30 days (bounded fetch, grouped in JS).
    const views = await service
      .from("client_telemetry")
      .select("created_at, url")
      .eq("type", "page_view")
      .gte("created_at", since30)
      .order("created_at", { ascending: false })
      .limit(20000);

    const topPages = new Map<string, number>();
    if (!views.error && views.data) {
      for (const row of views.data) {
        const day = dayKey(new Date(row.created_at));
        const idx = seriesIdx.get(day);
        if (idx !== undefined) series[idx].views += 1;
        const url = (row.url ?? "/").split("?")[0] || "/";
        topPages.set(url, (topPages.get(url) ?? 0) + 1);
      }
    }

    // 2. Previous window + 7-day signed-in visitors (count-only, no payload).
    const [{ count: prev30 }, { count: signupsPrev }, { count: signedIn7 }] = await Promise.all([
      service
        .from("client_telemetry")
        .select("id", { count: "exact", head: true })
        .eq("type", "page_view")
        .gte("created_at", sincePrev30)
        .lt("created_at", since30),
      service
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sincePrev30)
        .lt("created_at", since30)
        .not("email", "ilike", `%${DEMO_EMAIL_SUFFIX}%`),
      service
        .from("client_telemetry")
        .select("user_id", { count: "exact", head: true })
        .eq("type", "page_view")
        .gte("created_at", since7)
        .not("user_id", "is", null),
    ]);

    // 3. Signups per day (non-demo profiles), last 30 days.
    const signups = await service
      .from("profiles")
      .select("created_at")
      .gte("created_at", since30)
      .not("email", "ilike", `%${DEMO_EMAIL_SUFFIX}%`)
      .order("created_at", { ascending: false })
      .limit(5000);

    if (!signups.error && signups.data) {
      for (const row of signups.data) {
        const idx = seriesIdx.get(dayKey(new Date(row.created_at)));
        if (idx !== undefined) series[idx].signups += 1;
      }
    }

    // 4. CTA / product events, last 30 days, grouped by name (cta_click rows
    //    carry their destination in meta.to and are labelled per destination).
    const events = await service
      .from("client_telemetry")
      .select("name, meta")
      .eq("type", "event")
      .gte("created_at", since30)
      .limit(5000);

    const eventCounts = new Map<string, number>();
    if (!events.error && events.data) {
      for (const row of events.data) {
        const meta = row.meta as Record<string, unknown> | null;
        const label =
          row.name === "cta_click" && meta && typeof meta === "object" && "to" in meta
            ? `CTA → ${String(meta.to)}`
            : row.name;
        eventCounts.set(label, (eventCounts.get(label) ?? 0) + 1);
      }
    }

    // 5. Client errors, last 7 days, grouped by message+page, top 6.
    const errors = await service
      .from("client_telemetry")
      .select("created_at, message, url")
      .eq("type", "error")
      .gte("created_at", since7)
      .order("created_at", { ascending: false })
      .limit(1000);

    const errorGroups = new Map<string, ErrorReport>();
    let errorsTotal = 0;
    if (!errors.error && errors.data) {
      for (const row of errors.data) {
        errorsTotal += 1;
        const msg = (row.message ?? "Unknown").slice(0, 120);
        const key = `${msg}::${row.url ?? ""}`;
        const existing = errorGroups.get(key);
        if (existing) existing.count += 1;
        else
          errorGroups.set(key, {
            day: dayKey(new Date(row.created_at)),
            message: msg,
            page: row.url ?? null,
            count: 1,
          });
      }
    }

    // 6. Freshest telemetry row — shows whether telemetry is flowing at all.
    const latest = await service
      .from("client_telemetry")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1);

    return {
      series,
      views30: views.error ? null : views.data?.length ?? 0,
      viewsPrev30: prev30 ?? null,
      topPages: [...topPages.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count })),
      ctaEvents: [...eventCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count })),
      signups30: signups.error ? null : signups.data?.length ?? 0,
      signupsPrev30: signupsPrev ?? null,
      signedInVisitors7d: signedIn7 ?? null,
      errors7d: [...errorGroups.values()].sort((a, b) => b.count - a.count).slice(0, 6),
      errors7dTotal: errors.error ? null : errorsTotal,
      lastEventAt: latest.error ? null : latest.data?.[0]?.created_at ?? null,
    };
  } catch {
    // A stalled/unreachable DB must never take the admin page down.
    return null;
  }
}
