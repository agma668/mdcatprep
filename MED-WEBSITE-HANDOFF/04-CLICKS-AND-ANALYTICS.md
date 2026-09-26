# 04 — CLICKS, VIEWS & ANALYTICS (the complete stack)

This is the "admin panel + views on website clicks" system, end to end.
Privacy-first: opt-out-able, batched, no IPs/user-agents, no PII, fire-and-forget
(telemetry must never throw into the app or delay navigation).

```
components/Telemetry.tsx        (client bootstrap: route views + global errors)
lib/telemetry.ts                (client helpers: queue, debounce, opt-out)
components/TrackedLink.tsx      (<Link> that reports cta_click — file 03)
app/api/telemetry/route.ts      (POST endpoint, service-role insert, validation)
supabase/migrations/...client_telemetry.sql  (the table)
lib/admin-analytics.ts          (30-day aggregation queries)
app/admin/analytics/page.tsx    (the dashboard: KPIs, chart, bar lists)
components/admin/charts.tsx     (LineAreaChart, BarList, DeltaChip, Panel)
```

## 1. The DB table

```sql
-- supabase/migrations/<ts>_client_telemetry.sql
create table if not exists public.client_telemetry (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users (id) on delete cascade, -- NULL = anonymous
  type text not null check (type in ('page_view', 'event', 'error')),
  name text not null,
  url text,
  message text,
  stack text,
  meta jsonb not null default '{}'::jsonb
);
alter table public.client_telemetry enable row level security;
-- No public insert policy: clients never touch this table directly; only the
-- service role writes via the API route. This kills the spam surface.
create index if not exists client_telemetry_created_at_idx on public.client_telemetry (created_at desc);
create index if not exists client_telemetry_type_idx on public.client_telemetry (type, created_at desc);
```

## 2. `lib/telemetry.ts` — client helpers (complete)

```ts
// Privacy-first: batched + debounced; dropped when offline, opted out, or in
// reduced-data mode; failures never surface to the UI.
const ENDPOINT = "/api/telemetry";
export const TELEMETRY_OPT_OUT_KEY = "ccp-telemetry-opt-out"; // rename for MED

type TelemetryType = "page_view" | "event" | "error";
interface Pending { type: TelemetryType; name: string; url?: string; message?: string; stack?: string; meta?: Record<string, unknown>; }

let queue: Pending[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let lastPageViewPath = "";

function optedOut(): boolean {
  try { return localStorage.getItem(TELEMETRY_OPT_OUT_KEY) === "1"; } catch { return false; }
}
function reducedData(): boolean {
  try { return window.matchMedia("(prefers-reduced-data: reduce)").matches; } catch { return false; }
}
function push(item: Pending) {
  if (optedOut() || reducedData()) return;
  queue.push(item);
  if (timer === null) {
    timer = setTimeout(() => {           // a burst becomes ONE request
      timer = null;
      const batch = queue; queue = [];
      if (batch.length === 0 || typeof navigator === "undefined" || !navigator.onLine) return;
      try {
        fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(batch), keepalive: true }).catch(() => {});
      } catch { /* ignore */ }
    }, 1200);
  }
}

export function trackEvent(name: string, meta?: Record<string, unknown>) {
  if (!name || name.length > 80) return;
  push({ type: "event", name, meta });
}
export function trackPageView(path: string) {
  if (!path || path === lastPageViewPath) return;   // dedupe rapid re-views
  lastPageViewPath = path;
  push({ type: "page_view", name: "page_view", url: path.slice(0, 500) });
}
export function trackError(error: unknown, context?: string) {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown client error";
  push({
    type: "error", name: context ? `client_error:${context}` : "client_error",
    message: (message || "Unknown").slice(0, 4000),
    stack: (error instanceof Error ? error.stack || "" : "").slice(0, 8000),
    url: typeof window !== "undefined" ? window.location.pathname : undefined,
  });
}
```

## 3. `components/Telemetry.tsx` — bootstrap (mount once in layout)

```tsx
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackError, trackPageView } from "@/lib/telemetry";

export function Telemetry() {
  const pathname = usePathname();
  useEffect(() => {
    const onError = (event: ErrorEvent) => trackError(event.error ?? event.message, "window");
    const onRejection = (event: PromiseRejectionEvent) => trackError(event.reason, "unhandledrejection");
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => { window.removeEventListener("error", onError); window.removeEventListener("unhandledrejection", onRejection); };
  }, []);
  useEffect(() => {
    // Fire after hydration + a delay so SSR isn't double-counted.
    const id = window.setTimeout(() => trackPageView(pathname || "/"), 1500);
    return () => window.clearTimeout(id);
  }, [pathname]);
  return null;
}
```

## 4. `app/api/telemetry/route.ts` — the write endpoint (complete)

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMITS = { name: 80, url: 500, message: 4000, stack: 8000, batch: 50 };

export async function POST(request: Request) {
  let body: Array<{ type?: unknown; name?: unknown; url?: unknown; message?: unknown; stack?: unknown; meta?: unknown }>;
  try { body = await request.json(); } catch { return new NextResponse("Bad JSON", { status: 400 }); }
  if (!Array.isArray(body) || body.length === 0 || body.length > LIMITS.batch)
    return new NextResponse("Expected a non-empty batch", { status: 400 });

  // Attribute to the signed-in user when there is one (nullable).
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch { /* never break telemetry */ }

  const rows = [];
  for (const item of body) {
    const type = item.type;
    if (type !== "page_view" && type !== "event" && type !== "error") continue;
    const name = typeof item.name === "string" ? item.name.trim().slice(0, LIMITS.name) : "";
    if (!name) continue;
    const url = typeof item.url === "string" && item.url.startsWith("/") ? item.url.slice(0, LIMITS.url) : null;
    const message = typeof item.message === "string" && item.message.trim() ? item.message.slice(0, LIMITS.message) : null;
    const stack = typeof item.stack === "string" && item.stack.trim() ? item.stack.slice(0, LIMITS.stack) : null;
    let meta: Record<string, unknown> = {};
    if (item.meta && typeof item.meta === "object") {
      try { if (JSON.stringify(item.meta).length <= 2000) meta = item.meta as Record<string, unknown>; } catch {}
    }
    rows.push({ user_id: userId, type, name, url, message, stack, meta });
  }
  if (rows.length === 0) return new NextResponse("Nothing to store", { status: 400 });

  try {
    const service = createServiceClient();
    const { error } = await service.from("client_telemetry").insert(rows);
    if (error) return new NextResponse("Storage failed", { status: 500 });
  } catch { return new NextResponse("Storage unavailable", { status: 503 }); }
  return new NextResponse(null, { status: 204 });
}
```

## 5. The admin analytics page — what it shows

`app/admin/analytics/page.tsx` (guard: signed-in admin via `isAdminEmail`, else
`redirect('/dashboard')`; `export const dynamic = 'force-dynamic'`):

- **KPI row** — Page views · 30 days (with Δ vs previous 30), CTA clicks · 30
  days, Signups · 30 days, Signed-in visitors · 7 days. Icons: Eye,
  MousePointerClick, UserPlus, Users. Values render `—` on query failure —
  **never a fabricated zero**.
- **Daily traffic** — `LineAreaChart` of views/day (UTC) with signup days
  marked amber.
- **Top pages** — `BarList` of where views landed.
- **Click events** — `BarList` of `cta_click` events by `label`/`to` — this is
  the "views on website clicks" surface, fed by TrackedLink.
- **Client errors (7d)** — grouped by message+page with ×count chips; a clean
  window renders an explicit "No client errors" state.
- **Honesty footer** — states the counts are floors not censuses (students can
  opt out), anonymous visitors carry no identity, UTC windows.

The aggregation (`lib/admin-analytics.ts` `getTrafficAnalytics()`) queries the
table over the two 30-day windows, dedupes pages, groups `name='cta_click'`
events by `meta->>'label'`, and returns `{ series, topPages, ctaEvents,
errors7d, views30, viewsPrev30, signups30, signupsPrev30, signedInVisitors7d,
lastEventAt }`. Demo accounts are excluded everywhere by `demo.ts` identity
rules.

## 6. `components/admin/charts.tsx` — dependency-free charts

Hand-rolled SVG (no chart library): `LineAreaChart` (sparkline-style area with
gradient fill + hover dots), `BarList` (label + bar + count rows, top-N),
`DeltaChip` (▲/▼ % vs previous window, muted when previous is null), `Panel`
(titled card wrapper). Copy from the cadet repo — no deps to install.

## 7. Instrumentation adoption checklist

1. Mount `<Telemetry />` once in `app/layout.tsx`.
2. Swap CTA `<Link>`s to `<TrackedLink label="…">` — start with: hero primary,
   navbar desktop + mobile signup, WhatsApp buttons, notes cards, blog CTAs.
3. Add `trackEvent()` calls at product moments: `signup_started`,
   `diagnostic_completed`, `practice_session_complete`, `mock_started`.
4. Verify: click around, then check the table (30–40s debounce) and the admin
   analytics page.
5. Add an opt-out toggle in profile privacy settings writing
   `localStorage[TELEMETRY_OPT_OUT_KEY] = "1"`.
