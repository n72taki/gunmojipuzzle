const data = require("../data/cards.js");

const SCORE_LENGTH_CUBE_FACTOR = 30;
const SCORE_LENGTH_MULTIPLIERS = {
  1: 0,
  2: 0,
  3: 0.48,
  4: 0.78,
  5: 1,
  6: 1.2,
  7: 1.34,
  8: 1.46,
};
const REPEAT_FATIGUE_CONFIG = {
  shortStart: 5,
  shortStep: 0.045,
  shortMin: 0.34,
  midStart: 12,
  midStep: 0.018,
  midMin: 0.64,
};
const MIN_REWARD_DECK_KANA = 10;
const DECK_SCORE_MULTIPLIERS = {
  easy: 0.8,
  normal: 1,
  hard: 1.08,
  expert: 1.16,
};
const THEME_BIAS_THRESHOLD = 0.25;
const THEME_BIAS_PENALTY = 0.04;
const SKILL_COOLDOWN_SECONDS = 10;
const MAX_EXTRA_TIME_SECONDS = 20;
const MAX_SAUCE_BURST_CHARGES = 3;

const futureCards = [
  {
    id: "future-kusatsu",
    displayName: "くさつ",
    readingKana: "くさつ",
    skillId: "future",
  },
  {
    id: "future-ikaho-onsen",
    displayName: "いかほおんせん",
    readingKana: "いかほおんせん",
    skillId: "future",
  },
  {
    id: "future-shima-onsen",
    displayName: "しまおんせん",
    readingKana: "しまおんせん",
    skillId: "future",
  },
];

const cardById = new Map(data.cards.concat(futureCards).map((card) => [card.id, card]));

function chars(text) {
  return Array.from(text);
}

function count(values) {
  const result = new Map();
  for (const value of values) {
    result.set(value, (result.get(value) || 0) + 1);
  }
  return result;
}

function buildPool(deckIds) {
  return deckIds.flatMap((id) => chars(cardById.get(id).readingKana));
}

function evaluateDeckProfile(deckIds) {
  const deckCards = deckIds.map((id) => cardById.get(id));
  const lengths = deckCards.map((card) => chars(card.readingKana).length);
  const totalLetters = lengths.reduce((sum, length) => sum + length, 0);
  const counts = count(buildPool(deckIds));
  const uniqueLetters = counts.size;
  const maxLetterCount = Math.max(0, ...counts.values());
  const maxLetterRate = totalLetters > 0 ? maxLetterCount / totalLetters : 0;
  const shortCardCount = lengths.filter((length) => length <= 3).length;
  const longCardCount = lengths.filter((length) => length >= 5).length;
  const theme = totalLetters >= 12 && maxLetterRate >= THEME_BIAS_THRESHOLD;
  let rank = "normal";
  if (totalLetters < MIN_REWARD_DECK_KANA || shortCardCount >= 3) {
    rank = "easy";
  } else if (totalLetters >= 18 && uniqueLetters >= 9 && longCardCount >= 2) {
    rank = "expert";
  } else if (totalLetters >= 14 && uniqueLetters >= 7) {
    rank = "hard";
  }
  const themePenalty = theme && rank !== "easy" ? THEME_BIAS_PENALTY : 0;
  const scoreMultiplier = Math.max(0.72, (DECK_SCORE_MULTIPLIERS[rank] || 1) - themePenalty);
  const rewardMultiplier = rank === "easy" ? 0.75 : 1;
  return {
    deckCards,
    totalLetters,
    uniqueLetters,
    maxLetterCount,
    maxLetterRate,
    shortCardCount,
    longCardCount,
    theme,
    rank,
    scoreMultiplier,
    rewardMultiplier,
  };
}

function baseWordScore(length) {
  const safeLength = Math.max(0, Math.floor(Number(length) || 0));
  const scoreMultiplier = SCORE_LENGTH_MULTIPLIERS[Math.min(safeLength, 8)] ?? SCORE_LENGTH_MULTIPLIERS[8] ?? 1;
  return Math.round(SCORE_LENGTH_CUBE_FACTOR * safeLength * safeLength * safeLength * scoreMultiplier);
}

function repeatScoreMultiplier(length, previousClears) {
  const safeLength = Math.max(0, Math.floor(Number(length) || 0));
  if (safeLength >= 5) {
    return 1;
  }
  const isShort = safeLength <= 3;
  const start = isShort ? REPEAT_FATIGUE_CONFIG.shortStart : REPEAT_FATIGUE_CONFIG.midStart;
  const step = isShort ? REPEAT_FATIGUE_CONFIG.shortStep : REPEAT_FATIGUE_CONFIG.midStep;
  const min = isShort ? REPEAT_FATIGUE_CONFIG.shortMin : REPEAT_FATIGUE_CONFIG.midMin;
  const fatigueSteps = Math.max(0, previousClears - start + 1);
  return Math.max(min, 1 - fatigueSteps * step);
}

function repeatedCardScore(card, clears) {
  const length = chars(card.readingKana).length;
  const base = baseWordScore(length);
  let total = 0;
  for (let previousClears = 0; previousClears < clears; previousClears += 1) {
    total += Math.round(base * repeatScoreMultiplier(length, previousClears));
  }
  return total;
}

function skillMeterGainForMatch(cardId, wordLength, pushCardId) {
  const safeLength = Math.max(0, Math.floor(Number(wordLength) || 0));
  const isPush = cardId === pushCardId;
  if (safeLength <= 3) {
    return isPush ? 22 : 14;
  }
  if (safeLength === 4) {
    return isPush ? 30 : 20;
  }
  if (safeLength === 5) {
    return isPush ? 38 : 26;
  }
  return isPush ? 44 : 30;
}

function skillUsesFromClears(card, clears, pushCardId = card.id) {
  const length = chars(card.readingKana).length;
  const gain = skillMeterGainForMatch(card.id, length, pushCardId);
  return Math.floor((gain * clears) / 100);
}

function summarizeDeck(label, deckIds) {
  const deckCards = deckIds.map((id) => cardById.get(id));
  const pool = buildPool(deckIds);
  const counts = [...count(pool).entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"));
  const profile = evaluateDeckProfile(deckIds);
  console.log(`\nDeck: ${label}`);
  console.table([
    {
      rank: profile.rank,
      totalLetters: profile.totalLetters,
      uniqueLetters: profile.uniqueLetters,
      maxLetterRate: `${(profile.maxLetterRate * 100).toFixed(1)}%`,
      theme: profile.theme,
      scoreMultiplier: profile.scoreMultiplier,
      rewardMultiplier: profile.rewardMultiplier,
    },
  ]);
  console.table(
    deckCards.map((card) => {
      const length = chars(card.readingKana).length;
      return {
        id: card.id,
        name: card.displayName,
        length,
        baseScore: baseWordScore(length),
        scoreAt20thClear: Math.round(baseWordScore(length) * repeatScoreMultiplier(length, 19)),
        scoreAt40thClear: Math.round(baseWordScore(length) * repeatScoreMultiplier(length, 39)),
        skill: card.skillId,
      };
    }),
  );

  console.log("Kana pool");
  console.table(
    counts.map(([kana, n]) => ({
      kana,
      count: n,
      rate: `${((n / pool.length) * 100).toFixed(1)}%`,
    })),
  );
}

function assertBalance(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function compactProfile(profile) {
  return {
    rank: profile.rank,
    totalLetters: profile.totalLetters,
    uniqueLetters: profile.uniqueLetters,
    maxLetterRate: Number(profile.maxLetterRate.toFixed(3)),
    shortCardCount: profile.shortCardCount,
    longCardCount: profile.longCardCount,
    theme: profile.theme,
    scoreMultiplier: Number(profile.scoreMultiplier.toFixed(2)),
    rewardMultiplier: profile.rewardMultiplier,
  };
}

const shortExploitDeckIds = ["season1-ota", "season1-numata", "basic-daruma"];
const longMixedDeckIds = ["basic-gunma-ken", "basic-akagi-san", "season1-tatebayashi"];
const futureOnsenDeckIds = ["basic-kusatsu-onsen", "future-ikaho-onsen", "future-shima-onsen"];
const futureKusatsuOnsenDeckIds = ["future-kusatsu", "basic-kusatsu-onsen", "future-shima-onsen"];

summarizeDeck("basic", data.basicDeckIds);
summarizeDeck("short-repeat-watch", shortExploitDeckIds);
summarizeDeck("long-mixed", longMixedDeckIds);
summarizeDeck("future-onsen", futureOnsenDeckIds);
summarizeDeck("future-kusatsu-onsen", futureKusatsuOnsenDeckIds);

const ota = cardById.get("season1-ota");
const shortNoFatigue = baseWordScore(3) * 40;
const shortWithFatigue = repeatedCardScore(ota, 40);
const basicProfile = evaluateDeckProfile(data.basicDeckIds);
const shortProfile = evaluateDeckProfile(shortExploitDeckIds);
const longProfile = evaluateDeckProfile(longMixedDeckIds);
const futureOnsenProfile = evaluateDeckProfile(futureOnsenDeckIds);
const futureKusatsuOnsenProfile = evaluateDeckProfile(futureKusatsuOnsenDeckIds);

assertBalance(baseWordScore(3) <= 400, `3-letter base score is too high: ${baseWordScore(3)}`);
assertBalance(baseWordScore(5) >= 3500, `5-letter base score should stay rewarding: ${baseWordScore(5)}`);
assertBalance(baseWordScore(7) >= 13000, `7-letter base score should reward long decks: ${baseWordScore(7)}`);
assertBalance(shortWithFatigue <= shortNoFatigue * 0.65, `repeat fatigue is too weak: ${shortWithFatigue}/${shortNoFatigue}`);
assertBalance(repeatScoreMultiplier(3, 39) <= 0.4, `40th short-card multiplier is too high: ${repeatScoreMultiplier(3, 39)}`);
assertBalance(SKILL_COOLDOWN_SECONDS >= 10, `skill cooldown is too short: ${SKILL_COOLDOWN_SECONDS}`);
assertBalance(MAX_EXTRA_TIME_SECONDS <= 20, `time cap is too loose: +${MAX_EXTRA_TIME_SECONDS}s`);
assertBalance(MAX_SAUCE_BURST_CHARGES <= 3, `sauce burst stock is too high: ${MAX_SAUCE_BURST_CHARGES}`);
assertBalance(skillMeterGainForMatch("season1-ota", 3, "season1-ota") <= 22, "3-letter push skill gain is too high");
assertBalance(skillUsesFromClears(ota, 10, "season1-ota") <= 2, `3-letter deck rotates skills too fast: ${skillUsesFromClears(ota, 10, "season1-ota")}`);
assertBalance(skillMeterGainForMatch("basic-gunma-ken", 5, "basic-gunma-ken") >= 38, "5-letter push skill gain should stay rewarding");
assertBalance(skillMeterGainForMatch("future-ikaho-onsen", 7, "future-ikaho-onsen") >= 44, "long push skill gain should stay rewarding");
assertBalance(
  (cardById.get("season1-numata")?.skillPower || 0) < SKILL_COOLDOWN_SECONDS,
  `time skill can grow the clock faster than cooldown: +${cardById.get("season1-numata")?.skillPower || 0}s/${SKILL_COOLDOWN_SECONDS}s`,
);
assertBalance(cardById.has("season1-ota") && cardById.has("season1-numata") && cardById.has("basic-daruma"), "watch deck cards are missing");
assertBalance(shortProfile.rank === "easy", `3-letter deck should be EASY, got ${shortProfile.rank}`);
assertBalance(shortProfile.scoreMultiplier <= 0.85, `EASY deck multiplier should stay modest: ${shortProfile.scoreMultiplier}`);
assertBalance(shortProfile.rewardMultiplier < 1, `EASY deck reward multiplier should be reduced: ${shortProfile.rewardMultiplier}`);
assertBalance(basicProfile.rank === "normal", `basic deck should stay NORMAL, got ${basicProfile.rank}`);
assertBalance(longProfile.rank === "hard", `long mixed deck should be HARD, got ${longProfile.rank}`);
assertBalance(futureOnsenProfile.rank === "expert", `future onsen deck should be EXPERT, got ${futureOnsenProfile.rank}`);
assertBalance(futureOnsenProfile.theme, "future onsen deck should be recognized as a themed deck");
assertBalance(futureOnsenProfile.scoreMultiplier > longProfile.scoreMultiplier, "future onsen deck should outscore hard decks when mastered");
assertBalance(futureKusatsuOnsenProfile.rank === "hard", `future kusatsu onsen deck should be HARD, got ${futureKusatsuOnsenProfile.rank}`);
assertBalance(futureKusatsuOnsenProfile.theme, "future kusatsu onsen deck should be recognized as a themed deck");
assertBalance(futureKusatsuOnsenProfile.scoreMultiplier >= 1.04, `future kusatsu onsen multiplier is too low: ${futureKusatsuOnsenProfile.scoreMultiplier}`);

console.log(
  JSON.stringify(
    {
      deckSize: data.deckSize,
      baseScores: {
        length3: baseWordScore(3),
        length4: baseWordScore(4),
        length5: baseWordScore(5),
        length7: baseWordScore(7),
      },
      shortRepeat: {
        noFatigue40Clears: shortNoFatigue,
        withFatigue40Clears: shortWithFatigue,
        clear40Multiplier: repeatScoreMultiplier(3, 39),
      },
      skillBalance: {
        cooldownSeconds: SKILL_COOLDOWN_SECONDS,
        maxExtraTimeSeconds: MAX_EXTRA_TIME_SECONDS,
        maxSauceBurstCharges: MAX_SAUCE_BURST_CHARGES,
        pushGainLength3: skillMeterGainForMatch("season1-ota", 3, "season1-ota"),
        pushGainLength5: skillMeterGainForMatch("basic-gunma-ken", 5, "basic-gunma-ken"),
        pushGainLength7: skillMeterGainForMatch("future-ikaho-onsen", 7, "future-ikaho-onsen"),
        shortPushSkillUsesIn10Clears: skillUsesFromClears(ota, 10, "season1-ota"),
      },
      deckProfiles: {
        basic: compactProfile(basicProfile),
        shortRepeatWatch: compactProfile(shortProfile),
        longMixed: compactProfile(longProfile),
        futureOnsen: compactProfile(futureOnsenProfile),
        futureKusatsuOnsen: compactProfile(futureKusatsuOnsenProfile),
      },
    },
    null,
    2,
  ),
);
