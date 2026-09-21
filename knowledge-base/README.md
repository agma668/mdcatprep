# Knowledge Base

One canonical copy of every study note, question bank, and flashcard the
founder owns — built 2026-09-21 by consolidating `Downloads/Antigravity`,
`Downloads/TODO`, loose `AKU_*.md` files, and the `Studies/_Duplicates` park
into this folder. **Every source was deleted after hash-verified copy; the
full inventory lives in `C:/Users/admin/Studies/_REMOVALS-2026-09-21.csv`.**

## Why two homes

| Home | Contents | Why |
| --- | --- | --- |
| `knowledge-base/` (this folder, inside the repo) | Text study material: notes, question banks, flashcards, references — **11 MB, 191 files** | Lives in git, so it survives laptop loss and every AI thread on this project can read it directly |
| `C:/Users/admin/Studies/` | Binary study material: PDFs, DOCX, Anki decks, mock papers — plus `07-Consolidated/` for what the sweep absorbed | One PC-wide home for large binaries; already organized by subject |

## Structure

```
knowledge-base/
  notes/          Master notes by subject (Biology / Chemistry / Physics / general)
  questions/      MCQ banks, past-paper compilations, topical sets
  flashcards/     Card decks (incl. Anki-ready CSV)
  mock-exams/     Full-length practice papers (text form)
  reference/      Formula sheets, reaction tables, reasoning passages
  README.md       ← you are here
  INDEX.md        Every file with size — regenerate: node scripts/build-kb-index.mjs
```

## Rules enforced on everything here

1. **No academy names.** KIPS, Prep Titans, MedExel, MedQuack, Anees Hussain,
   MedAngle, MDCATPrep, STEPS, Dogar, taleem360, CATPrep, MENTR — scrubbed
   from filenames *and* file contents.
2. **No "AKU" / "Aga Khan" anywhere.** Filenames, folder names, and file
   contents included. Verified by a boundary-aware scan (zero hits).
3. **No duplicate copies.** Every file deduplicated by SHA-256 against the
   whole Studies tree before admission; same-content format twins (`.md` +
   `.html` of the same note) collapsed to the best format.

## What was *not* absorbed

- **Commercial compiled PDFs** (KIPS / Prep Titans / MedExel books) — copyright
  rule; they were already excluded from the website and stay excluded here.
- **Personal documents** (CNIC, proformas, admit cards, result slips) — not
  study material; untouched in Downloads.
- **Admission photos** — preserved at
  `Studies/07-Consolidated/Personal/Admission-Photos/` (kept, never deleted).

## Maintaining it

- New study file? Put it here (text) or in `Studies/` (binary), then
  `node scripts/build-kb-index.mjs` to refresh the index.
- The consolidation script is kept at `scripts/consolidate-knowledge-base.mjs`
  (dry-run by default; `--apply` to execute). Do **not** re-run it blindly —
  its source folders are already deleted.
