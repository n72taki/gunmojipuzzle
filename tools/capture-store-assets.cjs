const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
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
const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const publicMode = process.argv.includes("--public");
const outputDir = path.join(projectRoot, "store-assets", publicMode ? "public-screenshots" : "screenshots");

async function waitForApp(page) {
  await page.waitForSelector("#titleStartButton");
  await page.evaluate(() => document.fonts?.ready || Promise.resolve());
  await page.waitForTimeout(120);
}

async function preparePublicStoreCapture(page) {
  if (!publicMode) {
    return;
  }
  await page.evaluate(() => {
    document.body.classList.add("store-public-capture");
    if (!document.querySelector("#store-public-capture-style")) {
      const style = document.createElement("style");
      style.id = "store-public-capture-style";
      style.textContent = `
        body.store-public-capture #adButton,
        body.store-public-capture #testBuyButton,
        body.store-public-capture #staminaAdButton,
        body.store-public-capture .feedback-panel {
          display: none !important;
        }
        body.store-public-capture .pack-actions {
          grid-template-columns: 1fr !important;
        }
      `;
      document.head.appendChild(style);
    }
    const packNotice = document.querySelector("#packTestNotice");
    if (packNotice) {
      packNotice.querySelector("span").textContent = "PACK PREVIEW";
      packNotice.querySelector("strong").textContent = "確率表示つきカード入手";
      packNotice.querySelector("p").textContent = "ゲーム内アイテムで入手できます。";
    }
  });
}

async function capture(page, fileName) {
  await preparePublicStoreCapture(page);
  if (publicMode) {
    const visibleText = await page.locator("body").innerText();
    for (const forbidden of ["CLOSED TEST", "TEST AD", "TEST GRANT", "テストフィードバック", "非PII"]) {
      if (visibleText.includes(forbidden)) {
        throw new Error(`Public screenshot still contains closed-test copy "${forbidden}": ${fileName}`);
      }
    }
  }
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  if (horizontalOverflow) {
    throw new Error(`Horizontal overflow before screenshot: ${fileName}`);
  }
  const filePath = path.join(outputDir, fileName);
  await page.screenshot({ path: filePath, fullPage: false });
  return filePath;
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
  });
  const page = await browser.newPage({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 3,
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

  try {
    await page.goto(pathToFileURL(path.join(projectRoot, "index.html")).href);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await waitForApp(page);

    const shots = [];
    shots.push(await capture(page, "01-title.png"));

    await page.locator("#titleStartButton").click();
    await page.waitForTimeout(100);
    await page.evaluate(() => {
      const app = window.KanaGunmaPrototype;
      const state = app.state;
      state.tutorialComplete = true;
      state.completedRuns = Math.max(state.completedRuns, app.warmupRuns);
      state.stamina = 4;
      state.packStone = Math.max(state.packStone, 3);
      const dailyMission = app.currentDailyMissionDefinition();
      const weeklyMission = app.currentWeeklyMissionDefinition();
      state.dailyMission = { dateKey: app.todayDateKey(), id: dailyMission.id, progress: Math.min(2, dailyMission.target), claimed: false };
      state.dailyScoreTarget = { dateKey: app.todayDateKey(), bestScore: 3600, claimed: false };
      state.weeklyChallenge = { weekKey: app.currentWeekKey(), id: weeklyMission.id, progress: Math.min(5, weeklyMission.target), claimed: false };
      app.showScreen("menu");
    });
    await page.waitForTimeout(160);
    shots.push(await capture(page, "02-home.png"));

    await page.locator("#seasonRankingCard").click();
    await page.waitForTimeout(160);
    shots.push(await capture(page, "09-ranking.png"));
    await page.locator('#rankingScreen [data-nav-target="menu"]').click();
    await page.waitForTimeout(100);

    await page.evaluate(() => {
      const app = window.KanaGunmaPrototype;
      app.showScreen("game");
      app.startRun();
    });
    await page.waitForTimeout(900);
    shots.push(await capture(page, "03-gameplay.png"));

    await page.evaluate(() => {
      const app = window.KanaGunmaPrototype;
      const state = app.state;
      state.score = 8800;
      state.maxCombo = 4;
      state.runStats = {
        matches: 4,
        bestWord: "ぐんまけん",
        bestWordCardId: "basic-gunma-ken",
        bestWordScore: 3100,
        bestWordLength: 5,
      };
      app.finishRun();
    });
    await page.waitForTimeout(180);
    shots.push(await capture(page, "04-result.png"));

    await page.evaluate(() => window.KanaGunmaPrototype.showScreen("deck"));
    await page.waitForTimeout(180);
    shots.push(await capture(page, "05-deck.png"));

    await page.evaluate(() => {
      const app = window.KanaGunmaPrototype;
      app.state.packStone = 10;
      app.showScreen("pack");
      app.openPack();
    });
    await page.waitForTimeout(700);
    shots.push(await capture(page, "06-pack.png"));

    await page.evaluate(() => window.KanaGunmaPrototype.showScreen("settings"));
    await page.waitForTimeout(180);
    shots.push(await capture(page, "07-settings.png"));

    await page.evaluate(() => {
      const app = window.KanaGunmaPrototype;
      const state = app.state;
      state.completedRuns = Math.max(state.completedRuns, app.warmupRuns);
      const dailyMission = app.currentDailyMissionDefinition();
      const weeklyMission = app.currentWeeklyMissionDefinition();
      state.dailyMission = { dateKey: app.todayDateKey(), id: dailyMission.id, progress: dailyMission.target, claimed: true };
      state.dailyScoreTarget = { dateKey: app.todayDateKey(), bestScore: 5000, claimed: true };
      state.weeklyChallenge = { weekKey: app.currentWeekKey(), id: weeklyMission.id, progress: Math.min(5, weeklyMission.target), claimed: false };
      app.showScreen("missions");
    });
    await page.waitForTimeout(180);
    shots.push(await capture(page, "08-missions.png"));

    if (errors.length > 0) {
      throw new Error(`Browser errors:\n${errors.join("\n")}`);
    }

    console.log(
      JSON.stringify(
        {
          outputDir: path.relative(workspaceRoot, outputDir),
          mode: publicMode ? "public-store" : "closed-test",
          viewport: "430x932 @3x",
          files: shots.map((filePath) => path.relative(workspaceRoot, filePath)),
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
