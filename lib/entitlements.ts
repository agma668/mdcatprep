/**
 * Exam-scoped access policy — the decision, with no I/O.
 *
 * The product decision is one account with exam-specific Prep Spaces, where
 * access is granted per Prep Space and enforced on the server. That needs two
 * halves: rows that record the grant (supabase/migrations/20261125000000_*),
 * and one place that turns those rows into an allow/deny answer. This is the
 * second half, deliberately pure so every branch is testable without a
 * database and the policy can change without touching a route.
 *
 * Nothing here reads Supabase, cookies or headers. Routes and server actions
 * fetch entitlements and call `decideAccess`; a screen never decides anything
 * by hiding a card.
 */

// Explicit .ts extension: this module is also loaded by `node --test` (type
// stripping), where extensionless relative imports do not resolve. tsconfig
// enables allowImportingTsExtensions for exactly this.
import { PREP_SPACES } from "./prep-space-registry.ts";

/**
 * `beta_open`  — the deliberate launch state: every published practice surface
 *                is usable while the bank is being proven, so the beta builds
 *                trust before anything is charged.
 * `entitled_only` — what the switch becomes when access is sold: a Prep Space
 *                answers only for students holding a live grant.
 *
 * Flipping this single constant is the difference between "free beta" and
 * "chargeable"; both must remain tested states, not a dead flag.
 */
export type AccessPolicy = "beta_open" | "entitled_only";

export const LAUNCH_ACCESS_POLICY: AccessPolicy = "beta_open";

export type EntitlementSource =
  | "purchase"
  | "scholarship"
  | "trial"
  | "sponsored"
  | "staff"
  | "launch_grant";

export type EntitlementStatus = "active" | "revoked" | "expired";

/** The columns the decision needs, and nothing else. */
export interface EntitlementRow {
  prepSpaceId: string;
  source: EntitlementSource;
  status: EntitlementStatus;
  startsAt: Date;
  /** null means no fixed end (a beta launch grant); every paid grant sets one. */
  endsAt: Date | null;
}

export type AccessReason =
  | "public_beta"
  | "entitled"
  | "unknown_prep_space"
  | "revoked"
  | "expired"
  | "not_started"
  | "no_entitlement";

export interface AccessDecision {
  allowed: boolean;
  reason: AccessReason;
  /** The row that allowed access, so a caller can explain which grant it used. */
  via: EntitlementRow | null;
}

const PREP_SPACE_IDS = new Set<string>(PREP_SPACES.map((space) => space.id));

/**
 * Guards the database too: `prep_space_id` is free text there because the
 * catalogue lives in the app, so an unknown ID must never be treated as a
 * wildcard or silently allowed.
 */
export function isKnownPrepSpaceId(id: string): boolean {
  return PREP_SPACE_IDS.has(id);
}

/**
 * Live means: status active, already started, and not past its end. The end is
 * exclusive — a grant that ends at 18:00 is not usable at 18:00, which is the
 * safer reading for access that was paid for.
 */
export function isEntitlementLive(row: EntitlementRow, now: Date): boolean {
  if (row.status !== "active") return false;
  if (row.startsAt.getTime() > now.getTime()) return false;
  if (row.endsAt !== null && row.endsAt.getTime() <= now.getTime()) return false;
  return true;
}

/**
 * One answer for "may this student use this Prep Space right now".
 *
 * Order matters: an unknown Prep Space is denied before anything else, so a
 * typo or a probe can never fall through to the beta allowance. Under
 * `beta_open` a known but ungranted space is allowed and says so in its reason,
 * which is what an audit or a UI needs to show honestly.
 */
export function decideAccess(input: {
  policy: AccessPolicy;
  prepSpaceId: string;
  entitlements: readonly EntitlementRow[];
  now?: Date;
}): AccessDecision {
  const now = input.now ?? new Date();

  if (!isKnownPrepSpaceId(input.prepSpaceId)) {
    return { allowed: false, reason: "unknown_prep_space", via: null };
  }

  const forSpace = input.entitlements.filter(
    (row) => row.prepSpaceId === input.prepSpaceId,
  );

  const live = forSpace.find((row) => isEntitlementLive(row, now));
  if (live) return { allowed: true, reason: "entitled", via: live };

  if (input.policy === "beta_open") {
    return { allowed: true, reason: "public_beta", via: null };
  }

  // Under entitled_only, say the most useful true thing: a revoked grant is a
  // different conversation from one that lapsed, and both differ from never
  // having bought the space at all.
  if (forSpace.some((row) => row.status === "revoked")) {
    return { allowed: false, reason: "revoked", via: null };
  }
  if (
    forSpace.some(
      (row) => row.status === "active" && row.endsAt !== null && row.endsAt.getTime() <= now.getTime(),
    )
  ) {
    return { allowed: false, reason: "expired", via: null };
  }
  if (forSpace.some((row) => row.status === "active" && row.startsAt.getTime() > now.getTime())) {
    return { allowed: false, reason: "not_started", via: null };
  }
  return { allowed: false, reason: "no_entitlement", via: null };
}
