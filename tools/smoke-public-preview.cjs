const path = require("node:path");
const os = require("node:os");
const { pathToFileURL } = require("node:url");
const assert = require("node:assert/strict");

function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_MODULE,
    path.join(
      os.homedir(),
      ".cache",
      "codex-runtimes",
      "codex-primary-runtime",
      "dependencies",
      "node",
      "node_modules",
      ".pnpm",
      "playwright@1.60.0",
      "node_modules",
      "playwright",
    ),
    "playwright",
  ].filter(Boolean);

  const errors = [];
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (error) {
      errors.push(`${candidate}: ${error.message}`);
    }
  }
  throw new Error(`Unable to load Playwright.\n${errors.join("\n")}`);
}

function isOptionalRankingConnectionError(message) {
  return String(message).includes("Failed to load resource: net::ERR_CONNECTION_REFUSED");
}

async function main() {
  const { chromium } = loadPlaywright();
  const projectRoot = path.join(process.cwd(), "gunmojipuzzle");
  const previewRoot = process.env.PUBLIC_PREVIEW_OUTPUT_DIR
    ? path.resolve(projectRoot, process.env.PUBLIC_PREVIEW_OUTPUT_DIR)
    : path.join(projectRoot, "dist", "public-preview");
  const screenshotPath = path.join(previewRoot, "screenshot-public-preview.png");
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  await page.goto(pathToFileURL(path.join(previewRoot, "index.html")).href);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector("#titleStartButton");

  const titleState = await page.evaluate(() => ({
    title: document.title,
    appLabel: document.querySelector(".app-shell")?.getAttribute("aria-label") || "",
    titleVisible: !document.querySelector("#titleScreen").hidden,
    hasRuntime: Boolean(window.KanaGunmaPrototype),
    titleCardCount: document.querySelectorAll(".title-card-showcase .title-feature-card").length,
    titleCardNames: Array.from(document.querySelectorAll(".title-feature-card strong")).map((item) => item.textContent.trim()),
    titleCardIds: Array.from(document.querySelectorAll(".title-feature-card")).map((item) => item.dataset.cardId || ""),
    titleCardArtCount: document.querySelectorAll(".title-feature-card.has-art").length,
    titleCardAnimationNames: Array.from(document.querySelectorAll(".title-feature-card")).map((item) => getComputedStyle(item).animationName),
    logoCount: document.querySelectorAll('img[src="assets/gunmoji-logo.png"]').length,
    titleLogoAnimationName: getComputedStyle(document.querySelector(".title-logo-heading")).animationName,
    titleLogoAfterContent: getComputedStyle(document.querySelector(".title-logo-heading"), "::after").content,
    titleLogoVisible: (() => {
      const rect = document.querySelector(".title-logo-heading .game-logo-img").getBoundingClientRect();
      return rect.width > 220 && rect.height > 40;
    })(),
    hasModeChips: Boolean(document.querySelector(".title-mode-chips")),
    titleScreenRect: (() => {
      const rect = document.querySelector("#titleScreen").getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height) };
    })(),
    titleButtonRect: (() => {
      const rect = document.querySelector("#titleStartButton").getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height) };
    })(),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.locator("#titleStartButton").click();
  await page.waitForTimeout(80);

  const menuState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    menuVisible: !document.querySelector("#menuScreen").hidden,
    deckCount: document.querySelectorAll("#menuDeckGrid .menu-mini-card").length,
    mainTargets: Array.from(document.querySelectorAll(".menu-grid [data-nav-target]")).map((button) => button.dataset.navTarget),
    mainButtonCount: document.querySelectorAll(".menu-grid .menu-button").length,
    settingsInHeader: Boolean(document.querySelector(".menu-header .menu-settings-button[data-nav-target=\"settings\"]")),
    profileButtonExists: Boolean(document.querySelector("#profileEditButton")),
    profileButtonText: document.querySelector("#profileEditButton")?.textContent.trim() || "",
    profileButtonLabel: document.querySelector("#profileEditButton")?.getAttribute("aria-label") || "",
    profileModalHidden: document.querySelector("#profileModal")?.hidden ?? false,
    playerName: document.querySelector("#menuPlayerName")?.textContent || "",
    playerRank: document.querySelector("#menuPlayerRank")?.textContent || "",
    playerTitle: document.querySelector("#menuPlayerTitle")?.textContent || "",
    playerXpText: document.querySelector("#menuPlayerXpText")?.textContent || "",
    playerXpBarWidth: document.querySelector("#menuPlayerXpBar")?.style.width || "",
    homePlayText: document.querySelector(".home-play-button")?.textContent.trim() || "",
    homePlayTarget: document.querySelector(".home-play-button")?.dataset.navTarget || "",
    homePlayRect: (() => {
      const rect = document.querySelector(".home-play-button").getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height) };
    })(),
    seasonRankingTarget: document.querySelector("#seasonRankingCard")?.dataset.navTarget || "",
    seasonRankingText: document.querySelector("#seasonRankingCard")?.textContent.trim() || "",
    seasonRank: document.querySelector("#menuSeasonRank")?.textContent || "",
    seasonBest: document.querySelector("#menuSeasonBest")?.textContent || "",
    seasonPeriod: document.querySelector("#menuSeasonPeriod")?.textContent || "",
    purchaseButtonText: document.querySelector('.menu-grid [data-nav-target="purchase"]')?.textContent.trim() || "",
    purchaseButtonDisabled: document.querySelector('.menu-grid [data-nav-target="purchase"]')?.disabled || false,
    menuGridRect: (() => {
      const rect = document.querySelector(".menu-grid").getBoundingClientRect();
      return { top: Math.round(rect.top), bottom: Math.round(rect.bottom), height: Math.round(rect.height) };
    })(),
    staminaText: document.querySelector("#menuStaminaText").textContent,
    stoneText: document.querySelector("#menuStoneText").textContent,
    stoneLabel: document.querySelector("#menuStoneText").getAttribute("aria-label"),
    stoneIcon: getComputedStyle(document.querySelector("#menuStoneText"), "::before").content,
    stoneDarumaIcon: Boolean(document.querySelector("#menuStoneText .g-daruma-icon")),
    stonePlusIcon: getComputedStyle(document.querySelector("#menuStoneText"), "::after").content,
    stoneRect: (() => {
      const rect = document.querySelector("#menuStoneText").getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height) };
    })(),
    stoneHitTargets: (() => {
      const rect = document.querySelector("#menuStoneText").getBoundingClientRect();
      return [
        [rect.right - 16, rect.top + rect.height / 2],
        [rect.right - 2, rect.top + rect.height / 2],
        [rect.right - 16, rect.top + 4],
        [rect.right - 16, rect.bottom - 4],
      ].map(([x, y]) => document.elementFromPoint(x, y)?.id || "");
    })(),
    bestChipExists: Boolean(document.querySelector("#menuBestText")),
    lastResultExists: Boolean(document.querySelector("#lastResultPanel")),
    staminaAdExists: Boolean(document.querySelector("#staminaAdButton")),
    dailyGiftModalVisible: !document.querySelector("#dailyGiftModal").hidden,
    dailyGiftModalText: document.querySelector("#dailyGiftModal").textContent,
    adBannerVisible: getComputedStyle(document.querySelector("#adBanner")).display !== "none",
    statusRect: (() => {
      const rect = document.querySelector(".home-status-strip").getBoundingClientRect();
      return { top: Math.round(rect.top), bottom: Math.round(rect.bottom), height: Math.round(rect.height) };
    })(),
    headerRect: (() => {
      const rect = document.querySelector(".menu-header").getBoundingClientRect();
      return { top: Math.round(rect.top), bottom: Math.round(rect.bottom), height: Math.round(rect.height) };
    })(),
    deckPanelRect: (() => {
      const rect = document.querySelector(".home-deck-panel").getBoundingClientRect();
      return { top: Math.round(rect.top), bottom: Math.round(rect.bottom), height: Math.round(rect.height) };
    })(),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));

  await page.locator("#profileEditButton").click();
  await page.waitForTimeout(80);
  const profileModalState = await page.evaluate(() => ({
    visible: !document.querySelector("#profileModal").hidden,
    title: document.querySelector("#profileModalTitle")?.textContent || "",
    nameValue: document.querySelector("#profileNameInput")?.value || "",
    selectedTitle: document.querySelector(".profile-title-option.is-selected strong")?.textContent || "",
    optionCount: document.querySelectorAll(".profile-title-option").length,
    lockedCount: document.querySelectorAll(".profile-title-option.is-locked").length,
    note: document.querySelector("#profileModalNote")?.textContent || "",
    noteHidden: document.querySelector("#profileModalNote")?.hidden !== false,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.locator("#profileCancelButton").click();
  await page.waitForTimeout(50);
  const profileModalClosedState = await page.evaluate(() => ({
    hidden: document.querySelector("#profileModal").hidden,
    playerName: document.querySelector("#menuPlayerName")?.textContent || "",
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.evaluate(() => {
    const runtime = window.KanaGunmaPrototype;
    runtime.state.bestScore = 0;
    runtime.state.ownedTitleIds = ["score-d", "season-top-10"];
    runtime.state.selectedTitleId = "season-top-10";
  });
  await page.locator("#profileEditButton").click();
  await page.waitForTimeout(80);
  const permanentTitleState = await page.evaluate(() => {
    const selected = document.querySelector(".profile-title-option.is-selected");
    return {
      selectedTitle: selected?.querySelector("strong")?.textContent || "",
      selectedNote: selected?.querySelector("span")?.textContent || "",
      selectedLocked: selected?.classList.contains("is-locked") || false,
      selectedLimited: selected?.classList.contains("is-limited") || false,
      optionCount: document.querySelectorAll(".profile-title-option").length,
    };
  });
  await page.locator("#profileCancelButton").click();
  await page.evaluate(() => {
    const runtime = window.KanaGunmaPrototype;
    runtime.state.selectedTitleId = "auto";
    runtime.state.ownedTitleIds = ["score-d"];
  });

  await page.locator("#menuStoneText").click();
  await page.waitForTimeout(80);
  const purchaseState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    visible: !document.querySelector("#purchaseScreen").hidden,
    balance: document.querySelector("#purchaseBalanceText").textContent,
    noticeText: document.querySelector("#purchasePublicNotice")?.textContent || "",
    bundleCount: document.querySelectorAll(".purchase-bundle-card").length,
    disabledBundles: Array.from(document.querySelectorAll(".purchase-bundle-card")).filter((button) => button.disabled).length,
    bundleTexts: Array.from(document.querySelectorAll(".purchase-bundle-card")).map((button) => button.textContent.trim()),
    recoverDisabled: document.querySelector("#purchaseRecoverButton").disabled,
    hasClosedTestNotice: Boolean(document.querySelector("#purchaseTestNotice")),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.locator('#purchaseScreen [data-nav-target="menu"]').click();
  await page.waitForTimeout(80);

  await page.locator("#seasonRankingCard").click();
  await page.waitForTimeout(80);
  const rankingState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    visible: !document.querySelector("#rankingScreen").hidden,
    period: document.querySelector("#rankingSeasonPeriod").textContent,
    qualifier: document.querySelector("#rankingQualifierText").textContent,
    status: document.querySelector("#rankingStageStatus").textContent,
    syncStatus: document.querySelector("#rankingSyncStatus")?.textContent || "",
    dailyTitle: document.querySelector("#dailyRankingTitle")?.textContent || "",
    dailyDate: document.querySelector("#dailyRankingDate")?.textContent || "",
    dailyRewardStatus: document.querySelector("#dailyRankingRewardStatus")?.textContent || "",
    mainTabCount: document.querySelectorAll("[data-ranking-view]").length,
    activeMainTab: document.querySelector(".ranking-main-tab.is-active")?.dataset.rankingView || "",
    dailyPanelHidden: document.querySelector("#dailyRankingPanel")?.hidden || false,
    seasonPanelHidden: document.querySelector("#rankingSeasonPanel")?.hidden || false,
    seasonRecordTabCount: document.querySelectorAll("[data-season-record-view]").length,
    activeSeasonRecordTab: document.querySelector(".season-record-tab.is-active")?.dataset.seasonRecordView || "",
    seasonCurrentHidden: document.querySelector("#seasonCurrentPanel")?.hidden || false,
    seasonHistoryHidden: document.querySelector("#seasonHistoryPanel")?.hidden || false,
    dailyTodayActive: document.querySelector("#dailyRankingTodayButton")?.classList.contains("is-active") || false,
    dailyOwnRank: document.querySelector("#dailyRankingOwnRank")?.textContent || "",
    dailyOwnBest: document.querySelector("#dailyRankingOwnBest")?.textContent || "",
    dailyRowCount: document.querySelectorAll("#dailyRankingList .ranking-row").length,
    dailyHasPlayerRow: Boolean(document.querySelector("#dailyRankingList .ranking-row.is-player")),
    dailyListText: document.querySelector("#dailyRankingList")?.textContent || "",
    stageTabCount: document.querySelectorAll("[data-ranking-stage-id]").length,
    activeStage: document.querySelector(".ranking-stage-tab.is-active")?.dataset.rankingStageId || "",
    finalHidden: document.querySelector("#rankingFinalRules").hidden,
    finalDisplay: getComputedStyle(document.querySelector("#rankingFinalRules")).display,
    ownRank: document.querySelector("#rankingOwnRank").textContent,
    ownBest: document.querySelector("#rankingOwnBest").textContent,
    ownTitle: document.querySelector("#rankingOwnTitle")?.textContent || "",
    ownTitleNote: document.querySelector("#rankingOwnTitleNote")?.textContent || "",
    rowCount: document.querySelectorAll("#rankingList .ranking-row").length,
    titleChipCount: document.querySelectorAll("#rankingList .ranking-row-title").length,
    hasPlayerRow: Boolean(document.querySelector("#rankingList .ranking-row.is-player")),
    listText: document.querySelector("#rankingList").textContent,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.locator('[data-season-record-view="history"]').click();
  await page.waitForTimeout(50);
  const seasonHistoryState = await page.evaluate(() => ({
    active: document.querySelector(".season-record-tab.is-active")?.dataset.seasonRecordView || "",
    label: document.querySelector("#rankingSeasonLabel")?.textContent || "",
    title: document.querySelector("#rankingSeasonTitle")?.textContent || "",
    period: document.querySelector("#rankingSeasonPeriod")?.textContent || "",
    qualifier: document.querySelector("#rankingQualifierText")?.textContent || "",
    currentHidden: document.querySelector("#seasonCurrentPanel")?.hidden || false,
    historyHidden: document.querySelector("#seasonHistoryPanel")?.hidden || false,
    historyText: document.querySelector("#seasonHistoryList")?.textContent || "",
    currentOnlyHidden: getComputedStyle(document.querySelector("#rankingOwnRank").closest(".ranking-own-grid")).display === "none",
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.locator('#rankingScreen [data-nav-target="menu"]').click();
  await page.waitForTimeout(50);
  await page.waitForFunction(() => window.KanaGunmaPrototype.state.rankingOnline?.status !== "syncing", null, { timeout: 2000 }).catch(() => {});

  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem("kana-gunmatsuri-save-v1") || "{}");
    save.tutorialComplete = true;
    save.completedRuns = 1;
    save.packStone = 0;
    save.dailyGift = {
      dateKey: window.KanaGunmaPrototype.todayDateKey(),
      claimed: false,
    };
    localStorage.setItem("kana-gunmatsuri-save-v1", JSON.stringify(save));
  });
  await page.reload();
  await page.waitForSelector("#titleStartButton");
  await page.locator("#titleStartButton").click();
  await page.waitForTimeout(80);
  const giftReadyState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    completedRuns: window.KanaGunmaPrototype.state.completedRuns,
    dailyGiftModalVisible: !document.querySelector("#dailyGiftModal").hidden,
    dailyGiftModalText: document.querySelector("#dailyGiftModal").textContent,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.locator("#dailyGiftModalClaim").click();
  await page.waitForTimeout(80);
  const giftClaimState = await page.evaluate(() => ({
    claimed: window.KanaGunmaPrototype.state.dailyGift.claimed,
    modalHidden: document.querySelector("#dailyGiftModal").hidden,
    packStone: window.KanaGunmaPrototype.state.packStone,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));

  await page.locator('.menu-screen [data-nav-target="pack"]').click();
  await page.waitForTimeout(80);
  const packDetailInitiallyHidden = await page.evaluate(() => document.querySelector("#packDetailModal").hidden);
  await page.locator("#packDetailButton").click();
  await page.waitForTimeout(80);
  const packState = await page.evaluate((detailInitiallyHidden) => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    packVisible: !document.querySelector("#packScreen").hidden,
    testNoticeExists: Boolean(document.querySelector("#packTestNotice")),
    publicNoticeExists: Boolean(document.querySelector("#packPublicNotice")),
    publicNoticeText: document.querySelector("#packPublicNotice")?.textContent || "",
    adButtonExists: Boolean(document.querySelector("#adButton")),
    testBuyButtonExists: Boolean(document.querySelector("#testBuyButton")),
    openPackExists: Boolean(document.querySelector("#openPackButton")),
    selectorCount: document.querySelectorAll("#packSelector .pack-select-card").length,
    selectedPackText: document.querySelector("#packSelector .pack-select-card.is-active")?.textContent || "",
    detailInitiallyHidden,
    detailVisible: !document.querySelector("#packDetailModal").hidden,
    detailTitle: document.querySelector("#packDetailTitle")?.textContent || "",
    rateCount: document.querySelectorAll("#rateRow > span").length,
    rateBadgeLabels: Array.from(document.querySelectorAll("#rateRow > span .g-rarity-icons")).map((badge) =>
      badge.getAttribute("aria-label"),
    ),
    packPeriod: document.querySelector("#packPeriodText").textContent,
    featureText: document.querySelector("#packFeatureRow")?.textContent || "",
    featureCount: document.querySelectorAll("#packFeatureRow .pack-feature-card").length,
    featureNames: Array.from(document.querySelectorAll("#packFeatureRow .pack-feature-card strong")).map((item) => item.textContent.trim()),
    featureBadgeLabels: Array.from(document.querySelectorAll("#packFeatureRow .pack-feature-card .g-rarity-icons")).map((badge) =>
      badge.getAttribute("aria-label"),
    ),
    exchangeStatus: document.querySelector("#packExchangeStatus").textContent,
    exchangeIconExists: Boolean(document.querySelector("#packExchangeStatus .exchange-daruma-icon")),
    exchangeReady: document.querySelector("#packExchangeStatus").classList.contains("is-ready"),
    collectionProgress: document.querySelector("#packCollectionText").textContent,
    collectionProgressWidth: document.querySelector("#packCollectionBar").style.width,
    collectionHint: document.querySelector("#packCollectionHint").textContent,
    revealActionExists: Boolean(document.querySelector("#packRevealAction")),
    revealActionHidden: document.querySelector("#packRevealAction")?.hidden,
    revealShareExists: Boolean(document.querySelector("#packRevealShare")),
    packResult: document.querySelector("#packResult").textContent,
    packResultHidden: document.querySelector("#packResult").hidden,
    openButtonRect: (() => {
      const rect = document.querySelector("#openPackButton").getBoundingClientRect();
      return { top: Math.round(rect.top), bottom: Math.round(rect.bottom), height: Math.round(rect.height) };
    })(),
    revealRect: (() => {
      const rect = document.querySelector("#packReveal").getBoundingClientRect();
      return { top: Math.round(rect.top), bottom: Math.round(rect.bottom), height: Math.round(rect.height) };
    })(),
    resultRect: (() => {
      const rect = document.querySelector("#packResult").getBoundingClientRect();
      return { top: Math.round(rect.top), bottom: Math.round(rect.bottom), height: Math.round(rect.height) };
    })(),
    lineupCount: document.querySelectorAll("#packLineup .pack-lineup-card").length,
    lineupNames: Array.from(document.querySelectorAll("#packLineup .pack-lineup-card strong")).map((item) => item.textContent.trim()),
    lineupBadgeLabels: Array.from(document.querySelectorAll("#packLineup .pack-lineup-card .g-rarity-icons")).map((badge) =>
      badge.getAttribute("aria-label"),
    ),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }), packDetailInitiallyHidden);

  await page.locator("#packDetailClose").click();
  await page.waitForTimeout(50);
  await page.locator('#packScreen [data-nav-target="menu"]').click();
  await page.waitForTimeout(50);
  await page.locator('.menu-screen [data-nav-target="settings"]').click();
  await page.waitForTimeout(80);
  const settingsState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    settingsVisible: !document.querySelector("#settingsScreen").hidden,
    feedbackReportExists: Boolean(document.querySelector("#feedbackReportButton")),
    feedbackInsightExists: Boolean(document.querySelector("#feedbackInsightPanel")),
    policyLinkCount: document.querySelectorAll(".policy-link").length,
    soundTestExists: Boolean(document.querySelector("#soundTestButton")),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));

  await page.locator('#settingsScreen [data-nav-target="menu"]').click();
  await page.waitForTimeout(50);
  await page.evaluate(() => {
    const app = window.KanaGunmaPrototype;
    const state = app.state;
    const dailyMission = app.currentDailyMissionDefinition();
    const weeklyMission = app.currentWeeklyMissionDefinition();
    state.tutorialComplete = true;
    state.completedRuns = Math.max(state.completedRuns, app.warmupRuns);
    state.dailyMission = { dateKey: app.todayDateKey(), id: dailyMission.id, progress: dailyMission.target, claimed: true };
    state.dailyScoreTarget = { dateKey: app.todayDateKey(), bestScore: 5000, claimed: true };
    state.weeklyChallenge = { weekKey: app.currentWeekKey(), id: weeklyMission.id, progress: Math.min(5, weeklyMission.target), claimed: false };
    app.showScreen("menu");
  });
  await page.waitForTimeout(50);
  await page.locator('.menu-screen [data-nav-target="missions"]').click();
  await page.waitForTimeout(80);
  const missionsState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    missionsVisible: !document.querySelector("#missionsScreen").hidden,
    lockedVisible: !document.querySelector("#missionsLockedPanel").hidden,
    dailyWordHidden: document.querySelector("#dailyWordPanel").hidden,
    dailyWordText: document.querySelector("#dailyWordPanel").textContent,
    dailyHidden: document.querySelector("#dailyPanel").hidden,
    scoreGoalHidden: document.querySelector("#scoreGoalPanel").hidden,
    weeklyHidden: document.querySelector("#weeklyChallengePanel").hidden,
    weeklyText: document.querySelector("#weeklyChallengePanel").textContent,
    missionPanelsOnMenu: document.querySelectorAll("#menuScreen #dailyPanel, #menuScreen #scoreGoalPanel, #menuScreen #weeklyChallengePanel, #menuScreen #dailyWordPanel").length,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));

  await page.locator('#missionsScreen [data-nav-target="menu"]').click();
  await page.waitForTimeout(50);
  await page.locator(".home-play-button").click();
  await page.waitForSelector("#gameCanvas");
  await page.locator("#startButton").click();
  await page.waitForTimeout(2200);
  const gameState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    running: window.KanaGunmaPrototype.state.running,
    tiles: window.KanaGunmaPrototype.state.tiles.length,
    specialTiles: window.KanaGunmaPrototype.state.tiles.filter((tile) => tile.kind === "special").length,
    specialCooldown: window.KanaGunmaPrototype.state.specialCooldown,
    stamina: window.KanaGunmaPrototype.state.stamina,
    startDisabled: document.querySelector("#startButton").disabled,
    startHidden: document.querySelector("#startButton").hidden,
    stageCountdownHidden: document.querySelector("#stageCountdown").hidden,
    wordPanelExists: Boolean(document.querySelector(".word-panel")),
    legendCount: document.querySelectorAll("#gameDeckLegend .game-deck-legend-card").length,
    legendLabels: Array.from(document.querySelectorAll("#gameDeckLegend .game-deck-legend-card")).map((card) => card.dataset.slotColorLabel),
    legendNames: Array.from(document.querySelectorAll("#gameDeckLegend .game-deck-legend-card strong")).map((item) => item.textContent),
    legendReadings: Array.from(document.querySelectorAll("#gameDeckLegend .game-deck-legend-card em")).map((item) => item.textContent),
    legendSkills: Array.from(document.querySelectorAll("#gameDeckLegend .game-deck-legend-card .legend-skill")).map((item) => item.textContent),
    legendPushCount: document.querySelectorAll("#gameDeckLegend .game-deck-legend-card.is-push").length,
    legendArtCount: document.querySelectorAll("#gameDeckLegend .game-deck-legend-card.has-art").length,
    controlsLayout: (() => {
      const cards = Array.from(document.querySelectorAll("#gameDeckLegend .game-deck-legend-card")).map((card) => card.getBoundingClientRect());
      const refresh = document.querySelector("#refreshButton").getBoundingClientRect();
      const lastCard = cards[cards.length - 1];
      return {
        sameRow: cards.every((card) => Math.abs(card.top - refresh.top) <= 2 && Math.abs(card.bottom - refresh.bottom) <= 2),
        refreshAfterCards: Boolean(lastCard && refresh.left > lastCard.right),
        refreshWidth: Math.round(refresh.width),
        refreshHeight: Math.round(refresh.height),
        hiddenSkillRow: document.querySelector(".control-row").hidden && getComputedStyle(document.querySelector(".control-row")).display === "none",
      };
    })(),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await browser.close();

  const blockingErrors = errors.filter((message) => !isOptionalRankingConnectionError(message));
  assert.deepEqual(blockingErrors, [], `public preview console/page errors: ${blockingErrors.join(" | ")}`);
  assert.ok(
    titleState.title === "ぐんもじぱずる" &&
      titleState.appLabel === "ぐんもじぱずる" &&
      titleState.titleVisible &&
      titleState.hasRuntime &&
      titleState.titleCardCount === 3 &&
      titleState.titleCardIds.includes("basic-gunma-ken") &&
      titleState.titleCardIds.includes("basic-daruma") &&
      titleState.titleCardIds.includes("basic-akagi-san") &&
      titleState.titleCardArtCount === 3 &&
      titleState.titleCardAnimationNames.every((name) => name === "none") &&
      titleState.logoCount >= 1 &&
      titleState.titleLogoAnimationName === "none" &&
      titleState.titleLogoAfterContent === "none" &&
      titleState.titleLogoVisible &&
      !titleState.hasModeChips &&
      titleState.titleButtonRect.width >= titleState.titleScreenRect.width - 4 &&
      titleState.titleButtonRect.height >= titleState.titleScreenRect.height - 4 &&
      !titleState.horizontalOverflow,
    `bad title state: ${JSON.stringify(titleState)}`,
  );
  assert.ok(
    menuState.screen === "menu" &&
      menuState.menuVisible &&
      menuState.deckCount === 3 &&
      JSON.stringify(menuState.mainTargets) === JSON.stringify(["deck", "pack", "game", "missions", "ranking"]) &&
      menuState.mainButtonCount === 5 &&
      menuState.settingsInHeader &&
      menuState.profileButtonExists &&
      menuState.profileButtonLabel.includes("編集") &&
      menuState.profileModalHidden &&
      menuState.playerName === "あなた" &&
      menuState.playerRank.includes("ランク") &&
      Boolean(menuState.playerTitle) &&
      menuState.playerXpText.includes("EXP") &&
      menuState.playerXpBarWidth.endsWith("%") &&
      menuState.homePlayText.includes("ゲーム") &&
      menuState.homePlayTarget === "game" &&
      menuState.homePlayRect.width >= 280 &&
      menuState.homePlayRect.height >= 70 &&
      menuState.seasonRankingTarget === "ranking" &&
      menuState.seasonRankingText.includes("シーズン1") &&
      menuState.seasonRankingText.includes("ランキング") &&
      menuState.seasonPeriod.includes("2026/06/12") &&
      menuState.seasonRank === "未参加" &&
      menuState.seasonBest === "0" &&
      !menuState.purchaseButtonText &&
      menuState.stoneText.trim() === "Gだるま 0" &&
      menuState.stoneLabel.includes("Gだるま 0") &&
      menuState.stoneDarumaIcon &&
      menuState.stonePlusIcon.includes("+") &&
      menuState.stoneRect.height >= 32 &&
      menuState.stoneHitTargets.every((id) => id === "menuStoneText") &&
      menuState.statusRect.bottom <= menuState.deckPanelRect.top &&
      menuState.deckPanelRect.bottom <= menuState.menuGridRect.top &&
      menuState.menuGridRect.height <= 150,
    `bad menu state: ${JSON.stringify(menuState)}`,
  );
  assert.ok(
    profileModalState.visible &&
      profileModalState.title.includes("プロフィール") &&
      profileModalState.nameValue === "あなた" &&
      profileModalState.selectedTitle.includes("上毛見習い") &&
      profileModalState.optionCount >= 5 &&
      profileModalState.lockedCount >= 1 &&
      profileModalState.noteHidden &&
      !profileModalState.note.trim() &&
      !profileModalState.horizontalOverflow &&
      profileModalClosedState.hidden &&
      profileModalClosedState.playerName === "あなた" &&
      !profileModalClosedState.horizontalOverflow &&
      permanentTitleState.selectedTitle === "からっ風ランカー" &&
      permanentTitleState.selectedNote.includes("限定称号") &&
      !permanentTitleState.selectedLocked &&
      permanentTitleState.selectedLimited &&
      permanentTitleState.optionCount > profileModalState.optionCount,
    `bad public profile modal state: ${JSON.stringify({ profileModalState, profileModalClosedState, permanentTitleState })}`,
  );
  assert.ok(
      menuState.staminaText.includes("スタミナ") &&
      menuState.stoneText.trim() === "Gだるま 0" &&
      menuState.stoneLabel.includes("Gだるま 0") &&
      menuState.stoneDarumaIcon &&
      menuState.stonePlusIcon.includes("+") &&
      !menuState.bestChipExists &&
      !menuState.lastResultExists &&
      !menuState.staminaAdExists &&
      !menuState.dailyGiftModalVisible &&
      menuState.adBannerVisible &&
      menuState.statusRect.top >= menuState.headerRect.top &&
      menuState.statusRect.bottom <= menuState.headerRect.bottom &&
      menuState.statusRect.height >= 34 &&
      !menuState.horizontalOverflow,
    `bad public menu state: ${JSON.stringify(menuState)}`,
  );
  assert.ok(
    purchaseState.screen === "purchase" &&
      purchaseState.visible &&
      purchaseState.balance.includes("Gだるま 0") &&
      purchaseState.noticeText.includes("購入なし") &&
      purchaseState.bundleCount >= 4 &&
      purchaseState.disabledBundles === purchaseState.bundleCount &&
      purchaseState.bundleTexts.some((text) => text.includes("公開版なし")) &&
      purchaseState.recoverDisabled &&
      !purchaseState.hasClosedTestNotice &&
      !purchaseState.horizontalOverflow,
    `bad public G shop state: ${JSON.stringify(purchaseState)}`,
  );
  assert.ok(
    rankingState.screen === "ranking" &&
      rankingState.visible &&
      rankingState.period.includes("2026/06/12") &&
      rankingState.period.includes("2026/08/31") &&
      rankingState.qualifier.includes("最高スコア") &&
      rankingState.status.includes("シーズン通算") &&
      rankingState.syncStatus &&
      rankingState.mainTabCount === 2 &&
      rankingState.activeMainTab === "season" &&
      rankingState.dailyPanelHidden &&
      !rankingState.seasonPanelHidden &&
      rankingState.seasonRecordTabCount === 2 &&
      rankingState.activeSeasonRecordTab === "current" &&
      !rankingState.seasonCurrentHidden &&
      rankingState.seasonHistoryHidden &&
      rankingState.dailyTitle.includes("デイリー") &&
      rankingState.dailyDate.includes("今日") &&
      rankingState.dailyRewardStatus.includes("Gだるま+3") &&
      rankingState.dailyTodayActive &&
      rankingState.dailyOwnRank === "未参加" &&
      rankingState.dailyOwnBest.includes("0") &&
      rankingState.dailyRowCount >= 1 &&
      rankingState.dailyRowCount <= 11 &&
      rankingState.dailyHasPlayerRow &&
      rankingState.dailyListText.includes("あなた") &&
      rankingState.stageTabCount === 0 &&
      rankingState.activeStage === "" &&
      rankingState.finalHidden &&
      rankingState.finalDisplay === "none" &&
      rankingState.ownRank === "未参加" &&
      rankingState.ownBest.includes("0") &&
      rankingState.ownTitle === "上毛見習い" &&
      rankingState.ownTitleNote === "通常称号" &&
      rankingState.rowCount >= 1 &&
      rankingState.titleChipCount === rankingState.rowCount &&
      rankingState.hasPlayerRow &&
      seasonHistoryState.active === "history" &&
      seasonHistoryState.label === "ARCHIVE" &&
      seasonHistoryState.title.includes("過去") &&
      seasonHistoryState.period.includes("終了") &&
      seasonHistoryState.qualifier.includes("残ります") &&
      seasonHistoryState.currentHidden &&
      !seasonHistoryState.historyHidden &&
      seasonHistoryState.historyText.includes("過去シーズン") &&
      seasonHistoryState.currentOnlyHidden &&
      !seasonHistoryState.horizontalOverflow &&
      !rankingState.horizontalOverflow,
    `bad public ranking state: ${JSON.stringify({ rankingState, seasonHistoryState })}`,
  );
  assert.ok(
    giftReadyState.dailyGiftModalVisible &&
      giftReadyState.dailyGiftModalText.includes("今日の差し入れ") &&
      !giftReadyState.horizontalOverflow,
    `bad public daily gift unlock state: ${JSON.stringify(giftReadyState)}`,
  );
  assert.ok(giftClaimState.claimed && giftClaimState.modalHidden && giftClaimState.packStone === 1 && !giftClaimState.horizontalOverflow, `bad public gift modal state: ${JSON.stringify(giftClaimState)}`);
  assert.ok(
    packState.screen === "pack" &&
      packState.packVisible &&
      !packState.testNoticeExists &&
      packState.publicNoticeExists &&
      packState.publicNoticeText.includes("課金・広告なし") &&
      packState.publicNoticeText.includes("無料Gだるま") &&
      !packState.adButtonExists &&
      !packState.testBuyButtonExists &&
      packState.openPackExists &&
      packState.selectorCount >= 1 &&
      packState.selectedPackText.includes("ぐんまのし") &&
      packState.detailInitiallyHidden &&
      packState.detailVisible &&
      packState.detailTitle.includes("ぐんまのし") &&
      packState.rateCount === 4 &&
      packState.rateBadgeLabels.includes("GGG") &&
      packState.rateBadgeLabels.includes("GG") &&
      packState.rateBadgeLabels.includes("G") &&
      packState.packPeriod.includes("ぐんまのし") &&
      packState.packPeriod.includes("2026/06/12") &&
      packState.packPeriod.includes("残り") &&
      packState.featureText.includes("FEATURED") &&
      packState.featureText.includes("目玉カード") &&
      packState.featureText.includes("残り") &&
      packState.featureCount === 2 &&
      packState.featureNames.includes("まえばし") &&
      packState.featureNames.includes("たかさき") &&
      packState.featureBadgeLabels.every((label) => label === "GGG") &&
      packState.exchangeStatus.includes("引換だるま 0/50") &&
      packState.exchangeIconExists &&
      !packState.exchangeReady &&
      packState.collectionProgress.includes("0/12種") &&
      packState.collectionProgressWidth === "0%" &&
      packState.collectionHint.includes("あと12種") &&
      packState.packResult.trim() === "" &&
      packState.packResultHidden &&
      packState.revealActionExists &&
      packState.revealActionHidden &&
      !packState.revealShareExists &&
      packState.resultRect.bottom <= packState.revealRect.top &&
      packState.openButtonRect.top - packState.revealRect.bottom <= 16 &&
      packState.openButtonRect.height >= 52 &&
      packState.lineupCount === 12 &&
      packState.lineupNames.includes("まえばし") &&
      packState.lineupNames.includes("みどり") &&
      packState.lineupBadgeLabels.includes("GGG") &&
      packState.lineupBadgeLabels.includes("GG") &&
      packState.lineupBadgeLabels.includes("G") &&
      !packState.horizontalOverflow,
    `bad public pack state: ${JSON.stringify(packState)}`,
  );
  assert.ok(
    settingsState.screen === "settings" &&
      settingsState.settingsVisible &&
      !settingsState.feedbackReportExists &&
      !settingsState.feedbackInsightExists &&
      settingsState.policyLinkCount === 3 &&
      settingsState.soundTestExists &&
      !settingsState.horizontalOverflow,
    `bad public settings state: ${JSON.stringify(settingsState)}`,
  );
  assert.ok(
    missionsState.screen === "missions" &&
      missionsState.missionsVisible &&
      !missionsState.lockedVisible &&
      !missionsState.dailyWordHidden &&
      missionsState.dailyWordText.includes("今日のことば") &&
      !missionsState.dailyWordText.includes("話題") &&
      !missionsState.dailyWordText.includes("学び") &&
      !missionsState.dailyWordText.includes("配信") &&
      !missionsState.dailyWordText.includes("視聴") &&
      !missionsState.dailyHidden &&
      !missionsState.scoreGoalHidden &&
      !missionsState.weeklyHidden &&
      missionsState.weeklyText.includes("Gだるま+10") &&
      missionsState.missionPanelsOnMenu === 0 &&
      !missionsState.horizontalOverflow,
    `bad public missions state: ${JSON.stringify(missionsState)}`,
  );
  assert.ok(
    gameState.screen === "game" &&
      gameState.running &&
      gameState.tiles > 0 &&
      gameState.specialTiles === 0 &&
      gameState.specialCooldown === 0 &&
      gameState.stamina === 4 &&
      gameState.startDisabled &&
      gameState.startHidden &&
      gameState.stageCountdownHidden &&
      !gameState.wordPanelExists &&
      gameState.legendCount === 3 &&
      gameState.legendLabels.length === 3 &&
      gameState.legendPushCount === 1 &&
      gameState.legendArtCount >= 2 &&
      gameState.legendSkills.length === 3 &&
      gameState.legendSkills.every((skill) => skill && skill.length > 2) &&
      gameState.controlsLayout.sameRow &&
      gameState.controlsLayout.refreshAfterCards &&
      gameState.controlsLayout.hiddenSkillRow &&
      gameState.controlsLayout.refreshWidth >= 48 &&
      gameState.controlsLayout.refreshHeight >= 58 &&
      gameState.legendNames.includes("ぐんまけん") &&
      gameState.legendReadings.some((reading) => reading.includes("ぐ・ん・ま")) &&
      !gameState.horizontalOverflow,
    `bad public game state: ${JSON.stringify(gameState)}`,
  );

  console.log(JSON.stringify({ titleState, menuState, profileModalState, profileModalClosedState, purchaseState, rankingState, seasonHistoryState, packState, settingsState, missionsState, gameState, screenshotPath }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
