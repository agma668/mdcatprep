"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// Client boundary: the widget is the only framer-motion consumer on non-landing
// routes, and `ssr: false` is only legal inside a Client Component. Lazy-mounting
// it keeps ~45 kB (framer-motion) out of every page's first-load JS — it floats
// in after hydration.
const FeedbackWidget = dynamic(
  () => import("./FeedbackWidget").then((m) => m.FeedbackWidget),
  { ssr: false, loading: () => null }
);

// Routes where the floating FAB makes no sense. /pending is reached by
// applicants who cannot sign in yet — asking them for product feedback is odd
// on a "we'll review your application" screen. Signed-in surfaces keep it.
const HIDDEN_ON = new Set(["/pending"]);

export default function FeedbackWidgetMount() {
  const pathname = usePathname();
  if (HIDDEN_ON.has(pathname ?? "")) return null;
  return <FeedbackWidget />;
}
