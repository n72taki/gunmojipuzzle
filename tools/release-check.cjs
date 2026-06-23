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

function size(file) {
  return fs.statSync(path.join(root, file)).size;
}

const html = read("index.html");
const manifest = JSON.parse(read("manifest.webmanifest"));
const gameJs = read("scripts/game.js");
const styles = read("styles.css");
const serviceWorker = read("service-worker.js");
const serviceWorkerRegistrar = read("scripts/register-service-worker.js");
const releaseDoc = read("docs/MOBILE_RELEASE_READINESS.md");
const storeListingDoc = read("docs/STORE_LISTING_DRAFT.md");
const buildMetadata = read("docs/BUILD_METADATA.md");
const dataSafetyDoc = read("docs/DATA_SAFETY_DRAFT.md");
const closedTestPlan = read("docs/CLOSED_TEST_PLAN.md");
const playConsolePack = read("docs/PLAY_CONSOLE_SUBMISSION_PACK.md");
const contentRatingDraft = read("docs/CONTENT_RATING_DRAFT.md");
const storeAssetQa = read("docs/STORE_ASSET_QA.md");
const privacyPolicy = read("../homepage/privacy.html");
const termsPolicy = read("../homepage/terms.html");
const commercialPolicy = read("../homepage/commercial-transactions.html");
const productionReadiness = read("tools/check-production-readiness.cjs");
const releaseGate = read("tools/release-gate.cjs");
const publicPreviewBuild = read("tools/build-public-preview.cjs");
const publicPreviewCheck = read("tools/check-public-preview.cjs");
const publicPreviewSmoke = read("tools/smoke-public-preview.cjs");
const androidHandoffCheck = read("tools/check-android-handoff.cjs");
const androidHandoffDoc = read("docs/ANDROID_TWA_HANDOFF.md");
const twaManifest = JSON.parse(read("twa-manifest.json"));
const assetLinksTemplate = JSON.parse(read(path.join("android", "twa", "assetlinks.template.json")));
const data = require("../data/cards.js");

assert.ok(html.includes('<meta name="theme-color"'), "index.html should define theme-color");
assert.ok(html.includes('<link rel="manifest" href="manifest.webmanifest">'), "index.html should link manifest");
assert.ok(html.includes("apple-mobile-web-app-capable"), "index.html should include iOS standalone metadata");
assert.ok(html.includes("assets/app-icon-192.png"), "index.html should link PNG touch icon");
assert.ok(html.includes("assets/gunmoji-logo.png"), "index.html should use the game logo asset");
assert.ok(html.includes("exchange-daruma-icon"), "index.html should include the exchange daruma icon hook");
assert.ok(html.includes("scripts/register-service-worker.js"), "index.html should register offline support");

assert.equal(manifest.name, "ぐんもじぱずる", "manifest should use the game name");
assert.equal(manifest.short_name, "ぐんもじ", "manifest should use the short game name");
assert.equal(manifest.display, "standalone", "manifest should use standalone display");
assert.equal(manifest.orientation, "portrait", "manifest should lock portrait orientation");
assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2, "manifest should include icons");

for (const icon of [
  "assets/gunmoji-logo.png",
  "assets/gunmoji-logo.svg",
  "assets/g-daruma.svg",
  "assets/exchange-daruma.svg",
  "assets/app-icon.svg",
  "assets/app-icon-192.png",
  "assets/app-icon-512.png",
]) {
  assert.ok(exists(icon), `missing icon: ${icon}`);
  assert.ok(size(icon) > 1000, `icon is unexpectedly small: ${icon}`);
}

for (const homepagePolicy of ["../homepage/privacy.html", "../homepage/terms.html", "../homepage/commercial-transactions.html"]) {
  assert.ok(exists(homepagePolicy), `missing policy page scaffold: ${homepagePolicy}`);
}
assert.ok(html.includes('id="policyPrivacyLink"'), "settings should expose an in-app privacy policy link");
assert.ok(html.includes('id="policyTermsLink"'), "settings should expose an in-app terms link");
assert.ok(html.includes('id="policyCommercialLink"'), "settings should expose an in-app commercial transactions link");
assert.ok(html.includes('href="../homepage/privacy.html"'), "privacy policy link should target the homepage scaffold");
assert.ok(html.includes('href="../homepage/terms.html"'), "terms link should target the homepage scaffold");
assert.ok(
  html.includes('href="../homepage/commercial-transactions.html"'),
  "commercial transactions link should target the homepage scaffold",
);

assert.ok(gameJs.includes("kana-gunmatsuri-save-v1"), "game should have local save key");
assert.ok(gameJs.includes("SCORE_LENGTH_CUBE_FACTOR"), "game should use the current cubic word score curve");
assert.ok(!html.includes("finishShare"), "result screen should not include a result share action");
assert.ok(!html.includes("finishImage"), "result screen should not include a result image action");
assert.ok(!html.includes("finishLearnNote"), "result screen should not include a word learning note");
assert.ok(!html.includes("finishGuide"), "result screen should not include a best-word guide action");
assert.ok(!html.includes("finishNextChallenge"), "result screen should not include a next-run challenge prompt");
assert.ok(!html.includes("finishProgressRecap"), "result screen should not include daily and weekly progress recap chips");
assert.ok(html.includes("finishRewardSummary"), "result screen should include earned reward summary copy");
assert.ok(!gameJs.includes("renderFinishProgressRecap"), "game should keep post-run mission progress out of the result screen");
assert.ok(gameJs.includes("buildRunRewardSummary"), "game should summarize earned rewards for post-run clarity");
assert.ok(!html.includes("finishFeedbackButtons"), "result screen should not include quick feedback chips");
assert.ok(!html.includes("feedbackInsightPanel"), "settings should not include a closed-test quick feedback insight panel");
assert.ok(!gameJs.includes("buildNextChallenge"), "game should not compute next-run challenge prompts");
assert.ok(!gameJs.includes("次の目標"), "game should not show next-run challenge copy");
assert.ok(html.includes("wordGuidePanel"), "deck/collection screen should include a word guide panel");
assert.ok(gameJs.includes("renderWordGuide"), "game should render learning notes in the collection guide");
assert.ok(html.includes("collectionFilterRow"), "deck/collection screen should include game-facing collection filters");
assert.ok(html.includes("collectionSortRow"), "deck/collection screen should include collection sorting controls");
assert.ok(gameJs.includes("COLLECTION_FILTERS"), "game should define game-facing collection filters");
for (const filter of ['label: "ALL"', 'label: "所持"', 'label: "未所持"', 'label: "GGG"', 'label: "GG"', 'label: "G"']) {
  assert.ok(gameJs.includes(filter), `collection filters should include ${filter}`);
}
assert.ok(gameJs.includes("guideCategoryForCard"), "game should map cards to word guide categories");
assert.ok(gameJs.includes("ことばメモ"), "result image should include a word learning note");
assert.ok(html.includes("wordCall"), "play screen should include a word call overlay for viewers");
assert.ok(gameJs.includes("showWordCall"), "game should show a word call when a word clears");
assert.ok(html.includes("pauseCard"), "game should include a pause overlay for interruptions");
assert.ok(gameJs.includes("visibilitychange"), "game should pause when the app/browser is hidden");
assert.ok(gameJs.includes("pauseRun"), "game should expose pause behavior for lifecycle and tests");
assert.ok(!html.includes("feedbackReportButton"), "settings should not include a closed-test feedback report button");
assert.ok(gameJs.includes("buildFeedbackReport"), "game should generate copyable closed-test feedback reports");
assert.ok(html.includes("buildVersionText"), "settings should include visible build metadata");
assert.ok(gameJs.includes("formatBuildLabel"), "feedback report should include a visible build id");
assert.ok(gameJs.includes("telemetryEvents"), "game should persist a bounded closed-test event log");
assert.ok(gameJs.includes("logTelemetryEvent"), "game should record release-test events");
assert.ok(gameJs.includes("最近のイベント（非PII）"), "feedback report should include recent non-PII events");
assert.ok(!html.includes("streamModeToggle"), "settings should not include removed stream mode toggle");
assert.ok(html.includes("パネル番号表示"), "settings should explain non-color panel identification");
assert.ok(gameJs.includes("deckMembershipLabel"), "deck cards should have simple player-readable membership labels");
assert.ok(gameJs.includes("formatDeckSlotActionLabel"), "deck actions should name the deck target");
assert.ok(styles.includes(".slot-color-index"), "deck color chips should keep optional panel number markup");
assert.ok(styles.includes(".collection-target-label"), "collection cards should show target slot chips");
assert.ok(!html.includes("streamStrip"), "game screen should not include removed stream mode overlay");
assert.ok(html.includes("home-play-button"), "home should include a large game entry button");
assert.ok(html.includes('data-nav-target="purchase"'), "home should include a G shop entry");
assert.ok(html.includes('data-app-screen="purchase"'), "game should include a G purchase screen");
assert.ok(html.includes("purchaseBundleGrid"), "G shop should show bulk purchase bundles");
assert.ok(html.includes("staminaGRecoverButton"), "home should allow G full stamina recovery");
assert.ok(gameJs.includes("recoverStaminaWithG"), "game should support full stamina recovery with G");
assert.ok(gameJs.includes("buyGBundle"), "closed-test build should support G bundle purchase mocks");
assert.equal(data.gShop.staminaFullRecoveryCost, 1, "one G should fully recover stamina");
assert.ok(html.includes("tutorialCoach"), "play screen should include a first-run tutorial coach");
assert.ok(!html.includes("lastResultPanel"), "home should not include a last-run return hook");
assert.ok(!html.includes("menuBestText"), "home status should not show a best score chip");
assert.ok(gameJs.includes("sanitizeLastResult"), "game should safely persist last result summaries");
assert.ok(
  html.indexOf("menu-grid") < html.indexOf('data-app-screen="missions"') &&
    html.indexOf('data-app-screen="missions"') < html.indexOf("dailyWordPanel") &&
    html.indexOf('data-app-screen="missions"') < html.indexOf("dailyPanel") &&
    html.indexOf('data-app-screen="missions"') < html.indexOf("scoreGoalPanel") &&
    html.indexOf('data-app-screen="missions"') < html.indexOf("weeklyChallengePanel"),
  "main menu should link to missions while detailed mission panels stay on the missions screen",
);
assert.ok(html.includes("packTestNotice"), "closed-test pack controls should be explicitly labeled");
assert.ok(html.includes("CLOSED TEST"), "prototype economy should not look like production monetization");
assert.ok(html.includes("packReveal"), "pack screen should include a visible reward reveal moment");
assert.ok(html.includes("packOpeningModal"), "pack opening should use a modal reveal window");
assert.ok(gameJs.includes("lastPackReveal"), "game should store the latest pack reveal for rendering");
assert.ok(gameJs.includes("triggerPackOpeningAnimation"), "game should animate pack rewards after opening");
assert.ok(html.includes("packRevealAction"), "pack reveal should include a direct card detail action");
assert.ok(html.includes("packOpeningAction"), "pack opening modal should include a direct card detail action");
assert.ok(!html.includes("packRevealShare"), "pack reveal should not include a share action");
assert.ok(gameJs.includes("openPackRevealTarget"), "pack reveal action should navigate to the reward detail");
assert.ok(html.includes("packSelector"), "pack screen should support choosing among multiple packs");
assert.ok(!html.includes("pack-flow"), "pack screen should not show redundant flow chips");
assert.ok(html.includes("packPeriodText"), "pack screen should expose sale period copy");
assert.ok(html.includes("packFeatureRow"), "pack screen should expose featured pack cards");
assert.ok(html.includes("packDetailModal"), "pack rates and lineup should be in a detail window");
assert.ok(html.includes("packLineup"), "pack screen should keep lineup details available in the detail window");
assert.ok(html.includes("packExchangeStatus"), "pack screen should expose exchange daruma progress");
assert.ok(html.includes("packCollectionProgress"), "pack screen should expose collection progress");
assert.ok(styles.includes(".g-rarity-icons"), "rarity display should use repeated G icon badges");
assert.ok(styles.includes(".ticket-rarity-badge"), "choice ticket should not expose an internal rate key");
assert.ok(styles.includes(".pack-feature-row"), "featured pack cards should have compact mobile styling");
assert.ok(styles.includes(".pack-lineup-card"), "pack lineup should have compact mobile card styling");
assert.ok(styles.includes(".pack-exchange"), "exchange daruma should have compact mobile card styling");
assert.ok(styles.includes(".exchange-daruma-icon"), "exchange daruma icon should have compact mobile styling");
assert.ok(styles.includes(".pack-progress"), "collection progress should have compact mobile styling");
assert.ok(styles.includes(".pack-reveal-action"), "pack reveal action should have compact mobile styling");
assert.ok(!styles.includes(".pack-reveal-share"), "pack reveal share styling should stay removed");
assert.ok(gameJs.includes("packSaleStatus"), "pack opening should honor configured sale periods");
assert.ok(gameJs.includes("renderPackFeature"), "pack screen should render featured high-rarity cards");
assert.ok(gameJs.includes("renderPackSelector"), "pack screen should render selectable pack cards");
assert.ok(gameJs.includes("renderPackDetailModal"), "pack screen should render rates and lineup in a detail modal");
assert.ok(gameJs.includes("renderPackLineup"), "pack entries should render into a lineup detail");
assert.ok(gameJs.includes("renderPackCollectionProgress"), "pack collection progress should render on the pack screen");
assert.ok(gameJs.includes("packCardEntries"), "pack card entries should be shared between lineup and progress");
assert.ok(gameJs.includes("packMedalsByPack"), "exchange tokens should persist per pack for closed-test economy checks");
assert.ok(gameJs.includes("canExchangeCardWithMedals"), "unowned pack cards should be exchangeable with exchange tokens");
assert.ok(gameJs.includes("pack_medal_exchange"), "exchange token use should be tracked in the non-PII event log");
assert.ok(gameJs.includes("引換だるま"), "exchange token UI should be labeled 引換だるま");
assert.ok(!gameJs.includes("packRevealShare"), "pack reveal share DOM should stay removed");
assert.ok(!gameJs.includes("share_pack_reveal"), "pack reveal share telemetry should stay removed");
assert.ok(!gameJs.includes("streamMode"), "game should not persist removed stream mode setting");
assert.ok(gameJs.includes("firstPlayPanel.hidden"), "game should hide first-session focus after tutorial completion");
assert.ok(gameJs.includes("dailyPanel.hidden"), "game should suppress daily mission pressure before the first play");
assert.ok(gameJs.includes("runTutorialDemo"), "first-run tutorial should auto-demo a successful clear if the player stalls");
assert.ok(styles.includes(".tutorial-coach"), "tutorial coach should be styled for mobile readability");
assert.ok(data.cards.every((card) => card.learnNote), "every card should include a learning note");
assert.ok(gameJs.includes("navigator.vibrate"), "game should wire the vibration setting to haptics");
assert.ok(gameJs.includes("largeText"), "game should include a large text accessibility setting");
assert.ok(gameJs.includes("highContrast"), "game should include a high contrast accessibility setting");
assert.ok(html.includes("tileMarkToggle"), "game should include an optional panel number accessibility toggle");
assert.ok(html.includes("soundTestButton"), "settings should include a sound test button");
assert.ok(gameJs.includes("testSound"), "game should wire a sound test action");
assert.ok(gameJs.includes("効果音を再生"), "sound test should confirm playback to the user");
assert.ok(gameJs.includes("drawTileMark"), "game should render optional panel number marks");
assert.ok(!html.includes("menuStreamButton"), "home should not expose removed stream mode quick toggle");
assert.ok(!gameJs.includes("menuStreamButton"), "game should not wire removed home stream mode quick toggle");
assert.ok(!gameJs.includes("is-stream-mode"), "game should not apply removed stream-mode class");
assert.ok(!styles.includes(".phone.is-stream-mode .word-call"), "removed stream-mode word call styles should stay absent");
assert.ok(!html.includes("finishStreamRecap"), "result should not expose removed stream-mode recap surface");
assert.ok(!gameJs.includes("finishStreamWord"), "game should not populate removed stream result recap text");
assert.ok(!styles.includes(".phone.is-stream-mode .finish-stream-recap"), "removed stream-mode recap styles should stay absent");
assert.ok(gameJs.includes("resultRank"), "game should present result ranks");
assert.ok(html.includes("gameDeckLegend"), "game screen should show a deck color legend");
assert.ok(html.includes("seasonRankingCard"), "home should expose the current season ranking entry");
assert.ok(html.includes("dailyRankingPanel"), "ranking screen should expose a daily ranking panel");
assert.ok(html.includes("dailyRankingList"), "ranking screen should expose daily ranking entries");
assert.ok(html.includes('data-app-screen="ranking"'), "app should include a ranking screen");
assert.ok(html.includes("rankingOwnRank"), "ranking screen should show the player's season ranking");
assert.ok(html.includes("rankingOwnBest"), "ranking screen should show the player's season best score");
assert.ok(html.includes("rankingList"), "ranking screen should show season ranking rows");
assert.ok(html.includes("rankingStageTabs"), "ranking screen should support optional stage tabs");
assert.ok(html.includes("rankingFinalRules"), "ranking screen should keep optional final rule details");
assert.ok(gameJs.includes("CURRENT_SEASON"), "game should define the active ranking season");
assert.ok(gameJs.includes("seasonRecords"), "game should persist season score records");
assert.ok(gameJs.includes("buildSeasonRankingEntries"), "game should build whole-user ranking rows");
assert.ok(gameJs.includes("normalizeRankingSeason"), "game should read operator-defined ranking config");
assert.ok(gameJs.includes("evaluateRankingDeckRules"), "game should describe operator-defined final deck rules");
assert.ok(html.includes("rankingSyncStatus"), "ranking screen should show online sync status");
assert.ok(gameJs.includes("rankingOnline"), "game should persist online ranking snapshots and pending submissions");
assert.ok(gameJs.includes("syncRanking"), "game should support ranking API synchronization");
assert.ok(gameJs.includes("queueRankingSubmission"), "game should queue ranking submissions after runs");
assert.ok(fs.existsSync(path.join(root, "server", "ranking-server.cjs")), "repo should include a local ranking server");
assert.ok(fs.existsSync(path.join(root, "server", "ranking-server.py")), "repo should include the SQLite ranking server implementation");
assert.ok(fs.existsSync(path.join(root, "server", "ranking-config.json")), "repo should include a Render-readable ranking config");
assert.ok(fs.existsSync(path.join(root, "render.yaml")), "repo should include a Render Blueprint for the ranking API");
assert.ok(fs.existsSync(path.join(root, "requirements.txt")), "repo should include Python dependencies for the ranking API");
assert.ok(fs.existsSync(path.join(root, "docs", "ranking-server.md")), "repo should document ranking server API");
assert.ok(fs.existsSync(path.join(root, "docs", "SERVER_DATABASE_SETUP.md")), "repo should include server/database setup steps");
const rankingServerDoc = fs.readFileSync(path.join(root, "docs", "ranking-server.md"), "utf8");
const serverDatabaseSetupDoc = fs.readFileSync(path.join(root, "docs", "SERVER_DATABASE_SETUP.md"), "utf8");
const renderBlueprint = fs.readFileSync(path.join(root, "render.yaml"), "utf8");
const repoRenderBlueprintPath = path.join(root, "..", "render.yaml");
const repoRenderBlueprint = fs.existsSync(repoRenderBlueprintPath) ? fs.readFileSync(repoRenderBlueprintPath, "utf8") : "";
const pythonRequirements = fs.readFileSync(path.join(root, "requirements.txt"), "utf8");
assert.ok(rankingServerDoc.includes("SQLite") && rankingServerDoc.includes("Postgres"), "ranking server docs should mention SQLite and Postgres persistence");
assert.ok(rankingServerDoc.includes("Render"), "ranking server docs should mention Render hosting");
assert.ok(serverDatabaseSetupDoc.includes("Render Deployment Steps"), "server/database setup doc should include deployment steps");
assert.ok(serverDatabaseSetupDoc.includes("player_profiles") && serverDatabaseSetupDoc.includes("daily_ranking_entries"), "server/database setup doc should list persisted tables");
assert.ok(renderBlueprint.includes("DATABASE_URL") && renderBlueprint.includes("fromDatabase"), "Render Blueprint should connect the API to Postgres");
assert.ok(renderBlueprint.includes("basic-256mb"), "Render Blueprint should use the low-cost Postgres plan");
assert.ok(renderBlueprint.includes("RANKING_CONFIG_PATH") && renderBlueprint.includes("server/ranking-config.json"), "Render Blueprint should use the committed ranking config");
assert.ok(repoRenderBlueprint.includes("rootDir: gunmojipuzzle"), "repo root Render Blueprint should target the game subdirectory");
assert.ok(repoRenderBlueprint.includes("DATABASE_URL") && repoRenderBlueprint.includes("fromDatabase"), "repo root Render Blueprint should connect the API to Postgres");
assert.ok(pythonRequirements.includes("psycopg"), "ranking API should install the Postgres driver on Render");
assert.ok(gameJs.includes("comboCount"), "game should track combo feedback");
assert.ok(gameJs.includes("spendStamina"), "game should spend stamina on run start");
assert.ok(gameJs.includes("recoverStamina"), "game should recover stamina over time");
assert.ok(gameJs.includes("recoverStaminaByAd"), "game should expose rewarded stamina recovery");
assert.ok(gameJs.includes("formatStaminaCountdown"), "game should show stamina recovery countdown");
assert.ok(html.includes("menuStaminaPips"), "home should show stamina as visual pips");
assert.ok(html.includes("staminaEmptyPanel"), "home should explain empty stamina without blocking practice");
assert.ok(html.includes("スタミナ"), "home should label stamina as stamina");
assert.ok(html.includes("g-stone-chip"), "home should show pack stone count with a G icon chip");
const menuHeaderHtml = html.slice(html.indexOf('<header class="menu-header">'), html.indexOf('<section class="home-deck-panel"'));
assert.ok(!menuHeaderHtml.includes("石 0 / 10"), "home should not show pack stone cost in the header");
assert.ok(
  menuHeaderHtml.includes("home-status-strip") &&
    menuHeaderHtml.includes("menuStoneText") &&
    menuHeaderHtml.includes("menuStaminaText"),
  "home stamina and stone should live in the header beside the logo",
);
assert.ok(gameJs.includes("renderStaminaPips"), "game should update visual stamina pips");
assert.ok(gameJs.includes("renderHomeStaminaEmpty"), "game should update empty stamina guidance");
assert.ok(gameJs.includes("practiceMode"), "game should include no-reward practice when stamina is empty");
assert.ok(gameJs.includes("報酬なし"), "practice mode should clearly say it grants no rewards");
assert.ok(html.includes("quitRunButton"), "pause overlay should let the player quit a run");
assert.ok(html.includes("finishHome"), "result should let the player return to the top menu");
assert.ok(gameJs.includes("run_quit"), "quit flow should be logged in local test telemetry");
assert.ok(gameJs.includes("addDailyMissionProgress"), "game should track daily mission progress");
assert.ok(gameJs.includes("grantDailyMissionReward"), "game should grant daily mission rewards");
assert.ok(gameJs.includes("dailyStreak"), "game should persist daily streak state");
assert.ok(gameJs.includes("updateDailyStreakOnClaim"), "game should advance daily streak on mission claim");
assert.ok(gameJs.includes("dailyScoreTarget"), "game should persist daily score target state");
assert.ok(gameJs.includes("updateDailyScoreTarget"), "game should update daily score target on run finish");
assert.ok(gameJs.includes("grantDailyScoreTargetReward"), "game should grant daily score target rewards");
assert.ok(html.includes("weeklyChallengePanel"), "missions screen should expose the weekly challenge panel");
assert.ok(gameJs.includes("weeklyChallenge"), "game should persist weekly challenge state");
assert.ok(gameJs.includes("addWeeklyChallengeProgress"), "game should update weekly challenge progress");
assert.ok(gameJs.includes("grantWeeklyChallengeReward"), "game should grant weekly challenge rewards");
assert.ok(gameJs.includes("formatResultRewardLine"), "result reward summary should be reused for sharing and closed-test reports");
assert.ok(gameJs.includes("報酬 ${formatResultRewardLine(result)}"), "result image should include a reward summary line");
assert.ok(html.includes("dailyWordPanel"), "missions screen should expose a daily word target panel");
assert.ok(html.includes("dailyWordGuideButton"), "daily word target should link into the word guide");
assert.ok(gameJs.includes("dailyWordCard"), "game should select a daily word from the current deck");
assert.ok(gameJs.includes("renderMissionDailyWord"), "game should render daily word target copy on the missions screen");
assert.ok(gameJs.includes("今日のことば:"), "closed-test feedback report should include the daily word target");
assert.ok(html.includes("dailyGiftPanel"), "home should expose the daily gift panel");
assert.ok(html.includes("dailyGiftModal"), "daily gift should be presented as a first-login modal");
assert.ok(html.includes("adBanner"), "app should reserve a bottom banner ad slot");
assert.ok(gameJs.includes("claimDailyGift"), "game should claim the daily gift from the home screen");
assert.ok(gameJs.includes("daily_gift_claim"), "daily gift should be logged in the non-PII event log");
assert.ok(gameJs.includes("completedRuns"), "game should persist completed runs for early-session pacing");
assert.ok(gameJs.includes("is-warmup-session"), "game should soften mission goals during the first completed runs");
assert.ok(html.includes('data-app-screen="missions"'), "app should define a dedicated missions screen");
assert.ok(html.includes('data-nav-target="missions"'), "home should link to the missions screen");
assert.ok(html.includes("missionsLockedPanel"), "missions screen should show an unlock notice before the first run");
assert.ok(html.includes("<strong>ミッション</strong>"), "home mission action should be labeled as missions");
assert.ok(!html.includes("menuMissionSummary"), "home mission action should not include progress text");
assert.ok(!gameJs.includes("menuMissionSummary"), "home should not update hidden mission progress copy");
const menuGridHtml = html.slice(html.indexOf('<nav class="menu-grid"'), html.indexOf("</nav>", html.indexOf('<nav class="menu-grid"')));
assert.ok(menuHeaderHtml.includes('data-nav-target="settings"'), "home settings should live in the upper right header");
assert.ok(menuGridHtml.includes('data-nav-target="game"'), "home main actions should include the game in the center");
assert.ok(menuGridHtml.includes('data-nav-target="ranking"'), "home main actions should include ranking");
assert.ok(!menuGridHtml.includes('data-nav-target="settings"'), "home should not duplicate settings in the bottom action row");
assert.ok(!menuGridHtml.includes('data-nav-target="purchase"'), "home should not show G purchase in the bottom action row");
assert.ok(styles.includes("grid-template-columns: repeat(5"), "home main actions should stay five-wide");
assert.ok(html.includes("title-card-showcase"), "title should show a richer card showcase");
assert.ok(styles.includes(".title-feature-card"), "title card showcase should be styled");
assert.ok(styles.includes(".game-logo-img"), "game logo should be styled");
assert.ok(!html.includes("title-mode-chips"), "title should not show generic feature chips");
assert.ok(styles.includes(".title-start-button span"), "title start prompt should be text-only");
assert.ok(styles.includes(".missions-screen"), "missions screen should have dedicated mobile styling");
assert.ok(gameJs.includes("is-claimed"), "game should visually mark claimed mission panels after warmup");
assert.ok(html.includes("wordGuideLetters"), "deck word guide should show kana breakdown");
assert.ok(html.includes("wordGuideStatus"), "deck word guide should include game-facing status");
assert.ok(!html.includes("wordGuidePrompt"), "deck word guide should not expose internal talk prompts");
assert.ok(!html.includes("wordGuideLearning"), "deck word guide should not expose internal learning hooks");
assert.ok(!html.includes("wordGuideReactionCue"), "deck word guide should not expose internal reaction cues");
assert.ok(!html.includes("wordGuideViewerCue"), "deck word guide should not expose internal viewer cues");
assert.ok(html.includes("word-guide-action"), "deck word guide should include a direct action button");
assert.ok(gameJs.includes("HIDDEN_COLLECTION_CARD_IDS"), "deck builder should hide retired basic cards from collection");
assert.ok(gameJs.includes('"basic-kusatsu-onsen"'), "deck builder should hide kusatsu onsen from collection");
assert.ok(!gameJs.includes('new Set(["basic-kusatsu-onsen", "basic-yaki-manju"])'), "deck builder should keep yaki manju visible in collection");
assert.ok(gameJs.includes("COLLECTION_SORTS"), "deck builder should support meaningful sorting");
for (const sort of ['label: "おすすめ"', 'label: "レア"', 'label: "名前"']) {
  assert.ok(gameJs.includes(sort), `collection sorts should include ${sort}`);
}
assert.ok(gameJs.includes("COLLECTION_LENGTH_FILTERS"), "deck builder should support collection length filtering");
for (const filter of ['label: "文字ALL"', 'label: "3字"', 'label: "4字"', 'label: "5字+"']) {
  assert.ok(gameJs.includes(filter), `collection length filters should include ${filter}`);
}
assert.ok(gameJs.includes("GUIDE_TALK_PROMPTS"), "deck word guide should support category-specific prompts");
assert.ok(gameJs.includes("GUIDE_LEARNING_CUES"), "deck word guide should support learning hooks");
assert.ok(gameJs.includes("GUIDE_REACTION_CUES"), "deck word guide should support reaction cues");
assert.ok(gameJs.includes("GUIDE_VIEWER_CUES"), "deck word guide should support viewer cues");
assert.ok(gameJs.includes("onWordGuideActionClick"), "deck word guide action should be wired");
assert.ok(styles.includes(".word-guide-action"), "deck word guide action should be styled");
assert.ok(serviceWorker.includes("CORE_ASSETS"), "service worker should list core offline assets");
assert.ok(serviceWorker.includes("./assets/gunmoji-logo.png"), "service worker should cache the game logo");
assert.ok(serviceWorker.includes("./assets/g-daruma.svg"), "service worker should cache the G daruma icon");
assert.ok(serviceWorker.includes("./assets/exchange-daruma.svg"), "service worker should cache the exchange daruma icon");
assert.ok(serviceWorker.includes("caches.open"), "service worker should pre-cache core assets");
assert.ok(serviceWorker.includes("request.mode === \"navigate\""), "service worker should provide navigation fallback");
assert.ok(serviceWorkerRegistrar.includes("location.protocol === \"http:\""), "service worker registrar should skip file protocol");
assert.ok(serviceWorkerRegistrar.includes("serviceWorker"), "service worker registrar should guard service worker support");
assert.ok(exists("tools/release-gate.cjs"), "release gate wrapper should exist");
assert.ok(releaseGate.includes("smoke-browser.cjs"), "release gate should include browser smoke checks");
assert.ok(exists("tools/capture-store-assets.cjs"), "store screenshot capture tool should exist");
assert.ok(exists("tools/check-store-assets.cjs"), "store screenshot check tool should exist");
assert.ok(releaseGate.includes("capture-store-assets.cjs"), "release gate should syntax-check store asset capture");
assert.ok(releaseGate.includes("check-store-assets.cjs"), "release gate should check store screenshot assets");
assert.ok(read("tools/capture-store-assets.cjs").includes("--public"), "store screenshot capture should support public mode");
assert.ok(read("tools/capture-store-assets.cjs").includes("public-screenshots"), "public store screenshots should use a separate output folder");
assert.ok(exists("tools/check-production-readiness.cjs"), "production readiness guard should exist");
assert.ok(exists("tools/build-public-preview.cjs"), "public preview build tool should exist");
assert.ok(exists("tools/check-public-preview.cjs"), "public preview check tool should exist");
assert.ok(exists("tools/smoke-public-preview.cjs"), "public preview browser smoke should exist");
assert.ok(exists("twa-manifest.json"), "Android TWA manifest draft should exist");
assert.ok(exists("android/twa/assetlinks.template.json"), "Android Digital Asset Links template should exist");
assert.ok(exists("docs/ANDROID_TWA_HANDOFF.md"), "Android TWA handoff doc should exist");
assert.ok(exists("docs/DATA_SAFETY_DRAFT.md"), "data safety draft should exist");
assert.ok(exists("docs/CLOSED_TEST_PLAN.md"), "closed test plan should exist");
assert.ok(exists("docs/PLAY_CONSOLE_SUBMISSION_PACK.md"), "Play Console submission pack should exist");
assert.ok(exists("docs/CONTENT_RATING_DRAFT.md"), "content rating draft should exist");
assert.ok(exists("docs/STORE_ASSET_QA.md"), "store asset QA doc should exist");
assert.ok(exists("docs/BUILD_METADATA.md"), "build metadata doc should exist");
assert.ok(exists("tools/check-android-handoff.cjs"), "Android TWA handoff check should exist");
assert.ok(exists("tools/prepare-android-release.cjs"), "Android release preparation tool should exist");
assert.ok(exists("tools/check-android-release-output.cjs"), "Android release output check should exist");
assert.ok(exists("tools/check-data-safety.cjs"), "data safety check should exist");
assert.ok(exists("tools/check-closed-test-plan.cjs"), "closed test plan check should exist");
assert.ok(exists("tools/check-play-console-pack.cjs"), "Play Console submission pack check should exist");
assert.ok(exists("tools/check-content-rating.cjs"), "content rating check should exist");
assert.ok(exists("tools/check-build-metadata.cjs"), "build metadata check should exist");
assert.ok(publicPreviewBuild.includes("dist"), "public preview build should write to a separate output folder");
assert.ok(publicPreviewBuild.includes("PUBLIC_PREVIEW_OUTPUT_DIR"), "public preview build should support isolated output folders");
assert.ok(publicPreviewCheck.includes("PUBLIC_PREVIEW_OUTPUT_DIR"), "public preview check should support isolated output folders");
assert.ok(publicPreviewSmoke.includes("PUBLIC_PREVIEW_OUTPUT_DIR"), "public preview smoke should support isolated output folders");
assert.ok(publicPreviewBuild.includes("PUBLIC_PRIVACY_URL"), "public preview build should allow hosted policy URL overrides");
assert.ok(publicPreviewBuild.includes("policyUrlFromEnv"), "public preview build should validate hosted policy URL overrides");
assert.ok(publicPreviewBuild.includes("packPublicNotice"), "public preview build should replace the closed-test pack notice with a public economy note");
assert.ok(publicPreviewCheck.includes("CLOSED TEST"), "public preview check should reject closed-test copy");
assert.ok(publicPreviewCheck.includes("課金・広告なし"), "public preview check should require the no-payment/no-ad pack note");
assert.ok(publicPreviewCheck.includes("--expect-hosted-policies"), "public preview check should support hosted policy URL verification");
assert.ok(publicPreviewCheck.includes("staminaAdButton"), "public preview check should reject test rewarded recovery UI");
assert.ok(publicPreviewSmoke.includes("dist") && publicPreviewSmoke.includes("public-preview"), "public preview smoke should open the generated public preview");
assert.ok(
  publicPreviewSmoke.includes("packTestNotice") &&
    publicPreviewSmoke.includes("staminaAdButton"),
  "public preview smoke should verify closed-test surfaces are absent",
);
assert.ok(productionReadiness.includes("native-packaging-missing"), "production guard should block missing native packaging");
assert.ok(productionReadiness.includes("twa-manifest-placeholder"), "production guard should block placeholder TWA manifests");
assert.ok(productionReadiness.includes("android-assetlinks-placeholder"), "production guard should block placeholder Digital Asset Links");
assert.ok(productionReadiness.includes("local-economy-with-ad-recovery"), "production guard should block local economy with rewarded recovery");
assert.ok(productionReadiness.includes("--root"), "production guard should support checking generated output roots");
assert.ok(releaseGate.includes("check-production-readiness.cjs"), "release gate should syntax-check production readiness guard");
assert.ok(releaseGate.includes("build-public-preview.cjs"), "release gate should build the public preview");
assert.ok(releaseGate.includes("check-public-preview.cjs"), "release gate should check the public preview");
assert.ok(releaseGate.includes("smoke-public-preview.cjs"), "release gate should browser-smoke the public preview");
assert.ok(releaseGate.includes("Hosted public preview production guard"), "release gate should verify hosted public-preview production readiness");
assert.ok(releaseGate.includes("--expect-hosted-policies"), "release gate should verify hosted policy URLs for public previews");
assert.ok(releaseGate.includes("--skip-native"), "release gate should isolate web-public readiness from native handoff blockers");
assert.ok(releaseGate.includes("check-android-handoff.cjs"), "release gate should check Android TWA handoff artifacts");
assert.ok(releaseGate.includes("prepare-android-release.cjs"), "release gate should syntax-check Android release preparation");
assert.ok(releaseGate.includes("check-android-release-output.cjs"), "release gate should syntax-check Android release output validation");
assert.ok(releaseGate.includes("check-data-safety.cjs"), "release gate should check data safety artifacts");
assert.ok(releaseGate.includes("check-closed-test-plan.cjs"), "release gate should check closed test planning artifacts");
assert.ok(releaseGate.includes("check-play-console-pack.cjs"), "release gate should check Play Console submission artifacts");
assert.ok(releaseGate.includes("check-content-rating.cjs"), "release gate should check content rating draft");
assert.ok(releaseGate.includes("check-build-metadata.cjs"), "release gate should check build metadata");
assert.ok(androidHandoffCheck.includes("TODO_RELEASE_CERT_SHA256"), "Android handoff check should keep signing TODO explicit");
assert.ok(read("tools/prepare-android-release.cjs").includes("RELEASE_CERT_SHA256"), "Android release preparation should require the signing fingerprint");
assert.ok(read("tools/check-android-release-output.cjs").includes("assetlinks.json"), "Android release output check should validate assetlinks output");
assert.equal(twaManifest.packageId, "com.sharocatcreate.kanagunmatsuri", "TWA package id draft should stay stable");
assert.ok(twaManifest.manifestUrl.includes("TODO_PUBLIC_HOST"), "TWA manifest should keep host placeholder explicit");
assert.equal(assetLinksTemplate[0].target.package_name, twaManifest.packageId, "assetlinks package should match TWA manifest");
assert.ok(androidHandoffDoc.includes("Trusted Web Activity"), "Android handoff doc should document the TWA path");
assert.ok(androidHandoffDoc.includes("Four-Perspective Release Notes"), "Android handoff doc should keep four-perspective release notes");
assert.ok(dataSafetyDoc.includes("localStorage"), "data safety draft should document localStorage");
assert.ok(dataSafetyDoc.includes("No third-party analytics SDK"), "data safety draft should document current analytics absence");
assert.ok(dataSafetyDoc.includes("No real payment SDK flow"), "data safety draft should document current payment absence");
assert.ok(dataSafetyDoc.includes("server authority is mandatory"), "data safety draft should block monetized local authority");
assert.ok(closedTestPlan.includes("12 opted-in testers") && closedTestPlan.includes("14 days"), "closed test plan should include Google Play duration notes");
assert.ok(closedTestPlan.includes("Player") && closedTestPlan.includes("Educator / Family"), "closed test plan should include four-perspective cohorts");
assert.ok(closedTestPlan.includes("Production Access Notes To Preserve"), "closed test plan should preserve production access notes");
assert.ok(playConsolePack.includes("Play Console Submission Pack"), "Play Console pack should have a clear title");
assert.ok(playConsolePack.includes("App Content Draft"), "Play Console pack should include app content answers");
assert.ok(playConsolePack.includes("13+"), "Play Console pack should document initial target audience guidance");
assert.ok(playConsolePack.includes("Content ratings questionnaire"), "Play Console pack should mention content rating questionnaire");
assert.ok(playConsolePack.includes("Production Submission Blockers"), "Play Console pack should list production blockers");
assert.ok(playConsolePack.includes("--expect-hosted-policies"), "Play Console pack should document hosted policy URL verification");
assert.ok(playConsolePack.includes("prepare-android-release.cjs"), "Play Console pack should document Android release preparation");
assert.ok(playConsolePack.includes("check-android-release-output.cjs"), "Play Console pack should document Android release output checks");
assert.ok(contentRatingDraft.includes("No violence"), "content rating draft should document no-violence answer");
assert.ok(contentRatingDraft.includes("No real ad SDK"), "content rating draft should document no-real-ad state");
assert.ok(contentRatingDraft.includes("Recheck Triggers"), "content rating draft should document recheck triggers");
assert.ok(storeAssetQa.includes("1290x2796"), "store asset QA should document screenshot dimensions");
assert.ok(storeAssetQa.includes("all 18 screenshots"), "store asset QA should document the 18 screenshot set");
assert.ok(storeAssetQa.includes("Four-Perspective Review"), "store asset QA should include four-perspective review notes");
assert.ok(privacyPolicy.includes("ぐんもじぱずる") && privacyPolicy.includes("非PII"), "privacy policy should include app-specific non-PII notes");
assert.ok(termsPolicy.includes("広告/課金SDKは未接続"), "terms should disclose prototype SDK state");
assert.ok(commercialPolicy.includes("ランダムアイテム") && commercialPolicy.includes("排出率"), "commercial notice should mention random item probability");
assert.ok(storeListingDoc.includes("ぐんもじぱずる"), "store listing draft should include the app name");
assert.ok(storeListingDoc.includes("Short Description"), "store listing draft should include short description");
assert.ok(storeListingDoc.includes("Screenshot Set"), "store listing draft should document screenshot order");
assert.ok(storeListingDoc.includes("08-missions.png"), "store listing draft should include the missions screenshot");
assert.ok(storeListingDoc.includes("09-ranking.png"), "store listing draft should include the ranking screenshot");
assert.ok(storeListingDoc.includes("Production Notes"), "store listing draft should include production caveats");
assert.ok(storeListingDoc.includes("CLOSED TEST"), "store listing draft should warn about closed-test labels");
assert.ok(storeListingDoc.includes("capture-store-assets.cjs --public"), "store listing draft should document public screenshot capture");
assert.ok(storeListingDoc.includes("check-production-readiness.cjs"), "store listing draft should document production readiness guard");
assert.ok(storeListingDoc.includes("BUILD_METADATA.md"), "store listing draft should document exact build metadata");
assert.ok(releaseDoc.includes("BUILD_METADATA.md"), "release readiness doc should link build metadata");
assert.ok(playConsolePack.includes("BUILD_METADATA.md"), "Play Console pack should link build metadata");
assert.ok(androidHandoffDoc.includes("prepare-android-release.cjs"), "Android handoff doc should document Android release preparation");
assert.ok(androidHandoffDoc.includes("check-android-release-output.cjs"), "Android handoff doc should document Android release output checks");
assert.ok(buildMetadata.includes("0.1.0-closed-test.1"), "build metadata should document the current build id");
assert.ok(buildMetadata.includes("Four-Perspective Review"), "build metadata should include four-perspective release notes");
assert.deepEqual(
  data.build,
  {
    versionName: "0.1.0",
    versionCode: 1,
    channel: "closed-test",
    buildId: "0.1.0-closed-test.1",
    builtAt: "2026-06-12",
  },
  "build metadata settings should be explicit in data",
);
assert.deepEqual(data.stamina, { max: 5, playCost: 1, recoverSeconds: 600 }, "stamina MVP settings should be explicit in data");
assert.equal(data.rankingSeason.id, "season-1", "ranking season should be operator-defined in data");
assert.equal(data.rankingSeason.qualifierTopN, 100, "ranking season should track the season top 100");
assert.equal(data.rankingApi.stageLimit, 100, "season ranking sync should fetch the top 100");
assert.deepEqual(
  data.rankingSeason.stages.map((stage) => stage.id),
  ["season-1"],
  "ranking season should define one full-season stage",
);
assert.deepEqual(
  data.rankingSeason.finalRules.map((rule) => rule.type),
  [],
  "ranking season should not enable final deck rules until a final stage is configured",
);
assert.equal(data.packs[0].displayName, "ぐんまのし", "season 1 city pack should keep its display name");
assert.equal(data.packs[0].saleEndsAt, "2026-08-31T23:59:59+09:00", "season 1 city pack should end with season 1");
assert.equal(data.packs[0].entryMode, "fixed-card-list", "current pack mode should be explicit");
assert.equal(data.packs[0].futureEntryMode, "randomizable-card-pool", "future random pack mode should be documented");
assert.ok(data.packs[0].saleStartsAt && data.packs[0].saleEndsAt, "season 1 pack should keep configurable sale dates");
assert.equal(data.packs[0].exchangeMedalItem, "packMedal", "season 1 pack should keep exchange token item explicit");
assert.equal(data.packs[0].exchangeMedalGrant, 1, "season 1 pack should grant one exchange token per opening");
assert.equal(data.packs[0].exchangeMedalCost, 50, "season 1 pack should exchange fifty pack-specific tokens for one unowned card");
const seasonOneCityIds = [
  "season1-maebashi",
  "season1-takasaki",
  "season1-kiryu",
  "season1-isesaki",
  "season1-ota",
  "season1-numata",
  "season1-tatebayashi",
  "season1-shibukawa",
  "season1-fujioka",
  "season1-tomioka",
  "season1-annaka",
  "season1-midori",
];
assert.deepEqual(
  data.packs[0].entries.filter((entry) => entry.type === "card").map((entry) => entry.cardId),
  seasonOneCityIds,
  "season 1 pack should contain the requested city card list in order",
);
for (const id of seasonOneCityIds) {
  const card = data.cards.find((candidate) => candidate.id === id);
  assert.ok(card?.artImage, `${id} should reference generated card art`);
  assert.ok(exists(card.artImage), `${id} generated card art should exist`);
  assert.ok(publicPreviewBuild.includes(card.artImage), `${id} art should be copied into the public preview`);
}
assert.deepEqual(
  data.dailyMission,
  {
    id: "daily-clear-30",
    targetMatches: 30,
    rewardItem: "packStone",
    rewardAmount: 1,
    streakBonusEvery: 3,
    streakBonusItem: "packStone",
    streakBonusAmount: 1,
  },
  "daily mission MVP settings should be explicit in data",
);
assert.deepEqual(
  data.dailyMissions.map(({ id, type, target, rewardAmount }) => ({ id, type, target, rewardAmount })),
  [
    { id: "daily-play-3", type: "runs", target: 3, rewardAmount: 1 },
    { id: "daily-words-30", type: "matches", target: 30, rewardAmount: 1 },
    { id: "daily-score-15000", type: "scoreTotal", target: 15000, rewardAmount: 1 },
  ],
  "rotating daily mission settings should be explicit in data",
);
assert.deepEqual(
  data.dailyScoreTarget,
  {
    id: "daily-score-5000",
    targetScore: 5000,
    rewardItem: "packStone",
    rewardAmount: 1,
  },
  "daily score target MVP settings should be explicit in data",
);
assert.deepEqual(
  data.weeklyChallenge,
  {
    id: "weekly-festival-200",
    targetMatches: 200,
    rewardItem: "packStone",
    rewardAmount: 10,
    label: "週替わりチャレンジ",
    note: "今週のことばを200語見つける",
  },
  "weekly challenge MVP settings should be explicit in data",
);
assert.deepEqual(
  data.weeklyMissions.map(({ id, type, target, rewardAmount }) => ({ id, type, target, rewardAmount })),
  [
    { id: "weekly-play-20", type: "runs", target: 20, rewardAmount: 10 },
    { id: "weekly-words-200", type: "matches", target: 200, rewardAmount: 10 },
    { id: "weekly-score-100000", type: "scoreTotal", target: 100000, rewardAmount: 10 },
  ],
  "rotating weekly mission settings should be explicit in data",
);
assert.deepEqual(
  data.dailyRanking,
  {
    id: "daily-ranking",
    label: "デイリーランキング",
    topLimit: 10,
    rewardRankMax: 10,
    rewardItem: "packStone",
    rewardAmount: 3,
    rewardLabel: "昨日トップ10報酬",
    note: "毎日0時に切り替わる気軽なランキング",
  },
  "daily ranking settings should be explicit in data",
);
assert.deepEqual(
  data.dailyGift,
  {
    id: "daily-login-gift",
    rewardItem: "packStone",
    rewardAmount: 1,
    label: "今日の差し入れ",
    note: "毎日1回、無料でGだるまを受け取れます",
  },
  "daily gift MVP settings should be explicit in data",
);

for (const required of ["Store Submission Blockers", "Popularity Improvement Backlog", "Release Gate Commands"]) {
  assert.ok(releaseDoc.includes(required), `release doc missing section: ${required}`);
}

console.log("Gunmoji Puzzle release readiness checks passed.");
