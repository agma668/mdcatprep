import type { Metadata } from "next";
import { OfflinePractice } from "./OfflinePractice";

export const metadata: Metadata = {
  title: "Offline Practice — Cadet College Prep",
  robots: { index: false, follow: false },
};

// Deliberately static and public: this page must render with no server round
// trip so the service worker can serve it with the network down. No auth check
// and no fetch — questions come from the device's own IndexedDB bank (downloaded
// from Dashboard → Offline Practice while online). Answers are scored locally;
// when the network happens to be back, the shared player's attempt-recording
// fires and is silently dropped if it can't reach the server.
export const dynamic = "force-static";

export default function OfflinePracticePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-primary/30 selection:text-white">
      <OfflinePractice />
    </main>
  );
}
