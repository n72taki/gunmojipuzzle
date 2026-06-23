const fs = require("node:fs");
const path = require("node:path");

const defaultRoot = path.join(__dirname, "..");
const expectBlockers = process.argv.includes("--expect-blockers");
const asJson = process.argv.includes("--json");
const skipNative = process.argv.includes("--skip-native");
const rootArgIndex = process.argv.indexOf("--root");
const root =
  rootArgIndex >= 0 && process.argv[rootArgIndex + 1]
    ? path.resolve(process.cwd(), process.argv[rootArgIndex + 1])
    : defaultRoot;

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function size(file) {
  return fs.statSync(path.join(root, file)).size;
}

const html = read("index.html");
const gameJs = read("scripts/game.js");

const blockers = [];

function addBlocker(id, message, evidence) {
  blockers.push({ id, message, evidence });
}

function forbidText(file, text, id, message) {
  const source = read(file);
  if (source.includes(text)) {
    addBlocker(id, message, `${file} contains ${JSON.stringify(text)}`);
  }
}

function requireHostedPolicyLink(elementId, label) {
  const pattern = new RegExp(`<a[^>]+id="${elementId}"[^>]+href="([^"]+)"`, "i");
  const match = html.match(pattern);
  if (!match) {
    addBlocker(`missing-${label}-link`, `${label} policy link is missing from settings.`, `id=${elementId}`);
    return;
  }
  const href = match[1];
  if (!href.startsWith("https://")) {
    addBlocker(
      `local-${label}-link`,
      `${label} policy link must use a hosted HTTPS production URL.`,
      `${elementId} href=${href}`,
    );
  }
}

function requireProductionScreenshotSet() {
  const files = [
    "01-title.png",
    "02-home.png",
    "03-gameplay.png",
    "04-result.png",
    "05-deck.png",
    "06-pack.png",
    "07-settings.png",
    "08-missions.png",
    "09-ranking.png",
  ];
  for (const file of files) {
    const target = path.join("store-assets", "public-screenshots", file);
    if (!exists(target)) {
      addBlocker("missing-public-screenshot", "Public store screenshot set is incomplete.", target);
    } else if (size(target) < 1000) {
      addBlocker("empty-public-screenshot", "Public store screenshot looks unexpectedly small.", target);
    }
  }
}

function requireNativePackagingSignal() {
  const candidates = [
    "android",
    "ios",
    "capacitor.config.js",
    "capacitor.config.ts",
    "twa-manifest.json",
    "app/build.gradle",
    "build.gradle",
  ];
  if (!candidates.some((candidate) => exists(candidate))) {
    addBlocker(
      "native-packaging-missing",
      "No native packaging project or wrapper config is present yet.",
      "expected Android/iOS/Capacitor/TWA packaging before store submission",
    );
  }
}

function readJson(file, blockerId) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    addBlocker(blockerId, `${file} must be valid JSON.`, error.message);
    return null;
  }
}

function hasTodo(value) {
  return JSON.stringify(value).includes("TODO_");
}

function isHttpsUrl(value) {
  if (typeof value !== "string") {
    return false;
  }
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function requireHttpsField(value, id, label) {
  if (!isHttpsUrl(value) || value.includes("TODO_")) {
    addBlocker(id, `${label} must be a production HTTPS URL.`, value || "missing");
  }
}

function requireTwaReadiness() {
  if (!exists("twa-manifest.json")) {
    return;
  }

  const twa = readJson("twa-manifest.json", "twa-manifest-invalid");
  if (!twa) {
    return;
  }

  if (hasTodo(twa)) {
    addBlocker(
      "twa-manifest-placeholder",
      "TWA wrapper manifest still contains TODO placeholders.",
      "replace host, policy URLs, and signing fingerprint before production",
    );
  }

  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(twa.packageId || "")) {
    addBlocker("twa-package-id-invalid", "TWA packageId must be a stable Android package id.", twa.packageId || "missing");
  }

  if (!twa.host || twa.host.includes("TODO_") || twa.host.includes("://")) {
    addBlocker("twa-host-placeholder", "TWA host must be the final production host without a URL scheme.", twa.host || "missing");
  }

  requireHttpsField(twa.manifestUrl, "twa-manifest-url-placeholder", "TWA manifestUrl");
  requireHttpsField(twa.iconUrl, "twa-icon-url-placeholder", "TWA iconUrl");
  requireHttpsField(twa.maskableIconUrl, "twa-maskable-icon-url-placeholder", "TWA maskableIconUrl");
  requireHttpsField(twa.store?.policyUrls?.privacy, "twa-privacy-url-placeholder", "TWA privacy policy URL");
  requireHttpsField(twa.store?.policyUrls?.terms, "twa-terms-url-placeholder", "TWA terms URL");
  requireHttpsField(
    twa.store?.policyUrls?.commercialTransactions,
    "twa-commercial-url-placeholder",
    "TWA commercial transactions URL",
  );

  const fingerprints = twa.signing?.sha256CertFingerprints;
  if (!Array.isArray(fingerprints) || fingerprints.length === 0) {
    addBlocker("twa-signing-fingerprint-missing", "TWA signing fingerprint is missing.", "signing.sha256CertFingerprints");
  } else if (fingerprints.some((fingerprint) => String(fingerprint).includes("TODO_"))) {
    addBlocker("twa-signing-fingerprint-placeholder", "TWA signing fingerprint still uses a TODO placeholder.", fingerprints.join(", "));
  }

  const assetLinksPath = path.join("android", "twa", "assetlinks.template.json");
  if (!exists(assetLinksPath)) {
    addBlocker("android-assetlinks-missing", "Digital Asset Links template is missing for the TWA wrapper.", assetLinksPath);
    return;
  }

  const assetLinks = readJson(assetLinksPath, "android-assetlinks-invalid");
  if (!assetLinks) {
    return;
  }
  if (hasTodo(assetLinks)) {
    addBlocker(
      "android-assetlinks-placeholder",
      "Digital Asset Links template still contains TODO placeholders.",
      "replace TODO_RELEASE_CERT_SHA256 before production",
    );
  }
  const firstTarget = Array.isArray(assetLinks) ? assetLinks[0]?.target : null;
  if (firstTarget?.package_name !== twa.packageId) {
    addBlocker(
      "android-assetlinks-package-mismatch",
      "Digital Asset Links package name must match twa-manifest.json packageId.",
      `${firstTarget?.package_name || "missing"} != ${twa.packageId || "missing"}`,
    );
  }
}

function requireIosReadiness() {
  if (!exists(path.join("docs", "APP_STORE_SUBMISSION_PACK.md"))) {
    addBlocker(
      "ios-app-store-pack-missing",
      "App Store submission pack is missing.",
      "docs/APP_STORE_SUBMISSION_PACK.md",
    );
  }

  const iosTemplatePath = path.join("ios", "app-store-connect.template.json");
  const wrapperTemplatePath = path.join("ios", "wkwebview-wrapper.template.json");

  if (!exists(iosTemplatePath)) {
    addBlocker("ios-app-store-template-missing", "App Store Connect template is missing.", iosTemplatePath);
    return;
  }

  if (!exists(wrapperTemplatePath)) {
    addBlocker("ios-wrapper-template-missing", "iOS WKWebView wrapper template is missing.", wrapperTemplatePath);
    return;
  }

  const ios = readJson(iosTemplatePath, "ios-app-store-template-invalid");
  const wrapper = readJson(wrapperTemplatePath, "ios-wrapper-template-invalid");
  if (!ios || !wrapper) {
    return;
  }

  if (hasTodo(ios) || hasTodo(wrapper)) {
    addBlocker(
      "ios-app-store-template-placeholder",
      "iOS/App Store handoff templates still contain TODO placeholders.",
      "replace hosted policy/support URLs and wrapper host values before production",
    );
  }

  if (!/^[A-Za-z0-9][A-Za-z0-9-]*(\.[A-Za-z0-9][A-Za-z0-9-]*)+$/.test(ios.bundleId || "")) {
    addBlocker("ios-bundle-id-invalid", "iOS bundleId must be a stable reverse-DNS identifier.", ios.bundleId || "missing");
  }

  if (wrapper.bundleId !== ios.bundleId) {
    addBlocker(
      "ios-wrapper-bundle-mismatch",
      "iOS wrapper bundle id must match App Store Connect template bundle id.",
      `${wrapper.bundleId || "missing"} != ${ios.bundleId || "missing"}`,
    );
  }

  requireHttpsField(ios.privacy?.policyUrl, "ios-privacy-url-placeholder", "iOS privacy policy URL");
  requireHttpsField(ios.support?.supportUrl, "ios-support-url-placeholder", "iOS support URL");
  requireHttpsField(ios.support?.marketingUrl, "ios-marketing-url-placeholder", "iOS marketing URL");

  if (ios.pricing?.gCurrencyPurchases === "BLOCKED_UNTIL_STOREKIT_OR_DISABLED") {
    addBlocker(
      "ios-storekit-or-disabled-purchase-unresolved",
      "iOS G purchase route must use StoreKit or be disabled before App Review.",
      "pricing.gCurrencyPurchases=BLOCKED_UNTIL_STOREKIT_OR_DISABLED",
    );
  }

  if (!exists(path.join("ios", "App.xcodeproj")) && !exists(path.join("ios", "Runner.xcodeproj")) && !exists(path.join("ios", "GunmojiPuzzle.xcodeproj"))) {
    addBlocker(
      "ios-native-project-missing",
      "No iOS Xcode project exists yet.",
      "create and archive the WKWebView wrapper on macOS before App Store submission",
    );
  }
}

requireHostedPolicyLink("policyPrivacyLink", "privacy");
requireHostedPolicyLink("policyTermsLink", "terms");
requireHostedPolicyLink("policyCommercialLink", "commercial-transactions");
requireProductionScreenshotSet();
if (!skipNative) {
  requireNativePackagingSignal();
  requireTwaReadiness();
  requireIosReadiness();
}

forbidText("index.html", "CLOSED TEST", "closed-test-copy", "Closed-test labels must not ship in a public production build.");
forbidText("index.html", "TEST AD", "test-ad-copy", "Test ad labels must be replaced by production ad UX or removed.");
forbidText("index.html", "TEST GRANT", "test-grant-copy", "Test grant labels must be removed before production.");
forbidText("index.html", "購入モック", "g-shop-purchase-mock-copy", "G purchase mock copy must not ship in production.");
forbidText("index.html", 'id="purchaseTestNotice"', "g-shop-test-notice", "G purchase closed-test notice is still present.");
forbidText("index.html", 'id="adButton"', "test-ad-button", "Pack test ad grant button is still present.");
forbidText("index.html", 'id="testBuyButton"', "test-grant-button", "Pack test grant button is still present.");
forbidText("index.html", 'id="feedbackReportButton"', "closed-test-report-button", "Closed-test report copy button is still present.");
forbidText("index.html", "feedback-panel", "closed-test-feedback-panel", "Closed-test feedback panel is still present.");

forbidText("scripts/game.js", "test_pack_stone_add", "test-pack-telemetry", "Pack test grants are still logged as test events.");
forbidText("scripts/game.js", "stamina_test_recover", "test-stamina-telemetry", "Rewarded stamina recovery is still a test event.");
forbidText("scripts/game.js", "recoverStaminaByAd", "placeholder-stamina-ad", "Rewarded stamina recovery still uses the placeholder handler.");
forbidText("scripts/game.js", "feedback_report_copy", "closed-test-feedback-telemetry", "Closed-test feedback report telemetry is still present.");

if (gameJs.includes("const G_SHOP_PURCHASES_ENABLED = true;")) {
  addBlocker(
    "g-shop-mock-enabled",
    "G purchase mock grants are enabled in this build.",
    "set G_SHOP_PURCHASES_ENABLED=false or replace the mock with platform billing callbacks",
  );
  if (gameJs.includes("g_purchase_mock")) {
    addBlocker(
      "g-shop-purchase-mock-telemetry",
      "G purchase mock telemetry is present while G shop purchases are enabled.",
      "g_purchase_mock",
    );
  }
}

if (gameJs.includes("localStorage") && html.includes('id="staminaAdButton"')) {
  addBlocker(
    "local-economy-with-ad-recovery",
    "Stamina/economy state is local while rewarded recovery is exposed.",
    "move authority server-side or remove rewarded recovery for production",
  );
}

if (asJson) {
  console.log(JSON.stringify({ ok: blockers.length === 0, blockers }, null, 2));
} else if (blockers.length > 0) {
  console.error("Gunmoji Puzzle production readiness blockers:");
  for (const blocker of blockers) {
    console.error(`- [${blocker.id}] ${blocker.message} (${blocker.evidence})`);
  }
} else {
  console.log("Gunmoji Puzzle production readiness checks passed.");
}

if (expectBlockers) {
  if (blockers.length === 0) {
    console.error("Expected production blockers, but none were found.");
    process.exit(1);
  }
  if (!asJson) {
    console.log(`Expected production blockers detected: ${blockers.length}`);
  }
  process.exit(0);
}

process.exit(blockers.length > 0 ? 1 : 0);
