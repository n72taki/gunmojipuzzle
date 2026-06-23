const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

const pack = read(path.join("docs", "PLAY_CONSOLE_SUBMISSION_PACK.md"));
const contentRating = read(path.join("docs", "CONTENT_RATING_DRAFT.md"));
const storeListing = read(path.join("docs", "STORE_LISTING_DRAFT.md"));
const releaseReadiness = read(path.join("docs", "MOBILE_RELEASE_READINESS.md"));
const closedTestPlan = read(path.join("docs", "CLOSED_TEST_PLAN.md"));
const dataSafety = read(path.join("docs", "DATA_SAFETY_DRAFT.md"));
const androidHandoff = read(path.join("docs", "ANDROID_TWA_HANDOFF.md"));
const promoQa = read(path.join("docs", "PROMO_ASSET_QA.md"));
const storeQa = read(path.join("docs", "STORE_ASSET_QA.md"));
const buildMetadata = read(path.join("docs", "BUILD_METADATA.md"));
const readme = read("README.md");
const releaseGate = read(path.join("tools", "release-gate.cjs"));
const productionReadiness = read(path.join("tools", "check-production-readiness.cjs"));
const twaManifest = JSON.parse(read("twa-manifest.json"));

for (const phrase of [
  "Play Console Submission Pack",
  "Official References To Recheck",
  "App Setup Draft",
  "Store Listing Inputs",
  "App Content Draft",
  "Closed Test Package",
  "Production Submission Blockers",
  "Four-Perspective Submission Review",
  "BUILD_METADATA.md",
  "0.1.0-closed-test.1",
  "com.sharocatcreate.kanagunmatsuri",
  "Target API",
  "13+",
  "Content ratings questionnaire",
  "CONTENT_RATING_DRAFT.md",
  "Data safety form",
  "Target audience and content",
  "feature-graphic.jpg",
  "public-screenshots",
  "09-ranking",
  "CLOSED TEST",
  "TEST AD",
  "TEST GRANT",
  "server authority",
  "exchange-daruma",
]) {
  assert.ok(pack.includes(phrase), `submission pack missing phrase: ${phrase}`);
}

for (const officialUrl of [
  "https://support.google.com/googleplay/android-developer/answer/9866151",
  "https://developer.android.com/google/play/requirements/target-sdk",
  "https://support.google.com/googleplay/android-developer/answer/9845334",
  "https://support.google.com/googleplay/android-developer/answer/14151465",
  "https://support.google.com/googleplay/android-developer/answer/10787469",
  "https://support.google.com/googleplay/android-developer/answer/9867159",
  "https://support.google.com/googleplay/android-developer/answer/9859655",
]) {
  assert.ok(pack.includes(officialUrl), `submission pack missing official reference: ${officialUrl}`);
}

for (const artifact of [
  "docs/STORE_LISTING_DRAFT.md",
  "docs/DATA_SAFETY_DRAFT.md",
  "docs/CLOSED_TEST_PLAN.md",
  "docs/CONTENT_RATING_DRAFT.md",
  "docs/ANDROID_TWA_HANDOFF.md",
  "docs/PROMO_ASSET_QA.md",
  "docs/STORE_ASSET_QA.md",
  "docs/BUILD_METADATA.md",
  "store-assets/feature-graphic.jpg",
  "store-assets/public-screenshots/01-title.png",
  "tools/release-gate.cjs",
  "tools/check-production-readiness.cjs",
  "tools/check-build-metadata.cjs",
]) {
  assert.ok(exists(artifact), `submission artifact missing: ${artifact}`);
}

assert.equal(twaManifest.packageId, "com.sharocatcreate.kanagunmatsuri", "submission pack package id must match TWA manifest");
assert.ok(storeListing.includes("Short Description") && storeListing.includes("Full Description Draft"), "store listing draft should include copy fields");
assert.ok(dataSafety.includes("No real payment SDK flow"), "data safety draft should match current no-real-payment state");
assert.ok(closedTestPlan.includes("14-Day Test Script"), "closed test plan should include day-by-day test actions");
assert.ok(contentRating.includes("Questionnaire Draft"), "content rating draft should include questionnaire answers");
assert.ok(contentRating.includes("No real ad SDK"), "content rating draft should match current SDK state");
assert.ok(androidHandoff.includes("Trusted Web Activity"), "Android handoff should document the wrapper route");
assert.ok(promoQa.includes("1024x500"), "promo QA should document feature graphic size");
assert.ok(storeQa.includes("1290x2796"), "store asset QA should document screenshot size");
assert.ok(buildMetadata.includes("Version name: `0.1.0`"), "build metadata should document version name");
assert.ok(buildMetadata.includes("Build id: `0.1.0-closed-test.1`"), "build metadata should document build id");
assert.ok(productionReadiness.includes("local-economy-with-ad-recovery"), "production guard should block local rewarded economy");
assert.ok(productionReadiness.includes("twa-manifest-placeholder"), "production guard should block unresolved TWA placeholders");

for (const source of [
  ["README", readme],
  ["release readiness", releaseReadiness],
  ["store listing", storeListing],
  ["release gate", releaseGate],
]) {
  assert.ok(source[1].includes("PLAY_CONSOLE_SUBMISSION_PACK.md") || source[1].includes("check-play-console-pack.cjs"), `${source[0]} should link the submission pack`);
}

console.log("Gunmoji Puzzle Play Console submission pack checks passed.");
