# Apex Pakistan — Exam Prep Space Readiness Matrix

**Prepared:** 2026-11-09  
**Repository:** `agma668/mdcatprep`  
**Status:** Internal planning and truthful-claims guide. Not a launch announcement.

## Status definitions

- **Available:** Current official blueprint verified, core content reviewed, student workflow works, durable goal-scoped progress is verified, and the public description matches the actual product.
- **Beta:** A useful, deliberately limited workflow exists, with its limitations visible; it is not a complete official-format preparation experience.
- **Content in progress:** Some code or bundled content exists, but core exam mapping, content, assessment rules or persistence are incomplete.
- **Coming soon:** No sufficiently verified, exam-specific learning workflow is established.
- **Not offered:** Explicitly outside the current product scope.

The last recorded read-only Supabase check found the canonical question table empty. Recheck current live state before relying on that historical observation. No Prep Space should be marked **Available** until goal-scoped question delivery and durable attempt persistence pass end-to-end tests.

## Current readiness

| Exam / goal | Evidence in repository | Main gap | Current status |
|---|---|---|---|
| PMDC MDCAT | 16,303 served topical rows on the medical-first reconciliation branch after 253 malformed rows are quarantined; topical content, mock and practice surfaces. PMDC 2026 notice applies the 2025 syllabus and confirms a 180-MCQ structure including Logical Reasoning. | Current generic 100-question mock is not the official 180-question split and has no Logical Reasoning section. Durable goal-scoped attempts and canonical question delivery still need a fresh live-state check and end-to-end verification. | **Beta — limited practice** |
| NUMS MDCAT | NUMS chooser and subtest exist; NUMS official 2026 admissions page links a dedicated 2026 syllabus. | The 2026 NUMS syllabus has a separate 150-question Paper-I and 50-question psychological-test Paper-II. Only three psychological scenario items were found in the earlier source scan; NUMS topic mapping and the Paper-II bank remain incomplete. | **Content in progress** |
| HEC Balochistan & Ex-FATA scholarship — Pre-Medical | Dedicated bundled question bank and 100-MCQ / 100-minute mock. The split matches HEC Batch-IV published weightages. | The located official pattern is Batch-IV (2025); a newer 2026 batch-specific blueprint was not found. Canonical DB ingestion and durable goal-scoped progress are incomplete. | **Beta — limited pattern practice** |
| Standard HEC USAT | Some broad config labels and partial shared content. | Standard USAT variants (Pre-Medical, Pre-Engineering, Arts & Humanities, Commerce, Computer Science, General Science) are not represented by a verified complete assessment workflow. The scholarship bank must not be labelled standard USAT-M. | **Coming soon** |
| NUST NET Engineering | 81-question NET-pattern bank; timed mock uses current NUST admissions-page weighting (Math 50%, Physics 30%, English 20%) and scales to the bank. | Bank is too small for a full 200-question paper simulation; no durable goal-scoped progress. The older prospectus has a different weighting and must not override the current official admissions page without a dated version decision. | **Beta — scaled practice** |
| NUST Applied Sciences / Business & Social Sciences / Architecture / Natural Sciences | Official NUST page lists distinct weightings for each variant. | No separate bank and assessment profile established for each variant. | **Coming soon** |
| GIKI Undergraduate Test | GIKI is listed in the engineering chooser and shares a NET-pattern bank. | No independent GIKI blueprint, question bank or mock verified. Shared NET content must be labelled as shared, not GIKI-specific. | **Content in progress** |
| LUMS SBASSE / LCAT | LUMS is listed in the engineering chooser and shares a NET-pattern bank. | No independent LCAT workflow or official pattern mapping verified. LUMS admissions routes should not be reduced to a universal NET-style test. | **Content in progress** |
| PMA Long Course initial test | 41-question bundled bank across Verbal, Non-Verbal and Academic; original scaled mock with clearly disclosed site pacing. | Standalone practice state is local-only; bundled question attempts cannot yet be durably recorded. Official written-test counts/timing are not published by the source reviewed. | **Beta — original practice** |
| ISSB selection preparation | Focused Verbal/Non-Verbal reasoning drill from the PMA-style bank. | Official ISSB describes a four-day, three-dimensional selection process (psychologist, GTO, Deputy President/interview). No complete selection-preparation workflow exists. | **Content in progress** |
| Pakistan Navy / PAF / AFNS | Mentioned in older broad taxonomy/configuration. | No independent verified assessment workflow or content bank established. | **Coming soon** |
| MBBS Clinical Learning | A notes surface exists. | Separate post-admission curriculum, year mapping and clinical learning workflow need their own audit. | **Content in progress** |

## Non-negotiable launch rule

A question count or attractive portal page is not enough to make a Prep Space ready. A student must be able to:

1. Understand the exact exam and variant being prepared for.
2. See the verified syllabus/pattern version and content provenance.
3. Practise only questions explicitly mapped to that exam/variant.
4. Receive accurate explanations and honest assessment feedback.
5. Save attempts, bookmarks and review state against their own preparation goal.
6. Return later and see the same goal-specific progress.
7. Understand what is available, limited, in progress or not offered.

## Source references reviewed on 2026-11-09

- PM&DC MDCAT-2026 public notice: https://pmdc.pk/Documents/Others/Public%20Notice%20Regarding%20MDCAT-2026%20Date%20Announcement.pdf
- PM&DC syllabus publication page: https://pmdc.pk/Publication/Syllabus
- NUMS MDCAT-2026 official admissions/syllabus page: https://numspak.edu.pk/news-detail/nums-mdcat-2026-for-admissions-in-mbbs-bds-session-2026-27
- HEC Balochistan/Ex-FATA Batch-IV content weightages: https://www.hec.gov.pk/english/scholarshipsgrants/BF-III/Documents/Content-Weightages-BAL-FATA.pdf
- HEC Batch-IV programme page: https://www.hec.gov.pk/english/scholarshipsgrants/BF-III/Pages/default.aspx
- NUST subjects included in NET with weightings: https://nust.edu.pk/admissions/undergraduates/subjects-included-in-net-with-weightings
- ISSB official selection system: https://www.issb.gov.pk/selection-system

The NUMS 2026 page links a dedicated syllabus PDF, but that PDF could not be fetched during this review. Its detailed sections and weightings are therefore intentionally not asserted here.


## Medical-first status reconciliation — 2026-11-23

This update supersedes the 2026-11-09 content-count snapshot but does not promote either medical Prep Space to Available.

| Medical Prep Space | Current evidence | Status | Release blockers |
|---|---|---|---|
| PM&DC MDCAT | 16,556 source rows were measured; the guard in this branch leaves 16,303 served after quarantining 253 malformed rows. Six navigation categories are not all official PM&DC sections. Only 46 source-written explanations are attached. PM&DC-2026 blueprint is 180 MCQs with 81/45/36/9/9 sections. | **Beta — limited topical practice** | No complete learning-outcome coverage proof; answer/rights review incomplete; durable goal-scoped attempts and exact exam mapping need verification; 100-question custom mock is not official full paper. |
| NUMS MDCAT | Separate official 2026 150 + 50 syllabus profile exists; only three psychological scenario items were found in the earlier source scan; recent OCR included only a partial NUMS scan. | **Content in progress** | Independent outcome map and Paper-I bank review; Paper-II content and suitability; goal-scoped delivery and progress; next-cycle official blueprint recheck. |

**Content-count language:** 16,556 means source rows before the quality guard; 16,303 remain served on this branch. Neither number means PM&DC-mapped, syllabus-covered, fully keyed, explained, licensed or academically approved questions. Mathematics is not a separate PM&DC section.

**OCR:** local OCR tooling has been restored and 304 pages were OCRed in the 2026-11-22 run, but no new answer keys were recovered. OCR output remains raw source material pending classification, mapping, rights review and academic QA.
