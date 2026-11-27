# MDCAT Question-Bank Refinement — Preservation-First Plan

**Status:** Approved direction from founder; implementation/audit queue  
**Scope:** Existing MDCAT question material first. This is a curation project, not a content-generation project.

## Non-negotiable preservation rules

1. Existing question content is the asset. Do not replace the bank with AI-generated questions.
2. Do not paraphrase, simplify, translate, regenerate options, alter answer keys or invent explanations as part of sorting/deduplication.
3. Keep immutable source copies and stable source identifiers. Every curated question must be traceable to its original file, source label and question number/record.
4. All cleanup starts with a read-only report. No bulk rewrite, deletion, ingestion or Supabase seed until the report is reviewed and approved.
5. Every proposed duplicate merge records all source occurrences. Never discard provenance.
6. Human review is required for ambiguous chapter mapping, near-duplicates, answer-key conflicts, broken diagrams and disputed answers.
7. AI may suggest a chapter/topic, detect candidate duplicates and flag anomalies; it must not autonomously rewrite or decide academic correctness.

## What is already in the repository

- `knowledge-base/questions/MDCAT_Practice_Questions.md` identifies itself as a 3,594-question collection (Biology 1,439; Chemistry 939; Physics 1,216). This is a source-file heading/count, not a verified count of usable, unique, correctly keyed MCQs.
- The same file visibly contains malformed/incomplete entries: examples include questions with no four-option set and questions with only two options. These should be flagged, not silently dropped.
- Chapter-specific files already exist under `knowledge-base/questions/Biology`, `Chemistry`, and `Physics`, alongside broad collections, past-paper files and OCR/reference sources.
- `lib/mdcat-topics.ts` contains a chapter/topic taxonomy, but its comments say subtopics are approximate and not matched against questions. It needs comparison with the effective official PM&DC syllabus before it can be treated as the definitive mapping.
- `lib/topicals.ts` merges curated, founder and pipeline banks. It excludes some unclassified buckets rather than guessing their chapter.
- `scripts/ingest-topicals-v2.mjs` currently writes directly to `lib/topicals-bank.ts`, has no dry-run option, and deduplicates on normalized stem text alone. That is unsafe for a preservation-first pass: same-stem variants with different options, keys or source context can be collapsed. **Do not run this script for the refinement pass.**
- `lib/question-bank-audit.ts` checks structural issues and duplicates inside one supplied array using stem plus ordered options. It does not perform a corpus-wide, source-aware comparison, taxonomy review or answer-key conflict analysis.
- `knowledge-base/questions/Repeated_Questions_Report.md` contains 556 similarity clusters, 426 spanning multiple paper families. These are candidate clusters, not a deletion list; paper versions and legitimate rewordings must remain traceable.

## Required taxonomy

Use the current official PM&DC MDCAT syllabus/subject structure as the primary taxonomy for MDCAT. First verify the applicable syllabus year and source. For every question store:

- subject;
- one primary chapter;
- one primary topic;
- optional secondary topic tags only where genuinely useful;
- mapping confidence: high / medium / low;
- mapping evidence or reviewer note;
- source file + original question number/record ID;
- source type: official released paper / reconstructed paper / memory-based / founder collection / licensed or permission-cleared collection / original exam-style;
- original answer-key status and key source.

Do not treat paper year, board name, mock title, PDF filename or source collection as a syllabus chapter. Keep past-paper identity as provenance metadata, separate from the topic classification. A past-paper question can belong to both a paper sitting and a syllabus chapter.

## Deduplication rules

### Exact duplicate — eligible for a reviewed merge in the curated practice pool

Compare a normalized stem AND the complete set of normalized option texts, independent of A/B/C/D ordering. Also compare the correct-answer *option text*, not just its letter. Preserve diagrams/media identity where relevant.

- Whitespace, Unicode normalization and harmless punctuation/case differences may be normalized for candidate matching.
- If the same stem and option set have different answer-key option texts, flag a key conflict; do not auto-merge.
- If source context or figure differs, flag for review even if the text looks identical.
- Keep one canonical practice record only after review, with all original source occurrences attached.

### Near duplicate — never auto-delete

Same concept/stem with wording differences, changed values, changed options, altered diagrams, different difficulty or a meaningful source variation must be reviewed. Retain distinct questions unless a human reviewer confirms they are truly identical.

### Past-paper archive exception

If the same MCQ appeared in multiple actual papers, preserve every paper occurrence in the official/reconstructed paper archive because the year, board, code and answer key matter. It may be deduplicated in the general topical practice pool while retaining all paper-occurrence links. Never erase the evidence that it repeated.

## Refinement workflow

### Phase 0 — freeze and inventory (read-only)
- Enumerate all question-bearing files and runtime banks.
- Record file hash, path, byte size, source label and extraction format.
- Establish baseline counts per file, subject and source; identify zero-byte or unreadable files.
- Identify which source feeds each student-facing route. Do not assume similarly named banks are the same corpus.

### Phase 1 — parse and validate (no mutation)
- Parse MCQ records without altering source text.
- Flag missing stem, missing/duplicate options, invalid or missing answer key, missing explanation, malformed math/HTML, broken image references and question-number gaps.
- Keep incomplete questions in a repair queue; never delete them from source.
- Validate answer-key letter against option text and preserve key provenance. Do not guess an answer.

### Phase 2 — chapter/topic classification
- Map questions to official syllabus taxonomy using explicit source chapter labels first, then deterministic aliases.
- Use AI suggestions only as proposals with confidence and evidence.
- Low-confidence and out-of-syllabus questions go to a human review queue; do not force them into a convenient chapter.
- Report counts per subject → chapter → topic, plus unmapped and multi-topic cases.

### Phase 3 — duplicate review
- Run exact-duplicate candidate matching across all eligible practice sources.
- Run a separate near-duplicate similarity pass; keep its results as review candidates.
- Produce a cluster report with canonical candidate, all source references, option/key comparisons and decision state.
- Keep repeated paper occurrences in paper archives; deduplicate only the curated practice-pool view.

### Phase 4 — human quality review
- Review answer conflicts against the official key or strongest source.
- Review scientific accuracy, ambiguity, outdated syllabus relevance, option quality and explanation correctness.
- Do not create new questions or explanations to fill gaps in this pass. Missing explanations are flagged for a later, separately approved editorial task.

### Phase 5 — curated output (only after review)
- Generate a new versioned curated manifest/output from approved existing records.
- Never overwrite raw source files.
- Retain stable IDs and a provenance/duplicate-occurrence map.
- Compare before/after counts and produce a complete removal/merge log.
- Run tests for no lost source records, no changed stem/options/key, no broken source links, valid taxonomy and no unresolved exact duplicates in the published practice pool.
- Only then request approval to update runtime banks or seed a database.

## Required reports and acceptance criteria

1. Inventory report: source file → records → subject → parser status.
2. Classification report: subject/chapter/topic counts + unmapped queue.
3. Exact duplicate report: cluster, all occurrences, canonical candidate, answer-key agreement.
4. Near-duplicate report: candidate pairs/clusters for human review.
5. Structural-quality report: missing options/keys/explanations, malformed content and media.
6. Before/after reconciliation: original records, retained practice records, merged duplicates, archived paper occurrences and unresolved records.

**Acceptance:** every original record is accounted for; every curated record has stable provenance; no question text/options/key was rewritten by AI; exact duplicates are removed only from the appropriate curated pool after review; near-duplicates and repeated paper appearances remain preserved; every question is correctly classified or explicitly marked for review.

## Immediate implementation order

1. Build a read-only, dry-run corpus inventory/parser. It must emit reports only and must never write to source or runtime bank files.
2. Fix the audit model to compare full option sets and correct-answer option text, and to report rather than delete.
3. Produce the first Biology inventory and chapter map as a pilot.
4. Review Biology mapping/duplicate clusters with the founder, then repeat Chemistry and Physics; handle English and Logical Reasoning against their own syllabus structures.
5. Generate a versioned curated output only after the pilot rules are approved.

**Explicit prohibition:** do not run `ingest-topicals-v2.mjs`, `ingest-topicals.mjs`, rebalancing scripts or any production seeder as a substitute for this process. Those scripts serve different purposes and may rewrite generated banks or change option ordering.
