import Link from "next/link";
import { PUBLIC_NOTES_SUBJECTS } from "@/lib/public-notes";
import { pastPaperBoardSlug, papersByYear } from "@/lib/past-papers";

/**
 * The prep map: every page the product publishes, one click from the homepage.
 *
 * It exists because the site had fourteen public pages and a footer that linked
 * five of them. A crawler could reach a chapter's questions only by guessing a
 * URL, and a student had to know the notes library existed to find it.
 *
 * Every entry is derived from the registry that owns it — PUBLIC_NOTES_SUBJECTS
 * for notes, papersByYear() for papers, the same board slug the /past-papers
 * routes resolve — so a link cannot outlive the page it points at. Nothing here
 * is a placeholder: if a page does not exist, it is not in this list.
 */

const TESTS = [
  { name: "MDCAT", track: "Medical", href: "/topicals" },
  { name: "NUMS", track: "Medical", href: "/past-papers/nums-mdcat" },
  { name: "NUST NET", track: "Engineering", href: "/nust/practice" },
  { name: "GIKI", track: "Engineering", href: "/giki/practice" },
  { name: "HEC USAT", track: "Admission", href: "/usat/practice" },
  { name: "LUMS", track: "Admission", href: "/lums/practice" },
  { name: "PMA", track: "Defence", href: "/pma/practice" },
  { name: "ISSB", track: "Defence", href: "/pma/practice" },
] as const;

// Year groups exactly as /past-papers renders them, so the anchor each link
// uses (`/past-papers#papers-2025`) is the id that page actually carries.
const PAPER_YEARS = papersByYear()
  .filter((group) => /^\d{4}$/.test(group.key))
  .map((group) => ({
    year: group.key,
    count: group.papers.length,
    boards: Array.from(
      new Map(
        group.papers.map((paper) => [
          paper.exam,
          // "UHS MDCAT" reads as "UHS" in a chip; the board page's H1 keeps the
          // full name, so the chip is a shortcut, not a different label. Only
          // " MDCAT" is stripped — stripping the rest would collapse the
          // reconducted sitting into the ordinary one under a shared label.
          paper.exam.replace(" MDCAT", ""),
        ]),
      ).entries(),
    ).map(([exam, label]) => ({ label, href: `/past-papers/${pastPaperBoardSlug(exam)}` })),
  }));

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]";

const display = { fontFamily: "var(--font-display)" } as const;

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--steel-400)]">
      {children}
    </h3>
  );
}

export function PrepMap() {
  return (
    <section id="prep-map" className="border-t border-[var(--line-1)] py-16 sm:py-24">
      <div className="container-page">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 style={display} className="max-w-[20ch] text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Every test, subject and paper year
            </h2>
            <p className="mt-3 max-w-[52ch] text-[var(--steel-300)]">
              Each test&apos;s practice surface, each notes subject, and every paper year we hold with the
              boards that sat it. Nothing on this list is waiting to be written.
            </p>
          </div>
          <Link
            href="/notes"
            className={`text-sm font-semibold text-[var(--signal-300)] underline underline-offset-4 hover:text-[var(--signal-200)] ${focusRing}`}
          >
            Or start with the notes →
          </Link>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Tests */}
          <div className="lg:col-span-3">
            <ColumnHeading>Practice by test</ColumnHeading>
            <ul role="list" className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 lg:grid-cols-1">
              {TESTS.map((test) => (
                <li key={test.name}>
                  <Link
                    href={test.href}
                    className={`group flex items-baseline justify-between gap-2 text-sm ${focusRing}`}
                  >
                    <span className="font-semibold text-[var(--steel-200)] transition-colors group-hover:text-[var(--steel-100)]">
                      {test.name}
                    </span>
                    <span className="shrink-0 text-[11px] text-[var(--steel-500)]">{test.track}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Notes */}
          <div className="lg:col-span-3">
            <ColumnHeading>Notes by subject</ColumnHeading>
            <ul role="list" className="mt-4 flex flex-col gap-2.5">
              {PUBLIC_NOTES_SUBJECTS.map((subject) => (
                <li key={subject.slug}>
                  <Link
                    href={`/notes/${subject.slug}`}
                    className={`group flex items-baseline justify-between gap-2 text-sm ${focusRing}`}
                  >
                    <span className="font-semibold text-[var(--steel-200)] transition-colors group-hover:text-[var(--steel-100)]">
                      {subject.name} notes
                    </span>
                    <span className="shrink-0 text-[11px] text-[var(--steel-500)]">{subject.weight}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/notes/usat-m"
                  className={`group flex items-baseline justify-between gap-2 text-sm ${focusRing}`}
                >
                  <span className="font-semibold text-[var(--steel-200)] transition-colors group-hover:text-[var(--steel-100)]">
                    HEC USAT-M notes
                  </span>
                  <span className="shrink-0 text-[11px] text-[var(--steel-500)]">by section</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Papers by year, with the examining bodies under each year */}
          <div className="lg:col-span-6">
            <ColumnHeading>Papers by year</ColumnHeading>
            <ul role="list" className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {PAPER_YEARS.map((group) => (
                <li key={group.year}>
                  <div className="flex items-baseline justify-between gap-3 border-b border-[var(--line-1)] pb-1.5">
                    <Link
                      href={`/past-papers#papers-${group.year}`}
                      className={`text-sm font-bold tabular-nums text-[var(--steel-100)] underline-offset-4 hover:underline ${focusRing}`}
                    >
                      {group.year}
                    </Link>
                    <span className="text-[11px] tabular-nums text-[var(--steel-500)]">
                      {group.count} {group.count === 1 ? "paper" : "papers"}
                    </span>
                  </div>
                  <ul role="list" className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
                    {group.boards.map((board) => (
                      <li key={`${group.year}-${board.href}`}>
                        <Link
                          href={board.href}
                          className={`text-xs text-[var(--steel-300)] underline-offset-4 transition-colors hover:text-[var(--steel-100)] hover:underline ${focusRing}`}
                        >
                          {board.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-[var(--steel-500)]">
              Years are sittings we hold, not sittings we claim to have every paper from. Boards open the
              page listing each paper&apos;s code and whether a key ships with it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
