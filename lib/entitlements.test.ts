// Policy tests for exam-scoped access. Pure logic, so every branch of the
// free-beta → paid switch is exercised without a database.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  decideAccess,
  isEntitlementLive,
  isKnownPrepSpaceId,
  LAUNCH_ACCESS_POLICY,
  type EntitlementRow,
} from "./entitlements.ts";

const NOW = new Date("2026-11-25T12:00:00Z");

const grant = (over: Partial<EntitlementRow> = {}): EntitlementRow => ({
  prepSpaceId: "nust-net-engineering",
  source: "purchase",
  status: "active",
  startsAt: new Date("2026-11-01T00:00:00Z"),
  endsAt: new Date("2027-11-01T00:00:00Z"),
  ...over,
});

test("the shipped launch policy is the free beta, not a locked product", () => {
  assert.equal(LAUNCH_ACCESS_POLICY, "beta_open");
});

test("every Prep Space ID in the catalogue is recognised, and junk is not", () => {
  assert.equal(isKnownPrepSpaceId("nust-net-engineering"), true);
  assert.equal(isKnownPrepSpaceId("pma-long-course"), true);
  assert.equal(isKnownPrepSpaceId("not-a-prep-space"), false);
  assert.equal(isKnownPrepSpaceId(""), false);
});

test("an unknown Prep Space is denied even under the free beta", () => {
  const decision = decideAccess({
    policy: "beta_open",
    prepSpaceId: "totally-made-up",
    entitlements: [],
    now: NOW,
  });
  assert.deepEqual(decision, { allowed: false, reason: "unknown_prep_space", via: null });
});

test("free beta allows a known space without any grant, and says why", () => {
  const decision = decideAccess({
    policy: "beta_open",
    prepSpaceId: "nust-net-engineering",
    entitlements: [],
    now: NOW,
  });
  assert.equal(decision.allowed, true);
  assert.equal(decision.reason, "public_beta");
  assert.equal(decision.via, null);
});

test("entitled_only denies a space the student never bought", () => {
  const decision = decideAccess({
    policy: "entitled_only",
    prepSpaceId: "nust-net-engineering",
    entitlements: [],
    now: NOW,
  });
  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "no_entitlement");
});

test("a live grant is allowed under entitled_only and reports the row used", () => {
  const row = grant();
  const decision = decideAccess({
    policy: "entitled_only",
    prepSpaceId: "nust-net-engineering",
    entitlements: [row],
    now: NOW,
  });
  assert.equal(decision.allowed, true);
  assert.equal(decision.reason, "entitled");
  assert.equal(decision.via, row);
});

test("one Prep Space's grant never unlocks another", () => {
  const decision = decideAccess({
    policy: "entitled_only",
    prepSpaceId: "pma-long-course",
    entitlements: [grant({ prepSpaceId: "nust-net-engineering" })],
    now: NOW,
  });
  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "no_entitlement");
});

test("an expired grant is denied, and the end instant is exclusive", () => {
  const expired = grant({ endsAt: new Date("2026-11-25T12:00:00Z") });
  assert.equal(isEntitlementLive(expired, NOW), false);
  const decision = decideAccess({
    policy: "entitled_only",
    prepSpaceId: "nust-net-engineering",
    entitlements: [expired],
    now: new Date("2026-11-25T12:00:01Z"),
  });
  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "expired");
});

test("a grant that has not started yet is denied and named as such", () => {
  const decision = decideAccess({
    policy: "entitled_only",
    prepSpaceId: "nust-net-engineering",
    entitlements: [grant({ startsAt: new Date("2026-12-01T00:00:00Z") })],
    now: NOW,
  });
  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "not_started");
});

test("a revoked grant is denied and reported separately from a lapsed one", () => {
  const decision = decideAccess({
    policy: "entitled_only",
    prepSpaceId: "nust-net-engineering",
    entitlements: [grant({ status: "revoked" })],
    now: NOW,
  });
  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "revoked");
});

test("an open-ended grant (launch grant) stays live without an end date", () => {
  const decision = decideAccess({
    policy: "entitled_only",
    prepSpaceId: "pma-long-course",
    entitlements: [grant({ prepSpaceId: "pma-long-course", source: "launch_grant", endsAt: null })],
    now: new Date("2030-01-01T00:00:00Z"),
  });
  assert.equal(decision.allowed, true);
  assert.equal(decision.reason, "entitled");
});

test("a lapsed grant plus a fresh one is allowed via the fresh one", () => {
  const lapsed = grant({ endsAt: new Date("2026-01-01T00:00:00Z") });
  const fresh = grant({ startsAt: new Date("2026-11-20T00:00:00Z") });
  const decision = decideAccess({
    policy: "entitled_only",
    prepSpaceId: "nust-net-engineering",
    entitlements: [lapsed, fresh],
    now: NOW,
  });
  assert.equal(decision.allowed, true);
  assert.equal(decision.via, fresh);
});
