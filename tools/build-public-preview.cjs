const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.join(__dirname, "..");
const outputRoot = process.env.PUBLIC_PREVIEW_OUTPUT_DIR
  ? path.resolve(projectRoot, process.env.PUBLIC_PREVIEW_OUTPUT_DIR)
  : path.join(projectRoot, "dist", "public-preview");

function policyUrlFromEnv(envName, fallback) {
  const value = process.env[envName];
  if (!value) {
    return fallback;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") {
      throw new Error("must use https");
    }
    return value;
  } catch (error) {
    throw new Error(`${envName} must be a hosted https:// URL for public preview builds.`);
  }
}

const policyUrls = {
  policyPrivacyLink: policyUrlFromEnv("PUBLIC_PRIVACY_URL", "../homepage/privacy.html"),
  policyTermsLink: policyUrlFromEnv("PUBLIC_TERMS_URL", "../homepage/terms.html"),
  policyCommercialLink: policyUrlFromEnv("PUBLIC_COMMERCIAL_URL", "../homepage/commercial-transactions.html"),
};

function copyFile(from, to = from) {
  const target = path.join(outputRoot, to);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(projectRoot, from), target);
}

function replaceOrThrow(source, pattern, replacement, label) {
  const next = source.replace(pattern, replacement);
  if (next === source) {
    throw new Error(`Unable to apply public preview transform: ${label}`);
  }
  return next;
}

function rewritePolicyLink(source, elementId, href) {
  const pattern = new RegExp(`<a[^>]+id="${elementId}"[^>]*>`, "i");
  const match = source.match(pattern);
  if (!match) {
    throw new Error(`Unable to apply public preview transform: policy link ${elementId}`);
  }
  const nextTag = match[0].includes('href="')
    ? match[0].replace(/href="[^"]*"/, `href="${href}"`)
    : match[0].replace(/>$/, ` href="${href}">`);
  return source.replace(match[0], nextTag);
}

function buildIndex() {
  let html = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");
  html = html.replace(
    /\s*<button class="stamina-ad-button" id="staminaAdButton"[\s\S]*?<\/button>/,
    "",
  );
  html = html.replace(
    /\s*<div class="pack-test-notice" id="packTestNotice" role="note">[\s\S]*?<\/div>/,
    `
            <div class="pack-public-notice" id="packPublicNotice" role="note">
              <span>PUBLIC</span>
              <strong>課金・広告なし</strong>
              <p>公開レビュー版は、毎日の差し入れや目標で集めた無料Gだるまだけで開封できます。</p>
            </div>`,
  );
  html = html.replace(
    /\s*<div class="purchase-test-notice" id="purchaseTestNotice" role="note">[\s\S]*?<\/div>/,
    `
            <div class="purchase-test-notice purchase-public-notice" id="purchasePublicNotice" role="note">
              <span>PUBLIC</span>
              <strong>購入なし</strong>
              <p>公開レビュー版は、ミッションや差し入れで集めたGだるまだけを使えます。</p>
            </div>`,
  );
  html = html.replace(
    /\s*<button id="adButton" type="button">[\s\S]*?<\/button>/,
    "",
  );
  html = html.replace(
    /\s*<button id="testBuyButton" type="button">[\s\S]*?<\/button>/,
    "",
  );
  html = html.replace(
    /\s*<section class="settings-panel feedback-panel" aria-label="テストフィードバック">[\s\S]*?<\/section>/,
    "",
  );
  html = html.replace(
    /\s*<section class="settings-panel feedback-insight-panel" id="feedbackInsightPanel" aria-label="テスト傾向">[\s\S]*?<\/section>/,
    "",
  );
  for (const [elementId, href] of Object.entries(policyUrls)) {
    html = rewritePolicyLink(html, elementId, href);
  }
  fs.writeFileSync(path.join(outputRoot, "index.html"), html);
}

function buildGameScript() {
  let gameJs = fs.readFileSync(path.join(projectRoot, "scripts", "game.js"), "utf8");
  gameJs = gameJs
    .replace(/const G_SHOP_PURCHASES_ENABLED = true;/g, "const G_SHOP_PURCHASES_ENABLED = false;")
    .replace(/staminaAdButton\?\.addEventListener\("click", recoverStaminaByAd\);/g, "// public preview: rewarded stamina UI removed")
    .replace(/adButton\?\.addEventListener\("click", \(\) => addPackStone\(1, [`"][^\n]*?\)\);/g, "// public preview: test ad grant removed")
    .replace(/testBuyButton\?\.addEventListener\("click", \(\) => addPackStone\(10, [`"][^\n]*?\)\);/g, "// public preview: test grant removed")
    .replace(/feedbackReportButton\?\.addEventListener\("click", copyFeedbackReport\);/g, "// public preview: closed-test feedback report removed")
    .replace(/recoverStaminaByAd/g, "recoverHiddenStaminaDebug")
    .replace(/stamina_test_recover/g, "closed_stamina_recover")
    .replace(/test_pack_stone_add/g, "closed_pack_stone_add")
    .replace(/feedback_report_copy/g, "closed_feedback_report");
  fs.writeFileSync(path.join(outputRoot, "scripts", "game.js"), gameJs);
}

function buildStyles() {
  const styles = fs
    .readFileSync(path.join(projectRoot, "styles.css"), "utf8")
    .replace(/feedback-panel/g, "preview-feedback-removed")
    .replace(/feedback-insight/g, "preview-insight-removed");
  fs.writeFileSync(path.join(outputRoot, "styles.css"), styles);
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });

for (const file of [
  "styles.css",
  "manifest.webmanifest",
  "service-worker.js",
  "data/cards.js",
  "scripts/game.js",
  "scripts/register-service-worker.js",
  "assets/gunmoji-logo.png",
  "assets/gunmoji-logo.svg",
  "assets/g-daruma.svg",
  "assets/exchange-daruma.svg",
  "assets/app-icon.svg",
  "assets/app-icon-192.png",
  "assets/app-icon-512.png",
  "assets/generated/stage-festival-bg.png",
  "assets/generated/stage-game-akagi-haruna.png",
  "assets/generated/stage-game-kusatsu-onsen.png",
  "assets/generated/stage-game-myogi-rail.png",
  "assets/generated/special-gunma-crane.png",
  "assets/generated/card-basic-gunma-ken.png",
  "assets/generated/card-basic-daruma.png",
  "assets/generated/card-basic-akagi-san.png",
  "assets/generated/card-city-maebashi.png",
  "assets/generated/card-city-takasaki.png",
  "assets/generated/card-city-kiryu.png",
  "assets/generated/card-city-isesaki.png",
  "assets/generated/card-city-ota.png",
  "assets/generated/card-city-numata.png",
  "assets/generated/card-city-tatebayashi.png",
  "assets/generated/card-city-shibukawa.png",
  "assets/generated/card-city-fujioka.png",
  "assets/generated/card-city-tomioka.png",
  "assets/generated/card-city-annaka.png",
  "assets/generated/card-city-midori.png",
  "store-assets/public-screenshots/01-title.png",
  "store-assets/public-screenshots/02-home.png",
  "store-assets/public-screenshots/03-gameplay.png",
  "store-assets/public-screenshots/04-result.png",
  "store-assets/public-screenshots/05-deck.png",
  "store-assets/public-screenshots/06-pack.png",
  "store-assets/public-screenshots/07-settings.png",
  "store-assets/public-screenshots/08-missions.png",
  "store-assets/public-screenshots/09-ranking.png",
]) {
  copyFile(file);
}

buildIndex();
buildGameScript();
buildStyles();

console.log(`Public preview built: ${outputRoot}`);
