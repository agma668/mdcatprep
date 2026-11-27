# 13K+ MDCAT Topicals Refinement — Execution Specification

**Status:** BLOCKED on source-corpus availability; preservation-first implementation required  
**Date:** 2026-11-28  
**Scope:** The full question corpus referred to by the founder (approximately 13,000+ records), including existing topical, chapter-wise, paper/OCR, extracted and private/local sources.

## Non-negotiable rules
- Preserve every original source file unchanged and create stable source IDs for every occurrence.
- Do not generate replacement questions, paraphrase stems, rewrite options, infer answers, or silently repair formatting.
- Assign each record to subject → canonical PM&DC chapter → topic only when evidence supports the mapping. Otherwise use HOLD_FOR_CLASSIFICATION.
- Exact duplicate means normalized stem + complete option set (order-insensitive) + correct-answer option text/key agreement. Preserve all source occurrences and provenance; propose one canonical delivery record only after review.
- Near-duplicates, same-stem/different-options, answer conflicts, diagram-dependent questions and ambiguous OCR remain separate and are flagged for human review.
- Preserve paper occurrences and official-paper metadata separately from topical practice classification.
- Every record receives a rights/visibility disposition before delivery: APPROVED_PUBLIC, PRIVATE_OWNER_ONLY, HOLD_FOR_RIGHTS, HOLD_FOR_QUALITY, or REJECTED_DUPLICATE (original retained).
- Commercial academy/textbook compilations must not be republished without documented permission. Official-paper origin does not itself establish republication rights.
- No bulk ingestion, public count claims, Supabase seeding, or production-bank edits until the manifest is reviewed and approved.

## Required pipeline
1. Freeze exact corpus snapshot; record source path, byte size, SHA-256, origin/provider, and retrieval date.
2. Parse all supported formats read-only (JSON/CSV/Markdown/TXT/PDF/OCR as available); retain raw text and original question boundaries.
3. Create one occurrence record per source question, with immutable source_id, source path, page/file question number, source chapter, raw stem/options/key/explanation/figure references.
4. Run structural checks: missing/extra options, malformed labels, missing stem, answer not matching options, missing explanation, broken figure reference, encoding/formatting anomalies.
5. Map subject/chapter/topic against the approved PM&DC syllabus taxonomy; retain original chapter label and mapping confidence/evidence.
6. Run conservative exact-duplicate clustering across the entire corpus; keep near-duplicate and conflicting-key clusters for manual review.
7. Run source-rights and public/private classification independently of academic classification.
8. Produce a reviewed topical release manifest; only APPROVED_PUBLIC rows enter public topical pages. Private owner-only records stay server-side and out of public bundles.
9. Generate counts from the final manifest and reconcile source occurrences → classified → exact duplicate groups → held/review → public/private release totals.
10. Add regression tests proving no source occurrence is lost and no private/held item reaches public routes or static bundles.

## Required deliverables
- source-inventory.csv: one row per source file with size, hash, record count and provenance.
- question-occurrences.jsonl: lossless parsed occurrences with stable source IDs and original fields.
- classification-review.csv: subject/chapter/topic, confidence, mapping evidence and review status.
- exact-duplicate-clusters.csv: full signatures, all source IDs and proposed canonical record; no automatic source deletion.
- near-duplicate-review.csv: candidate clusters retained separately.
- quality-flags.csv: malformed options, answer conflicts, missing explanations/figures and OCR uncertainty.
- rights-visibility-manifest.csv: source/item rights evidence and disposition.
- topicals-release-manifest.json: only reviewed, rights-cleared public rows and their source provenance.
- Before/after reconciliation report and tests.

## Verified repository evidence (2026-11-28)
- knowledge-base/questions/MDCAT_Practice_Questions.md declares 3,594 records (Biology 1,439; Chemistry 939; Physics 1,216); an earlier read-only parse found 2,021 entries without four labelled options. These are flags, not deletions.
- knowledge-base/questions/Biology/biology_mcquniverse.md (1,383) plus biology_mcquniverse_acellular_life_58.md (58) contain 1,441 structurally complete Biology records in the previous pilot; cross-source reconciliation and rights review remain outstanding.
- Existing scripts/ingest-topicals.mjs and scripts/ingest-topicals-v2.mjs are unsafe for this task: they deduplicate by normalized stem and skip incomplete/keyless records; v2 writes directly to lib/topicals-bank.ts. Do not run them as the refinement pipeline.
- The tracked TODO.md records conflicting 2026-11-23 corpus snapshots: 16,272 total (2,393 candidate public; 13,879 private; 3,398 import-ready; 1,981 official-paper answers; 12,417 unresolved) versus other historical snapshots. These numbers are unverified until reconciled against the actual corpus and manifest.
- The private/local data/MCQS_FINAL/ corpus and its README/manifest were not present on tracked main when checked. The connected GitHub fetch cannot inspect that corpus yet. The exact 13K+ source set must be made available before its records can be classified and placed.

## Stop conditions
If the exact source corpus, source provenance, or rights basis is unavailable, do not invent classifications, claim completion, or publish those records. Continue only with accessible, rights-cleared repository sources and report their scope separately.
