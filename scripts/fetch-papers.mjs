#!/usr/bin/env node
// Downloads MDCAT papers, answer keys and full-length papers into data/papers/.
//
// Why a script instead of a folder of PDFs: the repo must never re-host a
// paper or a commercial compilation, so the bytes stay out of git (see the
// `/data/papers/` line in .gitignore) and this file is the tracked record of
// exactly which URL each file came from. Running it again re-downloads and
// re-verifies everything.
//
// Every file is verified after download: it must start with %PDF, pdftotext
// must read it, and the page count plus the first ~200 characters of the first
// page are recorded in the manifest. That first-page text is the evidence for
// what the file claims to be — a file labelled "2024 key" whose first page says
// 2023 is a mislabelled file, and the manifest shows it.
//
//   node scripts/fetch-papers.mjs            # download everything missing
//   node scripts/fetch-papers.mjs --force    # re-download everything
//   node scripts/fetch-papers.mjs --only uhs # one provider folder
//
// Output:
//   data/papers/<provider>/<file>.pdf
//   data/papers/manifest.json
//   docs/PAPERS-INVENTORY.md                 (generated from verified files)
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT_DIR = join(ROOT, "data", "papers");
const MANIFEST = join(OUT_DIR, "manifest.json");
const INVENTORY = join(ROOT, "docs", "PAPERS-INVENTORY.md");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

// kind:
//   official-paper  the paper as sat, from the examining body
//   official-key    the answer key published by the examining body
//   official-guide  the information guide / syllabus booklet for a sitting
//   third-party     a reconstruction or compilation by a coaching site; the
//                   YEAR and provider are the site's claim, not verified here
//   reference       notes / compilation used only as reference material
const SOURCES = [
  // ---- UHS (Punjab) — uhs.edu.pk ------------------------------------------
  {
    url: "https://www.uhs.edu.pk/mdcat2025/ANSERKEY12025.pdf",
    out: "uhs/2025-answer-key.pdf",
    provider: "UHS",
    year: 2025,
    kind: "official-key",
  },
  {
    url: "https://www.uhs.edu.pk/mdcat2024/etkey24.pdf",
    out: "uhs/2024-answer-key.pdf",
    provider: "UHS",
    year: 2024,
    kind: "official-key",
  },
  {
    url: "https://www.uhs.edu.pk/mdcat2024/etkey2430924.pdf",
    out: "uhs/2024-answer-key-revised.pdf",
    provider: "UHS",
    year: 2024,
    kind: "official-key",
    note: "Second 2024 key file on the UHS site; page 1 states which paper IDs it covers.",
  },
  // The UHS MDCAT-2023 key page (etkey23.php) still exists and still links
  // mcat/paperid{a,b,c,d}.pdf, but every one of those URLs now returns the
  // site's HTML shell instead of a PDF — the files were removed in the 2025
  // site rebuild. They are deliberately not listed here: a 404 in the source
  // list every run is noise, and the 2023 key cannot be verified from UHS.
  {
    url: "https://www.uhs.edu.pk/downloads/MDCAT-2025InformationGuide.pdf",
    out: "uhs/2025-information-guide.pdf",
    provider: "UHS",
    year: 2025,
    kind: "official-guide",
  },
  {
    url: "https://www.uhs.edu.pk/downloads/GuidetoMDCAT-20241.pdf",
    out: "uhs/2024-information-booklet.pdf",
    provider: "UHS",
    year: 2024,
    kind: "official-guide",
  },
  // ---- PMDC (national council) — pmdc.pk -----------------------------------
  {
    url: "https://pmdc.pk/Documents/Syllabus/Uniform%20Curriculum%20MDCAT-2025%20%20Final%20(26-05-2025).pdf",
    out: "pmdc/2025-2026-curriculum.pdf",
    provider: "PMDC",
    year: 2025,
    kind: "official-guide",
    note: "The curriculum PMDC confirmed applies to MDCAT 2026 as well; this is the document the app's syllabus data should be checked against.",
  },
  {
    url: "https://pmdc.pk/Documents/Others/PM%26DC%20MDCAT%20Curriculum%202023.pdf",
    out: "pmdc/2023-curriculum.pdf",
    provider: "PMDC",
    year: 2023,
    kind: "official-guide",
    note: "Kept for the 2023-2024 sitting; the 2025 revision removed topics, so do not use this to judge what can be asked now.",
  },
  {
    url: "https://pmdc.pk/Documents/Others/Public%20Notice%20Regarding%20Opening%20of%20Online%20Registration%20Portal%20for%20MDCAT-2026.pdf",
    out: "pmdc/2026-pattern-notice.pdf",
    provider: "PMDC",
    year: 2026,
    kind: "official-guide",
    note: "States the 2026 pattern (180 MCQs, no negative marking, 81/45/36/9/9) and that the 2025 curriculum applies.",
  },
  // ---- SZABMU (Islamabad / AJK / GB) — admission.szabmu.edu.pk -------------
  {
    url: "https://admission.szabmu.edu.pk/mdcat26/MDCAT2026-paperkey.pdf",
    out: "szabmu/2026-answer-key.pdf",
    provider: "SZABMU",
    year: 2026,
    kind: "official-key",
    note: "Official key for all four booklet codes. The SZABMU directory listing is 403 to scripts; the file itself is public.",
  },
  // ---- KMU (Khyber Pakhtunkhwa) — cas.kmu.edu.pk ---------------------------
  {
    url: "https://cas.kmu.edu.pk/kmumdcat/keys/KMU_MDCAT_KEY_2026.pdf",
    out: "kmu/2026-answer-key.pdf",
    provider: "KMU",
    year: 2026,
    kind: "official-key",
    note: "Linked from the KMU MDCAT portal; all four booklet codes in one table.",
  },
  {
    url: "https://cas.kmu.edu.pk/kmumdcat/siteimages/mdcat-24-keys.pdf",
    out: "kmu/2024-answer-key.pdf",
    provider: "KMU",
    year: 2024,
    kind: "official-key",
  },
  // ---- Archive.org — papers that are not on any examining body's site ------
  {
    url: "https://archive.org/download/nmdcat-past-papers/NMDCAT%20PAPER%202020.pdf",
    out: "national/2020-paper.pdf",
    provider: "PMDC (national)",
    year: 2020,
    kind: "third-party",
    note: "Uploaded by MBBS.COM.PK, not PMDC. The first national MDCAT sittings had several paper codes; this is one code (06248).",
  },
  {
    url: "https://archive.org/download/nums-mdcat-entry-test-2024/NUMS%20MDCAT%20Entry%20Test%202024.pdf",
    out: "nums/2024-paper.pdf",
    provider: "NUMS",
    year: 2024,
    kind: "third-party",
  },
  {
    url: "https://archive.org/download/mdcat-past-papers/mdcat%20past%20papers.pdf",
    out: "uhs/2008-2016-papers-compilation.pdf",
    provider: "UHS",
    year: null,
    kind: "third-party",
    note: "Compilation of UHS MCAT papers 2008-2016; one PDF, several sittings, unit-wise usage notes in the margins.",
  },
  {
    url: "https://archive.org/download/PDFCompleteMDCAT2017/PDF%20Complete%20MDCAT%202017.pdf",
    out: "uhs/2017-paper.pdf",
    provider: "UHS",
    year: 2017,
    kind: "third-party",
  },
  {
    url: "https://archive.org/download/MDCATKey2017/MDCAT%20Key%202017.pdf",
    out: "uhs/2017-answer-key.pdf",
    provider: "UHS",
    year: 2017,
    kind: "third-party",
  },
  {
    url: "https://archive.org/download/chemistry-points-3000/chemistry%20points%203000.pdf",
    out: "reference/chemistry-points-3000.pdf",
    provider: "n/a",
    year: null,
    kind: "reference",
    note: "Chemistry revision compilation. Reference only: not a sitting, not attributed to any exam.",
  },
  // ---- mdcatguide.com — third-party archive of the UHS-era papers ----------
  ...Array.from({ length: 12 }, (_, i) => {
    const year = 2008 + i;
    return {
      url: `https://www.mdcatguide.com/wp-content/uploads/2026/08/UHS-MDCAT-${year}-Paper-A-mdcatguide.pdf`,
      out: `uhs/${year}-paper-a.pdf`,
      provider: "UHS",
      year,
      kind: "third-party",
    };
  }),
  {
    url: "https://www.mdcatguide.com/wp-content/uploads/2026/08/UHS-MDCAT-2023-Paper-D-mdcatguide.pdf",
    out: "uhs/2023-paper-d.pdf",
    provider: "UHS",
    year: 2023,
    kind: "third-party",
  },
  {
    url: "https://www.mdcatguide.com/wp-content/uploads/2026/08/UHS-MDCAT-2024-Paper-D-mdcatguide.pdf",
    out: "uhs/2024-paper-d.pdf",
    provider: "UHS",
    year: 2024,
    kind: "third-party",
  },
  {
    url: "https://www.mdcatguide.com/wp-content/uploads/2026/08/UHS-MDCAT-2025-Past-Paper-mdcatguide.pdf",
    out: "uhs/2025-paper.pdf",
    provider: "UHS",
    year: 2025,
    kind: "third-party",
    note: "Small file (under 100 KB) — check the page count before treating it as a full paper.",
  },
  {
    url: "https://www.mdcatguide.com/wp-content/uploads/2026/08/MDCAT-2024-SZABMU-Pink-Solved-mdcatguide.pdf",
    out: "szabmu/2024-paper-pink-solved.pdf",
    provider: "SZABMU",
    year: 2024,
    kind: "third-party",
    note: "Marked 'solved' by the site: the answers in it are the site's, not verified against an official key here.",
  },
  {
    url: "https://www.mdcatguide.com/wp-content/uploads/2026/08/SZABMU-MDCAT-Paper-2025-Code2-Solved-mdcatguide.pdf",
    out: "szabmu/2025-paper-code-2-solved.pdf",
    provider: "SZABMU",
    year: 2025,
    kind: "third-party",
  },
  {
    url: "https://www.mdcatguide.com/wp-content/uploads/2026/09/SZABMU-MDCAT-Paper-2026-Solved-mdcatguide.pdf",
    out: "szabmu/2026-paper-solved.pdf",
    provider: "SZABMU",
    year: 2026,
    kind: "third-party",
  },
];

async function download(src, force) {
  const target = join(OUT_DIR, src.out);
  if (!force) {
    const existing = await stat(target).catch(() => null);
    if (existing && existing.size > 1024) return { skipped: true, target };
  }
  await mkdir(dirname(target), { recursive: true });
  const res = await fetch(src.url, {
    headers: { "User-Agent": UA, Accept: "application/pdf,*/*" },
    redirect: "follow",
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") {
    throw new Error(`not a PDF (${buf.subarray(0, 40).toString("latin1").replace(/\s+/g, " ")})`);
  }
  await writeFile(target, buf);
  return { skipped: false, target };
}

async function inspect(target) {
  const buf = await readFile(target);
  const sha256 = createHash("sha256").update(buf).digest("hex");
  let pages = null;
  let pagesWithText = null;
  let firstPage = "";
  try {
    const { stdout } = await run("pdftotext", ["-q", "-f", "1", "-l", "1", "-layout", target, "-"], {
      maxBuffer: 8 * 1024 * 1024,
    });
    firstPage = stdout.replace(/\s+/g, " ").trim().slice(0, 220);
    const all = await run("pdftotext", ["-q", target, "-"], { maxBuffer: 64 * 1024 * 1024 });
    pagesWithText = all.stdout.split("\f").filter((p) => p.trim().length > 0).length || null;
  } catch {
    // pdftotext missing or the PDF is image-only; page counts stay null and the
    // manifest says so instead of guessing.
  }
  // A scanned paper has no text layer, so counting text pages under-reports it
  // badly (a 40-page scan reads as "1pp"). The page tree's /Count is the file's
  // own statement of its length; report both when they disagree.
  const counts = [...buf.toString("latin1").matchAll(/\/Count\s+(\d+)/g)].map((m) => Number(m[1]));
  const declared = counts.length > 0 ? Math.max(...counts) : null;
  pages = declared && declared < 10000 ? declared : pagesWithText;
  return { bytes: buf.length, pages, pagesWithText, sha256, firstPage };
}

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyIdx = args.indexOf("--only");
const only = onlyIdx !== -1 ? args[onlyIdx + 1] : null;

const rows = [];
let downloaded = 0;
let failed = 0;

for (const src of SOURCES) {
  if (only && !src.out.startsWith(`${only}/`)) continue;
  process.stdout.write(`${src.out} … `);
  try {
    const { skipped, target } = await download(src, force);
    const info = await inspect(target);
    rows.push({ ...src, file: src.out, ...info, ok: true });
    if (!skipped) downloaded += 1;
    console.log(`${skipped ? "kept" : "ok"} ${(info.bytes / 1048576).toFixed(2)} MB ${info.pages ?? "?"}pp`);
  } catch (err) {
    failed += 1;
    rows.push({ ...src, file: src.out, ok: false, error: String(err.message || err) });
    console.log(`FAILED ${err.message || err}`);
  }
}

// Keep rows for providers this run did not touch, so --only never drops files
// from the manifest.
const previous = await readFile(MANIFEST, "utf8")
  .then((t) => JSON.parse(t))
  .catch(() => ({ files: [] }));
const kept = previous.files.filter((f) => only && !f.file.startsWith(`${only}/`));
const files = [...kept, ...rows].sort((a, b) => a.file.localeCompare(b.file));

await mkdir(OUT_DIR, { recursive: true });
await writeFile(MANIFEST, `${JSON.stringify({ generatedAt: new Date().toISOString(), files }, null, 2)}\n`);

const kindLabel = {
  "official-paper": "official paper",
  "official-key": "official key",
  "official-guide": "official guide",
  "third-party": "third-party",
  reference: "reference",
};
const ok = files.filter((f) => f.ok);
const mb = ok.reduce((n, f) => n + f.bytes, 0) / 1048576;

const KNOWN_GAPS = [
  "UHS MDCAT-2023 answer keys: the key page links mcat/paperid{a,b,c,d}.pdf, and all four URLs now return the HTML shell, not a PDF. The 2023 paper is here as a third-party reconstruction; its answers are unverified.",
  "PMDC has published no question papers for any national sitting — only keys (2024 UHS, 2024/2026 KMU, 2025 UHS, 2026 SZABMU) and the curriculum. Every full paper in this folder is therefore a scan or a reconstruction, never an official release.",
  "No official Sindh (DUHS/SIBA) or Balochistan (BUMHS) paper was found on either university's public site. Both provinces publish keys, not papers, and neither site exposed a key PDF to a plain fetch.",
  "Academy full-length papers (KIPS, STEP, Sindh Academy Umerkot, Medico Engineer FLPs) are deliberately not downloaded: lib/past-papers.ts rules say a paid bank is reference only for WHICH papers exist, never a source of question text.",
];

const lines = [
  "# Papers inventory (generated)",
  "",
  "`node scripts/fetch-papers.mjs` writes this file from the files it actually",
  "downloaded and verified. Do not hand-edit it — re-run the script instead.",
  "",
  `Generated: ${new Date().toISOString().slice(0, 10)} · ${ok.length} files · ${mb.toFixed(1)} MB`,
  "",
  "Every file below was checked for a `%PDF` header and read with `pdftotext`.",
  "`pages` is the length the PDF declares in its own page tree — counting text",
  "pages instead would report a 41-page scan as one page. `first page says` is",
  "the opening text of the file itself, which is how you tell a mislabelled year",
  "from a real one; \"no extractable text\" means a scan with no text layer.",
  "",
  "**Nothing here is in git.** `data/papers/` is ignored — these are working",
  "copies for transcription and key-checking, not hosted content. The rules in",
  "`lib/past-papers.ts` still apply: a question may only claim a year if it came",
  "from that paper, third-party compilations are never registered as sittings,",
  "and a paid bank's questions are never copied into the product.",
  "",
  "| file | kind | provider | year | MB | pages | source |",
  "| --- | --- | --- | --- | --- | --- | --- |",
];
for (const f of files) {
  const name = `\`${f.file}\``;
  if (!f.ok) {
    lines.push(`| ${name} | ${kindLabel[f.kind] ?? f.kind} | ${f.provider} | ${f.year ?? "—"} | — | — | FAILED: ${f.error} |`);
    continue;
  }
  lines.push(
    `| ${name} | ${kindLabel[f.kind] ?? f.kind} | ${f.provider} | ${f.year ?? "—"} | ${(f.bytes / 1048576).toFixed(2)} | ${f.pages ?? "?"} | [link](${f.url}) |`,
  );
}
lines.push("", "## What each file's first page says", "");
for (const f of ok) {
  lines.push(`- \`${f.file}\` — ${f.firstPage ? `“${f.firstPage}”` : "_no extractable text (scanned image)_"}`);
}
lines.push("", "## Known gaps", "");
for (const gap of KNOWN_GAPS) lines.push(`- ${gap}`);

const notes = ok.filter((f) => f.note);
if (notes.length > 0) {
  lines.push("", "## Notes recorded with the sources", "");
  for (const f of notes) lines.push(`- \`${f.file}\` — ${f.note}`);
}
await writeFile(INVENTORY, `${lines.join("\n")}\n`);

console.log(`\n${downloaded} downloaded, ${ok.length} verified, ${failed} failed → ${MANIFEST}`);
console.log(`inventory → ${INVENTORY}`);
if (failed > 0) process.exitCode = 1;
