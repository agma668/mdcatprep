import type { Metadata } from "next";
import { TrackedLink } from "@/components/TrackedLink";
import { Bookmark } from "lucide-react";
import { getMyBookmarks } from "@/app/actions/bookmarks";
import { BookmarkReviewList } from "@/components/dashboard/BookmarkReviewList";

export const metadata: Metadata = { title: "Bookmarks" };
export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const { questions } = await getMyBookmarks();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-amber-400/25 bg-amber-400/10">
          <Bookmark className="h-5 w-5 text-amber-300" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Bookmarks</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Questions you flagged for review. Reveal, re-answer, unflag when mastered.
          </p>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="glass-tile rounded-[var(--radius-lg)] border border-white/10 p-8 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Nothing flagged yet. During practice, press{" "}
            <span className="font-bold text-white">Flag</span> on any question you want to
            revisit — it lands here.
          </p>
          <TrackedLink
            to="/dashboard/practice"
            label="bookmarks-empty-cta"
            className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-2.5 text-sm font-bold text-[var(--color-text-inverse)] shadow-[var(--shadow-cta)] transition-all duration-[var(--transition-fast)] hover:bg-[var(--color-primary-light)]"
          >
            Start practicing
          </TrackedLink>
        </div>
      ) : (
        <BookmarkReviewList questions={questions} />
      )}
    </div>
  );
}
