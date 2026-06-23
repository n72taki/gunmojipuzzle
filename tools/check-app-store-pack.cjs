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

function readJson(file) {
  return JSON.parse(read(file));
}

const appStorePack = read(path.join("docs", "APP_STORE_SUBMISSION_PACK.md"));
const mobileReadiness = read(path.join("docs", "MOBILE_RELEASE_READINESS.md"));
const storeListing = read(path.join("docs", "STORE_LISTING_DRAFT.md"));
const dataSafety = read(path.join("docs", "DATA_SAFETY_DRAFT.md"));
const rights = read(path.join("docs", "RIGHTS_AND_MONETIZATION.md"));
const contentRating = read(path.join("docs", "CONTENT_RATING_DRAFT.md"));
const buildMetadata = read(path.join("docs", "BUILD_METADATA.md"));
const productionReadiness = read(path.join("tools", "check-production-readiness.cjs"));
const releaseGate = read(path.join("tools", "release-gate.cjs"));
const appStoreConnect = readJson(path.join("ios", "app-store-connect.template.json"));
const wrapper = readJson(path.join("ios", "wkwebview-wrapper.template.json"));

for (const artifact of [
  "ios/README.md",
  "ios/app-store-connect.template.json",
  "ios/wkwebview-wrapper.template.json",
  "docs/APP_STORE_SUBMISSION_PACK.md",
  "docs/STORE_LISTING_DRAFT.md",
  "docs/DATA_SAFETY_DRAFT.md",
  "docs/CONTENT_RATING_DRAFT.md",
  "docs/RIGHTS_AND_MONETIZATION.md",
  "store-assets/public-screenshots/01-title.png",
  "store-assets/public-screenshots/08-missions.png",
  "store-assets/feature-graphic.jpg",
]) {
  assert.ok(exists(artifact), `App Store artifact missing: ${artifact}`);
}

for (const phrase of [
  "App Store Submission Pack",
  "Official References To Recheck",
  "WKWebView",
  "Xcode 26",
  "iOS 26 SDK",
  "StoreKit",
  "G12",
  "G55",
  "G120",
  "G260",
  "purchase UI disabled",
  "TODO_PUBLIC_PRIVACY_URL",
  "TODO_PUBLIC_SUPPORT_URL",
  "check-app-store-pack.cjs",
  "check-production-readiness.cjs --expect-blockers",
]) {
  assert.ok(appStorePack.includes(phrase), `App Store pack missing phrase: ${phrase}`);
}

for (const officialUrl of [
  "https://developer.apple.com/news/upcoming-requirements/",
  "https://developer.apple.com/app-store/review/guidelines/",
  "https://developer.apple.com/help/app-store-connect/reference/app-information/",
  "https://developer.android.com/google/play/requirements/target-sdk",
  "https://support.google.com/googleplay/android-developer/answer/10281818",
  "https://support.google.com/googleplay/android-developer/answer/10787469",
]) {
  assert.ok(appStorePack.includes(officialUrl), `App Store pack missing official reference: ${officialUrl}`);
}

assert.equal(appStoreConnect.platform, "ios", "App Store template platform should be ios");
assert.equal(appStoreConnect.bundleId, "com.sharocatcreate.kanagunmatsuri", "iOS bundle id changed unexpectedly");
assert.equal(appStoreConnect.sku, "KANAGUNMATSURI-IOS-001", "iOS SKU changed unexpectedly");
assert.equal(appStoreConnect.primaryLocale, "ja-JP", "iOS primary locale should be ja-JP");
assert.equal(appStoreConnect.pricing.gCurrencyPurchases, "BLOCKED_UNTIL_STOREKIT_OR_DISABLED", "G purchases must be blocked until StoreKit or disabled UI");
assert.ok(appStoreConnect.privacy.policyUrl.includes("TODO_PUBLIC_PRIVACY_URL"), "privacy URL TODO should remain explicit");
assert.ok(appStoreConnect.support.supportUrl.includes("TODO_PUBLIC_SUPPORT_URL"), "support URL TODO should remain explicit");
assert.ok(appStoreConnect.toolchain.requiredXcode.includes("26"), "Xcode 26 requirement should be tracked");
assert.ok(appStoreConnect.toolchain.requiredSdk.includes("iOS 26"), "iOS 26 SDK requirement should be tracked");
assert.equal(appStoreConnect.pricing.storeKitProducts.length, 4, "all four planned G bundles should be represented");

assert.equal(wrapper.wrapper, "WKWebView", "iOS wrapper route should be WKWebView");
assert.equal(wrapper.bundleId, appStoreConnect.bundleId, "wrapper bundle id should match App Store Connect template");
assert.ok(wrapper.blockedUntilResolved.includes("BLOCKED_UNTIL_STOREKIT_OR_DISABLED"), "wrapper should block unresolved G purchase flow");
assert.ok(wrapper.qaChecklist.some((item) => item.includes("purchase mock")), "wrapper QA should catch purchase mock copy");

for (const [label, source] of [
  ["mobile readiness", mobileReadiness],
  ["store listing", storeListing],
  ["data safety", dataSafety],
  ["rights", rights],
  ["content rating", contentRating],
  ["build metadata", buildMetadata],
  ["production readiness", productionReadiness],
  ["release gate", releaseGate],
]) {
  assert.ok(
    source.includes("APP_STORE_SUBMISSION_PACK.md") ||
      source.includes("check-app-store-pack.cjs") ||
      source.includes("StoreKit") ||
      source.includes("G_SHOP_PURCHASES_ENABLED"),
    `${label} should link App Store submission or StoreKit readiness`,
  );
}

for (const blockerId of [
  "ios-native-project-missing",
  "ios-app-store-template-placeholder",
  "ios-storekit-or-disabled-purchase-unresolved",
  "g-shop-mock-enabled",
  "g-shop-purchase-mock-copy",
]) {
  assert.ok(productionReadiness.includes(blockerId), `production readiness should block ${blockerId}`);
}

assert.ok(releaseGate.includes("check-app-store-pack.cjs"), "release gate should run App Store pack check");

console.log("Gunmoji Puzzle App Store submission pack checks passed.");
