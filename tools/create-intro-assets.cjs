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

const root = path.join(__dirname, "..");
const outputDir = path.join(root, "store-assets", "intro");
const screenshotDir = path.join(root, "store-assets", "public-screenshots");
const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const screenshotItems = [
  { file: "01-title.png", label: "タイトル", copy: "ロゴとカードの世界観を最初に見せる" },
  { file: "02-home.png", label: "ホーム", copy: "スタミナ、Gだるま、ランキング、ミッションへすぐ移動" },
  { file: "03-gameplay.png", label: "ゲーム中", copy: "60秒でかなをつなげて、ことばを作る" },
  { file: "04-result.png", label: "リザルト", copy: "スコア、報酬、ベストワードをすぐ確認" },
  { file: "05-deck.png", label: "デッキ", copy: "推しを中央に、カード画像でコレクションを楽しむ" },
  { file: "06-pack.png", label: "パック", copy: "1文字ずつ見える開封演出とカード絵柄" },
  { file: "08-missions.png", label: "ミッション", copy: "毎日と週替わりの目標でGだるまを集める" },
  { file: "09-ranking.png", label: "ランキング", copy: "トップ100と自分の順位を確認" },
];

function fileDataUrl(filePath, mime = "image/png") {
  return `data:${mime};base64,${fs.readFileSync(filePath).toString("base64")}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function phoneFrame(item, index, options = {}) {
  const src = fileDataUrl(path.join(screenshotDir, item.file));
  const extraClass = options.large ? " is-large" : "";
  const caption = options.caption === false ? "" : `
    <div class="caption">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${escapeHtml(item.label)}</strong>
      <p>${escapeHtml(item.copy)}</p>
    </div>
  `;
  return `
    <article class="shot${extraClass}">
      <div class="phone">
        <img src="${src}" alt="${escapeHtml(item.label)}">
      </div>
      ${caption}
    </article>
  `;
}

function introCardHtml() {
  const logo = fileDataUrl(path.join(root, "assets", "gunmoji-logo.png"));
  const feature = fileDataUrl(path.join(root, "store-assets", "feature-graphic.jpg"), "image/jpeg");
  const picks = [
    screenshotItems[2],
    screenshotItems[4],
    screenshotItems[5],
  ];
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    html, body {
      width: 1080px;
      height: 1350px;
      margin: 0;
      overflow: hidden;
      font-family: "Yu Gothic", "Hiragino Sans", "Noto Sans JP", system-ui, sans-serif;
      background: #f8f1dd;
    }
    .canvas {
      position: relative;
      width: 1080px;
      height: 1350px;
      padding: 56px 58px;
      color: #162235;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 241, 221, 0.7) 36%, rgba(248, 241, 221, 0.96)),
        url("${feature}") center top / cover no-repeat,
        #f8f1dd;
    }
    .canvas::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(180deg, rgba(255, 250, 236, 0.82) 0 30%, rgba(255, 250, 236, 0.32) 48%, rgba(255, 250, 236, 0.9) 100%),
        radial-gradient(circle at 86% 14%, rgba(255, 226, 155, 0.62), transparent 22%),
        radial-gradient(circle at 14% 84%, rgba(90, 200, 193, 0.28), transparent 24%);
      pointer-events: none;
    }
    header {
      position: relative;
      z-index: 2;
      display: grid;
      grid-template-columns: 315px 1fr;
      gap: 28px;
      align-items: center;
    }
    .logo {
      width: 315px;
      filter: drop-shadow(0 14px 24px rgba(93, 57, 28, 0.22));
    }
    .lead {
      display: grid;
      gap: 12px;
      padding-top: 10px;
    }
    .lead span {
      width: max-content;
      padding: 8px 16px;
      border-radius: 999px;
      color: #0d9488;
      background: rgba(255, 255, 255, 0.82);
      border: 2px solid rgba(13, 148, 136, 0.18);
      font-size: 22px;
      font-weight: 1000;
    }
    h1 {
      margin: 0;
      color: #162235;
      font-size: 56px;
      line-height: 1.05;
      letter-spacing: 0;
      text-shadow: 0 3px 0 rgba(255, 255, 255, 0.8);
    }
    .subcopy {
      margin: 0;
      color: #6f4a30;
      font-size: 28px;
      line-height: 1.28;
      font-weight: 900;
    }
    .shots {
      position: relative;
      z-index: 2;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-top: 54px;
      align-items: start;
    }
    .shot {
      display: grid;
      gap: 18px;
      transform: translateY(var(--lift, 0));
    }
    .shot:nth-child(1) { --lift: 34px; }
    .shot:nth-child(2) { --lift: 0; }
    .shot:nth-child(3) { --lift: 50px; }
    .phone {
      overflow: hidden;
      aspect-ratio: 430 / 932;
      border-radius: 34px;
      border: 8px solid rgba(255, 255, 255, 0.94);
      background: #fffaf0;
      box-shadow:
        0 30px 42px rgba(52, 38, 25, 0.28),
        inset 0 0 0 2px rgba(111, 74, 48, 0.1);
    }
    .phone img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }
    .caption {
      min-height: 150px;
      padding: 18px 18px 20px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.84);
      border: 2px solid rgba(111, 74, 48, 0.1);
      box-shadow: 0 12px 22px rgba(111, 74, 48, 0.12);
    }
    .caption span {
      display: inline-grid;
      place-items: center;
      width: 44px;
      height: 28px;
      margin-bottom: 8px;
      border-radius: 999px;
      background: linear-gradient(135deg, #ef5d50, #f5b642);
      color: #fffaf0;
      font-size: 16px;
      font-weight: 1000;
    }
    .caption strong {
      display: block;
      color: #162235;
      font-size: 25px;
      font-weight: 1000;
      line-height: 1.05;
    }
    .caption p {
      margin: 8px 0 0;
      color: #6f4a30;
      font-size: 18px;
      line-height: 1.28;
      font-weight: 900;
    }
    .badges {
      position: absolute;
      left: 58px;
      right: 58px;
      bottom: 54px;
      z-index: 3;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }
    .badge {
      min-height: 72px;
      display: grid;
      place-items: center;
      border-radius: 16px;
      background: linear-gradient(135deg, #0d9488, #5ac8c1);
      color: #fff;
      font-size: 24px;
      font-weight: 1000;
      box-shadow: 0 12px 24px rgba(13, 148, 136, 0.18);
      text-shadow: 0 1px 0 rgba(18, 24, 34, 0.24);
    }
    .badge:nth-child(2) {
      background: linear-gradient(135deg, #ef5d50, #f5b642);
    }
    .badge:nth-child(3) {
      background: linear-gradient(135deg, #2878b8, #70c4db);
    }
  </style>
</head>
<body>
  <main class="canvas">
    <header>
      <img class="logo" src="${logo}" alt="ぐんもじぱずる">
      <div class="lead">
        <span>群馬ことばパズル</span>
        <h1>かなをつなげて<br>カードを集める</h1>
        <p class="subcopy">60秒のひらめきと、推しカード育成。</p>
      </div>
    </header>
    <section class="shots">
      ${picks.map((item, index) => phoneFrame(item, index, { caption: true })).join("")}
    </section>
    <section class="badges" aria-label="features">
      <div class="badge">60秒かなパネル</div>
      <div class="badge">推しカード中央</div>
      <div class="badge">パック開封演出</div>
    </section>
  </main>
</body>
</html>`;
}

function contactSheetHtml() {
  const logo = fileDataUrl(path.join(root, "assets", "gunmoji-logo.png"));
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    html, body {
      width: 1800px;
      height: 2400px;
      margin: 0;
      overflow: hidden;
      font-family: "Yu Gothic", "Hiragino Sans", "Noto Sans JP", system-ui, sans-serif;
      background: #f6efd9;
    }
    .sheet {
      width: 1800px;
      height: 2400px;
      padding: 66px 72px;
      color: #162235;
      background:
        radial-gradient(circle at 90% 7%, rgba(245, 182, 66, 0.34), transparent 19%),
        radial-gradient(circle at 8% 92%, rgba(90, 200, 193, 0.2), transparent 20%),
        linear-gradient(180deg, #fffaf0, #edf7ee);
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 36px;
      margin-bottom: 50px;
    }
    .logo {
      width: 280px;
      filter: drop-shadow(0 13px 22px rgba(93, 57, 28, 0.18));
    }
    h1 {
      margin: 0;
      color: #162235;
      font-size: 58px;
      line-height: 1.08;
      font-weight: 1000;
      letter-spacing: 0;
      text-align: right;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 30px;
    }
    .shot {
      min-height: 505px;
      display: grid;
      grid-template-columns: 205px minmax(0, 1fr);
      gap: 24px;
      align-items: center;
      padding: 24px;
      border-radius: 26px;
      background: rgba(255, 255, 255, 0.78);
      border: 2px solid rgba(111, 74, 48, 0.11);
      box-shadow: 0 16px 30px rgba(111, 74, 48, 0.1);
    }
    .phone {
      overflow: hidden;
      aspect-ratio: 430 / 932;
      border-radius: 24px;
      border: 6px solid #fff;
      background: #fffaf0;
      box-shadow: 0 18px 24px rgba(52, 38, 25, 0.2);
    }
    .phone img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }
    .caption {
      align-self: stretch;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
    }
    .caption span {
      width: max-content;
      min-width: 70px;
      margin-bottom: 18px;
      padding: 8px 14px;
      border-radius: 999px;
      background: linear-gradient(135deg, #ef5d50, #f5b642);
      color: #fffaf0;
      font-size: 22px;
      font-weight: 1000;
      text-align: center;
    }
    .caption strong {
      color: #162235;
      font-size: 38px;
      font-weight: 1000;
      line-height: 1.08;
    }
    .caption p {
      margin: 16px 0 0;
      color: #6f4a30;
      font-size: 26px;
      line-height: 1.28;
      font-weight: 900;
    }
  </style>
</head>
<body>
  <main class="sheet">
    <header>
      <img class="logo" src="${logo}" alt="ぐんもじぱずる">
      <h1>紹介用スクリーンショット<br>見せ場まとめ</h1>
    </header>
    <section class="grid">
      ${screenshotItems.map((item, index) => phoneFrame(item, index)).join("")}
    </section>
  </main>
</body>
</html>`;
}

async function renderHtml(page, html, outputPath, viewport) {
  await page.setViewportSize(viewport);
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts?.ready || Promise.resolve());
  await page.waitForTimeout(120);
  await page.screenshot({ path: outputPath, fullPage: false });
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  for (const item of screenshotItems) {
    const filePath = path.join(screenshotDir, item.file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing source screenshot: ${path.relative(root, filePath)}`);
    }
  }
  const featurePath = path.join(root, "store-assets", "feature-graphic.jpg");
  if (!fs.existsSync(featurePath)) {
    throw new Error("Missing store-assets/feature-graphic.jpg. Run tools/generate-feature-graphic.cjs first.");
  }

  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
  });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });

  try {
    const socialCard = path.join(outputDir, "intro-social-card.png");
    const contactSheet = path.join(outputDir, "intro-contact-sheet.png");
    await renderHtml(page, introCardHtml(), socialCard, { width: 1080, height: 1350 });
    await renderHtml(page, contactSheetHtml(), contactSheet, { width: 1800, height: 2400 });

    const readme = `# ぐんもじぱずる 紹介用画像

## すぐ使える画像
- intro-social-card.png: SNSや告知投稿向けの縦長紹介カード
- intro-contact-sheet.png: 画面の見せ場をまとめた一覧シート

## 元スクリーンショット
- ../public-screenshots/01-title.png: タイトル
- ../public-screenshots/02-home.png: ホーム
- ../public-screenshots/03-gameplay.png: ゲーム中
- ../public-screenshots/04-result.png: リザルト
- ../public-screenshots/05-deck.png: デッキ/コレクション
- ../public-screenshots/06-pack.png: パック開封
- ../public-screenshots/07-settings.png: 設定
- ../public-screenshots/08-missions.png: ミッション
- ../public-screenshots/09-ranking.png: ランキング

再生成: \`node tools/create-intro-assets.cjs\`
`;
    fs.writeFileSync(path.join(outputDir, "README.md"), readme, "utf8");

    console.log(
      JSON.stringify(
        {
          outputDir: path.relative(root, outputDir),
          files: [
            path.relative(root, socialCard),
            path.relative(root, contactSheet),
            path.join("store-assets", "intro", "README.md"),
          ],
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
