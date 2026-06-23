const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

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

function dataUrl(file, mime = "image/png") {
  return `data:${mime};base64,${fs.readFileSync(file).toString("base64")}`;
}

function tileHtml(char, className = "") {
  return `<div class="tile ${className}"><span>${char}</span></div>`;
}

async function main() {
  const root = path.join(__dirname, "..");
  const outDir = path.join(root, "store-assets");
  const outPath = path.join(outDir, "feature-graphic.jpg");
  fs.mkdirSync(outDir, { recursive: true });

  const stageImage = dataUrl(path.join(root, "assets", "generated", "stage-festival-bg.png"));
  const gunmaImage = dataUrl(path.join(root, "assets", "generated", "card-basic-gunma-ken.png"));
  const darumaImage = dataUrl(path.join(root, "assets", "generated", "card-basic-daruma.png"));
  const akagiImage = dataUrl(path.join(root, "assets", "generated", "card-basic-akagi-san.png"));

  const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <style>
    * {
      box-sizing: border-box;
    }

    html,
    body {
      width: 1024px;
      height: 500px;
      margin: 0;
      overflow: hidden;
      background: #fff4d6;
      font-family: "Yu Gothic", "Hiragino Sans", "Noto Sans JP", system-ui, sans-serif;
    }

    .graphic {
      position: relative;
      width: 1024px;
      height: 500px;
      overflow: hidden;
      color: #172033;
      background:
        linear-gradient(90deg, rgba(255, 247, 222, 0.98) 0%, rgba(255, 247, 222, 0.9) 34%, rgba(255, 247, 222, 0.16) 68%, rgba(255, 247, 222, 0.03) 100%),
        linear-gradient(135deg, rgba(239, 93, 80, 0.38), rgba(45, 184, 216, 0.32)),
        url("${stageImage}") center / cover no-repeat;
    }

    .graphic::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 76% 20%, rgba(255, 255, 255, 0.72), transparent 17%),
        radial-gradient(circle at 86% 82%, rgba(245, 182, 66, 0.32), transparent 22%),
        linear-gradient(0deg, rgba(23, 32, 51, 0.08), rgba(23, 32, 51, 0));
      pointer-events: none;
    }

    .confetti {
      position: absolute;
      inset: 0;
      opacity: 0.46;
      background-image:
        linear-gradient(30deg, transparent 0 42%, #ef5d50 42% 56%, transparent 56%),
        linear-gradient(120deg, transparent 0 42%, #2fb8d8 42% 56%, transparent 56%),
        linear-gradient(75deg, transparent 0 42%, #f5b642 42% 56%, transparent 56%);
      background-size: 86px 54px, 112px 74px, 96px 68px;
      background-position: 20px 28px, 740px 34px, 510px 380px;
      mix-blend-mode: multiply;
      pointer-events: none;
    }

    .copy {
      position: absolute;
      left: 58px;
      top: 56px;
      width: 405px;
      z-index: 3;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 34px;
      padding: 5px 14px;
      border: 2px solid rgba(23, 32, 51, 0.22);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.72);
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 0;
      color: #0d9488;
      box-shadow: 0 10px 24px rgba(92, 52, 23, 0.12);
    }

    h1 {
      margin: 22px 0 0;
      font-size: 78px;
      line-height: 0.9;
      letter-spacing: 0;
      color: #172033;
      text-shadow:
        0 4px 0 #fff6dc,
        0 10px 22px rgba(92, 52, 23, 0.18);
    }

    .subtitle {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 20px;
      font-size: 28px;
      line-height: 1.08;
      font-weight: 900;
      color: #6f2731;
      text-shadow: 0 2px 0 rgba(255, 255, 255, 0.64);
    }

    .badges {
      display: flex;
      gap: 10px;
      margin-top: 24px;
    }

    .badge {
      min-height: 42px;
      padding: 8px 14px;
      border-radius: 8px;
      background: linear-gradient(135deg, #ef5d50, #f5b642);
      color: #fffdf2;
      font-size: 18px;
      font-weight: 900;
      box-shadow: 0 10px 18px rgba(92, 52, 23, 0.18);
    }

    .board {
      position: absolute;
      right: 58px;
      top: 40px;
      display: grid;
      grid-template-columns: repeat(5, 61px);
      grid-auto-rows: 61px;
      gap: 9px;
      padding: 22px;
      border-radius: 24px;
      background: rgba(255, 248, 226, 0.78);
      border: 4px solid rgba(255, 255, 255, 0.92);
      box-shadow:
        0 28px 42px rgba(31, 28, 44, 0.26),
        inset 0 0 0 2px rgba(143, 90, 34, 0.13);
      transform: rotate(-2deg);
      z-index: 2;
    }

    .tile {
      position: relative;
      display: grid;
      place-items: center;
      width: 61px;
      height: 61px;
      border-radius: 12px;
      background: linear-gradient(145deg, #2878b8, #70c4db);
      border: 3px solid rgba(255, 255, 255, 0.86);
      box-shadow:
        0 7px 0 rgba(40, 83, 121, 0.3),
        0 12px 16px rgba(23, 32, 51, 0.16),
        inset 0 12px 20px rgba(255, 255, 255, 0.32);
    }

    .tile span {
      font-size: 32px;
      font-weight: 1000;
      color: #fff;
      -webkit-text-stroke: 2px rgba(23, 32, 51, 0.44);
      text-shadow: 0 2px 0 rgba(23, 32, 51, 0.28);
    }

    .tile.red {
      background: linear-gradient(145deg, #d64045, #fb8f67);
    }

    .tile.green {
      background: linear-gradient(145deg, #397f68, #95c75f);
    }

    .tile.gold {
      background: linear-gradient(145deg, #d99945, #f7d89b);
    }

    .tile.pop {
      outline: 7px solid rgba(255, 255, 255, 0.54);
      transform: translateY(-4px);
    }

    .word-call {
      position: absolute;
      right: 82px;
      bottom: 42px;
      min-width: 310px;
      padding: 12px 22px 14px;
      border-radius: 16px;
      background: linear-gradient(135deg, #172033, #0d9488);
      color: #fffdf2;
      z-index: 4;
      box-shadow: 0 16px 30px rgba(23, 32, 51, 0.28);
      border: 3px solid rgba(255, 255, 255, 0.82);
    }

    .word-call span {
      display: block;
      font-size: 16px;
      font-weight: 900;
      opacity: 0.86;
    }

    .word-call strong {
      display: block;
      margin-top: 2px;
      font-size: 32px;
      line-height: 1.05;
      letter-spacing: 0;
    }

    .cards {
      position: absolute;
      left: 350px;
      bottom: 35px;
      display: flex;
      gap: 12px;
      z-index: 5;
    }

    .card {
      position: relative;
      width: 92px;
      height: 126px;
      overflow: hidden;
      border-radius: 14px;
      background: center / cover no-repeat;
      border: 4px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 18px 28px rgba(92, 52, 23, 0.22);
    }

    .card:nth-child(1) {
      background-image: url("${gunmaImage}");
      transform: rotate(-7deg);
    }

    .card:nth-child(2) {
      background-image: url("${darumaImage}");
      transform: translateY(-8px) rotate(3deg);
    }

    .card:nth-child(3) {
      background-image: url("${akagiImage}");
      transform: rotate(8deg);
    }

    .card::after {
      content: attr(data-name);
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      min-height: 32px;
      padding: 7px 5px 6px;
      background: linear-gradient(0deg, rgba(23, 32, 51, 0.88), rgba(23, 32, 51, 0.08));
      color: #fffdf2;
      font-size: 14px;
      font-weight: 900;
      text-align: center;
    }
  </style>
</head>
<body>
  <main class="graphic" aria-label="ぐんもじぱずる feature graphic">
    <div class="confetti"></div>
    <section class="copy">
      <div class="eyebrow">60秒かなパネル</div>
      <h1>ぐんもじ<br>ぱずる</h1>
      <div class="subtitle">
        <span>ことばがそろう</span>
        <span>光るかなパネルパズル</span>
      </div>
      <div class="badges">
        <div class="badge">スライド</div>
        <div class="badge">連鎖</div>
        <div class="badge">ご当地</div>
      </div>
    </section>
    <section class="board" aria-hidden="true">
      ${[
        tileHtml("ぐ", "pop"),
        tileHtml("ん", "pop"),
        tileHtml("ま", "pop"),
        tileHtml("け", "pop"),
        tileHtml("ん", "pop"),
        tileHtml("だ", "red"),
        tileHtml("る", "red"),
        tileHtml("ま", "red"),
        tileHtml("あ", "green"),
        tileHtml("か", "green"),
        tileHtml("ぎ", "green"),
        tileHtml("さ", "green"),
        tileHtml("ん", "green"),
        tileHtml("ま", "gold"),
        tileHtml("ん", "gold"),
      ].join("")}
    </section>
    <section class="word-call" aria-hidden="true">
      <span>WORD CLEAR</span>
      <strong>ぐんまけん +3750</strong>
    </section>
    <section class="cards" aria-hidden="true">
      <div class="card" data-name="ぐんまけん"></div>
      <div class="card" data-name="だるま"></div>
      <div class="card" data-name="あかぎさん"></div>
    </section>
  </main>
</body>
</html>`;

  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "load" });
    await page.screenshot({
      path: outPath,
      type: "jpeg",
      quality: 94,
      clip: { x: 0, y: 0, width: 1024, height: 500 },
    });
  } finally {
    await browser.close();
  }

  console.log(`Generated ${path.relative(root, outPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
