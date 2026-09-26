"use client";

// Telemetry bootstrap: installs global error listeners once and reports
// route changes as page views. Everything is gated by lib/telemetry's
// opt-out / offline / reduced-data checks. The page-view listener fires only
// after hydration + a small delay so it doesn't double-count SSR.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackError, trackPageView } from "@/lib/telemetry";

export function Telemetry() {
  const pathname = usePathname();

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      trackError(event.error ?? event.message, "window");
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      trackError(event.reason, "unhandledrejection");
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => trackPageView(pathname || "/"), 1500);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
