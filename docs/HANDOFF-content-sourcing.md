# HANDOFF — content sourcing, paper provenance, and the study-material inventory

**Written 2026-09-13 by Freebuff/Codebuff thread → for Hermes/stalin (orchestrator).**
This is the half-finished half of the BANK / PAST PAPERS work: what was built,
what was found on disk, what is still missing, and the defects I introduced.
Read this before you touch `lib/past-papers.ts` or add another year tag.
Nothing here is committed or pushed — the founder's push hold is still on.

---

## 1. The rule this whole document exists to protect

**A question may only claim a year if it genuinely came from that paper.**

Measured, not assumed: **all 590 questions in `lib/*-questions.ts` carry
`source: 'PMDC MDCAT Exam Style'`.** They are original exam-style writing. Not
one of them came from a real paper. So "which year did this MCQ appear" had
nothing truthful to attach to, and the founder's original ask could not be
honoured by editing data — only by building the mechanism and growing content
honestly.

**Do not invent years to satisfy the wording.** If a question was written by us,
it stays untagged and the badge stays hidden. That is the designed behaviour,
not a bug.

---

## 2. What is already built (so you extend it, not rebuild it)

| file | what it is |
| --- | --- |
| `lib/past-papers.ts` | Registry of **20 real MDCAT papers** we hold — examining body, year, code, region, whether an official key exists. **Carries no question text.** |
| `lib/past-paper-bank.ts` | **40 original MCQs** I wrote to fill the thinnest gaps (§5). All untagged by design. |
| `app/past-papers/page.tsx` | Static browse-by-year surface. 200, renders real counts. |
| `supabase/migrations/20260912000000_question_provenance.sql` | Adds `past_paper_exam` / `past_paper_year` / `past_paper_section` + index. **Founder paste owed**, in the [FOUNDER] QUEUE. |
| `components/practice/PracticeSession.tsx` | Year badge in the reveal — renders **only** when provenance is set. |
| `lib/questions-repo.ts` | Tries the provenance columns, falls back to the base column list when Postgres says they're unknown — so practice keeps working before the paste. |

Helpers already there: `pastPaperLabel()`, `papersByYear()`, `papersByExam()`,
`findPastPaper()`, `PAST_PAPER_YEARS`, `PAST_PAPER_COUNT`.

---

## 3. What is registered now, and what deliberately is not

`lib/past-papers.ts` carries **25 papers, every one an `official` sitting**:
MDCAT 2022–2025 (20 — UHS, BUMHS Bolan, KMU, SZABMU, DUHS, SIBA, ETEA), MDCAT
2019 (UHS, Sindh, ETEA) and **NUMS 2024 and NUMS 2025**. The site is named MDCAT
*and* NUMS, and until now it registered not one NUMS paper; that gap is closed.

`kind` is now a **required** field (`official | recreated | memory-based |
campus-test | mock`) and the browse page renders it on every card, so a
reconstruction can be added later only by saying that it is one. `year` is
nullable and an undated paper groups under "Undated" rather than being filed
under a guessed year.

**The "eight NUMS papers" was an illusion.** That count came from scans of the
same sitting, byte-identical duplicates parked in `_Duplicates`, and third-party
compilations. There are **two distinct NUMS sittings** on disk. The compilations
that inflated the number (`NUMS Past Papers 2012-2020`, `NUMS Past Papers-1`)
are deliberately **not** registered: they are not single sittings, and none of
the five kinds describes a multi-year community compilation, so recording one
would mean inventing a year or overclaiming a kind. They stay available as
reference material.

**One university is excluded outright.** A standing founder ruling (2026-09,
applies to both sites) bans all material from one private medical university —
no papers, no notes, no claims, no mention. Nothing from it is registered or
ingested, its paper files on disk are reference-only, it has no
`COLLEGE_SUBJECTS` entry, and it appears nowhere in the product. **The ruling
names it and is authoritative — read the standing founder ruling in
`docs/AGENT-BOARD.md` before adding any examining body to that list, and do not
add that one back.**

---

## 4. Honest coverage after the paste — what the badge will actually show

Today: **0 of 660 questions carry a year**, and `/past-papers` says so out loud.
That number only moves when real papers are actually ingested as questions.

The tagged count is a *deliberate* measure. If it stays 0 for a while, the page
is telling the truth. Do not "improve" it by guessing.

---

## 5. Bank state and where it is thin (measured 2026-09-13, via `lib/stats.ts`)

```
BANK_TOTAL            660
BANK_BY_SECTION       Biology 157 · Chemistry 159 · Physics 170 · English 166 · Logical Reasoning 8
BANK_SECTION_COUNT    5
COMMUNITY_BASELINE    900   (display floor, differs from 660 on purpose)
```

**Logical Reasoning is 8 questions against 157–170 in every other section.** That
is the thinnest thing in the bank by an order of magnitude, it is the NUMS
Paper-I differentiator, and before my pass the section **did not exist at all**
— `lib/subjects.ts` said so in a comment: *"NUMS adds a Logical Reasoning
section the bank does not have yet."* I added the taxonomy branch
(`MDCAT_SUBJECTS`, `lib/subjects.ts` NUMS list, `lib/mdcat-topics.ts` chapter map)
and 8 seed questions. **Best value-per-question in the bank right now.**

Do not hardcode bank counts anywhere. `lib/stats.ts` is the single owner — the
hero, `/past-papers`, `/faq` and the leaderboard all read it, and it derives
`BANK_TOTAL` from the banks themselves. Adding questions needs no stat edit.

---

## 6. Defects I introduced in the sweep — please fix or tell me to

1. **The real NUMS papers are mis-filed as notes.** They sit in the
   `Studies/03-Notes/AR-*/` folder (`ls -d Studies/03-Notes/AR-*` finds it)
   carrying a `NUMS Papers__` prefix. Cause: that source folder was mapped
   wholesale as *notes* and the classifier didn't look one level deeper. They
   belong in `Studies/01-Past-Papers/NUMS/<year>/`.
2. **`Studies/00-Syllabus/` is empty** though `Studies/README.md` documents it as
   the home of syllabus documents. The syllabus PDFs actually landed in
   `01-Past-Papers/MDCAT/*/` with `_research__syllabus__` prefixes.
3. **The excluded university's paper files are also filed as notes** in that same
   `AR-*` folder. They should stay where they are and stay unused — do not
   promote them to `01-Past-Papers/`.

Fix is a classify-and-move over the manifest; `Studies/_MOVE-MANIFEST.csv` has
exact `from,to` for all 615 moves, and the sweep script is idempotent.

---

## 7. Where the study material actually is

```
C:\Users\admin\Studies\
  00-Syllabus\          (empty — defect §6.2)
  01-Past-Papers\       68 files: MDCAT\{2008-2019,2011-2016,2022,2023,2024,2025,undated}, NUMS\, ETEA\, Other\
  02-Loose-Notes\       61 files, by subject
  03-Notes\             310 files, by source (KIPS-2024, KIPS-2025, Medquack, MET, HighYield,
                        plus the `AR-*` folder — see §6 — and one folder belonging to the
                        excluded university, which is reference-only)
  04-MCQ-Banks\         81 files (Anees-Hussain, STEPS, MENTR, NUMS-Master, and a folder for the
                        excluded university that must not be promoted anywhere)
  05-Books\             9 files (Punjab Board 11th/12th)
  06-CCH-School\        43 files (cadet college material — belongs to the OTHER site)
  _Duplicates\          43 byte-identical copies, parked
  _MOVE-MANIFEST.csv    every from,to — the undo record
  README.md             layout, undo recipe, and the 69 unfinished files
```

Built by sweeping 684 documents out of `Downloads/`, `OneDrive/Desktop/`,
`OneDrive/Documents/`. **615 moved; 69 are still stuck** — all in
two folders still on `OneDrive/Desktop/`, both cloud-only
placeholders (`OFFLINE|REPARSE_POINT|RECALL_ON_DATA_ACCESS`), reading one fails
with *"The cloud file provider exited unexpectedly."* `OneDrive.exe` exits
immediately (needs sign-in). **Founder action:** sign into OneDrive / right-click
→ *Always keep on this device*, then re-run
`node ~/Studies/_tools/notes-sweep.mjs --apply` (idempotent).

**`06-CCH-School/` is cadet-college material, i.e. the *other* site's content.**
The elite-cadet-prep board should know those 43 files exist.

Heads-up flagged earlier and still true: `04-MCQ-Banks/NUMS-Master/*.pdf` are
**machine-generated from `Downloads/nums_prep/*.json`** (`"author": "Hermes Prep"`)
— a few pages each, not a bank of any size. They are safe where they are; just
don't mistake them for real NUMS coverage.

---

## 8. Do NOT ingest these (copyright — board rule)

The board already forbids re-hosting third-party compilations, and they are the
reason those files carry no year tags. Specifically **off-limits for content**:
KIPS practice books, Prep Titans, CATPrep (incl.
`Analysis__TopicWise__MDCAT_TopicWise_PastPapers_2008-2019_CATPrep.pdf`),
Medquack worksheets, and any `prepdummy` mock. (Founder ruling 2026-09: **Anees Hussain / PakLearningSpot compilations are CLEARED** for question-bank content. One private medical university remains excluded outright — see the standing founder ruling in `docs/AGENT-BOARD.md`, which names it.)

They are fine as **reference for what the exam asks** and for building our own
registry metadata (which papers exist, which have keys). They are not a source
of question text. Write from the PMDC/NUMS syllabus, as the board says.

---

## 9. Suggested order of work, if the founder wants this continued

1. **Logical Reasoning** 8 → ~60. Thinnest section, NUMS differentiator, new branch.
2. **Add `kind` to `PastPaper`**, then register the NUMS papers (§3).
3. Nothing from the excluded university, in any kind, ever — see §3.
4. Only then: ingest *questions* from the papers that genuinely carry keys.
5. Fix the three filing defects (§6) whenever the sweep is next touched.

**Two things I did NOT do and would not do without the founder's word:** claim
stalin's BANK row, or ingest third-party question text.

---

## 10. Protocol notes for whoever picks this up

- My board rows are under `## OPEN WORK → ### CLAIMS / BANK + PAST PAPERS`, and
  the perf answer is in `## PERF` + `docs/PERF-MEASUREMENT.md`.
- `lib/{biology,chemistry,physics,english}-questions.ts` were deliberately left
  untouched by me so your cron could not collide with my work — keep that
  boundary and I will stay out of them.
- Stage explicit paths only; this is one shared working tree.
- Everything I built is **local and uncommitted** under the founder's push hold.
