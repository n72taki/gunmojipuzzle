const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

const draft = read(path.join("docs", "CONTENT_RATING_DRAFT.md"));
const playConsolePack = read(path.join("docs", "PLAY_CONSOLE_SUBMISSION_PACK.md"));
const dataSafety = read(path.join("docs", "DATA_SAFETY_DRAFT.md"));
const storeListing = read(path.join("docs", "STORE_LISTING_DRAFT.md"));
const releaseReadiness = read(path.join("docs", "MOBILE_RELEASE_READINESS.md"));
const readme = read("README.md");
const releaseGate = read(path.join("tools", "release-gate.cjs"));
const gameJs = read(path.join("scripts", "game.js"));
const html = read("index.html");
const data = require("../data/cards.js");

for (const phrase of [
  "Content Rating Draft",
  "Official References To Recheck",
  "Questionnaire Draft",
  "Four-Perspective Rating Review",
  "Recheck Triggers",
  "No violence",
  "No real ad SDK",
  "No real purchase flow",
  "No in-app player communication",
  "User-generated content",
  "13+",
  "Families",
]) {
  assert.ok(draft.includes(phrase), `content rating draft missing phrase: ${phrase}`);
}

for (const officialUrl of [
  "https://support.google.com/googleplay/android-developer/answer/9859655",
  "https://support.google.com/googleplay/android-developer/answer/9867159",
  "https://support.google.com/googleplay/android-developer/answer/10787469",
]) {
  assert.ok(draft.includes(officialUrl), `content rating draft missing official reference: ${officialUrl}`);
}

assert.ok(playConsolePack.includes("CONTENT_RATING_DRAFT.md"), "Play Console pack should link content rating draft");
assert.ok(storeListing.includes("CONTENT_RATING_DRAFT.md"), "store listing draft should link content rating draft");
assert.ok(releaseReadiness.includes("CONTENT_RATING_DRAFT.md"), "release readiness should link content rating draft");
assert.ok(readme.includes("CONTENT_RATING_DRAFT.md"), "README should document content rating draft");
assert.ok(releaseGate.includes("check-content-rating.cjs"), "release gate should run content rating checks");
assert.ok(dataSafety.includes("No real payment SDK flow"), "data safety should still match no-payment rating assumptions");
assert.ok(dataSafety.includes("No third-party analytics SDK"), "data safety should still match no-analytics rating assumptions");
assert.ok(html.includes("CLOSED TEST"), "prototype build should keep test economy clearly labeled");
assert.ok(gameJs.includes("navigator.share"), "sharing should remain user-initiated via device share surfaces");
assert.ok(!gameJs.includes("WebSocket"), "current build should not add real-time communication");
assert.ok(!gameJs.includes("getCurrentPosition"), "current build should not request device location");
assert.ok(!gameJs.includes("getUserMedia"), "current build should not request camera or microphone");

const adultThemeWords = [
  "酒",
  "ビール",
  "ワイン",
  "タバコ",
  "煙草",
  "薬物",
  "銃",
  "血",
  "賭博",
  "カジノ",
];
for (const card of data.cards) {
  const searchable = `${card.displayName} ${card.readingKana} ${card.learnNote || ""}`;
  for (const word of adultThemeWords) {
    assert.ok(!searchable.includes(word), `card content may affect rating (${word}): ${card.id}`);
  }
}

console.log("Gunmoji Puzzle content rating checks passed.");
