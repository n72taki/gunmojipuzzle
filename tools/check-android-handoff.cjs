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

assert.ok(exists("twa-manifest.json"), "TWA manifest draft should exist");
assert.ok(exists(path.join("android", "twa", "assetlinks.template.json")), "Digital Asset Links template should exist");
assert.ok(exists(path.join("docs", "ANDROID_TWA_HANDOFF.md")), "Android TWA handoff doc should exist");
assert.ok(exists(path.join("tools", "prepare-android-release.cjs")), "Android release preparation tool should exist");
assert.ok(exists(path.join("tools", "check-android-release-output.cjs")), "Android release output check should exist");

const twa = JSON.parse(read("twa-manifest.json"));
const assetLinks = JSON.parse(read(path.join("android", "twa", "assetlinks.template.json")));
const handoffDoc = read(path.join("docs", "ANDROID_TWA_HANDOFF.md"));
const productionReadiness = read(path.join("tools", "check-production-readiness.cjs"));
const releasePrep = read(path.join("tools", "prepare-android-release.cjs"));
const releaseOutputCheck = read(path.join("tools", "check-android-release-output.cjs"));

assert.equal(twa.packageId, "com.sharocatcreate.kanagunmatsuri", "package id draft changed unexpectedly");
assert.equal(twa.display, "standalone", "TWA display should match the PWA shape");
assert.equal(twa.orientation, "portrait", "TWA should keep portrait orientation");
assert.ok(twa.manifestUrl.includes("TODO_PUBLIC_HOST"), "TWA manifest should keep host TODO explicit");
assert.ok(twa.signing.sha256CertFingerprints.includes("TODO_RELEASE_CERT_SHA256"), "TWA signing TODO should be explicit");
assert.ok(twa.store.policyUrls.privacy.includes("TODO_PUBLIC_PRIVACY_URL"), "TWA privacy URL TODO should be explicit");
assert.ok(Array.isArray(assetLinks), "assetlinks template should be an array");
assert.equal(assetLinks[0].target.package_name, twa.packageId, "assetlinks package should match the TWA package id");
assert.ok(
  assetLinks[0].target.sha256_cert_fingerprints.includes("TODO_RELEASE_CERT_SHA256"),
  "assetlinks signing TODO should be explicit",
);

for (const phrase of [
  "Trusted Web Activity",
  "Google Play closed test",
  "TODO_PUBLIC_HOST",
  "TODO_RELEASE_CERT_SHA256",
  "check-production-readiness.cjs",
  "prepare-android-release.cjs",
  "check-android-release-output.cjs",
  "RELEASE_CERT_SHA256",
  "Four-Perspective Release Notes",
]) {
  assert.ok(handoffDoc.includes(phrase), `Android handoff doc missing phrase: ${phrase}`);
}

for (const phrase of [
  "PUBLIC_HOST",
  "PUBLIC_PRIVACY_URL",
  "PUBLIC_TERMS_URL",
  "PUBLIC_COMMERCIAL_URL",
  "RELEASE_CERT_SHA256",
  "--dry-run",
  ".well-known",
  "assetlinks.json",
]) {
  assert.ok(releasePrep.includes(phrase), `Android release prep tool missing phrase: ${phrase}`);
}

for (const phrase of [
  "twa-manifest.json",
  ".well-known",
  "assetlinks.json",
  "delegate_permission/common.handle_all_urls",
  "sha256_cert_fingerprints",
  "com.sharocatcreate.kanagunmatsuri",
]) {
  assert.ok(releaseOutputCheck.includes(phrase), `Android release output check missing phrase: ${phrase}`);
}

for (const blockerId of [
  "twa-manifest-placeholder",
  "twa-host-placeholder",
  "twa-signing-fingerprint-placeholder",
  "android-assetlinks-placeholder",
]) {
  assert.ok(productionReadiness.includes(blockerId), `production guard should block ${blockerId}`);
}

console.log("Gunmoji Puzzle Android TWA handoff checks passed.");
