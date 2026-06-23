const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

const plan = read(path.join("docs", "CLOSED_TEST_PLAN.md"));
const releaseGate = read(path.join("tools", "release-gate.cjs"));
const releaseReadiness = read(path.join("docs", "MOBILE_RELEASE_READINESS.md"));
const storeListing = read(path.join("docs", "STORE_LISTING_DRAFT.md"));
const fourPerspective = read(path.join("docs", "FOUR_PERSPECTIVE_DEBUG.md"));

for (const phrase of [
  "Google Play",
  "12 opted-in testers",
  "14 days",
  "16-20 testers",
  "internal, closed, and open testing",
  "Data safety form",
  "target audience and content",
  "Player",
  "Educator / Family",
  "Streamer",
  "Viewer / Accessibility",
  "14-Day Test Script",
  "Production Access Notes To Preserve",
]) {
  assert.ok(plan.includes(phrase), `closed test plan missing phrase: ${phrase}`);
}

for (const officialUrl of [
  "https://support.google.com/googleplay/android-developer/answer/9845334",
  "https://support.google.com/googleplay/android-developer/answer/14151465",
  "https://support.google.com/googleplay/android-developer/answer/10787469",
  "https://support.google.com/googleplay/android-developer/answer/9867159",
]) {
  assert.ok(plan.includes(officialUrl), `closed test plan missing official reference: ${officialUrl}`);
}

for (const stopCondition of [
  "Crash on launch",
  "Horizontal overflow",
  "Policy links missing",
  "real purchases",
  "real rewarded ads",
]) {
  assert.ok(plan.includes(stopCondition), `closed test stop condition missing: ${stopCondition}`);
}

assert.ok(releaseGate.includes("check-closed-test-plan.cjs"), "release gate should run the closed test plan check");
assert.ok(releaseReadiness.includes("CLOSED_TEST_PLAN.md"), "release readiness doc should link the closed test plan");
assert.ok(storeListing.includes("CLOSED_TEST_PLAN.md"), "store listing draft should link the closed test plan");
assert.ok(fourPerspective.includes("閉鎖テスト計画"), "four-perspective debug should record the closed test plan addition");

console.log("Gunmoji Puzzle closed test plan checks passed.");
