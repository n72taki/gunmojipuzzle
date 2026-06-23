const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");
const expectedFiles = [
  "01-title.png",
  "02-home.png",
  "03-gameplay.png",
  "04-result.png",
  "05-deck.png",
  "06-pack.png",
  "07-settings.png",
  "08-missions.png",
  "09-ranking.png",
];
const screenshotSets = [
  ["closed-test", path.join("store-assets", "screenshots")],
  ["public-review", path.join("store-assets", "public-screenshots")],
];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function parsePng(filePath) {
  const bytes = fs.readFileSync(filePath);
  const signature = bytes.subarray(0, 8).toString("hex");
  assert.equal(signature, "89504e470d0a1a0a", `${filePath} is not a PNG file`);
  assert.equal(bytes.subarray(12, 16).toString("ascii"), "IHDR", `${filePath} missing PNG IHDR chunk`);
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bytes: bytes.length,
  };
}

const results = [];

for (const [setName, directory] of screenshotSets) {
  for (const fileName of expectedFiles) {
    const relativePath = path.join(directory, fileName);
    const filePath = path.join(root, relativePath);
    assert.ok(fs.existsSync(filePath), `missing ${setName} screenshot: ${relativePath}`);
    const image = parsePng(filePath);
    assert.ok(image.width >= 1080, `${relativePath} width too small: ${image.width}`);
    assert.ok(image.height >= 1920, `${relativePath} height too small: ${image.height}`);
    assert.ok(image.height > image.width, `${relativePath} should be portrait: ${image.width}x${image.height}`);
    assert.ok(image.bytes > 250000, `${relativePath} looks too small/empty: ${image.bytes} bytes`);
    results.push({ setName, fileName, ...image });
  }
}

const storeAssetDoc = read(path.join("docs", "STORE_ASSET_QA.md"));
const releaseReadiness = read(path.join("docs", "MOBILE_RELEASE_READINESS.md"));
const storeListing = read(path.join("docs", "STORE_LISTING_DRAFT.md"));
const releaseGate = read(path.join("tools", "release-gate.cjs"));
const releaseCheck = read(path.join("tools", "release-check.cjs"));

for (const phrase of [
  "430x932 @3x",
  "1290x2796",
  "08-missions.png",
  "09-ranking.png",
  "all 18 screenshots",
  "CLOSED TEST",
  "TEST AD",
  "TEST GRANT",
  "Four-Perspective Review",
]) {
  assert.ok(storeAssetDoc.includes(phrase), `store asset QA doc missing phrase: ${phrase}`);
}

assert.ok(releaseReadiness.includes("STORE_ASSET_QA.md"), "release readiness doc should link store asset QA");
assert.ok(storeListing.includes("check-store-assets.cjs"), "store listing draft should mention store asset check");
assert.ok(releaseGate.includes("check-store-assets.cjs"), "release gate should run store asset checks");
assert.ok(releaseCheck.includes("check-store-assets.cjs"), "release metadata should check store asset tooling");

console.log(JSON.stringify({ ok: true, screenshots: results }, null, 2));
