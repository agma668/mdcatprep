// KB NOTES LOADER — serves the founder's knowledge-base/notes markdown files
// inside the protected master reader. Server-only (uses node fs); the reader
// page is force-dynamic so files are read per request and never bundled into
// client JS, never exposed as static assets, and can't be downloaded.
//
// Honesty: document titles come from filenames + first heading; nothing is
// invented. Slugs are validated against the real file list (no path traversal).

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import type { NoteSection } from "@/lib/mcat-notes";

const KB_NOTES = path.join(process.cwd(), "knowledge-base", "notes");

export type KbDoc = {
  /** URL-safe id, e.g. "chemistry__atomic-structure-master-notes". */
  slug: string;
  /** Display title derived from the filename. */
  title: string;
  /** Subject folder, e.g. "Chemistry" ("" for top-level files). */
  subject: string;
  /** Approximate size label for the index, e.g. "184 KB". */
  sizeLabel: string;
};

function walk(d: string, out: string[] = []): string[] {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.md$/i.test(e.name)) out.push(p);
  }
  return out;
}

function titleFromName(base: string): string {
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => (w.length <= 3 && w === w.toUpperCase() ? w : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

let cache: KbDoc[] | null = null;

export function listKbDocs(): KbDoc[] {
  if (cache) return cache;
  const files = walk(KB_NOTES);
  cache = files
    .map((p) => {
      const rel = path.relative(KB_NOTES, p).split(path.sep).join("/");
      const subject = rel.includes("/") ? rel.split("/")[0] : "";
      const base = path.basename(p).replace(/\.md$/i, "");
      const slug = (subject ? subject.toLowerCase() + "__" : "") + base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const size = statSync(p).size;
      return {
        slug,
        title: titleFromName(base),
        subject,
        sizeLabel: size > 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(size / 1024)} KB`,
      };
    })
    .sort((a, b) => a.subject.localeCompare(b.subject) || a.title.localeCompare(b.title));
  return cache;
}

/** Markdown → the reader's paper format. Headings ## = sections; "- " = bullets. */
export function getKbDocSections(slug: string): NoteSection[] | null {
  const doc = listKbDocs().find((d) => d.slug === slug);
  if (!doc) return null;
  // resolve the real file from the slug (display title may differ from filename)
  const files = walk(KB_NOTES);
  const file = files.find((p) => {
    const r = path.relative(KB_NOTES, p).split(path.sep).join("/");
    const s = r.includes("/") ? r.split("/")[0].toLowerCase() : "";
    const b = path.basename(p, path.extname(p)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return (doc.subject ? `${doc.subject.toLowerCase()}__${b}` : b) === slug;
  });
  if (!file) return null;

  const raw = readFileSync(file, "utf8");
  const lines = raw.split(/\r?\n/);
  const sections: NoteSection[] = [];
  let current: NoteSection = { title: "Overview", topics: [{ title: "", blocks: [] }] };
  const pushCurrent = () => {
    if (current.topics.some((t) => t.blocks.length > 0)) sections.push(current);
  };
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const h = /^(#{1,6})\s+(.*)$/.exec(t);
    if (h) {
      pushCurrent();
      current = { title: h[2].replace(/[*_`]/g, "").slice(0, 120), topics: [{ title: "", blocks: [] }] };
      continue;
    }
    if (/^([-*+])\s+/.test(t) || /^\d+[.)]\s+/.test(t)) {
      current.topics[0].blocks.push({
        type: "bullet",
        text: t.replace(/^([-*+]|\d+[.)])\s+/, "").replace(/\*\*/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").slice(0, 400),
      });
    } else {
      current.topics[0].blocks.push({
        type: "para",
        text: t.replace(/\*\*/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").slice(0, 600),
      });
    }
  }
  pushCurrent();
  return sections.length > 0 ? sections : null;
}
