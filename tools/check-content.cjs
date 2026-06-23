const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");
const data = require("../data/cards.js");
const files = [
  "index.html",
  "README.md",
  "docs/GDD.md",
  "docs/ROADMAP.md",
  "docs/PLAYTEST_CHECKLIST.md",
  "docs/FOUR_PERSPECTIVE_DEBUG.md",
  "docs/RIGHTS_AND_MONETIZATION.md",
  "docs/DATA_SAFETY_DRAFT.md",
  "docs/ART_PROMPT_LOG.md",
  "docs/BALANCE_MODEL.md",
  "docs/MOBILE_RELEASE_READINESS.md",
  "docs/ANDROID_TWA_HANDOFF.md",
  "docs/CLOSED_TEST_PLAN.md",
  "docs/PLAY_CONSOLE_SUBMISSION_PACK.md",
  "docs/CONTENT_RATING_DRAFT.md",
  "docs/STORE_ASSET_QA.md",
  "docs/PROMO_ASSET_QA.md",
  "docs/SOUND_QA.md",
  "docs/BUILD_METADATA.md",
  "docs/STORE_LISTING_DRAFT.md",
  "manifest.webmanifest",
  "data/cards.js",
  "tools/check-rules.cjs",
];

const banned = [
  "かな玉",
  "なぞり",
  "なぞる",
  "チャンス列",
  "balls",
  "2回タップ",
  "スコアペナルティ",
  "あかぎやま",
  "basic-akagi-yama",
  "akagi-yama",
];

for (const file of files) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  for (const word of banned) {
    assert.ok(!text.includes(word), `${file} still contains old term: ${word}`);
  }
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const gameJs = fs.readFileSync(path.join(root, "scripts", "game.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const releaseReadiness = fs.readFileSync(path.join(root, "docs", "MOBILE_RELEASE_READINESS.md"), "utf8");
const androidHandoff = fs.readFileSync(path.join(root, "docs", "ANDROID_TWA_HANDOFF.md"), "utf8");
const dataSafety = fs.readFileSync(path.join(root, "docs", "DATA_SAFETY_DRAFT.md"), "utf8");
const closedTestPlan = fs.readFileSync(path.join(root, "docs", "CLOSED_TEST_PLAN.md"), "utf8");
const playConsolePack = fs.readFileSync(path.join(root, "docs", "PLAY_CONSOLE_SUBMISSION_PACK.md"), "utf8");
const contentRatingDraft = fs.readFileSync(path.join(root, "docs", "CONTENT_RATING_DRAFT.md"), "utf8");
const storeAssetQa = fs.readFileSync(path.join(root, "docs", "STORE_ASSET_QA.md"), "utf8");
const promoAssetQa = fs.readFileSync(path.join(root, "docs", "PROMO_ASSET_QA.md"), "utf8");
const soundQa = fs.readFileSync(path.join(root, "docs", "SOUND_QA.md"), "utf8");
const buildMetadata = fs.readFileSync(path.join(root, "docs", "BUILD_METADATA.md"), "utf8");
const storeListing = fs.readFileSync(path.join(root, "docs", "STORE_LISTING_DRAFT.md"), "utf8");
const gdd = fs.readFileSync(path.join(root, "docs", "GDD.md"), "utf8");
const playtestChecklist = fs.readFileSync(path.join(root, "docs", "PLAYTEST_CHECKLIST.md"), "utf8");
const fourPerspective = fs.readFileSync(path.join(root, "docs", "FOUR_PERSPECTIVE_DEBUG.md"), "utf8");
assert.ok(html.includes("かなパネルプレイフィールド"), "canvas aria-label should mention panels");
assert.ok(html.includes("manifest.webmanifest"), "index.html should link app manifest");
assert.ok(html.includes("assets/gunmoji-logo.png"), "app screens should use the Gunmoji logo asset");
assert.ok(html.includes("exchange-daruma-icon"), "pack exchange UI should expose the exchange daruma icon");
assert.ok(styles.includes("assets/g-daruma.svg"), "G daruma UI should use the shared daruma icon asset");
assert.ok(fs.existsSync(path.join(root, "assets", "g-daruma.svg")), "G daruma icon asset should exist");
assert.ok(fs.existsSync(path.join(root, "assets", "exchange-daruma.svg")), "exchange daruma icon asset should exist");
assert.ok(html.includes("title-logo-heading"), "title screen should render the logo");
assert.ok(!html.includes("menu-logo-heading"), "top menu should not render the logo");
assert.ok(!html.includes("play-logo-heading"), "play screen should keep the top HUD free of the logo");
assert.ok(html.includes("skill-boost-label"), "play controls should label the push skill as a boost");
assert.ok(html.includes("title-card-showcase"), "title screen should show the card showcase");
assert.ok(html.includes("title-card-daruma"), "title screen should feature generated card art");
assert.ok(!html.includes("title-mode-chips"), "title screen should not expose generic feature chips");
assert.ok(!html.includes("3枚デッキ"), "title screen should avoid generic feature labels");
assert.ok(!html.includes("finishShare"), "result screen should not include a share action");
assert.ok(!html.includes("finishImage"), "result screen should not include a result image action");
assert.ok(!html.includes("finishGuide"), "result screen should not include a word guide action");
assert.ok(html.includes("finishDeck"), "result screen should include a deck builder action");
assert.ok(!html.includes("finishLearnNote"), "result screen should not include a word learning note");
assert.ok(!html.includes("finishNextChallenge"), "result screen should not include a next challenge prompt");
assert.ok(!html.includes("finishProgressRecap"), "result screen should not include mission progress recap chips");
assert.ok(!html.includes("finishDailyProgress"), "result screen should not show daily progress after a run");
assert.ok(!html.includes("finishWeeklyProgress"), "result screen should not show weekly progress after a run");
assert.ok(html.includes("finishRewardSummary"), "result screen should include a run reward summary");
assert.ok(html.includes("finishHome"), "result screen should let the player return to the top menu");
assert.ok(!html.includes("finishSpotlight"), "result screen should not include removed stream spotlight action");
assert.ok(!html.includes("streamResultCard"), "game screen should not include removed stream result card");
assert.ok(!html.includes("finishFeedbackButtons"), "result screen should not include feedback chips");
assert.ok(!html.includes("data-quick-feedback"), "quick feedback chips should not be tappable from the result screen");
assert.ok(html.includes("wordGuidePanel"), "deck screen should include a word guide panel");
assert.ok(html.includes("wordGuideNote"), "deck screen should expose card learning notes");
assert.ok(html.includes("wordGuideStatus"), "word guide should show game-facing card status");
assert.ok(html.includes("collectionFilterRow"), "deck screen should expose collection filters");
assert.ok(html.includes("collectionSortRow"), "deck screen should expose collection sorting");
assert.ok(html.includes("wordCall"), "play screen should include a transient word call overlay");
assert.ok(html.includes("wordCallText"), "word call overlay should include the cleared word");
assert.ok(html.includes("pauseButton"), "game screen should include a pause button");
assert.ok(html.includes("pauseCard"), "game screen should include a pause overlay");
assert.ok(html.includes("quitRunButton"), "pause overlay should let the player quit a run");
assert.ok(html.includes("home-play-button"), "top menu should include a large play button");
assert.ok(html.includes('data-nav-target="purchase"'), "top menu should include a G shop entry");
assert.ok(html.includes('data-app-screen="purchase"'), "game should include a G purchase screen");
assert.ok(html.includes("purchaseBundleGrid"), "G shop should render bulk purchase bundles");
assert.ok(html.includes("staminaGRecoverButton"), "empty stamina panel should expose G full recovery");
assert.ok(gameJs.includes("recoverStaminaWithG"), "game should recover full stamina with G");
assert.ok(gameJs.includes("buyGBundle"), "game should support closed-test G bundle grants");
assert.ok(String(data.gShop?.staminaFullRecoveryCost) === "1", "G shop should recover full stamina for one G");
assert.ok(html.includes("seasonRankingCard"), "top menu should include a season ranking summary");
assert.ok(html.includes("dailyRankingPanel"), "ranking screen should include a daily ranking panel");
assert.ok(html.includes("dailyRankingList"), "ranking screen should show daily top ten entries");
assert.ok(html.includes("シーズン1"), "ranking should show season 1");
assert.ok(html.includes("2026/06/12 - 2026/08/31"), "ranking should show the season period");
assert.ok(html.includes('data-app-screen="ranking"'), "ranking summary should open a ranking screen");
assert.ok(html.includes("自分の順位"), "daily ranking should show the player's daily rank");
assert.ok(html.includes("自分のシーズンランキング"), "ranking screen should show the player's season ranking");
assert.ok(html.includes("自分のシーズン最高スコア"), "ranking screen should show the player's season best score");
assert.ok(html.includes("トップ100＋自分の順位"), "ranking screen should show the top 100 plus the player's own rank");
assert.ok(gameJs.includes("seasonRecords"), "game should persist season ranking records");
assert.ok(gameJs.includes("updateSeasonBestScore"), "game should update the season best score on runs");
assert.ok(html.includes("tutorialCoach"), "first run should include an in-game tutorial coach");
assert.ok(!html.includes("lastResultPanel"), "top menu should not include a last-run return hook");
assert.ok(!html.includes("menuBestText"), "top menu status should not include a best score chip");
assert.ok(
  html.indexOf("menu-grid") < html.indexOf('data-app-screen="missions"') &&
    html.indexOf('data-app-screen="missions"') < html.indexOf("dailyWordPanel") &&
    html.indexOf('data-app-screen="missions"') < html.indexOf("dailyPanel") &&
    html.indexOf('data-app-screen="missions"') < html.indexOf("scoreGoalPanel") &&
    html.indexOf('data-app-screen="missions"') < html.indexOf("weeklyChallengePanel"),
  "main menu should link to missions while detailed mission panels stay on the missions screen",
);
assert.ok(html.includes("dailyPanel"), "missions screen daily mission should have a panel id for first-session hiding");
assert.ok(html.includes("scoreGoalPanel"), "missions screen score target should have a panel id for first-session hiding");
assert.ok(html.includes("menuDailyTitle"), "missions screen should show the daily mission");
assert.ok(html.includes("menuStreakText"), "missions screen should show the daily streak");
assert.ok(html.includes("menuScoreGoalTitle"), "missions screen should show the daily score target");
assert.ok(html.includes("menuScoreGoalProgress"), "missions screen should show daily score progress");
assert.ok(html.includes("menuScoreGoalBar"), "missions screen should show the daily score meter");
assert.ok(html.includes("weeklyChallengePanel"), "missions screen should include a weekly challenge panel");
assert.ok(html.includes("menuWeeklyProgress"), "missions screen should show weekly challenge progress");
assert.ok(html.includes("menuWeeklyBar"), "missions screen should show the weekly challenge meter");
assert.ok(html.includes("dailyWordPanel"), "missions screen should include a daily word target panel");
assert.ok(html.includes("dailyWordGuideButton"), "daily word should link to the word guide");
assert.ok(!html.includes('menuDailyWordPrompt">話題'), "daily word placeholder should not expose internal talk labels");
assert.ok(html.includes("dailyGiftPanel"), "top menu should include a daily gift panel");
assert.ok(html.includes("dailyGiftButton"), "daily gift should be claimable from the top menu");
assert.ok(html.includes("dailyGiftModal"), "daily gift should open as a first-login modal");
assert.ok(html.includes("dailyGiftModalClaim"), "daily gift modal should be claimable");
assert.ok(html.includes("adBanner"), "app should reserve a bottom banner ad slot");
assert.ok(html.includes("menuStaminaText"), "top menu should show stamina");
assert.ok(html.includes("menuStaminaPips"), "top menu should show visual stamina pips");
assert.ok(html.includes("スタミナ"), "top menu should label stamina as stamina");
assert.ok(html.includes("g-stone-chip"), "top menu should show pack stone count with a G icon chip");
const menuHeaderHtml = html.slice(html.indexOf('<header class="menu-header">'), html.indexOf('<section class="home-deck-panel"'));
assert.ok(!menuHeaderHtml.includes("石 0 / 10"), "top menu should not show pack stone cost in the header");
assert.ok(
  menuHeaderHtml.includes("home-status-strip") &&
    menuHeaderHtml.includes("menuStoneText") &&
    menuHeaderHtml.includes("menuStaminaText"),
  "top menu stamina and stone should live in the header beside the logo",
);
assert.ok(html.includes("staminaEmptyPanel"), "top menu should explain empty stamina and practice mode");
assert.ok(html.includes("menuStaminaEmptyTimer"), "empty stamina panel should show recovery countdown");
assert.ok(html.includes("staminaAdButton"), "top menu should expose rewarded stamina recovery");
assert.ok(html.includes("startButtonText"), "start button should expose dynamic stamina text");
assert.ok(html.includes("stageCountdown"), "playfield should show a stage countdown before the timer starts");
assert.ok(html.includes("stage-start-button"), "start button should live on the playfield before a run starts");
assert.ok(html.includes("skill-card-thumb"), "push skill should expose the push card thumbnail tap target");
assert.ok(!html.includes('id="selectedWord"'), "play screen should not show the old selected-word status row");
assert.ok(!html.includes('id="matchHint"'), "play screen should not show the old auto-judge hint row");
assert.ok(styles.includes(".stage-countdown"), "stage countdown should have mobile styling");
assert.ok(styles.includes(".skill-card-thumb"), "push skill card thumbnail should have mobile styling");
assert.ok(html.includes("largeTextToggle"), "settings should include a large text toggle");
assert.ok(html.includes("contrastToggle"), "settings should include a high contrast toggle");
assert.ok(html.includes("tileMarkToggle"), "settings should include an optional panel number toggle");
assert.ok(html.includes("パネル番号表示"), "panel mark setting should explain panel number visibility");
assert.ok(html.includes("色だけでなく番号"), "panel mark setting should explain non-color identification");
assert.ok(!html.includes("streamModeToggle"), "settings should not include removed stream mode toggle");
assert.ok(html.includes("soundTestButton"), "settings should include a sound test button");
assert.ok(gameJs.includes("testSound"), "game should wire a sound test action");
assert.ok(gameJs.includes("効果音を再生"), "sound test should confirm playback to the user");
assert.ok(gameJs.includes("SCORE_LENGTH_CUBE_FACTOR"), "score curve should use a named length-cube factor");
assert.ok(gameJs.includes("safeLength * safeLength * safeLength"), "score curve should reward longer words with a cubic curve");
assert.ok(gdd.includes("30 × 文字数^3"), "GDD should document the current score curve");
assert.ok(!html.includes("menuStreamButton"), "top menu should not include removed stream mode toggle");
assert.ok(!html.includes("menuStreamText"), "top menu should not show removed stream ON/OFF state");
assert.ok(!html.includes("feedbackReportButton"), "settings should not include a feedback report button");
assert.ok(!html.includes("テストフィードバック"), "settings should not label a feedback report flow");
assert.ok(!html.includes("feedbackInsightPanel"), "settings should not include a feedback insight panel");
assert.ok(!html.includes("feedbackInsightGrid"), "feedback insight panel should stay absent");
assert.ok(!html.includes("感想インサイト"), "feedback insight panel label should stay absent");
assert.ok(html.includes("buildVersionText"), "settings should show the current build version");
assert.ok(html.includes("buildChannelText"), "settings should show the current build channel");
assert.ok(gameJs.includes("telemetryEvents"), "game should keep a bounded closed-test event log");
assert.ok(gameJs.includes("logTelemetryEvent"), "game should record closed-test telemetry events");
assert.ok(!html.includes("data-quick-feedback"), "result quick feedback controls should stay absent");
assert.ok(!styles.includes(".stream-result-card"), "removed stream result spotlight styles should stay absent");
assert.ok(!styles.includes(".phone.is-stream-result"), "removed stream result chrome styles should stay absent");
assert.ok(styles.includes(".title-feature-card"), "title feature cards should have mobile styling");
assert.ok(styles.includes("assets/generated/card-basic-daruma.png"), "title should use generated card art");
assert.ok(styles.includes(".game-logo-img"), "shared game logo should have responsive styling");
assert.ok(styles.includes(".visually-hidden"), "logo headings should preserve accessible text");
assert.ok(styles.includes(".title-start-button span"), "title start prompt should be text-only, not a boxed button");
assert.ok(!styles.includes(".title-mode-chips"), "title feature chip styling should be removed");
assert.ok(!html.includes("finishGuide"), "result screen should not link the best word to the word guide");
assert.ok(!gameJs.includes("openStreamResultSpotlight"), "removed stream result spotlight should stay unwired");
assert.ok(!gameJs.includes("stream_result_spotlight"), "removed stream result telemetry should stay absent");
assert.ok(gameJs.includes("buildRunRewardSummary"), "game should summarize earned run rewards for the result screen");
assert.ok(gameJs.includes("finishRewardText"), "game should render earned rewards on the result screen");
assert.ok(gameJs.includes("formatBuildLabel"), "feedback report should include build metadata");
assert.ok(gameJs.includes("最近のイベント（非PII）"), "feedback report should include recent non-PII events");
assert.ok(html.includes("policyPrivacyLink"), "settings should link the privacy policy");
assert.ok(html.includes("policyTermsLink"), "settings should link the terms page");
assert.ok(html.includes("policyCommercialLink"), "settings should link the commercial transactions page");
assert.ok(html.includes("../homepage/privacy.html"), "privacy policy link should point to the homepage scaffold");
assert.ok(html.includes("../homepage/terms.html"), "terms link should point to the homepage scaffold");
assert.ok(html.includes("../homepage/commercial-transactions.html"), "commercial transactions link should point to the homepage scaffold");
assert.ok(!html.includes("streamStrip"), "game screen should not include removed stream mode overlay");
assert.ok(html.includes("packTestNotice"), "pack screen should label test monetization controls");
assert.ok(html.includes("CLOSED TEST"), "pack screen should clearly mark closed-test economy controls");
assert.ok(html.includes("TEST GRANT"), "pack screen test grant should not look like a real purchase");
assert.ok(html.includes("packReveal"), "pack screen should include a pack opening reveal surface");
assert.ok(html.includes("packRevealRarity"), "pack reveal should show the reward rarity");
assert.ok(html.includes("packRevealMeta"), "pack reveal should show new/duplicate/ticket reward context");
assert.ok(html.includes("packRevealAction"), "pack reveal should include a direct detail action");
assert.ok(!html.includes("packRevealShare"), "pack reveal should not include a share action");
assert.ok(html.includes("packSelector"), "pack screen should support choosing among multiple packs");
assert.ok(!html.includes("pack-flow"), "pack screen should not show redundant flow chips");
assert.ok(html.includes("packPeriodText"), "pack screen should show the configurable sale period");
assert.ok(html.includes("packFeatureRow"), "pack screen should show featured pack cards");
assert.ok(html.includes("packDetailModal"), "pack rates and lineup should live in a detail window");
assert.ok(html.includes("packLineup"), "pack screen should keep lineup details available in the detail window");
assert.ok(html.includes("packExchangeStatus"), "pack screen should show exchange daruma progress");
assert.ok(html.includes("packCollectionProgress"), "pack screen should show collection progress");
assert.ok(fs.readFileSync(path.join(root, "styles.css"), "utf8").includes("pack-shine"), "pack reveal should include a short shine animation");
assert.ok(styles.includes(".g-rarity-icons"), "rarity should render as repeated G icon badges");
assert.ok(styles.includes(".ticket-rarity-badge"), "choice ticket rate should use a player-facing badge");
assert.ok(styles.includes(".pack-feature-row"), "pack featured cards should have compact mobile styling");
assert.ok(styles.includes(".pack-lineup-card"), "pack lineup should have mobile card styling");
assert.ok(styles.includes(".pack-exchange"), "pack exchange daruma should have compact mobile styling");
assert.ok(styles.includes(".pack-progress"), "pack collection progress should have compact mobile styling");
assert.ok(styles.includes(".pack-reveal-action"), "pack reveal action should have compact mobile styling");
assert.ok(!styles.includes(".pack-reveal-share"), "pack reveal share styling should stay removed");
assert.ok(gameJs.includes("rarityMarkupFromCount"), "game should generate repeated G rarity icon markup");
assert.ok(gameJs.includes("packSaleStatus"), "pack opening should respect configured sale periods");
assert.ok(gameJs.includes("renderPackFeature"), "game should render featured high-rarity cards");
assert.ok(gameJs.includes("renderPackSelector"), "game should render selectable pack cards");
assert.ok(gameJs.includes("renderPackDetailModal"), "game should render pack rates and lineup in a detail modal");
assert.ok(gameJs.includes("renderPackLineup"), "game should render pack lineup cards from pack entries");
assert.ok(gameJs.includes("renderPackCollectionProgress"), "game should render pack collection progress");
assert.ok(gameJs.includes("packCardEntries"), "pack card entries should be shared between lineup and progress");
assert.ok(gameJs.includes("openPackRevealTarget"), "pack reveal action should navigate to the opened reward detail");
assert.ok(gameJs.includes("pack_reveal_detail"), "pack reveal detail navigation should be tracked in non-PII telemetry");
assert.ok(!gameJs.includes("packRevealShare"), "pack reveal share DOM should stay removed");
assert.ok(!gameJs.includes("share_pack_reveal"), "pack reveal share telemetry should stay removed");
assert.ok(gameJs.includes("packMedalsByPack"), "game should persist pack-specific exchange tokens");
assert.ok(gameJs.includes("canExchangeCardWithMedals"), "game should allow exchange token use for unowned pack cards");
assert.ok(gameJs.includes("pack_medal_exchange"), "game should track exchange token use in non-PII telemetry");
assert.ok(gameJs.includes("引換だるま"), "game should label pack exchange tokens as 引換だるま");
assert.ok(gameJs.includes("renderStaminaPips"), "game should render visual stamina pips");
assert.ok(gameJs.includes("renderHomeStaminaEmpty"), "game should render empty stamina home guidance");
assert.ok(gameJs.includes("practiceMode"), "game should offer no-reward practice when stamina is empty");
assert.ok(gameJs.includes("quitRun"), "game should support quitting mid-run from pause");
assert.ok(gameJs.includes("returnHomeFromResult"), "game should support returning home from result");
assert.ok(gameJs.includes("run_quit"), "quit flow should be tracked in the non-PII event log");
assert.ok(styles.includes(".pause-actions"), "pause overlay should style resume and quit actions");
assert.ok(styles.includes(".stamina-pip::before"), "stamina pips should have a yaki-manju sauce mark");
assert.ok(gameJs.includes("練習モード 報酬なし"), "practice mode should clearly label no-reward play");
assert.ok(gameJs.includes("drawTileMark"), "game should draw optional panel number marks");
assert.ok(gameJs.includes("deckMembershipLabel"), "game should expose simple deck membership labels");
assert.ok(gameJs.includes("formatDeckSlotActionLabel"), "game should expose deck target labels for card swaps");
assert.ok(gameJs.includes("slotColorLabel"), "deck cards should expose slot color labels in DOM data");
assert.ok(styles.includes(".collection-target-label"), "collection cards should display deck action labels");
assert.ok(gameJs.includes("Cキー、または色チップ"), "deck color cycling should have keyboard-accessible guidance");
assert.ok(styles.includes(".slot-color-index"), "deck color chips should keep optional panel number markup for accessibility settings");
assert.ok(gameJs.includes("COLLECTION_FILTERS"), "game should define game-facing collection filters");
for (const filter of ['label: "ALL"', 'label: "所持"', 'label: "未所持"', 'label: "GGG"', 'label: "GG"', 'label: "G"']) {
  assert.ok(gameJs.includes(filter), `collection filters should include ${filter}`);
}
assert.ok(gameJs.includes("guideCategoryForCard"), "game should map cards to word guide categories");
assert.ok(!gameJs.includes("menuStreamButton"), "game should not wire removed top menu stream toggle");
assert.ok(!gameJs.includes("is-stream-mode"), "game should not apply removed stream-mode class");
assert.ok(!styles.includes(".phone.is-stream-mode .word-call"), "removed stream-mode word call styles should stay absent");
assert.ok(gdd.includes("盤面外表示帯"), "GDD should keep word-call feedback outside the puzzle board");
assert.ok(gdd.includes("次のスライド操作とパネル視認性を優先"), "GDD should keep clear score feedback non-blocking");
assert.ok(playtestChecklist.includes("直後のスライド対象を隠していない"), "playtest checklist should verify word-call does not block the next slide target");
assert.ok(playtestChecklist.includes("盤面や次の操作を塞いでいないか"), "playtest checklist should verify word-call stays outside active tiles");
assert.ok(!html.includes("finishStreamRecap"), "result screen should not include removed stream-mode recap surface");
assert.ok(!gameJs.includes("finishStreamWord"), "game should not populate removed stream-mode recap");
assert.ok(!styles.includes(".phone.is-stream-mode .finish-stream-recap"), "removed stream-mode recap styles should stay absent");
assert.ok(styles.includes(".finish-reward-summary"), "run reward summary should have compact result styling");
assert.ok(gameJs.includes("formatResultRewardLine"), "run reward summary should be shared by result, report, and share text");
assert.ok(gameJs.includes("報酬: ${formatResultRewardLine(result)}"), "share text should include the run reward summary");
assert.ok(gameJs.includes("報酬 ${formatResultRewardLine(state.lastResult)}"), "feedback report should include the run reward summary");
assert.ok(gameJs.includes("completedRuns"), "game should track completed runs for early-session pacing");
assert.ok(gameJs.includes("is-warmup-session"), "game should soften mission goals during the first completed runs");
assert.ok(gameJs.includes("is-claimed"), "game should mark claimed mission panels after warmup");
assert.ok(gameJs.includes("sanitizeLastResult"), "game should safely persist the last result");
assert.ok(html.includes("wordGuideLetters"), "word guide should show the selected card kana breakdown");
assert.ok(!html.includes("wordGuidePrompt"), "word guide should not show internal talk prompts in-game");
assert.ok(!html.includes("wordGuideLearning"), "word guide should not show internal learning hooks in-game");
assert.ok(!html.includes("wordGuideReactionCue"), "word guide should not show internal reaction cues in-game");
assert.ok(!html.includes("wordGuideViewerCue"), "word guide should not show internal viewer cues in-game");
assert.ok(html.includes("word-guide-action"), "word guide should expose a clear action button");
assert.ok(gameJs.includes("GUIDE_TALK_PROMPTS"), "word guide should define category-specific talk prompts");
assert.ok(gameJs.includes("wordGuideStatus"), "word guide should render game-facing card status");
assert.ok(gameJs.includes("HIDDEN_COLLECTION_CARD_IDS"), "deck builder should hide retired basic cards from collection");
assert.ok(gameJs.includes('"basic-kusatsu-onsen"'), "deck builder should hide kusatsu onsen from collection");
assert.ok(!gameJs.includes('new Set(["basic-kusatsu-onsen", "basic-yaki-manju"])'), "deck builder should keep yaki manju visible in collection");
assert.ok(gameJs.includes("COLLECTION_SORTS"), "deck builder should support collection sorting");
for (const sort of ['label: "おすすめ"', 'label: "レア"', 'label: "名前"']) {
  assert.ok(gameJs.includes(sort), `collection sorts should include ${sort}`);
}
assert.ok(gameJs.includes("COLLECTION_LENGTH_FILTERS"), "deck builder should support collection length filtering");
for (const filter of ['label: "文字ALL"', 'label: "3字"', 'label: "4字"', 'label: "5字+"']) {
  assert.ok(gameJs.includes(filter), `collection length filters should include ${filter}`);
}
assert.ok(gameJs.includes("GUIDE_LEARNING_CUES"), "word guide should define category-specific learning hooks");
assert.ok(gameJs.includes("GUIDE_REACTION_CUES"), "word guide should define category-specific reaction cues");
assert.ok(gameJs.includes("GUIDE_VIEWER_CUES"), "word guide should define category-specific viewer cues");
assert.ok(gameJs.includes("onWordGuideActionClick"), "word guide action should be wired to deck and exchange actions");
assert.ok(styles.includes(".word-guide-detail-row"), "word guide details should have mobile styling");
assert.ok(!html.includes("word-guide-hook-grid"), "word guide hooks should not be rendered in-game");
assert.ok(styles.includes(".word-guide-action"), "word guide action should have mobile button styling");
assert.ok(gdd.includes("ALL`, `所持`, `未所持`, `GGG`, `GG`, `G`"), "GDD should describe game-facing collection filters");
assert.ok(gdd.includes("`おすすめ`, `レア`, `名前`"), "GDD should describe collection sorting");
assert.ok(gdd.includes("`文字ALL`, `3字`, `4字`, `5字+`"), "GDD should describe collection length filters");
assert.ok(gdd.includes("ゲーム内UIには `話題`, `学び`, `会話`, `視聴` ラベルを表示しません"), "GDD should keep internal hooks out of UI");
assert.ok(playtestChecklist.includes("`くさつおんせん` が編成候補から外れ") && playtestChecklist.includes("`やきまんじゅう` がカード一覧に残る"), "playtest checklist should verify retired and stamina-themed cards");
assert.ok(playtestChecklist.includes("`ALL/所持/未所持/GGG/GG/G`") && playtestChecklist.includes("`文字ALL/3字/4字/5字+`") && playtestChecklist.includes("`おすすめ/レア/名前`"), "playtest checklist should cover collection filters and sorting");
assert.ok(fourPerspective.includes("デッキ構築の実用フィルタ/ソート"), "four-perspective debug should include deck builder filter/sort reasoning");
assert.ok(fourPerspective.includes("下部バナー広告枠と焼きまんじゅう串"), "four-perspective debug should include banner and stamina visual reasoning");
assert.ok(fourPerspective.includes("スタミナ上部ステータス化"), "four-perspective debug should include top stamina status reasoning");
assert.ok(fourPerspective.includes("ホームのリアクション導線整理"), "four-perspective debug should include post-run home hierarchy reasoning");
assert.ok(gdd.includes("トップメニュー上部のステータス帯"), "GDD should define stamina as an upper home status");
assert.ok(gdd.includes("次回ログイン時だけモーダル"), "GDD should keep daily gift out of the immediate post-run flow");
assert.ok(html.includes('data-app-screen="missions"'), "HTML should define a dedicated missions screen");
assert.ok(html.includes('data-nav-target="missions"'), "top menu should link to the missions screen");
assert.ok(html.includes("<strong>ミッション</strong>"), "top menu should label goals as missions");
assert.ok(!html.includes("menuMissionSummary"), "top menu should not render mission progress inside the action button");
assert.ok(!gameJs.includes("menuMissionSummary"), "game should keep mission progress inside the missions screen");
const menuGridHtml = html.slice(html.indexOf('<nav class="menu-grid"'), html.indexOf("</nav>", html.indexOf('<nav class="menu-grid"')));
assert.ok(menuHeaderHtml.includes('data-nav-target="settings"'), "top menu settings should live in the upper right header");
assert.ok(menuGridHtml.includes('data-nav-target="game"'), "top menu main actions should include the game in the center");
assert.ok(menuGridHtml.includes('data-nav-target="ranking"'), "top menu main actions should include ranking");
assert.ok(!menuGridHtml.includes('data-nav-target="settings"'), "top menu should not duplicate settings in the bottom action row");
assert.ok(!menuGridHtml.includes('data-nav-target="purchase"'), "top menu should not show G purchase in the bottom action row");
assert.ok(styles.includes("grid-template-columns: repeat(5"), "top menu main actions should use a compact five-column layout");
assert.ok(styles.includes(".missions-screen"), "missions screen should have dedicated styling");
assert.ok(playtestChecklist.includes("トップメニュー上部で残り焼きまんじゅう"), "playtest checklist should verify upper stamina visibility");
assert.ok(playtestChecklist.includes("今日のことばや達成カードがプレイ直後の反応導線を邪魔していない"), "playtest checklist should verify post-run reaction hierarchy");
assert.ok(releaseReadiness.includes("Home top-status yaki-manju"), "release readiness should document top-status stamina");
assert.ok(releaseReadiness.includes("Dedicated missions screen"), "release readiness should document mission-screen separation");
assert.ok(gameJs.includes("weeklyChallenge"), "game should persist weekly challenge state");
assert.ok(gameJs.includes("addWeeklyChallengeProgress"), "game should update weekly challenge progress");
assert.ok(gameJs.includes("grantWeeklyChallengeReward"), "game should grant weekly challenge rewards");
assert.ok(gameJs.includes("dailyWordCard"), "game should select a deterministic daily word from the deck");
assert.ok(gameJs.includes("renderMissionDailyWord"), "game should render the mission daily word target");
assert.ok(gameJs.includes("今日のことば:"), "feedback report should include the daily word target");
assert.ok(styles.includes(".daily-word-panel"), "daily word target should have mobile styling");
assert.ok(gameJs.includes("dailyGift"), "game should persist daily gift state");
assert.ok(gameJs.includes("claimDailyGift"), "game should claim the daily gift from the top menu");
assert.ok(gameJs.includes("daily_gift_claim"), "daily gift should be added to the non-PII event log");
assert.ok(!gameJs.includes("renderFinishProgressRecap"), "game should keep mission progress out of the result screen");
assert.ok(gameJs.includes("runTutorialDemo"), "first run should auto-demo the tutorial clear if the player stalls");
assert.ok(styles.includes(".tutorial-coach"), "tutorial coach should have dedicated mobile styling");
assert.ok(readme.includes("tools\\release-gate.cjs"), "README should document the release gate command");
assert.ok(readme.includes("docs/STORE_LISTING_DRAFT.md"), "README should document the store listing draft");
assert.ok(releaseReadiness.includes("tools\\release-gate.cjs"), "release readiness doc should document the release gate command");
assert.ok(releaseReadiness.includes("capture-store-assets.cjs"), "release readiness doc should document store screenshot capture");
assert.ok(readme.includes("capture-store-assets.cjs --public"), "README should document public store screenshot capture");
assert.ok(releaseReadiness.includes("capture-store-assets.cjs --public"), "release readiness doc should document public store screenshot capture");
assert.ok(readme.includes("build-public-preview.cjs"), "README should document public preview build");
assert.ok(releaseReadiness.includes("build-public-preview.cjs"), "release readiness doc should document public preview build");
assert.ok(readme.includes("PUBLIC_PRIVACY_URL"), "README should document hosted policy URL overrides");
assert.ok(releaseReadiness.includes("PUBLIC_PRIVACY_URL"), "release readiness doc should document hosted policy URL overrides");
assert.ok(readme.includes("PUBLIC_PREVIEW_OUTPUT_DIR"), "README should document isolated public preview output");
assert.ok(releaseReadiness.includes("PUBLIC_PREVIEW_OUTPUT_DIR"), "release readiness doc should document isolated public preview output");
assert.ok(releaseReadiness.includes("--expect-hosted-policies"), "release readiness doc should document hosted policy verification");
assert.ok(releaseReadiness.includes("--skip-native"), "release readiness doc should document web-public production guard without native blockers");
assert.ok(fourPerspective.includes("公開成果物の本番URLガード"), "four-perspective debug should include hosted public-preview guard reasoning");
assert.ok(storeListing.includes("check-public-preview.cjs"), "store listing draft should document public preview checks");
assert.ok(storeListing.includes("PUBLIC_PREVIEW_OUTPUT_DIR"), "store listing draft should document isolated hosted public preview checks");
assert.ok(playConsolePack.includes("--expect-hosted-policies"), "Play Console pack should document hosted policy URL verification");
assert.ok(playConsolePack.includes("課金・広告なし"), "Play Console pack should require the public pack no-payment/no-ad note");
assert.ok(dataSafety.includes("free in-game `Gだるま`"), "data safety draft should explain public preview pack opening uses free Gだるま");
assert.ok(readme.includes("smoke-public-preview.cjs"), "README should document public preview browser smoke");
assert.ok(releaseReadiness.includes("smoke-public-preview.cjs"), "release readiness doc should document public preview browser smoke");
assert.ok(readme.includes("check-production-readiness.cjs"), "README should document the production readiness guard");
assert.ok(releaseReadiness.includes("check-production-readiness.cjs"), "release readiness doc should document the production readiness guard");
assert.ok(storeListing.includes("check-production-readiness.cjs"), "store listing draft should document the production readiness guard");
assert.ok(readme.includes("check-android-handoff.cjs"), "README should document the Android TWA handoff check");
assert.ok(readme.includes("prepare-android-release.cjs"), "README should document the Android release preparation tool");
assert.ok(readme.includes("check-android-release-output.cjs"), "README should document the Android release output check");
assert.ok(releaseReadiness.includes("ANDROID_TWA_HANDOFF.md"), "release readiness doc should link the Android TWA handoff doc");
assert.ok(releaseReadiness.includes("prepare-android-release.cjs"), "release readiness doc should document Android release preparation");
assert.ok(releaseReadiness.includes("check-android-release-output.cjs"), "release readiness doc should document Android release output checks");
assert.ok(storeListing.includes("ANDROID_TWA_HANDOFF.md"), "store listing draft should mention the Android TWA handoff doc");
assert.ok(androidHandoff.includes("Trusted Web Activity"), "Android handoff doc should explain the TWA path");
assert.ok(androidHandoff.includes("TODO_RELEASE_CERT_SHA256"), "Android handoff doc should document the signing placeholder");
assert.ok(androidHandoff.includes("--expect-hosted-policies"), "Android handoff doc should document hosted policy URL verification");
assert.ok(androidHandoff.includes("prepare-android-release.cjs"), "Android handoff doc should document Android release preparation");
assert.ok(androidHandoff.includes("check-android-release-output.cjs"), "Android handoff doc should document Android release output checks");
assert.ok(playConsolePack.includes("prepare-android-release.cjs"), "Play Console pack should document Android release preparation");
assert.ok(playConsolePack.includes("check-android-release-output.cjs"), "Play Console pack should document Android release output checks");
assert.ok(readme.includes("DATA_SAFETY_DRAFT.md"), "README should document the data safety draft");
assert.ok(readme.includes("check-data-safety.cjs"), "README should document the data safety check");
assert.ok(releaseReadiness.includes("DATA_SAFETY_DRAFT.md"), "release readiness doc should link the data safety draft");
assert.ok(storeListing.includes("check-data-safety.cjs"), "store listing draft should mention the data safety check");
assert.ok(dataSafety.includes("localStorage"), "data safety draft should document localStorage");
assert.ok(dataSafety.includes("No third-party analytics SDK"), "data safety draft should document current analytics absence");
assert.ok(dataSafety.includes("No real payment SDK flow"), "data safety draft should document current payment absence");
assert.ok(readme.includes("CLOSED_TEST_PLAN.md"), "README should document the closed test plan");
assert.ok(readme.includes("check-closed-test-plan.cjs"), "README should document the closed test plan check");
assert.ok(releaseReadiness.includes("CLOSED_TEST_PLAN.md"), "release readiness doc should link the closed test plan");
assert.ok(storeListing.includes("check-closed-test-plan.cjs"), "store listing draft should mention the closed test plan check");
assert.ok(closedTestPlan.includes("12 opted-in testers"), "closed test plan should mention the Google Play tester count note");
assert.ok(closedTestPlan.includes("14-Day Test Script"), "closed test plan should include a day-by-day script");
assert.ok(readme.includes("PLAY_CONSOLE_SUBMISSION_PACK.md"), "README should document Play Console submission pack");
assert.ok(readme.includes("check-play-console-pack.cjs"), "README should document the Play Console pack check");
assert.ok(releaseReadiness.includes("PLAY_CONSOLE_SUBMISSION_PACK.md"), "release readiness doc should link Play Console submission pack");
assert.ok(storeListing.includes("PLAY_CONSOLE_SUBMISSION_PACK.md"), "store listing draft should mention Play Console submission pack");
assert.ok(playConsolePack.includes("App Content Draft"), "Play Console pack should include app content draft");
assert.ok(playConsolePack.includes("Target audience and content"), "Play Console pack should include target audience guidance");
assert.ok(readme.includes("CONTENT_RATING_DRAFT.md"), "README should document content rating draft");
assert.ok(readme.includes("check-content-rating.cjs"), "README should document content rating check");
assert.ok(releaseReadiness.includes("CONTENT_RATING_DRAFT.md"), "release readiness doc should link content rating draft");
assert.ok(storeListing.includes("CONTENT_RATING_DRAFT.md"), "store listing draft should mention content rating draft");
assert.ok(playConsolePack.includes("CONTENT_RATING_DRAFT.md"), "Play Console pack should link content rating draft");
assert.ok(contentRatingDraft.includes("Questionnaire Draft"), "content rating draft should include questionnaire answers");
assert.ok(contentRatingDraft.includes("Recheck Triggers"), "content rating draft should include recheck triggers");
assert.ok(readme.includes("STORE_ASSET_QA.md"), "README should document store asset QA");
assert.ok(readme.includes("check-store-assets.cjs"), "README should document the store asset check");
assert.ok(releaseReadiness.includes("STORE_ASSET_QA.md"), "release readiness doc should link store asset QA");
assert.ok(storeListing.includes("check-store-assets.cjs"), "store listing draft should mention the store asset check");
assert.ok(storeListing.includes("08-missions.png"), "store listing draft should include the missions screenshot");
assert.ok(storeListing.includes("09-ranking.png"), "store listing draft should include the ranking screenshot");
assert.ok(storeAssetQa.includes("1290x2796"), "store asset QA should document captured PNG dimensions");
assert.ok(storeAssetQa.includes("all 18 screenshots"), "store asset QA should document the 18 screenshot set");
assert.ok(storeAssetQa.includes("Four-Perspective Review"), "store asset QA should include four-perspective notes");
assert.ok(readme.includes("PROMO_ASSET_QA.md"), "README should document promo asset QA");
assert.ok(readme.includes("generate-feature-graphic.cjs"), "README should document feature graphic generation");
assert.ok(readme.includes("check-promo-assets.cjs"), "README should document promo asset checks");
assert.ok(releaseReadiness.includes("PROMO_ASSET_QA.md"), "release readiness doc should link promo asset QA");
assert.ok(storeListing.includes("feature-graphic.jpg"), "store listing draft should mention the feature graphic");
assert.ok(promoAssetQa.includes("1024x500"), "promo asset QA should document feature graphic dimensions");
assert.ok(promoAssetQa.includes("Four-Perspective Review"), "promo asset QA should include four-perspective notes");
assert.ok(readme.includes("SOUND_QA.md"), "README should document sound QA");
assert.ok(readme.includes("check-sound-cues.cjs"), "README should document the sound cue check");
assert.ok(releaseReadiness.includes("SOUND_QA.md"), "release readiness doc should link sound QA");
assert.ok(soundQa.includes("Web Audio"), "sound QA should document Web Audio usage");
assert.ok(soundQa.includes("Four-Perspective QA Notes"), "sound QA should include four-perspective notes");
assert.ok(readme.includes("BUILD_METADATA.md"), "README should document build metadata");
assert.ok(readme.includes("check-build-metadata.cjs"), "README should document the build metadata check");
assert.ok(releaseReadiness.includes("BUILD_METADATA.md"), "release readiness doc should link build metadata");
assert.ok(playConsolePack.includes("BUILD_METADATA.md"), "Play Console pack should link build metadata");
assert.ok(storeListing.includes("BUILD_METADATA.md"), "store listing draft should mention build metadata before submission");
assert.ok(buildMetadata.includes("0.1.0-closed-test.1"), "build metadata should document the current build id");
assert.ok(buildMetadata.includes("Four-Perspective Review"), "build metadata should include four-perspective notes");

const cardById = new Map(data.cards.map((card) => [card.id, card]));
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
assert.equal(cardById.get("basic-akagi-san").displayName, "あかぎさん", "akagi card display name should be あかぎさん");
assert.equal(cardById.get("basic-akagi-san").readingKana, "あかぎさん", "akagi card reading should be あかぎさん");
assert.ok(cardById.get("basic-akagi-san").artImage.endsWith("card-basic-akagi-san.png"), "akagi art image should use san filename");
assert.ok(cardById.get("basic-gunma-ken").learnNote.includes("群馬県"), "gunma card should include a learning note");
for (const card of data.cards) {
  for (const field of ["guidePrompt", "guideLearning", "guideReactionCue", "guideViewerCue"]) {
    assert.ok(
      typeof card[field] === "string" && card[field].length >= 6,
      `${card.id} should include ${field} for the word guide`,
    );
  }
}
assert.deepEqual(
  data.packs[0].entries.filter((entry) => entry.type === "card").map((entry) => entry.cardId),
  seasonOneCityIds,
  "season 1 pack should contain the requested city card list in order",
);
assert.ok(data.packs[0].saleStartsAt && data.packs[0].saleEndsAt, "season 1 pack should keep configurable sale dates");
for (const id of seasonOneCityIds) {
  const card = cardById.get(id);
  assert.ok(card?.artImage, `${id} should reference generated card art`);
  assert.ok(fs.existsSync(path.join(root, card.artImage)), `${id} generated card art should exist`);
}
assert.equal(data.packs[0].displayName, "ぐんまのし", "season 1 city pack name changed unexpectedly");
assert.equal(data.packs[0].entryMode, "fixed-card-list", "season 1 pack should currently use fixed entries");
assert.equal(data.packs[0].futureEntryMode, "randomizable-card-pool", "pack data should keep a future random pool marker");
assert.equal(data.packs[0].exchangeMedalItem, "packMedal", "season 1 pack should define exchange token item");
assert.equal(data.packs[0].exchangeMedalGrant, 1, "season 1 pack should grant one exchange token per opening");
assert.equal(data.packs[0].exchangeMedalCost, 50, "season 1 pack should exchange fifty pack-specific tokens for one unowned card");
assert.deepEqual(
  data.build,
  {
    versionName: "0.1.0",
    versionCode: 1,
    channel: "closed-test",
    buildId: "0.1.0-closed-test.1",
    builtAt: "2026-06-12",
  },
  "build metadata MVP values changed unexpectedly",
);
assert.deepEqual(data.stamina, { max: 5, playCost: 1, recoverSeconds: 600 }, "stamina MVP numbers changed unexpectedly");
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
  "daily mission MVP numbers changed unexpectedly",
);
assert.deepEqual(
  data.dailyMissions.map(({ id, type, target, rewardAmount }) => ({ id, type, target, rewardAmount })),
  [
    { id: "daily-play-3", type: "runs", target: 3, rewardAmount: 1 },
    { id: "daily-words-30", type: "matches", target: 30, rewardAmount: 1 },
    { id: "daily-score-15000", type: "scoreTotal", target: 15000, rewardAmount: 1 },
  ],
  "rotating daily mission catalog changed unexpectedly",
);
assert.deepEqual(
  data.dailyScoreTarget,
  {
    id: "daily-score-5000",
    targetScore: 5000,
    rewardItem: "packStone",
    rewardAmount: 1,
  },
  "daily score target MVP numbers changed unexpectedly",
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
  "weekly challenge MVP numbers changed unexpectedly",
);
assert.deepEqual(
  data.weeklyMissions.map(({ id, type, target, rewardAmount }) => ({ id, type, target, rewardAmount })),
  [
    { id: "weekly-play-20", type: "runs", target: 20, rewardAmount: 10 },
    { id: "weekly-words-200", type: "matches", target: 200, rewardAmount: 10 },
    { id: "weekly-score-100000", type: "scoreTotal", target: 100000, rewardAmount: 10 },
  ],
  "rotating weekly mission catalog changed unexpectedly",
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
  "daily ranking settings changed unexpectedly",
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
  "daily gift MVP numbers changed unexpectedly",
);

console.log("Gunmoji Puzzle content checks passed.");
