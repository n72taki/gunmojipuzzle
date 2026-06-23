const assert = require("node:assert/strict");
const data = require("../data/cards.js");

const cardById = new Map(data.cards.map((card) => [card.id, card]));

function chars(text) {
  return Array.from(text);
}

function buildPool(deckIds) {
  return deckIds.flatMap((id) => chars(cardById.get(id).readingKana));
}

function countByValue(values) {
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return counts;
}

function checkBasicDeckPool() {
  assert.equal(data.deckSize, 3, "deck size must be three cards");
  assert.equal(data.basicDeckIds.length, 3, "basic deck must have three cards");
  assert.deepEqual(data.basicDeckIds, ["basic-gunma-ken", "basic-daruma", "basic-akagi-san"]);

  const pool = buildPool(data.basicDeckIds);
  const counts = countByValue(pool);
  assert.equal(pool.length, 13, "basic deck pool must contain 13 kana units");
  assert.equal(counts.get("ん"), 3, "ん must be weighted 3/13");
  assert.equal(counts.get("ま"), 2, "ま must be weighted 2/13");
  assert.equal(counts.get("さ"), 1, "さ must be weighted 1/13");
}

function checkCardData() {
  const ids = new Set();
  for (const card of data.cards) {
    assert.ok(card.id, "card id is required");
    assert.ok(!ids.has(card.id), `duplicate card id: ${card.id}`);
    ids.add(card.id);
    assert.ok(card.nameKey, `${card.id} nameKey is required`);
    assert.ok(card.displayName, `${card.id} displayName is required`);
    assert.ok(card.readingKana, `${card.id} readingKana is required`);
    assert.ok(card.learnNote && card.learnNote.length <= 48, `${card.id} should have a short learnNote`);
    assert.ok([1, 2, 3].includes(card.rarityG), `${card.id} rarityG must be 1..3`);
    assert.ok(card.skillId, `${card.id} skillId is required`);
    if (card.skillId === "time_plus") {
      assert.equal(card.rarityG, 3, `${card.id} time_plus skill must be limited to G3 cards`);
    }
    assert.equal(card.rightsStatus, "prototype-safe", `${card.id} rightsStatus must be prototype-safe`);
  }
  const timePlusCards = data.cards.filter((card) => card.skillId === "time_plus");
  assert.deepEqual(timePlusCards.map((card) => card.id), ["season1-maebashi"], "season 1 should have only one time_plus card");
}

function checkPackRates() {
  const pack = data.packs[0];
  const entryRate = pack.entries.reduce((sum, entry) => sum + entry.rate, 0);
  assert.ok(Math.abs(entryRate - 100) < 0.0001, `pack entry rates must sum to 100, got ${entryRate}`);
  assert.equal(pack.rates.G3, 4, "G3 total rate must be 4%");
  assert.equal(pack.rates.G2, 25, "G2 total rate must be 25%");
  assert.equal(pack.rates.G1, 70, "G1 total rate must be 70%");
  assert.equal(pack.rates["choice-ticket"], 1, "choice ticket rate must be 1%");
  assert.equal(pack.displayName, "ぐんまのし", "season 1 pack should use the city pack name");
  assert.ok(pack.saleStartsAt && pack.saleEndsAt, "pack sale period must be configurable");
  assert.equal(pack.entryMode, "fixed-card-list", "current pack should use fixed card entries");
  assert.equal(pack.futureEntryMode, "randomizable-card-pool", "pack data should document future random card-pool mode");
  assert.equal(pack.exchangeMedalItem, "packMedal", "pack should use a distinct exchange token item");
  assert.equal(pack.exchangeMedalGrant, 1, "one pack opening should grant one exchange token");
  assert.equal(pack.exchangeMedalCost, 50, "fifty pack-specific exchange tokens should buy one pack card or limit break");

  const cardEntries = pack.entries.filter((entry) => entry.type === "card");
  const byRarity = countByValue(cardEntries.map((entry) => cardById.get(entry.cardId).rarityG));
  assert.equal(byRarity.get(3), 2, "pack must contain two G3 cards");
  assert.equal(byRarity.get(2), 4, "pack must contain four G2 cards");
  assert.equal(byRarity.get(1), 6, "pack must contain six G1 cards");
  assert.equal(pack.entries.filter((entry) => entry.type === "choice-ticket").length, 1, "pack must contain one ticket entry");
}

function checkDeckNameKeyRule() {
  const keys = data.basicDeckIds.map((id) => cardById.get(id).nameKey);
  assert.equal(keys.length, new Set(keys).size, "basic deck cannot contain duplicate nameKey values");
}

function checkStaminaRules() {
  assert.equal(data.stamina.max, 5, "stamina max should start at 5");
  assert.equal(data.stamina.playCost, 1, "one play should cost one stamina");
  assert.equal(data.stamina.recoverSeconds, 600, "one stamina should recover every 10 minutes");
}

function checkDailyMissionRules() {
  assert.equal(data.dailyMission.id, "daily-clear-30", "legacy daily mission id should be stable");
  assert.equal(data.dailyMission.targetMatches, 30, "legacy daily mission should target thirty cleared words");
  assert.equal(data.dailyMission.rewardItem, "packStone", "daily mission should reward pack stones");
  assert.equal(data.dailyMission.rewardAmount, 1, "daily mission should reward one pack stone");
  assert.equal(data.dailyMission.streakBonusEvery, 3, "daily streak bonus should trigger every three claimed days");
  assert.equal(data.dailyMission.streakBonusItem, "packStone", "daily streak bonus should reward pack stones");
  assert.equal(data.dailyMission.streakBonusAmount, 1, "daily streak bonus should reward one pack stone");

  assert.deepEqual(
    data.dailyMissions.map(({ id, type, target, rewardAmount }) => ({ id, type, target, rewardAmount })),
    [
      { id: "daily-play-3", type: "runs", target: 3, rewardAmount: 1 },
      { id: "daily-words-30", type: "matches", target: 30, rewardAmount: 1 },
      { id: "daily-score-15000", type: "scoreTotal", target: 15000, rewardAmount: 1 },
    ],
    "daily missions should rotate between roughly three-play tasks",
  );
}

function checkDailyScoreTargetRules() {
  assert.equal(data.dailyScoreTarget.id, "daily-score-5000", "daily score target id should be stable");
  assert.equal(data.dailyScoreTarget.targetScore, 5000, "daily score target should start at 5000 points");
  assert.equal(data.dailyScoreTarget.rewardItem, "packStone", "daily score target should reward pack stones");
  assert.equal(data.dailyScoreTarget.rewardAmount, 1, "daily score target should reward one pack stone");
}

function checkWeeklyChallengeRules() {
  assert.equal(data.weeklyChallenge.id, "weekly-festival-200", "legacy weekly challenge id should be stable");
  assert.equal(data.weeklyChallenge.targetMatches, 200, "legacy weekly challenge should target about twenty plays of words");
  assert.equal(data.weeklyChallenge.rewardItem, "packStone", "weekly challenge should reward pack stones");
  assert.equal(data.weeklyChallenge.rewardAmount, 10, "weekly challenge should reward ten pack stones");

  assert.deepEqual(
    data.weeklyMissions.map(({ id, type, target, rewardAmount }) => ({ id, type, target, rewardAmount })),
    [
      { id: "weekly-play-20", type: "runs", target: 20, rewardAmount: 10 },
      { id: "weekly-words-200", type: "matches", target: 200, rewardAmount: 10 },
      { id: "weekly-score-100000", type: "scoreTotal", target: 100000, rewardAmount: 10 },
    ],
    "weekly missions should rotate between roughly twenty-play tasks",
  );
}

function checkDailyRankingRules() {
  assert.equal(data.dailyRanking.id, "daily-ranking", "daily ranking id should be stable");
  assert.equal(data.dailyRanking.topLimit, 10, "daily ranking should show the top ten");
  assert.equal(data.dailyRanking.rewardRankMax, 10, "daily ranking should reward top ten players");
  assert.equal(data.dailyRanking.rewardItem, "packStone", "daily ranking should reward pack stones");
  assert.equal(data.dailyRanking.rewardAmount, 3, "daily ranking should reward three pack stones");
}

function checkDailyGiftRules() {
  assert.equal(data.dailyGift.id, "daily-login-gift", "daily gift id should be stable");
  assert.equal(data.dailyGift.rewardItem, "packStone", "daily gift should reward pack stones");
  assert.equal(data.dailyGift.rewardAmount, 1, "daily gift should reward one pack stone");
  assert.ok(data.dailyGift.label.includes("差し入れ"), "daily gift should use friendly wording");
}

checkBasicDeckPool();
checkCardData();
checkPackRates();
checkDeckNameKeyRule();
checkStaminaRules();
checkDailyMissionRules();
checkDailyScoreTargetRules();
checkWeeklyChallengeRules();
checkDailyRankingRules();
checkDailyGiftRules();

console.log("Gunmoji Puzzle rule checks passed.");
