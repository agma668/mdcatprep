"use client";

// Flag-for-review toggle on a live question. Optimistic: the icon flips
// instantly, the server action confirms, and a failed call rolls the state
// back. Errors are silent by design — a failed flag must never break a
// practice session.

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleBookmark } from "@/app/actions/bookmarks";

export function BookmarkFlag({
  questionId,
  initialFlagged = false,
}: {
  questionId: string;
  initialFlagged?: boolean;
}) {
  const [flagged, setFlagged] = useState(initialFlagged);
  const [pending, startTransition] = useTransition();

  const flip = () => {
    const next = !flagged;
    setFlagged(next); // optimistic
    startTransition(async () => {
      const res = await toggleBookmark(questionId);
      if (typeof res.flagged === "boolean") setFlagged(res.flagged);
      else setFlagged(!next); // roll back on error
    });
  };

  return (
    <button
      type="button"
      onClick={flip}
      aria-pressed={flagged}
      aria-label={flagged ? "Remove bookmark" : "Bookmark this question for review"}
      title={flagged ? "Bookmarked — find it under Bookmarks" : "Flag for review"}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all duration-[var(--transition-fast)] ${
        flagged
          ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
          : "border-white/10 bg-white/[0.04] text-white/55 hover:border-white/25 hover:text-white"
      } ${pending ? "opacity-70" : ""}`}
    >
      <Bookmark className="h-3.5 w-3.5" fill={flagged ? "currentColor" : "none"} />
      {flagged ? "Flagged" : "Flag"}
    </button>
  );
}
