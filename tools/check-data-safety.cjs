const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const projectRoot = path.join(__dirname, "..");
const workspaceRoot = path.join(projectRoot, "..");

function readFromProject(file) {
  return fs.readFileSync(path.join(projectRoot, file), "utf8");
}

function readFromWorkspace(file) {
  return fs.readFileSync(path.join(workspaceRoot, file), "utf8");
}

const dataSafety = readFromProject(path.join("docs", "DATA_SAFETY_DRAFT.md"));
const releaseReadiness = readFromProject(path.join("docs", "MOBILE_RELEASE_READINESS.md"));
const rights = readFromProject(path.join("docs", "RIGHTS_AND_MONETIZATION.md"));
const storeListing = readFromProject(path.join("docs", "STORE_LISTING_DRAFT.md"));
const privacyJa = readFromWorkspace(path.join("homepage", "privacy.html"));
const termsJa = readFromWorkspace(path.join("homepage", "terms.html"));
const commercialJa = readFromWorkspace(path.join("homepage", "commercial-transactions.html"));
const privacyEn = readFromWorkspace(path.join("homepage", "en", "privacy.html"));
const termsEn = readFromWorkspace(path.join("homepage", "en", "terms.html"));
const commercialEn = readFromWorkspace(path.join("homepage", "en", "commercial-transactions.html"));

for (const phrase of [
  "localStorage",
  "非PII",
  "No account registration",
  "No precise location",
  "No contacts",
  "No photos or camera access",
  "No microphone access",
  "No third-party analytics SDK",
  "No crash-reporting SDK",
  "No ad SDK connected",
  "No real payment SDK flow",
  "server authority is mandatory",
]) {
  assert.ok(dataSafety.includes(phrase), `data safety draft missing phrase: ${phrase}`);
}

for (const phrase of [
  "ぐんもじぱずる",
  "localStorage",
  "非PII",
  "自動送信されず",
  "実広告SDK",
  "実課金SDK",
  "第三者分析SDK",
  "クラッシュ解析SDK",
]) {
  assert.ok(privacyJa.includes(phrase), `Japanese privacy policy missing phrase: ${phrase}`);
}

for (const phrase of [
  "Gunmoji Puzzle",
  "localStorage",
  "non-PII",
  "not sent automatically",
  "advertising SDKs",
  "payment SDKs",
  "third-party analytics SDKs",
  "crash-reporting SDKs",
]) {
  assert.ok(privacyEn.includes(phrase), `English privacy policy missing phrase: ${phrase}`);
}

for (const phrase of ["ぐんもじぱずる", "広告/課金SDKは未接続", "実際の購入", "実広告視聴", "非PIIイベントログ"]) {
  assert.ok(termsJa.includes(phrase), `Japanese terms missing phrase: ${phrase}`);
}

for (const phrase of ["Gunmoji Puzzle", "advertising or payment SDKs", "real purchases", "real rewarded ads", "non-PII event logs"]) {
  assert.ok(termsEn.includes(phrase), `English terms missing phrase: ${phrase}`);
}

for (const phrase of ["ぐんもじぱずる", "実課金SDKは未接続", "ランダムアイテム", "排出率", "引換だるま"]) {
  assert.ok(commercialJa.includes(phrase), `Japanese commercial notice missing phrase: ${phrase}`);
}

for (const phrase of ["Gunmoji Puzzle", "real payment SDK", "Random Items", "probability", "exchange-daruma"]) {
  assert.ok(commercialEn.includes(phrase), `English commercial notice missing phrase: ${phrase}`);
}

for (const [label, source] of [
  ["release readiness", releaseReadiness],
  ["rights and monetization", rights],
  ["store listing", storeListing],
]) {
  assert.ok(source.includes("DATA_SAFETY_DRAFT.md"), `${label} should reference the data safety draft`);
}

console.log("Gunmoji Puzzle data safety checks passed.");
