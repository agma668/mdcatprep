# Answer-key reconciliation — what actually matches

Run: `node scripts/reconcile-answer-keys.mjs` (add `--json <path>` for the machine-readable result).
Inputs are the official key files already in `data/papers/` and the corpus in
`data/MCQS/ALL_QUESTIONS/`. Nothing on the site was changed by this audit.

## Headline

Where our bank's answer can be compared with an official key **and the answer came from a
different document than that key**, the answers agree **85 of 85 times (100%)**:

| Paper | Independently comparable | Agree |
|---|---|---|
| UHS MDCAT 2025 — Paper ID-D | 77 | 77 (100%) |
| KMU MDCAT 2024 — Code A | 8 | 8 (100%) |

That is **not** a bank-wide accuracy rate. It covers 85 of 17,942 corpus questions (0.5%),
because those are the only questions whose stem we could tie to a paper *and* whose answer
came from a second document. The rest of the bank has no official key to check it against,
or no answer at all (see coverage below).

The comparison judges the **option text** the answer points to, not the letter, because a
letter only means something inside one paper's option order. A letter match with different
option text is still a wrong answer on screen.

## Per paper

**KMU MDCAT 2024 — Code A.** 200 questions in the paper, 199 key rows parsed, 198 compared,
198 agree (100%). Two gaps: question 50 has no answer in the bank, and question 142's row
did not parse from the key PDF. This comparison is *self-referential*: the parsed answers in
`data/MCQS/_sources/extra/kmu2024_code_a.json` were extracted from the same keys PDF
(`sha256 bbdfc4bd…` — byte-identical to `data/papers/kmu/2024-answer-key.pdf`), so 198/198
measures extraction fidelity, not independent accuracy. The independent sample is the 8
KMU questions that also appear in other documents with their own answers; all 8 agree.

**UHS MDCAT 2025 — Paper ID-D.** The paper PDF carries the official key dated 26-10-2025
(180 rows, parsed in full). 91 of the 180 stems were found in the bank (34 by fuzzy match,
Jaccard ≥ 0.7 with a clear margin); 77 were comparable and **all 77 agree**. The 75 answers
that carry a source file came from third-party compilations
(`MDCAT_Past_Papers_Biology_2025.pdf` 49, `MDCAT_Past_Papers_Chemistry_2025.pdf` 26), whose
printed keys are separate documents from the official key, so this is a genuine independent
check. 89 paper questions do not exist in the bank at all, and 14 matched rows could not be
judged because their option text is damaged.

## Papers that cannot be checked yet

| Paper | Status |
|---|---|
| UHS 2024 (original and revised) | Official key PDFs are **scanned images**; `pdftotext` returns no text and this machine has no OCR (`tesseract`/`pdftoppm` and Python are not installed). |
| UHS 2025 | Checked (above), on the 77 comparable items. |
| KMU 2024 | Checked (above); the paper text is held, the key is text. |
| KMU 2026 | Official key is text, but **no KMU 2026 paper** is in the archive, so no question can be tied to a key row. |
| SZABMU 2026 | Key and paper are text, but **zero corpus rows cite any SZABMU 2026 file** — nothing to compare against. |
| SZABMU 2024 | No official key file is held. |

## Option-text integrity

Text comparison surfaced a second defect that a letter-only audit hides. Of the 91 matched
UHS rows, 11 have corrupted options — an empty cell, another option's marker merged into the
text (`"…non-sister chromatids C."`), or a lost decimal (`8.314` stored as `314`). Across the
whole corpus only **14,926 of 17,942 (83.2%)** rows have four non-empty options, and 16 stems
carry conflicting answers in different rows.

A student drilling a corrupted row is shown a question whose answer text does not mean what
the letter says. This is independent of whether the letter is right.

## The promise, measured

"An explanation behind every answer" is true for the hand-written banks and false for the
extraction-fed ones.

| Bank | Rows | Answers | Explanations |
|---|---|---|---|
| Biology / Chemistry / Physics / English | 823 | 823 | 823 |
| Real-paper Chemistry 2023 | 358 | 358 | 358 |
| Past-paper, PMA, USAT hand-written | 138 | 138 | 138 |
| `lib/topicals-bank.ts` | 3,721 | 3,721 | **0** |
| `lib/founder-bank.ts` | 1,941 | 926 | **0** |
| `lib/pipeline-bank.ts` | 10,985 | 2,229 | **46** |

Corpus-wide: 7,222 of 17,942 questions have an answer letter (40.3%), 122 have an
explanation (0.7%), and only 76 (0.4%) have answer, explanation and four options together.

So the answer letters we can check are in good shape (85/85), but the promise itself is not
credible for the 16,647 extraction-bank rows: 46 explanations in total, and most rows have
no answer to explain in the first place.

## What this means before publishing

1. Do not quote "100% match" as bank accuracy. It is 85 independent comparisons.
2. Keep the explanation promise on the hand-written banks, where it holds (1,319 questions),
   and stop implying it for Topicals/practice-bank rows until they carry explanations.
3. Fix option-text integrity before anything else in the extraction bank: a wrong option
   string is visible on screen even when the key letter is right.
4. UHS 2024 needs OCR (or a text-layer key) before it can be reconciled at all; KMU 2026 and
   SZABMU 2026 need their papers added to the corpus first.

## Method notes

* Stems are matched after lowercasing and stripping punctuation; exact normalised text wins,
  otherwise token Jaccard ≥ 0.7 with a ≥ 0.05 margin over the runner-up. Ties are rejected.
* An answer agrees when the option its letter points to overlaps the keyed option's text by
  ≥ 0.6 (token Jaccard). A disagreement requires another option to overlap by ≥ 0.75 and beat
  the stored option by ≥ 0.25 — this is what prevents option-wording ties from being reported
  as wrong answers, which an earlier version of this audit did.
* Rows whose stem appears with two different answers in the bank are reported as
  bank-self-conflict, never silently adjudicated.
