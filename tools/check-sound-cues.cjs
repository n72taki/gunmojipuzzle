const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");
const gameJs = fs.readFileSync(path.join(root, "scripts", "game.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const smoke = fs.readFileSync(path.join(root, "tools", "smoke-browser.cjs"), "utf8");
const soundQa = fs.readFileSync(path.join(root, "docs", "SOUND_QA.md"), "utf8");
const dataSafety = fs.readFileSync(path.join(root, "docs", "DATA_SAFETY_DRAFT.md"), "utf8");
const releaseReadiness = fs.readFileSync(path.join(root, "docs", "MOBILE_RELEASE_READINESS.md"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");

const cues = [
  "tap",
  "open",
  "start",
  "swap",
  "refresh",
  "clear",
  "clear-big",
  "special",
  "skill",
  "coin",
  "pack",
  "equip",
  "finish",
  "error",
];

for (const cue of cues) {
  assert.ok(gameJs.includes(`kind === "${cue}"`) || gameJs.includes(`${cue}:`), `game.js should define cue: ${cue}`);
  assert.ok(soundQa.includes(`\`${cue}\``), `SOUND_QA should document cue: ${cue}`);
}

assert.ok(html.includes("soundToggle"), "settings should include the sound toggle");
assert.ok(html.includes("soundTestButton"), "settings should include the sound test button");
assert.ok(gameJs.includes("function playSound(kind)"), "game should centralize sound playback");
assert.ok(gameJs.includes("function testSound()"), "game should expose a sound test action");
assert.ok(gameJs.includes("window.AudioContext || window.webkitAudioContext"), "game should use Web Audio with WebKit fallback");
assert.ok(gameJs.includes("Audio is best-effort"), "audio errors should not stop gameplay");
assert.ok(gameJs.includes("state.soundEvents.push(kind)"), "game should keep recent cue ids for QA");
assert.ok(gameJs.includes("navigator.vibrate"), "game should provide optional haptic feedback");
assert.ok(gameJs.includes("playSound(\"start\")"), "run start should play a cue");
assert.ok(gameJs.includes("playSound(\"swap\")"), "panel slide should play a cue");
assert.ok(gameJs.includes("playSound(\"refresh\")"), "refresh should play a cue");
assert.ok(gameJs.includes("playSound(wordLength >= 5 ? \"clear-big\" : \"clear\")"), "word clear should choose a reward cue");
assert.ok(gameJs.includes("playSound(\"skill\")"), "skill activation should play a cue");
assert.ok(gameJs.includes("playSound(\"pack\")"), "pack opening should play a cue");
assert.ok(gameJs.includes("playSound(\"finish\")"), "run finish should play a cue");
assert.ok(gameJs.includes("playSound(\"error\")"), "blocked actions should play an error cue");

assert.ok(smoke.includes("soundTestProbe"), "browser smoke should probe the sound test");
assert.ok(smoke.includes("soundEvents.includes(\"clear-big\")"), "browser smoke should verify the sound test cue");
assert.ok(smoke.includes("soundEvents.includes(\"start\")"), "browser smoke should verify the start cue");
assert.ok(smoke.includes("event === \"clear\" || event === \"clear-big\""), "browser smoke should verify clear cues");

assert.ok(soundQa.includes("Four-Perspective QA Notes"), "SOUND_QA should include four-perspective notes");
assert.ok(soundQa.includes("Mobile QA Checklist"), "SOUND_QA should include mobile QA steps");
assert.ok(soundQa.includes("does not ship third-party audio files"), "SOUND_QA should document original generated tones");
assert.ok(dataSafety.includes("Audio and vibration"), "data safety draft should mention audio/vibration");
assert.ok(releaseReadiness.includes("SOUND_QA.md"), "release readiness should link sound QA");
assert.ok(readme.includes("check-sound-cues.cjs"), "README should document sound cue check");

console.log("Gunmoji Puzzle sound cue checks passed.");
