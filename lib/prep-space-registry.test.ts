import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getPrepSpaceBySlug,
  getPrepSpacesByCategory,
  PREP_SPACES,
} from "./prep-space-registry.ts";

test("Prep Space IDs and slugs are unique and stable", () => {
  assert.equal(new Set(PREP_SPACES.map((space) => space.id)).size, PREP_SPACES.length);
  assert.equal(new Set(PREP_SPACES.map((space) => space.slug)).size, PREP_SPACES.length);
});

test("every Prep Space has an explicit readiness state and legacy route decision", () => {
  for (const space of PREP_SPACES) {
    assert.ok(["beta", "content_in_progress", "coming_soon"].includes(space.readiness));
    assert.ok(space.id.length > 0);
    assert.ok(space.name.length > 0);
    assert.ok(space.summary.length > 0);
    assert.ok(space.legacyRoute === null || space.legacyRoute.startsWith("/"));
  }
});

test("standard HEC USAT is not confused with the scholarship test", () => {
  const usat = getPrepSpaceBySlug("hec-usat");
  const scholarship = getPrepSpaceBySlug("hec-bfap-scholarship");

  assert.ok(usat);
  assert.ok(scholarship);
  assert.notEqual(usat.id, scholarship.id);
  assert.equal(usat.readiness, "coming_soon");
  assert.equal(scholarship.readiness, "beta");
});

test("GIKI and LUMS have distinct identities from NUST NET", () => {
  const nust = getPrepSpaceBySlug("nust-net-engineering");
  const giki = getPrepSpaceBySlug("giki-undergraduate-test");
  const lums = getPrepSpaceBySlug("lums-sbasse-lcat");

  assert.ok(nust && giki && lums);
  assert.equal(new Set([nust.id, giki.id, lums.id]).size, 3);
  assert.deepEqual(giki.capabilities, []);
  assert.deepEqual(lums.capabilities, []);
});

test("category lookup returns only matching Prep Spaces", () => {
  assert.ok(
    getPrepSpacesByCategory("medical").every((space) => space.category === "medical"),
  );
  assert.ok(getPrepSpacesByCategory("medical").length >= 2);
});
