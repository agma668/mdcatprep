import { getSiteUrl, getWhatsAppLink } from "@/lib/site";
import {
  PRACTICE_ENTRIES,
  NOTES_ENTRIES,
  GUIDE_ENTRIES,
  type CatalogEntry,
} from "@/lib/content-catalog";

export const dynamic = "force-static";

/**
 * /llms-full.txt — the long AI-search catalog: every page in the editorial
 * catalog with its one-line blurb, grouped by section. Rendered from
 * lib/content-catalog.ts alongside the short /llms.txt, so the two cannot
 * drift: adding a page to the catalog publishes it to both surfaces.
 *
 * Honesty rules: blurbs are one real sentence; no counts (pages query live
 * numbers); the paper bank is described precisely (publicly released
 * sittings — never implying leaked or unpublished material).
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

> Free preparation for Pakistan's major entry tests — MDCAT, NUMS, NUST NET, GIKI, LUMS, HEC USAT and PMA/ISSB. Every practice surface is free and works without an account; progress tracking and the protected master-notes reader need a free account. The medical bank follows the PMDC MDCAT syllabus; engineering, HEC USAT and PMA/ISSB portals serve their own question banks.

## Practice

${renderEntries(PRACTICE_ENTRIES, siteUrl)}

## Notes

${renderEntries(NOTES_ENTRIES, siteUrl)}

## Guides and reference

${renderEntries(GUIDE_ENTRIES, siteUrl)}

## Board pages (past papers by examining body)

- [UHS](${siteUrl}/past-papers/uhs-mdcat): University of Health Sciences MDCAT papers by year
- [BUMHS](${siteUrl}/past-papers/bumhs-mdcat): Bolan University of Medical & Health Sciences papers by year
- [KMU](${siteUrl}/past-papers/kmu-mdcat): Khyber Medical University MDCAT papers by year
- [SZABMU](${siteUrl}/past-papers/szabmu-mdcat): Shaheed Zulfiqar Ali Bhutto Medical University papers by year
- [DUHS](${siteUrl}/past-papers/duhs-mdcat): Dow University of Health Sciences papers by year
- [ETEA](${siteUrl}/past-papers/etea-mdcat): Educational Testing and Evaluation Agency papers by year
- [SIBA](${siteUrl}/past-papers/siba-mdcat): SIBA Testing Service papers by year
- [SZABMU (reconducted)](${siteUrl}/past-papers/szabmu-mdcat-reconducted): the reconducted SZABMU MDCAT sitting, by year
- [Sindh](${siteUrl}/past-papers/sindh-mdcat): Sindh MDCAT papers by year
- [NUMS](${siteUrl}/past-papers/nums-mdcat): National University of Medical Sciences papers by year

## Contact

WhatsApp: ${contact}
Site: ${siteUrl}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
