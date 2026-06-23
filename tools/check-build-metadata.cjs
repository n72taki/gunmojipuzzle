const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

const data = require("../data/cards.js");
const html = read("index.html");
const gameJs = read(path.join("scripts", "game.js"));
const styles = read("styles.css");
const buildDoc = read(path.join("docs", "BUILD_METADATA.md"));
const readme = read("README.md");
const releaseReadiness = read(path.join("docs", "MOBILE_RELEASE_READINESS.md"));
const closedTestPlan = read(path.join("docs", "CLOSED_TEST_PLAN.md"));
const playConsolePack = read(path.join("docs", "PLAY_CONSOLE_SUBMISSION_PACK.md"));
const appStorePack = read(path.join("docs", "APP_STORE_SUBMISSION_PACK.md"));
const releaseGate = read(path.join("tools", "release-gate.cjs"));
const smoke = read(path.join("tools", "smoke-browser.cjs"));

assert.deepEqual(
  data.build,
  {
    versionName: "0.1.0",
    versionCode: 1,
    channel: "closed-test",
    buildId: "0.1.0-closed-test.1",
    builtAt: "2026-06-12",
  },
  "build metadata changed unexpectedly",
);

for (const token of ["buildVersionText", "buildChannelText", "BUILD"]) {
  assert.ok(html.includes(token), `settings screen should expose build metadata token: ${token}`);
}

for (const token of [
  "BUILD_INFO",
  "formatBuildLabel",
  "buildInfo: BUILD_INFO",
  "build: BUILD_INFO.buildId",
]) {
  assert.ok(gameJs.includes(token), `game runtime should wire build metadata token: ${token}`);
}

assert.ok(styles.includes(".build-panel"), "build panel should have dedicated styling");
assert.ok(buildDoc.includes("0.1.0-closed-test.1"), "build metadata doc should document current build id");
assert.ok(buildDoc.includes("Four-Perspective Review"), "build metadata doc should include four-perspective notes");
assert.ok(buildDoc.includes("APP_STORE_SUBMISSION_PACK.md"), "build metadata doc should link App Store handoff");
assert.ok(readme.includes("BUILD_METADATA.md"), "README should document build metadata");
assert.ok(releaseReadiness.includes("BUILD_METADATA.md"), "release readiness should link build metadata");
assert.ok(closedTestPlan.includes("Build version tested"), "closed test plan should preserve build version notes");
assert.ok(playConsolePack.includes("BUILD_METADATA.md"), "Play Console pack should link build metadata");
assert.ok(appStorePack.includes("App Store Submission Pack"), "App Store pack should exist for native handoff");
assert.ok(appStorePack.includes("ios/app-store-connect.template.json"), "App Store pack should link iOS metadata template");
assert.ok(releaseGate.includes("check-build-metadata.cjs"), "release gate should run build metadata check");
assert.ok(smoke.includes("buildInfo"), "browser smoke should inspect runtime build info");
assert.ok(smoke.includes("buildLabel"), "browser smoke should inspect formatted build label");
assert.ok(smoke.includes("feedbackReportButtonExists"), "browser smoke should verify removed feedback report surfaces stay removed");

console.log("Gunmoji Puzzle build metadata checks passed.");
