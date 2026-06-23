const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");
const featureGraphicPath = path.join(root, "store-assets", "feature-graphic.jpg");
const promoQaPath = path.join(root, "docs", "PROMO_ASSET_QA.md");

function readJpegSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  assert.equal(buffer[0], 0xff, "feature graphic should start with JPEG SOI marker");
  assert.equal(buffer[1], 0xd8, "feature graphic should start with JPEG SOI marker");

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    let marker = buffer[offset + 1];
    while (marker === 0xff) {
      offset += 1;
      marker = buffer[offset + 1];
    }

    if (marker === 0xd9 || marker === 0xda) {
      break;
    }

    const segmentLength = buffer.readUInt16BE(offset + 2);
    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isStartOfFrame) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
        bytes: buffer.length,
      };
    }

    offset += 2 + segmentLength;
  }

  throw new Error("Unable to read JPEG dimensions.");
}

assert.ok(fs.existsSync(featureGraphicPath), "missing store-assets/feature-graphic.jpg; run tools/generate-feature-graphic.cjs");
const featureGraphic = readJpegSize(featureGraphicPath);
assert.equal(featureGraphic.width, 1024, "feature graphic width must be 1024");
assert.equal(featureGraphic.height, 500, "feature graphic height must be 500");
assert.ok(featureGraphic.bytes > 100000, "feature graphic should be non-empty and visually rich");
assert.ok(featureGraphic.bytes <= 15 * 1024 * 1024, "feature graphic should stay under 15 MB");

const promoQa = fs.readFileSync(promoQaPath, "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const releaseReadiness = fs.readFileSync(path.join(root, "docs", "MOBILE_RELEASE_READINESS.md"), "utf8");
const storeListing = fs.readFileSync(path.join(root, "docs", "STORE_LISTING_DRAFT.md"), "utf8");
const releaseGate = fs.readFileSync(path.join(root, "tools", "release-gate.cjs"), "utf8");
const generator = fs.readFileSync(path.join(root, "tools", "generate-feature-graphic.cjs"), "utf8");

assert.ok(promoQa.includes("1024x500"), "promo QA should document feature graphic dimensions");
assert.ok(promoQa.includes("feature-graphic.jpg"), "promo QA should document the generated feature graphic file");
assert.ok(promoQa.includes("Four-Perspective Review"), "promo QA should include four-perspective review notes");
assert.ok(promoQa.includes("no official mascot"), "promo QA should include rights restrictions");
assert.ok(generator.includes("card-basic-gunma-ken.png"), "feature graphic should use existing generated card art");
assert.ok(generator.includes("WORD CLEAR"), "feature graphic should show a readable gameplay moment");
assert.ok(readme.includes("generate-feature-graphic.cjs"), "README should document feature graphic generation");
assert.ok(readme.includes("check-promo-assets.cjs"), "README should document promo asset checks");
assert.ok(releaseReadiness.includes("PROMO_ASSET_QA.md"), "release readiness should link promo asset QA");
assert.ok(storeListing.includes("feature-graphic.jpg"), "store listing draft should mention the feature graphic");
assert.ok(releaseGate.includes("check-promo-assets.cjs"), "release gate should run promo asset checks");

console.log(JSON.stringify({ ok: true, featureGraphic }, null, 2));
