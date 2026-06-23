const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const os = require("node:os");

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

  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (error) {
      // Try the next bundled/runtime location.
    }
  }
  throw new Error("Unable to load Playwright");
}

const root = path.join(__dirname, "..");
const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
]);

function createServer() {
  return http.createServer((request, response) => {
    const url = new URL(request.url, "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    const target = path.normalize(path.join(root, pathname));
    if (!target.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    fs.readFile(target, (error, data) => {
      if (error) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      response.writeHead(200, {
        "Content-Type": contentTypes.get(path.extname(target)) || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(data);
    });
  });
}

async function main() {
  const { chromium } = loadPlaywright();
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  try {
    await page.goto(`${baseUrl}/index.html`);
    await page.waitForSelector("#titleStartButton");
    const registrationState = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) {
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
      const cacheNames = await caches.keys();
      const cachedPaths = [];
      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        cachedPaths.push(...requests.map((request) => new URL(request.url).pathname));
      }
      return {
        scriptURL: registration.active?.scriptURL || "",
        cacheNames,
        cachedPaths,
        controlled: Boolean(navigator.serviceWorker.controller),
      };
    });

    await page.reload();
    await page.waitForSelector("#titleStartButton");
    await context.setOffline(true);
    await page.goto(`${baseUrl}/index.html`);
    await page.waitForSelector("#titleStartButton");
    const offlineTitle = await page.locator("h1").first().textContent();
    await context.setOffline(false);

    if (errors.length > 0) {
      throw new Error(`Browser errors:\n${errors.join("\n")}`);
    }
    if (!registrationState.scriptURL.endsWith("/service-worker.js")) {
      throw new Error(`Service worker did not register: ${JSON.stringify(registrationState)}`);
    }
    for (const required of ["/index.html", "/styles.css", "/data/cards.js", "/scripts/game.js", "/assets/generated/stage-festival-bg.png"]) {
      if (!registrationState.cachedPaths.includes(required)) {
        throw new Error(`Missing cached path ${required}: ${JSON.stringify(registrationState)}`);
      }
    }
    if (!offlineTitle || offlineTitle.trim().length === 0) {
      throw new Error("Offline navigation did not render the title screen");
    }

    console.log(JSON.stringify({ registrationState, offlineTitle }, null, 2));
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
