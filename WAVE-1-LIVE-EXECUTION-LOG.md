# Wave 1 Live Execution Log — 2026-11-21

Repository: `agma668/mdcatprep`
Scope: Apex Academy / Med first, sequential Wave 1 foundation work.
This is an execution appendix to `ROADMAP-AGENT-BOARD.md`. It records observed evidence and does not replace the master roadmap.

## Latest CI diagnosis

### PR #23 — goal-scoped public-sample delivery
- PR: https://github.com/agma668/mdcatprep/pull/23
- Head: `87f093239ad57e8fda40f1892eae6443c48bdc68`
- Run #45: https://github.com/agma668/mdcatprep/actions/runs/44799494870
- Result: failed in `npm test`; 77 tests passed and the RLS-goals test failed before its assertions because the checkout did not contain `supabase/migrations/20261114000000_student_goals_ownership_and_primary_fix.sql`.
- ESLint and TypeScript were skipped because the test step failed.
- This is the already-known missing migration dependency, not a failure in the new goal-question policy tests. The log shows those four new policy tests passed.
- No source-code defect in the PR was established by this run; lint and TypeScript remain unverified.

## Controlled CI dependency correction

- PR #22 branch: `fix/rls-goals-migration-ci-dependency`.
- Added the already-proposed all-PR quality workflow change from PR #19 to this branch. The workflow keeps `push` checks limited to `main`, uses read-only contents permissions and pinned actions, and removes the `pull_request: branches: [main]` restriction so stacked PRs targeting this branch can receive checks.
- New PR #22 head: `6df4886a78661922d954107d1f00065e31dafc09`.
- PR #22 Actions run #46: https://github.com/agma668/mdcatprep/actions/runs/44800155074
- At last inspection, dependency installation had passed and `npm test` was running; lint and TypeScript were pending. Do not claim a pass until the run completes.
- PR #23 has been retargeted from `main` to the PR #22 branch, creating an explicit dependency chain. This gives PR #23 the migration and all-PR workflow in its base branch without copying the migration into multiple branches.
- PR #23 remains draft and unmerged. Its earlier run #45 is still a failure on the old base; a fresh run after retargeting has not yet been observed.
- PR #19 remains open/draft for now; its workflow change has been incorporated into the PR #22 branch. Do not close it until the new CI path is verified.

## Safety and approval boundaries

- PR #22 and #23 remain open drafts. No PR was merged.
- No migration was applied to Supabase. A migration file in GitHub and a passing disposable test are not a production database change.
- No Auth settings, production data, secrets, deployment settings, content imports or production promotions were changed.
- No Wave 2 public landing implementation or Wave 3 question ingestion has started; Wave 1 remains active.

## Next actions

1. Poll PR #22 run #46 to completion; inspect the failing step logs if it fails.
2. Confirm PR #23 receives a new Actions run against its updated PR #22 base. If no run is triggered, create a minimal meaningful follow-up commit or use an available supported rerun only after confirming the run's tested merge ref.
3. Once #22 CI is green, inspect the migration and workflow diff, keep both drafts for founder review, and request explicit approval before merging either.
4. After the migration is integrated by approval, rerun PR #19 or close it as superseded only after confirming its workflow change is present on the canonical base.
5. Preserve the landing PR #16 → #17 stack and get each branch a visible CI run after the workflow is available in its base branch.
6. Continue issue #20 only after the schema/CI dependency is integrated and the delivery seam is reviewed. The current PR #23 is only the first server-side public-sample seam; it does not yet record attempts or support offline goal identity.

## Wave 1 status

**In progress — CI dependency correction and goal-scoped delivery slice under review.** No production change or merge is authorized by this log.


## Follow-up — CI run #46 and stacked delivery PR (2026-11-21)

- PR #22 run #46 completed successfully: `npm ci`, `npm test`, `npm run lint`, and `npx tsc --noEmit` all passed. Run: https://github.com/agma668/mdcatprep/actions/runs/44800155074
- Updated PR #22 description to make its combined scope explicit: ownership migration + all-PR quality workflow. PR #22 remains draft/unmerged pending founder review and explicit approval.
- PR #23 is now based on `fix/rls-goals-migration-ci-dependency`, not `main`. It does not duplicate the migration. Its head is `9e2d3031b1db6ec6af7dd3760ea2d2b51fddf17c`.
- Code review found that the separate answer lookup revalidated goal ownership and mapping but did not recheck that the exam and variant were still active. Added that check before reading the answer. This is a fail-closed guard; it does not expose the answer key to a client.
- PR #23 body now accurately records the stacked dependency and current validation state. The earlier run #45 remains failed against the old `main` base. No fresh Actions run has yet appeared for the retargeted PR #23 head; do not claim lint/typecheck passed for #23.
- PR #19 was closed as superseded after its workflow change was incorporated into PR #22. It was not merged.
- The new all-PR workflow did not produce a visible run for PR #23 after retarget/head update during this inspection. The next task is to diagnose the missing event/check and establish a verified CI run for PR #23, then continue reviewing the goal-scoped submission/attempt path.
- No production migration, Auth setting, database data, secrets, deployment promotion or merge was performed.
