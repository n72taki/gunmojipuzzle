const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const defaultRoot = path.join(__dirname, "..", "dist", "android-release");
const rootIndex = process.argv.indexOf("--root");
const outputRoot =
  rootIndex >= 0 && process.argv[rootIndex + 1]
    ? path.resolve(process.cwd(), process.argv[rootIndex + 1])
    : defaultRoot;

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(outputRoot, relativePath), "utf8"));
}

function exists(relativePath) {
  return fs.existsSync(path.join(outputRoot, relativePath));
}

function assertNoTodo(label, value) {
  assert.ok(!JSON.stringify(value).includes("TODO_"), `${label} should not contain TODO placeholders`);
}

function assertHttpsUrl(label, value) {
  assert.equal(typeof value, "string", `${label} should be a string`);
  const url = new URL(value);
  assert.equal(url.protocol, "https:", `${label} should be https://`);
  assert.ok(!value.includes("TODO_"), `${label} should not contain TODO placeholders`);
  return url;
}

function assertFingerprint(value) {
  assert.equal(typeof value, "string", "release fingerprint should be a string");
  assert.match(value, /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/, "release fingerprint should be uppercase colon-separated SHA-256");
}

assert.ok(exists("twa-manifest.json"), "prepared TWA manifest should exist");
assert.ok(exists(path.join(".well-known", "assetlinks.json")), "prepared assetlinks.json should exist");

const twa = readJson("twa-manifest.json");
const assetLinks = readJson(path.join(".well-known", "assetlinks.json"));

assertNoTodo("prepared TWA manifest", twa);
assertNoTodo("prepared assetlinks", assetLinks);

assert.equal(twa.packageId, "com.sharocatcreate.kanagunmatsuri", "prepared package id should stay stable");
assert.match(twa.host, /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i, "prepared host should be a bare DNS host");
assert.equal(twa.display, "standalone", "prepared TWA should use standalone display");
assert.equal(twa.orientation, "portrait", "prepared TWA should keep portrait orientation");
assert.equal(twa.startUrl, "/gunmojipuzzle/index.html", "prepared TWA should launch the game entry");
assert.equal(twa.scope, "/gunmojipuzzle/", "prepared TWA should keep the app scope");

for (const [label, value] of Object.entries({
  manifestUrl: twa.manifestUrl,
  iconUrl: twa.iconUrl,
  maskableIconUrl: twa.maskableIconUrl,
  privacy: twa.store?.policyUrls?.privacy,
  terms: twa.store?.policyUrls?.terms,
  commercialTransactions: twa.store?.policyUrls?.commercialTransactions,
})) {
  const url = assertHttpsUrl(label, value);
  if (["manifestUrl", "iconUrl", "maskableIconUrl"].includes(label)) {
    assert.equal(url.host, twa.host, `${label} should use the prepared TWA host`);
  }
}

const twaFingerprints = twa.signing?.sha256CertFingerprints || [];
assert.equal(twaFingerprints.length, 1, "prepared TWA should contain one release fingerprint");
assertFingerprint(twaFingerprints[0]);

assert.ok(Array.isArray(assetLinks), "prepared assetlinks should be an array");
assert.equal(assetLinks.length, 1, "prepared assetlinks should contain one target");
const target = assetLinks[0]?.target || {};
assert.equal(target.namespace, "android_app", "assetlinks target should be an Android app");
assert.equal(target.package_name, twa.packageId, "assetlinks package name should match the TWA package id");
assert.ok(
  assetLinks[0]?.relation?.includes("delegate_permission/common.handle_all_urls"),
  "assetlinks should delegate URL handling",
);
assert.deepEqual(
  target.sha256_cert_fingerprints,
  twaFingerprints,
  "assetlinks fingerprint should match the TWA signing fingerprint",
);

console.log(`Gunmoji Puzzle Android release output checks passed: ${outputRoot}`);
