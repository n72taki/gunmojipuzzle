const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

const DATA = require("../data/cards.js");

const root = path.join(__dirname, "..");
const configPath = path.join(os.tmpdir(), `gunmoji-ranking-config-${process.pid}.json`);
const pythonScript = path.join(__dirname, "ranking-server.py");

const runtimeConfig = {
  deckSize: DATA.deckSize,
  rankingSeason: DATA.rankingSeason,
  cards: DATA.cards.map((card) => ({
    id: card.id,
    readingKana: card.readingKana,
  })),
};

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

function pythonCandidates() {
  return [
    process.env.PYTHON ? { command: process.env.PYTHON, args: [] } : null,
    fs.existsSync(bundledPythonPath()) ? { command: bundledPythonPath(), args: [] } : null,
    { command: "python", args: [] },
    { command: "py", args: ["-3"] },
  ].filter(Boolean);
}

function startPythonServer(index = 0) {
  const candidate = pythonCandidates()[index];
  if (!candidate) {
    console.error("Unable to find Python. Set PYTHON to a Python 3 executable.");
    process.exit(1);
  }

  let shuttingDown = false;
  const child = spawn(candidate.command, [...candidate.args, pythonScript], {
    cwd: root,
    env: {
      ...process.env,
      RANKING_CONFIG_PATH: configPath,
    },
    stdio: "inherit",
  });

  child.once("error", (error) => {
    if (error.code === "ENOENT") {
      startPythonServer(index + 1);
      return;
    }
    console.error(error);
    process.exit(1);
  });

  child.once("exit", (code, signal) => {
    cleanup();
    process.exit(shuttingDown ? 0 : code ?? (signal ? 1 : 0));
  });

  const stop = () => {
    shuttingDown = true;
    child.kill();
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
}

function cleanup() {
  fs.rmSync(configPath, { force: true });
}

fs.writeFileSync(configPath, JSON.stringify(runtimeConfig), "utf8");
startPythonServer();
