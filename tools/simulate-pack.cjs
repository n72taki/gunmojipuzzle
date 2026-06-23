const data = require("../data/cards.js");

const cardById = new Map(data.cards.map((card) => [card.id, card]));
const pack = data.packs[0];
const trials = Number.parseInt(process.argv[2] || "100000", 10);

function mulberry32(seed) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedPick(entries, rng) {
  const total = entries.reduce((sum, entry) => sum + entry.rate, 0);
  let roll = rng() * total;
  for (const entry of entries) {
    roll -= entry.rate;
    if (roll <= 0) {
      return entry;
    }
  }
  return entries[entries.length - 1];
}

const rng = mulberry32(20260610);
const buckets = {
  G3: 0,
  G2: 0,
  G1: 0,
  "choice-ticket": 0,
};
const cards = new Map();

for (let i = 0; i < trials; i += 1) {
  const entry = weightedPick(pack.entries, rng);
  if (entry.type === "choice-ticket") {
    buckets["choice-ticket"] += 1;
    continue;
  }
  const card = cardById.get(entry.cardId);
  buckets[`G${card.rarityG}`] += 1;
  cards.set(card.id, (cards.get(card.id) || 0) + 1);
}

function percent(n) {
  return `${((n / trials) * 100).toFixed(2)}%`;
}

console.log(`Pack simulation: ${pack.displayName} x ${trials}`);
console.table(
  Object.entries(buckets).map(([bucket, n]) => ({
    bucket,
    count: n,
    observed: percent(n),
    target: `${pack.rates[bucket]}%`,
  })),
);

console.log("Cards");
console.table(
  [...cards.entries()]
    .map(([id, n]) => {
      const card = cardById.get(id);
      return {
        id,
        name: card.displayName,
        rarity: `G${card.rarityG}`,
        count: n,
        observed: percent(n),
      };
    })
    .sort((a, b) => b.count - a.count),
);

