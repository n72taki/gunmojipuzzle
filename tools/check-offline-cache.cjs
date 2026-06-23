const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");
const serviceWorker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
const registrar = fs.readFileSync(path.join(root, "scripts", "register-service-worker.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

assert.ok(html.includes("scripts/register-service-worker.js"), "index.html should load the service worker registrar");
assert.ok(serviceWorker.includes("CACHE_VERSION"), "service worker should have a named cache version");
assert.ok(serviceWorker.includes("CORE_ASSETS"), "service worker should list core offline assets");
assert.ok(serviceWorker.includes("caches.open"), "service worker should pre-cache core assets");
assert.ok(serviceWorker.includes("request.mode === \"navigate\""), "service worker should handle navigation fallback");
assert.ok(registrar.includes("location.protocol === \"http:\""), "registrar should allow http");
assert.ok(registrar.includes("location.protocol === \"https:\""), "registrar should allow https");
assert.ok(registrar.includes("\"serviceWorker\" in navigator"), "registrar should guard service worker support");

const assetMatches = Array.from(serviceWorker.matchAll(/"\.\/([^"]*)"/g)).map((match) => match[1]);
assert.ok(assetMatches.includes("index.html"), "offline assets should include index.html");
assert.ok(assetMatches.includes("styles.css"), "offline assets should include styles.css");
assert.ok(assetMatches.includes("data/cards.js"), "offline assets should include cards data");
assert.ok(assetMatches.includes("scripts/game.js"), "offline assets should include game script");
assert.ok(assetMatches.includes("assets/gunmoji-logo.png"), "offline assets should include the game logo");
assert.ok(assetMatches.includes("assets/g-daruma.svg"), "offline assets should include the G daruma icon");
assert.ok(assetMatches.includes("assets/exchange-daruma.svg"), "offline assets should include the exchange daruma icon");
assert.ok(assetMatches.includes("assets/generated/stage-festival-bg.png"), "offline assets should include stage art");
assert.ok(assetMatches.includes("assets/generated/special-gunma-crane.png"), "offline assets should include special crane art");
for (const cityArt of [
  "card-city-maebashi.png",
  "card-city-takasaki.png",
  "card-city-kiryu.png",
  "card-city-isesaki.png",
  "card-city-ota.png",
  "card-city-numata.png",
  "card-city-tatebayashi.png",
  "card-city-shibukawa.png",
  "card-city-fujioka.png",
  "card-city-tomioka.png",
  "card-city-annaka.png",
  "card-city-midori.png",
]) {
  assert.ok(assetMatches.includes(`assets/generated/${cityArt}`), `offline assets should include ${cityArt}`);
}

for (const asset of assetMatches.filter(Boolean)) {
  const target = path.join(root, asset);
  assert.ok(fs.existsSync(target), `offline asset does not exist: ${asset}`);
}

console.log("Gunmoji Puzzle offline cache checks passed.");
