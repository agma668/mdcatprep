-- =============================================================================
-- DRAFT — Prep Space catalogue seed (GitHub issue #2).
-- Additive and idempotent. DO NOT APPLY to the live Supabase project until the
-- RLS tests and a local review pass.
--
-- Seeds only exam identity and paper variants. It deliberately does NOT:
--   * import, map or publish a single question;
--   * create assessment profiles or claim an official marking scheme;
--   * insert student goals or touch student data;
--   * mark an unverified exam "active".
--
-- Status mirrors lib/prep-space-registry.ts readiness:
--   beta               -> active (students may create a goal)
--   content_in_progress -> draft  (hidden by RLS; no goal yet)
--   coming_soon        -> draft  (hidden by RLS; no goal yet)
--
-- Canonical IDs follow EXAM-REGISTRY-PROPOSAL.md: one exam with official paper
-- variants, not one exam per coaching label.
-- =============================================================================

insert into public.exam_registry (id, slug, title, category, description, status)
values
  (
    'pmdc-mdcat',
    'pmdc-mdcat',
    'PMDC MDCAT',
    'medical',
    'National medical entry test. Provincial conducting bodies sit under this one exam.',
    'active'
  ),
  (
    'nums-mdcat',
    'nums-mdcat',
    'NUMS MDCAT',
    'medical',
    'NUMS admissions route with its own syllabus review. Not advertised as a complete Prep Space yet.',
    'draft'
  ),
  (
    'hec-bfap-scholarship',
    'hec-bfap-scholarship',
    'HEC Balochistan & Ex-FATA Scholarship Test',
    'scholarship',
    'Separate scholarship assessment with its own batch and stream variant. Not standard HEC USAT.',
    'active'
  ),
  (
    'hec-usat',
    'hec-usat',
    'HEC USAT',
    'scholarship',
    'HEC undergraduate admission test with six official stream variants. Standard USAT workflow is not established yet.',
    'draft'
  ),
  (
    'nust-net',
    'nust-net',
    'NUST Entry Test (NET)',
    'engineering',
    'One NUST exam with official paper variants. Only the Engineering variant has a verified blueprint.',
    'active'
  ),
  (
    'giki-undergraduate-test',
    'giki-undergraduate-test',
    'GIKI Undergraduate Admission Test',
    'engineering',
    'Separate exam identity. No independent GIKI blueprint or bank is established yet.',
    'draft'
  ),
  (
    'lums-sbasse-lcat',
    'lums-sbasse-lcat',
    'LUMS SBASSE — LCAT route',
    'engineering',
    'Distinct LCAT preparation route. SAT and ACT remain separate LUMS admission routes.',
    'draft'
  ),
  (
    'pma-long-course',
    'pma-long-course',
    'PMA Long Course',
    'defence',
    'Initial-test preparation for the PMA Long Course selection journey.',
    'active'
  ),
  (
    'issb-selection',
    'issb-selection',
    'ISSB Selection Preparation',
    'defence',
    'Focused reasoning drills only; not a complete ISSB selection-preparation workflow.',
    'draft'
  )
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  category = excluded.category,
  description = excluded.description,
  status = excluded.status,
  updated_at = timezone('utc'::text, now());

insert into public.exam_variants (id, exam_id, slug, title, paper_profile, status)
values
  (
    'pmdc-mdcat-national',
    'pmdc-mdcat',
    'national',
    'National MDCAT paper',
    '{}'::jsonb,
    'active'
  ),
  (
    'nums-mdcat-mdcat',
    'nums-mdcat',
    'mdcat',
    'NUMS MDCAT paper',
    '{}'::jsonb,
    'draft'
  ),
  (
    'hec-bfap-scholarship-pre-medical',
    'hec-bfap-scholarship',
    'pre-medical',
    'Pre-Medical scholarship paper',
    '{}'::jsonb,
    'active'
  ),
  (
    'hec-usat-pre-medical',
    'hec-usat',
    'pre-medical',
    'Pre-Medical stream',
    '{}'::jsonb,
    'draft'
  ),
  (
    'nust-net-engineering',
    'nust-net',
    'engineering',
    'Engineering paper',
    '{}'::jsonb,
    'active'
  ),
  (
    'giki-undergraduate-test-general',
    'giki-undergraduate-test',
    'general',
    'General paper',
    '{}'::jsonb,
    'draft'
  ),
  (
    'lums-sbasse-lcat-general',
    'lums-sbasse-lcat',
    'general',
    'LCAT paper',
    '{}'::jsonb,
    'draft'
  ),
  (
    'pma-long-course-initial',
    'pma-long-course',
    'initial',
    'Initial test',
    '{}'::jsonb,
    'active'
  ),
  (
    'issb-selection-selection',
    'issb-selection',
    'selection',
    'Selection-stage reasoning drills',
    '{}'::jsonb,
    'draft'
  )
on conflict (id) do update set
  exam_id = excluded.exam_id,
  slug = excluded.slug,
  title = excluded.title,
  paper_profile = excluded.paper_profile,
  status = excluded.status,
  updated_at = timezone('utc'::text, now());

comment on table public.exam_registry is
  'Stable exam identities. Only rows with status = active are publicly readable and usable by student goals.';
comment on table public.exam_variants is
  'Official paper/stream variants. A student goal always names one variant of one active exam.';
