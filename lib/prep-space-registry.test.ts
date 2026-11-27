import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getPrepSpaceBySlug,
  getPrepSpacesByCategory,
  PREP_SPACES,
} from "./prep-space-registry.ts";

test("Prep Space IDs and slugs are unique", () => {
  assert.equal(new Set(PREP_SPACES.map((space) => space.id)).size, PREP_SPACES.length);
  assert.equal(new Set(PREP_SPACES.map((space) => space.slug)).size, PREP_SPACES.length);
});

test("every Prep Space has explicit readiness and compatibility metadata", () => {
  for (const space of PREP_SPACES) {
    assert.ok(["beta", "content_in_progress", "coming_soon"].includes(space.readiness));
    assert.ok(space.id.length > 0);
    assert.ok(space.name.length > 0);
    assert.ok(space.summary.length > 0);
    assert.ok(space.legacyRoute === null || space.legacyRoute.startsWith("/"));
  }
});

test("standard HEC USAT is distinct from the scholarship test", () => {
  const usat = getPrepSpaceBySlug("hec-usat");
  const scholarship = getPrepSpaceBySlug("hec-bfap-scholarship");

  assert.ok(usat && scholarship);
  assert.notEqual(usat.id, scholarship.id);
  // /usat/practice serves a live 417-question bank, so the catalogue must say
  // beta: "Coming soon" next to a working link was the page's worst lie.
  assert.equal(usat.readiness, "beta");
  // The literal tuple type narrows to never here, so widen it for the check.
  assert.ok((usat.capabilities as readonly string[]).includes("mcq_practice"));
  assert.equal(usat.legacyRoute, "/usat/practice");
  assert.equal(scholarship.readiness, "beta");
});

test("GIKI and LUMS have distinct identities from NUST NET", () => {
  const nust = getPrepSpaceBySlug("nust-net-engineering");
  const giki = getPrepSpaceBySlug("giki-undergraduate-test");
  const lums = getPrepSpaceBySlug("lums-sbasse-lcat");

  assert.ok(nust && giki && lums);
  assert.equal(new Set([nust.id, giki.id, lums.id]).size, 3);
  // GIKI drills on the shared engineering bank; LUMS has no drill because it
  // sets no subject paper (SAT/ACT/LCAT), and the catalogue says so instead of
  // advertising practice the site cannot provide.
  assert.deepEqual(giki.capabilities, ["mcq_practice"]);
  assert.deepEqual(lums.capabilities, []);
  assert.equal(giki.legacyRoute, "/giki/practice");
  assert.equal(lums.legacyRoute, "/lums/practice");
});

test("category lookup returns only matching Prep Spaces", () => {
  assert.ok(
    getPrepSpacesByCategory("medical").every((space) => space.category === "medical"),
  );
  assert.ok(getPrepSpacesByCategory("medical").length >= 2);
});
