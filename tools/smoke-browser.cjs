const path = require("node:path");
const os = require("node:os");
const { pathToFileURL } = require("node:url");
const DATA = require("../data/cards.js");

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
  const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
  const screenshotPath = path.join(process.cwd(), "gunmojipuzzle", "screenshot-mobile.png");
  const settingsScreenshotPath = path.join(process.cwd(), "gunmojipuzzle", "screenshot-settings-policy-links.png");
  const packRevealScreenshotPath = path.join(process.cwd(), "gunmojipuzzle", "screenshot-pack-reveal.png");
  const resultActionsScreenshotPath = path.join(process.cwd(), "gunmojipuzzle", "screenshot-result-actions.png");
  const warmupMenuScreenshotPath = path.join(process.cwd(), "gunmojipuzzle", "screenshot-warmup-menu.png");
  const normalHomeClaimedScreenshotPath = path.join(process.cwd(), "gunmojipuzzle", "screenshot-normal-home-claimed.png");
  const missionsScreenshotPath = path.join(process.cwd(), "gunmojipuzzle", "screenshot-missions.png");
  const staminaEmptyHomeScreenshotPath = path.join(process.cwd(), "gunmojipuzzle", "screenshot-stamina-empty-home.png");
  const deckCategoryFilterScreenshotPath = path.join(process.cwd(), "gunmojipuzzle", "screenshot-deck-category-filter.png");
  const practiceResultScreenshotPath = path.join(process.cwd(), "gunmojipuzzle", "screenshot-practice-result.png");
  const tutorialCoachScreenshotPath = path.join(process.cwd(), "gunmojipuzzle", "screenshot-tutorial-coach.png");
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
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

  await page.goto(pathToFileURL(path.join(process.cwd(), "gunmojipuzzle", "index.html")).href);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector("#titleStartButton");
  const titleState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    titleVisible: !document.querySelector("#titleScreen").hidden,
    menuHidden: document.querySelector("#menuScreen").hidden,
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
    menuButtons: Array.from(document.querySelectorAll(".menu-screen [data-nav-target]")).map((button) => button.textContent.trim()),
    menuNavTargets: Array.from(document.querySelectorAll(".menu-screen [data-nav-target]")).map((button) => button.dataset.navTarget),
    menuMainTargets: Array.from(document.querySelectorAll(".menu-grid [data-nav-target]")).map((button) => button.dataset.navTarget),
    menuMainButtonCount: document.querySelectorAll(".menu-grid .menu-button").length,
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
    settingsButtonRect: (() => {
      const rect = document.querySelector(".menu-header .menu-settings-button").getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height) };
    })(),
    menuDeckCount: document.querySelectorAll("#menuDeckGrid .menu-mini-card").length,
    menuDeckNames: Array.from(document.querySelectorAll("#menuDeckGrid .card-name")).map((item) => item.textContent.trim()),
    lastResultExists: Boolean(document.querySelector("#lastResultPanel")),
    bestChipExists: Boolean(document.querySelector("#menuBestText")),
    staminaEmptyHidden: document.querySelector("#staminaEmptyPanel").hidden,
    staminaEmptyVisible: getComputedStyle(document.querySelector("#staminaEmptyPanel")).display !== "none",
    firstPlayVisible: !document.querySelector("#firstPlayPanel").hidden,
    firstPlayText: document.querySelector("#firstPlayPanel").textContent,
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
    primaryGameVisible: Boolean(document.querySelector(".menu-button.is-primary")) && getComputedStyle(document.querySelector(".menu-button.is-primary")).display !== "none",
    dailyWordHidden: document.querySelector("#dailyWordPanel").hidden,
    dailyWordButtonText: document.querySelector("#dailyWordGuideButton").textContent,
    dailyWordPanelScreen: document.querySelector("#dailyWordPanel").closest("[data-app-screen]")?.dataset.appScreen,
    dailyWordOnMenu: document.querySelectorAll("#menuScreen #dailyWordPanel").length,
    dailyGiftHidden: document.querySelector("#dailyGiftPanel").hidden,
    dailyGiftButtonText: document.querySelector("#dailyGiftButton").textContent,
    dailyGiftModalVisible: !document.querySelector("#dailyGiftModal").hidden,
    dailyGiftModalText: document.querySelector("#dailyGiftModal").textContent,
    dailyGiftModalClaimDisabled: document.querySelector("#dailyGiftModalClaim").disabled,
    adBannerVisible: getComputedStyle(document.querySelector("#adBanner")).display !== "none",
    adBannerText: document.querySelector("#adBanner").textContent,
    dailyHidden: document.querySelector("#dailyPanel").hidden,
    warmupClass: document.querySelector(".phone").classList.contains("is-warmup-session"),
    dailyMissionDefinition: window.KanaGunmaPrototype.currentDailyMissionDefinition(),
    dailyTitle: document.querySelector("#menuDailyTitle").textContent,
    dailyProgress: document.querySelector("#menuDailyProgress").textContent,
    dailyProgressExpected: (() => {
      const mission = window.KanaGunmaPrototype.currentDailyMissionDefinition();
      return window.KanaGunmaPrototype.formatMissionProgress(0, mission.target, mission);
    })(),
    dailyReward: document.querySelector("#menuDailyReward").textContent,
    streakText: document.querySelector("#menuStreakText").textContent,
    dailyBarWidth: document.querySelector("#menuDailyBar").style.width,
    scoreGoalHidden: document.querySelector("#scoreGoalPanel").hidden,
    scoreGoalMeterVisible: getComputedStyle(document.querySelector(".score-goal-meter")).display !== "none",
    scoreGoalTitle: document.querySelector("#menuScoreGoalTitle").textContent,
    scoreGoalProgress: document.querySelector("#menuScoreGoalProgress").textContent,
    scoreGoalReward: document.querySelector("#menuScoreGoalReward").textContent,
    scoreGoalBarWidth: document.querySelector("#menuScoreGoalBar").style.width,
    weeklyHidden: document.querySelector("#weeklyChallengePanel").hidden,
    weeklyMissionDefinition: window.KanaGunmaPrototype.currentWeeklyMissionDefinition(),
    weeklyProgress: document.querySelector("#menuWeeklyProgress").textContent,
    weeklyProgressExpected: (() => {
      const mission = window.KanaGunmaPrototype.currentWeeklyMissionDefinition();
      return window.KanaGunmaPrototype.formatMissionProgress(0, mission.target, mission);
    })(),
    weeklyReward: document.querySelector("#menuWeeklyReward").textContent,
    weeklyBarWidth: document.querySelector("#menuWeeklyBar").style.width,
    missionSummaryExists: Boolean(document.querySelector("#menuMissionSummary")),
    missionButtonLabel: document.querySelector('.menu-button[data-nav-target="missions"] strong')?.textContent,
    missionPanelsOnMenu: document.querySelectorAll("#menuScreen #dailyPanel, #menuScreen #scoreGoalPanel, #menuScreen #weeklyChallengePanel").length,
    missionPanelScreen: document.querySelector("#dailyPanel").closest("[data-app-screen]")?.dataset.appScreen,
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
    staminaPips: Array.from(document.querySelectorAll("#menuStaminaPips .stamina-pip")).map((pip) => !pip.classList.contains("is-empty")),
    staminaAdText: document.querySelector("#staminaAdButton").textContent,
    staminaAdDisabled: document.querySelector("#staminaAdButton").disabled,
    streamButtonExists: Boolean(document.querySelector("#menuStreamButton")),
    streamModeToggleExists: Boolean(document.querySelector("#streamModeToggle")),
    streamOverlayExists: Boolean(document.querySelector("#streamStrip")),
    streamResultExists: Boolean(document.querySelector("#streamResultCard")),
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
    menuGridRect: (() => {
      const rect = document.querySelector(".menu-grid").getBoundingClientRect();
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
    selectedNote: document.querySelector(".profile-title-option.is-selected span")?.textContent || "",
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
  const purchaseScreenState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    visible: !document.querySelector("#purchaseScreen").hidden,
    balance: document.querySelector("#purchaseBalanceText").textContent,
    staminaText: document.querySelector("#purchaseStaminaText").textContent,
    staminaNote: document.querySelector("#purchaseStaminaNote").textContent,
    recoverText: document.querySelector("#purchaseRecoverButton").textContent,
    recoverDisabled: document.querySelector("#purchaseRecoverButton").disabled,
    bundleCount: document.querySelectorAll(".purchase-bundle-card").length,
    bundleTexts: Array.from(document.querySelectorAll(".purchase-bundle-card")).map((button) => button.textContent.trim()),
    noticeText: document.querySelector("#purchaseTestNotice").textContent,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.locator('[data-purchase-bundle="g-12"]').click();
  await page.waitForTimeout(80);
  const purchaseGrantState = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("kana-gunmatsuri-save-v1"));
    return {
      packStone: window.KanaGunmaPrototype.state.packStone,
      savedPackStone: saved.packStone,
      balance: document.querySelector("#purchaseBalanceText").textContent,
      toast: document.querySelector("#toast").textContent,
      hasPurchaseEvent: window.KanaGunmaPrototype.state.telemetryEvents.some((event) => event.type === "g_purchase_mock"),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  await page.evaluate(() => {
    const app = window.KanaGunmaPrototype;
    app.state.packStone = 1;
    app.state.stamina = Math.max(0, app.staminaMax - 3);
    app.state.staminaUpdatedAt = Date.now();
    app.showScreen("purchase");
  });
  await page.waitForTimeout(80);
  await page.locator("#purchaseRecoverButton").click();
  await page.waitForTimeout(80);
  const purchaseRecoverState = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("kana-gunmatsuri-save-v1"));
    return {
      stamina: window.KanaGunmaPrototype.state.stamina,
      savedStamina: saved.stamina,
      packStone: window.KanaGunmaPrototype.state.packStone,
      savedPackStone: saved.packStone,
      balance: document.querySelector("#purchaseBalanceText").textContent,
      staminaText: document.querySelector("#purchaseStaminaText").textContent,
      recoverDisabled: document.querySelector("#purchaseRecoverButton").disabled,
      toast: document.querySelector("#toast").textContent,
      hasRecoverEvent: window.KanaGunmaPrototype.state.telemetryEvents.some((event) => event.type === "stamina_g_full_recover"),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  await page.locator('#purchaseScreen [data-nav-target="menu"]').click();
  await page.waitForTimeout(80);

  await page.locator("#seasonRankingCard").click();
  await page.waitForTimeout(80);
  const rankingScreenState = await page.evaluate(() => ({
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
    playerRowText: document.querySelector("#rankingList .ranking-row.is-player")?.textContent || "",
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
  await page.locator('[data-ranking-view="daily"]').click();
  await page.waitForTimeout(50);
  await page.locator("#dailyRankingYesterdayButton").click();
  await page.waitForTimeout(50);
  const dailyRankingYesterdayState = await page.evaluate(() => ({
    active: document.querySelector("#dailyRankingYesterdayButton")?.classList.contains("is-active") || false,
    date: document.querySelector("#dailyRankingDate")?.textContent || "",
    ownRank: document.querySelector("#dailyRankingOwnRank")?.textContent || "",
    ownBest: document.querySelector("#dailyRankingOwnBest")?.textContent || "",
    rowCount: document.querySelectorAll("#dailyRankingList .ranking-row").length,
    hasPlayerRow: Boolean(document.querySelector("#dailyRankingList .ranking-row.is-player")),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.locator('#rankingScreen [data-nav-target="menu"]').click();
  await page.waitForTimeout(50);
  await page.waitForFunction(() => window.KanaGunmaPrototype.state.rankingOnline?.status !== "syncing", null, { timeout: 2000 }).catch(() => {});
  await page.locator('.menu-screen [data-nav-target="missions"]').click();
  await page.waitForTimeout(80);
  const missionLockedState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    missionsVisible: !document.querySelector("#missionsScreen").hidden,
    lockedVisible: !document.querySelector("#missionsLockedPanel").hidden,
    lockedText: document.querySelector("#missionsLockedPanel").textContent,
    dailyHidden: document.querySelector("#dailyPanel").hidden,
    scoreGoalHidden: document.querySelector("#scoreGoalPanel").hidden,
    weeklyHidden: document.querySelector("#weeklyChallengePanel").hidden,
    dailyPanelScreen: document.querySelector("#dailyPanel").closest("[data-app-screen]")?.dataset.appScreen,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.locator('#missionsScreen [data-nav-target="menu"]').click();
  await page.waitForTimeout(50);

  await page.locator('.menu-screen [data-nav-target="deck"]').click();
  await page.waitForTimeout(80);

  const deckScreenState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    deckVisible: !document.querySelector("#deckScreen").hidden,
    deckCount: document.querySelectorAll("#deckGrid .mini-card").length,
    collectionCount: document.querySelectorAll(".collection-card").length,
    collectionArtCount: document.querySelectorAll(".collection-card.has-art").length,
    collectionFirstBackground: getComputedStyle(document.querySelector(".collection-card.has-art")).backgroundImage,
    pushDeckIndex: Array.from(document.querySelectorAll("#deckGrid .mini-card")).findIndex((card) => card.classList.contains("is-push")),
    pushLabelCount: document.querySelectorAll("#deckGrid .mini-card .push-frame-label").length,
    filterButtons: Array.from(document.querySelectorAll("[data-collection-filter]")).map((button) => ({
      id: button.dataset.collectionFilter,
      text: button.textContent.trim(),
      pressed: button.getAttribute("aria-pressed"),
      width: Math.round(button.getBoundingClientRect().width),
    })),
    lengthButtons: Array.from(document.querySelectorAll("[data-collection-length]")).map((button) => ({
      id: button.dataset.collectionLength,
      text: button.textContent.trim(),
      pressed: button.getAttribute("aria-pressed"),
      width: Math.round(button.getBoundingClientRect().width),
    })),
    sortButtons: Array.from(document.querySelectorAll("[data-collection-sort]")).map((button) => ({
      id: button.dataset.collectionSort,
      text: button.textContent.trim(),
      pressed: button.getAttribute("aria-pressed"),
      width: Math.round(button.getBoundingClientRect().width),
    })),
    collectionTags: Array.from(document.querySelectorAll(".collection-card .collection-tag")).map((tag) => tag.textContent.trim()),
    collectionNames: Array.from(document.querySelectorAll(".collection-card .card-name")).map((tag) => tag.textContent.trim()),
    collectionRarityLabels: Array.from(document.querySelectorAll(".collection-card .rarity .g-rarity-icons")).map((badge) =>
      badge.getAttribute("aria-label"),
    ),
    guideTitle: document.querySelector("#wordGuideTitle").textContent,
    guideMeta: document.querySelector("#wordGuideMeta").textContent,
    guideRarityLabel: document.querySelector("#wordGuideMeta .g-rarity-icons")?.getAttribute("aria-label"),
    guideNote: document.querySelector("#wordGuideNote").textContent,
    guideLetters: document.querySelector("#wordGuideLetters").textContent,
    guideStatus: document.querySelector("#wordGuideStatus").textContent,
    guideText: document.querySelector("#wordGuidePanel").textContent,
    guideAction: document.querySelector("#wordGuideAction").textContent,
    guideHighlightCount: document.querySelectorAll(".collection-card.is-guide").length,
    layout: (() => {
      const guideRect = document.querySelector("#wordGuidePanel").getBoundingClientRect();
      const gridRect = document.querySelector("#collectionGrid").getBoundingClientRect();
      const firstCardRect = document.querySelector(".collection-card").getBoundingClientRect();
      const panelStyle = getComputedStyle(document.querySelector(".collection-panel"));
      const gridStyle = getComputedStyle(document.querySelector("#collectionGrid"));
      return {
        guideBottom: Math.round(guideRect.bottom),
        gridTop: Math.round(gridRect.top),
        firstCardHeight: Math.round(firstCardRect.height),
        panelOverflowY: panelStyle.overflowY,
        gridOverflowY: gridStyle.overflowY,
      };
    })(),
  }));
  await page.locator('[data-collection-filter="g3"]').click();
  await page.waitForTimeout(80);
  const collectionFilterState = await page.evaluate(() => ({
    selectedFilter: window.KanaGunmaPrototype.state.collectionFilterId,
    activeText: document.querySelector(".collection-filter.is-active").textContent.trim(),
    collectionCount: document.querySelectorAll(".collection-card").length,
    collectionNames: Array.from(document.querySelectorAll(".collection-card .card-name")).map((tag) => tag.textContent.trim()),
    collectionStatuses: Array.from(document.querySelectorAll(".collection-card")).map((card) => card.dataset.collectionStatus),
    guideMeta: document.querySelector("#wordGuideMeta").textContent,
    guideRarityLabel: document.querySelector("#wordGuideMeta .g-rarity-icons")?.getAttribute("aria-label"),
    guideLetters: document.querySelector("#wordGuideLetters").textContent,
    guideStatus: document.querySelector("#wordGuideStatus").textContent,
    guideText: document.querySelector("#wordGuidePanel").textContent,
    guideHighlightCount: document.querySelectorAll(".collection-card.is-guide").length,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.screenshot({ path: deckCategoryFilterScreenshotPath, fullPage: true });
  await page.locator('[data-collection-filter="all"]').click();
  await page.locator('[data-collection-length="len5plus"]').click();
  await page.waitForTimeout(80);
  const collectionLengthState = await page.evaluate(() => ({
    selectedLength: window.KanaGunmaPrototype.state.collectionLengthFilterId,
    activeText: document.querySelector(".collection-length.is-active").textContent.trim(),
    names: Array.from(document.querySelectorAll(".collection-card .card-name")).map((tag) => tag.textContent.trim()),
    lengths: Array.from(document.querySelectorAll(".collection-card .card-name")).map((tag) => {
      const name = tag.textContent.trim();
      const card = window.KanaGunmaPrototype.data.cards.find((item) => item.displayName === name);
      return Array.from(card?.readingKana || "").length;
    }),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));

  await page.evaluate(() => {
    const app = window.KanaGunmaPrototype;
    app.state.owned["season1-shibukawa"] = 1;
    app.state.owned["season1-numata"] = 1;
    app.state.owned["season1-ota"] = 1;
    app.state.deckIds = ["season1-shibukawa", "season1-numata", "season1-ota"];
    app.state.deckSlotColors = ["blue", "red", "green"];
    app.state.pushCardId = "season1-shibukawa";
    app.state.selectedDeckSlot = 0;
    app.state.guideCardId = "season1-shibukawa";
    app.state.collectionFilterId = "all";
    app.state.collectionLengthFilterId = "all";
    app.showScreen("deck");
  });
  await page.waitForTimeout(80);
  await page.locator('.collection-card[data-card-id="season1-ota"]').click();
  await page.waitForTimeout(80);
  await page.locator("#wordGuideAction").click();
  await page.waitForTimeout(80);
  const deckBuildSwapState = await page.evaluate(() => ({
    deckIds: window.KanaGunmaPrototype.state.deckIds.slice(),
    pushCardId: window.KanaGunmaPrototype.state.pushCardId,
    selectedSlot: window.KanaGunmaPrototype.state.selectedDeckSlot,
    selectedCardId: window.KanaGunmaPrototype.state.deckIds[window.KanaGunmaPrototype.state.selectedDeckSlot],
    pushSlot: window.KanaGunmaPrototype.state.deckIds.indexOf(window.KanaGunmaPrototype.state.pushCardId),
    guideCardId: window.KanaGunmaPrototype.state.guideCardId,
    charPool: window.KanaGunmaPrototype.buildCharPool().map((entry) => entry.char).join(""),
    selectedSlotColor: window.KanaGunmaPrototype.state.deckSlotColors[window.KanaGunmaPrototype.state.selectedDeckSlot],
    pushSlotColor: window.KanaGunmaPrototype.state.deckSlotColors[window.KanaGunmaPrototype.state.deckIds.indexOf(window.KanaGunmaPrototype.state.pushCardId)],
    guideMeta: document.querySelector("#wordGuideMeta").textContent,
    noDuplicateNameKeys:
      new Set(
        window.KanaGunmaPrototype.state.deckIds.map((id) => window.KanaGunmaPrototype.data.cards.find((card) => card.id === id).nameKey),
      ).size === window.KanaGunmaPrototype.state.deckIds.length,
  }));
  await page.evaluate(() => {
    const app = window.KanaGunmaPrototype;
    app.state.owned["season1-maebashi"] = 1;
    app.state.deckIds = ["basic-gunma-ken", "basic-daruma", "basic-akagi-san"];
    app.state.deckSlotColors = ["blue", "red", "green"];
    app.state.pushCardId = "basic-gunma-ken";
    app.state.selectedDeckSlot = 1;
    app.state.guideCardId = "season1-maebashi";
    app.state.collectionFilterId = "all";
    app.state.collectionLengthFilterId = "all";
    app.showScreen("deck");
  });
  await page.waitForTimeout(80);
  const deckBuildRedSlotBefore = await page.evaluate(() => {
    const selectedCard = document.querySelectorAll("#deckGrid .mini-card")[window.KanaGunmaPrototype.state.selectedDeckSlot];
    return {
      selectedSlot: window.KanaGunmaPrototype.state.selectedDeckSlot,
      selectedSlotLabel: selectedCard?.dataset.slotColorLabel || "",
      guideAction: document.querySelector("#wordGuideAction").textContent,
      guideMeta: document.querySelector("#wordGuideMeta").textContent,
      guideStatus: document.querySelector("#wordGuideStatus").textContent,
      guideTag: document.querySelector('.collection-card.is-guide .collection-tag')?.textContent.trim() || "",
      pushCardId: window.KanaGunmaPrototype.state.pushCardId,
      guideCardId: window.KanaGunmaPrototype.state.guideCardId,
      guideHighlightCardId: document.querySelector(".collection-card.is-guide")?.dataset.cardId || "",
    };
  });
  await page.locator('.collection-card[data-card-id="season1-maebashi"]').click();
  await page.waitForTimeout(80);
  const deckBuildRedSlotState = await page.evaluate(() => ({
    deckIds: window.KanaGunmaPrototype.state.deckIds.slice(),
    pushCardId: window.KanaGunmaPrototype.state.pushCardId,
    selectedSlot: window.KanaGunmaPrototype.state.selectedDeckSlot,
    selectedCardId: window.KanaGunmaPrototype.state.deckIds[window.KanaGunmaPrototype.state.selectedDeckSlot],
    pushSlot: window.KanaGunmaPrototype.state.deckIds.indexOf(window.KanaGunmaPrototype.state.pushCardId),
    guideCardId: window.KanaGunmaPrototype.state.guideCardId,
    guideAction: document.querySelector("#wordGuideAction").textContent,
    selectedSlotColor: window.KanaGunmaPrototype.state.deckSlotColors[window.KanaGunmaPrototype.state.selectedDeckSlot],
    noDuplicateNameKeys:
      new Set(
        window.KanaGunmaPrototype.state.deckIds.map((id) => window.KanaGunmaPrototype.data.cards.find((card) => card.id === id).nameKey),
      ).size === window.KanaGunmaPrototype.state.deckIds.length,
  }));
  await page.evaluate(() => {
    const app = window.KanaGunmaPrototype;
    app.state.owned["season1-shibukawa"] = 1;
    app.state.deckIds = ["basic-gunma-ken", "basic-daruma", "basic-akagi-san"];
    app.state.deckSlotColors = ["blue", "red", "green"];
    app.state.pushCardId = "basic-gunma-ken";
    app.state.selectedDeckSlot = 0;
    app.state.guideCardId = "season1-shibukawa";
    app.state.collectionFilterId = "all";
    app.state.collectionLengthFilterId = "all";
    app.showScreen("deck");
  });
  await page.waitForTimeout(80);
  await page.locator("#wordGuideAction").click();
  await page.waitForTimeout(80);
  const deckBuildPushReplaceState = await page.evaluate(() => ({
    deckIds: window.KanaGunmaPrototype.state.deckIds.slice(),
    pushCardId: window.KanaGunmaPrototype.state.pushCardId,
    selectedSlot: window.KanaGunmaPrototype.state.selectedDeckSlot,
    selectedCardId: window.KanaGunmaPrototype.state.deckIds[window.KanaGunmaPrototype.state.selectedDeckSlot],
    pushSlot: window.KanaGunmaPrototype.state.deckIds.indexOf(window.KanaGunmaPrototype.state.pushCardId),
    guideCardId: window.KanaGunmaPrototype.state.guideCardId,
    selectedSlotColor: window.KanaGunmaPrototype.state.deckSlotColors[window.KanaGunmaPrototype.state.selectedDeckSlot],
    pushSlotColor: window.KanaGunmaPrototype.state.deckSlotColors[window.KanaGunmaPrototype.state.deckIds.indexOf(window.KanaGunmaPrototype.state.pushCardId)],
    guideMeta: document.querySelector("#wordGuideMeta").textContent,
  }));
  await page.evaluate(() => {
    const app = window.KanaGunmaPrototype;
    app.state.owned["season1-maebashi"] = 1;
    app.state.owned["season1-shibukawa"] = 0;
    app.state.owned["season1-numata"] = 0;
    app.state.owned["season1-ota"] = 0;
    app.state.deckIds = ["basic-gunma-ken", "basic-daruma", "basic-akagi-san"];
    app.state.deckSlotColors = ["blue", "red", "green"];
    app.state.pushCardId = "basic-gunma-ken";
    app.state.selectedDeckSlot = 0;
    app.state.guideCardId = "basic-gunma-ken";
    app.showScreen("deck");
  });
  await page.waitForTimeout(80);

  const beforeColorCycle = await page.evaluate(() => ({
    deckSlotColors: window.KanaGunmaPrototype.state.deckSlotColors.slice(),
    tilePalette: window.KanaGunmaPrototype.getTilePalette("basic-gunma-ken").join(","),
    pushSlot: window.KanaGunmaPrototype.state.deckIds.indexOf(window.KanaGunmaPrototype.state.pushCardId),
  }));
  await page.locator("#deckGrid .mini-card.is-push [data-color-cycle]").click();
  await page.waitForTimeout(80);
  const colorCycleResult = await page.evaluate((previous) => ({
    previous,
    deckSlotColors: window.KanaGunmaPrototype.state.deckSlotColors.slice(),
    tilePalette: window.KanaGunmaPrototype.getTilePalette("basic-gunma-ken").join(","),
    slotControlTexts: Array.from(document.querySelectorAll("[data-color-cycle]")).map((control) => control.textContent.trim()),
    slotControlLabels: Array.from(document.querySelectorAll("[data-color-cycle]")).map((control) => control.getAttribute("aria-label")),
    deckAriaLabels: Array.from(document.querySelectorAll("#deckGrid .mini-card")).map((card) => card.getAttribute("aria-label")),
    toast: document.querySelector("#toast").textContent,
    deckColorVars: Array.from(document.querySelectorAll("#deckGrid .mini-card")).map((card) => getComputedStyle(card).getPropertyValue("--card-a").trim()),
  }), beforeColorCycle);

  await page.locator('#deckScreen [data-nav-target="menu"]').click();
  await page.waitForTimeout(50);
  await page.locator('.menu-screen [data-nav-target="pack"]').click();
  await page.waitForTimeout(50);
  const packDetailInitiallyHidden = await page.evaluate(() => document.querySelector("#packDetailModal").hidden);
  await page.locator("#packDetailButton").click();
  await page.waitForTimeout(80);
  const packScreenState = await page.evaluate((detailInitiallyHidden) => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    packVisible: !document.querySelector("#packScreen").hidden,
    noticeText: document.querySelector("#packTestNotice").textContent,
    flowTexts: Array.from(document.querySelectorAll(".pack-flow span")).map((item) => item.textContent.trim()),
    selectorCount: document.querySelectorAll("#packSelector .pack-select-card").length,
    selectedPackText: document.querySelector("#packSelector .pack-select-card.is-active")?.textContent || "",
    detailInitiallyHidden,
    detailVisible: !document.querySelector("#packDetailModal").hidden,
    detailTitle: document.querySelector("#packDetailTitle")?.textContent || "",
    actionTexts: Array.from(document.querySelectorAll(".pack-actions button")).map((button) => button.textContent.trim()),
    rateCount: document.querySelectorAll(".rate-row > span").length,
    rateTexts: Array.from(document.querySelectorAll(".rate-row > span")).map((item) => item.textContent.trim()),
    rateBadgeLabels: Array.from(document.querySelectorAll(".rate-row > span .g-rarity-icons")).map((badge) =>
      badge.getAttribute("aria-label"),
    ),
    packPeriod: document.querySelector("#packPeriodText").textContent,
    featureText: document.querySelector("#packFeatureRow")?.textContent || "",
    featureCount: document.querySelectorAll("#packFeatureRow .pack-feature-card").length,
    featureNames: Array.from(document.querySelectorAll("#packFeatureRow .pack-feature-card strong")).map((item) => item.textContent.trim()),
    featureBadgeLabels: Array.from(document.querySelectorAll("#packFeatureRow .pack-feature-card .g-rarity-icons")).map((badge) =>
      badge.getAttribute("aria-label"),
    ),
    featureFits: Array.from(document.querySelectorAll("#packFeatureRow .pack-feature-card")).every((card) => {
      const rect = card.getBoundingClientRect();
      return rect.width >= 64 && rect.height >= 72;
    }),
    exchangeStatus: document.querySelector("#packExchangeStatus").textContent,
    exchangeIconExists: Boolean(document.querySelector("#packExchangeStatus .exchange-daruma-icon")),
    exchangeReady: document.querySelector("#packExchangeStatus").classList.contains("is-ready"),
    collectionProgress: document.querySelector("#packCollectionText").textContent,
    collectionProgressWidth: document.querySelector("#packCollectionBar").style.width,
    collectionHint: document.querySelector("#packCollectionHint").textContent,
    lineupCount: document.querySelectorAll("#packLineup .pack-lineup-card").length,
    lineupNames: Array.from(document.querySelectorAll("#packLineup .pack-lineup-card strong")).map((item) => item.textContent.trim()),
    lineupBadgeLabels: Array.from(document.querySelectorAll("#packLineup .pack-lineup-card .g-rarity-icons")).map((badge) =>
      badge.getAttribute("aria-label"),
    ),
    lineupFits: Array.from(document.querySelectorAll("#packLineup .pack-lineup-card")).every((card) => {
      const rect = card.getBoundingClientRect();
      return rect.width >= 58 && rect.height >= 84;
    }),
    packResult: document.querySelector("#packResult").textContent,
    packResultHidden: document.querySelector("#packResult").hidden,
    revealReady: document.querySelector("#packRevealName").textContent,
    revealMeta: document.querySelector("#packRevealMeta").textContent,
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
  }), packDetailInitiallyHidden);
  await page.locator('#packLineup [data-card-id="season1-takasaki"]').click();
  await page.waitForTimeout(80);
  const packLineupDetailState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    deckVisible: !document.querySelector("#deckScreen").hidden,
    guideTitle: document.querySelector("#wordGuideTitle").textContent,
    guideMeta: document.querySelector("#wordGuideMeta").textContent,
    guideRarityLabel: document.querySelector("#wordGuideMeta .g-rarity-icons")?.getAttribute("aria-label"),
    guideAction: document.querySelector("#wordGuideAction").textContent,
    guideActionDisabled: document.querySelector("#wordGuideAction").disabled,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.locator('#deckScreen [data-nav-target="menu"]').click();
  await page.waitForTimeout(50);
  await page.locator('.menu-screen [data-nav-target="pack"]').click();
  await page.waitForTimeout(50);
  await page.evaluate(() => {
    const app = window.KanaGunmaPrototype;
    app.state.packMedals = 50;
    app.state.packMedalsByPack["season-01-pack"] = 50;
    app.state.selectedDeckSlot = 2;
    app.state.guideCardId = "season1-takasaki";
    app.showScreen("pack");
  });
  await page.waitForTimeout(80);
  const packExchangeReadyState = await page.evaluate(() => ({
    tagName: document.querySelector("#packExchangeStatus").tagName,
    status: document.querySelector("#packExchangeStatus").textContent,
    readyClass: document.querySelector("#packExchangeStatus").classList.contains("is-ready"),
    actionableClass: document.querySelector("#packExchangeStatus").classList.contains("is-actionable"),
    ariaLabel: document.querySelector("#packExchangeStatus").getAttribute("aria-label"),
    openButtonText: document.querySelector("#openPackButton").textContent,
    openButtonDisabled: document.querySelector("#openPackButton").disabled,
    openButtonExchangeClass: document.querySelector("#openPackButton").classList.contains("is-exchange-required"),
    exchangeableCount: document.querySelectorAll(".collection-card.is-exchangeable").length,
    lineupExchangeableCount: document.querySelectorAll(".pack-lineup-card.is-exchangeable").length,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.locator("#packExchangeStatus").click();
  await page.waitForTimeout(80);
  const packExchangeGuideActionState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    deckVisible: !document.querySelector("#deckScreen").hidden,
    guideTitle: document.querySelector("#wordGuideTitle").textContent,
    guideAction: document.querySelector("#wordGuideAction").textContent,
    guideActionDisabled: document.querySelector("#wordGuideAction").disabled,
    guideActionPrimary: document.querySelector("#wordGuideAction").classList.contains("is-primary"),
    selectedFilter: window.KanaGunmaPrototype.state.collectionFilterId,
    hasExchangeOpenEvent: window.KanaGunmaPrototype.state.telemetryEvents.some((event) => event.type === "pack_exchange_open"),
    toast: document.querySelector("#toast").textContent,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.locator("#wordGuideAction").click();
  await page.waitForTimeout(80);
  const packMedalExchangeState = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("kana-gunmatsuri-save-v1"));
    return {
      medals: window.KanaGunmaPrototype.state.packMedals,
      medalsByPack: window.KanaGunmaPrototype.state.packMedalsByPack["season-01-pack"],
      owned: window.KanaGunmaPrototype.state.owned["season1-takasaki"],
      deckIds: window.KanaGunmaPrototype.state.deckIds.slice(),
      pushCardId: window.KanaGunmaPrototype.state.pushCardId,
      guideTitle: document.querySelector("#wordGuideTitle").textContent,
      toast: document.querySelector("#toast").textContent,
      hasExchangeEvent: window.KanaGunmaPrototype.state.telemetryEvents.some((event) => event.type === "pack_medal_exchange"),
      savedMedals: saved.packMedals,
      savedMedalsByPack: saved.packMedalsByPack["season-01-pack"],
      savedOwned: saved.owned["season1-takasaki"],
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  await page.evaluate(() => {
    const app = window.KanaGunmaPrototype;
    const pack = app.data.packs.find((item) => item.id === "season-01-pack");
    for (const entry of pack.entries.filter((item) => item.type === "card")) {
      app.state.owned[entry.cardId] = 1;
    }
    app.state.packMedals = 50;
    app.state.packMedalsByPack["season-01-pack"] = 50;
    app.state.selectedDeckSlot = 2;
    app.state.guideCardId = "season1-takasaki";
    app.showScreen("pack");
  });
  await page.waitForTimeout(80);
  const packDuplicateExchangeReadyState = await page.evaluate(() => ({
    status: document.querySelector("#packExchangeStatus").textContent,
    readyClass: document.querySelector("#packExchangeStatus").classList.contains("is-ready"),
    actionableClass: document.querySelector("#packExchangeStatus").classList.contains("is-actionable"),
    ariaLabel: document.querySelector("#packExchangeStatus").getAttribute("aria-label"),
    exchangeableCount: document.querySelectorAll(".collection-card.is-exchangeable").length,
    lineupExchangeableCount: document.querySelectorAll(".pack-lineup-card.is-exchangeable").length,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.locator("#packExchangeStatus").click();
  await page.waitForTimeout(80);
  const packDuplicateExchangeGuideState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    guideTitle: document.querySelector("#wordGuideTitle").textContent,
    guideMeta: document.querySelector("#wordGuideMeta").textContent,
    guideAction: document.querySelector("#wordGuideAction").textContent,
    guideActionDisabled: document.querySelector("#wordGuideAction").disabled,
    selectedFilter: window.KanaGunmaPrototype.state.collectionFilterId,
    exchangePackId: window.KanaGunmaPrototype.state.exchangePackId,
    collectionCount: document.querySelectorAll(".collection-card").length,
    exchangeableCount: document.querySelectorAll(".collection-card.is-exchangeable").length,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.locator("#wordGuideAction").click();
  await page.waitForTimeout(80);
  const packDuplicateExchangeState = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("kana-gunmatsuri-save-v1"));
    return {
      medals: window.KanaGunmaPrototype.state.packMedals,
      medalsByPack: window.KanaGunmaPrototype.state.packMedalsByPack["season-01-pack"],
      owned: window.KanaGunmaPrototype.state.owned["season1-takasaki"],
      savedOwned: saved.owned["season1-takasaki"],
      exchangePackId: window.KanaGunmaPrototype.state.exchangePackId,
      toast: document.querySelector("#toast").textContent,
      hasDuplicateExchangeEvent: window.KanaGunmaPrototype.state.telemetryEvents.some(
        (event) => event.type === "pack_medal_exchange" && event.data.cardId === "season1-takasaki" && event.data.duplicate === true,
      ),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  await page.evaluate(() => {
    const app = window.KanaGunmaPrototype;
    app.state.deckIds = ["basic-gunma-ken", "basic-daruma", "basic-akagi-san"];
    app.state.pushCardId = "basic-gunma-ken";
    app.state.selectedDeckSlot = 0;
    app.state.guideCardId = "basic-gunma-ken";
    app.state.packMedals = 0;
    app.state.packMedalsByPack["season-01-pack"] = 0;
    app.showScreen("pack");
  });
  await page.waitForTimeout(80);
  await page.locator("#testBuyButton").click();
  await page.waitForTimeout(50);
  await page.locator("#openPackButton").click();
  await page.waitForTimeout(680);
  const packOpenState = await page.evaluate(() => ({
    packStone: window.KanaGunmaPrototype.state.packStone,
    choiceTickets: window.KanaGunmaPrototype.state.choiceTickets,
    lastPackResult: window.KanaGunmaPrototype.state.lastPackResult,
    reveal: window.KanaGunmaPrototype.state.lastPackReveal,
    resultText: document.querySelector("#packResult").textContent,
    resultHidden: document.querySelector("#packResult").hidden,
    revealClasses: Array.from(document.querySelector("#packReveal").classList),
    revealRarity: document.querySelector("#packRevealRarity").textContent,
    revealRarityLabel: document.querySelector("#packRevealRarity .g-rarity-icons")?.getAttribute("aria-label") || "",
    revealName: document.querySelector("#packRevealName").textContent,
    revealMeta: document.querySelector("#packRevealMeta").textContent,
    revealActionExists: Boolean(document.querySelector("#packRevealAction")),
    revealActionText: document.querySelector("#packRevealAction")?.textContent.trim(),
    revealActionHidden: document.querySelector("#packRevealAction")?.hidden,
    revealActionDisabled: document.querySelector("#packRevealAction")?.disabled,
    revealShareExists: Boolean(document.querySelector("#packRevealShare")),
    revealWidth: Math.round(document.querySelector("#packReveal").getBoundingClientRect().width),
    openingModalVisible: !document.querySelector("#packOpeningModal").hidden,
    openingCardClasses: Array.from(document.querySelector("#packOpeningCard").classList),
    openingTitle: document.querySelector("#packOpeningTitle").textContent,
    openingName: document.querySelector("#packOpeningName").textContent,
    openingLetters: Array.from(document.querySelectorAll("#packOpeningName .pack-opening-letter")).map((letter) => letter.textContent),
    openingMeta: document.querySelector("#packOpeningMeta").textContent,
    openingRarity: document.querySelector("#packOpeningRarity").textContent,
    openingRarityLabel: document.querySelector("#packOpeningRarity .g-rarity-icons")?.getAttribute("aria-label") || "",
    openingSkill: document.querySelector("#packOpeningSkill")?.textContent.trim() || "",
    openingActionText: document.querySelector("#packOpeningAction").textContent.trim(),
    openingAgainText: document.querySelector("#packOpeningAgain")?.textContent.trim() || "",
    openingAgainDisabled: document.querySelector("#packOpeningAgain")?.disabled,
    openingArtVisible: !document.querySelector("#packOpeningArt").hidden,
    openingArtSrc: document.querySelector("#packOpeningArt").getAttribute("src") || "",
    openingFallbackHidden: document.querySelector("#packOpeningFallback").hidden,
    openingArtRect: (() => {
      const rect = document.querySelector("#packOpeningArtFrame").getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height) };
    })(),
    openingRect: (() => {
      const rect = document.querySelector("#packOpeningCard").getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height) };
    })(),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    collectionOwnedCount: Array.from(document.querySelectorAll(".collection-card")).filter((card) => !card.classList.contains("is-locked")).length,
  }));
  await page.screenshot({ path: packRevealScreenshotPath, fullPage: true });
  await page.locator("#packOpeningAction").click();
  await page.waitForTimeout(100);
  const packRevealActionState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    deckVisible: !document.querySelector("#deckScreen").hidden,
    guideTitle: document.querySelector("#wordGuideTitle").textContent,
    guideAction: document.querySelector("#wordGuideAction").textContent,
    hasDetailEvent: window.KanaGunmaPrototype.state.telemetryEvents.some((event) => event.type === "pack_reveal_detail"),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));

  await page.locator('#deckScreen [data-nav-target="menu"]').click();
  await page.waitForTimeout(50);
  await page.locator('.menu-screen [data-nav-target="pack"]').click();
  await page.waitForTimeout(80);
  const packReentryState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    packVisible: !document.querySelector("#packScreen").hidden,
    resultText: document.querySelector("#packResult").textContent,
    resultHidden: document.querySelector("#packResult").hidden,
    revealName: document.querySelector("#packRevealName").textContent,
    revealActionHidden: document.querySelector("#packRevealAction")?.hidden,
    lastPackReveal: window.KanaGunmaPrototype.state.lastPackReveal,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.locator('#packScreen [data-nav-target="menu"]').click();
  await page.waitForTimeout(50);
  await page.locator('.menu-screen [data-nav-target="settings"]').click();
  await page.waitForTimeout(50);
  await page.locator("#motionToggle").check();
  await page.locator("#largeTextToggle").check();
  await page.locator("#contrastToggle").check();
  await page.locator("#tileMarkToggle").check();
  await page.locator("#soundTestButton").click();
  await page.waitForTimeout(80);
  const soundTestProbe = await page.evaluate(() => {
    const rect = document.querySelector("#soundTestButton").getBoundingClientRect();
    return {
      buttonText: document.querySelector("#soundTestButton").textContent.trim(),
      rect: { width: Math.round(rect.width), height: Math.round(rect.height) },
      toast: document.querySelector("#toast").textContent,
      soundEvents: window.KanaGunmaPrototype.state.soundEvents.slice(),
      soundOn: window.KanaGunmaPrototype.state.settings.sound,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  const settingsScreenState = await page.evaluate((soundTestProbe) => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    settingsVisible: !document.querySelector("#settingsScreen").hidden,
    reduceMotion: window.KanaGunmaPrototype.state.settings.reduceMotion,
    largeText: window.KanaGunmaPrototype.state.settings.largeText,
    highContrast: window.KanaGunmaPrototype.state.settings.highContrast,
    tileMarks: window.KanaGunmaPrototype.state.settings.tileMarks,
    streamModeSettingExists: Object.prototype.hasOwnProperty.call(window.KanaGunmaPrototype.state.settings, "streamMode"),
    bodyClass: document.body.classList.contains("reduce-motion"),
    largeTextClass: document.body.classList.contains("large-text"),
    highContrastClass: document.body.classList.contains("high-contrast"),
    tileMarkClass: document.body.classList.contains("tile-marks"),
    tileMarkToggleChecked: document.querySelector("#tileMarkToggle").checked,
    deckSlotLabels: Array.from(document.querySelectorAll("#deckGrid .mini-card")).map((card) => card.getAttribute("data-slot-label")),
    deckSlotLabelCount: document.querySelectorAll("#deckGrid .mini-card").length,
    deckSlotPushLabelCount: Array.from(document.querySelectorAll("#deckGrid .mini-card")).filter((card) =>
      (card.getAttribute("data-slot-label") || "").includes("推し"),
    ).length,
    deckSlotAllInDeck: Array.from(document.querySelectorAll("#deckGrid .mini-card")).every((card) =>
      (card.getAttribute("data-slot-label") || "").includes("デッキ入り"),
    ),
    streamModeToggleExists: Boolean(document.querySelector("#streamModeToggle")),
    howtoExists: Boolean(document.querySelector(".howto-panel")),
    howtoStepCount: document.querySelectorAll(".howto-step").length,
    tutorialReplayExists: Boolean(document.querySelector("#tutorialReplayButton")),
    resetSaveExists: Boolean(document.querySelector("#resetSaveButton")),
    resetSaveNote: document.querySelector("#resetSaveNote")?.textContent || "",
    howtoPanelRect: (() => {
      const rect = document.querySelector(".howto-panel")?.getBoundingClientRect();
      return rect
        ? { top: Math.round(rect.top), bottom: Math.round(rect.bottom), height: Math.round(rect.height) }
        : null;
    })(),
    settingsPanelFirstRect: (() => {
      const rect = document.querySelector(".settings-panel:not(.howto-panel)")?.getBoundingClientRect();
      return rect
        ? { top: Math.round(rect.top), bottom: Math.round(rect.bottom), height: Math.round(rect.height) }
        : null;
    })(),
    buildVersionText: document.querySelector("#buildVersionText").textContent,
    buildChannelText: document.querySelector("#buildChannelText").textContent,
    buildInfo: window.KanaGunmaPrototype.buildInfo,
    buildLabel: window.KanaGunmaPrototype.formatBuildLabel(),
    soundTestProbe,
    feedbackReportButtonExists: Boolean(document.querySelector("#feedbackReportButton")),
    feedbackInsightExists: Boolean(document.querySelector("#feedbackInsightPanel")),
    telemetryEvents: window.KanaGunmaPrototype.state.telemetryEvents.slice(),
    savedTelemetryEvents: JSON.parse(localStorage.getItem("kana-gunmatsuri-save-v1")).telemetryEvents || [],
    policyLinks: Array.from(document.querySelectorAll(".policy-link")).map((link) => {
      const rect = link.getBoundingClientRect();
      return {
        id: link.id,
        href: link.getAttribute("href"),
        text: link.textContent.trim(),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    }),
    policyOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }), soundTestProbe);
  await page.screenshot({ path: settingsScreenshotPath, fullPage: true });

  await page.locator('#settingsScreen [data-nav-target="menu"]').click();
  await page.waitForTimeout(50);
  await page.evaluate(() => {
    const state = window.KanaGunmaPrototype.state;
    state.running = false;
    state.score = 12345;
    state.timeLeft = 12;
    state.comboCount = 7;
    state.maxCombo = 7;
    state.runStats.matches = 3;
    state.effects = [{ type: "score", age: 0, duration: 1, x: 120, y: 120, text: "OLD", color: "#ffffff" }];
    state.tiles = [
      { id: 90001, kind: "kana", char: "お", cardId: "basic-gunma-ken", col: 0, row: 0, x: 120, y: 120 },
    ];
    document.querySelector("#finishCard").hidden = false;
  });
  await page.locator(".home-play-button").click();
  await page.waitForSelector("#gameCanvas");
  const idleGameResetState = await page.evaluate(() => ({
    tiles: window.KanaGunmaPrototype.state.tiles.length,
    effects: window.KanaGunmaPrototype.state.effects.length,
    score: window.KanaGunmaPrototype.state.score,
    timeLeft: window.KanaGunmaPrototype.state.timeLeft,
    comboCount: window.KanaGunmaPrototype.state.comboCount,
    matches: window.KanaGunmaPrototype.state.runStats.matches,
    startHidden: document.querySelector("#startButton").hidden,
    finishHidden: document.querySelector("#finishCard").hidden,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.locator("#startButton").click();
  await page.waitForTimeout(120);
  const countdownProbe = await page.evaluate(() => ({
    visible: !document.querySelector("#stageCountdown").hidden,
    text: document.querySelector("#stageCountdownText").textContent,
    startHidden: document.querySelector("#startButton").hidden,
    timeLeft: window.KanaGunmaPrototype.state.timeLeft,
    startCountdown: window.KanaGunmaPrototype.state.startCountdown,
  }));
  await page.evaluate(() => {
    const state = window.KanaGunmaPrototype.state;
    state.startCountdown = 0;
    state.autoResolveQueued = false;
    state.autoScanTimer = 0;
  });
  await page.waitForTimeout(120);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await page.screenshot({ path: tutorialCoachScreenshotPath, fullPage: true });
  await page.waitForTimeout(80);

  const result = await page.evaluate(() => {
    const canvas = document.querySelector("#gameCanvas");
    const context = canvas.getContext("2d");
    let canvasReadable = true;
    let nonBlank = 0;
    try {
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] !== 0 && (pixels[i - 1] !== 0 || pixels[i - 2] !== 0 || pixels[i - 3] !== 0)) {
          nonBlank += 1;
        }
        if (nonBlank > 1000) {
          break;
        }
      }
    } catch (error) {
      canvasReadable = false;
    }

    return {
      title: document.querySelector("h1").textContent.trim(),
      deckCount: document.querySelectorAll("#deckGrid .mini-card").length,
      artDeckCount: document.querySelectorAll("#deckGrid .mini-card.has-art").length,
      stageBackground: getComputedStyle(document.querySelector(".play-panel")).backgroundImage,
      firstCardBackground: getComputedStyle(document.querySelector("#deckGrid .mini-card")).backgroundImage,
      deckBackgrounds: Array.from(document.querySelectorAll("#deckGrid .mini-card")).map((card) => getComputedStyle(card).backgroundImage),
      pushCardBackground: getComputedStyle(document.querySelector("#deckGrid .mini-card.is-push")).backgroundImage,
      pushDeckIndex: Array.from(document.querySelectorAll("#deckGrid .mini-card")).findIndex((card) => card.classList.contains("is-push")),
      pushLabelCount: document.querySelectorAll("#deckGrid .mini-card .push-frame-label").length,
      deckSlotColors: window.KanaGunmaPrototype.state.deckSlotColors.slice(),
      deckSlotColorLabels: Array.from(document.querySelectorAll("#deckGrid .mini-card")).map((card) => card.dataset.slotColorLabel),
      slotControlCount: document.querySelectorAll("[data-color-cycle]").length,
      slotControlTexts: Array.from(document.querySelectorAll("[data-color-cycle]")).map((control) => control.textContent.trim()),
      slotControlLabels: Array.from(document.querySelectorAll("[data-color-cycle]")).map((control) => control.getAttribute("aria-label")),
      deckAriaLabels: Array.from(document.querySelectorAll("#deckGrid .mini-card")).map((card) => card.getAttribute("aria-label")),
      menuDeckAriaLabels: Array.from(document.querySelectorAll("#menuDeckGrid .mini-card")).map((card) => card.getAttribute("aria-label")),
      gameLegendCount: document.querySelectorAll("#gameDeckLegend .game-deck-legend-card").length,
      gameLegendLabels: Array.from(document.querySelectorAll("#gameDeckLegend .game-deck-legend-card")).map((card) => card.dataset.slotColorLabel),
      gameLegendNames: Array.from(document.querySelectorAll("#gameDeckLegend .game-deck-legend-card strong")).map((item) => item.textContent),
      gameLegendReadings: Array.from(document.querySelectorAll("#gameDeckLegend .game-deck-legend-card em")).map((item) => item.textContent),
      gameLegendSkills: Array.from(document.querySelectorAll("#gameDeckLegend .game-deck-legend-card .legend-skill")).map((item) => item.textContent),
      gameLegendAriaLabels: Array.from(document.querySelectorAll("#gameDeckLegend .game-deck-legend-card")).map((card) => card.getAttribute("aria-label")),
      gameLegendArtCount: document.querySelectorAll("#gameDeckLegend .game-deck-legend-card.has-art").length,
      gameLegendPushCount: document.querySelectorAll("#gameDeckLegend .game-deck-legend-card.is-push").length,
      gameLegendFits: Array.from(document.querySelectorAll("#gameDeckLegend .game-deck-legend-card")).every((card) => {
        const rect = card.getBoundingClientRect();
        return rect.width > 64 && rect.height > 48;
      }),
      gameControlsLayout: (() => {
        const row = document.querySelector(".game-deck-control-row").getBoundingClientRect();
        const cards = Array.from(document.querySelectorAll("#gameDeckLegend .game-deck-legend-card")).map((card) => card.getBoundingClientRect());
        const refresh = document.querySelector("#refreshButton").getBoundingClientRect();
        const lastCard = cards[cards.length - 1];
        return {
          rowHeight: Math.round(row.height),
          cardCount: cards.length,
          sameRow: cards.every((card) => Math.abs(card.top - refresh.top) <= 2 && Math.abs(card.bottom - refresh.bottom) <= 2),
          refreshAfterCards: Boolean(lastCard && refresh.left > lastCard.right),
          refreshWidth: Math.round(refresh.width),
          refreshHeight: Math.round(refresh.height),
          hiddenSkillRow: document.querySelector(".control-row").hidden && getComputedStyle(document.querySelector(".control-row")).display === "none",
        };
      })(),
      deckColorVars: Array.from(document.querySelectorAll("#deckGrid .mini-card")).map((card) => ({
        cardA: getComputedStyle(card).getPropertyValue("--card-a").trim(),
        cardB: getComputedStyle(card).getPropertyValue("--card-b").trim(),
      })),
      deckColorControlsFit: Array.from(document.querySelectorAll("#deckGrid .mini-card")).every((card) => {
        const control = card.querySelector("[data-color-cycle]");
        const skill = card.querySelector(".card-skill");
        if (!control || !skill) {
          return false;
        }
        const cardRect = card.getBoundingClientRect();
        const controlRect = control.getBoundingClientRect();
        const skillRect = skill.getBoundingClientRect();
        return (
          controlRect.left >= cardRect.left &&
          controlRect.right <= cardRect.right &&
          controlRect.top >= cardRect.top &&
          controlRect.bottom <= cardRect.bottom &&
          skillRect.right <= controlRect.left + 1
        );
      }),
      tilePaletteBeforeCycle: window.KanaGunmaPrototype.getTilePalette("basic-gunma-ken").join(","),
      running: window.KanaGunmaPrototype.state.running,
      tiles: window.KanaGunmaPrototype.state.tiles.length,
      specialTiles: window.KanaGunmaPrototype.state.tiles.filter((tile) => tile.kind === "special").length,
      specialCooldown: window.KanaGunmaPrototype.state.specialCooldown,
      passiveSkills: window.KanaGunmaPrototype.state.passiveSkills.map((skill) => ({
        cardId: skill.cardId,
        type: skill.type,
        value: Number(skill.value.toFixed(3)),
        charges: skill.charges || 0,
        isPush: Boolean(skill.isPush),
        multiplier: skill.multiplier || 1,
      })),
      passiveSummaries: window.KanaGunmaPrototype.state.passiveSkills.map((skill) => window.KanaGunmaPrototype.passiveSkillSummary(skill)),
      skillHudText: document.querySelector("#skillText").textContent,
      skillHudLabel: document.querySelector(".skill-boost-label").textContent,
      timeLeft: window.KanaGunmaPrototype.state.timeLeft,
      score: window.KanaGunmaPrototype.state.score,
      stamina: window.KanaGunmaPrototype.state.stamina,
      startDisabled: document.querySelector("#startButton").disabled,
      startLabel: document.querySelector("#startButtonText").textContent,
      startHidden: document.querySelector("#startButton").hidden,
      startParentClass: document.querySelector("#startButton").parentElement.className,
      stageCountdownHidden: document.querySelector("#stageCountdown").hidden,
      wordPanelExists: Boolean(document.querySelector(".word-panel")),
      refreshRect: (() => {
        const rect = document.querySelector("#refreshButton").getBoundingClientRect();
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
      })(),
      staminaPips: Array.from(document.querySelectorAll("#menuStaminaPips .stamina-pip")).map((pip) => !pip.classList.contains("is-empty")),
      tileMarks: window.KanaGunmaPrototype.state.settings.tileMarks,
      tileMarkClass: document.body.classList.contains("tile-marks"),
      streamOverlayExists: Boolean(document.querySelector("#streamStrip")),
      tutorialActive: window.KanaGunmaPrototype.state.tutorial.active,
      tutorialComplete: window.KanaGunmaPrototype.state.tutorialComplete,
      tutorialHint: window.KanaGunmaPrototype.state.tutorial,
      tutorialCoachVisible: !document.querySelector("#tutorialCoach").hidden,
      tutorialCoachText: document.querySelector("#tutorialCoachText").textContent,
      tutorialCoachSubtext: document.querySelector("#tutorialCoachSubtext").textContent,
      tutorialCoachRect: (() => {
        const rect = document.querySelector("#tutorialCoach").getBoundingClientRect();
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
      })(),
      canvasReadable,
      nonBlank,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  const specialCraneProbe = await page.evaluate(() => {
    const state = window.KanaGunmaPrototype.state;
    state.specialCraneChanceOverride = 1;
    state.specialCrane = { checked: false, triggered: false, active: false, timer: 0, announced: false };
    state.timeLeft = 30.05;
    state.lastSpurtActive = false;
    state.lastSpurtAnnounced = false;
    return { before: state.timeLeft };
  });
  await page.waitForTimeout(220);
  Object.assign(specialCraneProbe, await page.evaluate(() => ({
    checked: window.KanaGunmaPrototype.state.specialCrane.checked,
    triggered: window.KanaGunmaPrototype.state.specialCrane.triggered,
    active: window.KanaGunmaPrototype.state.specialCrane.active,
    timer: window.KanaGunmaPrototype.state.specialCrane.timer,
    scoreEffects: window.KanaGunmaPrototype.state.effects.filter((effect) => effect.type === "score").map((effect) => ({
      text: effect.text,
      lane: effect.lane || "",
    })),
    skillHudLabel: document.querySelector(".skill-boost-label").textContent,
  })));

  const lastSpurtProbe = await page.evaluate(() => {
    const state = window.KanaGunmaPrototype.state;
    state.timeLeft = 10.05;
    state.lastSpurtActive = false;
    state.lastSpurtAnnounced = false;
    return { before: state.timeLeft };
  });
  await page.waitForTimeout(220);
  Object.assign(lastSpurtProbe, await page.evaluate(() => ({
    active: window.KanaGunmaPrototype.state.lastSpurtActive,
    announced: window.KanaGunmaPrototype.state.lastSpurtAnnounced,
    scoreEffects: window.KanaGunmaPrototype.state.effects.filter((effect) => effect.type === "score").map((effect) => ({
      text: effect.text,
      lane: effect.lane || "",
    })),
    phoneClass: document.querySelector(".phone").classList.contains("is-last-spurt"),
    skillHudLabel: document.querySelector(".skill-boost-label").textContent,
  })));
  await page.evaluate(() => {
    const state = window.KanaGunmaPrototype.state;
    state.timeLeft = 45;
    state.lastSpurtActive = false;
    state.specialCrane.active = false;
    state.specialCraneChanceOverride = null;
  });

  const pauseProbe = await page.evaluate(() => {
    const state = window.KanaGunmaPrototype.state;
    const beforeTime = state.timeLeft;
    const paused = window.KanaGunmaPrototype.pauseRun("manual");
    return {
      paused,
      beforeTime,
      statePaused: state.paused,
      pauseVisible: !document.querySelector("#pauseCard").hidden,
      pauseLabel: document.querySelector("#pauseButton").textContent,
      pauseReason: document.querySelector("#pauseReasonText").textContent,
      refreshDisabled: document.querySelector("#refreshButton").disabled,
      streamOverlayExists: Boolean(document.querySelector("#streamStrip")),
    };
  });
  await page.waitForTimeout(180);
  const pauseHoldResult = await page.evaluate((beforeTime) => ({
    statePaused: window.KanaGunmaPrototype.state.paused,
    timeLeft: window.KanaGunmaPrototype.state.timeLeft,
    timeHeld: Math.abs(window.KanaGunmaPrototype.state.timeLeft - beforeTime) < 0.02,
    pauseVisible: !document.querySelector("#pauseCard").hidden,
  }), pauseProbe.beforeTime);
  const resumeProbe = await page.evaluate(() => {
    const resumed = window.KanaGunmaPrototype.resumeRun();
    return {
      resumed,
      statePaused: window.KanaGunmaPrototype.state.paused,
      pauseVisible: !document.querySelector("#pauseCard").hidden,
      pauseLabel: document.querySelector("#pauseButton").textContent,
      streamOverlayExists: Boolean(document.querySelector("#streamStrip")),
    };
  });
  await page.waitForTimeout(80);

  const tutorialAutoAssistProbe = await page.evaluate(() => {
    const state = window.KanaGunmaPrototype.state;
    const before = {
      active: state.tutorial.active,
      elapsed: state.tutorial.elapsed,
      demoAfter: state.tutorial.demoAfter,
      coachText: document.querySelector("#tutorialCoachText").textContent,
      coachSubtext: document.querySelector("#tutorialCoachSubtext").textContent,
    };
    state.tutorial.elapsed = (state.tutorial.demoAfter || 8) + 0.05;
    return before;
  });
  await page.waitForTimeout(260);
  const tutorialMoveResult = await page.evaluate((autoAssistProbe) => ({
    score: window.KanaGunmaPrototype.state.score,
    tutorialActive: window.KanaGunmaPrototype.state.tutorial.active,
    tutorialComplete: window.KanaGunmaPrototype.state.tutorialComplete,
    tutorialDemoDone: window.KanaGunmaPrototype.state.tutorial.demoDone,
    tutorialAutoAssistProbe: autoAssistProbe,
    coachVisible: !document.querySelector("#tutorialCoach").hidden,
    completedRuns: window.KanaGunmaPrototype.state.completedRuns,
    saved: JSON.parse(localStorage.getItem("kana-gunmatsuri-save-v1")),
  }), tutorialAutoAssistProbe);
  const postTutorialHomeState = await page.evaluate(() => {
    window.KanaGunmaPrototype.showScreen("menu");
    return {
      screen: window.KanaGunmaPrototype.state.currentScreen,
      firstPlayVisible: !document.querySelector("#firstPlayPanel").hidden,
      homePlayVisible: getComputedStyle(document.querySelector(".home-play-button")).display !== "none",
      dailyHidden: document.querySelector("#dailyPanel").hidden,
      dailyWordHidden: document.querySelector("#dailyWordPanel").hidden,
      dailyGiftHidden: document.querySelector("#dailyGiftPanel").hidden,
      warmupClass: document.querySelector(".phone").classList.contains("is-warmup-session"),
      scoreGoalHidden: document.querySelector("#scoreGoalPanel").hidden,
      dailyTitle: document.querySelector("#menuDailyTitle").textContent,
      dailyReward: document.querySelector("#menuDailyReward").textContent,
      scoreGoalTitle: document.querySelector("#menuScoreGoalTitle").textContent,
      scoreGoalReward: document.querySelector("#menuScoreGoalReward").textContent,
      dailyProgress: document.querySelector("#menuDailyProgress").textContent,
      scoreGoalProgress: document.querySelector("#menuScoreGoalProgress").textContent,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  await page.screenshot({ path: warmupMenuScreenshotPath, fullPage: true });
  await page.evaluate(() => {
    window.KanaGunmaPrototype.showScreen("game");
    window.KanaGunmaPrototype.resumeRun();
  });

  const beforeRefresh = await page.evaluate(() => {
    const state = window.KanaGunmaPrototype.state;
    state.autoResolveQueued = false;
    state.autoScanTimer = 10;
    return {
      score: state.score,
      tileIds: state.tiles.map((tile) => tile.id).join(","),
    };
  });
  await page.locator("#refreshButton").click();
  await page.waitForTimeout(80);
  const refreshResult = await page.evaluate((previous) => {
    const state = window.KanaGunmaPrototype.state;
    return {
      tiles: state.tiles.length,
      score: state.score,
      cooldown: state.refreshCooldown,
      changed: state.tiles.map((tile) => tile.id).join(",") !== previous.tileIds,
      buttonText: document.querySelector("#refreshButton").textContent,
    };
  }, beforeRefresh);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(80);

  const slideProbe = await page.evaluate(() => {
    const canvas = document.querySelector("#gameCanvas");
    const rect = canvas.getBoundingClientRect();
    const state = window.KanaGunmaPrototype.state;
    const positions = new Map(state.tiles.map((tile) => [`${tile.col},${tile.row}`, { x: tile.x, y: tile.y }]));
    let id = 1;
    state.autoScanTimer = 10;
    state.tiles = [];
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 6; col += 1) {
        const position = positions.get(`${col},${row}`) || { x: 40 + col * 48, y: 120 + row * 48 };
        state.tiles.push({
          id,
          kind: "kana",
          char: "ぐ",
          cardId: "basic-gunma-ken",
          col,
          row,
          x: position.x,
          y: position.y,
        });
        id += 1;
      }
    }
    const tile = state.tiles.find((item) => item.col === 1 && item.row === 3);
    const other = state.tiles.find((item) => item.col === 2 && item.row === 3);
    return {
      tileId: tile.id,
      otherId: other.id,
      from: { col: tile.col, row: tile.row },
      otherFrom: { col: other.col, row: other.row },
      start: { x: rect.left + tile.x, y: rect.top + tile.y },
      end: { x: rect.left + other.x, y: rect.top + other.y },
    };
  });

  await page.evaluate(({ start, end }) => {
    const canvas = document.querySelector("#gameCanvas");
    const fire = (type, point, buttons) => {
      canvas.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          pointerId: 77,
          pointerType: "touch",
          isPrimary: true,
          button: 0,
          buttons,
          clientX: point.x,
          clientY: point.y,
        }),
      );
    };
    fire("pointerdown", start, 1);
    fire("pointermove", end, 1);
    fire("pointerup", end, 0);
  }, slideProbe);
  await page.waitForTimeout(50);

  const slideResult = await page.evaluate(({ tileId, otherId }) => {
    const state = window.KanaGunmaPrototype.state;
    const tile = state.tiles.find((item) => item.id === tileId);
    const other = state.tiles.find((item) => item.id === otherId);
    return {
      tile: { col: tile.col, row: tile.row },
      other: { col: other.col, row: other.row },
    };
  }, slideProbe);

  await page.evaluate(() => {
    const app = window.KanaGunmaPrototype;
    const state = window.KanaGunmaPrototype.state;
    const mission = app.currentDailyMissionDefinition();
    const card = window.KANAGUNMA_DATA.cards.find((item) => item.id === "basic-gunma-ken");
    const letters = Array.from(card.readingKana);
    const scrambled = [2, 1, 0, 3, 4].map((index) => letters[index]);
    state.score = 0;
    state.packStone = 0;
    state.dailyMission = {
      dateKey: app.todayDateKey(),
      id: mission.id,
      progress: 0,
      claimed: false,
    };
    state.dailyStreak = {
      count: 0,
      lastClaimDateKey: "",
    };
    state.pointerActive = false;
    state.autoResolveQueued = true;
    state.autoScanTimer = 0.01;
    state.tiles = scrambled.map((char, index) => ({
      id: index + 1,
      kind: "kana",
      char,
      cardId: "basic-gunma-ken",
      col: index,
      row: 6,
      x: 70 + index * 48,
      y: 420,
    }));
  });

  await page.waitForFunction(() => window.KanaGunmaPrototype.state.score > 0, null, { timeout: 1000 });
  await page.waitForTimeout(20);

  const autoMatchResult = await page.evaluate(() => ({
    score: window.KanaGunmaPrototype.state.score,
    effects: window.KanaGunmaPrototype.state.effects.length,
    effectTypes: Array.from(new Set(window.KanaGunmaPrototype.state.effects.map((effect) => effect.type))),
    wordCallVisible: document.querySelector("#wordCall").classList.contains("is-visible"),
    wordCallHidden: document.querySelector("#wordCall").getAttribute("aria-hidden"),
    wordCallText: document.querySelector("#wordCallText").textContent,
    wordCallScore: document.querySelector("#wordCallScore").textContent,
    wordCallPointerEvents: getComputedStyle(document.querySelector("#wordCall")).pointerEvents,
    toastVisible: document.querySelector("#toast").classList.contains("is-visible"),
    streamModeSettingExists: Object.prototype.hasOwnProperty.call(window.KanaGunmaPrototype.state.settings, "streamMode"),
    streamClass: document.querySelector(".phone").classList.contains("is-stream-mode"),
    streamOverlayExists: Boolean(document.querySelector("#streamStrip")),
    wordCallRect: (() => {
      const rect = document.querySelector("#wordCall").getBoundingClientRect();
      const canvasRect = document.querySelector("#gameCanvas").getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        topFromCanvas: Math.round(rect.top - canvasRect.top),
        bottomFromCanvas: Math.round(rect.bottom - canvasRect.top),
      };
    })(),
    wordCallFontSize: Number.parseFloat(getComputedStyle(document.querySelector("#wordCallText")).fontSize),
    wordCallAnimationDuration: getComputedStyle(document.querySelector("#wordCall")).animationDuration,
    wordCallOpacity: Number.parseFloat(getComputedStyle(document.querySelector("#wordCall")).opacity),
    reduceMotion: window.KanaGunmaPrototype.state.settings.reduceMotion,
    reduceMotionBodyClass: document.body.classList.contains("reduce-motion"),
    wordCallMatchesReduceSelector: document.querySelector("#wordCall").matches("body.reduce-motion .word-call.is-visible"),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    soundEvents: window.KanaGunmaPrototype.state.soundEvents.slice(),
    matches: window.KanaGunmaPrototype.state.runStats.matches,
    maxCombo: window.KanaGunmaPrototype.state.maxCombo,
    packStone: window.KanaGunmaPrototype.state.packStone,
    dailyMission: window.KanaGunmaPrototype.state.dailyMission,
    dailyStreak: window.KanaGunmaPrototype.state.dailyStreak,
    streakText: document.querySelector("#menuStreakText").textContent,
    scoreEffects: window.KanaGunmaPrototype.state.effects
      .filter((effect) => effect.type === "score")
      .map((effect) => ({ lane: effect.lane || "", x: Math.round(effect.x), y: Math.round(effect.y) })),
  }));

  const dailyMissionCompletionResult = await page.evaluate(() => {
    const app = window.KanaGunmaPrototype;
    const state = app.state;
    const mission = app.currentDailyMissionDefinition();
    state.packStone = 0;
    state.lastDailyStreakBonus = false;
    state.dailyStreak = {
      count: 2,
      lastClaimDateKey: app.previousDateKey(app.todayDateKey()),
    };
    state.dailyMission = {
      dateKey: app.todayDateKey(),
      id: mission.id,
      progress: Math.max(0, mission.target - 1),
      claimed: false,
    };
    const rewarded =
      mission.type === "matches"
        ? app.addDailyMissionProgress(1)
        : app.updateDailyMissionFromRun({ score: mission.target, matches: mission.target, practice: false });
    app.showScreen("menu");
    const saved = JSON.parse(localStorage.getItem("kana-gunmatsuri-save-v1"));
    return {
      mission,
      rewarded,
      packStone: state.packStone,
      dailyMission: state.dailyMission,
      savedDailyMission: saved.dailyMission,
      dailyStreak: state.dailyStreak,
      savedDailyStreak: saved.dailyStreak,
      lastDailyStreakBonus: state.lastDailyStreakBonus,
      progress: document.querySelector("#menuDailyProgress").textContent,
      reward: document.querySelector("#menuDailyReward").textContent,
      streakText: document.querySelector("#menuStreakText").textContent,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  await page.evaluate(() => {
    const app = window.KanaGunmaPrototype;
    app.showScreen("game");
    const state = window.KanaGunmaPrototype.state;
    const card = window.KANAGUNMA_DATA.cards.find((item) => item.id === "basic-daruma");
    const letters = Array.from(card.readingKana);
    const positions = [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 6],
      [4, 6],
      [5, 6],
    ];
    state.score = 0;
    state.running = true;
    state.paused = false;
    state.timeLeft = Math.max(state.timeLeft || 0, 30);
    state.maxCombo = 0;
    state.comboCount = 0;
    state.comboTimer = 0;
    state.sauceBurstCharges = 0;
    state.specialCooldown = 10;
    state.autoResolveQueued = true;
    state.autoScanTimer = 0.01;
    state.runStats.matches = 0;
    state.runStats.bestWord = "";
    state.runStats.bestWordCardId = "";
    state.runStats.bestWordScore = 0;
    state.runStats.bestWordLength = 0;
    state.runStats.cardClears = {};
    state.tiles = positions.map(([col, row], index) => ({
      id: 9000 + index,
      kind: "kana",
      char: letters[index % letters.length],
      cardId: card.id,
      col,
      row,
      x: 70 + col * 48,
      y: 120 + row * 48,
    }));
  });
  await page.waitForFunction(() => window.KanaGunmaPrototype.state.runStats.matches >= 2, null, { timeout: 1000 });
  const simultaneousMatchResult = await page.evaluate(() => ({
    score: window.KanaGunmaPrototype.state.score,
    matches: window.KanaGunmaPrototype.state.runStats.matches,
    maxCombo: window.KanaGunmaPrototype.state.maxCombo,
    tiles: window.KanaGunmaPrototype.state.tiles.length,
    clearEvents: window.KanaGunmaPrototype.state.telemetryEvents
      .filter((event) => event.type === "word_clear")
      .slice(-2)
      .map((event) => event.data.word),
    bottomRightGone: !window.KanaGunmaPrototype.state.tiles.some((tile) => tile.id >= 9003 && tile.id <= 9005),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.screenshot({ path: resultActionsScreenshotPath, fullPage: true });

  const finishSetupState = await page.evaluate(() => {
    const state = window.KanaGunmaPrototype.state;
    const dateKey = window.KanaGunmaPrototype.todayDateKey();
    const targetScore = window.KanaGunmaPrototype.dailyScoreTarget.targetScore;
    state.dailyScoreTarget = {
      dateKey,
      bestScore: 0,
      claimed: false,
    };
    const progress = window.KanaGunmaPrototype.playerRankProgress();
    const remainingXp = Math.max(1, progress.nextXp - progress.currentXp);
    state.playerXp = Math.max(0, state.playerXp + Math.max(0, remainingXp - 8));
    const preparedProgress = window.KanaGunmaPrototype.playerRankProgress();
    state.score = Math.max(state.score, targetScore);
    state.timeLeft = 0.001;
    return {
      playerXpBeforeRun: state.playerXp,
      playerRankBeforeRun: preparedProgress.rank,
    };
  });
  await page.waitForTimeout(120);
  const finishResult = await page.evaluate(() => ({
    visible: !document.querySelector("#finishCard").hidden,
    wordCallVisible: document.querySelector("#wordCall").classList.contains("is-visible"),
    wordCallHidden: document.querySelector("#wordCall").getAttribute("aria-hidden"),
    streamOverlayExists: Boolean(document.querySelector("#streamStrip")),
    rank: document.querySelector("#finishRank").textContent,
    bestText: document.querySelector("#finishBestText").textContent,
    words: document.querySelector("#finishWords").textContent,
    bestWord: document.querySelector("#finishBestWord").textContent,
    learnNoteExists: Boolean(document.querySelector("#finishLearnNote")),
    nextChallengeExists: Boolean(document.querySelector("#finishNextChallenge")),
    progressRecapExists: Boolean(document.querySelector("#finishProgressRecap")),
    rewardSummaryText: document.querySelector("#finishRewardText").textContent,
    xpSummaryText: document.querySelector("#finishXpText")?.textContent || "",
    xpSummaryRankUp: document.querySelector("#finishXpSummary")?.classList.contains("is-rank-up") || false,
    xpSummaryBarWidth: document.querySelector("#finishXpBar")?.style.width || "",
    rewardSummaryEarned: document.querySelector("#finishRewardSummary").classList.contains("is-earned"),
    rewardSummaryPractice: document.querySelector("#finishRewardSummary").classList.contains("is-practice"),
    rewardSummaryRect: (() => {
      const rect = document.querySelector("#finishRewardSummary").getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height) };
    })(),
    feedbackExists: Boolean(document.querySelector("#finishFeedback")),
    feedbackButtonCount: document.querySelectorAll("[data-quick-feedback]").length,
    streamRecapExists: Boolean(document.querySelector("#finishStreamRecap")),
    streamSpotlightExists: Boolean(document.querySelector("#finishSpotlight")),
    streamResultExists: Boolean(document.querySelector("#streamResultCard")),
    shareExists: Boolean(document.querySelector("#finishShare")),
    imageExists: Boolean(document.querySelector("#finishImage")),
    guideExists: Boolean(document.querySelector("#finishGuide")),
    homeText: document.querySelector("#finishHome").textContent,
    deckText: document.querySelector("#finishDeck").textContent,
    restartDisabled: document.querySelector("#finishRestart").disabled,
    actionButtonCount: document.querySelectorAll("#finishCard .finish-actions button").length,
    cardRect: (() => {
      const rect = document.querySelector("#finishCard").getBoundingClientRect();
      const stageRect = document.querySelector("#gameCanvas").getBoundingClientRect();
      return {
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        height: Math.round(rect.height),
        stageTop: Math.round(stageRect.top),
        stageBottom: Math.round(stageRect.bottom),
      };
    })(),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    bestScore: window.KanaGunmaPrototype.state.bestScore,
    seasonRecords: window.KanaGunmaPrototype.state.seasonRecords,
    completedRuns: window.KanaGunmaPrototype.state.completedRuns,
    playerXp: window.KanaGunmaPrototype.state.playerXp,
    playerRank: window.KanaGunmaPrototype.playerRankProgress?.().rank,
    dailyScoreTarget: window.KanaGunmaPrototype.state.dailyScoreTarget,
    scoreGoalProgress: document.querySelector("#menuScoreGoalProgress").textContent,
    scoreGoalReward: document.querySelector("#menuScoreGoalReward").textContent,
    weeklyChallenge: window.KanaGunmaPrototype.state.weeklyChallenge,
    lastResult: window.KanaGunmaPrototype.state.lastResult,
    saved: JSON.parse(localStorage.getItem("kana-gunmatsuri-save-v1")),
  }));
  finishResult.playerXpBeforeRun = finishSetupState.playerXpBeforeRun;
  finishResult.playerRankBeforeRun = finishSetupState.playerRankBeforeRun;
  await page.locator("#finishDeck").click();
  await page.waitForTimeout(80);
  const resultDeckState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    deckVisible: !document.querySelector("#deckScreen").hidden,
    guideTitle: document.querySelector("#wordGuideTitle").textContent,
    guideMeta: document.querySelector("#wordGuideMeta").textContent,
    guideAction: document.querySelector("#wordGuideAction").textContent,
    lastResult: window.KanaGunmaPrototype.state.lastResult,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.evaluate(() => {
    window.KanaGunmaPrototype.showScreen("game");
    document.querySelector("#finishCard").hidden = false;
  });
  await page.waitForTimeout(80);
  const resultDeckReturnState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    finishVisible: !document.querySelector("#finishCard").hidden,
    running: window.KanaGunmaPrototype.state.running,
    deckButtonExists: Boolean(document.querySelector("#finishDeck")),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.screenshot({ path: resultActionsScreenshotPath, fullPage: true });
  await page.locator("#finishHome").click();
  await page.waitForTimeout(80);
  const finishHomeResult = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    running: window.KanaGunmaPrototype.state.running,
    finishHidden: document.querySelector("#finishCard").hidden,
    lastResultExists: Boolean(document.querySelector("#lastResultPanel")),
    bestChipExists: Boolean(document.querySelector("#menuBestText")),
    dailyGiftModalHidden: document.querySelector("#dailyGiftModal").hidden,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));

  await page.reload();
  await page.waitForSelector("#titleStartButton");
  await page.locator("#titleStartButton").click();
  await page.waitForTimeout(80);
  const restoredHomeLastResultState = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("kana-gunmatsuri-save-v1"));
    return {
      screen: window.KanaGunmaPrototype.state.currentScreen,
      stateLastResult: window.KanaGunmaPrototype.state.lastResult,
      savedLastResult: saved.lastResult,
      panelExists: Boolean(document.querySelector("#lastResultPanel")),
      bestChipExists: Boolean(document.querySelector("#menuBestText")),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  const restoredGiftModalState = await page.evaluate(() => ({
    visible: !document.querySelector("#dailyGiftModal").hidden,
    text: document.querySelector("#dailyGiftModal").textContent,
    completedRuns: window.KanaGunmaPrototype.state.completedRuns,
    claimed: window.KanaGunmaPrototype.state.dailyGift.claimed,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.locator("#dailyGiftModalLater").click();
  await page.waitForTimeout(60);
  await page.locator('.menu-screen [data-nav-target="missions"]').click();
  await page.waitForTimeout(80);
  const postRunDailyWordState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    hidden: document.querySelector("#dailyWordPanel").hidden,
    panelScreen: document.querySelector("#dailyWordPanel").closest("[data-app-screen]")?.dataset.appScreen,
    dailyWordOnMenu: document.querySelectorAll("#menuScreen #dailyWordPanel").length,
    name: document.querySelector("#menuDailyWordName").textContent,
    note: document.querySelector("#menuDailyWordNote").textContent,
    prompt: document.querySelector("#menuDailyWordPrompt").textContent,
    buttonText: document.querySelector("#dailyWordGuideButton").textContent,
    rect: (() => {
      const rect = document.querySelector("#dailyWordPanel").getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height) };
    })(),
    dailyWordRect: (() => {
      const rect = document.querySelector("#dailyWordPanel").getBoundingClientRect();
      return { top: Math.round(rect.top), bottom: Math.round(rect.bottom), height: Math.round(rect.height) };
    })(),
    buttonRect: (() => {
      const rect = document.querySelector("#dailyWordGuideButton").getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height) };
    })(),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.locator("#dailyWordGuideButton").click();
  await page.waitForTimeout(80);
  const dailyWordGuideState = await page.evaluate((dailyWordName) => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    guideCardId: window.KanaGunmaPrototype.state.guideCardId,
    guideTitle: document.querySelector("#wordGuideTitle").textContent,
    guideMeta: document.querySelector("#wordGuideMeta").textContent,
    guideNote: document.querySelector("#wordGuideNote").textContent,
    guideStatus: document.querySelector("#wordGuideStatus").textContent,
    guideText: document.querySelector("#wordGuidePanel").textContent,
    expectedName: dailyWordName,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }), postRunDailyWordState.name);
  await page.evaluate(() => window.KanaGunmaPrototype.showScreen("menu"));
  await page.waitForTimeout(80);
  const dailyGiftBeforeClaimState = await page.evaluate(() => ({
    hidden: document.querySelector("#dailyGiftPanel").hidden,
    modalHidden: document.querySelector("#dailyGiftModal").hidden,
    dailyGift: window.KanaGunmaPrototype.state.dailyGift,
    packStone: window.KanaGunmaPrototype.state.packStone,
    buttonDisabled: document.querySelector("#dailyGiftButton").disabled,
    panelClaimed: document.querySelector("#dailyGiftPanel").classList.contains("is-claimed"),
    title: document.querySelector("#menuDailyGiftTitle").textContent,
    reward: document.querySelector("#menuDailyGiftReward").textContent,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.reload();
  await page.waitForSelector("#titleStartButton");
  await page.locator("#titleStartButton").click();
  await page.waitForTimeout(80);
  const returningGiftReadyState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    completedRuns: window.KanaGunmaPrototype.state.completedRuns,
    claimed: window.KanaGunmaPrototype.state.dailyGift.claimed,
    modalHidden: document.querySelector("#dailyGiftModal").hidden,
    modalText: document.querySelector("#dailyGiftModal").textContent,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.locator("#dailyGiftModalClaim").click();
  await page.waitForTimeout(80);
  const dailyGiftClaimState = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("kana-gunmatsuri-save-v1"));
    return {
      dailyGift: window.KanaGunmaPrototype.state.dailyGift,
      savedDailyGift: saved.dailyGift,
      packStone: window.KanaGunmaPrototype.state.packStone,
      savedPackStone: saved.packStone,
      modalHidden: document.querySelector("#dailyGiftModal").hidden,
      buttonDisabled: document.querySelector("#dailyGiftButton").disabled,
      panelClaimed: document.querySelector("#dailyGiftPanel").classList.contains("is-claimed"),
      title: document.querySelector("#menuDailyGiftTitle").textContent,
      reward: document.querySelector("#menuDailyGiftReward").textContent,
      note: document.querySelector("#menuDailyGiftNote").textContent,
      buttonText: document.querySelector("#dailyGiftButton").textContent,
      toast: document.querySelector("#toast").textContent,
      telemetryHasGift: window.KanaGunmaPrototype.state.telemetryEvents.some((event) => event.type === "daily_gift_claim"),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  const normalHomeClaimedState = await page.evaluate(() => {
    const state = window.KanaGunmaPrototype.state;
    state.completedRuns = window.KanaGunmaPrototype.warmupRuns;
    window.KanaGunmaPrototype.showScreen("menu");
    return {
      screen: state.currentScreen,
      completedRuns: state.completedRuns,
      warmupRuns: window.KanaGunmaPrototype.warmupRuns,
      warmupClass: document.querySelector(".phone").classList.contains("is-warmup-session"),
      dailyClaimedClass: document.querySelector("#dailyPanel").classList.contains("is-claimed"),
      scoreClaimedClass: document.querySelector("#scoreGoalPanel").classList.contains("is-claimed"),
      dailyTitle: document.querySelector("#menuDailyTitle").textContent,
      dailyReward: document.querySelector("#menuDailyReward").textContent,
      scoreGoalTitle: document.querySelector("#menuScoreGoalTitle").textContent,
      scoreGoalReward: document.querySelector("#menuScoreGoalReward").textContent,
      staminaEmptyHidden: document.querySelector("#staminaEmptyPanel").hidden,
      staminaEmptyVisible: getComputedStyle(document.querySelector("#staminaEmptyPanel")).display !== "none",
      missionSummaryExists: Boolean(document.querySelector("#menuMissionSummary")),
      missionButtonLabel: document.querySelector('.menu-button[data-nav-target="missions"] strong')?.textContent,
      missionPanelsOnMenu: document.querySelectorAll("#menuScreen #dailyPanel, #menuScreen #scoreGoalPanel, #menuScreen #weeklyChallengePanel").length,
      weeklyHidden: document.querySelector("#weeklyChallengePanel").hidden,
      weeklyTitle: document.querySelector("#menuWeeklyTitle").textContent,
      weeklyProgress: document.querySelector("#menuWeeklyProgress").textContent,
      weeklyReward: document.querySelector("#menuWeeklyReward").textContent,
      weeklyNote: document.querySelector("#menuWeeklyNote").textContent,
      weeklyBarWidth: document.querySelector("#menuWeeklyBar").style.width,
      weeklyMeterVisible: getComputedStyle(document.querySelector(".weekly-challenge-meter")).display !== "none",
      dailyStreakVisible: getComputedStyle(document.querySelector(".daily-streak-chip")).display !== "none",
      scoreGoalMeterVisible: getComputedStyle(document.querySelector(".score-goal-meter")).display !== "none",
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  await page.screenshot({ path: normalHomeClaimedScreenshotPath, fullPage: true });
  await page.locator('.menu-screen [data-nav-target="missions"]').click();
  await page.waitForTimeout(80);
  const missionUnlockedState = await page.evaluate(() => ({
    screen: window.KanaGunmaPrototype.state.currentScreen,
    missionsVisible: !document.querySelector("#missionsScreen").hidden,
    lockedHidden: document.querySelector("#missionsLockedPanel").hidden,
    dailyHidden: document.querySelector("#dailyPanel").hidden,
    scoreGoalHidden: document.querySelector("#scoreGoalPanel").hidden,
    weeklyHidden: document.querySelector("#weeklyChallengePanel").hidden,
    dailyClaimedClass: document.querySelector("#dailyPanel").classList.contains("is-claimed"),
    scoreClaimedClass: document.querySelector("#scoreGoalPanel").classList.contains("is-claimed"),
    weeklyTitle: document.querySelector("#menuWeeklyTitle").textContent,
    weeklyProgress: document.querySelector("#menuWeeklyProgress").textContent,
    weeklyReward: document.querySelector("#menuWeeklyReward").textContent,
    weeklyNote: document.querySelector("#menuWeeklyNote").textContent,
    weeklyMeterVisible: getComputedStyle(document.querySelector(".weekly-challenge-meter")).display !== "none",
    dailyStreakVisible: getComputedStyle(document.querySelector(".daily-streak-chip")).display !== "none",
    scoreGoalMeterVisible: getComputedStyle(document.querySelector(".score-goal-meter")).display !== "none",
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  await page.screenshot({ path: missionsScreenshotPath, fullPage: true });
  await page.locator('#missionsScreen [data-nav-target="menu"]').click();
  await page.waitForTimeout(50);

  const weeklyChallengeResult = await page.evaluate(() => {
    const app = window.KanaGunmaPrototype;
    const state = window.KanaGunmaPrototype.state;
    const mission = app.currentWeeklyMissionDefinition();
    const target = mission.target;
    state.packStone = 0;
    state.weeklyChallenge = {
      weekKey: app.currentWeekKey(),
      id: mission.id,
      progress: target - 1,
      claimed: false,
    };
    const rewarded = window.KanaGunmaPrototype.addWeeklyChallengeProgress(1);
    window.KanaGunmaPrototype.showScreen("menu");
    const saved = JSON.parse(localStorage.getItem("kana-gunmatsuri-save-v1"));
    return {
      rewarded,
      mission,
      target,
      packStone: state.packStone,
      weeklyChallenge: state.weeklyChallenge,
      savedWeeklyChallenge: saved.weeklyChallenge,
      savedPackStone: saved.packStone,
      hidden: document.querySelector("#weeklyChallengePanel").hidden,
      claimedClass: document.querySelector("#weeklyChallengePanel").classList.contains("is-claimed"),
      title: document.querySelector("#menuWeeklyTitle").textContent,
      progress: document.querySelector("#menuWeeklyProgress").textContent,
      expectedProgress: app.formatMissionProgress(target, target, mission),
      reward: document.querySelector("#menuWeeklyReward").textContent,
      barWidth: document.querySelector("#menuWeeklyBar").style.width,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  const staminaEmptyHomeState = await page.evaluate(() => {
    const state = window.KanaGunmaPrototype.state;
    state.running = false;
    state.practiceMode = false;
    state.tutorialComplete = true;
    state.completedRuns = window.KanaGunmaPrototype.warmupRuns;
    state.stamina = 0;
    state.staminaUpdatedAt = Date.now();
    window.KanaGunmaPrototype.showScreen("menu");
    const panel = document.querySelector("#staminaEmptyPanel");
    const practiceButton = panel.querySelector("[data-nav-target='game']");
    return {
      hidden: panel.hidden,
      timer: document.querySelector("#menuStaminaEmptyTimer").textContent,
      note: document.querySelector("#menuStaminaEmptyNote").textContent,
      buttonText: practiceButton.textContent,
      buttonRect: practiceButton.getBoundingClientRect().toJSON(),
      staminaText: document.querySelector("#menuStaminaText").textContent,
      staminaPips: Array.from(document.querySelectorAll("#menuStaminaPips .stamina-pip")).map((pip) => !pip.classList.contains("is-empty")),
      rect: panel.getBoundingClientRect().toJSON(),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  await page.screenshot({ path: staminaEmptyHomeScreenshotPath, fullPage: true });

  const staminaRecoveryResult = await page.evaluate(() => {
    const state = window.KanaGunmaPrototype.state;
    state.stamina = window.KanaGunmaPrototype.staminaMax - 1;
    state.staminaUpdatedAt = Date.now() - (window.KanaGunmaPrototype.staminaRecoverySeconds + 2) * 1000;
    const recovered = window.KanaGunmaPrototype.recoverStamina(Date.now(), false);
    return {
      recovered,
      stamina: state.stamina,
      countdown: window.KanaGunmaPrototype.formatStaminaCountdown(),
    };
  });

  const staminaAdRecoveryResult = await page.evaluate(() => {
    const state = window.KanaGunmaPrototype.state;
    state.running = false;
    state.stamina = window.KanaGunmaPrototype.staminaMax - 2;
    state.staminaUpdatedAt = Date.now();
    const recovered = window.KanaGunmaPrototype.recoverStaminaByAd();
    const saved = JSON.parse(localStorage.getItem("kana-gunmatsuri-save-v1"));
    return {
      recovered,
      stamina: state.stamina,
      savedStamina: saved.stamina,
      staminaPips: Array.from(document.querySelectorAll("#menuStaminaPips .stamina-pip")).map((pip) => !pip.classList.contains("is-empty")),
      buttonDisabled: document.querySelector("#staminaAdButton").disabled,
      buttonText: document.querySelector("#staminaAdButton").textContent,
      toast: document.querySelector("#toast").textContent,
    };
  });

  const staminaPracticeResult = await page.evaluate(() => {
    const app = window.KanaGunmaPrototype;
    const state = window.KanaGunmaPrototype.state;
    const dateKey = app.todayDateKey();
    const dailyMission = app.currentDailyMissionDefinition();
    const weeklyMission = app.currentWeeklyMissionDefinition();
    app.showScreen("game");
    state.running = false;
    state.practiceMode = false;
    state.stamina = 0;
    state.staminaUpdatedAt = Date.now();
    state.packStone = 0;
    state.bestScore = 1234;
    state.completedRuns = 7;
    state.dailyMission = { dateKey, id: dailyMission.id, progress: 0, claimed: false };
    state.dailyScoreTarget = { dateKey, bestScore: 0, claimed: false };
    state.weeklyChallenge = {
      weekKey: app.currentWeekKey(),
      id: weeklyMission.id,
      progress: 2,
      claimed: false,
    };
    const started = window.KanaGunmaPrototype.startRun();
    const runningLabel = document.querySelector("#startButtonText").textContent;
    state.score = 99999;
    state.runStats = {
      matches: 3,
      bestWord: "ぐんまけん",
      bestWordCardId: "basic-gunma-ken",
      bestWordScore: 3750,
      bestWordLength: 5,
    };
    window.KanaGunmaPrototype.finishRun();
    const saved = JSON.parse(localStorage.getItem("kana-gunmatsuri-save-v1"));
    return {
      started,
      running: state.running,
      practiceMode: state.practiceMode,
      stamina: state.stamina,
      startDisabled: document.querySelector("#startButton").disabled,
      startLabel: document.querySelector("#startButtonText").textContent,
      runningLabel,
      staminaPips: Array.from(document.querySelectorAll("#menuStaminaPips .stamina-pip")).map((pip) => !pip.classList.contains("is-empty")),
      restartDisabled: document.querySelector("#finishRestart").disabled,
      restartText: document.querySelector("#finishRestart").textContent,
      packStone: state.packStone,
      bestScore: state.bestScore,
      completedRuns: state.completedRuns,
      dailyMission: state.dailyMission,
      dailyScoreTarget: state.dailyScoreTarget,
      weeklyChallenge: state.weeklyChallenge,
      lastResultPractice: state.lastResult?.practice,
      finishRank: document.querySelector("#finishRank").textContent,
      finishBestText: document.querySelector("#finishBestText").textContent,
      finishNextChallengeExists: Boolean(document.querySelector("#finishNextChallenge")),
      finishProgressRecapExists: Boolean(document.querySelector("#finishProgressRecap")),
      finishRewardText: document.querySelector("#finishRewardText").textContent,
      finishRewardPractice: document.querySelector("#finishRewardSummary").classList.contains("is-practice"),
      shareText: window.KanaGunmaPrototype.buildShareText(state.lastResult),
      savedStamina: saved.stamina,
      savedPackStone: saved.packStone,
      savedWeeklyChallenge: saved.weeklyChallenge,
      savedBestScore: saved.bestScore,
      savedCompletedRuns: saved.completedRuns,
      toast: document.querySelector("#toast").textContent,
    };
  });
  await page.screenshot({ path: practiceResultScreenshotPath, fullPage: true });

  const quitRunResult = await page.evaluate(() => {
    const state = window.KanaGunmaPrototype.state;
    state.tutorialComplete = true;
    state.completedRuns = 7;
    state.running = false;
    state.practiceMode = false;
    state.paused = false;
    state.stamina = window.KanaGunmaPrototype.staminaMax;
    state.staminaUpdatedAt = Date.now();
    window.KanaGunmaPrototype.showScreen("game");
    const started = window.KanaGunmaPrototype.startRun();
    const staminaAfterStart = state.stamina;
    const paused = window.KanaGunmaPrototype.pauseRun("manual");
    const quitted = window.KanaGunmaPrototype.quitRun();
    const saved = JSON.parse(localStorage.getItem("kana-gunmatsuri-save-v1"));
    return {
      started,
      staminaAfterStart,
      paused,
      quitted,
      screen: state.currentScreen,
      running: state.running,
      pausedState: state.paused,
      finishHidden: document.querySelector("#finishCard").hidden,
      pauseHidden: document.querySelector("#pauseCard").hidden,
      stamina: state.stamina,
      savedStamina: saved.stamina,
      hasQuitEvent: state.telemetryEvents.some((event) => event.type === "run_quit"),
      latestEvent: state.telemetryEvents[state.telemetryEvents.length - 1] || null,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  await browser.close();

  const blockingErrors = errors.filter((message) => !isOptionalRankingConnectionError(message));
  if (blockingErrors.length > 0) {
    throw new Error(`Browser errors:\n${blockingErrors.join("\n")}`);
  }
  if (
    titleState.screen !== "title" ||
    !titleState.titleVisible ||
    !titleState.menuHidden ||
    titleState.titleCardCount !== 3 ||
    !titleState.titleCardIds.includes("basic-gunma-ken") ||
    !titleState.titleCardIds.includes("basic-daruma") ||
    !titleState.titleCardIds.includes("basic-akagi-san") ||
    titleState.titleCardArtCount !== 3 ||
    !titleState.titleCardAnimationNames.every((name) => name === "none") ||
    titleState.logoCount < 1 ||
    titleState.titleLogoAnimationName !== "none" ||
    titleState.titleLogoAfterContent !== "none" ||
    !titleState.titleLogoVisible ||
    titleState.hasModeChips ||
    titleState.titleButtonRect.width < titleState.titleScreenRect.width - 4 ||
    titleState.titleButtonRect.height < titleState.titleScreenRect.height - 4 ||
    titleState.horizontalOverflow
  ) {
    throw new Error(`Title screen did not initialize correctly: ${JSON.stringify(titleState)}`);
  }
  if (
    menuState.screen !== "menu" ||
    !menuState.menuVisible ||
    !["game", "purchase", "deck", "pack", "missions", "settings", "ranking"].every((target) => menuState.menuNavTargets.includes(target)) ||
    JSON.stringify(menuState.menuMainTargets) !== JSON.stringify(["deck", "pack", "game", "missions", "ranking"]) ||
    menuState.menuMainButtonCount !== 5 ||
    !menuState.settingsInHeader ||
    !menuState.profileButtonExists ||
    !menuState.profileButtonLabel.includes("編集") ||
    !menuState.profileModalHidden ||
    menuState.playerName !== "あなた" ||
    !menuState.playerRank.includes("ランク") ||
    !menuState.playerTitle ||
    !menuState.playerXpText.includes("EXP") ||
    !menuState.playerXpBarWidth.endsWith("%") ||
    menuState.settingsButtonRect.width < 28 ||
    menuState.settingsButtonRect.height < 28 ||
    menuState.menuDeckCount !== 3 ||
    !menuState.firstPlayVisible ||
    !menuState.firstPlayText.includes("START GUIDE") ||
    !menuState.firstPlayText.includes("かなパネル") ||
    !menuState.homePlayText.includes("ゲーム") ||
    menuState.homePlayTarget !== "game" ||
    menuState.homePlayRect.width < 280 ||
    menuState.homePlayRect.height < 70 ||
    menuState.seasonRankingTarget !== "ranking" ||
    !menuState.seasonRankingText.includes("シーズン1") ||
    !menuState.seasonRankingText.includes("ランキング") ||
    !menuState.seasonPeriod.includes("2026/06/12") ||
    menuState.seasonRank !== "未参加" ||
    menuState.seasonBest !== "0" ||
    menuState.purchaseButtonText ||
    menuState.lastResultExists ||
    menuState.bestChipExists ||
    !menuState.staminaEmptyHidden ||
    menuState.staminaEmptyVisible ||
    !menuState.primaryGameVisible ||
    !menuState.dailyWordHidden ||
    !menuState.dailyWordButtonText.includes("GUIDE") ||
    menuState.dailyWordPanelScreen !== "missions" ||
    menuState.dailyWordOnMenu !== 0 ||
    !menuState.dailyGiftHidden ||
    !menuState.dailyGiftButtonText.includes("CLAIM") ||
    menuState.dailyGiftModalVisible ||
    !menuState.adBannerVisible ||
    !menuState.adBannerText.includes("バナー広告枠") ||
    menuState.warmupClass ||
    !menuState.dailyHidden ||
    !menuState.scoreGoalHidden ||
    !["ぐんまけん", "だるま", "あかぎさん"].every((name) => menuState.menuDeckNames.includes(name)) ||
    !menuState.dailyTitle ||
    menuState.dailyProgress !== menuState.dailyProgressExpected ||
    !menuState.dailyReward.includes("Gだるま+1") ||
    !menuState.streakText.includes("連続0日") ||
    !menuState.scoreGoalTitle.includes("今日のスコア目標") ||
    menuState.scoreGoalProgress !== "0 / 5,000" ||
    !menuState.scoreGoalReward.includes("Gだるま+1") ||
    menuState.scoreGoalBarWidth !== "0%" ||
    !menuState.weeklyHidden ||
    menuState.weeklyProgress !== menuState.weeklyProgressExpected ||
    !menuState.weeklyReward.includes("Gだるま+10") ||
    menuState.weeklyBarWidth !== "0%" ||
    menuState.missionSummaryExists ||
    menuState.missionButtonLabel !== "ミッション" ||
    menuState.missionPanelsOnMenu !== 0 ||
    menuState.missionPanelScreen !== "missions" ||
    !menuState.staminaText.includes("スタミナ 5/5") ||
    menuState.stoneText.trim() !== "Gだるま 0" ||
    !menuState.stoneLabel.includes("Gだるま 0") ||
    !menuState.stoneDarumaIcon ||
    !menuState.stonePlusIcon.includes("+") ||
    menuState.stoneRect.height < 32 ||
    !menuState.stoneHitTargets.every((id) => id === "menuStoneText") ||
    menuState.staminaPips.length !== DATA.stamina.max ||
    !menuState.staminaPips.every(Boolean) ||
    !menuState.staminaAdDisabled ||
    !menuState.staminaAdText.includes("TEST") ||
    !menuState.staminaAdText.includes("満タン") ||
    menuState.streamButtonExists ||
    menuState.streamModeToggleExists ||
    menuState.streamOverlayExists ||
    menuState.streamResultExists ||
    menuState.statusRect.top < menuState.headerRect.top ||
    menuState.statusRect.bottom > menuState.headerRect.bottom ||
    menuState.statusRect.bottom > menuState.deckPanelRect.top ||
    menuState.deckPanelRect.bottom > menuState.menuGridRect.top ||
    menuState.statusRect.height < 34 ||
    menuState.menuGridRect.height > 150 ||
    menuState.horizontalOverflow
  ) {
    throw new Error(`Top menu navigation is incomplete or first-login gift is interrupting first play: ${JSON.stringify(menuState)}`);
  }
  if (
    !profileModalState.visible ||
    !profileModalState.title.includes("プロフィール") ||
    profileModalState.nameValue !== "あなた" ||
    !profileModalState.selectedTitle.includes("上毛見習い") ||
    !profileModalState.selectedNote ||
    profileModalState.optionCount < 5 ||
    profileModalState.lockedCount < 1 ||
    !profileModalState.noteHidden ||
    profileModalState.note.trim() ||
    profileModalState.horizontalOverflow ||
    !profileModalClosedState.hidden ||
    profileModalClosedState.playerName !== "あなた" ||
    profileModalClosedState.horizontalOverflow ||
    permanentTitleState.selectedTitle !== "からっ風ランカー" ||
    !permanentTitleState.selectedNote.includes("限定称号") ||
    permanentTitleState.selectedLocked ||
    !permanentTitleState.selectedLimited ||
    permanentTitleState.optionCount <= profileModalState.optionCount
  ) {
    throw new Error(`Profile edit modal failed: ${JSON.stringify({ profileModalState, profileModalClosedState, permanentTitleState })}`);
  }
  if (
    purchaseScreenState.screen !== "purchase" ||
    !purchaseScreenState.visible ||
    !purchaseScreenState.balance.includes("Gだるま 0") ||
    !purchaseScreenState.staminaText.includes("5/5") ||
    !purchaseScreenState.recoverText.includes("満タン") ||
    !purchaseScreenState.recoverDisabled ||
    purchaseScreenState.bundleCount < 4 ||
    !purchaseScreenState.bundleTexts.some((text) => text.includes("Gだるま12") && text.includes("240円")) ||
    !purchaseScreenState.bundleTexts.some((text) => text.includes("Gだるま260")) ||
    purchaseScreenState.bundleTexts.some((text) => /おためし|まとめ買い|人気|大入り/.test(text)) ||
    !purchaseScreenState.noticeText.includes("購入モック") ||
    purchaseScreenState.horizontalOverflow ||
    purchaseGrantState.packStone !== 12 ||
    purchaseGrantState.savedPackStone !== 12 ||
    !purchaseGrantState.balance.includes("Gだるま 12") ||
    !purchaseGrantState.toast.includes("Gだるま+12") ||
    !purchaseGrantState.hasPurchaseEvent ||
    purchaseGrantState.horizontalOverflow ||
    purchaseRecoverState.stamina !== DATA.stamina.max ||
    purchaseRecoverState.savedStamina !== DATA.stamina.max ||
    purchaseRecoverState.packStone !== 0 ||
    purchaseRecoverState.savedPackStone !== 0 ||
    !purchaseRecoverState.balance.includes("Gだるま 0") ||
    !purchaseRecoverState.staminaText.includes(`${DATA.stamina.max}/${DATA.stamina.max}`) ||
    !purchaseRecoverState.recoverDisabled ||
    !purchaseRecoverState.toast.includes("スタミナ全回復") ||
    !purchaseRecoverState.hasRecoverEvent ||
    purchaseRecoverState.horizontalOverflow
  ) {
    throw new Error(
      `G purchase and stamina recovery flow failed: ${JSON.stringify({
        purchaseScreenState,
        purchaseGrantState,
        purchaseRecoverState,
      })}`,
    );
  }
  if (
    rankingScreenState.screen !== "ranking" ||
    !rankingScreenState.visible ||
    !rankingScreenState.period.includes("2026/06/12") ||
    !rankingScreenState.period.includes("2026/08/31") ||
    !rankingScreenState.qualifier.includes("最高スコア") ||
    !rankingScreenState.status.includes("シーズン通算") ||
    !rankingScreenState.syncStatus ||
    rankingScreenState.mainTabCount !== 2 ||
    rankingScreenState.activeMainTab !== "season" ||
    !rankingScreenState.dailyPanelHidden ||
    rankingScreenState.seasonPanelHidden ||
    rankingScreenState.seasonRecordTabCount !== 2 ||
    rankingScreenState.activeSeasonRecordTab !== "current" ||
    rankingScreenState.seasonCurrentHidden ||
    !rankingScreenState.seasonHistoryHidden ||
    !rankingScreenState.dailyTitle.includes("デイリー") ||
    !rankingScreenState.dailyDate.includes("今日") ||
    !rankingScreenState.dailyRewardStatus.includes("Gだるま+3") ||
    !rankingScreenState.dailyTodayActive ||
    rankingScreenState.dailyOwnRank !== "未参加" ||
    !rankingScreenState.dailyOwnBest.includes("0") ||
    rankingScreenState.dailyRowCount < 1 ||
    rankingScreenState.dailyRowCount > 11 ||
    !rankingScreenState.dailyHasPlayerRow ||
    !rankingScreenState.dailyListText.includes("あなた") ||
    rankingScreenState.stageTabCount !== 0 ||
    rankingScreenState.activeStage !== "" ||
    !rankingScreenState.finalHidden ||
    rankingScreenState.finalDisplay !== "none" ||
    rankingScreenState.ownRank !== "未参加" ||
    !rankingScreenState.ownBest.includes("0") ||
    rankingScreenState.ownTitle !== "上毛見習い" ||
    rankingScreenState.ownTitleNote !== "通常称号" ||
    rankingScreenState.rowCount < 1 ||
    rankingScreenState.titleChipCount !== rankingScreenState.rowCount ||
    !rankingScreenState.hasPlayerRow ||
    !rankingScreenState.playerRowText.includes("あなた") ||
    rankingScreenState.horizontalOverflow ||
    seasonHistoryState.active !== "history" ||
    seasonHistoryState.label !== "ARCHIVE" ||
    !seasonHistoryState.title.includes("過去") ||
    !seasonHistoryState.period.includes("終了") ||
    !seasonHistoryState.qualifier.includes("残ります") ||
    !seasonHistoryState.currentHidden ||
    seasonHistoryState.historyHidden ||
    !seasonHistoryState.historyText.includes("過去シーズン") ||
    !seasonHistoryState.currentOnlyHidden ||
    seasonHistoryState.horizontalOverflow ||
    !dailyRankingYesterdayState.active ||
    !dailyRankingYesterdayState.date.includes("昨日") ||
    dailyRankingYesterdayState.rowCount < 1 ||
    dailyRankingYesterdayState.rowCount > 11 ||
    !dailyRankingYesterdayState.hasPlayerRow ||
    dailyRankingYesterdayState.horizontalOverflow
  ) {
    throw new Error(`Ranking screen state failed: ${JSON.stringify({ rankingScreenState, seasonHistoryState, dailyRankingYesterdayState })}`);
  }
  if (
    missionLockedState.screen !== "missions" ||
    !missionLockedState.missionsVisible ||
    !missionLockedState.lockedVisible ||
    !missionLockedState.lockedText.includes("1プレイ") ||
    !missionLockedState.dailyHidden ||
    !missionLockedState.scoreGoalHidden ||
    !missionLockedState.weeklyHidden ||
    missionLockedState.dailyPanelScreen !== "missions" ||
    missionLockedState.horizontalOverflow
  ) {
    throw new Error(`Mission screen should be separate and locked before warmup: ${JSON.stringify(missionLockedState)}`);
  }
  if (
    deckScreenState.screen !== "deck" ||
    !deckScreenState.deckVisible ||
    deckScreenState.deckCount !== 3 ||
    deckScreenState.collectionCount < 10 ||
    deckScreenState.collectionArtCount < 10 ||
    !deckScreenState.collectionFirstBackground.includes("assets/generated/") ||
    deckScreenState.pushDeckIndex < 0 ||
    deckScreenState.pushLabelCount !== 1 ||
    deckScreenState.filterButtons.length !== 6 ||
    deckScreenState.lengthButtons.length !== 4 ||
    deckScreenState.sortButtons.length !== 3 ||
    deckScreenState.filterButtons.some((button) => button.width < 42) ||
    deckScreenState.lengthButtons.some((button) => button.width < 42) ||
    deckScreenState.sortButtons.some((button) => button.width < 42) ||
    !deckScreenState.filterButtons.some((button) => button.id === "g3" && button.text === "GGG") ||
    !deckScreenState.lengthButtons.some((button) => button.id === "len5plus" && button.text === "5字+") ||
    !deckScreenState.sortButtons.some((button) => button.id === "name" && button.text === "名前") ||
    !deckScreenState.collectionTags.includes("デッキ入り") ||
    deckScreenState.collectionNames.includes("くさつおんせん") ||
    !deckScreenState.collectionNames.includes("やきまんじゅう") ||
    !deckScreenState.collectionRarityLabels.includes("GGG") ||
    !deckScreenState.collectionRarityLabels.includes("GG") ||
    !deckScreenState.collectionRarityLabels.includes("G") ||
    !deckScreenState.guideTitle.includes("ぐんまけん") ||
    !deckScreenState.guideMeta.includes("ぐんまけん") ||
    deckScreenState.guideRarityLabel !== "G" ||
    !deckScreenState.guideNote.includes("群馬県") ||
    !deckScreenState.guideLetters.includes("ぐ・ん・ま") ||
    !deckScreenState.guideStatus.includes("Gブースト") ||
    !deckScreenState.guideStatus.includes("序盤5秒") ||
    deckScreenState.guideText.includes("話題") ||
    deckScreenState.guideText.includes("学び") ||
    deckScreenState.guideText.includes("配信") ||
    deckScreenState.guideText.includes("視聴") ||
    !deckScreenState.guideAction ||
    deckScreenState.guideHighlightCount !== 1 ||
    deckScreenState.layout.guideBottom > deckScreenState.layout.gridTop + 2 ||
    deckScreenState.layout.panelOverflowY !== "hidden" ||
    deckScreenState.layout.gridOverflowY !== "auto" ||
    deckScreenState.layout.firstCardHeight > 155
  ) {
    throw new Error(`Deck builder screen did not render correctly: ${JSON.stringify(deckScreenState)}`);
  }
  if (
    collectionFilterState.selectedFilter !== "g3" ||
    collectionFilterState.activeText !== "GGG" ||
    collectionFilterState.collectionCount !== 2 ||
    !collectionFilterState.collectionNames.includes("まえばし") ||
    !collectionFilterState.collectionNames.includes("たかさき") ||
    !collectionFilterState.collectionStatuses.every((status) => status === "missing") ||
    collectionFilterState.guideRarityLabel !== "GGG" ||
    collectionFilterState.guideText.includes("話題") ||
    collectionFilterState.guideText.includes("学び") ||
    collectionFilterState.guideText.includes("配信") ||
    collectionFilterState.guideText.includes("視聴") ||
    !collectionFilterState.guideLetters.includes("・") ||
    collectionFilterState.guideHighlightCount !== 1 ||
    collectionFilterState.horizontalOverflow
  ) {
    throw new Error(`Collection rarity filter did not work cleanly: ${JSON.stringify(collectionFilterState)}`);
  }
  if (
    collectionLengthState.selectedLength !== "len5plus" ||
    collectionLengthState.activeText !== "5字+" ||
    collectionLengthState.lengths.length < 3 ||
    !collectionLengthState.lengths.every((length) => length >= 5) ||
    collectionLengthState.names.includes("くさつおんせん") ||
    !collectionLengthState.names.includes("やきまんじゅう") ||
    collectionLengthState.horizontalOverflow
  ) {
    throw new Error(`Collection length filter did not work cleanly: ${JSON.stringify(collectionLengthState)}`);
  }
  if (
    deckBuildSwapState.deckIds[0] !== "season1-shibukawa" ||
    deckBuildSwapState.deckIds[1] !== "season1-numata" ||
    deckBuildSwapState.deckIds[2] !== "season1-ota" ||
    deckBuildSwapState.pushCardId !== "season1-ota" ||
    deckBuildSwapState.selectedSlot !== 0 ||
    deckBuildSwapState.selectedCardId !== "season1-shibukawa" ||
    deckBuildSwapState.pushSlot !== 2 ||
    deckBuildSwapState.guideCardId !== "season1-ota" ||
    deckBuildSwapState.selectedSlotColor !== "blue" ||
    deckBuildSwapState.pushSlotColor !== "green" ||
    !deckBuildSwapState.noDuplicateNameKeys
  ) {
    throw new Error(`Deck construction push selection should preserve replacement target: ${JSON.stringify(deckBuildSwapState)}`);
  }
  if (
    deckBuildRedSlotBefore.selectedSlot !== 1 ||
    !deckBuildRedSlotBefore.selectedSlotLabel ||
    !deckBuildRedSlotBefore.guideAction.includes(deckBuildRedSlotBefore.selectedSlotLabel) ||
    !deckBuildRedSlotBefore.guideMeta.includes(deckBuildRedSlotBefore.selectedSlotLabel) ||
    !deckBuildRedSlotBefore.guideMeta.includes("0凸") ||
    deckBuildRedSlotBefore.guideMeta.includes("所持") ||
    deckBuildRedSlotBefore.guideTag !== "0凸" ||
    !deckBuildRedSlotBefore.guideStatus.includes(":") ||
    deckBuildRedSlotBefore.guideStatus.includes("/") ||
    deckBuildRedSlotBefore.pushCardId !== "basic-gunma-ken" ||
    deckBuildRedSlotBefore.guideCardId !== "season1-maebashi" ||
    deckBuildRedSlotBefore.guideHighlightCardId !== "season1-maebashi" ||
    deckBuildRedSlotState.deckIds[0] !== "basic-gunma-ken" ||
    deckBuildRedSlotState.deckIds[1] !== "season1-maebashi" ||
    deckBuildRedSlotState.deckIds[2] !== "basic-akagi-san" ||
    deckBuildRedSlotState.pushCardId !== "basic-gunma-ken" ||
    deckBuildRedSlotState.selectedSlot !== 1 ||
    deckBuildRedSlotState.selectedCardId !== "season1-maebashi" ||
    deckBuildRedSlotState.pushSlot !== 0 ||
    deckBuildRedSlotState.guideCardId !== "season1-maebashi" ||
    !deckBuildRedSlotState.guideAction.includes("推しにする") ||
    deckBuildRedSlotState.selectedSlotColor !== "red" ||
    !deckBuildRedSlotState.noDuplicateNameKeys
  ) {
    throw new Error(
      `Deck construction should put selected non-deck cards into the selected color slot on a second tap: ${JSON.stringify({
        before: deckBuildRedSlotBefore,
        after: deckBuildRedSlotState,
      })}`,
    );
  }
  if (
    deckBuildPushReplaceState.deckIds[0] !== "season1-shibukawa" ||
    deckBuildPushReplaceState.pushCardId !== "season1-shibukawa" ||
    deckBuildPushReplaceState.pushSlot !== 0 ||
    deckBuildPushReplaceState.selectedSlot !== 0 ||
    deckBuildPushReplaceState.selectedCardId !== "season1-shibukawa" ||
    deckBuildPushReplaceState.guideCardId !== "season1-shibukawa" ||
    deckBuildPushReplaceState.selectedSlotColor !== "blue" ||
    deckBuildPushReplaceState.pushSlotColor !== "blue" ||
    !deckBuildPushReplaceState.guideMeta.includes("推し")
  ) {
    throw new Error(`Replacing the current push slot should keep the push color and push the new card: ${JSON.stringify(deckBuildPushReplaceState)}`);
  }
  if (JSON.stringify(beforeColorCycle.deckSlotColors) !== JSON.stringify(["blue", "red", "green"])) {
    throw new Error(`Expected default slot colors blue/red/green: ${JSON.stringify(beforeColorCycle)}`);
  }
  if (
    packScreenState.screen !== "pack" ||
    !packScreenState.packVisible ||
    !packScreenState.noticeText.includes("CLOSED TEST") ||
    !packScreenState.noticeText.includes("SDK") ||
    !packScreenState.actionTexts.some((text) => text.includes("TEST AD")) ||
    !packScreenState.actionTexts.some((text) => text.includes("TEST GRANT")) ||
    !packScreenState.actionTexts.some((text) => text.includes("詳細")) ||
    packScreenState.flowTexts.length !== 0 ||
    packScreenState.selectorCount < 1 ||
    !packScreenState.selectedPackText.includes("ぐんまのし") ||
    !packScreenState.detailInitiallyHidden ||
    !packScreenState.detailVisible ||
    !packScreenState.detailTitle.includes("ぐんまのし") ||
    packScreenState.rateCount !== 4 ||
    !packScreenState.rateBadgeLabels.includes("GGG") ||
    !packScreenState.rateBadgeLabels.includes("GG") ||
    !packScreenState.rateBadgeLabels.includes("G") ||
    !packScreenState.packPeriod.includes("ぐんまのし") ||
    !packScreenState.packPeriod.includes("2026/06/12") ||
    !packScreenState.packPeriod.includes("2026/08/31") ||
    !packScreenState.packPeriod.includes("残り") ||
    !packScreenState.featureText.includes("FEATURED") ||
    !packScreenState.featureText.includes("目玉カード") ||
    !packScreenState.featureText.includes("残り") ||
    packScreenState.featureCount !== 2 ||
    !packScreenState.featureNames.includes("まえばし") ||
    !packScreenState.featureNames.includes("たかさき") ||
    !packScreenState.featureBadgeLabels.every((label) => label === "GGG") ||
    !packScreenState.featureFits ||
    !packScreenState.exchangeStatus.includes("引換だるま 0/50") ||
    !packScreenState.exchangeIconExists ||
    packScreenState.exchangeReady ||
    !packScreenState.collectionProgress.includes("1/12種") ||
    packScreenState.collectionProgressWidth !== "8%" ||
    !packScreenState.collectionHint.includes("あと11種") ||
    !packScreenState.collectionHint.includes("たかさき") ||
    packScreenState.lineupCount !== 12 ||
    !packScreenState.lineupNames.includes("たかさき") ||
    !packScreenState.lineupNames.includes("みどり") ||
    !packScreenState.lineupBadgeLabels.includes("GGG") ||
    !packScreenState.lineupBadgeLabels.includes("GG") ||
    !packScreenState.lineupBadgeLabels.includes("G") ||
    !packScreenState.lineupFits ||
    packScreenState.packResult.trim() !== "" ||
    !packScreenState.packResultHidden ||
    !packScreenState.revealReady.includes("ぐんまのし") ||
    !packScreenState.revealMeta.includes("Gだるま") ||
    packScreenState.resultRect.bottom > packScreenState.revealRect.top ||
    packScreenState.openButtonRect.top - packScreenState.revealRect.bottom > 16 ||
    packScreenState.openButtonRect.height < 52
  ) {
    throw new Error(`Pack screen did not render correctly: ${JSON.stringify(packScreenState)}`);
  }
  if (
    packLineupDetailState.screen !== "deck" ||
    !packLineupDetailState.deckVisible ||
    !packLineupDetailState.guideTitle.includes("たかさき") ||
    packLineupDetailState.guideRarityLabel !== "GGG" ||
    !packLineupDetailState.guideMeta.includes("たかさき") ||
    packLineupDetailState.guideAction !== "パックで入手" ||
    !packLineupDetailState.guideActionDisabled ||
    packLineupDetailState.horizontalOverflow
  ) {
    throw new Error(`Pack lineup detail navigation failed: ${JSON.stringify(packLineupDetailState)}`);
  }
  if (
    packExchangeReadyState.tagName !== "BUTTON" ||
    !packExchangeReadyState.status.includes("引換だるま 50/50") ||
    !packExchangeReadyState.status.includes("未所持/凸カードと交換可") ||
    !packExchangeReadyState.status.includes("タップで交換へ") ||
    !packExchangeReadyState.readyClass ||
    !packExchangeReadyState.actionableClass ||
    !packExchangeReadyState.ariaLabel.includes("未所持カードや凸用カード") ||
    !packExchangeReadyState.openButtonText.includes("交換へ") ||
    packExchangeReadyState.openButtonDisabled ||
    !packExchangeReadyState.openButtonExchangeClass ||
    packExchangeReadyState.exchangeableCount < 1 ||
    packExchangeReadyState.lineupExchangeableCount < 1 ||
    packExchangeReadyState.horizontalOverflow
  ) {
    throw new Error(`Pack exchange ready state failed: ${JSON.stringify(packExchangeReadyState)}`);
  }
  if (
    packExchangeGuideActionState.screen !== "deck" ||
    !packExchangeGuideActionState.deckVisible ||
    !packExchangeGuideActionState.guideTitle.includes("たかさき") ||
    !packExchangeGuideActionState.guideAction.includes("交換して") ||
    !packExchangeGuideActionState.guideAction.includes("枠へ") ||
    packExchangeGuideActionState.guideActionDisabled ||
    !packExchangeGuideActionState.guideActionPrimary ||
    packExchangeGuideActionState.selectedFilter !== "all" ||
    !packExchangeGuideActionState.hasExchangeOpenEvent ||
    !packExchangeGuideActionState.toast.includes("引換だるま") ||
    packExchangeGuideActionState.horizontalOverflow
  ) {
    throw new Error(`Pack exchange guide action failed: ${JSON.stringify(packExchangeGuideActionState)}`);
  }
  if (
    packMedalExchangeState.medals !== 0 ||
    packMedalExchangeState.medalsByPack !== 0 ||
    packMedalExchangeState.owned !== 1 ||
    packMedalExchangeState.deckIds[2] !== "season1-takasaki" ||
    packMedalExchangeState.pushCardId !== "basic-gunma-ken" ||
    !packMedalExchangeState.guideTitle.includes("たかさき") ||
    !packMedalExchangeState.toast.includes("交換") ||
    !packMedalExchangeState.hasExchangeEvent ||
    packMedalExchangeState.savedMedals !== 0 ||
    packMedalExchangeState.savedMedalsByPack !== 0 ||
    packMedalExchangeState.savedOwned !== 1 ||
    packMedalExchangeState.horizontalOverflow
  ) {
    throw new Error(`Pack medal exchange failed: ${JSON.stringify(packMedalExchangeState)}`);
  }
  if (
    !packDuplicateExchangeReadyState.status.includes("未所持/凸カードと交換可") ||
    !packDuplicateExchangeReadyState.readyClass ||
    !packDuplicateExchangeReadyState.actionableClass ||
    !packDuplicateExchangeReadyState.ariaLabel.includes("凸用カード") ||
    packDuplicateExchangeReadyState.exchangeableCount < 1 ||
    packDuplicateExchangeReadyState.lineupExchangeableCount < 1 ||
    packDuplicateExchangeGuideState.screen !== "deck" ||
    !packDuplicateExchangeGuideState.guideTitle.includes("たかさき") ||
    !packDuplicateExchangeGuideState.guideMeta.includes("交換で1凸") ||
    packDuplicateExchangeGuideState.guideAction !== "交換で1凸" ||
    packDuplicateExchangeGuideState.guideActionDisabled ||
    packDuplicateExchangeGuideState.selectedFilter !== "all" ||
    packDuplicateExchangeGuideState.exchangePackId !== "season-01-pack" ||
    packDuplicateExchangeGuideState.collectionCount < 1 ||
    packDuplicateExchangeGuideState.exchangeableCount < 1 ||
    packDuplicateExchangeState.medals !== 0 ||
    packDuplicateExchangeState.medalsByPack !== 0 ||
    packDuplicateExchangeState.owned !== 2 ||
    packDuplicateExchangeState.savedOwned !== 2 ||
    packDuplicateExchangeState.exchangePackId !== "" ||
    !packDuplicateExchangeState.toast.includes("交換で1凸") ||
    !packDuplicateExchangeState.hasDuplicateExchangeEvent ||
    packDuplicateExchangeReadyState.horizontalOverflow ||
    packDuplicateExchangeGuideState.horizontalOverflow ||
    packDuplicateExchangeState.horizontalOverflow
  ) {
    throw new Error(
      `Pack duplicate exchange failed: ${JSON.stringify({
        packDuplicateExchangeReadyState,
        packDuplicateExchangeGuideState,
        packDuplicateExchangeState,
      })}`,
    );
  }
  if (
    packOpenState.packStone !== 0 ||
    !packOpenState.lastPackResult ||
    packOpenState.resultText.trim() !== "" ||
    !packOpenState.resultHidden ||
    !packOpenState.reveal ||
    !packOpenState.reveal.tier ||
    packOpenState.revealName !== "ぐんまのしを開封" ||
    !packOpenState.revealMeta.includes("Gだるま") ||
    !packOpenState.revealActionExists ||
    !packOpenState.revealActionHidden ||
    packOpenState.revealShareExists ||
    packOpenState.revealWidth < 280 ||
    !packOpenState.openingModalVisible ||
    !packOpenState.openingCardClasses.includes("is-opening") ||
    !packOpenState.openingTitle.includes("ぐんまのし") ||
    packOpenState.openingName !== packOpenState.reveal.name ||
    packOpenState.openingLetters.join("") !== packOpenState.reveal.name ||
    packOpenState.openingLetters.length !== Array.from(packOpenState.reveal.name).length ||
    packOpenState.openingMeta !== packOpenState.reveal.meta ||
    (!packOpenState.openingRarityLabel && !packOpenState.openingRarity.includes("選択券")) ||
    (packOpenState.reveal.cardId && packOpenState.openingActionText !== "カードを見る") ||
    (!packOpenState.reveal.cardId && packOpenState.openingActionText !== "チケットを使う") ||
    (packOpenState.reveal.cardId && !packOpenState.openingSkill.includes("効果")) ||
    packOpenState.openingAgainText !== "もう1回引く" ||
    !packOpenState.openingAgainDisabled ||
    (packOpenState.reveal.cardId && (!packOpenState.openingArtVisible || !packOpenState.openingArtSrc.includes("assets/generated/") || !packOpenState.openingFallbackHidden)) ||
    (packOpenState.reveal.cardId &&
      (packOpenState.openingArtRect.height < packOpenState.openingArtRect.width * 1.45 ||
        packOpenState.openingArtRect.height > packOpenState.openingArtRect.width * 1.56)) ||
    (!packOpenState.reveal.cardId && (packOpenState.openingArtVisible || packOpenState.openingFallbackHidden)) ||
    packOpenState.openingRect.width < 300 ||
    packOpenState.openingRect.height < 360 ||
    packOpenState.horizontalOverflow
  ) {
    throw new Error(`Pack opening reveal did not render correctly: ${JSON.stringify(packOpenState)}`);
  }
  if (
    packRevealActionState.screen !== "deck" ||
    !packRevealActionState.deckVisible ||
    !packRevealActionState.guideTitle ||
    (packOpenState.reveal.cardId && !packRevealActionState.guideTitle.includes(packOpenState.reveal.name)) ||
    (!packOpenState.reveal.cardId && !packRevealActionState.guideAction.includes("チケット")) ||
    !packRevealActionState.hasDetailEvent ||
    packRevealActionState.horizontalOverflow
  ) {
    throw new Error(`Pack reveal detail action failed: ${JSON.stringify(packRevealActionState)}`);
  }
  if (
    packReentryState.screen !== "pack" ||
    !packReentryState.packVisible ||
    packReentryState.resultText.trim() !== "" ||
    !packReentryState.resultHidden ||
    !packReentryState.revealName.includes("ぐんまのし") ||
    !packReentryState.revealActionHidden ||
    packReentryState.lastPackReveal !== null ||
    packReentryState.horizontalOverflow
  ) {
    throw new Error(`Pack re-entry should not show stale result: ${JSON.stringify(packReentryState)}`);
  }
  if (
    settingsScreenState.screen !== "settings" ||
    !settingsScreenState.settingsVisible ||
    !settingsScreenState.reduceMotion ||
    !settingsScreenState.largeText ||
    !settingsScreenState.highContrast ||
    !settingsScreenState.tileMarks ||
    settingsScreenState.streamModeSettingExists ||
    !settingsScreenState.bodyClass ||
    !settingsScreenState.largeTextClass ||
    !settingsScreenState.highContrastClass ||
    !settingsScreenState.tileMarkClass ||
    !settingsScreenState.tileMarkToggleChecked ||
    settingsScreenState.deckSlotLabelCount !== 3 ||
    settingsScreenState.deckSlotPushLabelCount !== 1 ||
    !settingsScreenState.deckSlotAllInDeck ||
    settingsScreenState.streamModeToggleExists ||
    !settingsScreenState.howtoExists ||
    settingsScreenState.howtoStepCount !== 4 ||
    !settingsScreenState.tutorialReplayExists ||
    !settingsScreenState.resetSaveExists ||
    !settingsScreenState.resetSaveNote.includes("2回押し") ||
    !settingsScreenState.howtoPanelRect ||
    !settingsScreenState.settingsPanelFirstRect ||
    settingsScreenState.howtoPanelRect.bottom > settingsScreenState.settingsPanelFirstRect.top ||
    settingsScreenState.buildInfo?.buildId !== DATA.build.buildId ||
    settingsScreenState.buildInfo?.channel !== DATA.build.channel ||
    !settingsScreenState.buildVersionText.includes(DATA.build.buildId) ||
    !settingsScreenState.buildChannelText.includes(DATA.build.channel) ||
    !settingsScreenState.buildLabel.includes(DATA.build.buildId) ||
    !settingsScreenState.soundTestProbe?.soundOn ||
    !settingsScreenState.soundTestProbe.buttonText.includes("音を確認") ||
    !settingsScreenState.soundTestProbe.toast.includes("効果音") ||
    !settingsScreenState.soundTestProbe.soundEvents.includes("clear-big") ||
    settingsScreenState.soundTestProbe.rect.width < 200 ||
    settingsScreenState.soundTestProbe.rect.height < 44 ||
    settingsScreenState.soundTestProbe.horizontalOverflow ||
    settingsScreenState.feedbackReportButtonExists ||
    settingsScreenState.feedbackInsightExists ||
    settingsScreenState.telemetryEvents.length < 6 ||
    settingsScreenState.savedTelemetryEvents.length < 5 ||
    settingsScreenState.policyLinks.length !== 3 ||
    settingsScreenState.policyOverflow ||
    !settingsScreenState.policyLinks.every((link) => link.width >= 90 && link.height >= 50) ||
    !settingsScreenState.policyLinks.some((link) => link.id === "policyPrivacyLink" && link.href === "../homepage/privacy.html") ||
    !settingsScreenState.policyLinks.some((link) => link.id === "policyTermsLink" && link.href === "../homepage/terms.html") ||
    !settingsScreenState.policyLinks.some((link) => link.id === "policyCommercialLink" && link.href === "../homepage/commercial-transactions.html")
  ) {
    throw new Error(`Settings screen did not update correctly: ${JSON.stringify(settingsScreenState)}`);
  }
  if (result.title !== "ぐんもじぱずる") {
    throw new Error(`Unexpected title: ${result.title}`);
  }
  if (result.deckCount !== 3) {
    throw new Error(`Expected 3 deck cards, got ${result.deckCount}`);
  }
  if (result.artDeckCount !== 3) {
    throw new Error(`Expected 3 generated-art deck cards, got ${result.artDeckCount}`);
  }
  if (
    result.passiveSkills.length !== 3 ||
    !result.passiveSkills.some((skill) => skill.type === "openingScore") ||
    !result.passiveSkills.some((skill) => skill.type === "comboScore") ||
    !result.passiveSkills.some((skill) => skill.type === "longWordScore") ||
    !result.passiveSkills.some(
      (skill) => skill.cardId === "basic-gunma-ken" && skill.type === "openingScore" && skill.isPush && skill.multiplier === 2 && skill.value === 0.08,
    ) ||
    result.passiveSkills.some((skill) => skill.cardId !== "basic-gunma-ken" && skill.isPush) ||
    !result.passiveSummaries.some((summary) => summary.includes("推し2倍") && summary.includes("スコア+8.0%")) ||
    !result.passiveSummaries.every((summary) => summary && !summary.includes("発動")) ||
    !result.skillHudText ||
    result.skillHudLabel !== "常時発動"
  ) {
    throw new Error(`Deck passive skills should be active from run start: ${JSON.stringify(result)}`);
  }
  if (
    !specialCraneProbe.checked ||
    !specialCraneProbe.triggered ||
    !specialCraneProbe.active ||
    !specialCraneProbe.scoreEffects.some((effect) => effect.text.includes("上毛鶴") && effect.lane === "hud") ||
    specialCraneProbe.skillHudLabel !== "特別ゲーム"
  ) {
    throw new Error(`Special crane event did not trigger cleanly at 30 seconds: ${JSON.stringify(specialCraneProbe)}`);
  }
  if (
    !lastSpurtProbe.active ||
    !lastSpurtProbe.announced ||
    !lastSpurtProbe.phoneClass ||
    lastSpurtProbe.scoreEffects.some((effect) => effect.text.includes("ラストスパート") && effect.lane === "hud") ||
    lastSpurtProbe.skillHudLabel !== "ラストスパート"
  ) {
    throw new Error(`Last spurt did not activate cleanly at 10 seconds: ${JSON.stringify(lastSpurtProbe)}`);
  }
  if (result.pushDeckIndex < 0 || result.pushLabelCount !== 1) {
    throw new Error(`Push card should be selectable in any deck slot and framed: ${JSON.stringify(result)}`);
  }
  if (result.slotControlCount !== 3 || !result.deckColorControlsFit) {
    throw new Error(`Deck color controls are missing or overlapping: ${JSON.stringify(result)}`);
  }
  if (
    result.deckSlotColorLabels.length !== 3 ||
    result.deckSlotColorLabels[result.pushDeckIndex] !== "黄" ||
    !result.slotControlTexts[result.pushDeckIndex].includes("黄") ||
    !result.slotControlLabels.every((label) => label.includes("デッキ色") && label.includes("パネル色")) ||
    !result.deckAriaLabels.every((label) => label.includes("デッキ入り")) ||
    !result.deckAriaLabels.some((label) => label.includes("推し")) ||
    !result.menuDeckAriaLabels.every((label) => label.includes("デッキ入り")) ||
    !result.menuDeckAriaLabels.some((label) => label.includes("推し"))
  ) {
    throw new Error(`Deck color labels are not accessible enough: ${JSON.stringify(result)}`);
  }
  if (
    result.gameLegendCount !== 3 ||
    result.gameLegendLabels.length !== 3 ||
    result.gameLegendArtCount < 2 ||
    result.gameLegendPushCount !== 1 ||
    !result.gameLegendNames.includes("ぐんまけん") ||
    !result.gameLegendReadings.some((reading) => reading.includes("ぐ・ん・ま")) ||
    result.gameLegendSkills.length !== 3 ||
    !result.gameLegendSkills.every((skill) => skill && skill.length > 2) ||
    !result.gameLegendAriaLabels.every((label) => label.includes("パネル") && label.includes("そろえる") && label.includes("スキル")) ||
    !result.gameLegendFits
  ) {
    throw new Error(`Game deck color legend is not clear enough: ${JSON.stringify(result)}`);
  }
  if (
    result.gameControlsLayout.cardCount !== 3 ||
    !result.gameControlsLayout.sameRow ||
    !result.gameControlsLayout.refreshAfterCards ||
    !result.gameControlsLayout.hiddenSkillRow ||
    result.gameControlsLayout.refreshWidth < 48 ||
    result.gameControlsLayout.refreshHeight < 58
  ) {
    throw new Error(`Game controls should be blue/red/green cards plus refresh in one row: ${JSON.stringify(result.gameControlsLayout)}`);
  }
  if (new Set(result.deckSlotColors).size !== result.deckSlotColors.length) {
    throw new Error(`Default slot colors are duplicated: ${JSON.stringify(result.deckSlotColors)}`);
  }
  if (
    colorCycleResult.deckSlotColors[colorCycleResult.previous.pushSlot] === colorCycleResult.previous.deckSlotColors[colorCycleResult.previous.pushSlot] ||
    new Set(colorCycleResult.deckSlotColors).size !== colorCycleResult.deckSlotColors.length ||
    colorCycleResult.tilePalette === colorCycleResult.previous.tilePalette ||
    !colorCycleResult.slotControlLabels[colorCycleResult.previous.pushSlot].includes("デッキ色") ||
    !colorCycleResult.deckAriaLabels[colorCycleResult.previous.pushSlot].includes("デッキ入り") ||
    !colorCycleResult.toast.includes("デッキ色")
  ) {
    throw new Error(`Slot color cycling did not update cleanly: ${JSON.stringify(colorCycleResult)}`);
  }
  if (!result.stageBackground.includes("stage-game-") || !result.pushCardBackground.includes("card-basic-gunma-ken.png")) {
    throw new Error(`Generated images are not wired correctly: ${JSON.stringify(result)}`);
  }
  if (!result.running || result.tiles < 12 || result.specialTiles !== 0 || result.specialCooldown !== 0) {
    throw new Error(`Game did not start correctly: ${JSON.stringify(result)}`);
  }
  if (
    idleGameResetState.tiles !== 0 ||
    idleGameResetState.effects !== 0 ||
    idleGameResetState.score !== 0 ||
    idleGameResetState.timeLeft !== DATA.runSeconds ||
    idleGameResetState.comboCount !== 0 ||
    idleGameResetState.matches !== 0 ||
    idleGameResetState.startHidden ||
    !idleGameResetState.finishHidden ||
    idleGameResetState.horizontalOverflow
  ) {
    throw new Error(`Idle game screen did not clear stale run state: ${JSON.stringify(idleGameResetState)}`);
  }
  if (
    !countdownProbe.visible ||
    !countdownProbe.startHidden ||
    countdownProbe.startCountdown <= 0 ||
    countdownProbe.timeLeft < DATA.runSeconds - 0.05
  ) {
    throw new Error(`Stage countdown did not gate the start cleanly: ${JSON.stringify(countdownProbe)}`);
  }
  if (
    result.stamina !== 4 ||
    !result.startDisabled ||
    !result.startHidden ||
    !result.startLabel.includes("PLAY") ||
    !result.startLabel.includes("スタミナ-1")
  ) {
    throw new Error(`Stamina was not spent on start: ${JSON.stringify(result)}`);
  }
  if (
    result.startParentClass !== "play-panel" ||
    !result.stageCountdownHidden ||
    result.wordPanelExists ||
    result.refreshRect.width < 48 ||
    result.refreshRect.height < 58
  ) {
    throw new Error(`Play controls did not match the revised mobile layout: ${JSON.stringify(result)}`);
  }
  if (
    result.staminaPips.length !== DATA.stamina.max ||
    result.staminaPips.filter(Boolean).length !== 4 ||
    !result.tileMarks ||
    !result.tileMarkClass
  ) {
    throw new Error(`Stamina pips or panel marks did not persist into play: ${JSON.stringify(result)}`);
  }
  if (
    result.streamOverlayExists
  ) {
    throw new Error(`Removed stream overlay should not render during play: ${JSON.stringify(result)}`);
  }
  if (result.score !== 0) {
    throw new Error(`Game scored before player action: ${JSON.stringify(result)}`);
  }
  if (!result.tutorialActive || result.tutorialComplete || !result.tutorialHint.hintFrom || !result.tutorialHint.hintTo) {
    throw new Error(`First run tutorial did not initialize: ${JSON.stringify(result)}`);
  }
  if (
    !result.tutorialCoachVisible ||
    !result.tutorialCoachText.includes("光る2枚") ||
    !result.tutorialCoachSubtext.includes("お手本") ||
    result.tutorialCoachRect.width < 240 ||
    result.tutorialCoachRect.height < 44
  ) {
    throw new Error(`First run tutorial coach did not render clearly: ${JSON.stringify(result)}`);
  }
  if (result.canvasReadable && result.nonBlank <= 1000) {
    throw new Error("Canvas appears blank");
  }
  if (result.horizontalOverflow) {
    throw new Error("Mobile viewport has horizontal overflow");
  }
  if (
    !pauseProbe.paused ||
    !pauseProbe.statePaused ||
    !pauseProbe.pauseVisible ||
    !pauseProbe.pauseLabel.includes("▶") ||
    !pauseProbe.pauseReason.includes("再開") ||
    !pauseProbe.refreshDisabled ||
    pauseProbe.streamOverlayExists
  ) {
    throw new Error(`Pause did not activate correctly: ${JSON.stringify(pauseProbe)}`);
  }
  if (!pauseHoldResult.statePaused || !pauseHoldResult.timeHeld || !pauseHoldResult.pauseVisible) {
    throw new Error(`Pause did not hold the timer: ${JSON.stringify(pauseHoldResult)}`);
  }
  if (!resumeProbe.resumed || resumeProbe.statePaused || resumeProbe.pauseVisible || !resumeProbe.pauseLabel.includes("Ⅱ") || resumeProbe.streamOverlayExists) {
    throw new Error(`Resume did not restore play: ${JSON.stringify(resumeProbe)}`);
  }

  if (
    tutorialMoveResult.score <= 0 ||
    tutorialMoveResult.tutorialActive ||
    !tutorialMoveResult.tutorialComplete ||
    !tutorialMoveResult.tutorialDemoDone ||
    !tutorialMoveResult.tutorialAutoAssistProbe.active ||
    tutorialMoveResult.coachVisible ||
    tutorialMoveResult.completedRuns !== 0 ||
    !tutorialMoveResult.saved.tutorialComplete ||
    tutorialMoveResult.saved.completedRuns !== 0
  ) {
    throw new Error(`Tutorial hint move did not complete: ${JSON.stringify(tutorialMoveResult)}`);
  }
  if (
    postTutorialHomeState.screen !== "menu" ||
    postTutorialHomeState.firstPlayVisible ||
    !postTutorialHomeState.homePlayVisible ||
    !postTutorialHomeState.dailyHidden ||
    !postTutorialHomeState.dailyWordHidden ||
    !postTutorialHomeState.dailyGiftHidden ||
    !postTutorialHomeState.scoreGoalHidden ||
    !postTutorialHomeState.warmupClass ||
    !postTutorialHomeState.dailyReward.includes("あと3プレイ") ||
    !postTutorialHomeState.dailyProgress.includes("/") ||
    postTutorialHomeState.horizontalOverflow
  ) {
    throw new Error(`Post-tutorial home should keep mission panels hidden before a completed run: ${JSON.stringify(postTutorialHomeState)}`);
  }
  if (
    postRunDailyWordState.screen !== "missions" ||
    postRunDailyWordState.hidden ||
    postRunDailyWordState.panelScreen !== "missions" ||
    postRunDailyWordState.dailyWordOnMenu !== 0 ||
    !["ぐんまけん", "だるま", "あかぎさん"].includes(postRunDailyWordState.name) ||
    postRunDailyWordState.note.length < 8 ||
    !postRunDailyWordState.prompt.includes("かな") ||
    postRunDailyWordState.prompt.includes("話題") ||
    !postRunDailyWordState.buttonText.includes("GUIDE") ||
    postRunDailyWordState.rect.width < 280 ||
    postRunDailyWordState.rect.height < 56 ||
    postRunDailyWordState.buttonRect.width < 70 ||
    postRunDailyWordState.buttonRect.height < 38 ||
    postRunDailyWordState.horizontalOverflow
  ) {
    throw new Error(`Daily word target did not unlock cleanly after a completed run: ${JSON.stringify(postRunDailyWordState)}`);
  }
  if (
    dailyWordGuideState.screen !== "deck" ||
    !dailyWordGuideState.guideTitle.includes(dailyWordGuideState.expectedName) ||
    !dailyWordGuideState.guideMeta.includes(dailyWordGuideState.expectedName) ||
    dailyWordGuideState.guideNote.length < 8 ||
    !dailyWordGuideState.guideStatus.includes(":") ||
    !dailyWordGuideState.guideStatus.includes("スコア") ||
    !dailyWordGuideState.guideText.includes("字 / かな") ||
    dailyWordGuideState.guideText.includes("話題") ||
    dailyWordGuideState.guideText.includes("学び") ||
    dailyWordGuideState.guideText.includes("配信") ||
    dailyWordGuideState.guideText.includes("視聴") ||
    dailyWordGuideState.horizontalOverflow
  ) {
    throw new Error(`Daily word guide shortcut failed: ${JSON.stringify(dailyWordGuideState)}`);
  }
  if (
    !dailyGiftBeforeClaimState.hidden ||
    !dailyGiftBeforeClaimState.modalHidden ||
    dailyGiftBeforeClaimState.dailyGift.claimed ||
    dailyGiftBeforeClaimState.buttonDisabled ||
    dailyGiftBeforeClaimState.panelClaimed ||
    !dailyGiftBeforeClaimState.title.includes("今日の差し入れ") ||
    !dailyGiftBeforeClaimState.reward.includes("Gだるま+1") ||
    dailyGiftBeforeClaimState.horizontalOverflow
  ) {
    throw new Error(`Daily gift should not interrupt the immediate post-run reaction flow: ${JSON.stringify(dailyGiftBeforeClaimState)}`);
  }
  if (
    returningGiftReadyState.screen !== "menu" ||
    returningGiftReadyState.completedRuns <= 0 ||
    returningGiftReadyState.claimed ||
    returningGiftReadyState.modalHidden ||
    !returningGiftReadyState.modalText.includes("今日の差し入れ") ||
    returningGiftReadyState.horizontalOverflow
  ) {
    throw new Error(`Daily gift should appear on the next login after a completed run: ${JSON.stringify(returningGiftReadyState)}`);
  }
  if (
    !dailyGiftClaimState.dailyGift.claimed ||
    !dailyGiftClaimState.savedDailyGift.claimed ||
    dailyGiftClaimState.savedPackStone !== dailyGiftClaimState.packStone ||
    !dailyGiftClaimState.modalHidden ||
    !dailyGiftClaimState.buttonDisabled ||
    !dailyGiftClaimState.panelClaimed ||
    !dailyGiftClaimState.title.includes("受取済み") ||
    !dailyGiftClaimState.reward.includes("また明日") ||
    !dailyGiftClaimState.note.includes("明日") ||
    !dailyGiftClaimState.buttonText.includes("OK") ||
    dailyGiftClaimState.horizontalOverflow
  ) {
    throw new Error(`Daily gift claimed home state failed: ${JSON.stringify(dailyGiftClaimState)}`);
  }

  if (refreshResult.tiles !== 42 || refreshResult.score !== beforeRefresh.score || !refreshResult.changed || refreshResult.cooldown <= 0) {
    throw new Error(`Refresh did not reset the board correctly: ${JSON.stringify({ beforeRefresh, refreshResult })}`);
  }
  if (slideResult.tile.col !== slideProbe.otherFrom.col || slideResult.other.col !== slideProbe.from.col) {
    throw new Error(`Slide swap did not work: ${JSON.stringify({ slideProbe, slideResult })}`);
  }
  if (autoMatchResult.score <= 0) {
    throw new Error("Orderless auto match did not score");
  }
  if (
    !autoMatchResult.wordCallVisible ||
    autoMatchResult.wordCallHidden !== "false" ||
    !["ぐんまけん", "だるま", "あかぎさん"].some((word) => autoMatchResult.wordCallText.includes(word)) ||
    !autoMatchResult.wordCallScore.includes("+") ||
    autoMatchResult.wordCallPointerEvents !== "none" ||
    autoMatchResult.streamModeSettingExists ||
    autoMatchResult.streamClass ||
    autoMatchResult.streamOverlayExists ||
    autoMatchResult.wordCallRect.width < 190 ||
    autoMatchResult.wordCallRect.height > 58 ||
    autoMatchResult.wordCallRect.bottomFromCanvas > 2 ||
    autoMatchResult.wordCallFontSize < 15 ||
    autoMatchResult.wordCallOpacity < 0.9 ||
    autoMatchResult.toastVisible ||
    autoMatchResult.horizontalOverflow
  ) {
    throw new Error(`Word call overlay did not appear after auto match: ${JSON.stringify(autoMatchResult)}`);
  }
  if (autoMatchResult.matches <= 0 || autoMatchResult.maxCombo < 1) {
    throw new Error(`Run stats did not update after auto match: ${JSON.stringify(autoMatchResult)}`);
  }
  if (
    !dailyMissionCompletionResult.rewarded ||
    !dailyMissionCompletionResult.dailyMission.claimed ||
    dailyMissionCompletionResult.dailyMission.progress !== dailyMissionCompletionResult.mission.target ||
    dailyMissionCompletionResult.packStone < 2 ||
    JSON.stringify(dailyMissionCompletionResult.savedDailyMission) !== JSON.stringify(dailyMissionCompletionResult.dailyMission) ||
    dailyMissionCompletionResult.dailyStreak.count !== 3 ||
    !dailyMissionCompletionResult.lastDailyStreakBonus ||
    !dailyMissionCompletionResult.streakText.includes("ボーナス済") ||
    dailyMissionCompletionResult.horizontalOverflow
  ) {
    throw new Error(`Daily mission rotation did not complete and grant rewards: ${JSON.stringify(dailyMissionCompletionResult)}`);
  }
  if (autoMatchResult.effects <= 0 || !autoMatchResult.effectTypes.includes("tile-pop")) {
    throw new Error(`Clear effects did not spawn after auto match: ${JSON.stringify(autoMatchResult)}`);
  }
  if (autoMatchResult.scoreEffects.some((effect) => effect.lane === "hud")) {
    throw new Error(`Normal clear score text should stay out of the draggable panel area: ${JSON.stringify(autoMatchResult)}`);
  }
  if (!autoMatchResult.soundEvents.includes("start") || !autoMatchResult.soundEvents.some((event) => event === "clear" || event === "clear-big")) {
    throw new Error(`Expected start and clear sound events: ${JSON.stringify(autoMatchResult)}`);
  }
  if (
    simultaneousMatchResult.score <= 0 ||
    simultaneousMatchResult.matches < 2 ||
    simultaneousMatchResult.maxCombo < 2 ||
    simultaneousMatchResult.tiles !== 42 ||
    simultaneousMatchResult.clearEvents.length < 2 ||
    !simultaneousMatchResult.bottomRightGone ||
    simultaneousMatchResult.horizontalOverflow
  ) {
    throw new Error(`Simultaneous matches should clear before gravity: ${JSON.stringify(simultaneousMatchResult)}`);
  }
  if (
    !finishResult.visible ||
    finishResult.wordCallVisible ||
    finishResult.wordCallHidden !== "true" ||
    finishResult.streamOverlayExists ||
    finishResult.streamRecapExists ||
    finishResult.streamSpotlightExists ||
    finishResult.streamResultExists ||
    finishResult.horizontalOverflow ||
    !finishResult.rank.startsWith("RANK ") ||
    !finishResult.xpSummaryText.includes("EXP +") ||
    !finishResult.xpSummaryText.includes("スタミナ全回復") ||
    !finishResult.xpSummaryRankUp ||
    !finishResult.xpSummaryBarWidth.endsWith("%") ||
    finishResult.bestScore <= 0 ||
    finishResult.seasonRecords?.["season-1"]?.bestScore < DATA.dailyScoreTarget.targetScore ||
    finishResult.seasonRecords?.["season-1"]?.stages?.["season-1"]?.bestScore < DATA.dailyScoreTarget.targetScore ||
    finishResult.saved.seasonRecords?.["season-1"]?.bestScore < DATA.dailyScoreTarget.targetScore ||
    finishResult.saved.seasonRecords?.["season-1"]?.stages?.["season-1"]?.bestScore < DATA.dailyScoreTarget.targetScore ||
    finishResult.lastResult.score < DATA.dailyScoreTarget.targetScore ||
    finishResult.saved.bestScore <= 0 ||
    finishResult.playerXp <= finishResult.playerXpBeforeRun ||
    finishResult.playerRank <= finishResult.playerRankBeforeRun ||
    finishResult.saved.playerXp !== finishResult.playerXp ||
    finishResult.completedRuns !== 1 ||
    finishResult.saved.completedRuns !== 1 ||
    finishResult.saved.stamina !== DATA.stamina.max ||
    finishResult.saved.packStone < 3 ||
    !finishResult.saved.dailyMission.claimed ||
    !finishResult.saved.dailyScoreTarget.claimed ||
    finishResult.saved.dailyScoreTarget.bestScore < DATA.dailyScoreTarget.targetScore ||
    finishResult.saved.dailyStreak.count !== 3 ||
    finishResult.saved.lastResult?.score !== finishResult.lastResult.score ||
    finishResult.saved.lastResult?.bestWord !== finishResult.lastResult.bestWord ||
    finishResult.saved.lastResult?.xpReward <= 0 ||
    !finishResult.saved.lastResult?.playerRankUp ||
    finishResult.saved.lastResult?.nextChallenge ||
    finishResult.weeklyChallenge.progress <= 0 ||
    finishResult.saved.weeklyChallenge.progress !== finishResult.weeklyChallenge.progress ||
    !finishResult.lastResult.learnNote ||
    finishResult.lastResult.nextChallenge ||
    finishResult.learnNoteExists ||
    finishResult.nextChallengeExists ||
    finishResult.progressRecapExists ||
    !finishResult.rewardSummaryText.includes("Gだるま+") ||
    !finishResult.rewardSummaryEarned ||
    finishResult.rewardSummaryPractice ||
    finishResult.rewardSummaryRect.width < 220 ||
    finishResult.rewardSummaryRect.height < 30 ||
    finishResult.lastResult.rewardSummary?.totalStone < 1 ||
    finishResult.saved.lastResult?.rewardSummary?.totalStone !== finishResult.lastResult.rewardSummary.totalStone ||
    finishResult.feedbackExists ||
    finishResult.feedbackButtonCount !== 0 ||
    finishResult.shareExists ||
    finishResult.imageExists ||
    finishResult.guideExists ||
    finishResult.actionButtonCount !== 3 ||
    !finishResult.homeText.includes("トップ") ||
    !finishResult.deckText.includes("デッキ") ||
    finishResult.cardRect.top < finishResult.cardRect.stageTop ||
    finishResult.cardRect.bottom > finishResult.cardRect.stageBottom
  ) {
    throw new Error(`Finish result or local save is incomplete: ${JSON.stringify(finishResult)}`);
  }
  if (
    resultDeckState.screen !== "deck" ||
    !resultDeckState.deckVisible ||
    !resultDeckState.lastResult?.bestWord ||
    !resultDeckState.guideAction ||
    resultDeckState.horizontalOverflow
  ) {
    throw new Error(`Result deck shortcut failed: ${JSON.stringify(resultDeckState)}`);
  }
  if (
    resultDeckReturnState.screen !== "game" ||
    !resultDeckReturnState.finishVisible ||
    resultDeckReturnState.running ||
    !resultDeckReturnState.deckButtonExists ||
    resultDeckReturnState.horizontalOverflow
  ) {
    throw new Error(`Result screen restoration before home return failed: ${JSON.stringify(resultDeckReturnState)}`);
  }
  if (
    finishHomeResult.screen !== "menu" ||
    finishHomeResult.running ||
    !finishHomeResult.finishHidden ||
    finishHomeResult.lastResultExists ||
    finishHomeResult.bestChipExists ||
    !finishHomeResult.dailyGiftModalHidden ||
    finishHomeResult.horizontalOverflow
  ) {
    throw new Error(`Finish home return failed: ${JSON.stringify(finishHomeResult)}`);
  }
  if (
    restoredHomeLastResultState.screen !== "menu" ||
    !restoredHomeLastResultState.stateLastResult ||
    !restoredHomeLastResultState.savedLastResult ||
    restoredHomeLastResultState.panelExists ||
    restoredHomeLastResultState.bestChipExists ||
    restoredHomeLastResultState.horizontalOverflow
  ) {
    throw new Error(`Restored home last-result panel failed: ${JSON.stringify(restoredHomeLastResultState)}`);
  }
  if (
    !restoredGiftModalState.visible ||
    !restoredGiftModalState.text.includes("今日の差し入れ") ||
    restoredGiftModalState.completedRuns <= 0 ||
    restoredGiftModalState.claimed ||
    restoredGiftModalState.horizontalOverflow
  ) {
    throw new Error(`Restored login should show the daily gift modal without breaking layout: ${JSON.stringify(restoredGiftModalState)}`);
  }
  if (
    normalHomeClaimedState.screen !== "menu" ||
    normalHomeClaimedState.completedRuns !== normalHomeClaimedState.warmupRuns ||
    normalHomeClaimedState.warmupClass ||
    !normalHomeClaimedState.dailyClaimedClass ||
    !normalHomeClaimedState.scoreClaimedClass ||
    !normalHomeClaimedState.dailyTitle.includes("達成") ||
    !normalHomeClaimedState.dailyReward.includes("受取済み") ||
    !normalHomeClaimedState.scoreGoalTitle.includes("達成") ||
    !normalHomeClaimedState.scoreGoalReward.includes("受取済み") ||
    !normalHomeClaimedState.staminaEmptyHidden ||
    normalHomeClaimedState.staminaEmptyVisible ||
    normalHomeClaimedState.missionSummaryExists ||
    normalHomeClaimedState.missionButtonLabel !== "ミッション" ||
    normalHomeClaimedState.missionPanelsOnMenu !== 0 ||
    normalHomeClaimedState.weeklyHidden ||
    normalHomeClaimedState.horizontalOverflow
  ) {
    throw new Error(`Normal claimed home did not stay compact after warmup: ${JSON.stringify(normalHomeClaimedState)}`);
  }
  if (
    missionUnlockedState.screen !== "missions" ||
    !missionUnlockedState.missionsVisible ||
    !missionUnlockedState.lockedHidden ||
    missionUnlockedState.dailyHidden ||
    missionUnlockedState.scoreGoalHidden ||
    missionUnlockedState.weeklyHidden ||
    !missionUnlockedState.dailyClaimedClass ||
    !missionUnlockedState.scoreClaimedClass ||
    !missionUnlockedState.weeklyTitle ||
    !missionUnlockedState.weeklyProgress.includes("/") ||
    !missionUnlockedState.weeklyReward.includes("Gだるま+10") ||
    !missionUnlockedState.weeklyNote ||
    !missionUnlockedState.weeklyMeterVisible ||
    !missionUnlockedState.dailyStreakVisible ||
    !missionUnlockedState.scoreGoalMeterVisible ||
    missionUnlockedState.horizontalOverflow
  ) {
    throw new Error(`Mission screen did not render unlocked mission details cleanly: ${JSON.stringify(missionUnlockedState)}`);
  }
  if (
    !weeklyChallengeResult.rewarded ||
    weeklyChallengeResult.packStone !== 10 ||
    weeklyChallengeResult.savedPackStone !== 10 ||
    weeklyChallengeResult.weeklyChallenge.progress !== weeklyChallengeResult.target ||
    !weeklyChallengeResult.weeklyChallenge.claimed ||
    JSON.stringify(weeklyChallengeResult.savedWeeklyChallenge) !== JSON.stringify(weeklyChallengeResult.weeklyChallenge) ||
    weeklyChallengeResult.hidden ||
    !weeklyChallengeResult.claimedClass ||
    !weeklyChallengeResult.title.includes("達成") ||
    weeklyChallengeResult.progress !== weeklyChallengeResult.expectedProgress ||
    !weeklyChallengeResult.reward.includes("受取済み") ||
    weeklyChallengeResult.barWidth !== "100%" ||
    weeklyChallengeResult.horizontalOverflow
  ) {
    throw new Error(`Weekly challenge did not complete cleanly: ${JSON.stringify(weeklyChallengeResult)}`);
  }
  if (
    staminaEmptyHomeState.hidden ||
    !staminaEmptyHomeState.timer.includes("回復まで") ||
    !staminaEmptyHomeState.note.includes("報酬なし") ||
    !staminaEmptyHomeState.buttonText.includes("練習") ||
    !staminaEmptyHomeState.staminaText.includes("スタミナ 0/5") ||
    staminaEmptyHomeState.staminaPips.some(Boolean) ||
    staminaEmptyHomeState.buttonRect.width < 80 ||
    staminaEmptyHomeState.buttonRect.height < 38 ||
    staminaEmptyHomeState.rect.width < 280 ||
    staminaEmptyHomeState.rect.height < 50 ||
    staminaEmptyHomeState.horizontalOverflow
  ) {
    throw new Error(`Empty stamina home panel did not render cleanly: ${JSON.stringify(staminaEmptyHomeState)}`);
  }
  if (!staminaRecoveryResult.recovered || staminaRecoveryResult.stamina !== 5) {
    throw new Error(`Stamina did not recover after elapsed time: ${JSON.stringify(staminaRecoveryResult)}`);
  }
  if (
    !staminaAdRecoveryResult.recovered ||
    staminaAdRecoveryResult.stamina !== 4 ||
    staminaAdRecoveryResult.savedStamina !== 4 ||
    staminaAdRecoveryResult.staminaPips.filter(Boolean).length !== 4 ||
    staminaAdRecoveryResult.buttonDisabled ||
    !staminaAdRecoveryResult.buttonText.includes("TEST") ||
    !staminaAdRecoveryResult.buttonText.includes("+1") ||
    !staminaAdRecoveryResult.toast.includes("スタミナ+1")
  ) {
    throw new Error(`Rewarded stamina recovery failed: ${JSON.stringify(staminaAdRecoveryResult)}`);
  }
  if (
    !staminaPracticeResult.started ||
    staminaPracticeResult.running ||
    staminaPracticeResult.practiceMode ||
    staminaPracticeResult.stamina !== 0 ||
    staminaPracticeResult.staminaPips.some(Boolean) ||
    staminaPracticeResult.startDisabled ||
    staminaPracticeResult.restartDisabled ||
    staminaPracticeResult.packStone !== 0 ||
    staminaPracticeResult.bestScore !== 1234 ||
    staminaPracticeResult.completedRuns !== 7 ||
    staminaPracticeResult.dailyMission.progress !== 0 ||
    staminaPracticeResult.dailyMission.claimed ||
    staminaPracticeResult.dailyScoreTarget.bestScore !== 0 ||
    staminaPracticeResult.dailyScoreTarget.claimed ||
    staminaPracticeResult.weeklyChallenge.progress !== 2 ||
    staminaPracticeResult.weeklyChallenge.claimed ||
    !staminaPracticeResult.lastResultPractice ||
    staminaPracticeResult.finishRank !== "PRACTICE" ||
    !staminaPracticeResult.finishBestText.includes("報酬なし") ||
    staminaPracticeResult.finishNextChallengeExists ||
    staminaPracticeResult.finishProgressRecapExists ||
    !staminaPracticeResult.finishRewardText.includes("報酬なし") ||
    !staminaPracticeResult.finishRewardPractice ||
    !staminaPracticeResult.runningLabel.includes("練習") ||
    !staminaPracticeResult.startLabel.includes("練習") ||
    !staminaPracticeResult.restartText.includes("練習") ||
    !staminaPracticeResult.shareText.includes("練習モード") ||
    staminaPracticeResult.savedStamina !== 0 ||
    staminaPracticeResult.savedPackStone !== 0 ||
    staminaPracticeResult.savedWeeklyChallenge.progress !== 2 ||
    staminaPracticeResult.savedWeeklyChallenge.claimed ||
    staminaPracticeResult.savedBestScore !== 1234 ||
    staminaPracticeResult.savedCompletedRuns !== 7 ||
    !staminaPracticeResult.toast.includes("練習")
  ) {
    throw new Error(`No-stamina practice mode failed: ${JSON.stringify(staminaPracticeResult)}`);
  }
  if (
    !quitRunResult.started ||
    quitRunResult.staminaAfterStart !== DATA.stamina.max - DATA.stamina.playCost ||
    !quitRunResult.paused ||
    !quitRunResult.quitted ||
    quitRunResult.screen !== "menu" ||
    quitRunResult.running ||
    quitRunResult.pausedState ||
    !quitRunResult.finishHidden ||
    !quitRunResult.pauseHidden ||
    quitRunResult.stamina !== DATA.stamina.max - DATA.stamina.playCost ||
    quitRunResult.savedStamina !== quitRunResult.stamina ||
    !quitRunResult.hasQuitEvent ||
    quitRunResult.horizontalOverflow
  ) {
    throw new Error(`Quit run flow failed: ${JSON.stringify(quitRunResult)}`);
  }

  console.log(JSON.stringify({
    titleState,
    menuState,
    profileModalState,
    profileModalClosedState,
    purchaseScreenState,
    purchaseGrantState,
    purchaseRecoverState,
    rankingScreenState,
    seasonHistoryState,
    deckScreenState,
    deckBuildSwapState,
    deckBuildRedSlotBefore,
    deckBuildRedSlotState,
    deckBuildPushReplaceState,
    packScreenState,
    packLineupDetailState,
    packExchangeReadyState,
    packExchangeGuideActionState,
    packMedalExchangeState,
    packDuplicateExchangeReadyState,
    packDuplicateExchangeGuideState,
    packDuplicateExchangeState,
    packOpenState,
    packRevealActionState,
    packReentryState,
    settingsScreenState,
    ...result,
    specialCraneProbe,
    lastSpurtProbe,
    colorCycleResult,
    pauseProbe,
    pauseHoldResult,
    resumeProbe,
    tutorialMoveResult,
    postTutorialHomeState,
    dailyWordGuideState,
    dailyGiftBeforeClaimState,
    returningGiftReadyState,
    dailyGiftClaimState,
    refreshResult,
    slideResult,
    autoMatchResult,
    finishResult,
    resultDeckState,
    resultDeckReturnState,
    finishHomeResult,
    restoredHomeLastResultState,
    restoredGiftModalState,
    postRunDailyWordState,
    normalHomeClaimedState,
    missionLockedState,
    missionUnlockedState,
    weeklyChallengeResult,
    staminaEmptyHomeState,
    staminaRecoveryResult,
    staminaAdRecoveryResult,
    staminaPracticeResult,
    quitRunResult,
    screenshotPath,
    settingsScreenshotPath,
    packRevealScreenshotPath,
    resultActionsScreenshotPath,
    warmupMenuScreenshotPath,
    normalHomeClaimedScreenshotPath,
    missionsScreenshotPath,
    staminaEmptyHomeScreenshotPath,
    deckCategoryFilterScreenshotPath,
    practiceResultScreenshotPath,
    tutorialCoachScreenshotPath,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
