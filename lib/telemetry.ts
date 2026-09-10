// Client telemetry helpers — privacy-first by design:
//   - Nothing is sent unless the user opts in (opt-out key below, default off
//     is NOT used: telemetry is on by default but tiny and easy to switch off
//     from Profile → Privacy; error reports only ever carry url + message +
//     stack, never inputs).
//   - Batched and debounced; dropped entirely when offline, when the user has
//     opted out, or when they signal reduced-data mode.
//   - Fire-and-forget: failures never surface to the UI.

const ENDPOINT = "/api/telemetry";
export const TELEMETRY_OPT_OUT_KEY = "ccp-telemetry-opt-out";

type TelemetryType = "page_view" | "event" | "error";

interface Pending {
  type: TelemetryType;
  name: string;
  url?: string;
  message?: string;
  stack?: string;
  meta?: Record<string, unknown>;
}

let queue: Pending[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let lastPageViewPath = "";

function optedOut(): boolean {
  try {
    return localStorage.getItem(TELEMETRY_OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

function reducedData(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-data: reduce)").matches;
  } catch {
    return false;
  }
}

function push(item: Pending) {
  if (optedOut() || reducedData()) return;
  queue.push(item);
  if (timer === null) {
    // Debounce so a burst of events becomes one request.
    timer = setTimeout(() => {
      timer = null;
      const batch = queue;
      queue = [];
      if (batch.length === 0 || typeof navigator === "undefined" || !navigator.onLine) return;
      const body = JSON.stringify(batch);
      try {
        fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {
          /* telemetry must never throw into the app */
        });
      } catch {
        /* ignore */
      }
    }, 1200);
  }
}

/** Record a named product event (e.g. "signup_started"). */
export function trackEvent(name: string, meta?: Record<string, unknown>) {
  if (!name || name.length > 80) return;
  push({ type: "event", name, meta });
}

/** Report a page view. Deduplicates rapid re-views of the same path. */
export function trackPageView(path: string) {
  if (!path || path === lastPageViewPath) return;
  lastPageViewPath = path;
  push({ type: "page_view", name: "page_view", url: path.length > 500 ? path.slice(0, 500) : path });
}

/** Report a client-side error (window.onerror / unhandledrejection / error UI). */
export function trackError(error: unknown, context?: string) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown client error";
  const stack = error instanceof Error ? error.stack : undefined;
  push({
    type: "error",
    name: context ? `client_error:${context}` : "client_error",
    message: (message || "Unknown").slice(0, 4000),
    stack: (stack || "").slice(0, 8000),
    url: typeof window !== "undefined" ? window.location.pathname : undefined,
  });
}
