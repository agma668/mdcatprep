# Apex Pakistan — project boundary and infrastructure baseline

**Verified:** 2026-11-09  
**Repository:** `agma668/mdcatprep`  
**Working branch:** `main` (changes on feature branches until reviewed)

## Ownership and scope

Apex Pakistan is the sole product in this repository. The founder confirmed that the Vercel project `edweb` and Supabase project `edweb` are the Apex Pakistan application stack. Any other preparation website has independent infrastructure and is outside this repository, its data, credentials, deployments and all tasks here.

Do not create a replacement Supabase project, reset the existing database, or import code/content from another site. Do not inspect or change other websites' accounts or infrastructure.

## Connected infrastructure

| Layer | Confirmed resource | Current state |
|---|---|---|
| Source | GitHub `agma668/mdcatprep` | Active source branch `main` |
| Hosting | Vercel project `edweb` | Latest production deployment `READY` on `main` |
| Database/Auth | Supabase project `edweb` (`niiskuwlpccmdtwjoxvm`) | `ACTIVE_HEALTHY`, Tokyo (`ap-northeast-1`) |

## Read-only baseline

- Supabase: 22 applied migrations, 13 public tables, RLS enabled on all 13 tables in the latest inventory.
- Rows: `profiles` 2, `client_telemetry` 65; questions, attempts, bookmarks, flashcard reviews, notes and other activity tables returned 0 rows.
- No personal profile fields were copied into this document.
- Vercel's latest production deployment at inspection used commit `ea2623f2c7b2fbbd45f5893962ae19ce901a9b6b`.
- Vercel SSO protection is configured for `preview` deployments only; production deployment URLs are not covered by SSO. Preview deployments remain protected. Password protection and trusted-IP restrictions are disabled. This setting was changed on 2026-11-09 at the founder's request; public HTTP access still needs a clean-browser smoke test.
- The production deployment `edweb-ovxu35vdz-acma-32c6.vercel.app` is `READY` and has the stable project alias `https://edweb-nine.vercel.app`; canonical fallback is being aligned to that verified alias. No custom domain is attached.

## Operating rules

1. Preserve the existing Apex `edweb` Supabase project and its data.
2. Keep exam content and student progress separated by stable exam/variant IDs and goal-scoped persistence—not by creating separate websites.
3. Do not run the legacy MDCAT seed script against production; it lacks exam/variant mappings and publishes rows through the service-role key.
4. Do not alter production RLS, schema, data, auth, secrets, custom domains or billing without a task-specific reviewed rollout. Vercel SSO is preview-only by founder-approved setting; do not weaken preview protection.
5. No other website's data, source code, secrets, or infrastructure may be used in Apex.

This document records verified configuration and founder-confirmed ownership. The preview-only SSO policy was explicitly approved by the founder; it does not authorize production schema/data, auth, secret, domain or billing changes.
