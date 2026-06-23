const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const projectRoot = path.join(__dirname, "..");
const outputRoot = process.env.PUBLIC_PREVIEW_OUTPUT_DIR
  ? path.resolve(projectRoot, process.env.PUBLIC_PREVIEW_OUTPUT_DIR)
  : path.join(projectRoot, "dist", "public-preview");
const expectHostedPolicies = process.argv.includes("--expect-hosted-policies");

function read(file) {
  return fs.readFileSync(path.join(outputRoot, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(outputRoot, file));
}

assert.ok(exists("index.html"), "public preview index.html should exist; run build-public-preview.cjs first");
assert.ok(exists("styles.css"), "public preview styles.css should exist");
assert.ok(exists("manifest.webmanifest"), "public preview manifest should exist");
assert.ok(exists("service-worker.js"), "public preview service worker should exist");
assert.ok(exists("scripts/game.js"), "public preview game runtime should exist");
assert.ok(exists("data/cards.js"), "public preview card data should exist");
assert.ok(exists("assets/generated/stage-festival-bg.png"), "public preview should include generated stage art");
assert.ok(exists("assets/generated/special-gunma-crane.png"), "public preview should include special crane art");
for (const cityArt of [
  "card-city-maebashi.png",
  "card-city-takasaki.png",
  "card-city-kiryu.png",
  "card-city-isesaki.png",
  "card-city-ota.png",
  "card-city-numata.png",
  "card-city-tatebayashi.png",
  "card-city-shibukawa.png",
  "card-city-fujioka.png",
  "card-city-tomioka.png",
  "card-city-annaka.png",
  "card-city-midori.png",
]) {
  assert.ok(exists(`assets/generated/${cityArt}`), `public preview should include ${cityArt}`);
}

const html = read("index.html");
const gameJs = read("scripts/game.js");
const styles = read("styles.css");

function hrefById(elementId) {
  const pattern = new RegExp(`<a[^>]+id="${elementId}"[^>]+href="([^"]+)"`, "i");
  return html.match(pattern)?.[1] || "";
}

const forbiddenHtml = [
  "CLOSED TEST",
  "TEST AD",
  "TEST GRANT",
  'id="adButton"',
  'id="testBuyButton"',
  'id="staminaAdButton"',
  'id="feedbackReportButton"',
  'id="feedbackInsightPanel"',
  "feedback-panel",
  "feedback-insight",
  "感想インサイト",
  "packTestNotice",
  "purchaseTestNotice",
];

for (const token of forbiddenHtml) {
  assert.ok(!html.includes(token), `public preview HTML still contains ${token}`);
}
assert.ok(!html.includes("ぐんもじぱずる Prototype"), "public preview title should not expose prototype wording");
assert.ok(!html.includes("aria-label=\"ぐんもじぱずる prototype\""), "public preview app label should not expose prototype wording");
assert.ok(html.includes("<title>ぐんもじぱずる</title>"), "public preview title should use the release-facing app name");
assert.ok(html.includes('aria-label="ぐんもじぱずる"'), "public preview app shell label should use the release-facing app name");
assert.ok(html.includes("assets/gunmoji-logo.png"), "public preview should use the game logo asset");
assert.ok(exists("assets/gunmoji-logo.png"), "public preview should include the game logo asset");
assert.ok(styles.includes("assets/g-daruma.svg"), "public preview should use the shared G daruma icon");
assert.ok(exists("assets/g-daruma.svg"), "public preview should include the G daruma icon asset");
assert.ok(html.includes("exchange-daruma-icon"), "public preview should show the exchange daruma icon");
assert.ok(exists("assets/exchange-daruma.svg"), "public preview should include the exchange daruma icon asset");
assert.ok(!styles.includes("feedback-panel"), "public preview styles should not contain closed-test feedback selectors");
assert.ok(!styles.includes("feedback-insight"), "public preview styles should not contain closed-test feedback insight selectors");

const forbiddenJs = [
  "recoverStaminaByAd",
  "stamina_test_recover",
  "test_pack_stone_add",
  "feedback_report_copy",
];

for (const token of forbiddenJs) {
  assert.ok(!gameJs.includes(token), `public preview runtime still contains ${token}`);
}

const policyLinks = {
  privacy: hrefById("policyPrivacyLink"),
  terms: hrefById("policyTermsLink"),
  commercial: hrefById("policyCommercialLink"),
};
assert.ok(policyLinks.privacy, "public preview should keep privacy policy link");
assert.ok(policyLinks.terms, "public preview should keep terms link");
assert.ok(policyLinks.commercial, "public preview should keep commercial transactions link");
if (expectHostedPolicies) {
  for (const [label, href] of Object.entries(policyLinks)) {
    assert.ok(href.startsWith("https://"), `${label} policy link should be hosted https:// when --expect-hosted-policies is used`);
  }
}
assert.ok(html.includes("openPackButton"), "public preview should keep pack opening UI");
assert.ok(html.includes("packPublicNotice"), "public preview should explain the no-ad/no-payment pack economy");
assert.ok(html.includes("課金・広告なし"), "public preview should clearly say pack opening has no payment or ads");
assert.ok(html.includes('data-app-screen="purchase"'), "public preview should keep the G shop screen");
assert.ok(html.includes("purchasePublicNotice"), "public preview should replace the closed-test G shop note");
assert.ok(html.includes("購入なし"), "public preview should state that G purchases are disabled");
assert.ok(gameJs.includes("const G_SHOP_PURCHASES_ENABLED = false;"), "public preview should disable G purchase grants");
assert.ok(styles.includes(".pack-public-notice"), "public preview should include styling for the pack economy note");
assert.ok(html.includes("packRevealAction"), "public preview should keep the pack reveal detail action");
assert.ok(!html.includes("packRevealShare"), "public preview should not include pack reveal sharing");
assert.ok(!html.includes("finishGuide"), "public preview should not include the removed result word guide action");
assert.ok(html.includes("finishRewardSummary"), "public preview should keep the result reward summary");
assert.ok(html.includes('data-app-screen="missions"'), "public preview should keep the missions screen");
assert.ok(html.includes('data-nav-target="missions"'), "public preview should keep the missions navigation");
assert.ok(html.includes("dailyWordPanel"), "public preview should keep the daily word mission panel");
assert.ok(html.includes("weeklyChallengePanel"), "public preview should keep the weekly challenge mission panel");
assert.ok(html.includes("packFeatureRow"), "public preview should keep featured pack cards");
assert.ok(html.includes("packSelector"), "public preview should keep pack selection UI");
assert.ok(html.includes("packDetailModal"), "public preview should keep the pack detail modal");
assert.ok(html.includes("packLineup"), "public preview should keep the pack lineup UI in details");
assert.ok(html.includes("packExchangeStatus"), "public preview should keep exchange daruma status UI");
assert.ok(html.includes("packCollectionProgress"), "public preview should keep pack collection progress UI");
assert.ok(html.includes("menuStaminaPips"), "public preview should still show stamina status");
assert.ok(html.includes("wordGuideStatus"), "public preview should keep word guide game-facing status");
assert.ok(!html.includes("wordGuideLearning"), "public preview should not expose internal word guide learning hooks");
assert.ok(html.includes("word-guide-action"), "public preview should keep word guide action button");
assert.ok(gameJs.includes("packMedalsByPack"), "public preview should keep pack-specific exchange token save state");
assert.ok(gameJs.includes("pack_medal_exchange"), "public preview should keep exchange token event coverage");
assert.ok(gameJs.includes("引換だるま"), "public preview should label pack exchange tokens as 引換だるま");
assert.ok(gameJs.includes("renderPackFeature"), "public preview should keep featured pack card rendering");
assert.ok(gameJs.includes("renderPackCollectionProgress"), "public preview should keep pack collection progress rendering");
assert.ok(gameJs.includes("openPackRevealTarget"), "public preview should keep pack reveal detail navigation");
assert.ok(gameJs.includes("openResultWordGuide"), "public preview should keep result word guide navigation");
assert.ok(gameJs.includes("buildRunRewardSummary"), "public preview should keep result reward summary logic");
assert.ok(gameJs.includes("formatResultRewardLine"), "public preview should keep reward summary sharing logic");
assert.ok(gameJs.includes("onWordGuideActionClick"), "public preview should keep word guide action handler");
assert.ok(styles.includes(".pack-exchange"), "public preview should keep exchange daruma styling");
assert.ok(styles.includes(".pack-feature-row"), "public preview should keep featured pack styling");
assert.ok(styles.includes(".pack-progress"), "public preview should keep pack collection progress styling");
assert.ok(styles.includes(".pack-reveal-action"), "public preview should keep pack reveal action styling");
assert.ok(!styles.includes(".pack-reveal-share"), "public preview should not keep pack reveal share styling");
assert.ok(styles.includes(".word-guide-action"), "public preview should keep word guide action styling");

console.log("Gunmoji Puzzle public preview checks passed.");
