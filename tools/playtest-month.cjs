const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");

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

const projectRoot = path.join(__dirname, "..");
const workspaceRoot = path.join(projectRoot, "..");
const outDir = path.join(projectRoot, "dist", "month-playtest");
const screenshotDir = path.join(outDir, "screenshots");
const reportPath = path.join(outDir, "month-playtest-report.json");
const fileUrl = pathToFileURL(path.join(projectRoot, "index.html")).href;

const baseTime = new Date("2026-06-17T09:00:00+09:00").getTime();
const dayMs = 24 * 60 * 60 * 1000;

const devices = [
  { id: "iphone-se", width: 320, height: 568, isMobile: true },
  { id: "small-android", width: 360, height: 640, isMobile: true },
  { id: "iphone-8", width: 375, height: 667, isMobile: true },
  { id: "modern-phone", width: 390, height: 844, isMobile: true },
  { id: "large-phone", width: 430, height: 932, isMobile: true },
  { id: "tablet-portrait", width: 768, height: 1024, isMobile: true },
  { id: "tablet-landscape", width: 1024, height: 768, isMobile: false },
];

const screenPlans = [
  { id: "title", setup: "title" },
  { id: "home", setup: "menu" },
  { id: "game", setup: "game" },
  { id: "deck", setup: "deck" },
  { id: "pack", setup: "pack" },
  { id: "missions", setup: "missions" },
  { id: "ranking", setup: "ranking" },
  { id: "settings", setup: "settings" },
  { id: "purchase", setup: "purchase" },
];

function fakeDateInitScript() {
  return `
    (() => {
      const RealDate = Date;
      const realNow = RealDate.now.bind(RealDate);
      function currentNow() {
        return Number.isFinite(Number(window.__GUNMOJI_FAKE_NOW)) ? Number(window.__GUNMOJI_FAKE_NOW) : realNow();
      }
      class FakeDate extends RealDate {
        constructor(...args) {
          super(...(args.length ? args : [currentNow()]));
        }
        static now() {
          return currentNow();
        }
        static parse(value) {
          return RealDate.parse(value);
        }
        static UTC(...args) {
          return RealDate.UTC(...args);
        }
      }
      window.__GUNMOJI_FAKE_NOW = ${baseTime};
      window.Date = FakeDate;
    })();
  `;
}

function isOptionalRankingConnectionError(message) {
  return String(message).includes("Failed to load resource: net::ERR_CONNECTION_REFUSED");
}

async function preparePage(browser, viewport) {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: Boolean(viewport.isMobile),
    hasTouch: Boolean(viewport.isMobile),
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  await page.addInitScript(fakeDateInitScript());
  return { page, errors };
}

async function gotoApp(page, offsetDays = 0, clear = false) {
  await page.goto(fileUrl);
  await page.evaluate((now) => {
    window.__GUNMOJI_FAKE_NOW = now;
  }, baseTime + offsetDays * dayMs);
  if (clear) {
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.evaluate((now) => {
      window.__GUNMOJI_FAKE_NOW = now;
    }, baseTime + offsetDays * dayMs);
  }
  await page.waitForSelector("#titleStartButton");
  await page.evaluate(() => document.fonts?.ready || Promise.resolve());
}

async function setDay(page, offsetDays) {
  await page.evaluate((now) => {
    window.__GUNMOJI_FAKE_NOW = now;
  }, baseTime + offsetDays * dayMs);
}

async function bootstrapUnlockedState(page) {
  await page.evaluate(() => {
    const app = window.KanaGunmaPrototype;
    const state = app.state;
    const cards = app.data.cards;
    state.tutorialComplete = true;
    state.completedRuns = Math.max(state.completedRuns, app.warmupRuns);
    state.stamina = app.staminaMax;
    state.staminaUpdatedAt = Date.now();
    state.packStone = Math.max(state.packStone, 35);
    state.owned = Object.fromEntries(cards.map((card) => [card.id, state.owned?.[card.id] || 0]));
    for (const id of app.data.basicDeckIds) {
      state.owned[id] = Math.max(1, state.owned[id] || 0);
    }
    for (const id of ["season1-maebashi", "season1-ota", "season1-numata", "season1-tatebayashi", "season1-midori"]) {
      state.owned[id] = Math.max(1, state.owned[id] || 0);
    }
    state.deckIds = ["basic-gunma-ken", "season1-maebashi", "season1-ota"];
    state.deckSlotColors = ["yellow", "red", "blue"];
    state.pushCardId = "season1-maebashi";
    state.guideCardId = "season1-maebashi";
    state.settings.reduceMotion = true;
    state.settings.largeText = false;
    state.settings.highContrast = false;
    state.settings.tileMarks = true;
    saveMonthState(app);
    app.showScreen("menu");

    function saveMonthState(appInstance) {
      const s = appInstance.state;
      localStorage.setItem(
        "kana-gunmatsuri-save-v1",
        JSON.stringify({
          version: 1,
          owned: s.owned,
          packStone: s.packStone,
          packMedals: s.packMedals,
          packMedalsByPack: s.packMedalsByPack,
          selectedPackId: s.selectedPackId,
          choiceTickets: s.choiceTickets,
          stamina: s.stamina,
          staminaUpdatedAt: s.staminaUpdatedAt,
          dailyMission: s.dailyMission,
          dailyScoreTarget: s.dailyScoreTarget,
          weeklyChallenge: s.weeklyChallenge,
          dailyGift: s.dailyGift,
          dailyWord: s.dailyWord,
          dailyStreak: s.dailyStreak,
          completedRuns: s.completedRuns,
          playerXp: s.playerXp,
          playerName: s.playerName,
          selectedTitleId: s.selectedTitleId,
          tutorialComplete: s.tutorialComplete,
          telemetryEvents: s.telemetryEvents,
          quickFeedback: s.quickFeedback,
          deckIds: s.deckIds,
          deckSlotColors: s.deckSlotColors,
          pushCardId: s.pushCardId,
          collectionFilterId: s.collectionFilterId,
          collectionLengthFilterId: s.collectionLengthFilterId,
          collectionSortId: s.collectionSortId,
          bestScore: s.bestScore,
          seasonRecords: s.seasonRecords,
          dailyRanking: s.dailyRanking,
          playerId: s.playerId,
          rankingOnline: s.rankingOnline,
          bestWordRecord: s.bestWordRecord,
          lastResult: s.lastResult,
          settings: s.settings,
        }),
      );
    }
  });
}

async function runMonthSimulation(page) {
  const dailySummaries = [];
  await gotoApp(page, 0, true);
  await page.locator("#titleStartButton").click();
  await page.waitForTimeout(100);

  for (let day = 0; day < 30; day += 1) {
    await setDay(page, day);
    await page.reload();
    await setDay(page, day);
    await page.waitForSelector("#titleStartButton");
    await page.locator("#titleStartButton").click();
    await page.waitForTimeout(60);
    if (day === 0) {
      await bootstrapUnlockedState(page);
    }

    const summary = await page.evaluate(({ day }) => {
      const app = window.KanaGunmaPrototype;
      const state = app.state;
      const runCount = day < 3 ? 2 : day % 7 === 6 ? 5 : 4;
      const deckRotation = [
        ["basic-gunma-ken", "basic-daruma", "basic-akagi-san"],
        ["season1-maebashi", "season1-ota", "season1-numata"],
        ["season1-tatebayashi", "season1-midori", "basic-gunma-ken"],
      ][day % 3];
      const pushCard = deckRotation[day % deckRotation.length];

      state.tutorialComplete = true;
      state.deckIds = deckRotation.slice();
      state.pushCardId = pushCard;
      state.deckSlotColors = ["yellow", "red", "green"];
      state.stamina = app.staminaMax;
      state.staminaUpdatedAt = Date.now();
      app.showScreen("menu");
      if (!state.dailyGift.claimed && state.completedRuns > 0) {
        app.claimDailyGift();
      }

      let normalRuns = 0;
      let practiceRuns = 0;
      let scoreSum = 0;
      let matchesSum = 0;
      for (let index = 0; index < runCount; index += 1) {
        app.showScreen("game");
        const started = app.startRun();
        if (!started) {
          practiceRuns += 1;
          continue;
        }
        const practice = state.practiceMode;
        const score = 4200 + day * 340 + index * 910 + (day % 5) * 700;
        const matches = 9 + (day % 6) + index * 2;
        state.startCountdown = 0;
        state.score = practice ? Math.floor(score * 0.58) : score;
        state.maxCombo = 4 + (day % 9) + index;
        state.runStats.matches = matches;
        state.runStats.bestWord = "ぐんまけん";
        state.runStats.bestWordCardId = "basic-gunma-ken";
        state.runStats.bestWordScore = Math.max(3750, Math.floor(score * 0.28));
        state.runStats.bestWordLength = 5;
        state.runStats.cardClears = Object.fromEntries(deckRotation.map((id, cardIndex) => [id, Math.max(1, Math.floor(matches / (cardIndex + 3)))]));
        app.finishRun();
        if (practice) {
          practiceRuns += 1;
        } else {
          normalRuns += 1;
          scoreSum += score;
          matchesSum += matches;
        }
      }

      const dailyMission = app.currentDailyMissionDefinition();
      const dailyTarget = dailyMission.target;
      if (dailyMission.type === "matches" && !state.dailyMission.claimed) {
        state.dailyMission.progress = Math.min(dailyTarget, matchesSum);
      }
      if (dailyMission.type === "matches" && !state.dailyMission.claimed && state.dailyMission.progress >= dailyTarget) {
        state.dailyMission.claimed = true;
        state.packStone += dailyMission.rewardAmount || 1;
        app.updateDailyStreakOnClaim();
      }

      const pack = app.data.packs[0];
      let packOpens = 0;
      while (state.packStone >= pack.cost && packOpens < 2) {
        app.showScreen("pack");
        const beforeStone = state.packStone;
        app.openPack();
        if (state.packStone === beforeStone) {
          break;
        }
        state.packOpeningOpen = false;
        packOpens += 1;
      }

      if (day === 16) {
        state.packMedalsByPack[pack.id] = Math.max(state.packMedalsByPack[pack.id] || 0, pack.exchangeMedalCost || 50);
        state.packMedals = state.packMedalsByPack[pack.id];
        app.showScreen("pack");
        app.openPack();
      }

      if (day === 22) {
        state.stamina = 1;
        state.packStone = Math.max(state.packStone, app.gStaminaFullRecoveryCost);
        app.recoverStaminaWithG();
      }

      app.showScreen("menu");
      saveMonthState(app);
      return {
        day: day + 1,
        dateKey: app.todayDateKey(),
        normalRuns,
        practiceRuns,
        scoreSum,
        matchesSum,
        packOpens,
        completedRuns: state.completedRuns,
        stamina: state.stamina,
        packStone: state.packStone,
        packMedals: state.packMedals,
        ownedUnique: Object.values(state.owned).filter((count) => count > 0).length,
        maxOwned: Math.max(...Object.values(state.owned)),
        dailyClaimed: state.dailyMission.claimed,
        weeklyProgress: state.weeklyChallenge.progress,
        weeklyClaimed: state.weeklyChallenge.claimed,
        bestScore: state.bestScore,
        playerRank: app.playerRankProgress().rank,
        rankingPending: state.rankingOnline?.pending?.length || 0,
      };

      function saveMonthState(appInstance) {
        const s = appInstance.state;
        localStorage.setItem(
          "kana-gunmatsuri-save-v1",
          JSON.stringify({
            version: 1,
            owned: s.owned,
            packStone: s.packStone,
            packMedals: s.packMedals,
            packMedalsByPack: s.packMedalsByPack,
            selectedPackId: s.selectedPackId,
            choiceTickets: s.choiceTickets,
            stamina: s.stamina,
            staminaUpdatedAt: s.staminaUpdatedAt,
            dailyMission: s.dailyMission,
            dailyScoreTarget: s.dailyScoreTarget,
            weeklyChallenge: s.weeklyChallenge,
            dailyGift: s.dailyGift,
            dailyWord: s.dailyWord,
            dailyStreak: s.dailyStreak,
            completedRuns: s.completedRuns,
            playerXp: s.playerXp,
            playerName: s.playerName,
            selectedTitleId: s.selectedTitleId,
            tutorialComplete: s.tutorialComplete,
            telemetryEvents: s.telemetryEvents,
            quickFeedback: s.quickFeedback,
            deckIds: s.deckIds,
            deckSlotColors: s.deckSlotColors,
            pushCardId: s.pushCardId,
            collectionFilterId: s.collectionFilterId,
            collectionLengthFilterId: s.collectionLengthFilterId,
            collectionSortId: s.collectionSortId,
            bestScore: s.bestScore,
            seasonRecords: s.seasonRecords,
            dailyRanking: s.dailyRanking,
            playerId: s.playerId,
            rankingOnline: s.rankingOnline,
            bestWordRecord: s.bestWordRecord,
            lastResult: s.lastResult,
            settings: s.settings,
          }),
        );
      }
    }, { day });

    dailySummaries.push(summary);
  }

  const finalState = await page.evaluate(() => {
    const app = window.KanaGunmaPrototype;
    const state = app.state;
    app.showScreen("menu");
    return {
      currentScreen: state.currentScreen,
      completedRuns: state.completedRuns,
      playerRank: app.playerRankProgress().rank,
      playerXp: state.playerXp,
      bestScore: state.bestScore,
      packStone: state.packStone,
      packMedals: state.packMedals,
      choiceTickets: state.choiceTickets,
      ownedUnique: Object.values(state.owned).filter((count) => count > 0).length,
      tenLimitBreakCount: Object.values(state.owned).filter((count) => count >= 11).length,
      dailyStreak: state.dailyStreak.count,
      weeklyProgress: state.weeklyChallenge.progress,
      weeklyClaimed: state.weeklyChallenge.claimed,
      rankingPending: state.rankingOnline?.pending?.length || 0,
      lastResultScore: state.lastResult?.score || 0,
      deckIds: state.deckIds.slice(),
      pushCardId: state.pushCardId,
    };
  });

  return { dailySummaries, finalState };
}

async function prepareResponsiveScreen(page, setup) {
  await gotoApp(page, 0, true);
  if (setup !== "title") {
    await page.locator("#titleStartButton").click();
    await page.waitForTimeout(70);
    await bootstrapUnlockedState(page);
  }

  await page.evaluate((setup) => {
    const app = window.KanaGunmaPrototype;
    const state = app.state;
    state.settings.reduceMotion = true;
    state.settings.tileMarks = true;
    state.packStone = Math.max(state.packStone, 60);
    const pack = app.data.packs[0];
    state.packMedalsByPack[pack.id] = Math.max(state.packMedalsByPack[pack.id] || 0, 12);
    state.packMedals = state.packMedalsByPack[pack.id];

    if (setup === "menu") {
      app.showScreen("menu");
    } else if (setup === "game") {
      app.showScreen("game");
      app.startRun();
      state.startCountdown = 0;
      state.timeLeft = 42.5;
      state.score = 34567;
    } else if (setup === "deck") {
      state.guideCardId = "season1-maebashi";
      state.collectionFilterId = "all";
      state.collectionLengthFilterId = "all";
      app.showScreen("deck");
    } else if (setup === "pack") {
      app.showScreen("pack");
      app.openPack();
      state.packOpeningOpen = false;
      app.showScreen("pack");
    } else if (setup === "missions") {
      app.showScreen("missions");
    } else if (setup === "ranking") {
      app.showScreen("ranking");
    } else if (setup === "settings") {
      app.showScreen("settings");
    } else if (setup === "purchase") {
      app.showScreen("purchase");
    }
  }, setup);

  await page.waitForTimeout(220);
}

async function checkLayout(page, label) {
  return page.evaluate((label) => {
    const visibleScreen =
      Array.from(document.querySelectorAll(".app-screen")).find((screen) => !screen.hidden) ||
      (!document.querySelector("#titleScreen").hidden ? document.querySelector("#titleScreen") : document.body);
    const horizontalOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    const viewport = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
    };
    const screenRect = visibleScreen.getBoundingClientRect();
    const clipRect = (rect, bounds) => ({
      left: Math.max(rect.left, bounds.left),
      right: Math.min(rect.right, bounds.right),
      top: Math.max(rect.top, bounds.top),
      bottom: Math.min(rect.bottom, bounds.bottom),
    });
    const clipRectToVisibleArea = (element, rect) => {
      let clippedRect = clipRect(
        clipRect(rect, screenRect),
        { left: 0, right: viewport.width, top: 0, bottom: viewport.height },
      );
      let parent = element.parentElement;
      while (parent && parent !== document.body) {
        const style = getComputedStyle(parent);
        const clips = parent === visibleScreen || /(auto|scroll|hidden|clip)/.test(`${style.overflowX} ${style.overflowY}`);
        if (clips) {
          clippedRect = clipRect(clippedRect, parent.getBoundingClientRect());
        }
        if (parent === visibleScreen) {
          break;
        }
        parent = parent.parentElement;
      }
      return clippedRect;
    };
    const rectsIntersect = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    const rectArea = (rect) => Math.max(0, rect.right - rect.left) * Math.max(0, rect.bottom - rect.top);
    const selector = [
      "button",
      "a",
      "h1",
      "h2",
      "h3",
      "p",
      "span",
      "strong",
      "em",
      "small",
      "label",
      ".menu-button",
      ".stat-card",
      ".ranking-row",
      ".word-guide-card",
      ".collection-list-card",
      ".pack-card",
      ".game-deck-legend-card",
      ".finish-card",
      ".daily-word-panel",
      ".weekly-challenge-panel",
    ].join(",");
    const clipped = Array.from(visibleScreen.querySelectorAll(selector))
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const text = element.textContent.replace(/\s+/g, " ").trim();
        if (!text || rect.width < 2 || rect.height < 2) {
          return false;
        }
        if (element.matches(".pack-select-card,#openPackButton")) {
          return false;
        }
        const style = getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden" || element.closest("[hidden]")) {
          return false;
        }
        if (style.textOverflow === "ellipsis") {
          return false;
        }
        if (/(auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`)) {
          return false;
        }
        const overX = element.scrollWidth > element.clientWidth + 2 && style.overflowX !== "visible";
        const overY = element.scrollHeight > element.clientHeight + 3 && style.overflowY !== "visible";
        return overX || overY;
      })
      .slice(0, 16)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          id: element.id || "",
          className: String(element.className || "").slice(0, 120),
          text: element.textContent.replace(/\s+/g, " ").trim().slice(0, 90),
          rect: { width: Math.round(rect.width), height: Math.round(rect.height) },
          scroll: { width: element.scrollWidth, height: element.scrollHeight },
        };
      });

    const game = document.querySelector("#gameScreen");
    const canvas = document.querySelector("#gameCanvas");
    const wordCall = document.querySelector("#wordCall");
    const finish = document.querySelector("#finishCard");
    const adBanner = document.querySelector("#adBanner");
    const playfield = canvas?.getBoundingClientRect();
    const overlayRects = [wordCall, finish]
      .filter((element) => element && !element.hidden && getComputedStyle(element).display !== "none")
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const intersects =
          playfield &&
          rect.left < playfield.right &&
          rect.right > playfield.left &&
          rect.top < playfield.bottom &&
          rect.bottom > playfield.top;
        return { id: element.id, intersectsPlayfield: Boolean(intersects), text: element.textContent.replace(/\s+/g, " ").trim().slice(0, 80) };
      });

    const adRect =
      adBanner && getComputedStyle(adBanner).display !== "none" ? adBanner.getBoundingClientRect() : null;
    const adOverlap = adRect
      ? Array.from(
          visibleScreen.querySelectorAll(
            "button,.ranking-row,.purchase-bundle-card,.pack-card,.pack-actions,.settings-panel,.mission-card,.daily-word-panel,.weekly-challenge-panel",
          ),
        )
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            const visibleRect = clipRectToVisibleArea(element, rect);
            const style = getComputedStyle(element);
            if (style.display === "none" || style.visibility === "hidden" || element.closest("[hidden]")) {
              return false;
            }
            if (rectArea(visibleRect) <= 0 || !rectsIntersect(visibleRect, adRect)) {
              return false;
            }
            const overlapW = Math.min(visibleRect.right, adRect.right) - Math.max(visibleRect.left, adRect.left);
            const overlapH = Math.min(visibleRect.bottom, adRect.bottom) - Math.max(visibleRect.top, adRect.top);
            return overlapW * overlapH > 32;
          })
          .slice(0, 8)
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              tag: element.tagName.toLowerCase(),
              id: element.id || "",
              className: String(element.className || "").slice(0, 120),
              text: element.textContent.replace(/\s+/g, " ").trim().slice(0, 80),
              rect: { top: Math.round(rect.top), bottom: Math.round(rect.bottom), height: Math.round(rect.height) },
            };
          })
      : [];

    return {
      label,
      screenId: visibleScreen.id,
      viewport,
      horizontalOverflow,
      clipped,
      overlayRects: game && !game.hidden ? overlayRects : [],
      adOverlap,
    };
  }, label);
}

async function runResponsiveChecks(browser) {
  const results = [];
  for (const device of devices) {
    const { page, errors } = await preparePage(browser, device);
    for (const plan of screenPlans) {
      await prepareResponsiveScreen(page, plan.setup);
      const label = `${device.id}-${plan.id}`;
      const layout = await checkLayout(page, label);
      const screenshotPath = path.join(screenshotDir, `${label}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      results.push({
        device,
        screen: plan.id,
        screenshot: path.relative(workspaceRoot, screenshotPath),
        layout,
      });
    }
    const blockingErrors = errors.filter((message) => !isOptionalRankingConnectionError(message));
    assert.deepEqual(blockingErrors, [], `${device.id} browser errors: ${blockingErrors.join(" | ")}`);
    await page.close();
  }
  return results;
}

function buildFindings(monthResult, responsiveResults) {
  const findings = [];
  const warnings = [];
  const overflow = responsiveResults.filter((result) => result.layout.horizontalOverflow);
  if (overflow.length) {
    findings.push({
      severity: "high",
      title: "Horizontal overflow detected",
      cases: overflow.map((result) => result.layout.label),
    });
  }
  const clipped = responsiveResults.filter((result) => result.layout.clipped.length > 0);
  if (clipped.length) {
    warnings.push({
      severity: "medium",
      title: "Potential clipped text candidates",
      cases: clipped.map((result) => ({ label: result.layout.label, clipped: result.layout.clipped })),
    });
  }
  const obstructing = responsiveResults.filter((result) => result.layout.overlayRects.some((overlay) => overlay.intersectsPlayfield && overlay.id !== "finishCard"));
  if (obstructing.length) {
    findings.push({
      severity: "high",
      title: "Non-result overlay intersects the live playfield",
      cases: obstructing.map((result) => ({ label: result.layout.label, overlays: result.layout.overlayRects })),
    });
  }
  const adOverlaps = responsiveResults.filter((result) => result.layout.adOverlap.length > 0);
  if (adOverlaps.length) {
    findings.push({
      severity: "high",
      title: "Ad banner overlaps visible screen controls",
      cases: adOverlaps.map((result) => ({ label: result.layout.label, overlap: result.layout.adOverlap })),
    });
  }

  const finalState = monthResult.finalState;
  if (finalState.completedRuns < 95) {
    warnings.push({
      severity: "low",
      title: "One-month active-player run count lower than expected",
      detail: finalState.completedRuns,
    });
  }
  if (finalState.playerRank > 35) {
    warnings.push({
      severity: "medium",
      title: "Player rank may climb too quickly after one month",
      detail: finalState.playerRank,
    });
  }
  if (finalState.packStone > 60) {
    warnings.push({
      severity: "low",
      title: "Gだるま stockpile remains high after recurring pack opens",
      detail: finalState.packStone,
    });
  }
  return { findings, warnings };
}

async function main() {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });

  try {
    const monthPage = await preparePage(browser, { width: 390, height: 844, isMobile: true });
    const monthResult = await runMonthSimulation(monthPage.page);
    const monthBlockingErrors = monthPage.errors.filter((message) => !isOptionalRankingConnectionError(message));
    assert.deepEqual(monthBlockingErrors, [], `month simulation browser errors: ${monthBlockingErrors.join(" | ")}`);
    await monthPage.page.screenshot({ path: path.join(screenshotDir, "month-final-home.png"), fullPage: true });
    await monthPage.page.close();

    const responsiveResults = await runResponsiveChecks(browser);
    const { findings, warnings } = buildFindings(monthResult, responsiveResults);
    assert.deepEqual(findings, [], `month playtest findings: ${JSON.stringify(findings, null, 2)}`);

    const report = {
      ok: findings.length === 0,
      generatedAt: new Date().toISOString(),
      baseDate: "2026-06-17",
      daysSimulated: 30,
      devices,
      monthResult,
      responsiveSummary: responsiveResults.map((result) => ({
        device: result.device.id,
        screen: result.screen,
        screenshot: result.screenshot,
        horizontalOverflow: result.layout.horizontalOverflow,
        clippedCount: result.layout.clipped.length,
        adOverlapCount: result.layout.adOverlap.length,
        viewport: result.layout.viewport,
      })),
      findings,
      warnings,
    };
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
    console.log(
      JSON.stringify(
        {
          ok: report.ok,
          daysSimulated: report.daysSimulated,
          finalState: report.monthResult.finalState,
          responsiveCases: report.responsiveSummary.length,
          warnings: report.warnings.map((warning) => ({
            severity: warning.severity,
            title: warning.title,
            detail: warning.detail,
            cases: Array.isArray(warning.cases) ? warning.cases.length : undefined,
          })),
          report: path.relative(workspaceRoot, reportPath),
          screenshots: path.relative(workspaceRoot, screenshotDir),
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
