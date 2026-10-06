import { getSiteUrl, getWhatsAppLink } from "@/lib/site";
import {
  GUIDE_ENTRIES,
  type CatalogEntry,
} from "@/lib/content-catalog";

export const dynamic = "force-static";

/**
 * /llms.txt — the short AI-search catalog. AI answer engines (ChatGPT,
 * Perplexity, Claude, Gemini) read this to decide what this site can answer.
 * Rendered from lib/content-catalog.ts so it cannot drift from the codebase:
 * a page joins this surface by adding ONE catalog entry.
 *
 * Structure follows the llms.txt convention (llmstxt.org): an H1 identity,
 * a blockquote one-liner, then sections of markdown links — key pages only.
 * The long version lives at /llms-full.txt.
 *
 * Honesty rules here are the site's standing ones: real counts only (this
 * file states none — the pages themselves query live numbers), the paper
 * bank is described precisely (publicly released sittings), and nothing
 * claims an affiliation we do not have.
 */

function renderEntries(entries: CatalogEntry[], siteUrl: string): string {
  return entries
    .map((e) => {
      const line = `- [${e.title}](${siteUrl}${e.path}): ${e.blurb}`;
      return e.extra ? `${line} (+ [${e.extra.label}](${siteUrl}${e.extra.path}))` : line;
    })
    .join("\n");
}

export function GET(): Response {
  const siteUrl = getSiteUrl();
  const contact = getWhatsAppLink("Assalam-o-Alaikum! I have a question about MED Prep.");

  const body = `# MED Prep

> Free preparation for Pakistan's major entry tests — MDCAT, NUMS, NUST NET, GIKI, LUMS, HEC USAT and PMA/ISSB — on one platform: exam-style MCQ practice with an explanation behind every answer, chapter-wise topical drills, master notes, publicly released past papers with keys, and daily questions. No fee, no signup wall on the practice surfaces.

Practice is free and works without an account. Progress tracking, leaderboards and the protected master-notes reader need a free account. The medical bank follows the PMDC MDCAT syllabus (Biology, Chemistry, Physics, English, Logical Reasoning); dedicated portals serve engineering (NUST NET / GIKI / LUMS), HEC USAT and PMA/ISSB with their own banks.

## Core practice surfaces

- [MED Prep](${siteUrl}): the landing page with live, honestly-queried bank and student counts
- [Diagnostic Quiz](${siteUrl}/diagnostic): a short mixed quiz that shows which subjects need the most work
- [Topical MCQ Bank](${siteUrl}/topicals): chapter-wise MDCAT practice questions with instant verdicts
- [Daily MCQ Challenge](${siteUrl}/daily-quiz): one fresh MDCAT-style question every day
- [Flashcards](${siteUrl}/flashcards): spaced-repetition cards across all four subjects, no signup

## Other exam portals

- [Engineering portal — NUST NET / GIKI / LUMS](${siteUrl}/nust/practice): maths, physics, chemistry and English on the NET pattern
- [HEC USAT portal](${siteUrl}/usat/practice): quantitative, verbal and science sections
- [PMA & ISSB portal](${siteUrl}/pma/practice): verbal, non-verbal (figure) and academic initial-test practice

## Master notes

- [MDCAT Master Notes](${siteUrl}/notes): concept-plus-exam-depth notes for every PMDC unit, free to read online

## Past papers

- [Past Papers by Board](${siteUrl}/past-papers): MDCAT and NUMS publicly released papers grouped by examining body and year, with answer keys where they exist. Each board has its own page (UHS, BUMHS, KMU, SZABMU, DUHS, ETEA, SIBA, NUMS).

## Guides

${renderEntries(
  GUIDE_ENTRIES.filter((e) => e.key),
  siteUrl,
)}

## Contact

WhatsApp: ${contact}
Site: ${siteUrl}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
