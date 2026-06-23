const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
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

  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (error) {
      // Try the next known runtime location.
    }
  }
  throw new Error("Unable to load Playwright.");
}

async function main() {
  const root = path.join(__dirname, "..");
  const svgPath = path.join(root, "assets", "app-icon.svg");
  const outDir = path.join(root, "assets");
  const sizes = [192, 512];

  if (!fs.existsSync(svgPath)) {
    throw new Error(`Missing source icon: ${svgPath}`);
  }

  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });

  try {
    for (const size of sizes) {
      const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
      await page.goto(pathToFileURL(svgPath).href);
      await page.screenshot({ path: path.join(outDir, `app-icon-${size}.png`), omitBackground: true });
      await page.close();
    }
  } finally {
    await browser.close();
  }

  console.log(`Generated ${sizes.map((size) => `assets/app-icon-${size}.png`).join(", ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
