const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = path.join(__dirname, "..");
const dbPath = path.join(os.tmpdir(), `gunmoji-ranking-${Date.now()}-${Math.random().toString(36).slice(2)}.sqlite3`);
const renderDbPath = path.join(os.tmpdir(), `gunmoji-ranking-render-${Date.now()}-${Math.random().toString(36).slice(2)}.sqlite3`);
const DATA = require("../data/cards.js");
const renderConfigPath = path.join(root, "server", "ranking-config.json");
const renderBlueprint = fs.readFileSync(path.join(root, "render.yaml"), "utf8");
const requirements = fs.readFileSync(path.join(root, "requirements.txt"), "utf8");

function expectedRankingConfig() {
  return {
    deckSize: DATA.deckSize,
    rankingSeason: DATA.rankingSeason,
    cards: DATA.cards.map((card) => ({
      id: card.id,
      readingKana: card.readingKana,
    })),
  };
}

assert.deepEqual(
  JSON.parse(fs.readFileSync(renderConfigPath, "utf8")),
  expectedRankingConfig(),
  "server/ranking-config.json should match data/cards.js for Render deploys",
);
assert.ok(renderBlueprint.includes("DATABASE_URL"), "Render Blueprint should connect the API to Postgres");
assert.ok(renderBlueprint.includes("gunmoji-ranking-db"), "Render Blueprint should define the ranking Postgres database");
assert.ok(renderBlueprint.includes("basic-256mb"), "Render Blueprint should use the low-cost Postgres plan");
assert.ok(renderBlueprint.includes("autoDeployTrigger: commit"), "Render Blueprint should use the current auto-deploy field");
assert.ok(requirements.includes("psycopg"), "Render Python build should install the Postgres driver");

function waitForServer(child) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("ranking server did not start")), 5000);
    child.stdout.on("data", (chunk) => {
      const text = chunk.toString("utf8").trim();
      if (!text) {
        return;
      }
      try {
        const payload = JSON.parse(text.split(/\r?\n/).at(-1));
        clearTimeout(timer);
        resolve(payload.url);
      } catch (error) {
        reject(error);
      }
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code !== null && code !== 0) {
        reject(new Error(`ranking server exited early: ${code}`));
      }
    });
  });
}

function waitForExit(child) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    child.once("exit", resolve);
  });
}

function bundledPythonPath() {
  return path.join(
    os.homedir(),
    ".cache",
    "codex-runtimes",
    "codex-primary-runtime",
    "dependencies",
    "python",
    "python.exe",
  );
}

function pythonCommand() {
  if (process.env.PYTHON) {
    return { command: process.env.PYTHON, args: [] };
  }
  if (fs.existsSync(bundledPythonPath())) {
    return { command: bundledPythonPath(), args: [] };
  }
  return { command: "python", args: [] };
}

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json();
  assert.ok(response.ok, `request failed ${response.status}: ${JSON.stringify(payload)}`);
  return payload;
}

async function rawJsonFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  return { response, payload: await response.json() };
}

(async () => {
  const child = spawn(process.execPath, [path.join(root, "server", "ranking-server.cjs")], {
    cwd: root,
    env: {
      ...process.env,
      RANKING_PORT: "0",
      RANKING_DB_PATH: dbPath,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString("utf8");
  });

  try {
    const baseUrl = await waitForServer(child);
    const health = await jsonFetch(`${baseUrl}/api/health`);
    assert.equal(health.ok, true, "health endpoint should be healthy");
    assert.equal(health.backend, "sqlite", "ranking server should use SQLite");
    const profileOnly = await jsonFetch(`${baseUrl}/api/player/profile`, {
      method: "POST",
      body: JSON.stringify({
        playerId: "player-profile-only",
        playerName: "Profile",
        selectedTitleId: "score-b",
        selectedTitle: "Title",
        playerRank: 4,
        playerXp: 920,
        bestScore: 4321,
      }),
    });
    assert.equal(profileOnly.profile.playerName, "Profile", "profile endpoint should store name without a score submission");
    assert.equal(profileOnly.profile.playerRank, 4, "profile endpoint should store rank without a score submission");
    const fetchedProfileOnly = await jsonFetch(`${baseUrl}/api/player/profile/player-profile-only`);
    assert.equal(fetchedProfileOnly.profile.selectedTitleId, "score-b", "profile endpoint should fetch stored selected title");

    const submitA = await jsonFetch(`${baseUrl}/api/ranking/submit`, {
      method: "POST",
      body: JSON.stringify({
        playerId: "player-check-alpha",
        playerName: "A",
        seasonId: "season-1",
        stageId: "season-1",
        dailyDateKey: "2026-06-22",
        score: 12345,
        rank: "B",
        matches: 12,
        maxCombo: 8,
        bestWord: "ぐんまけん",
        bestWordCardId: "basic-gunma-ken",
        deckIds: ["basic-gunma-ken", "basic-daruma", "basic-akagi-san"],
        selectedTitleId: "score-b",
        selectedTitle: "からっ風チャレンジャー",
        playerRank: 3,
        playerXp: 780,
        buildId: "check",
      }),
    });
    assert.equal(submitA.ok, true, "submit should succeed");

    await jsonFetch(`${baseUrl}/api/ranking/submit`, {
      method: "POST",
      body: JSON.stringify({
        playerId: "player-check-bravo",
        playerName: "B",
        seasonId: "season-1",
        stageId: "season-1",
        dailyDateKey: "2026-06-22",
        score: 22222,
        rank: "A",
        deckIds: ["basic-gunma-ken", "basic-daruma", "basic-akagi-san"],
        selectedTitleId: "score-a",
        selectedTitle: "赤城の達人",
        playerRank: 4,
        playerXp: 1200,
      }),
    });
    await jsonFetch(`${baseUrl}/api/ranking/submit`, {
      method: "POST",
      body: JSON.stringify({
        playerId: "player-check-alpha",
        playerName: "A",
        seasonId: "season-1",
        stageId: "season-1",
        dailyDateKey: "2026-06-22",
        score: 100,
        rank: "D",
        deckIds: ["basic-gunma-ken", "basic-daruma", "basic-akagi-san"],
        selectedTitleId: "score-d",
        selectedTitle: "上毛見習い",
        playerRank: 1,
        playerXp: 10,
      }),
    });

    const tooHigh = await rawJsonFetch(`${baseUrl}/api/ranking/submit`, {
      method: "POST",
      body: JSON.stringify({
        playerId: "player-check-alpha",
        playerName: "A",
        seasonId: "season-1",
        stageId: "season-1",
        score: 999999999,
        rank: "S",
        deckIds: ["basic-gunma-ken", "basic-daruma", "basic-akagi-san"],
      }),
    });
    assert.equal(tooHigh.response.status, 400, "absurd scores should be rejected");
    assert.match(tooHigh.payload.error, /score exceeds/, "absurd score rejection should be explicit");

    for (let index = 0; index < 100; index += 1) {
      await jsonFetch(`${baseUrl}/api/ranking/submit`, {
        method: "POST",
        body: JSON.stringify({
          playerId: `player-check-bot-${String(index).padStart(3, "0")}`,
          playerName: `BOT${index}`,
          seasonId: "season-1",
          stageId: "season-1",
          score: 20000 + index,
          rank: "A",
          deckIds: ["basic-gunma-ken", "basic-daruma", "basic-akagi-san"],
        }),
      });
    }

    const ranking = await jsonFetch(`${baseUrl}/api/ranking/season/season-1/stage/season-1?playerId=player-check-alpha&limit=100`);
    assert.equal(ranking.entries.length, 101, "ranking should return top 100 plus the requested player outside the list");
    assert.equal(ranking.entries[0].playerId, "player-check-bravo", "higher score should rank first");
    const ownSeasonEntry = ranking.entries.at(-1);
    assert.equal(ownSeasonEntry.playerId, "player-check-alpha", "requested player should be appended when outside top 100");
    assert.equal(ownSeasonEntry.score, 12345, "lower replay should not overwrite best score");
    assert.equal(ownSeasonEntry.rank, 102, "requested player should keep their real season rank outside top 100");
    assert.equal(ownSeasonEntry.isPlayer, true, "requested player should be marked");
    const dailyRanking = await jsonFetch(`${baseUrl}/api/ranking/daily/2026-06-22?playerId=player-check-alpha&limit=10`);
    assert.equal(dailyRanking.dailyDateKey, "2026-06-22", "daily ranking should echo the requested date");
    assert.equal(dailyRanking.entries.length, 2, "daily ranking should include submitted players");
    assert.equal(dailyRanking.entries[0].playerId, "player-check-bravo", "higher daily score should rank first");
    assert.equal(dailyRanking.entries[1].score, 12345, "lower daily replay should not overwrite best score");
    assert.equal(dailyRanking.entries[1].isPlayer, true, "requested daily player should be marked");
    const profile = await jsonFetch(`${baseUrl}/api/player/profile/player-check-alpha`);
    assert.equal(profile.profile.playerName, "A", "player profile should store display name");
    assert.equal(profile.profile.selectedTitleId, "score-d", "latest selected title id should be stored");
    assert.equal(profile.profile.playerRank, 3, "profile rank should not be lowered by a weaker replay");
    assert.equal(profile.profile.playerXp, 780, "profile XP should not be lowered by a weaker replay");
    assert.equal(profile.profile.bestScore, 12345, "profile best score should not be lowered by a weaker replay");
    assert.ok(fs.existsSync(dbPath), "server should persist ranking database");
    assert.equal(fs.readFileSync(dbPath).subarray(0, 15).toString("utf8"), "SQLite format 3", "ranking store should be a SQLite database");

    const python = pythonCommand();
    const renderLikeChild = spawn(python.command, [...python.args, path.join(root, "server", "ranking-server.py")], {
      cwd: root,
      env: {
        ...process.env,
        PORT: "0",
        RANKING_HOST: "127.0.0.1",
        RANKING_DB_PATH: renderDbPath,
        RANKING_CONFIG_PATH: renderConfigPath,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const renderLikeBaseUrl = await waitForServer(renderLikeChild);
    const renderLikeHealth = await jsonFetch(`${renderLikeBaseUrl}/api/health`);
    assert.equal(renderLikeHealth.backend, "sqlite", "direct Python local fallback should use SQLite");
    renderLikeChild.kill();
    await waitForExit(renderLikeChild);

    console.log("Gunmoji Puzzle ranking server checks passed.");
  } finally {
    child.kill();
    await waitForExit(child);
    if (stderr.trim()) {
      process.stderr.write(stderr);
    }
    fs.rmSync(dbPath, { force: true });
    fs.rmSync(`${dbPath}-shm`, { force: true });
    fs.rmSync(`${dbPath}-wal`, { force: true });
    fs.rmSync(renderDbPath, { force: true });
    fs.rmSync(`${renderDbPath}-shm`, { force: true });
    fs.rmSync(`${renderDbPath}-wal`, { force: true });
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
