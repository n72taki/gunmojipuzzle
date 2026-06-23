(() => {
  "use strict";

  const DATA = window.KANAGUNMA_DATA;
  const BUILD_INFO = {
    versionName: DATA.build?.versionName || DATA.version || "0.0.0",
    versionCode: DATA.build?.versionCode || 0,
    channel: DATA.build?.channel || "prototype",
    buildId: DATA.build?.buildId || `${DATA.version || "0.0.0"}-prototype`,
    builtAt: DATA.build?.builtAt || "",
  };
  const CARD_BY_ID = new Map(DATA.cards.map((card) => [card.id, card]));
  const CARD_ART_IMAGES = new Map();
  const PACK = DATA.packs[0];
  const PACK_BY_ID = new Map((DATA.packs || []).map((pack) => [pack.id, pack]));
  const DEFAULT_PACK_ID = PACK?.id || "";
  const BASIC_DECK = DATA.basicDeckIds.slice(0, DATA.deckSize);
  const DEFAULT_REPLACE_SLOT_INDEX = 0;
  const APP_NAME = "ぐんもじぱずる";
  const APP_HASHTAG = "#ぐんもじぱずる";
  const EXCHANGE_TOKEN_LABEL = "引換だるま";
  const EXCHANGE_TOKEN_ICON_MARKUP = '<span class="exchange-daruma-icon" aria-hidden="true"></span>';
  const G_DARUMA_ICON_MARKUP = '<span class="g-daruma-icon" aria-hidden="true"></span>';
  const SAVE_KEY = "kana-gunmatsuri-save-v1";
  const STAMINA_MAX = DATA.stamina?.max || 5;
  const STAMINA_COST = DATA.stamina?.playCost || 1;
  const STAMINA_RECOVERY_SECONDS = DATA.stamina?.recoverSeconds || 600;
  const DAILY_MISSION = DATA.dailyMission || {
    targetMatches: 30,
    rewardItem: "packStone",
    rewardAmount: 1,
  };
  const DAILY_SCORE_TARGET = DATA.dailyScoreTarget || {
    targetScore: 5000,
    rewardItem: "packStone",
    rewardAmount: 1,
  };
  const WEEKLY_CHALLENGE = DATA.weeklyChallenge || {
    targetMatches: 200,
    rewardItem: "packStone",
    rewardAmount: 10,
    label: "週替わりチャレンジ",
    note: "今週のことばを200語見つける",
  };
  const DAILY_MISSION_CATALOG = normalizeMissionCatalog(DATA.dailyMissions, [
    {
      id: DAILY_MISSION.id || "daily-words-30",
      type: "matches",
      target: DAILY_MISSION.targetMatches || 30,
      label: "ことば30語",
      note: "3プレイぶんのことばを見つける",
      rewardItem: DAILY_MISSION.rewardItem || "packStone",
      rewardAmount: DAILY_MISSION.rewardAmount || 1,
    },
  ]);
  const WEEKLY_MISSION_CATALOG = normalizeMissionCatalog(DATA.weeklyMissions, [
    {
      id: WEEKLY_CHALLENGE.id || "weekly-words-200",
      type: "matches",
      target: WEEKLY_CHALLENGE.targetMatches || 200,
      label: WEEKLY_CHALLENGE.label || "週替わりチャレンジ",
      note: WEEKLY_CHALLENGE.note || "今週のことばを200語見つける",
      rewardItem: WEEKLY_CHALLENGE.rewardItem || "packStone",
      rewardAmount: WEEKLY_CHALLENGE.rewardAmount || 10,
    },
  ]);
  const DAILY_GIFT = DATA.dailyGift || {
    rewardItem: "packStone",
    rewardAmount: 1,
    label: "今日の差し入れ",
    note: "毎日1回、無料でGだるまを受け取れます",
  };
  const G_SHOP = DATA.gShop || {};
  const G_CURRENCY_LABEL = G_SHOP.currencyLabel || "G";
  const G_STAMINA_FULL_RECOVERY_COST = clampInteger(G_SHOP.staminaFullRecoveryCost || 1, 1, 99);
  const G_PURCHASE_BUNDLES = normalizePurchaseBundles(G_SHOP.bundles);
  const G_SHOP_PURCHASES_ENABLED = true;
  const GAME_STAGE_BACKGROUNDS = Object.freeze([
    "assets/generated/stage-game-akagi-haruna.png",
    "assets/generated/stage-game-kusatsu-onsen.png",
    "assets/generated/stage-game-myogi-rail.png",
  ]);
  const STREAK_BONUS_EVERY = DAILY_MISSION.streakBonusEvery || 3;
  const STREAK_BONUS_ITEM = DAILY_MISSION.streakBonusItem || "packStone";
  const STREAK_BONUS_AMOUNT = DAILY_MISSION.streakBonusAmount || 1;
  const TUTORIAL_CARD_ID = "basic-gunma-ken";
  const TUTORIAL_DEMO_AFTER_SECONDS = 8;
  const RUN_COUNTDOWN_SECONDS = 1.8;
  const WARMUP_RUNS = 3;
  const DEFAULT_RANKING_SEASON = {
    id: "season-1",
    label: "シーズン1",
    title: "ぐんもじ杯",
    periodLabel: "2026/06/12 - 2026/08/31",
    qualifierTopN: 100,
    activeStageId: "season-1",
    qualifierLabel: "シーズン期間内の最高スコアで競います",
    titleRewards: [
      { id: "season-top-100", stageId: "season-1", rankMax: 100, title: "シーズンランカー", label: "限定称号", limited: true },
      { id: "season-top-10", stageId: "season-1", rankMax: 10, title: "からっ風ランカー", label: "限定称号", limited: true },
      { id: "season-top-3", stageId: "season-1", rankMax: 3, title: "上州三傑", label: "限定称号", limited: true },
      { id: "season-top-1", stageId: "season-1", rankMax: 1, title: "ぐんもじ王", label: "限定称号", limited: true },
    ],
    stages: [
      {
        id: "season-1",
        type: "season",
        label: "シーズン1",
        title: "シーズン1 ランキング",
        periodLabel: "2026/06/12 - 2026/08/31",
        status: "open",
        topN: 100,
      },
    ],
    finalRules: [],
  };
  const CURRENT_SEASON = normalizeRankingSeason(DATA.rankingSeason);
  const RANKING_SEASON_HISTORY = normalizeRankingSeasonHistory(DATA.rankingSeasonHistory || DATA.rankingSeason?.history);
  const RANKING_SEASON_HISTORY_BY_ID = new Map(RANKING_SEASON_HISTORY.map((season) => [season.id, season]));
  const RANKING_TITLE_REWARDS = Object.freeze([
    ...CURRENT_SEASON.titleRewards,
    ...RANKING_SEASON_HISTORY.flatMap((season) => season.titleRewards || []),
  ]);
  const RANKING_STAGE_BY_ID = new Map(CURRENT_SEASON.stages.map((stage) => [stage.id, stage]));
  const ACTIVE_RANKING_STAGE_ID = RANKING_STAGE_BY_ID.has(CURRENT_SEASON.activeStageId)
    ? CURRENT_SEASON.activeStageId
    : CURRENT_SEASON.stages[0]?.id || "season-1";
  const RANKING_API_CONFIG = DATA.rankingApi || {};
  const RANKING_API_ENDPOINT_KEY = RANKING_API_CONFIG.endpointStorageKey || "kana-gunmatsuri-ranking-api-url";
  const RANKING_API_TIMEOUT_MS = clampInteger(RANKING_API_CONFIG.timeoutMs || 1200, 300, 8000);
  const RANKING_SYNC_STAGE_LIMIT = clampInteger(RANKING_API_CONFIG.stageLimit || 100, 8, 100);
  const RANKING_SYNC_MAX_PENDING = 16;
  const RANKING_PLAYER_NAME = "あなた";
  const DAILY_RANKING = DATA.dailyRanking || {};
  const DAILY_RANKING_TOP_LIMIT = clampInteger(DAILY_RANKING.topLimit || 10, 3, 20);
  const DAILY_RANKING_REWARD_RANK_MAX = clampInteger(DAILY_RANKING.rewardRankMax || 10, 1, DAILY_RANKING_TOP_LIMIT);
  const DAILY_RANKING_REWARD_AMOUNT = clampInteger(DAILY_RANKING.rewardAmount || 3, 1, 99);
  const DAILY_RANKING_REWARD_ITEM = DAILY_RANKING.rewardItem || "packStone";
  const PLAYER_RANK_MAX = 999;
  const PLAYER_XP_MAX = 99999999;
  const PLAYER_RANK_BONUS_XP = Object.freeze({ D: 3, C: 6, B: 10, A: 14, S: 20 });
  const PLAYER_SCORE_TITLE_OPTIONS = Object.freeze([
    { id: "score-d", rank: "D", minScore: 0, title: "上毛見習い", note: "通常称号" },
    { id: "score-c", rank: "C", minScore: 3500, title: "焼きまんじゅう好き", note: "RANK Cで解放" },
    { id: "score-b", rank: "B", minScore: 9000, title: "からっ風チャレンジャー", note: "RANK Bで解放" },
    { id: "score-a", rank: "A", minScore: 18000, title: "赤城の達人", note: "RANK Aで解放" },
    { id: "score-s", rank: "S", minScore: 30000, title: "ぐんもじ名人", note: "RANK Sで解放" },
  ]);
  const PLAYER_SCORE_TITLES = Object.freeze(
    PLAYER_SCORE_TITLE_OPTIONS.reduce((titles, option) => {
      titles[option.rank] = option.title;
      return titles;
    }, {}),
  );
  const SEASON_RANKING_SEED = [
    { id: "rank-01", name: "からっ風マスター", score: 48200 },
    { id: "rank-02", name: "だるま職人", score: 41750 },
    { id: "rank-03", name: "赤城の風", score: 36200 },
    { id: "rank-04", name: "上毛かるた部", score: 30950 },
    { id: "rank-05", name: "温泉めぐり", score: 24800 },
    { id: "rank-06", name: "まえばしランナー", score: 18600 },
    { id: "rank-07", name: "たかさき推し", score: 12850 },
    { id: "rank-08", name: "ぐんま見習い", score: 5200 },
  ];
  const DAILY_RANKING_SEED_NAMES = [
    "朝練だるま",
    "上州日課勢",
    "からっ風ランナー",
    "温泉朝活",
    "赤城の一手",
    "まえばし挑戦者",
    "たてばやし部",
    "高崎だるま会",
    "金山ライン勢",
    "ぐんもじ日和",
  ];
  const TELEMETRY_MAX_EVENTS = 24;
  const TELEMETRY_REPORT_EVENTS = 12;
  const QUICK_FEEDBACK_MAX = 12;
  const QUICK_FEEDBACK_OPTIONS = [
    { id: "fun", label: "楽しい", perspective: "player" },
    { id: "hard", label: "難しい", perspective: "player" },
    { id: "learn", label: "学びあり", perspective: "educator" },
    { id: "stream", label: "盛り上がる", perspective: "streamer" },
    { id: "unclear", label: "見づらい", perspective: "viewer" },
  ];
  const QUICK_FEEDBACK_BY_ID = new Map(QUICK_FEEDBACK_OPTIONS.map((option) => [option.id, option]));
  const PERSPECTIVE_LABELS = {
    player: "プレイヤー",
    educator: "教育者",
    streamer: "配信者",
    viewer: "視聴者",
  };

  const COLS = 6;
  const ROWS = 7;
  const TUTORIAL_ROW = ROWS - 1;
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
  const SHORT_COMBO_RESET_AT = 5;
  const DECK_SCORE_MULTIPLIERS = {
    easy: 0.8,
    normal: 1,
    hard: 1.08,
    expert: 1.16,
  };
  const THEME_BIAS_THRESHOLD = 0.25;
  const THEME_BIAS_PENALTY = 0.04;
  const REFRESH_COOLDOWN_SECONDS = 7;
  const REFRESH_TIME_COST_SECONDS = 1.5;
  const SKILL_COOLDOWN_SECONDS = 10;
  const SPECIAL_ITEMS_ENABLED = false;
  const MAX_TIME_LEFT_SECONDS = DATA.runSeconds + 20;
  const AUTO_SCAN_INTERVAL = 0.14;
  const SLIDE_THRESHOLD_RATIO = 0.38;

  const SPECIAL_COLORS = {
    jam: ["#374151", "#111827"],
    "time-plus": ["#2fb8d8", "#146c94"],
    "score-up": ["#f5b642", "#ef5d50"],
  };

  const CARD_PALETTES = {
    "festival-red": ["#ef5d50", "#f5b642"],
    "mountain-green": ["#397f68", "#95c75f"],
    "onsen-teal": ["#0d9488", "#5ac8c1"],
    "daruma-coral": ["#d64045", "#fb8f67"],
    "sauce-gold": ["#8f5a22", "#f5b642"],
    "triple-mountain": ["#455a64", "#7cb342"],
    "river-blue": ["#2878b8", "#70c4db"],
    "stone-amber": ["#8d6e63", "#f5b642"],
    "lake-green": ["#2f7d6d", "#a6d98e"],
    "rock-violet": ["#6457a6", "#a48be0"],
    "steel-blue": ["#35637a", "#93a9bd"],
    "weave-indigo": ["#324a91", "#7b8fd8"],
    "river-mint": ["#0d9488", "#b4dfc9"],
    "city-coral": ["#ef5d50", "#2878b8"],
    "konnyaku-gray": ["#72777f", "#c7ced6"],
    "wind-cream": ["#d99945", "#f7d89b"],
    "silk-ivory": ["#b08968", "#f3e6cf"],
    "terrace-green": ["#557c55", "#b7d07a"],
    "flower-pink": ["#d65b87", "#ffb4a6"],
  };

  const SLOT_COLOR_PRESETS = [
    { id: "blue", label: "青", code: "BLUE", colors: ["#2878b8", "#70c4db"], ring: "rgba(40, 120, 184, 0.45)" },
    { id: "red", label: "赤", code: "RED", colors: ["#d64045", "#fb8f67"], ring: "rgba(214, 64, 69, 0.45)" },
    { id: "green", label: "緑", code: "GREEN", colors: ["#397f68", "#95c75f"], ring: "rgba(57, 127, 104, 0.46)" },
    { id: "yellow", label: "黄", code: "YELLOW", colors: ["#d99945", "#f7d89b"], ring: "rgba(217, 153, 69, 0.48)" },
    { id: "purple", label: "紫", code: "PURPLE", colors: ["#6457a6", "#a48be0"], ring: "rgba(100, 87, 166, 0.45)" },
    { id: "aqua", label: "水", code: "AQUA", colors: ["#0d9488", "#5ac8c1"], ring: "rgba(13, 148, 136, 0.44)" },
  ];
  const SLOT_COLOR_BY_ID = new Map(SLOT_COLOR_PRESETS.map((preset) => [preset.id, preset]));
  const DEFAULT_SLOT_COLOR_IDS = ["blue", "red", "green"];
  const RARITY_SKILL_MULTIPLIERS = Object.freeze({
    1: 1,
    2: 1.06,
    3: 1.12,
  });
  const LAST_SPURT_SECONDS = 10;
  const LAST_SPURT_SCORE_BONUS = 0.1;
  const SPECIAL_CRANE_CHECK_SECONDS = 30;
  const SPECIAL_CRANE_END_SECONDS = 10;
  const SPECIAL_CRANE_SCORE_BONUS = 0.03;
  const SPECIAL_CRANE_TRIGGER_CHANCE = 1 / 200;
  const SPECIAL_CRANE_IMAGE_SRC = "assets/generated/special-gunma-crane.png";
  const RUN_ART_IMAGES = new Map();
  const MAX_LIMIT_BREAK = 10;
  const MAX_OWNED_COPIES = MAX_LIMIT_BREAK + 1;
  const PUSH_SKILL_MULTIPLIER = 2;
  const PASSIVE_SKILL_BALANCE = Object.freeze({
    openingScore: {
      duration: 5,
      baseByRarity: { 1: 0.04, 2: 0.05, 3: 0.06 },
      perLimitBreak: 0.005,
      max: 0.1,
    },
    timePlus: {
      base: 3,
      perLimitBreak: 0.2,
      max: 5,
      deckMax: 10,
      minimumRarity: 3,
    },
    longWordScore: {
      minLength: 5,
      charges: 3,
      baseByRarity: { 1: 0.08, 2: 0.1, 3: 0.12 },
      perLimitBreak: 0.01,
      max: 0.2,
    },
    comboScore: {
      minCombo: 2,
      baseByRarity: { 1: 0.035, 2: 0.045, 3: 0.055 },
      perLimitBreak: 0.005,
      max: 0.1,
    },
    shortWordScore: {
      maxLength: 3,
      charges: 6,
      baseByRarity: { 1: 0.03, 2: 0.04, 3: 0.05 },
      perLimitBreak: 0.004,
      max: 0.08,
    },
  });
  const HIDDEN_COLLECTION_CARD_IDS = new Set(["basic-kusatsu-onsen"]);
  const COLLECTION_FILTERS = [
    { id: "all", label: "ALL", title: "ぜんぶ" },
    { id: "owned", label: "所持", title: "所持" },
    { id: "missing", label: "未所持", title: "未所持" },
    { id: "g3", label: "GGG", title: "G③" },
    { id: "g2", label: "GG", title: "G②" },
    { id: "g1", label: "G", title: "G①" },
  ];
  const COLLECTION_FILTER_BY_ID = new Map(COLLECTION_FILTERS.map((filter) => [filter.id, filter]));
  const COLLECTION_SORTS = [
    { id: "recommended", label: "おすすめ" },
    { id: "rarity", label: "レア" },
    { id: "name", label: "名前" },
  ];
  const COLLECTION_SORT_BY_ID = new Map(COLLECTION_SORTS.map((sort) => [sort.id, sort]));
  const COLLECTION_LENGTH_FILTERS = [
    { id: "all", label: "文字ALL", match: () => true },
    { id: "len3", label: "3字", match: (length) => length === 3 },
    { id: "len4", label: "4字", match: (length) => length === 4 },
    { id: "len5plus", label: "5字+", match: (length) => length >= 5 },
  ];
  const COLLECTION_LENGTH_FILTER_BY_ID = new Map(COLLECTION_LENGTH_FILTERS.map((filter) => [filter.id, filter]));
  const GUIDE_CATEGORIES = [
    { id: "mountain", label: "山", title: "山" },
    { id: "onsen", label: "温泉", title: "温泉" },
    { id: "town", label: "まち", title: "まち" },
    { id: "food", label: "食", title: "食" },
    { id: "culture", label: "文化", title: "文化" },
  ];
  const GUIDE_CATEGORY_BY_ID = new Map(GUIDE_CATEGORIES.map((category) => [category.id, category]));
  const GUIDE_TALK_PROMPTS = {
    mountain: "話題 山の形や風を話す",
    onsen: "話題 温泉で見たい景色",
    town: "話題 知っているまちと比べる",
    food: "話題 食べたい味を言う",
    culture: "話題 文化や縁起物を話す",
  };
  const GUIDE_LEARNING_CUES = {
    mountain: "学び 山の名前と地形",
    onsen: "学び 温泉地と自然",
    town: "学び まちの役割",
    food: "学び 郷土食と味",
    culture: "学び 文化と縁起物",
  };
  const GUIDE_REACTION_CUES = {
    mountain: "会話 景色を想像して一言",
    onsen: "会話 行ってみたい理由",
    town: "会話 知っている地名トーク",
    food: "反応 味のリアクション",
    culture: "会話 由来を一言で振る",
  };
  const GUIDE_VIEWER_CUES = {
    mountain: "視聴 登ったことある?",
    onsen: "視聴 行きたい温泉は?",
    town: "視聴 知ってるまちは?",
    food: "視聴 食べたい派?",
    culture: "視聴 願いごとをコメント",
  };
  const CARD_CATEGORY_BY_ID = {
    "basic-gunma-ken": "town",
    "basic-akagi-san": "mountain",
    "basic-kusatsu-onsen": "onsen",
    "basic-daruma": "culture",
    "basic-yaki-manju": "food",
    "season1-maebashi": "town",
    "season1-takasaki": "culture",
    "season1-kiryu": "culture",
    "season1-isesaki": "culture",
    "season1-ota": "town",
    "season1-numata": "mountain",
    "season1-tatebayashi": "town",
    "season1-shibukawa": "onsen",
    "season1-fujioka": "town",
    "season1-tomioka": "town",
    "season1-annaka": "town",
    "season1-midori": "mountain",
  };
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const playPanel = document.querySelector(".play-panel");
  const phone = document.querySelector(".phone");
  const appScreens = new Map(Array.from(document.querySelectorAll("[data-app-screen]")).map((screen) => [screen.dataset.appScreen, screen]));
  const navButtons = Array.from(document.querySelectorAll("[data-nav-target]"));
  const titleStartButton = document.getElementById("titleStartButton");
  const timeText = document.getElementById("timeText");
  const scoreText = document.getElementById("scoreText");
  const selectedWord = document.getElementById("selectedWord");
  const matchHint = document.getElementById("matchHint");
  const wordCall = document.getElementById("wordCall");
  const wordCallText = document.getElementById("wordCallText");
  const wordCallScore = document.getElementById("wordCallScore");
  const tutorialCoach = document.getElementById("tutorialCoach");
  const tutorialCoachText = document.getElementById("tutorialCoachText");
  const tutorialCoachSubtext = document.getElementById("tutorialCoachSubtext");
  const deckGrid = document.getElementById("deckGrid");
  const deckStrategyPanel = document.getElementById("deckStrategyPanel");
  const deckStrategyLead = document.getElementById("deckStrategyLead");
  const deckStrategyWords = document.getElementById("deckStrategyWords");
  const deckStrategyKana = document.getElementById("deckStrategyKana");
  const deckStrategyAdvice = document.getElementById("deckStrategyAdvice");
  const gameDeckLegend = document.getElementById("gameDeckLegend");
  const menuDeckGrid = document.getElementById("menuDeckGrid");
  const lastResultPanel = document.getElementById("lastResultPanel");
  const menuLastResultScore = document.getElementById("menuLastResultScore");
  const menuLastResultWord = document.getElementById("menuLastResultWord");
  const firstPlayPanel = document.getElementById("firstPlayPanel");
  const missionsLockedPanel = document.getElementById("missionsLockedPanel");
  const dailyPanel = document.getElementById("dailyPanel");
  const scoreGoalPanel = document.getElementById("scoreGoalPanel");
  const collectionGrid = document.getElementById("collectionGrid");
  const collectionFilterRow = document.getElementById("collectionFilterRow");
  const collectionLengthRow = document.getElementById("collectionLengthRow");
  const collectionSortRow = document.getElementById("collectionSortRow");
  const wordGuidePanel = document.getElementById("wordGuidePanel");
  const wordGuideTitle = document.getElementById("wordGuideTitle");
  const wordGuideMeta = document.getElementById("wordGuideMeta");
  const wordGuideNote = document.getElementById("wordGuideNote");
  const wordGuideLetters = document.getElementById("wordGuideLetters");
  const wordGuideStatus = document.getElementById("wordGuideStatus");
  const wordGuideAction = document.getElementById("wordGuideAction");
  const startButton = document.getElementById("startButton");
  const startButtonText = document.getElementById("startButtonText");
  const stageCountdown = document.getElementById("stageCountdown");
  const stageCountdownText = document.getElementById("stageCountdownText");
  const finishRestart = document.getElementById("finishRestart");
  const finishHome = document.getElementById("finishHome");
  const finishDeck = document.getElementById("finishDeck");
  const finishCard = document.getElementById("finishCard");
  const finishScore = document.getElementById("finishScore");
  const finishRank = document.getElementById("finishRank");
  const finishBestText = document.getElementById("finishBestText");
  const finishWords = document.getElementById("finishWords");
  const finishBestWord = document.getElementById("finishBestWord");
  const finishRewardSummary = document.getElementById("finishRewardSummary");
  const finishRewardText = document.getElementById("finishRewardText");
  const finishXpSummary = document.getElementById("finishXpSummary");
  const finishXpText = document.getElementById("finishXpText");
  const finishXpBar = document.getElementById("finishXpBar");
  const finishFeedbackButtons = document.getElementById("finishFeedbackButtons");
  const pauseButton = document.getElementById("pauseButton");
  const pauseCard = document.getElementById("pauseCard");
  const pauseReasonText = document.getElementById("pauseReasonText");
  const resumeButton = document.getElementById("resumeButton");
  const quitRunButton = document.getElementById("quitRunButton");
  const skillButton = document.getElementById("skillButton");
  const skillGauge = document.getElementById("skillGauge");
  const skillText = document.getElementById("skillText");
  const skillIcon = document.getElementById("skillIcon");
  const refreshButton = document.getElementById("refreshButton");
  const pushName = document.getElementById("pushName");
  const stoneText = document.getElementById("stoneText");
  const adButton = document.getElementById("adButton");
  const testBuyButton = document.getElementById("testBuyButton");
  const openPackButton = document.getElementById("openPackButton");
  const rateRow = document.getElementById("rateRow");
  const packExchangeStatus = document.getElementById("packExchangeStatus");
  const packCollectionProgress = document.getElementById("packCollectionProgress");
  const packCollectionText = document.getElementById("packCollectionText");
  const packCollectionBar = document.getElementById("packCollectionBar");
  const packCollectionHint = document.getElementById("packCollectionHint");
  const packLineup = document.getElementById("packLineup");
  const packResult = document.getElementById("packResult");
  const packPeriodText = document.getElementById("packPeriodText");
  const packFeatureRow = document.getElementById("packFeatureRow");
  const packSelector = document.getElementById("packSelector");
  const packDetailButton = document.getElementById("packDetailButton");
  const packDetailModal = document.getElementById("packDetailModal");
  const packDetailClose = document.getElementById("packDetailClose");
  const packDetailTitle = document.getElementById("packDetailTitle");
  const packReveal = document.getElementById("packReveal");
  const packRevealRarity = document.getElementById("packRevealRarity");
  const packRevealName = document.getElementById("packRevealName");
  const packRevealMeta = document.getElementById("packRevealMeta");
  const packRevealAction = document.getElementById("packRevealAction");
  const packOpeningModal = document.getElementById("packOpeningModal");
  const packOpeningCard = document.getElementById("packOpeningCard");
  const packOpeningClose = document.getElementById("packOpeningClose");
  const packOpeningCloseAction = document.getElementById("packOpeningCloseAction");
  const packOpeningKicker = document.getElementById("packOpeningKicker");
  const packOpeningTitle = document.getElementById("packOpeningTitle");
  const packOpeningArtFrame = document.getElementById("packOpeningArtFrame");
  const packOpeningArt = document.getElementById("packOpeningArt");
  const packOpeningFallback = document.getElementById("packOpeningFallback");
  const packOpeningRarity = document.getElementById("packOpeningRarity");
  const packOpeningName = document.getElementById("packOpeningName");
  const packOpeningSkill = document.getElementById("packOpeningSkill");
  const packOpeningMeta = document.getElementById("packOpeningMeta");
  const packOpeningAction = document.getElementById("packOpeningAction");
  const packOpeningAgain = document.getElementById("packOpeningAgain");
  const feedbackReportButton = document.getElementById("feedbackReportButton");
  const feedbackInsightPanel = document.getElementById("feedbackInsightPanel");
  const feedbackInsightGrid = document.getElementById("feedbackInsightGrid");
  const feedbackInsightLead = document.getElementById("feedbackInsightLead");
  const feedbackInsightNote = document.getElementById("feedbackInsightNote");
  const menuPushName = document.getElementById("menuPushName");
  const menuBestText = document.getElementById("menuBestText");
  const dailyWordPanel = document.getElementById("dailyWordPanel");
  const menuDailyWordTitle = document.getElementById("menuDailyWordTitle");
  const menuDailyWordName = document.getElementById("menuDailyWordName");
  const menuDailyWordNote = document.getElementById("menuDailyWordNote");
  const menuDailyWordPrompt = document.getElementById("menuDailyWordPrompt");
  const dailyWordGuideButton = document.getElementById("dailyWordGuideButton");
  const menuDailyTitle = document.getElementById("menuDailyTitle");
  const menuDailyProgress = document.getElementById("menuDailyProgress");
  const menuDailyReward = document.getElementById("menuDailyReward");
  const menuStreakText = document.getElementById("menuStreakText");
  const menuDailyBar = document.getElementById("menuDailyBar");
  const dailyGiftPanel = document.getElementById("dailyGiftPanel");
  const menuDailyGiftTitle = document.getElementById("menuDailyGiftTitle");
  const menuDailyGiftReward = document.getElementById("menuDailyGiftReward");
  const menuDailyGiftNote = document.getElementById("menuDailyGiftNote");
  const dailyGiftButton = document.getElementById("dailyGiftButton");
  const dailyGiftModal = document.getElementById("dailyGiftModal");
  const dailyGiftModalTitle = document.getElementById("dailyGiftModalTitle");
  const dailyGiftModalNote = document.getElementById("dailyGiftModalNote");
  const dailyGiftModalReward = document.getElementById("dailyGiftModalReward");
  const dailyGiftModalLater = document.getElementById("dailyGiftModalLater");
  const dailyGiftModalClaim = document.getElementById("dailyGiftModalClaim");
  const menuScoreGoalTitle = document.getElementById("menuScoreGoalTitle");
  const menuScoreGoalProgress = document.getElementById("menuScoreGoalProgress");
  const menuScoreGoalReward = document.getElementById("menuScoreGoalReward");
  const menuScoreGoalBar = document.getElementById("menuScoreGoalBar");
  const weeklyChallengePanel = document.getElementById("weeklyChallengePanel");
  const menuWeeklyTitle = document.getElementById("menuWeeklyTitle");
  const menuWeeklyProgress = document.getElementById("menuWeeklyProgress");
  const menuWeeklyReward = document.getElementById("menuWeeklyReward");
  const menuWeeklyNote = document.getElementById("menuWeeklyNote");
  const menuWeeklyBar = document.getElementById("menuWeeklyBar");
  const staminaEmptyPanel = document.getElementById("staminaEmptyPanel");
  const menuStaminaEmptyTimer = document.getElementById("menuStaminaEmptyTimer");
  const menuStaminaEmptyNote = document.getElementById("menuStaminaEmptyNote");
  const staminaGRecoverButton = document.getElementById("staminaGRecoverButton");
  const menuStaminaText = document.getElementById("menuStaminaText");
  const menuStaminaPips = document.getElementById("menuStaminaPips");
  const staminaAdButton = document.getElementById("staminaAdButton");
  const menuStoneText = document.getElementById("menuStoneText");
  const menuPlayerName = document.getElementById("menuPlayerName");
  const menuPlayerRank = document.getElementById("menuPlayerRank");
  const menuPlayerTitle = document.getElementById("menuPlayerTitle");
  const menuPlayerXpText = document.getElementById("menuPlayerXpText");
  const menuPlayerXpBar = document.getElementById("menuPlayerXpBar");
  const profileEditButton = document.getElementById("profileEditButton");
  const profileModal = document.getElementById("profileModal");
  const profileNameInput = document.getElementById("profileNameInput");
  const profileTitleList = document.getElementById("profileTitleList");
  const profileSaveButton = document.getElementById("profileSaveButton");
  const profileCancelButton = document.getElementById("profileCancelButton");
  const profileModalNote = document.getElementById("profileModalNote");
  const purchaseBalanceText = document.getElementById("purchaseBalanceText");
  const purchaseStaminaText = document.getElementById("purchaseStaminaText");
  const purchaseStaminaNote = document.getElementById("purchaseStaminaNote");
  const purchaseRecoverButton = document.getElementById("purchaseRecoverButton");
  const purchaseBundleGrid = document.getElementById("purchaseBundleGrid");
  const purchaseLegalNote = document.getElementById("purchaseLegalNote");
  const soundToggle = document.getElementById("soundToggle");
  const soundTestButton = document.getElementById("soundTestButton");
  const vibrationToggle = document.getElementById("vibrationToggle");
  const motionToggle = document.getElementById("motionToggle");
  const largeTextToggle = document.getElementById("largeTextToggle");
  const contrastToggle = document.getElementById("contrastToggle");
  const tileMarkToggle = document.getElementById("tileMarkToggle");
  const tutorialReplayButton = document.getElementById("tutorialReplayButton");
  const resetSaveButton = document.getElementById("resetSaveButton");
  const resetSaveNote = document.getElementById("resetSaveNote");
  const buildVersionText = document.getElementById("buildVersionText");
  const buildChannelText = document.getElementById("buildChannelText");
  const menuSeasonLabel = document.getElementById("menuSeasonLabel");
  const menuSeasonPeriod = document.getElementById("menuSeasonPeriod");
  const menuSeasonRank = document.getElementById("menuSeasonRank");
  const menuSeasonBest = document.getElementById("menuSeasonBest");
  const rankingSeasonLabel = document.getElementById("rankingSeasonLabel");
  const menuSeasonStage = document.getElementById("menuSeasonStage");
  const rankingSeasonTitle = document.getElementById("rankingSeasonTitle");
  const rankingSeasonPeriod = document.getElementById("rankingSeasonPeriod");
  const rankingQualifierText = document.getElementById("rankingQualifierText");
  const rankingMainTabButtons = Array.from(document.querySelectorAll("[data-ranking-view]"));
  const rankingTabPanels = Array.from(document.querySelectorAll("[data-ranking-panel]"));
  const rankingSeasonPanel = document.getElementById("rankingSeasonPanel");
  const rankingStageTabs = document.getElementById("rankingStageTabs");
  const rankingStageStatus = document.getElementById("rankingStageStatus");
  const rankingSyncStatus = document.getElementById("rankingSyncStatus");
  const dailyRankingTitle = document.getElementById("dailyRankingTitle");
  const dailyRankingDate = document.getElementById("dailyRankingDate");
  const dailyRankingRewardStatus = document.getElementById("dailyRankingRewardStatus");
  const dailyRankingTodayButton = document.getElementById("dailyRankingTodayButton");
  const dailyRankingYesterdayButton = document.getElementById("dailyRankingYesterdayButton");
  const dailyRankingOwnRank = document.getElementById("dailyRankingOwnRank");
  const dailyRankingOwnBest = document.getElementById("dailyRankingOwnBest");
  const dailyRankingList = document.getElementById("dailyRankingList");
  const rankingOwnRank = document.getElementById("rankingOwnRank");
  const rankingOwnBest = document.getElementById("rankingOwnBest");
  const rankingOwnTitle = document.getElementById("rankingOwnTitle");
  const rankingOwnTitleNote = document.getElementById("rankingOwnTitleNote");
  const rankingFinalRules = document.getElementById("rankingFinalRules");
  const rankingFinalRuleList = document.getElementById("rankingFinalRuleList");
  const rankingFinalDeckStatus = document.getElementById("rankingFinalDeckStatus");
  const seasonRecordTabButtons = Array.from(document.querySelectorAll("[data-season-record-view]"));
  const seasonCurrentPanel = document.getElementById("seasonCurrentPanel");
  const seasonHistoryPanel = document.getElementById("seasonHistoryPanel");
  const seasonHistoryList = document.getElementById("seasonHistoryList");
  const rankingList = document.getElementById("rankingList");
  const toast = document.getElementById("toast");

  let width = 360;
  let height = 520;
  let dpr = 1;
  let lastFrame = 0;
  let nextTileId = 1;
  let toastTimer = 0;
  let wordCallTimer = 0;
  let resetSaveConfirmUntil = 0;
  let selectedRankingStageId = ACTIVE_RANKING_STAGE_ID;
  let selectedRankingView = "season";
  let selectedSeasonRecordView = "current";
  let selectedDailyRankingView = "today";
  let rankingSyncPromise = null;
  let dailyGiftModalDismissedDate = "";
  let dailyGiftModalEligibleThisSession = false;
  let audioContext = null;
  let board = {
    originX: 0,
    originY: 0,
    tile: 42,
    gap: 4,
    width: 0,
    height: 0,
  };

  const state = {
    running: false,
    practiceMode: false,
    startCountdown: 0,
    paused: false,
    pauseReason: "",
    score: 0,
    timeLeft: DATA.runSeconds,
    tiles: [],
    effects: [],
    charPool: [],
    pointerActive: false,
    pointerStart: { x: 0, y: 0 },
    dragTile: null,
    autoScanTimer: 0,
    autoResolveQueued: false,
    refreshCooldown: 0,
    specialCooldown: 0,
    skillMeter: 0,
    skillCooldown: 0,
    scoreBoostTime: 0,
    scoreBoostMultiplier: 0,
    comboCount: 0,
    comboTimer: 0,
    maxCombo: 0,
    calmTime: 0,
    sauceBurstCharges: 0,
    runElapsed: 0,
    passiveSkills: [],
    passiveSkillCharges: {},
    lastSpurtActive: false,
    lastSpurtAnnounced: false,
    specialCrane: createFreshSpecialCraneState(),
    specialCraneChanceOverride: null,
    runStats: {
      matches: 0,
      bestWord: "",
      bestWordCardId: "",
      bestWordScore: 0,
      bestWordLength: 0,
      cardClears: {},
      dailyWordCleared: false,
      rewardEvents: [],
    },
    deckIds: BASIC_DECK.slice(),
    deckSlotColors: BASIC_DECK.map((_, index) => DEFAULT_SLOT_COLOR_IDS[index] || SLOT_COLOR_PRESETS[index % SLOT_COLOR_PRESETS.length].id),
    pushCardId: BASIC_DECK[0],
    selectedDeckSlot: 0,
    guideCardId: BASIC_DECK[0],
    owned: {},
    packStone: 0,
    packMedals: 0,
    packMedalsByPack: {},
    selectedPackId: DEFAULT_PACK_ID,
    packDetailOpen: false,
    exchangePackId: "",
    choiceTickets: 0,
    stamina: STAMINA_MAX,
    staminaUpdatedAt: Date.now(),
    dailyMission: createFreshDailyMission(),
    dailyScoreTarget: createFreshDailyScoreTarget(),
    weeklyChallenge: createFreshWeeklyChallenge(),
    dailyGift: createFreshDailyGift(),
    dailyWord: {
      dateKey: "",
      cardId: "",
      cleared: false,
    },
    dailyStreak: {
      count: 0,
      lastClaimDateKey: "",
    },
    lastDailyStreakBonus: false,
    completedRuns: 0,
    playerXp: 0,
    playerName: RANKING_PLAYER_NAME,
    selectedTitleId: "auto",
    ownedTitleIds: ["score-d"],
    tutorialComplete: false,
    tutorial: {
      active: false,
      hintFrom: null,
      hintTo: null,
      elapsed: 0,
      demoAfter: TUTORIAL_DEMO_AFTER_SECONDS,
      demoDone: false,
    },
    bestScore: 0,
    seasonRecords: createFreshSeasonRecords(),
    dailyRanking: createFreshDailyRankingState(),
    playerId: createPlayerId(),
    rankingOnline: createFreshRankingOnlineState(),
    bestWordRecord: {
      word: "",
      cardId: "",
      score: 0,
      length: 0,
    },
    lastResult: null,
    lastPackResult: "",
    lastPackReveal: null,
    packOpeningOpen: false,
    quickFeedback: [],
    collectionFilterId: "all",
    collectionLengthFilterId: "all",
    collectionSortId: "recommended",
    currentScreen: "title",
    telemetryEvents: [],
    soundEvents: [],
    settings: {
      sound: true,
      vibration: true,
      reduceMotion: false,
      largeText: false,
      highContrast: false,
      tileMarks: false,
    },
    rng: mulberry32(Date.now() >>> 0),
  };

  function createFreshSpecialCraneState() {
    return {
      checked: false,
      triggered: false,
      active: false,
      timer: 0,
      announced: false,
    };
  }

  initializeOwnership();
  loadSave();
  claimYesterdayDailyRankingReward({ silent: true });
  refreshOwnedTitles();
  dailyGiftModalEligibleThisSession = state.tutorialComplete && state.completedRuns > 0;
  normalizeDeckSlotColors();
  applyAccessibilityClasses();
  loadCardArtImages();
  loadRunArtImages();
  applyGameStageBackground();
  resizeCanvas();
  renderAll();
  logTelemetryEvent("app_open", {
    screen: state.currentScreen,
    deckSize: state.deckIds.length,
    stamina: state.stamina,
    build: BUILD_INFO.buildId,
    channel: BUILD_INFO.channel,
  });
  syncRanking({ reason: "app_open", stageId: ACTIVE_RANKING_STAGE_ID });
  requestAnimationFrame(frame);

  window.addEventListener("resize", resizeCanvas);
  titleStartButton.addEventListener("click", () => showScreen("menu"));
  for (const button of navButtons) {
    button.addEventListener("click", () => showScreen(button.dataset.navTarget));
  }
  startButton.addEventListener("click", startRun);
  finishRestart.addEventListener("click", startRun);
  finishHome?.addEventListener("click", returnHomeFromResult);
  finishDeck?.addEventListener("click", returnDeckFromResult);
  pauseButton.addEventListener("click", () => (state.paused ? resumeRun() : pauseRun("manual")));
  resumeButton.addEventListener("click", resumeRun);
  quitRunButton?.addEventListener("click", quitRun);
  skillButton.addEventListener("click", activateSkill);
  refreshButton.addEventListener("click", refreshBoard);
  dailyGiftButton?.addEventListener("click", claimDailyGift);
  dailyGiftModalClaim?.addEventListener("click", claimDailyGift);
  dailyGiftModalLater?.addEventListener("click", dismissDailyGiftModal);
  profileEditButton?.addEventListener("click", openProfileModal);
  profileCancelButton?.addEventListener("click", closeProfileModal);
  profileSaveButton?.addEventListener("click", saveProfileModal);
  profileTitleList?.addEventListener("click", onProfileTitleClick);
  profileModal?.addEventListener("click", (event) => {
    if (event.target === profileModal) {
      closeProfileModal();
    }
  });
  dailyWordGuideButton?.addEventListener("click", openDailyWordGuide);
  staminaAdButton?.addEventListener("click", recoverStaminaByAd);
  staminaGRecoverButton?.addEventListener("click", recoverStaminaWithG);
  purchaseRecoverButton?.addEventListener("click", recoverStaminaWithG);
  purchaseBundleGrid?.addEventListener("click", onPurchaseBundleClick);
  adButton?.addEventListener("click", () => addPackStone(1, `テスト広告 ${currencyRewardLabel(1)}`));
  testBuyButton?.addEventListener("click", () => addPackStone(10, `テスト付与 ${currencyRewardLabel(10)}`));
  openPackButton.addEventListener("click", openPack);
  packDetailButton?.addEventListener("click", openPackDetail);
  packDetailClose?.addEventListener("click", closePackDetail);
  packDetailModal?.addEventListener("click", (event) => {
    if (event.target === packDetailModal) {
      closePackDetail();
    }
  });
  packRevealAction?.addEventListener("click", openPackRevealTarget);
  packOpeningAction?.addEventListener("click", openPackRevealTarget);
  packOpeningAgain?.addEventListener("click", openPackAgain);
  packOpeningClose?.addEventListener("click", closePackOpeningModal);
  packOpeningCloseAction?.addEventListener("click", closePackOpeningModal);
  packOpeningModal?.addEventListener("click", (event) => {
    if (event.target === packOpeningModal) {
      closePackOpeningModal();
    }
  });
  packExchangeStatus?.addEventListener("click", openPackExchangeTarget);
  for (const button of rankingMainTabButtons) {
    button.addEventListener("click", () => setRankingView(button.dataset.rankingView));
  }
  for (const button of seasonRecordTabButtons) {
    button.addEventListener("click", () => setSeasonRecordView(button.dataset.seasonRecordView));
  }
  dailyRankingTodayButton?.addEventListener("click", () => setDailyRankingView("today"));
  dailyRankingYesterdayButton?.addEventListener("click", () => setDailyRankingView("yesterday"));
  wordGuideAction.addEventListener("click", onWordGuideActionClick);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", cancelDrag);
  collectionFilterRow.addEventListener("click", onCollectionFilterClick);
  collectionLengthRow?.addEventListener("click", onCollectionLengthClick);
  collectionSortRow?.addEventListener("click", onCollectionSortClick);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseRun("hidden", false);
    }
  });
  window.addEventListener("pagehide", () => pauseRun("hidden", false));
  window.addEventListener("blur", () => pauseRun("hidden", false));
  window.addEventListener("error", (event) => {
    logTelemetryEvent("runtime_error", { message: event.message || "error" });
    saveState();
  });
  window.addEventListener("unhandledrejection", (event) => {
    logTelemetryEvent("runtime_error", { message: event.reason?.message || "promise" });
    saveState();
  });
  soundToggle.addEventListener("change", () => updateSetting("sound", soundToggle.checked));
  soundTestButton.addEventListener("click", testSound);
  vibrationToggle.addEventListener("change", () => updateSetting("vibration", vibrationToggle.checked));
  motionToggle.addEventListener("change", () => updateSetting("reduceMotion", motionToggle.checked));
  largeTextToggle.addEventListener("change", () => updateSetting("largeText", largeTextToggle.checked));
  contrastToggle.addEventListener("change", () => updateSetting("highContrast", contrastToggle.checked));
  tileMarkToggle.addEventListener("change", () => updateSetting("tileMarks", tileMarkToggle.checked));
  tutorialReplayButton?.addEventListener("click", replayTutorial);
  resetSaveButton?.addEventListener("click", requestSaveReset);
  feedbackReportButton?.addEventListener("click", copyFeedbackReport);

  function initializeOwnership() {
    for (const card of DATA.cards) {
      state.owned[card.id] = DATA.basicDeckIds.includes(card.id) ? 1 : 0;
    }
  }

  function loadSave() {
    const save = readSave();
    if (!save || save.version !== 1) {
      return;
    }

    state.owned = sanitizeOwned(save.owned);
    state.packStone = clampInteger(save.packStone, 0, 9999);
    state.selectedPackId = PACK_BY_ID.has(save.selectedPackId) ? save.selectedPackId : DEFAULT_PACK_ID;
    state.packMedalsByPack = sanitizePackMedalsByPack(save.packMedalsByPack, save.packMedals);
    state.packMedals = getPackMedals(currentPack());
    state.choiceTickets = clampInteger(save.choiceTickets, 0, 99);
    state.stamina = Object.prototype.hasOwnProperty.call(save, "stamina") ? clampInteger(save.stamina, 0, STAMINA_MAX) : STAMINA_MAX;
    state.staminaUpdatedAt = clampInteger(save.staminaUpdatedAt, 0, Date.now()) || Date.now();
    state.dailyMission = sanitizeDailyMission(save.dailyMission);
    state.dailyScoreTarget = sanitizeDailyScoreTarget(save.dailyScoreTarget);
    state.weeklyChallenge = sanitizeWeeklyChallenge(save.weeklyChallenge);
    state.dailyGift = sanitizeDailyGift(save.dailyGift);
    state.dailyStreak = sanitizeDailyStreak(save.dailyStreak);
    state.completedRuns = clampInteger(save.completedRuns, 0, 99999);
    state.tutorialComplete = save.tutorialComplete === true;
    state.telemetryEvents = sanitizeTelemetryEvents(save.telemetryEvents);
    state.quickFeedback = sanitizeQuickFeedback(save.quickFeedback);
    state.deckIds = sanitizeDeckIds(save.deckIds);
    state.deckSlotColors = Array.isArray(save.deckSlotColors) ? save.deckSlotColors.slice(0, state.deckIds.length) : state.deckSlotColors;
    state.pushCardId = state.deckIds.includes(save.pushCardId) ? save.pushCardId : state.deckIds[0];
    normalizePushCardPlacement();
    state.selectedDeckSlot = defaultReplaceSlotIndex();
    state.collectionFilterId = COLLECTION_FILTER_BY_ID.has(save.collectionFilterId) ? save.collectionFilterId : "all";
    state.collectionLengthFilterId = COLLECTION_LENGTH_FILTER_BY_ID.has(save.collectionLengthFilterId) ? save.collectionLengthFilterId : "all";
    state.collectionSortId = COLLECTION_SORT_BY_ID.has(save.collectionSortId) ? save.collectionSortId : "recommended";
    state.dailyWord = sanitizeDailyWord(save.dailyWord);
    state.bestScore = clampInteger(save.bestScore, 0, 999999999);
    state.playerXp = Object.prototype.hasOwnProperty.call(save, "playerXp")
      ? sanitizePlayerXp(save.playerXp)
      : sanitizePlayerXp(state.completedRuns * 40 + Math.floor(state.bestScore / 2000));
    state.playerName = sanitizePlayerName(save.playerName);
    state.selectedTitleId = sanitizeSelectedTitleId(save.selectedTitleId);
    state.seasonRecords = sanitizeSeasonRecords(save.seasonRecords, state.bestScore);
    state.dailyRanking = sanitizeDailyRankingState(save.dailyRanking);
    state.playerId = sanitizePlayerId(save.playerId);
    state.rankingOnline = sanitizeRankingOnlineState(save.rankingOnline);
    state.ownedTitleIds = sanitizeOwnedTitleIds(save.ownedTitleIds, state.selectedTitleId);
    refreshOwnedTitles();
    if (state.selectedTitleId !== "auto" && !titleStatusById(state.selectedTitleId)) {
      state.selectedTitleId = "auto";
    }
    state.bestWordRecord = sanitizeWordRecord(save.bestWordRecord);
    state.lastResult = sanitizeLastResult(save.lastResult);
    state.settings = {
      sound: save.settings?.sound !== false,
      vibration: save.settings?.vibration !== false,
      reduceMotion: save.settings?.reduceMotion === true,
      largeText: save.settings?.largeText === true,
      highContrast: save.settings?.highContrast === true,
      tileMarks: save.settings?.tileMarks === true,
    };
    recoverStamina(Date.now(), false);
  }

  function readSave() {
    try {
      const raw = window.localStorage?.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function saveState() {
    refreshOwnedTitles();
    try {
      window.localStorage?.setItem(
        SAVE_KEY,
        JSON.stringify({
          version: 1,
          owned: state.owned,
          packStone: state.packStone,
          packMedals: getPackMedals(PACK),
          packMedalsByPack: state.packMedalsByPack,
          selectedPackId: state.selectedPackId,
          choiceTickets: state.choiceTickets,
          stamina: state.stamina,
          staminaUpdatedAt: state.staminaUpdatedAt,
          dailyMission: state.dailyMission,
          dailyScoreTarget: state.dailyScoreTarget,
          weeklyChallenge: state.weeklyChallenge,
          dailyGift: state.dailyGift,
          dailyWord: state.dailyWord,
          dailyStreak: state.dailyStreak,
          completedRuns: state.completedRuns,
          playerXp: sanitizePlayerXp(state.playerXp),
          playerName: sanitizePlayerName(state.playerName),
          selectedTitleId: sanitizeSelectedTitleId(state.selectedTitleId),
          ownedTitleIds: sanitizeOwnedTitleIds(state.ownedTitleIds, state.selectedTitleId),
          tutorialComplete: state.tutorialComplete,
          telemetryEvents: state.telemetryEvents,
          quickFeedback: state.quickFeedback,
          deckIds: state.deckIds,
          deckSlotColors: state.deckSlotColors,
          pushCardId: state.pushCardId,
          collectionFilterId: state.collectionFilterId,
          collectionLengthFilterId: state.collectionLengthFilterId,
          collectionSortId: state.collectionSortId,
          bestScore: state.bestScore,
          seasonRecords: state.seasonRecords,
          dailyRanking: sanitizeDailyRankingState(state.dailyRanking),
          playerId: state.playerId,
          rankingOnline: sanitizeRankingOnlineState(state.rankingOnline),
          bestWordRecord: state.bestWordRecord,
          lastResult: sanitizeLastResult(state.lastResult),
          settings: state.settings,
        }),
      );
    } catch (error) {
      // Local save is helpful for app feel, but storage failures must not block play.
    }
  }

  function sanitizeOwned(owned) {
    const result = {};
    for (const card of DATA.cards) {
      const savedCount = owned && Number.isFinite(Number(owned[card.id])) ? Number(owned[card.id]) : 0;
      const minimum = DATA.basicDeckIds.includes(card.id) ? 1 : 0;
      result[card.id] = Math.max(minimum, Math.min(MAX_OWNED_COPIES, Math.floor(savedCount)));
    }
    return result;
  }

  function sanitizePackMedalsByPack(savedMedalsByPack, legacyPackMedals = 0) {
    const result = {};
    for (const pack of DATA.packs || []) {
      const saved = savedMedalsByPack && Number.isFinite(Number(savedMedalsByPack[pack.id])) ? Number(savedMedalsByPack[pack.id]) : null;
      const fallback = pack.id === DEFAULT_PACK_ID && saved === null ? legacyPackMedals : 0;
      result[pack.id] = clampInteger(saved === null ? fallback : saved, 0, 9999);
    }
    return result;
  }

  function currentPack() {
    return PACK_BY_ID.get(state.selectedPackId) || PACK || DATA.packs[0];
  }

  function packForCard(card) {
    return (DATA.packs || []).find((pack) => pack.seasonId === card?.seasonId) || null;
  }

  function getPackMedals(pack = currentPack()) {
    if (!pack) {
      return 0;
    }
    if (!state.packMedalsByPack || typeof state.packMedalsByPack !== "object") {
      state.packMedalsByPack = {};
    }
    if (!Number.isFinite(Number(state.packMedalsByPack[pack.id]))) {
      state.packMedalsByPack[pack.id] = pack.id === DEFAULT_PACK_ID ? clampInteger(state.packMedals, 0, 9999) : 0;
    }
    return clampInteger(state.packMedalsByPack[pack.id], 0, 9999);
  }

  function setPackMedals(value, pack = currentPack()) {
    if (!pack) {
      return 0;
    }
    const next = clampInteger(value, 0, 9999);
    state.packMedalsByPack[pack.id] = next;
    if (pack.id === DEFAULT_PACK_ID) {
      state.packMedals = next;
    }
    return next;
  }

  function sanitizeTelemetryEvents(events) {
    if (!Array.isArray(events)) {
      return [];
    }
    return events
      .slice(-TELEMETRY_MAX_EVENTS)
      .map((event) => ({
        at: sanitizeTelemetryText(event?.at || "", 32),
        type: sanitizeTelemetryText(event?.type || "event", 40),
        data: sanitizeTelemetryData(event?.data || {}),
      }))
      .filter((event) => event.at && event.type);
  }

  function sanitizeQuickFeedback(items) {
    if (!Array.isArray(items)) {
      return [];
    }
    return items
      .slice(-QUICK_FEEDBACK_MAX)
      .map((item) => {
        const option = QUICK_FEEDBACK_BY_ID.get(item?.id);
        if (!option) {
          return null;
        }
        return {
          id: option.id,
          label: option.label,
          perspective: option.perspective,
          score: clampInteger(item.score, 0, 999999999),
          rank: sanitizeTelemetryText(item.rank || "", 8),
          practice: item.practice === true,
          at: sanitizeTelemetryText(item.at || "", 32),
        };
      })
      .filter(Boolean);
  }

  function sanitizeDeckIds(deckIds) {
    const result = [];
    const usedNameKeys = new Set();
    const candidates = Array.isArray(deckIds) ? deckIds.concat(BASIC_DECK) : BASIC_DECK.slice();
    for (const cardId of candidates) {
      const card = CARD_BY_ID.get(cardId);
      if (!card || (state.owned[cardId] || 0) <= 0 || usedNameKeys.has(card.nameKey)) {
        continue;
      }
      result.push(cardId);
      usedNameKeys.add(card.nameKey);
      if (result.length >= DATA.deckSize) {
        break;
      }
    }
    return result.length === DATA.deckSize ? result : BASIC_DECK.slice();
  }

  function sanitizeWordRecord(record) {
    if (!record || typeof record !== "object") {
      return { word: "", cardId: "", score: 0, length: 0 };
    }
    return {
      word: typeof record.word === "string" ? record.word.slice(0, 20) : "",
      cardId: CARD_BY_ID.has(record.cardId) ? record.cardId : "",
      score: clampInteger(record.score, 0, 999999999),
      length: clampInteger(record.length, 0, 20),
    };
  }

  function normalizeRankingSeason(config) {
    const source = config && typeof config === "object" ? config : {};
    const fallback = DEFAULT_RANKING_SEASON;
    const stages = Array.isArray(source.stages) && source.stages.length ? source.stages : fallback.stages;
    const finalRules = Array.isArray(source.finalRules) && source.finalRules.length ? source.finalRules : fallback.finalRules;
    const titleRewards = Array.isArray(source.titleRewards) && source.titleRewards.length ? source.titleRewards : fallback.titleRewards;
    return {
      id: rankingText(source.id, fallback.id, 48),
      label: rankingText(source.label, fallback.label, 32),
      title: rankingText(source.title, fallback.title, 48),
      periodLabel: rankingText(source.periodLabel, fallback.periodLabel, 48),
      qualifierTopN: rankingInteger(source.qualifierTopN, fallback.qualifierTopN, 1, 999),
      activeStageId: rankingText(source.activeStageId, fallback.activeStageId, 48),
      qualifierLabel: rankingText(source.qualifierLabel, fallback.qualifierLabel, 72),
      titleRewards: titleRewards.map((reward, index) => normalizeRankingTitleReward(reward, index)),
      stages: stages.map((stage, index) => normalizeRankingStage(stage, index)),
      finalRules: finalRules.map((rule, index) => normalizeRankingRule(rule, index)),
    };
  }

  function normalizeRankingSeasonHistory(history) {
    if (!Array.isArray(history)) {
      return [];
    }
    return history
      .map((season, index) => normalizeRankingHistorySeason(season, index))
      .filter((season) => season.id && season.id !== CURRENT_SEASON.id)
      .slice(0, 12);
  }

  function normalizeRankingHistorySeason(season, index) {
    const source = season && typeof season === "object" ? season : {};
    const id = rankingText(source.id, `season-history-${index + 1}`, 48);
    const label = rankingText(source.label, `シーズン${index + 1}`, 32);
    return {
      id,
      label,
      title: rankingText(source.title, `${label} 記録`, 48),
      periodLabel: rankingText(source.periodLabel, "終了シーズン", 48),
      note: rankingText(source.note, "終了したシーズンの記録です", 80),
      ownRankText: rankingText(source.ownRankText, "未参加", 16),
      ownBestScore: rankingInteger(source.ownBestScore, 0, 0, 999999999),
      titleRewards: Array.isArray(source.titleRewards)
        ? source.titleRewards.map((reward, rewardIndex) => normalizeRankingTitleReward(reward, rewardIndex))
        : [],
      entries: normalizeRankingHistoryEntries(source.entries, id),
    };
  }

  function normalizeRankingHistoryEntries(entries, seasonId) {
    if (!Array.isArray(entries)) {
      return [];
    }
    return entries
      .map((entry, index) => {
        if (!entry || typeof entry !== "object") {
          return null;
        }
        const score = rankingInteger(entry.score, 0, 0, 999999999);
        if (score <= 0 && !entry.isPlayer) {
          return null;
        }
        return {
          id: rankingText(entry.id, `${seasonId}-history-${index + 1}`, 64),
          name: rankingText(entry.name, `PLAYER ${index + 1}`, 24),
          title: rankingText(entry.title, "通常称号", 24),
          score,
          rank: rankingInteger(entry.rank, index + 1, 1, 9999),
          isPlayer: entry.isPlayer === true,
        };
      })
      .filter(Boolean)
      .slice(0, 100);
  }

  function normalizeRankingStage(stage, index) {
    const source = stage && typeof stage === "object" ? stage : {};
    const type = ["season", "week", "final"].includes(source.type) ? source.type : "season";
    const fallbackLabel = type === "final" ? "ファイナル" : type === "week" ? `ウィーク${index + 1}` : DEFAULT_RANKING_SEASON.label;
    const fallbackId = type === "final" ? "final" : type === "week" ? `week-${index + 1}` : `season-${index + 1}`;
    const status = ["open", "upcoming", "locked", "closed"].includes(source.status) ? source.status : "upcoming";
    return {
      id: rankingText(source.id, fallbackId, 48),
      type,
      label: rankingText(source.label, fallbackLabel, 32),
      title: rankingText(source.title, `${rankingText(source.label, fallbackLabel, 32)} ランキング`, 48),
      periodLabel: rankingText(source.periodLabel, DEFAULT_RANKING_SEASON.periodLabel, 48),
      status,
      topN: rankingInteger(source.topN, type === "final" ? 0 : DEFAULT_RANKING_SEASON.qualifierTopN, 0, 999),
      finalistSource: rankingText(source.finalistSource, "シーズン上位者", 72),
      rules: Array.isArray(source.rules) ? source.rules.map((rule, ruleIndex) => normalizeRankingRule(rule, ruleIndex)) : [],
    };
  }

  function normalizeRankingRule(rule, index) {
    const source = rule && typeof rule === "object" ? rule : {};
    const type = ["minCardLength", "requiredDeckKana", "note"].includes(source.type) ? source.type : "note";
    return {
      id: rankingText(source.id, `rule-${index + 1}`, 48),
      type,
      label: rankingText(source.label, "運営ルール", 72),
      value: rankingInteger(source.value, 0, 0, 99),
      values: Array.isArray(source.values) ? source.values.filter((value) => typeof value === "string").slice(0, 12) : [],
    };
  }

  function normalizeRankingTitleReward(reward, index) {
    const source = reward && typeof reward === "object" ? reward : {};
    const stageType = source.stageType === "week" || source.stageType === "final" ? source.stageType : "";
    const fallbackRankMax = stageType === "week" ? DEFAULT_RANKING_SEASON.qualifierTopN : index === 0 ? DEFAULT_RANKING_SEASON.qualifierTopN : 10;
    return {
      id: rankingText(source.id, `title-reward-${index + 1}`, 48),
      stageId: rankingText(source.stageId, "", 48),
      stageType,
      rankMax: rankingInteger(source.rankMax, fallbackRankMax, 1, 9999),
      title: rankingText(source.title, "上州ランカー", 24),
      label: rankingText(source.label, "限定称号", 24),
      limited: source.limited !== false,
    };
  }

  function rankingText(value, fallback, limit) {
    const text = typeof value === "string" && value.trim() ? value.trim() : fallback;
    return String(text || "").slice(0, limit);
  }

  function rankingInteger(value, fallback, min, max) {
    const number = Number.isFinite(Number(value)) ? Math.floor(Number(value)) : fallback;
    return Math.max(min, Math.min(max, number));
  }

  function createPlayerId() {
    if (window.crypto?.randomUUID) {
      return `player-${window.crypto.randomUUID()}`;
    }
    return `player-${Date.now().toString(36)}-${Math.floor(Math.random() * 0xffffff).toString(36)}`;
  }

  function sanitizePlayerId(value) {
    const text = String(value || "");
    return /^player-[a-z0-9-]{8,80}$/i.test(text) ? text : createPlayerId();
  }

  function createFreshRankingOnlineState() {
    return {
      status: "local",
      lastSyncedAt: "",
      lastError: "",
      stages: {},
      pending: [],
    };
  }

  function sanitizeRankingOnlineState(saved) {
    const result = createFreshRankingOnlineState();
    if (!saved || typeof saved !== "object") {
      return result;
    }
    const status = String(saved.status || "local");
    result.status = ["local", "pending", "syncing", "synced", "error"].includes(status) ? status : "local";
    result.lastSyncedAt = sanitizeTelemetryText(saved.lastSyncedAt || "", 32);
    result.lastError = sanitizeTelemetryText(saved.lastError || "", 96);
    if (saved.stages && typeof saved.stages === "object") {
      for (const stage of CURRENT_SEASON.stages) {
        const stageSave = saved.stages[stage.id];
        if (!stageSave || typeof stageSave !== "object") {
          continue;
        }
        result.stages[stage.id] = {
          source: sanitizeTelemetryText(stageSave.source || "server", 16),
          syncedAt: sanitizeTelemetryText(stageSave.syncedAt || "", 32),
          entries: sanitizeRankingEntries(stageSave.entries, stage.id),
        };
      }
    }
    result.pending = sanitizeRankingSubmissions(saved.pending);
    if (result.status === "syncing") {
      result.status = result.pending.length > 0 ? "pending" : "local";
    }
    if (result.pending.length > 0 && result.status === "synced") {
      result.status = "pending";
    }
    return result;
  }

  function sanitizeRankingEntries(entries, stageId = ACTIVE_RANKING_STAGE_ID) {
    if (!Array.isArray(entries)) {
      return [];
    }
    return entries
      .map((entry, index) => normalizeRankingEntry(entry, stageId, index))
      .filter(Boolean)
      .filter((entry, index) => index < RANKING_SYNC_STAGE_LIMIT || entry.isPlayer || entry.playerId === state.playerId);
  }

  function normalizeRankingEntry(entry, stageId, index = 0) {
    if (!entry || typeof entry !== "object") {
      return null;
    }
    const score = clampInteger(entry.score, 0, 999999999);
    if (score <= 0 && !entry.isPlayer) {
      return null;
    }
    const playerId = sanitizeTelemetryText(entry.playerId || entry.id || `rank-${stageId}-${index + 1}`, 96);
    const isPlayer = playerId === state.playerId || entry.isPlayer === true;
    return {
      id: sanitizeTelemetryText(entry.id || playerId || `rank-${stageId}-${index + 1}`, 96),
      playerId,
      name: sanitizeTelemetryText(entry.name || (isPlayer ? playerDisplayName() : `PLAYER ${index + 1}`), 24),
      score: isPlayer ? Math.max(score, currentSeasonBestScore(stageId)) : score,
      rank: clampInteger(entry.rank, index + 1, 9999),
      isPlayer,
      updatedAt: sanitizeTelemetryText(entry.updatedAt || entry.createdAt || "", 32),
    };
  }

  function sanitizeRankingSubmissions(entries) {
    if (!Array.isArray(entries)) {
      return [];
    }
    return entries
      .map((entry) => sanitizeRankingSubmission(entry))
      .filter(Boolean)
      .slice(-RANKING_SYNC_MAX_PENDING);
  }

  function sanitizeRankingSubmission(entry) {
    if (!entry || typeof entry !== "object") {
      return null;
    }
    const stage = rankingStageById(entry.stageId || ACTIVE_RANKING_STAGE_ID);
    const score = clampInteger(entry.score, 0, 999999999);
    if (score <= 0) {
      return null;
    }
    const rankProgress = playerRankProgress();
    const titleStatus = playerTitleStatus(stage.id);
    return {
      id: sanitizeTelemetryText(entry.id || `${state.playerId}-${Date.now()}`, 120),
      playerId: sanitizePlayerId(entry.playerId || state.playerId),
      playerName: sanitizeTelemetryText(entry.playerName || playerDisplayName(), 24),
      selectedTitleId: sanitizeSelectedTitleId(entry.selectedTitleId || state.selectedTitleId),
      selectedTitle: sanitizeTelemetryText(entry.selectedTitle || titleStatus.title, 24),
      playerRank: clampInteger(entry.playerRank, rankProgress.rank, PLAYER_RANK_MAX),
      playerXp: Object.prototype.hasOwnProperty.call(entry, "playerXp")
        ? sanitizePlayerXp(entry.playerXp)
        : sanitizePlayerXp(state.playerXp),
      seasonId: sanitizeTelemetryText(entry.seasonId || CURRENT_SEASON.id, 48),
      stageId: stage.id,
      dailyDateKey: isDateKey(entry.dailyDateKey) ? entry.dailyDateKey : todayDateKey(),
      score,
      rank: sanitizeTelemetryText(entry.rank || resultRank(score), 8),
      matches: clampInteger(entry.matches, 0, 9999),
      maxCombo: clampInteger(entry.maxCombo, 0, 9999),
      bestWord: sanitizeTelemetryText(entry.bestWord || "", 24),
      bestWordCardId: CARD_BY_ID.has(entry.bestWordCardId) ? entry.bestWordCardId : "",
      deckIds: sanitizeDeckIds(entry.deckIds || state.deckIds),
      buildId: sanitizeTelemetryText(entry.buildId || BUILD_INFO.buildId, 48),
      createdAt: sanitizeTelemetryText(entry.createdAt || new Date().toISOString(), 32),
    };
  }

  function createFreshSeasonRecords(bestScore = 0) {
    const stageRecords = {};
    for (const stage of CURRENT_SEASON.stages) {
      stageRecords[stage.id] = {
        bestScore: stage.id === ACTIVE_RANKING_STAGE_ID ? clampInteger(bestScore, 0, 999999999) : 0,
        updatedAt: "",
      };
    }
    return {
      [CURRENT_SEASON.id]: {
        bestScore: clampInteger(bestScore, 0, 999999999),
        updatedAt: "",
        activeStageId: ACTIVE_RANKING_STAGE_ID,
        stages: stageRecords,
      },
    };
  }

  function sanitizeSeasonRecords(records, fallbackBestScore = 0) {
    const result = createFreshSeasonRecords(fallbackBestScore);
    if (records && typeof records === "object") {
      for (const [seasonId, record] of Object.entries(records)) {
        if (seasonId === CURRENT_SEASON.id) {
          continue;
        }
        const sanitized = sanitizePastSeasonRecord(seasonId, record);
        if (sanitized) {
          result[sanitized.id] = sanitized.record;
        }
      }
    }
    const current = records?.[CURRENT_SEASON.id];
    if (current && typeof current === "object") {
      const seasonRecord = result[CURRENT_SEASON.id];
      const legacyBest = clampInteger(current.bestScore, 0, 999999999);
      seasonRecord.bestScore = legacyBest;
      seasonRecord.updatedAt = sanitizeTelemetryText(current.updatedAt || "", 32);
      seasonRecord.activeStageId = RANKING_STAGE_BY_ID.has(current.activeStageId) ? current.activeStageId : ACTIVE_RANKING_STAGE_ID;
      if (current.stages && typeof current.stages === "object") {
        for (const stage of CURRENT_SEASON.stages) {
          const savedStage = current.stages[stage.id];
          if (!savedStage || typeof savedStage !== "object") {
            continue;
          }
          seasonRecord.stages[stage.id] = {
            bestScore: clampInteger(savedStage.bestScore, 0, 999999999),
            updatedAt: sanitizeTelemetryText(savedStage.updatedAt || "", 32),
          };
        }
      }
      if (!seasonRecord.stages[ACTIVE_RANKING_STAGE_ID]?.bestScore && legacyBest > 0) {
        seasonRecord.stages[ACTIVE_RANKING_STAGE_ID] = {
          bestScore: legacyBest,
          updatedAt: seasonRecord.updatedAt,
        };
      }
      seasonRecord.bestScore = seasonRecord.stages[ACTIVE_RANKING_STAGE_ID]?.bestScore || legacyBest;
    }
    return result;
  }

  function sanitizePastSeasonRecord(seasonId, record) {
    const id = rankingText(seasonId, "", 48);
    if (!id || id === CURRENT_SEASON.id || !record || typeof record !== "object") {
      return null;
    }
    const historyMeta = RANKING_SEASON_HISTORY_BY_ID.get(id);
    const stages = {};
    let stageBest = 0;
    if (record.stages && typeof record.stages === "object") {
      for (const [stageId, stageRecord] of Object.entries(record.stages)) {
        if (!stageRecord || typeof stageRecord !== "object") {
          continue;
        }
        const bestScore = clampInteger(stageRecord.bestScore, 0, 999999999);
        stages[rankingText(stageId, `stage-${Object.keys(stages).length + 1}`, 48)] = {
          bestScore,
          updatedAt: sanitizeTelemetryText(stageRecord.updatedAt || "", 32),
        };
        stageBest = Math.max(stageBest, bestScore);
      }
    }
    const bestScore = Math.max(
      clampInteger(record.bestScore, historyMeta?.ownBestScore || 0, 0, 999999999),
      stageBest,
    );
    return {
      id,
      record: {
        label: rankingText(record.label, historyMeta?.label || id, 32),
        title: rankingText(record.title, historyMeta?.title || `${id} 記録`, 48),
        periodLabel: rankingText(record.periodLabel, historyMeta?.periodLabel || "終了シーズン", 48),
        note: rankingText(record.note, historyMeta?.note || "終了したシーズンの記録です", 80),
        rankText: rankingText(record.rankText, historyMeta?.ownRankText || (bestScore > 0 ? "記録あり" : "未参加"), 16),
        bestScore,
        updatedAt: sanitizeTelemetryText(record.updatedAt || "", 32),
        stages,
        entries: normalizeRankingHistoryEntries(record.entries || historyMeta?.entries || [], id),
      },
    };
  }

  function currentSeasonRecord() {
    if (!state.seasonRecords || typeof state.seasonRecords !== "object") {
      state.seasonRecords = createFreshSeasonRecords();
    }
    if (!state.seasonRecords[CURRENT_SEASON.id]) {
      state.seasonRecords[CURRENT_SEASON.id] = createFreshSeasonRecords()[CURRENT_SEASON.id];
    }
    const record = state.seasonRecords[CURRENT_SEASON.id];
    if (!record.stages || typeof record.stages !== "object") {
      record.stages = createFreshSeasonRecords(record.bestScore)[CURRENT_SEASON.id].stages;
    }
    for (const stage of CURRENT_SEASON.stages) {
      if (!record.stages[stage.id]) {
        record.stages[stage.id] = { bestScore: 0, updatedAt: "" };
      }
    }
    record.activeStageId = ACTIVE_RANKING_STAGE_ID;
    return state.seasonRecords[CURRENT_SEASON.id];
  }

  function currentRankingStageRecord(stageId = ACTIVE_RANKING_STAGE_ID) {
    const stage = rankingStageById(stageId);
    const record = currentSeasonRecord();
    if (!record.stages[stage.id]) {
      record.stages[stage.id] = { bestScore: 0, updatedAt: "" };
    }
    return record.stages[stage.id];
  }

  function currentSeasonBestScore(stageId = ACTIVE_RANKING_STAGE_ID) {
    return clampInteger(currentRankingStageRecord(stageId).bestScore, 0, 999999999);
  }

  function updateSeasonBestScore(score) {
    const seasonRecord = currentSeasonRecord();
    const record = currentRankingStageRecord(ACTIVE_RANKING_STAGE_ID);
    const runScore = clampInteger(score, 0, 999999999);
    if (runScore <= record.bestScore) {
      return false;
    }
    record.bestScore = runScore;
    record.updatedAt = new Date().toISOString();
    seasonRecord.bestScore = runScore;
    seasonRecord.updatedAt = record.updatedAt;
    seasonRecord.activeStageId = ACTIVE_RANKING_STAGE_ID;
    return true;
  }

  function createFreshDailyRankingState() {
    return {
      records: {},
      rewardClaims: {},
    };
  }

  function sanitizeDailyRankingState(saved) {
    const result = createFreshDailyRankingState();
    if (!saved || typeof saved !== "object") {
      return result;
    }
    const records = saved.records && typeof saved.records === "object" ? saved.records : {};
    const recordKeys = Object.keys(records)
      .filter(isDateKey)
      .sort()
      .slice(-45);
    for (const dateKey of recordKeys) {
      const record = records[dateKey];
      if (!record || typeof record !== "object") {
        continue;
      }
      result.records[dateKey] = {
        bestScore: clampInteger(record.bestScore, 0, 999999999),
        updatedAt: sanitizeTelemetryText(record.updatedAt || "", 32),
      };
    }
    const claims = saved.rewardClaims && typeof saved.rewardClaims === "object" ? saved.rewardClaims : {};
    const claimKeys = Object.keys(claims)
      .filter(isDateKey)
      .sort()
      .slice(-45);
    for (const dateKey of claimKeys) {
      const claim = claims[dateKey];
      if (!claim || typeof claim !== "object") {
        continue;
      }
      result.rewardClaims[dateKey] = {
        claimedAt: sanitizeTelemetryText(claim.claimedAt || "", 32),
        rank: clampInteger(claim.rank, 0, 9999),
        score: clampInteger(claim.score, 0, 999999999),
        amount: clampInteger(claim.amount, 0, 99),
      };
    }
    return result;
  }

  function dailyRankingRecord(dateKey = todayDateKey()) {
    if (!state.dailyRanking || typeof state.dailyRanking !== "object") {
      state.dailyRanking = createFreshDailyRankingState();
    }
    if (!state.dailyRanking.records || typeof state.dailyRanking.records !== "object") {
      state.dailyRanking.records = {};
    }
    if (!state.dailyRanking.records[dateKey]) {
      state.dailyRanking.records[dateKey] = { bestScore: 0, updatedAt: "" };
    }
    return state.dailyRanking.records[dateKey];
  }

  function currentDailyBestScore(dateKey = todayDateKey()) {
    return clampInteger(dailyRankingRecord(dateKey).bestScore, 0, 999999999);
  }

  function updateDailyRankingBestScore(score, dateKey = todayDateKey()) {
    const record = dailyRankingRecord(dateKey);
    const runScore = clampInteger(score, 0, 999999999);
    if (runScore <= record.bestScore) {
      return false;
    }
    record.bestScore = runScore;
    record.updatedAt = new Date().toISOString();
    return true;
  }

  function dailyRankingSeed(dateKey = todayDateKey()) {
    const seed = hashString(dateKey);
    return DAILY_RANKING_SEED_NAMES.map((name, index) => {
      const wobble = ((seed >>> (index % 12)) % 1600) - 600;
      const score = Math.max(2800, 22500 - index * 1700 + wobble);
      return {
        id: `daily-${dateKey}-${index + 1}`,
        playerId: `daily-seed-${index + 1}`,
        name,
        score,
        isPlayer: false,
      };
    });
  }

  function buildDailyRankingEntries(dateKey = todayDateKey()) {
    const playerScore = currentDailyBestScore(dateKey);
    const entries = dailyRankingSeed(dateKey)
      .concat({
        id: state.playerId,
        playerId: state.playerId,
        name: playerDisplayName(),
        score: playerScore,
        isPlayer: true,
      })
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.isPlayer ? 1 : -1;
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
        title: entry.isPlayer ? "自分のベスト" : "日替わり挑戦者",
        titleLimited: false,
      }));
    const topEntries = entries.filter((entry) => entry.rank <= DAILY_RANKING_TOP_LIMIT);
    const player = entries.find((entry) => entry.isPlayer);
    if (player && !topEntries.some((entry) => entry.isPlayer)) {
      topEntries.push(player);
    }
    return topEntries;
  }

  function ownDailyRank(dateKey = todayDateKey()) {
    const player = buildDailyRankingEntries(dateKey).find((entry) => entry.isPlayer);
    if (!player || player.score <= 0) {
      return { rank: 0, rankText: "未参加", score: 0 };
    }
    return { rank: player.rank, rankText: `${player.rank}位`, score: player.score };
  }

  function dailyRankingViewDateKey() {
    return selectedDailyRankingView === "yesterday" ? previousDateKey(todayDateKey()) : todayDateKey();
  }

  function dailyRankingDateLabel(dateKey) {
    const date = dateFromKey(dateKey);
    const prefix = dateKey === todayDateKey() ? "今日" : dateKey === previousDateKey(todayDateKey()) ? "昨日" : "";
    const label = `${date.getMonth() + 1}/${date.getDate()}`;
    return prefix ? `${prefix} ${label}` : label;
  }

  function claimYesterdayDailyRankingReward(options = {}) {
    const dateKey = previousDateKey(todayDateKey());
    if (!state.dailyRanking || typeof state.dailyRanking !== "object") {
      state.dailyRanking = createFreshDailyRankingState();
    }
    if (!state.dailyRanking.rewardClaims || typeof state.dailyRanking.rewardClaims !== "object") {
      state.dailyRanking.rewardClaims = {};
    }
    if (state.dailyRanking.rewardClaims[dateKey]) {
      return false;
    }
    const own = ownDailyRank(dateKey);
    if (own.score <= 0 || own.rank <= 0 || own.rank > DAILY_RANKING_REWARD_RANK_MAX) {
      return false;
    }
    if (DAILY_RANKING_REWARD_ITEM === "packStone") {
      state.packStone += DAILY_RANKING_REWARD_AMOUNT;
    }
    state.dailyRanking.rewardClaims[dateKey] = {
      claimedAt: new Date().toISOString(),
      rank: own.rank,
      score: own.score,
      amount: DAILY_RANKING_REWARD_AMOUNT,
    };
    logTelemetryEvent("daily_ranking_reward", {
      dateKey,
      rank: own.rank,
      score: own.score,
      amount: DAILY_RANKING_REWARD_AMOUNT,
    });
    if (!options.silent) {
      playSound("coin");
      showToast(`${DAILY_RANKING.rewardLabel || "昨日トップ10報酬"} ${currencyRewardLabel(DAILY_RANKING_REWARD_AMOUNT)}`);
    }
    saveState();
    return true;
  }

  function rankingStageById(stageId) {
    return RANKING_STAGE_BY_ID.get(stageId) || RANKING_STAGE_BY_ID.get(ACTIVE_RANKING_STAGE_ID) || CURRENT_SEASON.stages[0];
  }

  function selectedRankingStage() {
    const stage = rankingStageById(selectedRankingStageId);
    selectedRankingStageId = stage.id;
    return stage;
  }

  function stageRankingSeed(stage) {
    const offsetByStage = {
      "season-1": 0,
      "week-1": 0,
      "week-2": 1800,
      "week-3": 3200,
      final: -5200,
    };
    const offset = offsetByStage[stage.id] || 0;
    return SEASON_RANKING_SEED.map((entry, index) => ({
      ...entry,
      id: `${stage.id}-${entry.id}`,
      score: Math.max(1200, entry.score - offset - index * 120),
    }));
  }

  function rankingApiBaseUrl() {
    const saved = safeLocalStorageText(RANKING_API_ENDPOINT_KEY);
    const autoLocal = RANKING_API_CONFIG.mode === "local-auto" && window.location.protocol === "file:" ? RANKING_API_CONFIG.localEndpoint : "";
    const configured = saved || RANKING_API_CONFIG.endpoint || autoLocal;
    return String(configured || "").replace(/\/+$/, "");
  }

  function safeLocalStorageText(key) {
    try {
      return window.localStorage?.getItem(key) || "";
    } catch (error) {
      return "";
    }
  }

  function rankingStageSnapshot(stageId = selectedRankingStageId) {
    const stage = rankingStageById(stageId);
    return state.rankingOnline?.stages?.[stage.id] || null;
  }

  function onlineRankingEntries(stageId = selectedRankingStageId) {
    const snapshot = rankingStageSnapshot(stageId);
    return snapshot?.entries?.length ? sanitizeRankingEntries(snapshot.entries, stageId) : [];
  }

  function storeRankingStageEntries(stageId, entries, source = "server") {
    const stage = rankingStageById(stageId);
    if (!state.rankingOnline || typeof state.rankingOnline !== "object") {
      state.rankingOnline = createFreshRankingOnlineState();
    }
    if (!state.rankingOnline.stages || typeof state.rankingOnline.stages !== "object") {
      state.rankingOnline.stages = {};
    }
    state.rankingOnline.stages[stage.id] = {
      source,
      syncedAt: new Date().toISOString(),
      entries: sanitizeRankingEntries(entries, stage.id),
    };
  }

  function buildSeasonRankingEntries(stageId = selectedRankingStageId) {
    const stage = rankingStageById(stageId);
    const playerScore = currentSeasonBestScore(stage.id);
    return stageRankingSeed(stage)
      .concat({
      id: "player",
      name: "あなた",
      score: playerScore,
      isPlayer: true,
    })
      .slice()
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.isPlayer ? 1 : -1;
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  }

  function buildOnlineSeasonRankingEntries(stageId = selectedRankingStageId) {
    const stage = rankingStageById(stageId);
    const playerScore = currentSeasonBestScore(stage.id);
    const onlineEntries = onlineRankingEntries(stage.id);
    if (onlineEntries.length) {
      const hasPlayer = onlineEntries.some((entry) => entry.isPlayer || entry.playerId === state.playerId || entry.id === state.playerId);
      return onlineEntries
        .concat(
          hasPlayer || playerScore <= 0
            ? []
            : {
                id: state.playerId,
                playerId: state.playerId,
                name: playerDisplayName(),
                score: playerScore,
                rank: onlineEntries.length + 1,
                isPlayer: true,
              },
        )
        .map((entry, index) => normalizeRankingEntry(entry, stage.id, index))
        .filter(Boolean)
        .sort((a, b) => {
          if (a.rank !== b.rank) {
            return a.rank - b.rank;
          }
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return a.isPlayer ? 1 : -1;
        })
        .map((entry) => {
          const reward = rankingTitleRewardForEntry(entry, stage);
          return {
            ...entry,
            title: reward?.title || scoreTitle(entry.score),
            titleLabel: reward?.label || "通常称号",
            titleLimited: Boolean(reward?.limited),
          };
        });
    }
    const baseEntries = stageRankingSeed(stage);
    const hasPlayer = baseEntries.some((entry) => entry.isPlayer || entry.playerId === state.playerId || entry.id === state.playerId);
    return baseEntries
      .concat(
        hasPlayer
          ? []
          : {
              id: state.playerId,
              playerId: state.playerId,
              name: playerDisplayName(),
              score: playerScore,
              isPlayer: true,
            },
      )
      .map((entry, index) => normalizeRankingEntry(entry, stage.id, index))
      .filter(Boolean)
      .slice()
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.isPlayer ? 1 : -1;
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }))
      .map((entry) => {
        const reward = rankingTitleRewardForEntry(entry, stage);
        return {
          ...entry,
          title: reward?.title || scoreTitle(entry.score),
          titleLabel: reward?.label || "通常称号",
          titleLimited: Boolean(reward?.limited),
        };
      });
  }

  function buildSeasonHistoryItems() {
    const items = new Map();
    for (const historySeason of RANKING_SEASON_HISTORY) {
      items.set(historySeason.id, {
        id: historySeason.id,
        label: historySeason.label,
        title: historySeason.title,
        periodLabel: historySeason.periodLabel,
        note: historySeason.note,
        ownRankText: historySeason.ownRankText,
        ownBestScore: historySeason.ownBestScore,
        entries: normalizeRankingHistoryEntries(historySeason.entries, historySeason.id),
      });
    }
    const records = state.seasonRecords && typeof state.seasonRecords === "object" ? state.seasonRecords : {};
    for (const [seasonId, record] of Object.entries(records)) {
      if (seasonId === CURRENT_SEASON.id || !record || typeof record !== "object") {
        continue;
      }
      const meta = items.get(seasonId);
      const bestScore = clampInteger(record.bestScore, meta?.ownBestScore || 0, 0, 999999999);
      items.set(seasonId, {
        id: seasonId,
        label: rankingText(record.label, meta?.label || seasonId, 32),
        title: rankingText(record.title, meta?.title || `${seasonId} 記録`, 48),
        periodLabel: rankingText(record.periodLabel, meta?.periodLabel || "終了シーズン", 48),
        note: rankingText(record.note, meta?.note || "終了したシーズンの記録です", 80),
        ownRankText: rankingText(record.rankText, meta?.ownRankText || (bestScore > 0 ? "記録あり" : "未参加"), 16),
        ownBestScore: bestScore,
        entries: normalizeRankingHistoryEntries(record.entries || meta?.entries || [], seasonId),
      });
    }
    return [...items.values()].sort((a, b) => b.id.localeCompare(a.id, "ja"));
  }

  function scoreTitle(score = state.bestScore) {
    return PLAYER_SCORE_TITLES[resultRank(score)] || PLAYER_SCORE_TITLES.D;
  }

  function playerDisplayName() {
    return sanitizePlayerName(state.playerName);
  }

  function sanitizePlayerName(value) {
    const name = sanitizeTelemetryText(value || "", 12);
    return name || RANKING_PLAYER_NAME;
  }

  function sanitizeSelectedTitleId(value) {
    const id = sanitizeTelemetryText(value || "auto", 48);
    return id || "auto";
  }

  function scoreTitleOptionForId(id) {
    return PLAYER_SCORE_TITLE_OPTIONS.find((option) => option.id === id) || null;
  }

  function rankingTitleRewardById(id) {
    const titleId = sanitizeSelectedTitleId(id);
    return RANKING_TITLE_REWARDS.find((reward) => reward.id === titleId) || null;
  }

  function sanitizeOwnedTitleIds(value, extraTitleId = "") {
    const result = new Set();
    const addTitle = (titleId) => {
      const id = sanitizeSelectedTitleId(titleId);
      if (id === "auto") {
        return;
      }
      if (scoreTitleOptionForId(id) || rankingTitleRewardById(id)) {
        result.add(id);
      }
    };
    addTitle("score-d");
    if (Array.isArray(value)) {
      for (const titleId of value) {
        addTitle(titleId);
      }
    } else if (value && typeof value === "object") {
      for (const [titleId, owned] of Object.entries(value)) {
        if (owned) {
          addTitle(titleId);
        }
      }
    }
    addTitle(extraTitleId);
    return [...result];
  }

  function titleIdOwned(titleId) {
    const id = sanitizeSelectedTitleId(titleId);
    return sanitizeOwnedTitleIds(state.ownedTitleIds).includes(id);
  }

  function scoreTitleOptionUnlocked(option) {
    return Boolean(option) && state.bestScore >= option.minScore;
  }

  function rankingTitleRewardsForEntry(entry, stage = selectedRankingStage()) {
    if (!entry || !stage || entry.score <= 0) {
      return [];
    }
    return RANKING_TITLE_REWARDS
      .filter((reward) => {
        const stageMatch = (!reward.stageId || reward.stageId === stage.id) && (!reward.stageType || reward.stageType === stage.type);
        return stageMatch && entry.rank <= reward.rankMax;
      })
      .slice()
      .sort((a, b) => a.rankMax - b.rankMax);
  }

  function rankingTitleRewardForEntry(entry, stage = selectedRankingStage()) {
    const rewards = rankingTitleRewardsForEntry(entry, stage);
    return rewards[0] || null;
  }

  function refreshOwnedTitles(stageId = ACTIVE_RANKING_STAGE_ID) {
    const before = Array.isArray(state.ownedTitleIds) ? state.ownedTitleIds.join("|") : "";
    const owned = new Set(sanitizeOwnedTitleIds(state.ownedTitleIds, state.selectedTitleId));
    for (const option of PLAYER_SCORE_TITLE_OPTIONS) {
      if (scoreTitleOptionUnlocked(option)) {
        owned.add(option.id);
      }
    }
    const stageIds = new Set([stageId, ACTIVE_RANKING_STAGE_ID, ...CURRENT_SEASON.stages.map((stage) => stage.id)]);
    for (const id of stageIds) {
      const stage = rankingStageById(id);
      const player = buildOnlineSeasonRankingEntries(stage.id).find((entry) => entry.isPlayer);
      for (const reward of rankingTitleRewardsForEntry(player, stage)) {
        owned.add(reward.id);
      }
    }
    state.ownedTitleIds = [...owned];
    return state.ownedTitleIds.join("|") !== before;
  }

  function playerTitleStatus(stageId = ACTIVE_RANKING_STAGE_ID) {
    refreshOwnedTitles(stageId);
    const selectedTitle = titleStatusById(state.selectedTitleId, stageId);
    if (selectedTitle) {
      return selectedTitle;
    }
    return automaticPlayerTitleStatus(stageId);
  }

  function automaticPlayerTitleStatus(stageId = ACTIVE_RANKING_STAGE_ID) {
    const stage = rankingStageById(stageId);
    const player = buildOnlineSeasonRankingEntries(stage.id).find((entry) => entry.isPlayer);
    const reward = player ? rankingTitleRewardForEntry(player, stage) : null;
    if (reward) {
      return {
        title: reward.title,
        note: reward.label || "限定称号",
        limited: Boolean(reward.limited),
      };
    }
    return {
      title: scoreTitle(state.bestScore),
      note: "通常称号",
      limited: false,
    };
  }

  function titleStatusById(titleId, stageId = ACTIVE_RANKING_STAGE_ID) {
    const id = sanitizeSelectedTitleId(titleId);
    if (id === "auto") {
      return null;
    }
    const scoreOption = scoreTitleOptionForId(id);
    if (scoreOption && (scoreTitleOptionUnlocked(scoreOption) || titleIdOwned(id))) {
      return {
        id: scoreOption.id,
        title: scoreOption.title,
        note: scoreOption.note || "通常称号",
        limited: false,
      };
    }
    const ownedReward = rankingTitleRewardById(id);
    if (ownedReward && titleIdOwned(id)) {
      return {
        id: ownedReward.id,
        title: ownedReward.title,
        note: ownedReward.label || "限定称号",
        limited: Boolean(ownedReward.limited),
      };
    }
    const stage = rankingStageById(stageId);
    const player = buildOnlineSeasonRankingEntries(stage.id).find((entry) => entry.isPlayer);
    const reward = player ? rankingTitleRewardForEntry(player, stage) : null;
    if (reward && reward.id === id) {
      return {
        id: reward.id,
        title: reward.title,
        note: reward.label || "限定称号",
        limited: Boolean(reward.limited),
      };
    }
    return null;
  }

  function profileTitleOptions(stageId = ACTIVE_RANKING_STAGE_ID) {
    refreshOwnedTitles(stageId);
    const automatic = automaticPlayerTitleStatus(stageId);
    const options = [
      {
        id: "auto",
        title: automatic.title,
        note: automatic.limited ? "おすすめ / 限定称号" : "おすすめ / 自動",
        limited: automatic.limited,
        unlocked: true,
      },
    ];
    for (const option of PLAYER_SCORE_TITLE_OPTIONS) {
      options.push({
        id: option.id,
        title: option.title,
        note: scoreTitleOptionUnlocked(option) ? option.note || "通常称号" : `${formatNumber(option.minScore)}点で解放`,
        limited: false,
        unlocked: scoreTitleOptionUnlocked(option),
      });
    }
    const includedTitleIds = new Set(options.map((option) => option.id));
    for (const reward of CURRENT_SEASON.titleRewards) {
      if (!titleIdOwned(reward.id) || includedTitleIds.has(reward.id)) {
        continue;
      }
      options.push({
        id: reward.id,
        title: reward.title,
        note: reward.label || "限定称号",
        limited: Boolean(reward.limited),
        unlocked: true,
      });
      includedTitleIds.add(reward.id);
    }
    return options;
  }

  function sanitizePlayerXp(value) {
    return clampInteger(value, 0, PLAYER_XP_MAX);
  }

  function playerRankNextXp(rank) {
    const safeRank = clampInteger(rank, 1, PLAYER_RANK_MAX);
    return 220 + safeRank * 70 + Math.floor(Math.pow(safeRank, 1.35) * 22);
  }

  function playerRankProgress(totalXp = state.playerXp) {
    let rank = 1;
    let currentXp = sanitizePlayerXp(totalXp);
    while (rank < PLAYER_RANK_MAX) {
      const nextXp = playerRankNextXp(rank);
      if (currentXp < nextXp) {
        break;
      }
      currentXp -= nextXp;
      rank += 1;
    }
    const nextXp = playerRankNextXp(rank);
    return {
      rank,
      currentXp,
      nextXp,
      totalXp: sanitizePlayerXp(totalXp),
      percent: nextXp > 0 ? Math.max(0, Math.min(100, Math.round((currentXp / nextXp) * 100))) : 100,
    };
  }

  function calculateRunXp(result = state.lastResult) {
    if (!result || result.practice || result.score <= 0) {
      return 0;
    }
    const scoreXp = clampInteger(Math.floor(Math.sqrt(result.score) / 4), 0, 110);
    const wordXp = clampInteger(Math.floor((result.matches || 0) / 5), 0, 80);
    const comboXp = clampInteger(Math.floor((result.maxCombo || 0) / 10), 0, 45);
    const rankBonus = PLAYER_RANK_BONUS_XP[result.rank] || PLAYER_RANK_BONUS_XP.D;
    const deckRewardMultiplier = Number.isFinite(Number(result.deckRewardMultiplier))
      ? Math.max(0.5, Math.min(1.2, Number(result.deckRewardMultiplier)))
      : 1;
    return clampInteger(Math.round((scoreXp + wordXp + comboXp + rankBonus) * deckRewardMultiplier), 6, 220);
  }

  function grantPlayerXp(result = state.lastResult) {
    const before = playerRankProgress();
    const amount = calculateRunXp(result);
    if (amount > 0) {
      state.playerXp = sanitizePlayerXp(state.playerXp + amount);
    }
    const after = playerRankProgress();
    const leveledUp = after.rank > before.rank;
    if (leveledUp) {
      state.stamina = STAMINA_MAX;
      state.staminaUpdatedAt = Date.now();
    }
    return {
      amount,
      before,
      after,
      leveledUp,
    };
  }

  function ownSeasonRank(stageId = ACTIVE_RANKING_STAGE_ID) {
    const player = buildOnlineSeasonRankingEntries(stageId).find((entry) => entry.isPlayer);
    if (!player || player.score <= 0) {
      return { rankText: "未参加", score: 0 };
    }
    return { rankText: `${player.rank}位`, score: player.score };
  }

  function queueRankingSubmission(result = state.lastResult) {
    if (!result || result.practice || result.score <= 0) {
      return false;
    }
    if (!state.rankingOnline || typeof state.rankingOnline !== "object") {
      state.rankingOnline = createFreshRankingOnlineState();
    }
    const createdAt = new Date().toISOString();
    const rankProgress = playerRankProgress();
    const titleStatus = playerTitleStatus(ACTIVE_RANKING_STAGE_ID);
    const submission = sanitizeRankingSubmission({
      id: `${state.playerId}-${CURRENT_SEASON.id}-${ACTIVE_RANKING_STAGE_ID}-${Date.now()}`,
      playerId: state.playerId,
      playerName: playerDisplayName(),
      selectedTitleId: state.selectedTitleId,
      selectedTitle: titleStatus.title,
      playerRank: rankProgress.rank,
      playerXp: state.playerXp,
      seasonId: CURRENT_SEASON.id,
      stageId: ACTIVE_RANKING_STAGE_ID,
      dailyDateKey: todayDateKey(),
      score: result.score,
      rank: result.rank,
      matches: result.matches,
      maxCombo: result.maxCombo,
      bestWord: result.bestWord,
      bestWordCardId: result.bestWordCardId,
      deckIds: state.deckIds,
      buildId: BUILD_INFO.buildId,
      createdAt,
    });
    if (!submission) {
      return false;
    }
    state.rankingOnline.pending = sanitizeRankingSubmissions([...(state.rankingOnline.pending || []), submission]);
    state.rankingOnline.status = rankingApiBaseUrl() ? "pending" : "local";
    state.rankingOnline.lastError = "";
    return true;
  }

  function buildPlayerProfilePayload() {
    const rankProgress = playerRankProgress();
    const titleStatus = playerTitleStatus(ACTIVE_RANKING_STAGE_ID);
    return {
      playerId: state.playerId,
      playerName: playerDisplayName(),
      selectedTitleId: state.selectedTitleId,
      selectedTitle: titleStatus.title,
      playerRank: rankProgress.rank,
      playerXp: state.playerXp,
      bestScore: currentSeasonBestScore(ACTIVE_RANKING_STAGE_ID),
      buildId: BUILD_INFO.buildId,
      updatedAt: new Date().toISOString(),
    };
  }

  async function syncPlayerProfile(options = {}) {
    const endpoint = rankingApiBaseUrl();
    if (!endpoint || typeof window.fetch !== "function") {
      return false;
    }
    try {
      await rankingFetchJson(endpoint, "/api/player/profile", {
        method: "POST",
        body: JSON.stringify(buildPlayerProfilePayload()),
      });
      logTelemetryEvent("profile_sync", {
        reason: sanitizeTelemetryText(options.reason || "manual", 24),
      });
      return true;
    } catch (error) {
      if (state.rankingOnline && typeof state.rankingOnline === "object") {
        state.rankingOnline.lastError = sanitizeTelemetryText(error?.message || "profile sync failed", 96);
      }
      return false;
    }
  }

  function syncRanking(options = {}) {
    const endpoint = rankingApiBaseUrl();
    if (!endpoint || typeof window.fetch !== "function") {
      if (state.rankingOnline) {
        state.rankingOnline.status = state.rankingOnline.pending?.length ? "pending" : "local";
        state.rankingOnline.lastError = "";
      }
      renderRankingSyncStatus(selectedRankingStage());
      return Promise.resolve(false);
    }
    if (rankingSyncPromise) {
      return rankingSyncPromise;
    }
    const stage = rankingStageById(options.stageId || selectedRankingStageId || ACTIVE_RANKING_STAGE_ID);
    if (!state.rankingOnline || typeof state.rankingOnline !== "object") {
      state.rankingOnline = createFreshRankingOnlineState();
    }
    state.rankingOnline.status = "syncing";
    renderRankingSyncStatus(stage);
    rankingSyncPromise = syncRankingNow(endpoint, stage.id)
      .catch((error) => {
        state.rankingOnline.status = state.rankingOnline.pending?.length ? "pending" : "error";
        state.rankingOnline.lastError = sanitizeTelemetryText(error?.message || "ranking sync failed", 96);
        return false;
      })
      .finally(() => {
        rankingSyncPromise = null;
        saveState();
        renderAll();
      });
    return rankingSyncPromise;
  }

  async function syncRankingNow(endpoint, stageId) {
    await flushRankingSubmissions(endpoint);
    await fetchRankingStage(endpoint, stageId);
    if (stageId !== ACTIVE_RANKING_STAGE_ID) {
      await fetchRankingStage(endpoint, ACTIVE_RANKING_STAGE_ID);
    }
    state.rankingOnline.status = state.rankingOnline.pending?.length ? "pending" : "synced";
    state.rankingOnline.lastSyncedAt = new Date().toISOString();
    state.rankingOnline.lastError = "";
    return true;
  }

  async function flushRankingSubmissions(endpoint) {
    const pending = sanitizeRankingSubmissions(state.rankingOnline?.pending || []);
    const remaining = [];
    for (let index = 0; index < pending.length; index += 1) {
      const submission = pending[index];
      try {
        const payload = await rankingFetchJson(endpoint, "/api/ranking/submit", {
          method: "POST",
          body: JSON.stringify(submission),
        });
        if (payload?.entries) {
          storeRankingStageEntries(submission.stageId, payload.entries);
        }
      } catch (error) {
        remaining.push(submission, ...pending.slice(index + 1));
        state.rankingOnline.pending = remaining.slice(-RANKING_SYNC_MAX_PENDING);
        throw error;
      }
    }
    state.rankingOnline.pending = [];
  }

  async function fetchRankingStage(endpoint, stageId) {
    const stage = rankingStageById(stageId);
    const path = `/api/ranking/season/${encodeURIComponent(CURRENT_SEASON.id)}/stage/${encodeURIComponent(stage.id)}?limit=${RANKING_SYNC_STAGE_LIMIT}&playerId=${encodeURIComponent(state.playerId)}`;
    const payload = await rankingFetchJson(endpoint, path);
    storeRankingStageEntries(stage.id, payload?.entries || []);
    return payload;
  }

  async function rankingFetchJson(endpoint, path, options = {}) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), RANKING_API_TIMEOUT_MS);
    try {
      const response = await window.fetch(`${endpoint}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`ranking ${response.status}`);
      }
      return await response.json();
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function rankingSyncStatusText(stage = selectedRankingStage()) {
    const pending = state.rankingOnline?.pending?.length || 0;
    const snapshot = rankingStageSnapshot(stage.id);
    if (state.rankingOnline?.status === "syncing") {
      return pending > 0 ? `同期中 / 送信待ち ${pending}件` : "同期中";
    }
    if (pending > 0) {
      return `送信待ち ${pending}件 / ローカル保存済み`;
    }
    if (state.rankingOnline?.status === "synced" && snapshot?.syncedAt) {
      return `オンライン同期済み / ${stage.label}`;
    }
    if (state.rankingOnline?.status === "error") {
      return "サーバー未接続 / ローカル保存";
    }
    return rankingApiBaseUrl() ? "オンライン待機 / ローカル保存" : "ローカル保存";
  }

  function renderRankingSyncStatus(stage = selectedRankingStage()) {
    if (!rankingSyncStatus) {
      return;
    }
    const status = state.rankingOnline?.status || "local";
    rankingSyncStatus.textContent = rankingSyncStatusText(stage);
    rankingSyncStatus.classList.toggle("is-online", status === "synced");
    rankingSyncStatus.classList.toggle("is-syncing", status === "syncing");
    rankingSyncStatus.classList.toggle("is-pending", status === "pending" || (state.rankingOnline?.pending?.length || 0) > 0);
    rankingSyncStatus.classList.toggle("is-error", status === "error");
  }

  function rankingStageStatusText(stage) {
    const statusLabels = {
      open: "開催中",
      upcoming: "準備中",
      locked: "未開催",
      closed: "終了",
    };
    const status = statusLabels[stage.status] || "準備中";
    if (stage.type === "final") {
      return `${stage.label} ${status} / ${stage.finalistSource || "シーズン上位者"} / ルールは運営設定`;
    }
    if (stage.type === "season") {
      return `${stage.label} ${status} / シーズン通算ランキング`;
    }
    const topN = stage.topN || CURRENT_SEASON.qualifierTopN;
    return `${stage.label} ${status} / 上位${topN}名がファイナル進出`;
  }

  function rankingRulesForStage(stage) {
    if (stage.type !== "final") {
      return [];
    }
    return stage.rules.length ? stage.rules : CURRENT_SEASON.finalRules;
  }

  function evaluateRankingDeckRules(rules) {
    const cards = state.deckIds.map((id) => CARD_BY_ID.get(id)).filter(Boolean);
    const failures = [];
    for (const rule of rules) {
      if (rule.type === "minCardLength") {
        const minimum = Math.max(1, rule.value || 1);
        const shortCards = cards.filter((card) => kanaLength(card.readingKana) < minimum);
        if (shortCards.length) {
          failures.push(`${minimum}文字未満: ${shortCards.map((card) => card.displayName).join("・")}`);
        }
      } else if (rule.type === "requiredDeckKana") {
        const deckKana = cards.map((card) => card.readingKana).join("");
        const missing = rule.values.filter((kana) => !deckKana.includes(kana));
        if (missing.length) {
          failures.push(`不足: ${missing.join("・")}`);
        }
      }
    }
    if (!rules.length) {
      return "現在のデッキ: ファイナル条件なし";
    }
    return failures.length ? `現在のデッキ: 要調整 (${failures[0]})` : "現在のデッキ: 条件OK";
  }

  function sanitizeLastResult(result) {
    if (!result || typeof result !== "object") {
      return null;
    }
    const bestWordCardId = CARD_BY_ID.has(result.bestWordCardId) ? result.bestWordCardId : "";
    const bestWordCard = CARD_BY_ID.get(bestWordCardId);
    const sanitized = {
      score: clampInteger(result.score, 0, 999999999),
      rank: sanitizeTelemetryText(result.rank || resultRank(result.score || 0), 8),
      deckDifficulty: sanitizeTelemetryText(result.deckDifficulty || "", 24),
      deckScoreMultiplier: Number.isFinite(Number(result.deckScoreMultiplier)) ? Number(result.deckScoreMultiplier) : 1,
      deckRewardMultiplier: Number.isFinite(Number(result.deckRewardMultiplier)) ? Number(result.deckRewardMultiplier) : 1,
      matches: clampInteger(result.matches, 0, 99),
      bestWord: typeof result.bestWord === "string" ? result.bestWord.slice(0, 20) : "",
      bestWordCardId,
      learnNote: bestWordCard?.learnNote || (typeof result.learnNote === "string" ? result.learnNote.slice(0, 90) : ""),
      bestWordScore: clampInteger(result.bestWordScore, 0, 999999999),
      maxCombo: clampInteger(result.maxCombo, 0, 99),
      bestScore: clampInteger(result.bestScore, 0, 999999999),
      newBest: result.newBest === true,
      practice: result.practice === true,
      dailyWordCleared: result.dailyWordCleared === true,
      dailyWordCardId: CARD_BY_ID.has(result.dailyWordCardId) ? result.dailyWordCardId : "",
      dailyWordName: typeof result.dailyWordName === "string" ? result.dailyWordName.slice(0, 20) : "",
      xpReward: clampInteger(result.xpReward, 0, 999),
      playerRankBefore: clampInteger(result.playerRankBefore, 1, PLAYER_RANK_MAX),
      playerRankAfter: clampInteger(result.playerRankAfter, result.playerRankBefore || 1, PLAYER_RANK_MAX),
      playerXpAfter: sanitizePlayerXp(result.playerXpAfter),
      playerRankUp: result.playerRankUp === true,
      rewardSummary: sanitizeRewardSummary(result.rewardSummary),
    };
    const feedbackOption = QUICK_FEEDBACK_BY_ID.get(result.quickFeedback?.id);
    if (feedbackOption) {
      sanitized.quickFeedback = {
        id: feedbackOption.id,
        label: feedbackOption.label,
        perspective: feedbackOption.perspective,
      };
    }
    return sanitized;
  }

  function sanitizeRewardSummary(summary) {
    if (!summary || typeof summary !== "object") {
      return { totalStone: 0, labels: [], practice: false };
    }
    return {
      totalStone: clampInteger(summary.totalStone, 0, 99),
      labels: Array.isArray(summary.labels) ? summary.labels.map((label) => sanitizeTelemetryText(label, 18)).filter(Boolean).slice(0, 4) : [],
      practice: summary.practice === true,
    };
  }

  function normalizeMissionCatalog(catalog, fallback) {
    const source = Array.isArray(catalog) && catalog.length ? catalog : fallback;
    return source.map((mission, index) => normalizeMissionDefinition(mission, index)).filter(Boolean);
  }

  function normalizeMissionDefinition(mission, index = 0) {
    if (!mission || typeof mission !== "object") {
      return null;
    }
    const type = ["runs", "matches", "scoreTotal"].includes(mission.type) ? mission.type : "matches";
    const targetFallback =
      type === "runs"
        ? mission.targetRuns
        : type === "scoreTotal"
          ? mission.targetScore
          : mission.targetMatches;
    const target = clampInteger(mission.target ?? targetFallback, 1, 999999999);
    const fallbackLabel = type === "runs" ? "本番プレイ" : type === "scoreTotal" ? "合計スコア" : "ことばクリア";
    return {
      id: sanitizeTelemetryText(mission.id || `${type}-${index + 1}`, 48),
      type,
      target,
      label: sanitizeTelemetryText(mission.label || fallbackLabel, 24),
      note: sanitizeTelemetryText(mission.note || mission.description || "", 48),
      rewardItem: sanitizeTelemetryText(mission.rewardItem || "packStone", 24),
      rewardAmount: clampInteger(mission.rewardAmount, 1, 99),
    };
  }

  function missionForKey(catalog, key) {
    const list = catalog.length ? catalog : normalizeMissionCatalog([], []);
    if (!list.length) {
      return {
        id: "mission-default",
        type: "matches",
        target: 1,
        label: "ミッション",
        note: "",
        rewardItem: "packStone",
        rewardAmount: 1,
      };
    }
    return list[hashString(key) % list.length];
  }

  function currentDailyMissionDefinition(dateKey = todayDateKey()) {
    return missionForKey(DAILY_MISSION_CATALOG, dateKey);
  }

  function currentWeeklyMissionDefinition(weekKey = currentWeekKey()) {
    return missionForKey(WEEKLY_MISSION_CATALOG, weekKey);
  }

  function missionUnit(mission) {
    if (mission.type === "runs") {
      return "回";
    }
    if (mission.type === "scoreTotal") {
      return "点";
    }
    return "語";
  }

  function formatMissionProgress(progress, target, mission) {
    if (mission.type === "scoreTotal") {
      return `${formatNumber(progress)} / ${formatNumber(target)}`;
    }
    return `${formatNumber(progress)}/${formatNumber(target)}${missionUnit(mission)}`;
  }

  function missionRunProgress(mission, result = state.lastResult) {
    if (!mission || !result) {
      return 0;
    }
    if (mission.type === "runs") {
      return 1;
    }
    if (mission.type === "scoreTotal") {
      return clampInteger(result.score || state.score, 0, 999999999);
    }
    if (mission.type === "matches") {
      return clampInteger(result.matches || state.runStats.matches, 0, 9999);
    }
    return 0;
  }

  function hashString(value) {
    const text = String(value || "");
    let hash = 0;
    for (let index = 0; index < text.length; index += 1) {
      hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
    }
    return hash;
  }

  function createFreshDailyMission(dateKey = todayDateKey()) {
    const mission = currentDailyMissionDefinition(dateKey);
    return {
      dateKey,
      id: mission.id,
      progress: 0,
      claimed: false,
    };
  }

  function sanitizeDailyMission(dailyMission) {
    const dateKey = todayDateKey();
    const mission = currentDailyMissionDefinition(dateKey);
    if (!dailyMission || dailyMission.dateKey !== dateKey || dailyMission.id !== mission.id) {
      return createFreshDailyMission(dateKey);
    }
    return {
      dateKey,
      id: mission.id,
      progress: clampInteger(dailyMission.progress, 0, mission.target),
      claimed: dailyMission.claimed === true,
    };
  }

  function createFreshDailyScoreTarget(dateKey = todayDateKey()) {
    return {
      dateKey,
      bestScore: 0,
      claimed: false,
    };
  }

  function sanitizeDailyScoreTarget(dailyScoreTarget) {
    const dateKey = todayDateKey();
    if (!dailyScoreTarget || dailyScoreTarget.dateKey !== dateKey) {
      return createFreshDailyScoreTarget(dateKey);
    }
    return {
      dateKey,
      bestScore: clampInteger(dailyScoreTarget.bestScore, 0, 999999999),
      claimed: dailyScoreTarget.claimed === true,
    };
  }

  function createFreshWeeklyChallenge(weekKey = currentWeekKey()) {
    const mission = currentWeeklyMissionDefinition(weekKey);
    return {
      weekKey,
      id: mission.id,
      progress: 0,
      claimed: false,
    };
  }

  function sanitizeWeeklyChallenge(weeklyChallenge) {
    const weekKey = currentWeekKey();
    const mission = currentWeeklyMissionDefinition(weekKey);
    if (!weeklyChallenge || weeklyChallenge.weekKey !== weekKey || weeklyChallenge.id !== mission.id) {
      return createFreshWeeklyChallenge(weekKey);
    }
    return {
      weekKey,
      id: mission.id,
      progress: clampInteger(weeklyChallenge.progress, 0, mission.target),
      claimed: weeklyChallenge.claimed === true,
    };
  }

  function createFreshDailyGift(dateKey = todayDateKey()) {
    return {
      dateKey,
      claimed: false,
    };
  }

  function sanitizeDailyGift(dailyGift) {
    const dateKey = todayDateKey();
    if (!dailyGift || dailyGift.dateKey !== dateKey) {
      return createFreshDailyGift(dateKey);
    }
    return {
      dateKey,
      claimed: dailyGift.claimed === true,
    };
  }

  function createFreshDailyWord(dateKey = todayDateKey(), cardId = dailyWordCard(dateKey)?.id || "") {
    return {
      dateKey,
      cardId,
      cleared: false,
    };
  }

  function sanitizeDailyWord(dailyWord) {
    const dateKey = todayDateKey();
    const card = dailyWordCard(dateKey);
    if (!card) {
      return createFreshDailyWord(dateKey, "");
    }
    if (!dailyWord || dailyWord.dateKey !== dateKey || dailyWord.cardId !== card.id) {
      return createFreshDailyWord(dateKey, card.id);
    }
    return {
      dateKey,
      cardId: card.id,
      cleared: dailyWord.cleared === true,
    };
  }

  function sanitizeDailyStreak(dailyStreak) {
    if (!dailyStreak || typeof dailyStreak !== "object") {
      return { count: 0, lastClaimDateKey: "" };
    }
    return {
      count: clampInteger(dailyStreak.count, 0, 999),
      lastClaimDateKey: isDateKey(dailyStreak.lastClaimDateKey) ? dailyStreak.lastClaimDateKey : "",
    };
  }

  function refreshDailyMission() {
    const dateKey = todayDateKey();
    const mission = currentDailyMissionDefinition(dateKey);
    let changed = false;
    if (state.dailyMission.dateKey !== dateKey || state.dailyMission.id !== mission.id) {
      state.dailyMission = createFreshDailyMission(dateKey);
      changed = true;
    }
    if (state.dailyStreak.lastClaimDateKey && !isTodayOrYesterday(state.dailyStreak.lastClaimDateKey, dateKey)) {
      state.dailyStreak.count = 0;
      changed = true;
    }
    if (changed) {
      saveState();
    }
    return changed;
  }

  function refreshDailyScoreTarget() {
    const dateKey = todayDateKey();
    if (state.dailyScoreTarget && state.dailyScoreTarget.dateKey === dateKey) {
      return false;
    }
    state.dailyScoreTarget = createFreshDailyScoreTarget(dateKey);
    saveState();
    return true;
  }

  function refreshWeeklyChallenge() {
    const weekKey = currentWeekKey();
    const mission = currentWeeklyMissionDefinition(weekKey);
    if (state.weeklyChallenge && state.weeklyChallenge.weekKey === weekKey && state.weeklyChallenge.id === mission.id) {
      return false;
    }
    state.weeklyChallenge = createFreshWeeklyChallenge(weekKey);
    saveState();
    return true;
  }

  function refreshDailyGift() {
    const dateKey = todayDateKey();
    if (state.dailyGift && state.dailyGift.dateKey === dateKey) {
      return false;
    }
    state.dailyGift = createFreshDailyGift(dateKey);
    saveState();
    return true;
  }

  function refreshDailyWord() {
    const next = sanitizeDailyWord(state.dailyWord);
    if (
      state.dailyWord &&
      state.dailyWord.dateKey === next.dateKey &&
      state.dailyWord.cardId === next.cardId &&
      state.dailyWord.cleared === next.cleared
    ) {
      return false;
    }
    state.dailyWord = next;
    saveState();
    return true;
  }

  function markDailyWordClear(cardId) {
    refreshDailyWord();
    const target = dailyWordCard();
    if (!target || target.id !== cardId || state.dailyWord.cleared) {
      return false;
    }
    state.dailyWord = {
      dateKey: todayDateKey(),
      cardId: target.id,
      cleared: true,
    };
    state.runStats.dailyWordCleared = true;
    logTelemetryEvent("daily_word_clear", { word: target.displayName, cardId: target.id });
    return true;
  }

  function claimDailyGift() {
    refreshDailyGift();
    if (state.running) {
      playSound("error");
      showToast("プレイ後に受け取り");
      return;
    }
    if (state.dailyGift.claimed) {
      playSound("error");
      showToast("今日は受取済み");
      return;
    }
    state.dailyGift.claimed = true;
    dailyGiftModalDismissedDate = todayDateKey();
    dailyGiftModalEligibleThisSession = false;
    grantDailyGiftReward();
    logTelemetryEvent("daily_gift_claim", {
      reward: DAILY_GIFT.rewardItem || "packStone",
      amount: DAILY_GIFT.rewardAmount || 1,
      stone: state.packStone,
    });
    playSound("coin");
    showToast(`${DAILY_GIFT.label || "今日の差し入れ"} ${currencyRewardLabel(DAILY_GIFT.rewardAmount || 1)}`);
    saveState();
    renderAll();
  }

  function dismissDailyGiftModal() {
    dailyGiftModalDismissedDate = todayDateKey();
    dailyGiftModalEligibleThisSession = false;
    if (dailyGiftModal) {
      dailyGiftModal.hidden = true;
    }
    playSound("tap");
    logTelemetryEvent("daily_gift_later", { dateKey: dailyGiftModalDismissedDate });
  }

  function openProfileModal() {
    if (!profileModal || !profileNameInput || !profileTitleList) {
      return;
    }
    profileNameInput.value = playerDisplayName();
    renderProfileTitleOptions(state.selectedTitleId);
    profileModal.hidden = false;
    playSound("tap");
    window.setTimeout(() => profileNameInput.select(), 0);
  }

  function closeProfileModal() {
    if (profileModal) {
      profileModal.hidden = true;
    }
    playSound("tap");
  }

  function onProfileTitleClick(event) {
    const button = event.target.closest?.("[data-profile-title-id]");
    if (!button || button.disabled || !profileTitleList) {
      return;
    }
    profileTitleList.dataset.selectedTitleId = button.dataset.profileTitleId || "auto";
    renderProfileTitleOptions(profileTitleList.dataset.selectedTitleId);
    playSound("tap");
  }

  function saveProfileModal() {
    if (!profileModal || !profileNameInput || !profileTitleList) {
      return;
    }
    const nextName = sanitizePlayerName(profileNameInput.value);
    const nextTitleId = sanitizeSelectedTitleId(profileTitleList.dataset.selectedTitleId || state.selectedTitleId);
    state.playerName = nextName;
    const titleIsSelectable = nextTitleId === "auto" || Boolean(titleStatusById(nextTitleId));
    state.selectedTitleId = titleIsSelectable ? nextTitleId : "auto";
    saveState();
    profileModal.hidden = true;
    renderAll();
    playSound("coin");
    showToast("プロフィールを保存");
    logTelemetryEvent("profile_update", {
      playerName: state.playerName,
      titleId: state.selectedTitleId,
    });
    syncPlayerProfile({ reason: "profile_edit" });
  }

  function renderProfileTitleOptions(selectedId = state.selectedTitleId) {
    if (!profileTitleList) {
      return;
    }
    const options = profileTitleOptions();
    const selectedAvailable = options.some((option) => option.id === selectedId && option.unlocked);
    const currentId = selectedAvailable ? selectedId : "auto";
    profileTitleList.dataset.selectedTitleId = currentId;
    const buttons = options.map((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = option.id === currentId ? "profile-title-option is-selected" : "profile-title-option";
      button.classList.toggle("is-limited", option.limited === true);
      button.classList.toggle("is-locked", option.unlocked !== true);
      button.dataset.profileTitleId = option.id;
      button.disabled = option.unlocked !== true;
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", option.id === currentId ? "true" : "false");
      const title = document.createElement("strong");
      title.textContent = option.title;
      const note = document.createElement("span");
      note.textContent = option.unlocked ? option.note : `未解放 / ${option.note}`;
      button.append(title, note);
      return button;
    });
    profileTitleList.replaceChildren(...buttons);
    if (profileModalNote) {
      profileModalNote.textContent = "";
      profileModalNote.hidden = true;
    }
  }

  function openDailyWordGuide() {
    const card = dailyWordCard();
    if (!card) {
      return;
    }
    state.guideCardId = card.id;
    state.collectionFilterId = "all";
    state.collectionLengthFilterId = "all";
    playSound("tap");
    showScreen("deck");
    renderAll();
  }

  function grantDailyGiftReward() {
    if ((DAILY_GIFT.rewardItem || "packStone") === "packStone") {
      state.packStone += DAILY_GIFT.rewardAmount || 1;
    }
  }

  function updateDailyScoreTarget(score) {
    refreshDailyScoreTarget();
    const targetScore = Math.max(1, DAILY_SCORE_TARGET.targetScore || 5000);
    const runScore = clampInteger(score, 0, 999999999);
    const beforeBest = state.dailyScoreTarget.bestScore;
    state.dailyScoreTarget.bestScore = Math.max(beforeBest, runScore);

    let rewarded = false;
    if (!state.dailyScoreTarget.claimed && state.dailyScoreTarget.bestScore >= targetScore) {
      state.dailyScoreTarget.claimed = true;
      grantDailyScoreTargetReward();
      rewarded = true;
    }

    if (rewarded || state.dailyScoreTarget.bestScore !== beforeBest) {
      saveState();
    }
    return rewarded;
  }

  function addWeeklyChallengeProgress(amount) {
    refreshWeeklyChallenge();
    if (state.weeklyChallenge.claimed) {
      return false;
    }
    const mission = currentWeeklyMissionDefinition();
    const targetMatches = Math.max(1, mission.target);
    const before = state.weeklyChallenge.progress;
    state.weeklyChallenge.progress = Math.min(targetMatches, before + clampInteger(amount, 0, targetMatches));
    if (state.weeklyChallenge.progress === before) {
      return false;
    }

    let rewarded = false;
    if (state.weeklyChallenge.progress >= targetMatches) {
      state.weeklyChallenge.claimed = true;
      grantWeeklyChallengeReward();
      rewarded = true;
    }
    saveState();
    return rewarded;
  }

  function grantWeeklyChallengeReward() {
    const mission = currentWeeklyMissionDefinition();
    if (mission.rewardItem === "packStone") {
      state.packStone += mission.rewardAmount || 1;
    }
  }

  function grantDailyScoreTargetReward() {
    if (DAILY_SCORE_TARGET.rewardItem === "packStone") {
      state.packStone += DAILY_SCORE_TARGET.rewardAmount;
    }
  }

  function addDailyMissionProgress(amount) {
    refreshDailyMission();
    if (state.dailyMission.claimed) {
      return false;
    }
    const mission = currentDailyMissionDefinition();
    if (mission.type !== "matches") {
      return false;
    }
    const before = state.dailyMission.progress;
    state.dailyMission.progress = Math.min(mission.target, state.dailyMission.progress + amount);
    if (state.dailyMission.progress === before) {
      return false;
    }
    if (state.dailyMission.progress >= mission.target) {
      state.dailyMission.claimed = true;
      state.lastDailyStreakBonus = false;
      grantDailyMissionReward();
      updateDailyStreakOnClaim();
      saveState();
      return true;
    }
    saveState();
    return false;
  }

  function grantDailyMissionReward() {
    const mission = currentDailyMissionDefinition();
    if (mission.rewardItem === "packStone") {
      state.packStone += mission.rewardAmount;
    }
  }

  function updateDailyMissionFromRun(result = state.lastResult) {
    refreshDailyMission();
    if (!result || state.dailyMission.claimed) {
      return false;
    }
    const mission = currentDailyMissionDefinition();
    if (mission.type === "matches") {
      return false;
    }
    const amount = missionRunProgress(mission, result);
    if (amount <= 0) {
      return false;
    }
    const before = state.dailyMission.progress;
    state.dailyMission.progress = Math.min(mission.target, before + amount);
    if (state.dailyMission.progress === before) {
      return false;
    }
    let rewarded = false;
    if (state.dailyMission.progress >= mission.target) {
      state.dailyMission.claimed = true;
      state.lastDailyStreakBonus = false;
      grantDailyMissionReward();
      updateDailyStreakOnClaim();
      rewarded = true;
    }
    saveState();
    return rewarded;
  }

  function updateWeeklyChallengeFromRun(result = state.lastResult) {
    refreshWeeklyChallenge();
    if (!result || state.weeklyChallenge.claimed) {
      return false;
    }
    const mission = currentWeeklyMissionDefinition();
    return addWeeklyChallengeProgress(missionRunProgress(mission, result));
  }

  function updateDailyStreakOnClaim() {
    const dateKey = state.dailyMission.dateKey || todayDateKey();
    if (state.dailyStreak.lastClaimDateKey === dateKey) {
      return false;
    }
    const continued = state.dailyStreak.lastClaimDateKey === previousDateKey(dateKey);
    state.dailyStreak.count = continued ? state.dailyStreak.count + 1 : 1;
    state.dailyStreak.lastClaimDateKey = dateKey;
    if (state.dailyStreak.count > 0 && state.dailyStreak.count % STREAK_BONUS_EVERY === 0) {
      grantDailyStreakBonus();
      state.lastDailyStreakBonus = true;
      return true;
    }
    state.lastDailyStreakBonus = false;
    return false;
  }

  function grantDailyStreakBonus() {
    if (STREAK_BONUS_ITEM === "packStone") {
      state.packStone += STREAK_BONUS_AMOUNT;
    }
  }

  function visibleDailyStreakCount() {
    const dateKey = todayDateKey();
    if (
      state.dailyStreak.lastClaimDateKey === dateKey ||
      state.dailyStreak.lastClaimDateKey === previousDateKey(dateKey)
    ) {
      return state.dailyStreak.count;
    }
    return 0;
  }

  function todayDateKey() {
    return formatDateKey(new Date());
  }

  function previousDateKey(dateKey) {
    const date = dateFromKey(dateKey);
    date.setDate(date.getDate() - 1);
    return formatDateKey(date);
  }

  function currentWeekKey(date = new Date()) {
    const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const mondayOffset = (weekStart.getDay() + 6) % 7;
    weekStart.setDate(weekStart.getDate() - mondayOffset);
    return formatDateKey(weekStart);
  }

  function isTodayOrYesterday(targetDateKey, dateKey = todayDateKey()) {
    return targetDateKey === dateKey || targetDateKey === previousDateKey(dateKey);
  }

  function isDateKey(value) {
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  function dateFromKey(dateKey) {
    if (!isDateKey(dateKey)) {
      return new Date();
    }
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function dailyWordIndex(dateKey = todayDateKey()) {
    const availableCount = Math.max(1, state.deckIds.filter((cardId) => CARD_BY_ID.has(cardId)).length);
    const seed = Number(dateKey.replace(/\D/g, "")) || 0;
    return seed % availableCount;
  }

  function dailyWordCard(dateKey = todayDateKey()) {
    const deckCards = state.deckIds.map((cardId) => CARD_BY_ID.get(cardId)).filter(Boolean);
    if (!deckCards.length) {
      return CARD_BY_ID.get(state.pushCardId) || DATA.cards[0];
    }
    return deckCards[dailyWordIndex(dateKey)] || deckCards[0];
  }

  function dailyWordSlotIndex(dateKey = todayDateKey()) {
    const card = dailyWordCard(dateKey);
    return card ? state.deckIds.indexOf(card.id) : -1;
  }

  function loadCardArtImages() {
    for (const card of DATA.cards) {
      if (!card.artImage) {
        continue;
      }
      const image = new Image();
      image.decoding = "async";
      image.src = card.artImage;
      CARD_ART_IMAGES.set(card.id, image);
    }
  }

  function loadRunArtImages() {
    const crane = new Image();
    crane.decoding = "async";
    crane.src = SPECIAL_CRANE_IMAGE_SRC;
    RUN_ART_IMAGES.set("special-crane", crane);
  }

  function showScreen(screenName) {
    if (!appScreens.has(screenName)) {
      return;
    }
    if (state.running && screenName !== "game") {
      pauseRun("screen", false);
    }
    const previousScreen = state.currentScreen;
    state.currentScreen = screenName;
    phone.dataset.screen = screenName;
    for (const [name, screen] of appScreens) {
      const active = name === screenName;
      screen.hidden = !active;
      screen.classList.toggle("is-active", active);
    }
    if (screenName !== "game") {
      cancelDrag();
      toastTimer = 0;
      toast.classList.remove("is-visible");
    }
    if (screenName !== "pack") {
      state.packDetailOpen = false;
      state.packOpeningOpen = false;
    }
    if (screenName !== "deck") {
      state.exchangePackId = "";
    }
    if (screenName === "pack" && previousScreen !== "pack") {
      clearPackReveal();
    }
    if (screenName === "game" && !state.running) {
      resetIdleRunState();
    }
    if (screenName === "game") {
      applyGameStageBackground();
    }
    renderAll();
    if (screenName === "game") {
      requestAnimationFrame(() => {
        resizeCanvas();
        draw();
      });
    }
    if (screenName === "ranking" && selectedRankingView === "season" && selectedSeasonRecordView === "current") {
      syncRanking({ reason: "screen", stageId: selectedRankingStageId });
    }
    if (previousScreen !== screenName) {
      logTelemetryEvent("screen_view", { from: previousScreen, to: screenName });
      playSound(screenName === "game" ? "open" : "tap");
    }
  }

  function clearPackReveal() {
    state.lastPackResult = "";
    state.lastPackReveal = null;
    state.packOpeningOpen = false;
  }

  function resetIdleRunState() {
    if (state.running) {
      return false;
    }
    cancelDrag();
    state.practiceMode = false;
    state.startCountdown = 0;
    state.paused = false;
    state.pauseReason = "";
    state.score = 0;
    state.timeLeft = DATA.runSeconds;
    state.tiles = [];
    state.effects = [];
    state.pointerActive = false;
    state.dragTile = null;
    state.autoScanTimer = 0;
    state.autoResolveQueued = false;
    state.refreshCooldown = 0;
    state.specialCooldown = 0;
    state.skillMeter = 0;
    state.skillCooldown = 0;
    state.scoreBoostTime = 0;
    state.scoreBoostMultiplier = 0;
    state.comboCount = 0;
    state.comboTimer = 0;
    state.maxCombo = 0;
    state.calmTime = 0;
    state.sauceBurstCharges = 0;
    state.runElapsed = 0;
    state.passiveSkills = [];
    state.passiveSkillCharges = {};
    state.lastSpurtActive = false;
    state.lastSpurtAnnounced = false;
    state.specialCrane = createFreshSpecialCraneState();
    state.runStats = {
      matches: 0,
      bestWord: "",
      bestWordCardId: "",
      bestWordScore: 0,
      bestWordLength: 0,
      cardClears: {},
      dailyWordCleared: false,
      rewardEvents: [],
    };
    state.tutorial = {
      active: false,
      hintFrom: null,
      hintTo: null,
      elapsed: 0,
      demoAfter: TUTORIAL_DEMO_AFTER_SECONDS,
      demoDone: false,
    };
    finishCard.hidden = true;
    pauseCard.hidden = true;
    if (stageCountdown) {
      stageCountdown.hidden = true;
    }
    hideWordCall();
    return true;
  }

  function pauseRun(reason = "manual", shouldSound = true) {
    if (!state.running || state.paused || !finishCard.hidden) {
      return false;
    }
    state.paused = true;
    state.pauseReason = reason;
    cancelDrag();
    hideWordCall();
    if (shouldSound) {
      playSound("tap");
    }
    logTelemetryEvent("pause", { reason, timeLeft: state.timeLeft });
    renderAll();
    draw();
    return true;
  }

  function resumeRun() {
    if (!state.running || !state.paused || !finishCard.hidden) {
      return false;
    }
    state.paused = false;
    state.pauseReason = "";
    lastFrame = performance.now();
    logTelemetryEvent("resume", { timeLeft: state.timeLeft });
    playSound("start");
    renderAll();
    draw();
    return true;
  }

  function quitRun() {
    if (!state.running || !finishCard.hidden) {
      return false;
    }
    const wasPractice = state.practiceMode;
    const score = state.score;
    const matches = state.runStats.matches;
    state.running = false;
    state.practiceMode = false;
    state.startCountdown = 0;
    state.paused = false;
    state.pauseReason = "";
    state.timeLeft = 0;
    state.comboTimer = 0;
    state.comboCount = 0;
    state.autoResolveQueued = false;
    state.autoScanTimer = 0;
    state.pointerActive = false;
    state.dragTile = null;
    state.effects = [];
    hideWordCall();
    finishCard.hidden = true;
    logTelemetryEvent("run_quit", { practice: wasPractice, score, matches });
    saveState();
    playSound("tap");
    showToast("プレイをやめました");
    showScreen("menu");
    return true;
  }

  function returnHomeFromResult() {
    finishCard.hidden = true;
    playSound("tap");
    showScreen("menu");
    return true;
  }

  function returnDeckFromResult() {
    finishCard.hidden = true;
    playSound("tap");
    showScreen("deck");
    return true;
  }

  function updateSetting(key, value) {
    state.settings[key] = value;
    logTelemetryEvent("setting_update", { key, value });
    if (key === "reduceMotion" || key === "largeText" || key === "highContrast" || key === "tileMarks") {
      applyAccessibilityClasses();
    }
    saveState();
    playSound("tap");
    renderAll();
    draw();
  }

  function replayTutorial() {
    if (state.running) {
      playSound("error");
      showToast("プレイ中はチュートリアルを開始できません");
      return false;
    }
    resetSaveConfirmUntil = 0;
    state.tutorialComplete = false;
    state.tutorial = {
      active: false,
      hintFrom: null,
      hintTo: null,
      elapsed: 0,
      demoAfter: TUTORIAL_DEMO_AFTER_SECONDS,
      demoDone: false,
    };
    state.deckIds = BASIC_DECK.slice();
    state.deckSlotColors = BASIC_DECK.map((_, index) => DEFAULT_SLOT_COLOR_IDS[index] || SLOT_COLOR_PRESETS[index % SLOT_COLOR_PRESETS.length].id);
    state.pushCardId = TUTORIAL_CARD_ID;
    normalizePushCardPlacement({ selectPush: true });
    state.selectedDeckSlot = defaultReplaceSlotIndex();
    state.guideCardId = TUTORIAL_CARD_ID;
    state.charPool = buildCharPool();
    saveState();
    playSound("tap");
    showScreen("game");
    showToast("次のプレイでチュートリアル");
    return true;
  }

  function requestSaveReset() {
    if (state.running) {
      playSound("error");
      showToast("プレイ中はリセットできません");
      return false;
    }
    const now = Date.now();
    if (now < resetSaveConfirmUntil) {
      try {
        window.localStorage?.removeItem(SAVE_KEY);
      } catch (error) {
        // Ignore storage failures and reload into a clean in-memory boot.
      }
      logTelemetryEvent("save_reset", { confirmed: true });
      playSound("coin");
      showToast("データをリセットしました");
      window.setTimeout(() => window.location.reload(), 180);
      return true;
    }
    resetSaveConfirmUntil = now + 5000;
    playSound("error");
    showToast("もう一度押すとデータリセット");
    renderAll();
    return false;
  }

  function applyAccessibilityClasses() {
    document.body.classList.toggle("reduce-motion", state.settings.reduceMotion);
    document.body.classList.toggle("large-text", state.settings.largeText);
    document.body.classList.toggle("high-contrast", state.settings.highContrast);
    document.body.classList.toggle("tile-marks", state.settings.tileMarks);
  }

  function renderResetSaveControls(now = Date.now()) {
    if (!resetSaveButton || !resetSaveNote) {
      return;
    }
    const confirming = now < resetSaveConfirmUntil;
    resetSaveButton.classList.toggle("is-confirming", confirming);
    const label = resetSaveButton.querySelector("strong");
    if (label) {
      label.textContent = confirming ? "もう一度押してリセット" : "データリセット";
    }
    resetSaveNote.textContent = confirming
      ? "5秒以内にもう一度押すと、この端末の保存データを削除します。"
      : "リセットは2回押しで実行します。所持カード、G、ランキング保存待ち、設定がこの端末から消えます。";
  }

  function spendStamina() {
    const now = Date.now();
    recoverStamina(now, true);
    if (state.stamina < STAMINA_COST) {
      playSound("error");
      showToast(`スタミナ回復まで ${formatStaminaCountdown()}`);
      renderAll();
      return false;
    }

    const wasFull = state.stamina >= STAMINA_MAX;
    state.stamina -= STAMINA_COST;
    if (wasFull) {
      state.staminaUpdatedAt = now;
    }
    saveState();
    renderAll();
    return true;
  }

  function recoverStamina(now = Date.now(), shouldSave = false) {
    if (state.stamina >= STAMINA_MAX) {
      state.stamina = STAMINA_MAX;
      return false;
    }

    const interval = STAMINA_RECOVERY_SECONDS * 1000;
    const elapsed = Math.max(0, now - state.staminaUpdatedAt);
    const recovered = Math.floor(elapsed / interval);
    if (recovered <= 0) {
      return false;
    }

    state.stamina = Math.min(STAMINA_MAX, state.stamina + recovered);
    state.staminaUpdatedAt = state.stamina >= STAMINA_MAX ? now : state.staminaUpdatedAt + recovered * interval;
    if (shouldSave) {
      saveState();
    }
    return true;
  }

  function secondsUntilNextStamina(now = Date.now()) {
    if (state.stamina >= STAMINA_MAX) {
      return 0;
    }
    const interval = STAMINA_RECOVERY_SECONDS * 1000;
    const elapsed = Math.max(0, now - state.staminaUpdatedAt);
    return Math.max(0, Math.ceil((interval - (elapsed % interval)) / 1000));
  }

  function formatStaminaCountdown(seconds = secondsUntilNextStamina()) {
    if (seconds <= 0) {
      return "OK";
    }
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${minutes}:${String(rest).padStart(2, "0")}`;
  }

  function recoverStaminaByAd() {
    recoverStamina(Date.now(), true);
    if (state.stamina >= STAMINA_MAX) {
      playSound("error");
      showToast("スタミナ満タン");
      renderAll();
      return false;
    }
    state.stamina = Math.min(STAMINA_MAX, state.stamina + 1);
    state.staminaUpdatedAt = state.stamina >= STAMINA_MAX ? Date.now() : state.staminaUpdatedAt;
    logTelemetryEvent("stamina_test_recover", { stamina: state.stamina });
    saveState();
    playSound("coin");
    showToast("テスト広告 スタミナ+1");
    renderAll();
    return true;
  }

  function recoverStaminaWithG() {
    recoverStamina(Date.now(), true);
    if (state.stamina >= STAMINA_MAX) {
      playSound("error");
      showToast("スタミナ満タン");
      renderAll();
      return false;
    }
    if (state.packStone < G_STAMINA_FULL_RECOVERY_COST) {
      playSound("error");
      showToast(`${G_CURRENCY_LABEL}不足`);
      showScreen("purchase");
      return false;
    }
    state.packStone -= G_STAMINA_FULL_RECOVERY_COST;
    state.stamina = STAMINA_MAX;
    state.staminaUpdatedAt = Date.now();
    logTelemetryEvent("stamina_g_full_recover", {
      cost: G_STAMINA_FULL_RECOVERY_COST,
      stone: state.packStone,
    });
    saveState();
    playSound("coin");
    showToast(`${G_CURRENCY_LABEL}${G_STAMINA_FULL_RECOVERY_COST}でスタミナ全回復`);
    renderAll();
    return true;
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    width = Math.max(300, Math.floor(rect.width));
    height = Math.max(300, Math.floor(rect.height));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    updateBoardMetrics();
    for (const tile of state.tiles) {
      const target = tileCenter(tile.col, tile.row);
      tile.x = target.x;
      tile.y = target.y;
    }
  }

  function gameStageBackgroundForRun(runIndex = state.completedRuns) {
    if (!GAME_STAGE_BACKGROUNDS.length) {
      return "";
    }
    const safeIndex = clampInteger(runIndex, 0, 999999);
    return GAME_STAGE_BACKGROUNDS[safeIndex % GAME_STAGE_BACKGROUNDS.length];
  }

  function applyGameStageBackground(runIndex = state.completedRuns) {
    if (!playPanel) {
      return;
    }
    const background = gameStageBackgroundForRun(runIndex);
    if (!background) {
      return;
    }
    playPanel.style.setProperty("--play-stage-bg", `url("${background}")`);
    playPanel.dataset.stageBg = background
      .replace(/^.*\/stage-game-/, "")
      .replace(/\.png$/, "");
  }

  function updateBoardMetrics() {
    const gap = Math.max(3, Math.floor(width * 0.012));
    const tile = Math.floor(Math.min((width - 28 - gap * (COLS - 1)) / COLS, (height - 54 - gap * (ROWS - 1)) / ROWS));
    board = {
      tile,
      gap,
      width: tile * COLS + gap * (COLS - 1),
      height: tile * ROWS + gap * (ROWS - 1),
      originX: Math.round((width - (tile * COLS + gap * (COLS - 1))) / 2),
      originY: Math.round(height - (tile * ROWS + gap * (ROWS - 1)) - 18),
    };
  }

  function startRun() {
    if (state.running) {
      return false;
    }
    recoverStamina(Date.now(), true);
    const deckProfile = evaluateDeckProfile();
    const practiceMode = state.stamina < STAMINA_COST;
    if (!practiceMode && !spendStamina()) {
      return false;
    }
    if (practiceMode) {
      recoverStamina(Date.now(), true);
      showToast(`練習モード 報酬なし / 回復 ${formatStaminaCountdown()}`);
    }
    applyGameStageBackground(state.completedRuns);
    resizeCanvas();
    playSound("start");
    state.running = true;
    state.practiceMode = practiceMode;
    state.startCountdown = RUN_COUNTDOWN_SECONDS;
    state.paused = false;
    state.pauseReason = "";
    state.score = 0;
    state.timeLeft = DATA.runSeconds;
    state.tiles = [];
    state.effects = [];
    state.pointerActive = false;
    state.dragTile = null;
    state.autoScanTimer = 0;
    state.autoResolveQueued = false;
    state.refreshCooldown = 0;
    state.specialCooldown = 0;
    state.skillMeter = 0;
    state.skillCooldown = 0;
    state.scoreBoostTime = 0;
    state.scoreBoostMultiplier = 0;
    state.comboCount = 0;
    state.comboTimer = 0;
    state.maxCombo = 0;
    state.calmTime = 0;
    state.sauceBurstCharges = 0;
    state.runElapsed = 0;
    state.lastSpurtActive = false;
    state.lastSpurtAnnounced = false;
    state.specialCrane = createFreshSpecialCraneState();
    state.tutorial = {
      active: false,
      hintFrom: null,
      hintTo: null,
      elapsed: 0,
      demoAfter: TUTORIAL_DEMO_AFTER_SECONDS,
      demoDone: false,
    };
    state.runStats = {
      matches: 0,
      bestWord: "",
      bestWordCardId: "",
      bestWordScore: 0,
      bestWordLength: 0,
      cardClears: {},
      dailyWordCleared: false,
      rewardEvents: [],
    };
    state.charPool = buildCharPool();
    state.rng = mulberry32((Date.now() ^ Math.floor(Math.random() * 1000000)) >>> 0);
    resetPassiveSkillsForRun();
    const timeBonus = passiveInitialTimeBonus();
    if (timeBonus > 0) {
      state.timeLeft = Math.min(MAX_TIME_LEFT_SECONDS, DATA.runSeconds + timeBonus);
      spawnRunBannerEffect(`TIME +${timeBonus.toFixed(1)}秒`, "#2fb8d8");
    }
    nextTileId = 1;
    finishCard.hidden = true;
    hideWordCall();
    logTelemetryEvent("run_start", {
      practice: practiceMode,
      deckDifficulty: deckProfile.label,
      deckMultiplier: Number(deckProfile.scoreMultiplier.toFixed(2)),
      stamina: state.stamina,
      deck: state.deckIds,
      passiveSkills: state.passiveSkills.map((skill) => ({ cardId: skill.cardId, type: skill.type, value: Number(skill.value.toFixed(3)) })),
    });
    fillBoard();
    if (!state.tutorialComplete) {
      applyTutorialBoard();
    }
    if (SPECIAL_ITEMS_ENABLED) {
      spawnSpecialTile(getTutorialAvoidCells());
    }
    renderAll();
    return true;
  }

  function finishRun() {
    const wasPractice = state.practiceMode;
    state.running = false;
    state.practiceMode = false;
    state.startCountdown = 0;
    state.paused = false;
    state.pauseReason = "";
    state.timeLeft = 0;
    state.comboTimer = 0;
    state.comboCount = 0;
    state.autoResolveQueued = false;
    state.autoScanTimer = 0;
    state.skillMeter = 0;
    state.skillCooldown = 0;
    state.sauceBurstCharges = 0;
    state.scoreBoostTime = 0;
    state.scoreBoostMultiplier = 0;
    state.calmTime = 0;
    state.runElapsed = 0;
    state.passiveSkills = [];
    state.passiveSkillCharges = {};
    state.lastSpurtActive = false;
    state.lastSpurtAnnounced = false;
    state.specialCrane = createFreshSpecialCraneState();
    hideWordCall();
    if (!wasPractice) {
      state.completedRuns = clampInteger(state.completedRuns + 1, 0, 99999);
    }
    updateBestRecords(wasPractice);
    const xpReward = wasPractice
      ? { amount: 0, before: playerRankProgress(), after: playerRankProgress(), leveledUp: false }
      : grantPlayerXp(state.lastResult);
    const scoreTargetRewarded = wasPractice ? false : updateDailyScoreTarget(state.score);
    const dailyRunRewarded = wasPractice ? false : updateDailyMissionFromRun(state.lastResult);
    const weeklyRewarded = wasPractice ? false : updateWeeklyChallengeFromRun(state.lastResult);
    const dailyMission = currentDailyMissionDefinition();
    const weeklyMission = currentWeeklyMissionDefinition();
    if (dailyRunRewarded) {
      addRunReward(dailyMission.label || "デイリーミッション", dailyMission.rewardAmount || 1);
      if (state.lastDailyStreakBonus) {
        addRunReward(`${state.dailyStreak.count}日連続`, STREAK_BONUS_AMOUNT);
      }
    }
    if (scoreTargetRewarded) {
      addRunReward("スコア目標", DAILY_SCORE_TARGET.rewardAmount || 1);
    }
    if (weeklyRewarded) {
      addRunReward(weeklyMission.label || "週替わり", weeklyMission.rewardAmount || 1);
    }
    if (state.lastResult) {
      state.lastResult.rewardSummary = buildRunRewardSummary(wasPractice);
      state.lastResult.xpReward = xpReward.amount;
      state.lastResult.playerRankBefore = xpReward.before.rank;
      state.lastResult.playerRankAfter = xpReward.after.rank;
      state.lastResult.playerXpAfter = state.playerXp;
      state.lastResult.playerRankUp = xpReward.leveledUp;
    }
    logTelemetryEvent("run_finish", {
      practice: wasPractice,
      score: state.score,
      rank: state.lastResult?.rank || resultRank(state.score),
      xp: xpReward.amount,
      playerRank: xpReward.after.rank,
      playerRankUp: xpReward.leveledUp,
      matches: state.runStats.matches,
      combo: state.maxCombo,
      rewardStone: state.lastResult?.rewardSummary?.totalStone || 0,
    });
    if (!wasPractice && queueRankingSubmission(state.lastResult)) {
      syncRanking({ reason: "run_finish", stageId: ACTIVE_RANKING_STAGE_ID });
    }
    renderFinishResult();
    finishCard.hidden = false;
    saveState();
    playSound("finish");
    showToast(
      wasPractice
        ? "練習終了 報酬なし"
        : xpReward.leveledUp
          ? `ランク${xpReward.after.rank}到達 スタミナ全回復`
          : weeklyRewarded
          ? `${weeklyMission.label || "週替わり"}達成 ${currencyRewardLabel(weeklyMission.rewardAmount || 1)}`
          : dailyRunRewarded
            ? `${dailyMission.label || "デイリー"}達成 ${currencyRewardLabel(dailyMission.rewardAmount || 1)}`
          : scoreTargetRewarded
            ? `スコア目標達成 ${currencyRewardLabel(1)}`
            : "TIME UP",
    );
    renderAll();
  }

  function updateBestRecords(practiceMode = false) {
    const newBest = !practiceMode && state.score > state.bestScore;
    if (newBest) {
      state.bestScore = state.score;
    }
    if (!practiceMode) {
      updateSeasonBestScore(state.score);
      updateDailyRankingBestScore(state.score);
    }
    if (!practiceMode && state.runStats.bestWord && state.runStats.bestWordScore >= state.bestWordRecord.score) {
      state.bestWordRecord = {
        word: state.runStats.bestWord,
        cardId: state.runStats.bestWordCardId,
        score: state.runStats.bestWordScore,
        length: state.runStats.bestWordLength,
      };
    }
    const bestWordCard = CARD_BY_ID.get(state.runStats.bestWordCardId);
    const todayWord = dailyWordCard();
    const deckProfile = evaluateDeckProfile();
    state.lastResult = {
      score: state.score,
      rank: resultRank(state.score),
      deckDifficulty: deckProfile.label,
      deckScoreMultiplier: deckProfile.scoreMultiplier,
      deckRewardMultiplier: deckProfile.rewardMultiplier,
      matches: state.runStats.matches,
      bestWord: state.runStats.bestWord,
      bestWordCardId: state.runStats.bestWordCardId,
      learnNote: bestWordCard?.learnNote || "",
      bestWordScore: state.runStats.bestWordScore,
      maxCombo: state.maxCombo,
      bestScore: state.bestScore,
      newBest,
      practice: practiceMode,
      dailyWordCleared: !practiceMode && state.runStats.dailyWordCleared === true,
      dailyWordCardId: todayWord?.id || "",
      dailyWordName: todayWord?.displayName || "",
      rewardSummary: buildRunRewardSummary(practiceMode),
    };
  }

  function addRunReward(label, amount = 1) {
    if (!state.runStats.rewardEvents) {
      state.runStats.rewardEvents = [];
    }
    const cleanLabel = sanitizeTelemetryText(label || "報酬", 18);
    const cleanAmount = clampInteger(amount, 0, 99);
    if (cleanAmount <= 0) {
      return;
    }
    state.runStats.rewardEvents.push({
      label: cleanLabel,
      amount: cleanAmount,
    });
  }

  function buildRunRewardSummary(practiceMode = false) {
    const rewards = Array.isArray(state.runStats.rewardEvents) ? state.runStats.rewardEvents : [];
    const totalStone = practiceMode ? 0 : rewards.reduce((sum, reward) => sum + clampInteger(reward.amount, 0, 99), 0);
    return {
      totalStone,
      labels: practiceMode ? [] : rewards.map((reward) => sanitizeTelemetryText(reward.label, 18)).slice(0, 4),
      practice: practiceMode === true,
    };
  }

  function renderFinishResult() {
    const result = state.lastResult || {
      score: state.score,
      rank: resultRank(state.score),
      matches: state.runStats.matches,
      bestWord: state.runStats.bestWord,
      bestWordCardId: state.runStats.bestWordCardId,
      learnNote: CARD_BY_ID.get(state.runStats.bestWordCardId)?.learnNote || "",
      bestWordScore: state.runStats.bestWordScore,
      maxCombo: state.maxCombo,
      bestScore: state.bestScore,
      newBest: false,
      practice: false,
      dailyWordCleared: false,
      dailyWordCardId: dailyWordCard()?.id || "",
      dailyWordName: dailyWordCard()?.displayName || "",
      xpReward: 0,
      playerRankBefore: playerRankProgress().rank,
      playerRankAfter: playerRankProgress().rank,
      playerXpAfter: state.playerXp,
      playerRankUp: false,
      rewardSummary: buildRunRewardSummary(false),
    };
    finishScore.textContent = formatNumber(result.score);
    finishRank.textContent = result.practice ? "PRACTICE" : `RANK ${result.rank}`;
    finishBestText.textContent = result.practice ? `報酬なし / BEST ${formatNumber(result.bestScore)}` : result.newBest ? "NEW BEST" : `BEST ${formatNumber(result.bestScore)}`;
    finishWords.textContent = `${result.matches} WORDS / ${result.maxCombo || 0} COMBO`;
    finishBestWord.textContent = result.bestWord ? `BEST WORD ${result.bestWord}` : "BEST WORD -";
    renderFinishRewardSummary(result);
    renderFinishXpSummary(result);
  }

  function openResultWordGuide() {
    const result = state.lastResult;
    const card = CARD_BY_ID.get(result?.bestWordCardId || state.runStats.bestWordCardId);
    if (!card) {
      playSound("error");
      showToast("メモがありません");
      return false;
    }
    state.guideCardId = card.id;
    state.collectionFilterId = "all";
    state.collectionLengthFilterId = "all";
    logTelemetryEvent("result_word_guide", {
      cardId: card.id,
      word: result?.bestWord || card.displayName,
      practice: result?.practice === true,
    });
    playSound("tap");
    showScreen("deck");
    return true;
  }

  function renderFinishRewardSummary(result) {
    if (!finishRewardSummary || !finishRewardText) {
      return;
    }
    const summary = result.rewardSummary || { totalStone: 0, labels: [], practice: result.practice === true };
    finishRewardSummary.classList.toggle("is-earned", summary.totalStone > 0);
    finishRewardSummary.classList.toggle("is-practice", summary.practice === true);
    if (summary.practice) {
      finishRewardText.textContent = "練習 報酬なし";
      return;
    }
    if (summary.totalStone > 0) {
      finishRewardText.textContent = formatResultRewardLine({ rewardSummary: summary }, { compact: true });
      return;
    }
    finishRewardText.textContent = "報酬なし";
  }

  function renderFinishXpSummary(result) {
    if (!finishXpSummary || !finishXpText || !finishXpBar) {
      return;
    }
    const progress = playerRankProgress(result.playerXpAfter || state.playerXp);
    finishXpSummary.classList.toggle("is-practice", result.practice === true);
    finishXpSummary.classList.toggle("is-rank-up", result.playerRankUp === true);
    finishXpBar.style.width = `${progress.percent}%`;
    if (result.practice) {
      finishXpText.textContent = `練習 EXPなし / ランク ${progress.rank}`;
      return;
    }
    const xp = clampInteger(result.xpReward, 0, 999);
    if (result.playerRankUp) {
      finishXpText.textContent = `EXP +${xp} / ランク ${result.playerRankBefore}→${result.playerRankAfter} / スタミナ全回復`;
      return;
    }
    finishXpText.textContent = `EXP +${xp} / ランク ${progress.rank}`;
  }

  function compactRewardLabel(label) {
    if (label.includes("ことば") || label.includes("祭り")) {
      return "今日";
    }
    if (label.includes("スコア")) {
      return "スコア";
    }
    if (label.includes("連続")) {
      return "連続";
    }
    if (label.includes("週")) {
      return "週";
    }
    return label;
  }

  function formatResultRewardLine(result, options = {}) {
    const summary = result?.rewardSummary || { totalStone: 0, labels: [], practice: result?.practice === true };
    if (summary.practice) {
      return "報酬なし";
    }
    if (summary.totalStone > 0) {
      const labels = Array.isArray(summary.labels) ? summary.labels.map(compactRewardLabel).filter(Boolean) : [];
      const opener = options.compact ? " " : "（";
      const closer = options.compact ? "" : "）";
      return `${currencyRewardLabel(summary.totalStone)}${labels.length ? `${opener}${labels.join("・")}${closer}` : ""}`;
    }
    return "報酬なし";
  }

  function renderFinishFeedback(selectedId = "") {
    if (!finishFeedbackButtons) {
      return;
    }
    for (const button of finishFeedbackButtons.querySelectorAll("[data-quick-feedback]")) {
      const selected = button.dataset.quickFeedback === selectedId;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    }
  }

  function onQuickFeedbackClick(event) {
    const button = event.target.closest("[data-quick-feedback]");
    if (!button) {
      return;
    }
    recordQuickFeedback(button.dataset.quickFeedback);
  }

  function recordQuickFeedback(id) {
    const option = QUICK_FEEDBACK_BY_ID.get(id);
    if (!option) {
      playSound("error");
      return false;
    }
    const result = state.lastResult || {};
    const entry = {
      id: option.id,
      label: option.label,
      perspective: option.perspective,
      score: clampInteger(result.score, 0, 999999999),
      rank: sanitizeTelemetryText(result.rank || "", 8),
      practice: result.practice === true,
      at: new Date().toISOString(),
    };
    if (state.lastResult) {
      state.lastResult.quickFeedback = {
        id: option.id,
        label: option.label,
        perspective: option.perspective,
      };
    }
    state.quickFeedback.push(entry);
    if (state.quickFeedback.length > QUICK_FEEDBACK_MAX) {
      state.quickFeedback = state.quickFeedback.slice(-QUICK_FEEDBACK_MAX);
    }
    logTelemetryEvent("quick_feedback", {
      id: option.id,
      label: option.label,
      perspective: option.perspective,
      score: entry.score,
      rank: entry.rank,
      practice: entry.practice,
    });
    renderFinishFeedback(option.id);
    renderFeedbackInsights();
    saveState();
    playSound("tap");
    showToast(`感想 ${option.label}`);
    return true;
  }

  async function shareLastResult() {
    if (!state.lastResult) {
      playSound("error");
      showToast("結果がありません");
      return;
    }
    const text = buildShareText(state.lastResult);
    try {
      if (navigator.share) {
        logTelemetryEvent("share_result", { method: "sheet", score: state.lastResult.score || 0 });
        saveState();
        await navigator.share({ title: APP_NAME, text });
        playSound("coin");
        return;
      }
      if (navigator.clipboard?.writeText) {
        logTelemetryEvent("share_result", { method: "clipboard", score: state.lastResult.score || 0 });
        saveState();
        await navigator.clipboard.writeText(text);
        playSound("coin");
        showToast("結果をコピー");
        return;
      }
    } catch (error) {
      playSound("error");
      return;
    }
    playSound("error");
    showToast("共有は未対応です");
  }

  async function copyFeedbackReport() {
    logTelemetryEvent("feedback_report_copy", { screen: state.currentScreen });
    saveState();
    const report = buildFeedbackReport();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(report);
        playSound("coin");
        showToast("テストレポートをコピー");
        return true;
      }
    } catch (error) {
      playSound("error");
      showToast("コピーできませんでした");
      return false;
    }
    playSound("error");
    showToast("コピーは未対応です");
    return false;
  }

  function buildFeedbackReport() {
    const deckNames = state.deckIds.map((cardId, index) => {
      const card = CARD_BY_ID.get(cardId);
      const push = cardId === state.pushCardId ? "推し" : "";
      const slotLabel = formatDeckSlotLabel(index);
      return `${index + 1}. ${card?.displayName || cardId}${push ? ` (${push})` : ""} / ${slotLabel}`;
    });
    const bestWord = state.bestWordRecord.word
      ? `${state.bestWordRecord.word} / ${formatNumber(state.bestWordRecord.score)}点`
      : "-";
    const lastResult = state.lastResult
      ? `${state.lastResult.practice ? "練習 / " : ""}${formatNumber(state.lastResult.score)}点 / RANK ${state.lastResult.rank} / ${state.lastResult.matches}語 / ${state.lastResult.maxCombo || 0}コンボ / 報酬 ${formatResultRewardLine(state.lastResult)}`
      : "-";
    const weeklyMission = currentWeeklyMissionDefinition();
    const weeklyTarget = Math.max(1, weeklyMission.target);
    const weeklyProgress = Math.min(weeklyTarget, state.weeklyChallenge.progress || 0);
    const todayWord = dailyWordCard();
    const todayWordCategory = todayWord ? guideCategoryForCard(todayWord) : null;
    const todayWordLine = todayWord
      ? `${todayWord.displayName} / ${todayWordCategory?.title || "ことば"} / ${todayWord.learnNote || "-"}`
      : "-";
    const settingsSummary = [
      `音:${settingOnOff(state.settings.sound)}`,
      `振動:${settingOnOff(state.settings.vibration)}`,
      `控えめ:${settingOnOff(state.settings.reduceMotion)}`,
      `大文字:${settingOnOff(state.settings.largeText)}`,
      `高コントラスト:${settingOnOff(state.settings.highContrast)}`,
      `パネル番号:${settingOnOff(state.settings.tileMarks)}`,
    ].join(" / ");

    return [
      `${APP_NAME} テストレポート`,
      `作成日時: ${new Date().toISOString()}`,
      "",
      "気づいたこと:",
      "- ",
      "期待した動き:",
      "- ",
      "実際の動き:",
      "- ",
      "再現手順:",
      "1. ",
      "",
      "4視点メモ:",
      "- プレイヤー目線: ",
      "- 教育者目線: ",
      "- 配信者目線: ",
      "- 視聴者目線: ",
      "",
      "状態スナップショット:",
      `ビルド: ${formatBuildLabel()}`,
      `画面: ${state.currentScreen}`,
      `完走: ${state.completedRuns}回`,
      `スタミナ: ${state.stamina}/${STAMINA_MAX}`,
      `${G_CURRENCY_LABEL}/${EXCHANGE_TOKEN_LABEL}/チケット: ${state.packStone}/${getPackMedals(currentPack())}/${state.choiceTickets}`,
      `今日のことば: ${todayWordLine}`,
      `今日の差し入れ: ${state.dailyGift.claimed ? "受取済み" : "未受取"}`,
      `週替わり: ${weeklyMission.label} ${formatMissionProgress(weeklyProgress, weeklyTarget, weeklyMission)}${state.weeklyChallenge.claimed ? " 達成" : ""}`,
      `ベスト: ${formatNumber(state.bestScore)}点`,
      `ベストワード: ${bestWord}`,
      `直近リザルト: ${lastResult}`,
      `クイック感想: ${formatQuickFeedbackSummary()}`,
      `テスト傾向: ${formatFeedbackInsightSummary()}`,
      `デッキ: ${deckNames.join(" / ")}`,
      `設定: ${settingsSummary}`,
      `表示: ${window.innerWidth}x${window.innerHeight} / DPR ${window.devicePixelRatio || 1}`,
      `UA: ${navigator.userAgent}`,
      "",
      "最近のイベント（非PII）:",
      ...formatTelemetryEvents(),
    ].join("\n");
  }

  function formatQuickFeedbackSummary() {
    if (!state.quickFeedback.length) {
      return "-";
    }
    const latest = state.quickFeedback[state.quickFeedback.length - 1];
    return `${latest.label} / ${latest.perspective} / ${formatNumber(latest.score)}点${latest.practice ? " / 練習" : ""}`;
  }

  function buildFeedbackInsightStats(entries = state.quickFeedback) {
    const safeEntries = sanitizeQuickFeedback(entries);
    const optionCounts = QUICK_FEEDBACK_OPTIONS.map((option) => ({
      id: option.id,
      label: option.label,
      perspective: option.perspective,
      perspectiveLabel: PERSPECTIVE_LABELS[option.perspective] || option.perspective,
      count: 0,
    }));
    const countsById = new Map(optionCounts.map((item) => [item.id, item]));
    const perspectiveCounts = Object.fromEntries(Object.keys(PERSPECTIVE_LABELS).map((key) => [key, 0]));
    for (const entry of safeEntries) {
      const count = countsById.get(entry.id);
      if (!count) {
        continue;
      }
      count.count += 1;
      perspectiveCounts[count.perspective] = (perspectiveCounts[count.perspective] || 0) + 1;
    }
    const top = optionCounts
      .slice()
      .sort((a, b) => b.count - a.count || QUICK_FEEDBACK_OPTIONS.findIndex((option) => option.id === a.id) - QUICK_FEEDBACK_OPTIONS.findIndex((option) => option.id === b.id))[0];
    return {
      total: safeEntries.length,
      options: optionCounts,
      perspectives: perspectiveCounts,
      top: top && top.count > 0 ? top : null,
    };
  }

  function formatFeedbackInsightSummary(stats = buildFeedbackInsightStats()) {
    if (!stats.total) {
      return "-";
    }
    const perspectiveLine = Object.entries(PERSPECTIVE_LABELS)
      .map(([key, label]) => `${label}${stats.perspectives[key] || 0}`)
      .join(" / ");
    return `直近${stats.total}件 / 最多 ${stats.top.label} ${stats.top.count}件 / ${perspectiveLine}`;
  }

  function settingOnOff(value) {
    return value ? "ON" : "OFF";
  }

  function formatDeckSlotLabel(slotIndex) {
    const preset = getDeckSlotColor(slotIndex);
    return `デッキ色 ${preset.label}`;
  }

  function formatDeckSlotTargetLabel(slotIndex) {
    const preset = getDeckSlotColor(slotIndex);
    return `${preset.label}枠`;
  }

  function formatDeckSlotActionLabel(slotIndex) {
    return formatDeckSlotTargetLabel(slotIndex);
  }

  function deckMembershipLabel(cardId) {
    if (!state.deckIds.includes(cardId)) {
      return "";
    }
    return cardId === state.pushCardId ? "推し / デッキ入り" : "デッキ入り";
  }

  function formatBuildLabel() {
    const parts = [
      `v${BUILD_INFO.versionName}`,
      BUILD_INFO.channel,
      `code ${BUILD_INFO.versionCode}`,
      BUILD_INFO.buildId,
    ].filter(Boolean);
    return parts.join(" / ");
  }

  function logTelemetryEvent(type, data = {}) {
    state.telemetryEvents.push({
      at: new Date().toISOString(),
      type: sanitizeTelemetryText(type, 40),
      data: sanitizeTelemetryData(data),
    });
    if (state.telemetryEvents.length > TELEMETRY_MAX_EVENTS) {
      state.telemetryEvents = state.telemetryEvents.slice(-TELEMETRY_MAX_EVENTS);
    }
  }

  function sanitizeTelemetryData(data) {
    const result = {};
    if (!data || typeof data !== "object") {
      return result;
    }
    for (const [key, value] of Object.entries(data).slice(0, 8)) {
      const safeKey = sanitizeTelemetryText(key, 28);
      if (!safeKey) {
        continue;
      }
      if (typeof value === "boolean") {
        result[safeKey] = value;
      } else if (Number.isFinite(value)) {
        result[safeKey] = Number.isInteger(value) ? value : Number(value.toFixed(2));
      } else if (typeof value === "string") {
        result[safeKey] = sanitizeTelemetryText(value, 64);
      } else if (Array.isArray(value)) {
        result[safeKey] = value.map((item) => sanitizeTelemetryText(item, 20)).filter(Boolean).slice(0, 6).join(",");
      }
    }
    return result;
  }

  function sanitizeTelemetryText(value, limit) {
    return String(value ?? "")
      .replace(/\s+/g, " ")
      .replace(/[<>]/g, "")
      .trim()
      .slice(0, limit);
  }

  function formatTelemetryEvents() {
    if (!state.telemetryEvents.length) {
      return ["- なし"];
    }
    return state.telemetryEvents.slice(-TELEMETRY_REPORT_EVENTS).map((event) => {
      const details = Object.entries(event.data || {})
        .map(([key, value]) => `${key}=${value}`)
        .join(" / ");
      const time = event.at ? event.at.replace("T", " ").slice(5, 19) : "--";
      return `- ${time} ${event.type}${details ? ` / ${details}` : ""}`;
    });
  }

  async function shareResultImage() {
    if (!state.lastResult) {
      playSound("error");
      showToast("結果がありません");
      return;
    }
    const dataUrl = createResultImageDataUrl(state.lastResult);
    const fileName = `kana-gunmatsuri-${Date.now()}.png`;
    const text = buildShareText(state.lastResult);
    try {
      const file = createResultImageFile(dataUrl, fileName);
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        logTelemetryEvent("share_image", { method: "sheet", score: state.lastResult.score || 0 });
        await navigator.share({ title: APP_NAME, text, files: [file] });
        playSound("coin");
        showToast("リザルト画像を共有");
        return;
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        playSound("tap");
        return;
      }
    }
    downloadDataUrl(dataUrl, fileName);
    logTelemetryEvent("share_image", { method: "download", score: state.lastResult.score || 0 });
    playSound("coin");
    showToast("リザルト画像を保存");
  }

  function buildShareText(result) {
    const modeLine = result.practice ? "練習モード（報酬なし）" : "";
    const wordLine = result.bestWord ? `ベストワード: ${result.bestWord}` : "ベストワード: -";
    const learnLine = result.learnNote ? `ことばメモ: ${result.learnNote}` : "";
    const rewardLine = `報酬: ${formatResultRewardLine(result)}`;
    return [
      APP_NAME,
      modeLine,
      `スコア: ${formatNumber(result.score)} / RANK ${result.rank}`,
      `消去: ${result.matches}語 / 最大${result.maxCombo || 0}コンボ`,
      rewardLine,
      wordLine,
      learnLine,
      APP_HASHTAG,
    ].filter(Boolean).join("\n");
  }

  function createResultImageDataUrl(result) {
    const imageCanvas = document.createElement("canvas");
    const imageCtx = imageCanvas.getContext("2d");
    const imageWidth = 1080;
    const imageHeight = 1920;
    imageCanvas.width = imageWidth;
    imageCanvas.height = imageHeight;

    const bg = imageCtx.createLinearGradient(0, 0, imageWidth, imageHeight);
    bg.addColorStop(0, "#fff4d8");
    bg.addColorStop(0.42, "#dff7ee");
    bg.addColorStop(1, "#ffd6c7");
    imageCtx.fillStyle = bg;
    imageCtx.fillRect(0, 0, imageWidth, imageHeight);

    drawSharePattern(imageCtx, imageWidth, imageHeight);
    drawShareCard(imageCtx, result, imageWidth, imageHeight);
    return imageCanvas.toDataURL("image/png");
  }

  function createResultImageBlob(result) {
    return dataUrlToBlob(createResultImageDataUrl(result));
  }

  function createResultImageFile(dataUrl, fileName) {
    return new File([dataUrlToBlob(dataUrl)], fileName, { type: "image/png" });
  }

  function dataUrlToBlob(dataUrl) {
    const [header, body] = dataUrl.split(",");
    const mime = header.match(/data:(.*?);base64/)?.[1] || "image/png";
    const binary = atob(body || "");
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new Blob([bytes], { type: mime });
  }

  function downloadDataUrl(dataUrl, fileName) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function drawSharePattern(imageCtx, imageWidth, imageHeight) {
    imageCtx.save();
    imageCtx.globalAlpha = 0.28;
    for (let y = 150; y < imageHeight; y += 220) {
      imageCtx.fillStyle = y % 440 === 150 ? "#ef5d50" : "#0d9488";
      imageCtx.beginPath();
      imageCtx.ellipse(120, y, 94, 18, -0.22, 0, Math.PI * 2);
      imageCtx.ellipse(imageWidth - 140, y + 74, 120, 20, 0.2, 0, Math.PI * 2);
      imageCtx.fill();
    }
    imageCtx.globalAlpha = 0.5;
    for (let i = 0; i < 34; i += 1) {
      const x = 92 + ((i * 151) % 900);
      const y = 96 + ((i * 233) % 1650);
      imageCtx.fillStyle = ["#ef5d50", "#f5b642", "#0d9488", "#6457a6"][i % 4];
      imageCtx.save();
      imageCtx.translate(x, y);
      imageCtx.rotate((i % 7) * 0.22);
      imageCtx.fillRect(-11, -5, 22, 10);
      imageCtx.restore();
    }
    imageCtx.restore();
  }

  function drawShareCard(imageCtx, result, imageWidth, imageHeight) {
    const cardX = 88;
    const cardY = 170;
    const cardW = imageWidth - cardX * 2;
    const cardH = imageHeight - cardY * 2;
    const shareFontFamily = '"Hiragino Sans", "Yu Gothic", "Meiryo", "Noto Sans JP", Arial, sans-serif';
    imageCtx.save();
    imageCtx.shadowColor = "rgba(26, 36, 51, 0.22)";
    imageCtx.shadowBlur = 42;
    imageCtx.shadowOffsetY = 18;
    imageCtx.fillStyle = "rgba(255, 255, 255, 0.94)";
    roundedRect(imageCtx, cardX, cardY, cardW, cardH, 42);
    imageCtx.fill();
    imageCtx.shadowColor = "transparent";
    imageCtx.lineWidth = 8;
    imageCtx.strokeStyle = "rgba(245, 182, 66, 0.72)";
    imageCtx.stroke();

    const header = imageCtx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + 260);
    header.addColorStop(0, "#ef5d50");
    header.addColorStop(0.58, "#f5b642");
    header.addColorStop(1, "#0d9488");
    imageCtx.fillStyle = header;
    roundedRect(imageCtx, cardX + 30, cardY + 30, cardW - 60, 260, 30);
    imageCtx.fill();

    imageCtx.fillStyle = "#ffffff";
    imageCtx.textAlign = "center";
    imageCtx.textBaseline = "middle";
    imageCtx.font = `900 64px ${shareFontFamily}`;
    imageCtx.fillText(APP_NAME, imageWidth / 2, cardY + 145);

    imageCtx.fillStyle = "#162235";
    imageCtx.font = `900 72px ${shareFontFamily}`;
    imageCtx.fillText("RESULT", imageWidth / 2, cardY + 390);
    imageCtx.fillStyle = "#ef5d50";
    imageCtx.font = `900 150px ${shareFontFamily}`;
    imageCtx.fillText(formatNumber(result.score), imageWidth / 2, cardY + 560);

    drawSharePill(imageCtx, imageWidth / 2 - 130, cardY + 660, 260, 78, result.practice ? "PRACTICE" : `RANK ${result.rank}`, "#ef5d50", "#f5b642");
    imageCtx.fillStyle = "#d99945";
    imageCtx.font = `900 34px ${shareFontFamily}`;
    imageCtx.fillText(`報酬 ${formatResultRewardLine(result)}`, imageWidth / 2, cardY + 765);
    drawSharePill(imageCtx, cardX + 96, cardY + 805, 300, 84, `${result.matches} WORDS`, "#0d9488", "#5ac8c1");
    drawSharePill(imageCtx, imageWidth - cardX - 396, cardY + 805, 300, 84, `${result.maxCombo || 0} COMBO`, "#6457a6", "#a48be0");

    imageCtx.fillStyle = "#657084";
    imageCtx.font = `900 34px ${shareFontFamily}`;
    imageCtx.fillText("BEST WORD", imageWidth / 2, cardY + 1015);
    imageCtx.fillStyle = "#162235";
    imageCtx.font = `900 64px ${shareFontFamily}`;
    imageCtx.fillText(result.bestWord || "-", imageWidth / 2, cardY + 1092);

    imageCtx.fillStyle = "#657084";
    imageCtx.font = `900 28px ${shareFontFamily}`;
    imageCtx.fillText("ことばメモ", imageWidth / 2, cardY + 1210);
    imageCtx.fillStyle = "#162235";
    imageCtx.font = `800 34px ${shareFontFamily}`;
    drawShareWrappedText(
      imageCtx,
      result.learnNote || "次は群馬のことばを見つけよう",
      imageWidth / 2,
      cardY + 1270,
      cardW - 160,
      46,
      2,
    );

    imageCtx.fillStyle = "#0d9488";
    imageCtx.font = `900 34px ${shareFontFamily}`;
    imageCtx.fillText(APP_HASHTAG, imageWidth / 2, cardY + cardH - 65);
    imageCtx.fillStyle = "#657084";
    imageCtx.font = `700 28px ${shareFontFamily}`;
    imageCtx.fillText("60秒かなパネルパズル", imageWidth / 2, cardY + cardH - 28);
    imageCtx.restore();
  }

  function drawShareWrappedText(imageCtx, text, centerX, startY, maxWidth, lineHeight, maxLines) {
    const chars = Array.from(text);
    const lines = [];
    let line = "";
    for (const char of chars) {
      const candidate = `${line}${char}`;
      if (line && imageCtx.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = char;
        if (lines.length >= maxLines) {
          break;
        }
      } else {
        line = candidate;
      }
    }
    if (line && lines.length < maxLines) {
      lines.push(line);
    }
    lines.slice(0, maxLines).forEach((lineText, index) => {
      imageCtx.fillText(lineText, centerX, startY + index * lineHeight);
    });
  }

  function drawSharePill(imageCtx, x, y, w, h, text, colorA, colorB) {
    const gradient = imageCtx.createLinearGradient(x, y, x + w, y + h);
    gradient.addColorStop(0, colorA);
    gradient.addColorStop(1, colorB);
    imageCtx.fillStyle = gradient;
    roundedRect(imageCtx, x, y, w, h, h / 2);
    imageCtx.fill();
    imageCtx.fillStyle = "#ffffff";
    imageCtx.font = '900 34px "Hiragino Sans", "Yu Gothic", "Meiryo", "Noto Sans JP", Arial, sans-serif';
    imageCtx.textAlign = "center";
    imageCtx.textBaseline = "middle";
    imageCtx.fillText(text, x + w / 2, y + h / 2 + 1);
  }

  function roundedRect(imageCtx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    imageCtx.beginPath();
    imageCtx.moveTo(x + radius, y);
    imageCtx.arcTo(x + w, y, x + w, y + h, radius);
    imageCtx.arcTo(x + w, y + h, x, y + h, radius);
    imageCtx.arcTo(x, y + h, x, y, radius);
    imageCtx.arcTo(x, y, x + w, y, radius);
    imageCtx.closePath();
  }

  function resultRank(score) {
    if (score >= 30000) {
      return "S";
    }
    if (score >= 18000) {
      return "A";
    }
    if (score >= 9000) {
      return "B";
    }
    if (score >= 3500) {
      return "C";
    }
    return "D";
  }

  function frame(timestamp) {
    const dt = Math.min(0.033, (timestamp - lastFrame) / 1000 || 0.016);
    lastFrame = timestamp;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  function update(dt) {
    if (toastTimer > 0) {
      toastTimer -= dt;
      if (toastTimer <= 0) {
        toast.classList.remove("is-visible");
      }
    }

    recoverStamina(Date.now(), true);
    refreshDailyMission();
    refreshDailyScoreTarget();

    if (state.running && !state.paused && state.currentScreen === "game") {
      if (state.startCountdown > 0) {
        const previousCountdown = state.startCountdown;
        state.startCountdown = Math.max(0, state.startCountdown - dt);
        if (previousCountdown > 0 && state.startCountdown <= 0) {
          playSound("start");
          queueAutoResolve(0.12);
        }
      } else {
        const previousTimeLeft = state.timeLeft;
        state.runElapsed += dt;
        state.timeLeft = Math.max(0, state.timeLeft - dt);
        if (state.timeLeft <= 0) {
          finishRun();
          updateHud();
          return;
        }
        updateTimedRunEvents(dt, previousTimeLeft);

        state.scoreBoostTime = Math.max(0, state.scoreBoostTime - dt);
        if (state.scoreBoostTime <= 0) {
          state.scoreBoostMultiplier = 0;
        }
        state.comboTimer = Math.max(0, state.comboTimer - dt);
        if (state.comboTimer <= 0) {
          state.comboCount = 0;
        }
        state.calmTime = Math.max(0, state.calmTime - dt);
        state.refreshCooldown = Math.max(0, state.refreshCooldown - dt);
        state.specialCooldown = SPECIAL_ITEMS_ENABLED ? Math.max(0, state.specialCooldown - dt) : 0;
        state.skillCooldown = Math.max(0, state.skillCooldown - dt);
        if (SPECIAL_ITEMS_ENABLED && !hasSpecialTile() && state.specialCooldown <= 0) {
          spawnSpecialTile(getTutorialAvoidCells());
        }

        updateTutorialAssist(dt);

        if (state.autoResolveQueued) {
          state.autoScanTimer -= dt;
          if (state.autoScanTimer <= 0) {
            const resolved = resolveAutoMatch();
            if (resolved) {
              state.autoScanTimer = state.calmTime > 0 ? 0.26 : AUTO_SCAN_INTERVAL;
            } else {
              state.autoResolveQueued = false;
              state.autoScanTimer = 0;
            }
          }
        }
      }
    }

    if (!state.paused) {
      updateTileAnimation(dt);
      updateEffects(dt);
    }
    updateHud();
  }

  function updateTimedRunEvents(dt, previousTimeLeft) {
    const inLastSpurt = state.timeLeft <= LAST_SPURT_SECONDS && state.timeLeft > 0;
    if (inLastSpurt && !state.lastSpurtAnnounced) {
      state.lastSpurtAnnounced = true;
      playSound("skill");
    }
    state.lastSpurtActive = inLastSpurt;

    const crane = state.specialCrane || createFreshSpecialCraneState();
    if (!crane.checked && previousTimeLeft > SPECIAL_CRANE_CHECK_SECONDS && state.timeLeft <= SPECIAL_CRANE_CHECK_SECONDS) {
      crane.checked = true;
      const forcedChance =
        state.specialCraneChanceOverride === null || state.specialCraneChanceOverride === undefined
          ? Number.NaN
          : Number(state.specialCraneChanceOverride);
      const chance = Number.isFinite(forcedChance) ? Math.max(0, Math.min(1, forcedChance)) : SPECIAL_CRANE_TRIGGER_CHANCE;
      if (state.rng() < chance) {
        crane.triggered = true;
        crane.active = true;
        crane.timer = 0;
        crane.announced = true;
        spawnRunBannerEffect("上毛鶴 +3%", "#0d9488");
        playSound("special");
      }
    }
    if (crane.triggered) {
      crane.timer += dt;
      crane.active = state.timeLeft <= SPECIAL_CRANE_CHECK_SECONDS && state.timeLeft > SPECIAL_CRANE_END_SECONDS;
    }
    state.specialCrane = crane;
  }

  function updateTileAnimation(dt) {
    const ease = 1 - Math.pow(0.001, dt);
    for (const tile of state.tiles) {
      const target = tileCenter(tile.col, tile.row);
      tile.x += (target.x - tile.x) * ease;
      tile.y += (target.y - tile.y) * ease;
      if (Math.abs(tile.x - target.x) < 0.3) {
        tile.x = target.x;
      }
      if (Math.abs(tile.y - target.y) < 0.3) {
        tile.y = target.y;
      }
    }
  }

  function updateEffects(dt) {
    if (state.effects.length === 0) {
      return;
    }
    for (const effect of state.effects) {
      effect.age += dt;
      if (effect.type === "particle") {
        effect.x += effect.vx * dt;
        effect.y += effect.vy * dt;
        effect.vy += 72 * dt;
        effect.rotation += effect.spin * dt;
      }
    }
    state.effects = state.effects.filter((effect) => effect.age < effect.duration);
  }

  function fillBoard() {
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        if (!tileAt(col, row)) {
          state.tiles.push(createKanaTile(col, row, row - ROWS - 1));
        }
      }
    }
  }

  function createKanaTile(col, row, fromRow = row) {
    const entry = randomCharEntry();
    const start = tileCenter(col, fromRow);
    return {
      id: nextTileId++,
      kind: "kana",
      char: entry.char,
      cardId: entry.cardId,
      col,
      row,
      x: start.x,
      y: start.y,
    };
  }

  function applyTutorialBoard() {
    const row = TUTORIAL_ROW;
    const placements = [
      { col: 0, char: "ぐ", cardId: TUTORIAL_CARD_ID },
      { col: 1, char: "ん", cardId: TUTORIAL_CARD_ID },
      { col: 2, char: "ま", cardId: TUTORIAL_CARD_ID },
      { col: 3, char: "け", cardId: TUTORIAL_CARD_ID },
      { col: 4, char: "だ", cardId: "basic-daruma" },
      { col: 5, char: "ん", cardId: TUTORIAL_CARD_ID },
    ];

    for (const placement of placements) {
      const tile = tileAt(placement.col, row);
      if (!tile) {
        continue;
      }
      tile.kind = "kana";
      tile.char = placement.char;
      tile.cardId = placement.cardId;
      delete tile.special;
    }

    state.tutorial = {
      active: true,
      hintFrom: { col: 5, row },
      hintTo: { col: 4, row },
      elapsed: 0,
      demoAfter: TUTORIAL_DEMO_AFTER_SECONDS,
      demoDone: false,
    };
  }

  function getTutorialAvoidCells() {
    const cells = new Set();
    if (!state.tutorial.active) {
      return cells;
    }
    for (let col = 0; col < COLS; col += 1) {
      cells.add(gridKey(col, TUTORIAL_ROW));
    }
    return cells;
  }

  function completeTutorialIfHintMove(from, to) {
    if (!state.tutorial.active) {
      return;
    }
    const { hintFrom, hintTo } = state.tutorial;
    const isHintMove =
      (sameCell(from, hintFrom) && sameCell(to, hintTo)) ||
      (sameCell(from, hintTo) && sameCell(to, hintFrom));
    if (isHintMove) {
      completeTutorial();
    }
  }

  function completeTutorial() {
    if (state.tutorialComplete) {
      state.tutorial.active = false;
      state.tutorial.demoDone = true;
      return;
    }
    state.tutorialComplete = true;
    state.tutorial.active = false;
    state.tutorial.demoDone = true;
    saveState();
  }

  function updateTutorialAssist(dt) {
    if (!state.tutorial.active || state.tutorial.demoDone) {
      return;
    }
    state.tutorial.elapsed = Math.min(999, (state.tutorial.elapsed || 0) + dt);
    const demoAfter = state.tutorial.demoAfter || TUTORIAL_DEMO_AFTER_SECONDS;
    if (state.tutorial.elapsed >= demoAfter && !state.pointerActive) {
      runTutorialDemo();
    }
  }

  function runTutorialDemo() {
    if (!state.running || state.paused || !state.tutorial.active || state.tutorial.demoDone) {
      return false;
    }
    const { hintFrom, hintTo } = state.tutorial;
    const fromTile = hintFrom ? tileAt(hintFrom.col, hintFrom.row) : null;
    const toTile = hintTo ? tileAt(hintTo.col, hintTo.row) : null;
    if (!fromTile || !toTile) {
      state.tutorial.demoDone = true;
      return false;
    }
    state.tutorial.demoDone = true;
    state.pointerActive = false;
    state.dragTile = null;
    showToast("おてほん ぐんまけん！");
    slideTile(fromTile, hintTo.col - hintFrom.col, hintTo.row - hintFrom.row);
    return true;
  }

  function spawnSpecialTile(avoidCells = new Set()) {
    if (!SPECIAL_ITEMS_ENABLED || hasSpecialTile() || state.tiles.length === 0) {
      return;
    }
    const kanaTiles = state.tiles.filter((tile) => tile.kind === "kana" && !avoidCells.has(gridKey(tile.col, tile.row)));
    if (kanaTiles.length < 8) {
      return;
    }
    const tile = kanaTiles[Math.floor(state.rng() * kanaTiles.length)];
    tile.kind = "special";
    tile.special = weightedPick(DATA.specialItems, "weight", state.rng);
    delete tile.char;
    delete tile.cardId;
  }

  function hasSpecialTile() {
    return SPECIAL_ITEMS_ENABLED && state.tiles.some((tile) => tile.kind === "special");
  }

  function onPointerDown(event) {
    if (!state.running || state.paused || state.startCountdown > 0) {
      return;
    }
    event.preventDefault();
    const point = pointerPoint(event);
    const tile = pickTile(point.x, point.y);
    if (!tile) {
      return;
    }
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch (error) {
      // Synthetic or older browser pointer events may not support capture for this id.
    }
    state.pointerActive = true;
    state.pointerStart = point;
    state.dragTile = tile;
    if (selectedWord) {
      selectedWord.textContent = tile.kind === "kana" ? tile.char : tile.special.shortLabel;
    }
    if (matchHint) {
      matchHint.textContent = "スライド";
    }
  }

  function onPointerMove(event) {
    if (state.paused || state.startCountdown > 0 || !state.pointerActive || !state.dragTile) {
      return;
    }
    event.preventDefault();
    const point = pointerPoint(event);
    const dx = point.x - state.pointerStart.x;
    const dy = point.y - state.pointerStart.y;
    const threshold = board.tile * SLIDE_THRESHOLD_RATIO;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) {
      return;
    }

    const direction =
      Math.abs(dx) > Math.abs(dy)
        ? { dc: dx > 0 ? 1 : -1, dr: 0 }
        : { dc: 0, dr: dy > 0 ? 1 : -1 };
    slideTile(state.dragTile, direction.dc, direction.dr);
    cancelDrag();
  }

  function onPointerUp(event) {
    if (!state.pointerActive || !state.dragTile) {
      return;
    }
    event.preventDefault();
    try {
      canvas.releasePointerCapture(event.pointerId);
    } catch (error) {
      // Pointer capture may already be gone after cancel on some mobile browsers.
    }
    cancelDrag();
  }

  function cancelDrag() {
    state.pointerActive = false;
    state.dragTile = null;
    if (selectedWord) {
      selectedWord.textContent = "";
    }
    if (matchHint) {
      matchHint.textContent = "";
    }
  }

  function slideTile(tile, dc, dr) {
    const from = { col: tile.col, row: tile.row };
    const targetCol = tile.col + dc;
    const targetRow = tile.row + dr;
    if (!insideBoard(targetCol, targetRow)) {
      playSound("error");
      showToast("端です");
      return;
    }
    const other = tileAt(targetCol, targetRow);
    if (!other) {
      tile.col = targetCol;
      tile.row = targetRow;
    } else {
      const oldCol = tile.col;
      const oldRow = tile.row;
      tile.col = other.col;
      tile.row = other.row;
      other.col = oldCol;
      other.row = oldRow;
    }
    playSound("swap");
    completeTutorialIfHintMove(from, { col: targetCol, row: targetRow });
    queueAutoResolve(0.04);
  }

  function refreshBoard() {
    if (!state.running || state.paused || state.startCountdown > 0 || state.refreshCooldown > 0) {
      return;
    }
    state.tiles = [];
    state.effects = [];
    hideWordCall();
    state.pointerActive = false;
    state.dragTile = null;
    state.autoResolveQueued = false;
    state.autoScanTimer = 0;
    state.specialCooldown = 0;
    state.refreshCooldown = REFRESH_COOLDOWN_SECONDS;
    state.comboTimer = 0;
    state.comboCount = 0;
    state.timeLeft = Math.max(0, state.timeLeft - REFRESH_TIME_COST_SECONDS);
    fillBoard();
    state.tutorial.active = false;
    if (SPECIAL_ITEMS_ENABLED) {
      spawnSpecialTile();
    }
    logTelemetryEvent("board_refresh", { score: state.score, timeLeft: state.timeLeft, timeCost: REFRESH_TIME_COST_SECONDS });
    playSound("refresh");
    showToast("盤面リフレッシュ");
    renderAll();
  }

  function resolveAutoMatch() {
    const matches = findAutoMatches();
    if (matches.length === 0) {
      return false;
    }
    if (matches.length === 1) {
      awardMatch(matches[0].selection, matches[0].card);
    } else {
      awardMatches(matches);
    }
    return true;
  }

  function queueAutoResolve(delay = AUTO_SCAN_INTERVAL) {
    state.autoResolveQueued = true;
    state.autoScanTimer = Math.max(0, delay);
  }

  function awardMatch(selection, matchedCard, options = {}) {
    const special = findTouchingSpecial(selection);
    const wordLength = Array.from(matchedCard.readingKana).length;
    const baseScore = baseWordScore(wordLength);
    const repeatMultiplier = cardRepeatScoreMultiplier(matchedCard.id, wordLength);
    const deckProfile = evaluateDeckProfile();
    const isShortWord = wordLength <= 3;
    if (isShortWord && state.comboTimer > 0 && state.comboCount >= SHORT_COMBO_RESET_AT) {
      state.comboTimer = 0;
      state.comboCount = 0;
    }
    const comboWindow = isShortWord ? (state.calmTime > 0 ? 1.55 : 1.05) : state.calmTime > 0 ? 2.4 : 1.8;
    state.comboCount = state.comboTimer > 0 ? state.comboCount + 1 : 1;
    state.comboTimer = comboWindow;
    state.maxCombo = Math.max(state.maxCombo, state.comboCount);
    let multiplier = 1;
    if (state.scoreBoostTime > 0) {
      multiplier += state.scoreBoostMultiplier || 0.3;
    }
    const passiveBonus = passiveScoreBonusForMatch(wordLength);
    if (passiveBonus.total > 0) {
      multiplier += passiveBonus.total;
    }
    if (state.comboCount > 1) {
      multiplier += Math.min(0.5, (state.comboCount - 1) * 0.08);
    }

    let extraTiles = [];
    if (state.sauceBurstCharges > 0) {
      extraTiles = findSauceBurstTiles(selection, options.blockedExtraIds);
      state.sauceBurstCharges -= 1;
      multiplier += 0.15;
    }

    const gained = Math.round((baseScore * multiplier * repeatMultiplier + extraTiles.length * 30) * deckProfile.scoreMultiplier);
    state.score += gained;
    state.runStats.matches += 1;
    if (!state.runStats.cardClears) {
      state.runStats.cardClears = {};
    }
    state.runStats.cardClears[matchedCard.id] = runCardClearCount(matchedCard.id) + 1;
    logTelemetryEvent("word_clear", {
      word: matchedCard.displayName,
      score: gained,
      combo: state.comboCount,
      repeat: Number(repeatMultiplier.toFixed(3)),
      passiveBonus: Number(passiveBonus.total.toFixed(3)),
      passiveSkills: passiveBonus.applied.map((skill) => skill.type),
      deckDifficulty: deckProfile.label,
      deckMultiplier: Number(deckProfile.scoreMultiplier.toFixed(2)),
      special: Boolean(special),
    });
    if (state.tutorial.active && matchedCard.id === TUTORIAL_CARD_ID) {
      completeTutorial();
    }
    const dailyWordCleared = state.practiceMode ? false : markDailyWordClear(matchedCard.id);
    const dailyCompleted = state.practiceMode ? false : addDailyMissionProgress(1);
    if (gained >= state.runStats.bestWordScore) {
      state.runStats.bestWord = matchedCard.displayName;
      state.runStats.bestWordCardId = matchedCard.id;
      state.runStats.bestWordScore = gained;
      state.runStats.bestWordLength = wordLength;
    }
    const meterGain = skillMeterGainForMatch(matchedCard.id, wordLength);
    state.skillMeter = Math.min(100, state.skillMeter + meterGain);

    const clearedTiles = uniqueTiles(selection.concat(extraTiles));
    spawnClearEffects(clearedTiles, matchedCard);
    showWordCall(matchedCard, gained, state.comboCount);
    playSound(wordLength >= 5 ? "clear-big" : "clear");
    if (!options.deferBoardUpdate) {
      removeTiles(clearedTiles);
      if (special) {
        triggerSpecial(special);
      }
      collapseAndRefill();
    }
    if (dailyWordCleared) {
      playSound("coin");
      showToast(`今日のことば達成 ${matchedCard.displayName}`);
    } else if (dailyCompleted) {
      const mission = currentDailyMissionDefinition();
      addRunReward(mission.label || "デイリーミッション", mission.rewardAmount || 1);
      if (state.lastDailyStreakBonus) {
        addRunReward(`${state.dailyStreak.count}日連続`, STREAK_BONUS_AMOUNT);
      }
      playSound("coin");
      showToast(dailyRewardToast());
    } else {
      showToast(`${matchedCard.displayName}${state.comboCount > 1 ? ` x${state.comboCount}` : ""} +${formatNumber(gained)}`);
    }
    if (!options.deferBoardUpdate) {
      renderAll();
    }
    return { clearedTiles, special };
  }

  function awardMatches(matches) {
    const selectedIds = new Set(matches.flatMap((match) => match.selection.map((tile) => tile.id)));
    const clearedTiles = [];
    const clearedIds = new Set();
    const specialTiles = [];
    const specialIds = new Set();
    for (const match of matches) {
      const blockedExtraIds = new Set([...selectedIds, ...clearedIds]);
      const result = awardMatch(match.selection, match.card, { deferBoardUpdate: true, blockedExtraIds });
      for (const tile of result.clearedTiles) {
        if (!clearedIds.has(tile.id)) {
          clearedIds.add(tile.id);
          clearedTiles.push(tile);
        }
      }
      if (result.special && !specialIds.has(result.special.id)) {
        specialIds.add(result.special.id);
        specialTiles.push(result.special);
      }
    }
    removeTiles(clearedTiles);
    for (const special of specialTiles) {
      triggerSpecial(special);
    }
    collapseAndRefill();
    renderAll();
  }

  function dailyRewardToast() {
    const mission = currentDailyMissionDefinition();
    if (state.lastDailyStreakBonus) {
      return `${state.dailyStreak.count}日連続ボーナス ${currencyRewardLabel((mission.rewardAmount || 1) + STREAK_BONUS_AMOUNT)}`;
    }
    return `${mission.label || "デイリー"}達成 ${currencyRewardLabel(mission.rewardAmount || 1)}`;
  }

  function findAutoMatch() {
    return findAutoMatches()[0] || null;
  }

  function findAutoMatches() {
    const kanaTiles = state.tiles.filter((tile) => tile.kind === "kana");
    const cards = state.deckIds
      .map((id) => CARD_BY_ID.get(id))
      .filter(Boolean)
      .slice()
      .sort((a, b) => Array.from(b.readingKana).length - Array.from(a.readingKana).length);
    const matches = [];
    const usedIds = new Set();

    for (const card of cards) {
      const letters = Array.from(card.readingKana);
      while (usedIds.size < kanaTiles.length) {
        const availableTiles = kanaTiles.filter((tile) => !usedIds.has(tile.id));
        const selection = findConnectedLetterSet(availableTiles, letters);
        if (!selection) {
          break;
        }
        matches.push({ card, selection });
        for (const tile of selection) {
          usedIds.add(tile.id);
        }
      }
    }
    return matches;
  }

  function findConnectedLetterSet(kanaTiles, letters) {
    const targetCounts = countLetters(letters);
    const targetLength = letters.length;
    const validTiles = kanaTiles.filter((tile) => targetCounts.has(tile.char));

    for (const start of validTiles) {
      const counts = new Map([[start.char, 1]]);
      if (counts.get(start.char) > targetCounts.get(start.char)) {
        continue;
      }
      const result = growConnectedSet(validTiles, targetCounts, targetLength, [start], new Set([start.id]), counts);
      if (result) {
        return result;
      }
    }
    return null;
  }

  function growConnectedSet(validTiles, targetCounts, targetLength, selected, usedIds, counts) {
    if (selected.length === targetLength) {
      return selected.slice();
    }

    const candidates = [];
    for (const tile of validTiles) {
      if (usedIds.has(tile.id)) {
        continue;
      }
      const current = counts.get(tile.char) || 0;
      if (current >= targetCounts.get(tile.char)) {
        continue;
      }
      if (!selected.some((selectedTile) => areGridAdjacent(selectedTile, tile))) {
        continue;
      }
      candidates.push(tile);
    }
    candidates.sort((a, b) => nearestSelectedGridDistance(a, selected) - nearestSelectedGridDistance(b, selected));

    for (const candidate of candidates) {
      selected.push(candidate);
      usedIds.add(candidate.id);
      counts.set(candidate.char, (counts.get(candidate.char) || 0) + 1);
      const result = growConnectedSet(validTiles, targetCounts, targetLength, selected, usedIds, counts);
      if (result) {
        return result;
      }
      counts.set(candidate.char, counts.get(candidate.char) - 1);
      usedIds.delete(candidate.id);
      selected.pop();
    }
    return null;
  }

  function findTouchingSpecial(selection) {
    if (!SPECIAL_ITEMS_ENABLED) {
      return null;
    }
    const specials = state.tiles.filter((tile) => tile.kind === "special");
    return specials.find((special) => selection.some((tile) => areGridAdjacent(tile, special)));
  }

  function triggerSpecial(specialTile) {
    const item = specialTile.special;
    spawnSpecialClearEffect(specialTile);
    removeTiles([specialTile]);
    state.specialCooldown = 10;
    playSound("special");
    if (item.effect === "time_plus") {
      addRunTime(item.power);
      showToast(`+${item.power}秒`);
    }
    if (item.effect === "score_boost") {
      state.scoreBoostTime = Math.max(state.scoreBoostTime, item.duration || 8);
      state.scoreBoostMultiplier = Math.max(state.scoreBoostMultiplier || 0, item.power || 0.3);
      showToast("スコアアップ");
    }
  }

  function addRunTime(seconds) {
    const amount = Math.max(0, Number(seconds) || 0);
    state.timeLeft = Math.min(MAX_TIME_LEFT_SECONDS, state.timeLeft + amount);
  }

  function activateSkill() {
    if (!state.running || state.paused || state.startCountdown > 0) {
      return;
    }
    playSound("tap");
    spawnRunBannerEffect("デッキスキル 常時発動", "#f5b642");
    return;
    if (!state.running || state.paused || state.startCountdown > 0 || state.skillMeter < 100 || state.skillCooldown > 0) {
      return;
    }
    const cards = deckSkillCards();
    if (!cards.length) {
      return;
    }
    state.skillMeter = 0;
    state.skillCooldown = SKILL_COOLDOWN_SECONDS;
    const usedSkills = [];
    for (const deckCard of cards) {
      const deckPower = effectiveSkillPower(deckCard);
      usedSkills.push({ card: deckCard, power: deckPower });
      applyDeckSkill(deckCard, deckPower);
    }
    const pushCard = CARD_BY_ID.get(state.pushCardId);
    const pushLabel = pushCard ? `推し ${pushCard.displayName}` : "デッキ";
    showToast(`${pushLabel} / デッキスキル発動`);
    logTelemetryEvent("skill_use", {
      skills: usedSkills.map(({ card, power }) => ({ skill: card.skillId, card: card.id, power })),
      pushCardId: state.pushCardId,
    });
    playSound("skill");
    queueAutoResolve(0.04);
    renderAll();
  }

  function deckSkillCards() {
    return state.deckIds.map((id) => CARD_BY_ID.get(id)).filter(Boolean);
  }

  function buildPassiveSkills() {
    return deckSkillCards().map((card) => passiveSkillForCard(card)).filter(Boolean);
  }

  function resetPassiveSkillsForRun() {
    state.passiveSkills = buildPassiveSkills();
    state.passiveSkillCharges = {};
    for (const skill of state.passiveSkills) {
      if (skill.charges > 0) {
        state.passiveSkillCharges[skill.cardId] = skill.charges;
      }
    }
  }

  function passiveSkillForCard(card) {
    if (!card) {
      return null;
    }
    const rarity = clampInteger(card.rarityG || 1, 1, 3);
    const limitBreak = skillLimitBreak(card);
    const isPush = card.id === state.pushCardId;
    const multiplier = isPush ? PUSH_SKILL_MULTIPLIER : 1;
    const valueFromRarity = (config) =>
      Math.min(config.max, (config.baseByRarity[rarity] || config.baseByRarity[1] || 0) + limitBreak * config.perLimitBreak) * multiplier;
    if (card.skillId === "time_plus" && rarity >= PASSIVE_SKILL_BALANCE.timePlus.minimumRarity) {
      const config = PASSIVE_SKILL_BALANCE.timePlus;
      return {
        cardId: card.id,
        skillId: card.skillId,
        type: "timePlus",
        value: Math.min(config.max, config.base + limitBreak * config.perLimitBreak) * multiplier,
        isPush,
        multiplier,
        label: card.skillName || "TIME+",
      };
    }
    if (card.skillId === "letter_blessing") {
      const config = PASSIVE_SKILL_BALANCE.longWordScore;
      return {
        cardId: card.id,
        skillId: card.skillId,
        type: "longWordScore",
        value: valueFromRarity(config),
        minLength: config.minLength,
        charges: config.charges,
        isPush,
        multiplier,
        label: card.skillName || "5字+",
      };
    }
    if (card.skillId === "slow_spawn") {
      const config = PASSIVE_SKILL_BALANCE.comboScore;
      return {
        cardId: card.id,
        skillId: card.skillId,
        type: "comboScore",
        value: valueFromRarity(config),
        minCombo: config.minCombo,
        isPush,
        multiplier,
        label: card.skillName || "コンボ",
      };
    }
    if (card.skillId === "sauce_burst") {
      const config = PASSIVE_SKILL_BALANCE.shortWordScore;
      return {
        cardId: card.id,
        skillId: card.skillId,
        type: "shortWordScore",
        value: valueFromRarity(config),
        maxLength: config.maxLength,
        charges: config.charges,
        isPush,
        multiplier,
        label: card.skillName || "短い言葉",
      };
    }
    const config = PASSIVE_SKILL_BALANCE.openingScore;
    return {
      cardId: card.id,
      skillId: card.skillId,
      type: "openingScore",
      value: valueFromRarity(config),
      duration: config.duration,
      isPush,
      multiplier,
      label: card.skillName || "序盤",
    };
  }

  function passiveInitialTimeBonus() {
    const total = state.passiveSkills
      .filter((skill) => skill.type === "timePlus")
      .reduce((sum, skill) => sum + skill.value, 0);
    return Math.min(PASSIVE_SKILL_BALANCE.timePlus.deckMax, total);
  }

  function passiveScoreBonusForMatch(wordLength) {
    const applied = [];
    for (const skill of state.passiveSkills) {
      if (skill.type === "timePlus") {
        continue;
      }
      let applies = false;
      if (skill.type === "openingScore") {
        applies = state.runElapsed <= skill.duration;
      } else if (skill.type === "longWordScore") {
        const charges = state.passiveSkillCharges[skill.cardId] || 0;
        applies = wordLength >= skill.minLength && charges > 0;
        if (applies) {
          state.passiveSkillCharges[skill.cardId] = charges - 1;
        }
      } else if (skill.type === "comboScore") {
        applies = state.comboCount >= skill.minCombo;
      } else if (skill.type === "shortWordScore") {
        const charges = state.passiveSkillCharges[skill.cardId] || 0;
        applies = wordLength <= skill.maxLength && charges > 0;
        if (applies) {
          state.passiveSkillCharges[skill.cardId] = charges - 1;
        }
      }
      if (applies) {
        applied.push(skill);
      }
    }
    let total = applied.reduce((sum, skill) => sum + skill.value, 0);
    if (state.lastSpurtActive) {
      total += LAST_SPURT_SCORE_BONUS;
      applied.push({ type: "lastSpurt", value: LAST_SPURT_SCORE_BONUS, label: "ラストスパート" });
    }
    if (state.specialCrane.active) {
      total += SPECIAL_CRANE_SCORE_BONUS;
      applied.push({ type: "specialCrane", value: SPECIAL_CRANE_SCORE_BONUS, label: "上毛鶴" });
    }
    return { total, applied };
  }

  function skillLimitBreak(card) {
    if (!card) {
      return 0;
    }
    return limitBreakFromOwned(state.owned[card.id] || 0);
  }

  function limitBreakFromOwned(owned) {
    return clampInteger((Number(owned) || 0) - 1, 0, MAX_LIMIT_BREAK);
  }

  function limitBreakLabelFromOwned(owned) {
    return `${limitBreakFromOwned(owned)}凸`;
  }

  function applyDeckSkill(card, power) {
    if (card.skillId === "score_boost") {
      state.scoreBoostTime = Math.max(state.scoreBoostTime, 8);
      state.scoreBoostMultiplier = Math.max(state.scoreBoostMultiplier || 0, power);
    } else if (card.skillId === "slow_spawn") {
      state.calmTime = Math.max(state.calmTime, power);
    } else if (card.skillId === "time_plus") {
      addRunTime(power);
    } else if (card.skillId === "letter_blessing") {
      blessLetters(card, Math.max(1, Math.round(power)));
    } else if (card.skillId === "sauce_burst") {
      state.sauceBurstCharges = Math.min(3, state.sauceBurstCharges + Math.max(1, Math.round(power)));
    }
  }

  function blessLetters(card, count) {
    const letters = Array.from(card.readingKana);
    const candidates = state.tiles.filter((tile) => tile.kind === "kana");
    shuffle(candidates, state.rng);
    for (let i = 0; i < Math.min(count, candidates.length); i += 1) {
      candidates[i].char = letters[i % letters.length];
      candidates[i].cardId = card.id;
    }
  }

  function findSauceBurstTiles(selection, blockedIds = new Set()) {
    const selectedIds = new Set(selection.map((tile) => tile.id));
    const result = [];
    for (const tile of state.tiles) {
      if (tile.kind !== "kana" || selectedIds.has(tile.id) || blockedIds.has(tile.id)) {
        continue;
      }
      if (selection.some((selectedTile) => areGridAdjacent(selectedTile, tile))) {
        result.push(tile);
      }
      if (result.length >= 8) {
        break;
      }
    }
    return result;
  }

  function uniqueTiles(tiles) {
    const result = [];
    const ids = new Set();
    for (const tile of tiles) {
      if (!tile || ids.has(tile.id)) {
        continue;
      }
      ids.add(tile.id);
      result.push(tile);
    }
    return result;
  }

  function removeTiles(tiles) {
    const ids = new Set(tiles.map((tile) => tile.id));
    state.tiles = state.tiles.filter((tile) => !ids.has(tile.id));
  }

  function spawnClearEffects(tiles, card) {
    if (tiles.length === 0) {
      return;
    }
    const palette = getDeckSlotPalette(Math.max(0, state.deckIds.indexOf(card.id)));
    const durationScale = state.settings.reduceMotion ? 0.55 : 1;
    const particleLimit = state.settings.reduceMotion ? Math.min(tiles.length, 5) : Math.min(tiles.length * 2, 14);

    for (const tile of tiles) {
      const tilePalette = tile.kind === "kana" ? getTilePalette(tile.cardId) : palette;
      state.effects.push({
        type: "tile-pop",
        age: 0,
        duration: 0.34 * durationScale,
        x: tile.x,
        y: tile.y,
        size: board.tile,
        char: tile.char || "",
        palette: tilePalette,
      });
      state.effects.push({
        type: "ring",
        age: 0,
        duration: 0.42 * durationScale,
        x: tile.x,
        y: tile.y,
        size: board.tile,
        color: tilePalette[1],
      });
    }

    for (let index = 0; index < particleLimit; index += 1) {
      const source = tiles[index % tiles.length];
      const angle = (Math.PI * 2 * index) / particleLimit + state.rng() * 0.45;
      const speed = 74 + state.rng() * 62;
      state.effects.push({
        type: "particle",
        age: 0,
        duration: (0.46 + state.rng() * 0.28) * durationScale,
        x: source.x + (state.rng() - 0.5) * board.tile * 0.4,
        y: source.y + (state.rng() - 0.5) * board.tile * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 38,
        size: Math.max(5, board.tile * (0.12 + state.rng() * 0.08)),
        rotation: state.rng() * Math.PI,
        spin: (state.rng() - 0.5) * 9,
        color: index % 2 === 0 ? palette[0] : palette[1],
      });
    }

  }

  function spawnSpecialClearEffect(tile) {
    const colors = SPECIAL_COLORS[tile.special.id] || SPECIAL_COLORS.jam;
    const durationScale = state.settings.reduceMotion ? 0.62 : 1;
    state.effects.push({
      type: "score",
      age: 0,
      duration: 0.82 * durationScale,
      x: tile.x,
      y: tile.y - board.tile * 0.7,
      text: tile.special.shortLabel,
      color: colors[1],
    });
    state.effects.push({
      type: "ring",
      age: 0,
      duration: 0.52 * durationScale,
      x: tile.x,
      y: tile.y,
      size: board.tile * 1.12,
      color: colors[1],
    });
    const particleCount = state.settings.reduceMotion ? 5 : 12;
    for (let index = 0; index < particleCount; index += 1) {
      const angle = (Math.PI * 2 * index) / particleCount + state.rng() * 0.28;
      const speed = 88 + state.rng() * 82;
      state.effects.push({
        type: "particle",
        age: 0,
        duration: (0.48 + state.rng() * 0.3) * durationScale,
        x: tile.x,
        y: tile.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 44,
        size: Math.max(5, board.tile * (0.12 + state.rng() * 0.1)),
        rotation: state.rng() * Math.PI,
        spin: (state.rng() - 0.5) * 12,
        color: index % 3 === 0 ? "#fff4b8" : colors[index % 2],
      });
    }
  }

  function spawnRunBannerEffect(text, color = "#f5b642") {
    const durationScale = state.settings.reduceMotion ? 0.72 : 1;
    const laneY = effectHudLaneCenterY();
    if (laneY === null) {
      return;
    }
    state.effects.push({
      type: "score",
      lane: "hud",
      age: 0,
      duration: 1.1 * durationScale,
      x: board.originX + board.width / 2,
      y: laneY,
      text,
      color,
    });
  }

  function averageTilePoint(tiles) {
    const total = tiles.reduce(
      (point, tile) => {
        point.x += tile.x;
        point.y += tile.y;
        return point;
      },
      { x: 0, y: 0 },
    );
    return {
      x: total.x / tiles.length,
      y: total.y / tiles.length,
    };
  }

  function playSound(kind) {
    playHaptic(kind);
    if (!state.settings.sound) {
      return;
    }
    state.soundEvents.push(kind);
    if (state.soundEvents.length > 30) {
      state.soundEvents.shift();
    }

    const audio = getAudioContext();
    if (!audio) {
      return;
    }

    const now = audio.currentTime + 0.012;
    try {
      if (kind === "tap") {
        playTone(audio, 620, now, 0.055, { type: "triangle", gain: 0.035, slideTo: 780 });
      } else if (kind === "open") {
        playSequence(audio, now, [440, 660, 880], 0.045, 0.042, 0.04);
      } else if (kind === "start") {
        playSequence(audio, now, [392, 523.25, 659.25, 783.99], 0.055, 0.05, 0.055);
      } else if (kind === "swap") {
        playTone(audio, 360, now, 0.06, { type: "square", gain: 0.026, slideTo: 540 });
        playTone(audio, 720, now + 0.035, 0.05, { type: "triangle", gain: 0.022 });
      } else if (kind === "refresh") {
        playSequence(audio, now, [783.99, 587.33, 392], 0.05, 0.035, 0.04);
      } else if (kind === "clear") {
        playSequence(audio, now, [523.25, 659.25, 783.99], 0.07, 0.04, 0.05);
      } else if (kind === "clear-big") {
        playSequence(audio, now, [523.25, 659.25, 783.99, 1046.5], 0.08, 0.04, 0.058);
        playTone(audio, 1318.51, now + 0.14, 0.1, { type: "sine", gain: 0.026 });
      } else if (kind === "special") {
        playSpecialCraneMotif(audio, now);
      } else if (kind === "skill") {
        playSequence(audio, now, [659.25, 987.77, 1318.51], 0.08, 0.05, 0.045);
      } else if (kind === "coin") {
        playTone(audio, 988, now, 0.07, { type: "triangle", gain: 0.036, slideTo: 1320 });
      } else if (kind === "pack") {
        playSequence(audio, now, [392, 523.25, 659.25, 783.99, 1046.5], 0.07, 0.045, 0.05);
      } else if (kind === "equip") {
        playSequence(audio, now, [440, 660, 880], 0.055, 0.04, 0.042);
      } else if (kind === "finish") {
        playSequence(audio, now, [659.25, 493.88, 392], 0.12, 0.09, 0.045);
      } else if (kind === "error") {
        playTone(audio, 190, now, 0.09, { type: "sawtooth", gain: 0.032, slideTo: 132 });
        playTone(audio, 150, now + 0.07, 0.08, { type: "sawtooth", gain: 0.026 });
      }
    } catch (error) {
      // Audio is best-effort; gameplay must never stop if the browser blocks it.
    }
  }

  function playSpecialCraneMotif(audio, start) {
    playTone(audio, 293.66, start, 0.74, { type: "sine", gain: 0.018, slideTo: 329.63 });
    playTone(audio, 440, start + 0.02, 0.52, { type: "triangle", gain: 0.018, slideTo: 493.88 });
    playSequence(audio, start + 0.04, [659.25, 783.99, 987.77, 1174.66, 1318.51], 0.105, 0.072, 0.036);
    playSequence(audio, start + 0.34, [987.77, 1174.66, 1567.98], 0.12, 0.085, 0.026);
    playTone(audio, 1975.53, start + 0.58, 0.18, { type: "sine", gain: 0.016 });
  }

  function testSound() {
    if (!state.settings.sound) {
      showToast("サウンドがOFFです");
      playHaptic("error");
      return false;
    }
    playSound("clear-big");
    showToast("効果音を再生");
    return true;
  }

  function playHaptic(kind) {
    if (!state.settings.vibration || !navigator.vibrate) {
      return;
    }
    const patterns = {
      tap: 8,
      open: 12,
      start: [12, 24, 24],
      swap: 10,
      refresh: [12, 28, 12],
      clear: 18,
      "clear-big": [18, 28, 32],
      special: [20, 24, 20],
      skill: [24, 24, 36],
      coin: 12,
      pack: [18, 26, 18, 26, 30],
      equip: 16,
      finish: [18, 40, 18],
      error: [28, 36, 28],
    };
    try {
      navigator.vibrate(patterns[kind] || 8);
    } catch (error) {
      // Vibration support differs across WebView/browser shells.
    }
  }

  function getAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }
    if (!audioContext) {
      audioContext = new AudioContextClass();
    }
    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }
    return audioContext;
  }

  function playSequence(audio, start, notes, duration, gap, gain) {
    notes.forEach((frequency, index) => {
      playTone(audio, frequency, start + index * gap, duration, {
        type: "triangle",
        gain: gain * (1 - index * 0.05),
      });
    });
  }

  function playTone(audio, frequency, start, duration, options = {}) {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = options.type || "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    if (options.slideTo) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, options.slideTo), start + duration);
    }
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(options.gain || 0.04, start + Math.min(0.018, duration * 0.32));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function collapseAndRefill() {
    const nextTiles = [];
    for (let col = 0; col < COLS; col += 1) {
      const column = state.tiles
        .filter((tile) => tile.col === col)
        .sort((a, b) => b.row - a.row);
      let targetRow = ROWS - 1;
      for (const tile of column) {
        tile.row = targetRow;
        targetRow -= 1;
        nextTiles.push(tile);
      }
      for (let row = targetRow; row >= 0; row -= 1) {
        nextTiles.push(createKanaTile(col, row, row - (targetRow + 2)));
      }
    }
    state.tiles = nextTiles;
  }

  function openPack() {
    const pack = currentPack();
    if (isPackExchangeRequired(pack)) {
      openPackExchangeTarget({ pack, forced: true, source: "open_pack" });
      return;
    }
    const sale = packSaleStatus(pack);
    if (!sale.available) {
      playSound("error");
      showToast(sale.reason);
      renderAll();
      return;
    }
    if (state.packStone < pack.cost) {
      playSound("error");
      showToast(`${G_CURRENCY_LABEL}が足りません`);
      return;
    }
    state.packStone -= pack.cost;
    const medalGrant = Math.max(0, Number(pack.exchangeMedalGrant) || 0);
    let packMedals = getPackMedals(pack);
    if (medalGrant > 0) {
      packMedals = setPackMedals(packMedals + medalGrant, pack);
    }
    state.packDetailOpen = false;
    const entry = weightedPick(resolvePackEntries(pack), "rate", Math.random);
    if (entry.type === "choice-ticket") {
      state.choiceTickets += 1;
      state.lastPackResult = "選択チケット";
      state.lastPackReveal = {
        packId: pack.id,
        tier: "is-ticket",
        rarity: "SELECT",
        name: "選択チケット",
        meta: `好きなカードを1枚選べます${medalGrant ? ` / ${EXCHANGE_TOKEN_LABEL}+${medalGrant}` : ""}`,
        cardId: "",
      };
      logTelemetryEvent("pack_open", { packId: pack.id, result: "choice-ticket", stone: state.packStone, medals: packMedals });
      showToast("選択チケット");
    } else {
      const beforeOwned = state.owned[entry.cardId] || 0;
      const owned = addOwnedCard(entry.cardId);
      const card = CARD_BY_ID.get(entry.cardId);
      state.lastPackResult = card.displayName;
      const limitBreak = skillLimitBreak(card);
      state.lastPackReveal = {
        packId: pack.id,
        tier: `is-g${card.rarityG}`,
        rarity: rarityLabel(card),
        rarityG: card.rarityG,
        name: card.displayName,
        meta: `${beforeOwned > 0 ? `重複で${limitBreakLabelFromOwned(owned)} / ${limitBreak >= MAX_LIMIT_BREAK ? "スキル最大" : "スキル強化"}` : "新規カード獲得"}${medalGrant ? ` / ${EXCHANGE_TOKEN_LABEL}+${medalGrant}` : ""}`,
        cardId: card.id,
      };
      logTelemetryEvent("pack_open", {
        packId: pack.id,
        result: card.id,
        rarity: card.rarityG,
        duplicate: beforeOwned > 0,
        stone: state.packStone,
        medals: packMedals,
      });
      showToast(`${rarityLabel(card)} ${card.displayName}`);
    }
    state.packOpeningOpen = true;
    playSound("pack");
    saveState();
    renderAll();
    triggerPackOpeningAnimation();
  }

  function closePackOpeningModal() {
    if (!state.packOpeningOpen) {
      return;
    }
    state.packOpeningOpen = false;
    playSound("tap");
    renderAll();
  }

  function openPackAgain() {
    openPack();
  }

  function openPackRevealTarget() {
    const reveal = state.lastPackReveal;
    if (!reveal) {
      playSound("error");
      showToast("開封後に確認");
      return;
    }

    if (reveal.cardId && CARD_BY_ID.has(reveal.cardId)) {
      state.guideCardId = reveal.cardId;
    } else {
      const pack = PACK_BY_ID.get(reveal.packId) || currentPack();
      const cardEntries = packCardEntries(pack);
      const missingPackCard = cardEntries.find(({ card }) => (state.owned[card.id] || 0) <= 0)?.card;
      state.guideCardId = missingPackCard?.id || cardEntries[0]?.card.id || state.deckIds[state.selectedDeckSlot] || state.pushCardId;
    }

    state.collectionFilterId = "all";
    state.collectionLengthFilterId = "all";
    state.packOpeningOpen = false;
    logTelemetryEvent("pack_reveal_detail", {
      cardId: reveal.cardId || "",
      result: reveal.name || "",
    });
    playSound("tap");
    showScreen("deck");
  }

  function addOwnedCard(cardId) {
    state.owned[cardId] = Math.min(MAX_OWNED_COPIES, (state.owned[cardId] || 0) + 1);
    return state.owned[cardId];
  }

  function exchangeCardWithMedals(card, pack = packForCard(card) || currentPack()) {
    const cost = packExchangeCost(pack);
    const nextMedals = setPackMedals(getPackMedals(pack) - cost, pack);
    const beforeOwned = state.owned[card.id] || 0;
    const owned = addOwnedCard(card.id);
    logTelemetryEvent("pack_medal_exchange", {
      packId: pack.id,
      cardId: card.id,
      medals: nextMedals,
      duplicate: beforeOwned > 0,
      limitBreak: limitBreakFromOwned(owned),
    });
    return { beforeOwned, owned, medals: nextMedals };
  }

  function exchangeOwnedCardWithMedals(card, pack = packForCard(card) || currentPack()) {
    if (!canExchangeCardWithMedals(card, pack)) {
      playSound("error");
      if ((state.owned[card.id] || 0) >= MAX_OWNED_COPIES) {
        showToast(`${card.displayName}は10凸済み`);
      } else {
        showToast(`${EXCHANGE_TOKEN_LABEL} ${getPackMedals(pack)}/${packExchangeCost(pack)}`);
      }
      return false;
    }
    const result = exchangeCardWithMedals(card, pack);
    state.exchangePackId = "";
    state.guideCardId = card.id;
    state.collectionFilterId = "all";
    state.collectionLengthFilterId = "all";
    playSound("coin");
    showToast(`${card.displayName} 交換で${limitBreakLabelFromOwned(result.owned)}`);
    saveState();
    renderAll();
    return true;
  }

  function addPackStone(amount, label, eventType = "test_pack_stone_add", eventData = {}) {
    state.packStone += amount;
    logTelemetryEvent(eventType, { amount, stone: state.packStone, ...eventData });
    playSound("coin");
    showToast(label);
    saveState();
    renderAll();
  }

  function onPurchaseBundleClick(event) {
    const button = event.target.closest("[data-purchase-bundle]");
    if (!button || !purchaseBundleGrid?.contains(button)) {
      return;
    }
    buyGBundle(button.dataset.purchaseBundle);
  }

  function buyGBundle(bundleId) {
    const bundle = G_PURCHASE_BUNDLES.find((item) => item.id === bundleId);
    if (!bundle) {
      playSound("error");
      showToast("商品不明");
      return false;
    }
    if (!G_SHOP_PURCHASES_ENABLED) {
      playSound("error");
      showToast("公開版では購入なし");
      return false;
    }
    addPackStone(bundle.amount, `${currencyRewardLabel(bundle.amount)} 購入テスト`, "g_purchase_mock", {
      bundleId: bundle.id,
      bonus: bundle.bonus,
      priceLabel: bundle.priceLabel,
    });
    return true;
  }

  function selectPack(packId) {
    if (!PACK_BY_ID.has(packId)) {
      return;
    }
    state.selectedPackId = packId;
    state.packMedals = getPackMedals(currentPack());
    state.packDetailOpen = false;
    playSound("tap");
    saveState();
    renderAll();
  }

  function openPackDetail() {
    state.packDetailOpen = true;
    playSound("tap");
    renderAll();
  }

  function closePackDetail() {
    state.packDetailOpen = false;
    playSound("tap");
    renderAll();
  }

  function defaultReplaceSlotIndex() {
    return Math.min(Math.max(0, state.deckIds.length - 1), DEFAULT_REPLACE_SLOT_INDEX);
  }

  function collectionReplaceSlotIndex() {
    return clampInteger(state.selectedDeckSlot, 0, Math.max(0, state.deckIds.length - 1));
  }

  function normalizePushCardPlacement(options = {}) {
    if (!state.deckIds.length) {
      state.selectedDeckSlot = 0;
      return 0;
    }
    const previousSelectedSlot = clampInteger(state.selectedDeckSlot, 0, Math.max(0, state.deckIds.length - 1));
    if (!state.deckIds.includes(state.pushCardId)) {
      state.pushCardId = state.deckIds[previousSelectedSlot] || state.deckIds[0];
    }
    const pushSlot = state.deckIds.indexOf(state.pushCardId);
    if (options.selectPush) {
      state.selectedDeckSlot = pushSlot;
      return pushSlot;
    }
    state.selectedDeckSlot = previousSelectedSlot;
    return pushSlot;
  }

  function selectDeckSlot(index) {
    if (state.running) {
      playSound("error");
      showToast("プレイ中は固定");
      return;
    }
    const cardId = state.deckIds[index];
    if (!cardId) {
      return;
    }
    const nextSlot = clampInteger(index, 0, Math.max(0, state.deckIds.length - 1));
    state.selectedDeckSlot = nextSlot;
    state.guideCardId = cardId;
    playSound("tap");
    saveState();
    renderAll();
  }

  function setPushCard(cardId) {
    if (state.running) {
      playSound("error");
      showToast("プレイ中は固定");
      return;
    }
    if (!state.deckIds.includes(cardId)) {
      playSound("error");
      showToast("デッキ外カード");
      return;
    }
    const previousSelectedSlot = collectionReplaceSlotIndex();
    state.pushCardId = cardId;
    normalizePushCardPlacement();
    state.selectedDeckSlot = previousSelectedSlot;
    state.guideCardId = cardId;
    state.charPool = buildCharPool();
    playSound("tap");
    saveState();
    renderAll();
  }

  function tryPutCardInDeck(cardId) {
    if (state.running) {
      playSound("error");
      showToast("プレイ中は固定");
      return;
    }
    const card = CARD_BY_ID.get(cardId);
    if (!card) {
      playSound("error");
      showToast("カード不明");
      return;
    }
    const sourcePack = packForCard(card) || currentPack();
    if (isActivePackExchangeForCard(card) && (state.owned[card.id] || 0) > 0) {
      exchangeOwnedCardWithMedals(card, sourcePack);
      return;
    }
    const targetSlot = collectionReplaceSlotIndex();
    const existingIndex = state.deckIds.indexOf(cardId);
    const duplicateIndex = state.deckIds.findIndex((id) => CARD_BY_ID.get(id)?.nameKey === card.nameKey);
    if (duplicateIndex !== -1 && duplicateIndex !== existingIndex && duplicateIndex !== targetSlot) {
      playSound("error");
      showToast("同名カードは1枚");
      renderAll();
      return;
    }
    if (existingIndex !== -1) {
      state.guideCardId = cardId;
      playSound("tap");
      showToast(`${card.displayName}はデッキ入り。推しは詳細から`);
      renderAll();
      return;
    }
    let acquiredMode = "";
    if ((state.owned[cardId] || 0) <= 0) {
      if (state.choiceTickets > 0 && card.seasonId === sourcePack.seasonId) {
        state.choiceTickets -= 1;
        addOwnedCard(cardId);
        acquiredMode = "選択";
        playSound("coin");
      } else if (canExchangeCardWithMedals(card)) {
        exchangeCardWithMedals(card, sourcePack);
        acquiredMode = "交換";
        playSound("coin");
      } else {
        playSound("error");
        showToast(`${EXCHANGE_TOKEN_LABEL} ${getPackMedals(sourcePack)}/${packExchangeCost(sourcePack)}`);
        return;
      }
    }

    const replacedCardId = state.deckIds[targetSlot];
    const targetWasPush = state.pushCardId === replacedCardId;
    state.deckIds[targetSlot] = cardId;
    if (targetWasPush || !state.deckIds.includes(state.pushCardId)) {
      state.pushCardId = cardId;
    }
    normalizePushCardPlacement();
    state.selectedDeckSlot = targetSlot;
    state.guideCardId = cardId;
    if (acquiredMode) {
      state.exchangePackId = "";
      state.collectionFilterId = "all";
      state.collectionLengthFilterId = "all";
    }
    state.charPool = buildCharPool();
    playSound("equip");
    const pushSuffix = targetWasPush ? " / 推し継承" : "";
    showToast(
      acquiredMode
        ? `${card.displayName} ${acquiredMode}して${formatDeckSlotActionLabel(targetSlot)}へ${pushSuffix}`
        : `${card.displayName} ${formatDeckSlotActionLabel(targetSlot)}へ${pushSuffix}`,
    );
    saveState();
    renderAll();
  }

  function onWordGuideActionClick() {
    const card = CARD_BY_ID.get(state.guideCardId);
    if (!card) {
      playSound("error");
      showToast("カード不明");
      return;
    }
    if (state.running) {
      playSound("error");
      showToast("プレイ中は固定");
      return;
    }
    if (isActivePackExchangeForCard(card) && (state.owned[card.id] || 0) > 0) {
      exchangeOwnedCardWithMedals(card, packForCard(card) || currentPack());
      return;
    }
    const deckIndex = state.deckIds.indexOf(card.id);
    if (deckIndex >= 0) {
      if (state.pushCardId === card.id) {
        playSound("error");
        showToast("推し設定中");
        return;
      }
      setPushCard(card.id);
      return;
    }
    if ((state.owned[card.id] || 0) > 0 || canUseChoiceTicketForCard(card) || canExchangeCardWithMedals(card)) {
      tryPutCardInDeck(card.id);
      return;
    }
    playSound("error");
    showToast("パックで入手");
  }

  function openPackExchangeTarget(options = {}) {
    const pack = options.pack || currentPack();
    const forced = options.forced === true;
    const cost = packExchangeCost(pack);
    const medals = getPackMedals(pack);
    const exchangeableEntry = packExchangeableEntries(pack)[0];
    if (!exchangeableEntry) {
      playSound("error");
      showToast("交換できるカードがありません");
      return;
    }
    if (medals < cost) {
      playSound("error");
      showToast(`${EXCHANGE_TOKEN_LABEL} ${medals}/${cost}`);
      return;
    }
    state.guideCardId = exchangeableEntry.card.id;
    state.exchangePackId = pack.id;
    state.collectionFilterId = "all";
    state.collectionLengthFilterId = "all";
    state.packDetailOpen = false;
    state.packOpeningOpen = false;
    playSound("tap");
    logTelemetryEvent("pack_exchange_open", { packId: pack.id, cardId: exchangeableEntry.card.id, medals, forced });
    showScreen("deck");
    if (forced) {
      showToast(`${EXCHANGE_TOKEN_LABEL} ${cost}/${cost} 先に交換してください`);
      return;
    }
    showToast(`${EXCHANGE_TOKEN_LABEL}で交換カードを選択`);
  }

  function updateHud() {
    refreshDailyMission();
    refreshDailyScoreTarget();
    refreshWeeklyChallenge();
    refreshDailyGift();
    refreshDailyWord();
    const staminaCountdown = formatStaminaCountdown();
    const dailyMission = currentDailyMissionDefinition();
    const weeklyMission = currentWeeklyMissionDefinition();
    const dailyTarget = Math.max(1, dailyMission.target);
    const dailyProgress = Math.min(dailyTarget, state.dailyMission.progress);
    const scoreTarget = Math.max(1, DAILY_SCORE_TARGET.targetScore || 5000);
    const scoreProgress = Math.min(scoreTarget, state.dailyScoreTarget.bestScore);
    const weeklyTarget = Math.max(1, weeklyMission.target);
    const weeklyProgress = Math.min(weeklyTarget, state.weeklyChallenge.progress);
    const streakCount = visibleDailyStreakCount();
    const streakRest = STREAK_BONUS_EVERY - (streakCount % STREAK_BONUS_EVERY || STREAK_BONUS_EVERY);
    const firstSession = !state.tutorialComplete;
    const warmupSession = !firstSession && state.completedRuns < WARMUP_RUNS;
    const hasCompletedRun = !firstSession && state.completedRuns > 0;
    const missionsUnlocked = !firstSession && state.completedRuns >= WARMUP_RUNS;
    const warmupRemaining = Math.max(1, WARMUP_RUNS - state.completedRuns);
    phone.classList.toggle("is-first-session", firstSession);
    phone.classList.toggle("is-warmup-session", warmupSession);
    phone.classList.toggle("is-last-spurt", state.running && state.lastSpurtActive);
    firstPlayPanel.hidden = !firstSession;
    renderResetSaveControls();
    renderMissionDailyWord(!hasCompletedRun);
    renderDailyGift(!hasCompletedRun);
    renderDailyGiftModal();
    renderHomeLastResult(firstSession);
    renderHomeStaminaEmpty(firstSession, staminaCountdown);
    dailyPanel.hidden = !missionsUnlocked;
    scoreGoalPanel.hidden = !missionsUnlocked;
    weeklyChallengePanel.hidden = !missionsUnlocked;
    if (missionsLockedPanel) {
      missionsLockedPanel.hidden = missionsUnlocked;
    }
    dailyPanel.classList.toggle("is-claimed", missionsUnlocked && state.dailyMission.claimed);
    scoreGoalPanel.classList.toggle("is-claimed", missionsUnlocked && state.dailyScoreTarget.claimed);
    weeklyChallengePanel.classList.toggle("is-claimed", missionsUnlocked && state.weeklyChallenge.claimed);
    timeText.textContent = state.timeLeft.toFixed(1);
    scoreText.textContent = formatNumber(state.score);
    skillGauge.style.width = state.running ? "100%" : "0%";
    const countdownVisible = state.running && state.startCountdown > 0 && finishCard.hidden;
    startButton.disabled = state.running;
    startButtonText.textContent = state.running
      ? state.practiceMode
        ? "練習中"
        : "PLAY"
      : state.stamina >= STAMINA_COST
        ? `スタミナ-${STAMINA_COST}`
        : "練習";
    startButton.hidden = state.running || !finishCard.hidden;
    startButtonText.textContent = state.stamina >= STAMINA_COST ? `スタミナ-${STAMINA_COST}` : "練習";
    startButtonText.textContent = state.stamina >= STAMINA_COST ? `PLAY(スタミナ-${STAMINA_COST})` : "練習";
    startButton.setAttribute("aria-label", startButtonText.textContent);
    if (stageCountdown) {
      stageCountdown.hidden = !countdownVisible;
      const countdownLabel = stageCountdown.querySelector("span");
      if (countdownLabel) {
        countdownLabel.textContent = state.startCountdown <= RUN_COUNTDOWN_SECONDS * 0.18 ? "GO" : "READY";
      }
      stageCountdownText.textContent =
        state.startCountdown <= RUN_COUNTDOWN_SECONDS * 0.18
          ? "GO"
          : Math.max(1, Math.ceil((state.startCountdown / RUN_COUNTDOWN_SECONDS) * 3)).toString();
    }
    finishRestart.disabled = state.running;
    const finishRestartLabel = finishRestart.querySelector("strong");
    if (finishRestartLabel) {
      finishRestartLabel.textContent = state.stamina >= STAMINA_COST ? "もう1回" : "練習する";
    }
    pauseButton.disabled = !state.running || state.startCountdown > 0 || !finishCard.hidden;
    pauseButton.textContent = state.paused ? "▶" : "Ⅱ";
    pauseButton.setAttribute("aria-label", state.paused ? "再開" : "一時停止");
    pauseCard.hidden = !state.running || !state.paused || !finishCard.hidden;
    pauseReasonText.textContent =
      state.pauseReason === "hidden"
        ? "アプリ復帰後に続きから再開できます"
        : state.pauseReason === "screen"
          ? "ゲーム画面に戻って続けられます"
          : "続きから再開できます";
    refreshButton.disabled = !state.running || state.paused || state.refreshCooldown > 0;
    refreshButton.textContent = state.refreshCooldown > 0 ? Math.ceil(state.refreshCooldown).toString() : "↻";
    skillButton.disabled = !state.running || state.paused || state.startCountdown > 0;
    refreshButton.disabled = !state.running || state.paused || state.startCountdown > 0 || state.refreshCooldown > 0;
    const passiveSkills = state.running ? state.passiveSkills : buildPassiveSkills();
    const leadPassive = passiveSkills[0];
    const leadCard = CARD_BY_ID.get(leadPassive?.cardId) || CARD_BY_ID.get(state.pushCardId);
    const leadPalette = leadCard ? getTilePalette(leadCard.id) : ["#ef5d50", "#f5b642"];
    skillButton.style.setProperty("--skill-a", leadPalette[0]);
    skillButton.style.setProperty("--skill-b", leadPalette[1]);
    skillButton.classList.toggle("is-ready", state.running);
    skillButton.classList.toggle("has-art", Boolean(leadCard?.artImage));
    skillButton.setAttribute("aria-label", `デッキスキル ${passiveSkills.length}種 ${passiveSkillHudText(passiveSkills)}`);
    if (leadCard?.artImage) {
      skillIcon.style.backgroundImage = `linear-gradient(180deg, rgba(255,255,255,0.08), rgba(18,24,34,0.28)), url("${leadCard.artImage}")`;
    } else {
      skillIcon.style.backgroundImage = "";
    }
    skillText.textContent = passiveSkillHudText(passiveSkills);
    const deckSkillCount = passiveSkills.length;
    const skillBoostLabel = skillButton.querySelector(".skill-boost-label");
    if (skillBoostLabel) {
      skillBoostLabel.textContent = state.lastSpurtActive ? "ラストスパート" : state.specialCrane.active ? "特別ゲーム" : "常時発動";
    }
    skillIcon.textContent = "常";
    const pushCard = CARD_BY_ID.get(state.pushCardId);
    menuPushName.textContent = pushCard ? `推し ${pushCard.displayName}` : "推し";
    if (menuBestText) {
      menuBestText.textContent = `BEST ${formatNumber(state.bestScore)}`;
    }
    menuDailyTitle.textContent = warmupSession ? "日課はあとでOK" : state.dailyMission.claimed ? `${dailyMission.label} 達成` : dailyMission.label;
    menuDailyProgress.textContent = formatMissionProgress(dailyProgress, dailyTarget, dailyMission);
    menuDailyReward.innerHTML = warmupSession
      ? `あと${warmupRemaining}プレイで通常表示`
      : state.dailyMission.claimed
        ? `今日の${currencyRewardLabel(dailyMission.rewardAmount || 1)} 受取済み`
        : `達成で${currencyRewardLabel(dailyMission.rewardAmount || 1)}`;
    menuDailyReward.innerHTML = withCurrencyIconText(menuDailyReward.innerHTML);
    menuStreakText.textContent =
      state.dailyMission.claimed && streakCount > 0 && streakRest === 0
        ? `連続${streakCount}日 ボーナス済`
        : `連続${streakCount}日 あと${streakRest || STREAK_BONUS_EVERY}日`;
    menuDailyBar.style.width = `${Math.round((dailyProgress / dailyTarget) * 100)}%`;
    menuScoreGoalTitle.textContent = warmupSession ? "まずは1語クリア" : state.dailyScoreTarget.claimed ? "今日のスコア目標 達成" : "今日のスコア目標";
    menuScoreGoalProgress.textContent = `${formatNumber(scoreProgress)} / ${formatNumber(scoreTarget)}`;
    menuScoreGoalReward.innerHTML = warmupSession
      ? "スコア目標はあとで"
      : state.dailyScoreTarget.claimed
        ? `今日の${currencyRewardLabel(DAILY_SCORE_TARGET.rewardAmount)} 受取済み`
        : `達成で${currencyRewardLabel(DAILY_SCORE_TARGET.rewardAmount)}`;
    menuScoreGoalReward.innerHTML = withCurrencyIconText(menuScoreGoalReward.innerHTML);
    menuScoreGoalBar.style.width = `${Math.round((scoreProgress / scoreTarget) * 100)}%`;
    menuWeeklyTitle.textContent = state.weeklyChallenge.claimed ? `${weeklyMission.label || "週替わりチャレンジ"} 達成` : weeklyMission.label || "週替わりチャレンジ";
    menuWeeklyProgress.textContent = formatMissionProgress(weeklyProgress, weeklyTarget, weeklyMission);
    menuWeeklyReward.innerHTML = state.weeklyChallenge.claimed
      ? `今週の${currencyRewardLabel(weeklyMission.rewardAmount || 1)} 受取済み`
      : `達成で${currencyRewardLabel(weeklyMission.rewardAmount || 1)}`;
    menuWeeklyReward.innerHTML = withCurrencyIconText(menuWeeklyReward.innerHTML);
    menuWeeklyNote.textContent = weeklyMission.note || "今週のチャレンジに挑戦";
    menuWeeklyBar.style.width = `${Math.round((weeklyProgress / weeklyTarget) * 100)}%`;
    if (menuPlayerName) {
      menuPlayerName.textContent = playerDisplayName();
    }
    const playerProgress = playerRankProgress();
    if (menuPlayerRank) {
      menuPlayerRank.textContent = `ランク ${playerProgress.rank}`;
    }
    if (menuPlayerXpText) {
      menuPlayerXpText.textContent = `EXP ${formatNumber(playerProgress.currentXp)}/${formatNumber(playerProgress.nextXp)}`;
    }
    if (menuPlayerXpBar) {
      menuPlayerXpBar.style.width = `${playerProgress.percent}%`;
    }
    if (menuPlayerTitle) {
      const titleStatus = playerTitleStatus(ACTIVE_RANKING_STAGE_ID);
      menuPlayerTitle.textContent = titleStatus.title;
      menuPlayerTitle.classList.toggle("is-limited", titleStatus.limited);
    }
    menuStaminaText.textContent = `スタミナ ${state.stamina}/${STAMINA_MAX}`;
    renderStaminaPips();
    if (staminaAdButton) {
      staminaAdButton.disabled = state.running || state.stamina >= STAMINA_MAX;
      staminaAdButton.querySelector("strong").textContent = state.stamina >= STAMINA_MAX ? "満タン" : "+1";
    }
    if (staminaGRecoverButton) {
      const canRecoverWithG = !state.running && state.stamina < STAMINA_MAX && state.packStone >= G_STAMINA_FULL_RECOVERY_COST;
      staminaGRecoverButton.disabled = !canRecoverWithG;
      staminaGRecoverButton.querySelector("span").innerHTML = currencyAmountMarkup(G_STAMINA_FULL_RECOVERY_COST, { compact: true });
      staminaGRecoverButton.querySelector("strong").textContent = canRecoverWithG ? "全回復" : state.packStone < G_STAMINA_FULL_RECOVERY_COST ? "だるま不足" : "満タン";
    }
    menuStoneText.innerHTML = currencyAmountMarkup(state.packStone);
    menuStoneText.setAttribute("aria-label", `${G_CURRENCY_LABEL} ${formatNumber(state.packStone)}`);
    menuStoneText.title = `${G_CURRENCY_LABEL}ショップ`;
    const tutorialVisible =
      state.running &&
      state.currentScreen === "game" &&
      state.tutorial.active &&
      !state.paused &&
      finishCard.hidden;
    tutorialCoach.hidden = !tutorialVisible;
    if (tutorialVisible) {
      const demoAfter = state.tutorial.demoAfter || TUTORIAL_DEMO_AFTER_SECONDS;
      const rest = Math.max(0, Math.ceil(demoAfter - (state.tutorial.elapsed || 0)));
      tutorialCoachText.textContent = "光る2枚をスライド";
      tutorialCoachSubtext.textContent = rest > 0 ? `ぐんまけん完成 / お手本 ${rest}` : "お手本で完成";
    }
    soundToggle.checked = state.settings.sound;
    vibrationToggle.checked = state.settings.vibration;
    motionToggle.checked = state.settings.reduceMotion;
    largeTextToggle.checked = state.settings.largeText;
    contrastToggle.checked = state.settings.highContrast;
    tileMarkToggle.checked = state.settings.tileMarks;
    buildVersionText.textContent = `v${BUILD_INFO.versionName} (${BUILD_INFO.buildId})`;
    buildChannelText.textContent = `${BUILD_INFO.channel} / code ${BUILD_INFO.versionCode}${BUILD_INFO.builtAt ? ` / ${BUILD_INFO.builtAt}` : ""}`;
  }

  function renderDailyGift(hiddenByPacing = false) {
    if (!dailyGiftPanel) {
      return;
    }
    const rewardAmount = DAILY_GIFT.rewardAmount || 1;
    const claimed = state.dailyGift.claimed === true;
    dailyGiftPanel.hidden = true;
    dailyGiftPanel.classList.toggle("is-claimed", claimed);
    menuDailyGiftTitle.textContent = claimed ? `${DAILY_GIFT.label || "今日の差し入れ"} 受取済み` : DAILY_GIFT.label || "今日の差し入れ";
    menuDailyGiftReward.innerHTML = claimed ? "また明日" : currencyRewardMarkup(rewardAmount);
    menuDailyGiftNote.textContent = claimed ? "明日また受け取れます" : DAILY_GIFT.note || `毎日1回、無料で${G_CURRENCY_LABEL}を受け取れます`;
    dailyGiftButton.disabled = claimed || state.running;
    dailyGiftButton.querySelector("span").textContent = claimed ? "済" : "受取";
    dailyGiftButton.querySelector("strong").textContent = claimed ? "OK" : "CLAIM";
  }

  function renderDailyGiftModal() {
    if (!dailyGiftModal) {
      return;
    }
    refreshDailyGift();
    const dateKey = todayDateKey();
    const claimed = state.dailyGift.claimed === true;
    const shouldShow =
      state.currentScreen === "menu" &&
      !state.running &&
      state.tutorialComplete &&
      state.completedRuns > 0 &&
      dailyGiftModalEligibleThisSession &&
      !claimed &&
      dailyGiftModalDismissedDate !== dateKey;
    dailyGiftModal.hidden = !shouldShow;
    if (!shouldShow) {
      return;
    }
    dailyGiftModalTitle.textContent = DAILY_GIFT.label || "今日の差し入れ";
    dailyGiftModalNote.textContent = DAILY_GIFT.note || `毎日1回、無料で${G_CURRENCY_LABEL}を受け取れます`;
    dailyGiftModalReward.innerHTML = `${G_DARUMA_ICON_MARKUP}<span>${G_CURRENCY_LABEL}</span><b>+${formatNumber(DAILY_GIFT.rewardAmount || 1)}</b>`;
    dailyGiftModalClaim.disabled = false;
  }

  function renderHomeLastResult(firstSession = false) {
    if (!lastResultPanel) {
      return;
    }
    const result = state.lastResult ? sanitizeLastResult(state.lastResult) : null;
    const hidden = firstSession || !result;
    lastResultPanel.hidden = hidden;
    if (hidden) {
      return;
    }
    menuLastResultScore.textContent = result.practice ? "練習" : `${formatNumber(result.score)}点`;
    menuLastResultWord.textContent = result.bestWord ? `見どころ ${result.bestWord}` : "見どころ -";
    lastResultPanel.classList.toggle("is-practice", result.practice);
    lastResultPanel.classList.toggle("is-new-best", result.newBest);
  }

  function renderHomeStaminaEmpty(firstSession = false, staminaCountdown = formatStaminaCountdown()) {
    const hidden = firstSession || state.stamina >= STAMINA_COST;
    staminaEmptyPanel.hidden = hidden;
    if (hidden) {
      return;
    }
    menuStaminaEmptyTimer.textContent = `回復まで ${staminaCountdown}`;
    menuStaminaEmptyNote.textContent = "練習は報酬なし / 本番はスタミナ1消費";
  }

  function renderStaminaPips() {
    if (!menuStaminaPips) {
      return;
    }
    menuStaminaPips.innerHTML = "";
    for (let index = 0; index < STAMINA_MAX; index += 1) {
      const pip = document.createElement("span");
      pip.className = index < state.stamina ? "stamina-pip" : "stamina-pip is-empty";
      menuStaminaPips.appendChild(pip);
    }
  }

  function renderMissionDailyWord(hiddenByPacing = false) {
    if (!dailyWordPanel) {
      return;
    }
    const hidden = hiddenByPacing;
    dailyWordPanel.hidden = hidden;
    if (hidden) {
      return;
    }

    const card = dailyWordCard();
    if (!card) {
      dailyWordPanel.hidden = true;
      return;
    }

    const slotIndex = dailyWordSlotIndex();
    const preset = slotIndex >= 0 ? getDeckSlotColor(slotIndex) : null;
    const palette = preset?.colors || getCardPalette(card.id);
    dailyWordPanel.style.setProperty("--daily-word-a", palette[0]);
    dailyWordPanel.style.setProperty("--daily-word-b", palette[1]);
    dailyWordPanel.style.setProperty("--daily-word-ring", preset?.ring || "rgba(13, 148, 136, 0.34)");
    menuDailyWordTitle.textContent = "今日のことば";
    menuDailyWordName.textContent = card.displayName;
    menuDailyWordNote.textContent = card.learnNote || "ことばメモ準備中";
    menuDailyWordPrompt.textContent = `かな ${Array.from(card.readingKana).join("・")} / ${kanaLength(card.readingKana)}字 / ${formatNumber(baseWordScore(kanaLength(card.readingKana)))}点`;
    dailyWordGuideButton.querySelector("span").textContent = "メモ";
  }

  function renderAll() {
    updateHud();
    renderSeasonRanking();
    renderDeck();
    renderMenuDeck();
    renderGameDeckLegend();
    renderPack();
    renderPurchase();
    renderFeedbackInsights();
  }

  function renderPurchase() {
    if (!purchaseBalanceText || !purchaseBundleGrid || !purchaseRecoverButton || !purchaseStaminaText || !purchaseStaminaNote) {
      return;
    }
    const cost = G_STAMINA_FULL_RECOVERY_COST;
    purchaseBalanceText.innerHTML = currencyAmountMarkup(state.packStone);
    purchaseStaminaText.textContent = `スタミナ ${state.stamina}/${STAMINA_MAX}`;
    purchaseStaminaNote.textContent =
      state.stamina >= STAMINA_MAX
        ? "スタミナ満タン"
        : state.packStone >= cost
          ? `${currencyAmountLabel(cost, { compact: true })}で全回復できます`
          : `${currencyAmountLabel(cost, { compact: true })}で全回復 / だるま不足`;
    purchaseStaminaNote.innerHTML = withCurrencyIconText(purchaseStaminaNote.textContent);
    purchaseRecoverButton.disabled = state.running || state.stamina >= STAMINA_MAX || state.packStone < cost;
    purchaseRecoverButton.querySelector("span").innerHTML = currencyAmountMarkup(cost, { compact: true });
    purchaseRecoverButton.querySelector("strong").textContent = state.stamina >= STAMINA_MAX ? "満タン" : "全回復";
    if (purchaseLegalNote) {
      purchaseLegalNote.textContent = G_SHOP_PURCHASES_ENABLED ? `ボーナスつきセットもあります` : "公開レビュー版は購入なしで遊べます";
    }
    purchaseBundleGrid.innerHTML = "";
    for (const bundle of G_PURCHASE_BUNDLES) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "purchase-bundle-card";
      button.dataset.purchaseBundle = bundle.id;
      button.disabled = !G_SHOP_PURCHASES_ENABLED;
      const paidAmount = Math.max(0, bundle.amount - bundle.bonus);
      button.innerHTML = `
        <strong>${currencyAmountMarkup(bundle.amount, { compact: true })}</strong>
        <small>${bundle.bonus > 0 ? `基本${formatNumber(paidAmount)} + ボーナス${formatNumber(bundle.bonus)}` : "基本セット"}</small>
        <em>${G_SHOP_PURCHASES_ENABLED ? bundle.priceLabel : "公開版なし"}</em>
      `;
      purchaseBundleGrid.appendChild(button);
    }
  }

  function setRankingView(view) {
    const nextView = ["daily", "season"].includes(view) ? view : "season";
    if (selectedRankingView === nextView) {
      return;
    }
    selectedRankingView = nextView;
    renderRankingTabs();
    if (state.currentScreen === "ranking" && nextView === "season" && selectedSeasonRecordView === "current") {
      syncRanking({ reason: "ranking_tab", stageId: selectedRankingStageId });
    }
    playSound("tap");
  }

  function renderRankingTabs() {
    const activeView = ["daily", "season"].includes(selectedRankingView) ? selectedRankingView : "season";
    selectedRankingView = activeView;
    for (const button of rankingMainTabButtons) {
      const active = button.dataset.rankingView === activeView;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
      button.tabIndex = active ? 0 : -1;
    }
    for (const panel of rankingTabPanels) {
      const active = panel.dataset.rankingPanel === activeView;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    }
  }

  function setSeasonRecordView(view) {
    const nextView = view === "history" ? "history" : "current";
    if (selectedSeasonRecordView === nextView) {
      return;
    }
    selectedSeasonRecordView = nextView;
    renderSeasonRanking();
    if (state.currentScreen === "ranking" && selectedRankingView === "season" && nextView === "current") {
      syncRanking({ reason: "season_record_tab", stageId: selectedRankingStageId });
    }
    playSound("tap");
  }

  function renderSeasonRecordTabs() {
    const activeView = selectedSeasonRecordView === "history" ? "history" : "current";
    selectedSeasonRecordView = activeView;
    for (const button of seasonRecordTabButtons) {
      const active = button.dataset.seasonRecordView === activeView;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    }
    if (seasonCurrentPanel) {
      seasonCurrentPanel.hidden = activeView !== "current";
    }
    if (seasonHistoryPanel) {
      seasonHistoryPanel.hidden = activeView !== "history";
    }
    rankingSeasonPanel?.classList.toggle("is-history-view", activeView === "history");
  }

  function setDailyRankingView(view) {
    selectedDailyRankingView = view === "yesterday" ? "yesterday" : "today";
    renderDailyRanking();
    playSound("tap");
  }

  function renderDailyRanking() {
    if (!dailyRankingList) {
      return;
    }
    claimYesterdayDailyRankingReward({ silent: true });
    const dateKey = dailyRankingViewDateKey();
    const own = ownDailyRank(dateKey);
    const isYesterday = selectedDailyRankingView === "yesterday";
    const yesterdayKey = previousDateKey(todayDateKey());
    const yesterdayOwn = ownDailyRank(yesterdayKey);
    const yesterdayClaim = state.dailyRanking?.rewardClaims?.[yesterdayKey] || null;
    if (dailyRankingTitle) {
      dailyRankingTitle.textContent = DAILY_RANKING.label || "デイリーランキング";
    }
    if (dailyRankingDate) {
      dailyRankingDate.textContent = `${dailyRankingDateLabel(dateKey)}のベストスコア`;
    }
    if (dailyRankingOwnRank) {
      dailyRankingOwnRank.textContent = own.rankText;
    }
    if (dailyRankingOwnBest) {
      dailyRankingOwnBest.textContent = own.score > 0 ? `${formatNumber(own.score)}点` : "0";
    }
    if (dailyRankingTodayButton && dailyRankingYesterdayButton) {
      dailyRankingTodayButton.classList.toggle("is-active", !isYesterday);
      dailyRankingTodayButton.setAttribute("aria-pressed", isYesterday ? "false" : "true");
      dailyRankingYesterdayButton.classList.toggle("is-active", isYesterday);
      dailyRankingYesterdayButton.setAttribute("aria-pressed", isYesterday ? "true" : "false");
    }
    if (dailyRankingRewardStatus) {
      dailyRankingRewardStatus.classList.toggle("is-rewarded", Boolean(yesterdayClaim));
      if (yesterdayClaim) {
        dailyRankingRewardStatus.innerHTML = withCurrencyIconText(`昨日${yesterdayClaim.rank}位 ${currencyRewardLabel(yesterdayClaim.amount)} 配布済み`);
      } else if (yesterdayOwn.score > 0 && yesterdayOwn.rank <= DAILY_RANKING_REWARD_RANK_MAX) {
        dailyRankingRewardStatus.innerHTML = withCurrencyIconText(`昨日${yesterdayOwn.rank}位 ${currencyRewardLabel(DAILY_RANKING_REWARD_AMOUNT)} 配布対象`);
      } else {
        dailyRankingRewardStatus.innerHTML = withCurrencyIconText(`昨日トップ${DAILY_RANKING_REWARD_RANK_MAX}で${currencyRewardLabel(DAILY_RANKING_REWARD_AMOUNT)}`);
      }
    }
    const rows = buildDailyRankingEntries(dateKey).map((entry) => {
      const row = document.createElement("div");
      row.className = entry.isPlayer ? "ranking-row is-player" : "ranking-row";

      const rank = document.createElement("span");
      rank.className = "ranking-row-rank";
      rank.textContent = entry.isPlayer && entry.score <= 0 ? "-" : `${entry.rank}`;

      const name = document.createElement("strong");
      name.textContent = entry.name;

      const title = document.createElement("small");
      title.className = "ranking-row-title";
      title.textContent = entry.title;

      const score = document.createElement("em");
      score.textContent = entry.score > 0 ? `${formatNumber(entry.score)}点` : "未参加";

      row.append(rank, name, title, score);
      return row;
    });
    dailyRankingList.replaceChildren(...rows);
  }

  function renderSeasonRanking() {
    renderRankingTabs();
    renderDailyRanking();
    renderSeasonRecordTabs();
    renderSeasonHistory();
    const isHistoryView = selectedSeasonRecordView === "history";
    const activeStage = rankingStageById(ACTIVE_RANKING_STAGE_ID);
    const stage = selectedRankingStage();
    const menuOwnRank = ownSeasonRank(activeStage.id);
    const screenOwnRank = ownSeasonRank(stage.id);
    const screenTitleStatus = playerTitleStatus(stage.id);
    if (menuSeasonLabel) {
      menuSeasonLabel.textContent = CURRENT_SEASON.label;
    }
    if (menuSeasonStage) {
      menuSeasonStage.textContent = activeStage.title;
    }
    if (menuSeasonPeriod) {
      menuSeasonPeriod.textContent = activeStage.periodLabel;
    }
    if (menuSeasonRank) {
      menuSeasonRank.textContent = menuOwnRank.rankText;
    }
    if (menuSeasonBest) {
      menuSeasonBest.textContent = formatNumber(menuOwnRank.score);
    }
    if (rankingSeasonLabel) {
      rankingSeasonLabel.textContent = isHistoryView ? "ARCHIVE" : CURRENT_SEASON.label === stage.label ? CURRENT_SEASON.label : `${CURRENT_SEASON.label} / ${stage.label}`;
    }
    if (rankingSeasonTitle) {
      rankingSeasonTitle.textContent = isHistoryView ? "過去シーズン記録" : stage.title || CURRENT_SEASON.title;
    }
    if (rankingSeasonPeriod) {
      rankingSeasonPeriod.textContent = isHistoryView ? "終了したシーズンの自己記録と上位記録" : stage.periodLabel || CURRENT_SEASON.periodLabel;
    }
    if (rankingQualifierText) {
      rankingQualifierText.textContent = isHistoryView ? "称号と自己ベストはシーズン終了後も残ります" : CURRENT_SEASON.qualifierLabel || "シーズン期間内の最高スコアで競います";
    }
    if (rankingStageStatus) {
      rankingStageStatus.textContent = rankingStageStatusText(stage);
    }
    renderRankingSyncStatus(stage);
    if (rankingOwnRank) {
      rankingOwnRank.textContent = screenOwnRank.rankText;
    }
    if (rankingOwnBest) {
      rankingOwnBest.textContent = `${formatNumber(screenOwnRank.score)}点`;
    }
    if (rankingOwnTitle) {
      rankingOwnTitle.textContent = screenTitleStatus.title;
      rankingOwnTitle.classList.toggle("is-limited", screenTitleStatus.limited);
    }
    if (rankingOwnTitleNote) {
      rankingOwnTitleNote.textContent = screenTitleStatus.note;
      rankingOwnTitleNote.classList.toggle("is-limited", screenTitleStatus.limited);
    }
    if (rankingStageTabs) {
      const shouldShowStageTabs = CURRENT_SEASON.stages.length > 1;
      rankingStageTabs.hidden = !shouldShowStageTabs;
      if (!shouldShowStageTabs) {
        rankingStageTabs.replaceChildren();
      } else {
        const tabs = CURRENT_SEASON.stages.map((rankingStage) => {
        const button = document.createElement("button");
        button.className = rankingStage.id === stage.id ? "ranking-stage-tab is-active" : "ranking-stage-tab";
        button.type = "button";
        button.dataset.rankingStageId = rankingStage.id;
        button.setAttribute("aria-pressed", rankingStage.id === stage.id ? "true" : "false");
        button.textContent = rankingStage.label;
        button.addEventListener("click", () => {
          selectedRankingStageId = rankingStage.id;
          renderSeasonRanking();
          syncRanking({ reason: "stage", stageId: rankingStage.id });
        });
        return button;
      });
        rankingStageTabs.replaceChildren(...tabs);
      }
    }
    const finalRules = rankingRulesForStage(stage);
    if (rankingFinalRules && rankingFinalRuleList && rankingFinalDeckStatus) {
      rankingFinalRules.hidden = stage.type !== "final";
      const ruleChips = finalRules.map((rule) => {
        const chip = document.createElement("span");
        chip.textContent = rule.label;
        return chip;
      });
      rankingFinalRuleList.replaceChildren(...ruleChips);
      rankingFinalDeckStatus.textContent = evaluateRankingDeckRules(finalRules);
    }
    if (!rankingList) {
      return;
    }
    const rows = buildOnlineSeasonRankingEntries(stage.id).map((entry) => {
      const row = document.createElement("div");
      row.className = entry.isPlayer ? "ranking-row is-player" : "ranking-row";

      const rank = document.createElement("span");
      rank.className = "ranking-row-rank";
      rank.textContent = entry.isPlayer && entry.score <= 0 ? "-" : `${entry.rank}`;

      const name = document.createElement("strong");
      name.textContent = entry.name;

      const title = document.createElement("small");
      title.className = entry.titleLimited ? "ranking-row-title is-limited" : "ranking-row-title";
      title.textContent = entry.title;

      const score = document.createElement("em");
      score.textContent = entry.score > 0 ? `${formatNumber(entry.score)}点` : "未参加";

      row.append(rank, name, title, score);
      return row;
    });
    rankingList.replaceChildren(...rows);
  }

  function renderSeasonHistory() {
    if (!seasonHistoryList) {
      return;
    }
    const items = buildSeasonHistoryItems();
    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "season-history-empty";
      empty.innerHTML = `
        <span>ARCHIVE</span>
        <strong>過去シーズンはまだありません</strong>
        <p>シーズンが終了すると、自己ベスト・順位・称号の記録がここに残ります。</p>
      `;
      seasonHistoryList.replaceChildren(empty);
      return;
    }
    const cards = items.map((item) => {
      const card = document.createElement("article");
      card.className = "season-history-card";

      const head = document.createElement("div");
      head.className = "season-history-head";
      const label = document.createElement("span");
      label.textContent = item.label;
      const title = document.createElement("strong");
      title.textContent = item.title;
      const period = document.createElement("p");
      period.textContent = item.periodLabel;
      head.append(label, title, period);

      const stats = document.createElement("div");
      stats.className = "season-history-stats";
      const rank = document.createElement("div");
      rank.innerHTML = `<span>自分の順位</span><strong>${item.ownRankText || "未参加"}</strong>`;
      const score = document.createElement("div");
      score.innerHTML = `<span>最高スコア</span><strong>${item.ownBestScore > 0 ? `${formatNumber(item.ownBestScore)}点` : "0"}</strong>`;
      stats.append(rank, score);

      const note = document.createElement("p");
      note.className = "season-history-note";
      note.textContent = item.note;

      const topList = document.createElement("div");
      topList.className = "season-history-top-list";
      const entries = item.entries.slice(0, 5);
      if (entries.length) {
        for (const entry of entries) {
          const row = document.createElement("div");
          row.className = entry.isPlayer ? "season-history-row is-player" : "season-history-row";
          row.innerHTML = `
            <span>${entry.rank}</span>
            <strong>${entry.name}</strong>
            <small>${entry.title}</small>
            <em>${entry.score > 0 ? `${formatNumber(entry.score)}点` : "未参加"}</em>
          `;
          topList.appendChild(row);
        }
      } else {
        const row = document.createElement("div");
        row.className = "season-history-row is-empty";
        row.textContent = "上位記録はシーズン終了後に保存されます";
        topList.appendChild(row);
      }

      card.append(head, stats, note, topList);
      return card;
    });
    seasonHistoryList.replaceChildren(...cards);
  }

  function renderFeedbackInsights() {
    if (!feedbackInsightPanel || !feedbackInsightGrid || !feedbackInsightLead || !feedbackInsightNote) {
      return;
    }
    const stats = buildFeedbackInsightStats();
    feedbackInsightPanel.classList.toggle("is-empty", stats.total === 0);
    feedbackInsightLead.textContent = stats.total
      ? `直近${stats.total}件 / 最多 ${stats.top.label} ${stats.top.count}件`
      : "リザルトの感想を押すと集計されます。";
    feedbackInsightGrid.innerHTML = "";
    for (const item of stats.options) {
      const chip = document.createElement("span");
      chip.className = item.count > 0 ? "feedback-insight-chip is-active" : "feedback-insight-chip";
      chip.innerHTML = `
        <b>${item.label}</b>
        <strong>${item.count}</strong>
        <em>${item.perspectiveLabel}</em>
      `;
      feedbackInsightGrid.appendChild(chip);
    }
    feedbackInsightNote.textContent = stats.total
      ? `4視点 ${Object.entries(PERSPECTIVE_LABELS)
          .map(([key, label]) => `${label}${stats.perspectives[key] || 0}`)
          .join(" / ")}`
      : "プレイヤー、教育者、配信者、視聴者の反応を閉鎖テストで見ます。";
  }

  function renderDeck() {
    normalizeDeckSlotColors();
    normalizePushCardPlacement();
    deckGrid.style.gridTemplateColumns = `repeat(${state.deckIds.length}, minmax(0, 1fr))`;
    deckGrid.innerHTML = "";
    const pushCard = CARD_BY_ID.get(state.pushCardId);
    pushName.textContent = pushCard ? `推し ${pushCard.displayName}` : "推し";
    state.deckIds.forEach((cardId, index) => {
      const card = CARD_BY_ID.get(cardId);
      const button = createDeckCardButton(card, index, { compact: false, editableColor: true });
      button.addEventListener("click", (event) => {
        if (event.target.closest("[data-color-cycle]")) {
          cycleDeckSlotColor(index);
          return;
        }
        selectDeckSlot(index);
      });
      button.addEventListener("keydown", (event) => {
        if (event.key.toLowerCase() !== "c") {
          return;
        }
        event.preventDefault();
        cycleDeckSlotColor(index);
      });
      deckGrid.appendChild(button);
    });
    renderDeckStrategy();
  }

  function renderDeckStrategy() {
    if (!deckStrategyPanel || !deckStrategyLead || !deckStrategyWords || !deckStrategyKana || !deckStrategyAdvice) {
      return;
    }
    const cards = state.deckIds.map((id) => CARD_BY_ID.get(id)).filter(Boolean);
    const profile = evaluateDeckProfile();
    const summaries = cards.map((card) => {
      const length = kanaLength(card.readingKana);
      const score = Math.round(baseWordScore(length) * profile.scoreMultiplier);
      return { card, length, score };
    });
    const totalLetters = summaries.reduce((sum, item) => sum + item.length, 0);
    const maxScore = summaries.reduce((max, item) => Math.max(max, item.score), 0);
    const minLength = summaries.reduce((min, item) => Math.min(min, item.length), Infinity);
    const maxLength = summaries.reduce((max, item) => Math.max(max, item.length), 0);
    const pushCard = CARD_BY_ID.get(state.pushCardId);
    const counts = new Map();
    for (const { card } of summaries) {
      for (const char of Array.from(card.readingKana)) {
        counts.set(char, (counts.get(char) || 0) + 1);
      }
    }
    const frequent = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"))
      .slice(0, 6)
      .map(([char, count]) => `${char}${count}(${Math.round((count / Math.max(1, totalLetters)) * 100)}%)`);
    const uniqueRatio = profile.uniqueLetters / Math.max(1, profile.totalLetters);
    const lengthPlan =
      maxLength >= 6
        ? "長い語で一撃を狙う"
        : minLength <= 3 && maxLength >= 5
          ? "短めと5字が混ざる安定型"
          : "同じ長さをそろえて読む型";
    const repeatPlan = uniqueRatio <= 0.64 ? "重なり文字多め" : "文字の種類多め";
    const pushPlan = pushCard ? `推し ${pushCard.skillName}` : "推し未設定";

    deckStrategyPanel.dataset.deckDifficulty = profile.rank;
    deckStrategyPanel.classList.toggle("is-theme", profile.theme);
    deckStrategyPanel.classList.toggle("is-easy", profile.rank === "easy");
    deckStrategyLead.textContent = `${profile.label} / x${profile.scoreMultiplier.toFixed(2)} / 文字${totalLetters}`;
    deckStrategyWords.innerHTML = summaries
      .map(
        ({ card, length, score }) => `
          <span>
            <b>${card.displayName}</b>
            <em>${length}字 ${formatNumber(score)}</em>
          </span>
        `,
      )
      .join("");
    deckStrategyKana.textContent = `種類${profile.uniqueLetters} / 頻出 ${frequent.join(" / ")}`;
    deckStrategyAdvice.textContent = `${profile.description} / ${lengthPlan} / ${repeatPlan} / ${pushPlan}`;
  }

  function renderMenuDeck() {
    normalizeDeckSlotColors();
    normalizePushCardPlacement();
    menuDeckGrid.innerHTML = "";
    state.deckIds.forEach((cardId, index) => {
      const card = CARD_BY_ID.get(cardId);
      const button = createDeckCardButton(card, index, { compact: true, editableColor: false, home: true });
      button.addEventListener("click", () => showScreen("deck"));
      menuDeckGrid.appendChild(button);
    });
  }

  function renderGameDeckLegend() {
    if (!gameDeckLegend) {
      return;
    }
    normalizeDeckSlotColors();
    normalizePushCardPlacement();
    const legendItems = state.deckIds
      .map((cardId, index) => {
        const card = CARD_BY_ID.get(cardId);
        if (!card) {
          return null;
        }
        const preset = getDeckSlotColor(index);
        const skillSummary = cardSkillSummary(card);
        const button = document.createElement("div");
        const isPush = card.id === state.pushCardId;
        button.className = isPush ? "game-deck-legend-card is-push" : "game-deck-legend-card";
        button.dataset.slotIndex = String(index);
        button.dataset.slotColorLabel = preset.label;
        button.setAttribute("role", "group");
        button.setAttribute(
          "aria-label",
          `${preset.label}のパネルは${card.displayName}。${Array.from(card.readingKana).join("、")}をそろえる。スキル ${skillSummary}${isPush ? "。推しカード" : ""}`,
        );
        button.title = `${preset.label} / ${card.displayName} / ${card.readingKana} / ${skillSummary}`;
        applyCardPalette(button, card, index);
        button.innerHTML = `
          <span class="legend-thumb" aria-hidden="true"></span>
          <span class="legend-copy">
            <span class="legend-topline">
              <span class="legend-color"><i aria-hidden="true"></i><b>${preset.label}</b></span>
              ${isPush ? '<span class="legend-push">推し</span>' : ""}
            </span>
            <strong>${card.displayName}</strong>
            <em>${Array.from(card.readingKana).join("・")}</em>
            <small class="legend-skill">${skillSummary}</small>
          </span>
        `;
        return button;
      })
      .filter(Boolean);
    gameDeckLegend.replaceChildren(...legendItems);
  }

  function createDeckCardButton(card, index, options = {}) {
    const { compact = false, editableColor = false, home = false } = options;
    const colorPreset = getDeckSlotColor(index);
    const slotLabel = formatDeckSlotLabel(index);
    const button = document.createElement("button");
    const isPush = card.id === state.pushCardId;
    const deckRoleLabel = deckMembershipLabel(card.id) || "デッキ入り";
    const isSelectedSlot = !compact && index === state.selectedDeckSlot;
    button.type = "button";
    button.className = compact ? "mini-card menu-mini-card" : "mini-card";
    if (home) {
      button.classList.add("home-mini-card");
    }
    button.dataset.slotIndex = String(index);
    button.dataset.slotLabel = deckRoleLabel;
    button.dataset.slotColorLabel = colorPreset.label;
    button.dataset.deckRole = isPush ? "push" : "support";
    button.dataset.deckTarget = isSelectedSlot ? "replace" : "idle";
    button.setAttribute(
      "aria-label",
      `${slotLabel} ${card.displayName}${card.id === state.pushCardId ? " 推しカード" : ""}${editableColor ? "。Cキー、または色チップのタップで色変更" : ""}`,
    );
    button.title = `${slotLabel} / ${card.displayName}`;
    button.setAttribute(
      "aria-label",
      `${card.displayName} ${deckRoleLabel}${editableColor ? "。色チップでパネル色を変更" : ""}`,
    );
    button.title = `${card.displayName} / ${deckRoleLabel}`;
    if (isPush) {
      button.classList.add("is-push");
    }
    if (isSelectedSlot) {
      button.classList.add("is-slot");
    }
    applyCardPalette(button, card, index);
    const colorControl = editableColor
      ? `<span class="slot-color-control" data-color-cycle="true" title="${slotLabel} パネル色を変更" aria-label="${slotLabel} パネル色を変更">
          <span class="slot-color-index" aria-hidden="true">${index + 1}</span>
          <span class="slot-color-dot" aria-hidden="true"></span>
          <span class="slot-color-text">${colorPreset.label}</span>
        </span>`
      : `<span class="slot-color-chip" aria-hidden="true">
          <span class="slot-color-index">${index + 1}</span>
          <span class="slot-color-dot"></span>
          <span class="slot-color-text">${colorPreset.label}</span>
        </span>`;
    button.innerHTML = `
      <span class="rarity">${rarityMarkup(card)}</span>
      ${isPush && !home ? '<span class="push-frame-label">推し</span>' : ""}
      ${isSelectedSlot ? '<span class="slot-target-label">入替先</span>' : ""}
      <strong class="card-name">${card.displayName}</strong>
      <span class="card-bottom-row">
        <span class="card-skill">${compact ? (isPush ? "推し" : "デッキ") : cardSkillSummary(card)}</span>
        ${colorControl}
      </span>
    `;
    return button;
  }

  function renderPack() {
    const pack = currentPack();
    state.packMedals = getPackMedals(pack);
    const sale = packSaleStatus(pack);
    const exchangeRequired = isPackExchangeRequired(pack);
    stoneText.innerHTML = `${currencyAmountMarkup(state.packStone)} / ${formatNumber(pack.cost)}`;
    renderPackSelector();
    renderPackPeriod(pack);
    renderPackFeature(pack);
    packResult.hidden = true;
    packResult.textContent = "";
    openPackButton.classList.toggle("is-exchange-required", exchangeRequired);
    openPackButton.disabled = !exchangeRequired && (!sale.available || state.packStone < pack.cost);
    openPackButton.querySelector("span").innerHTML = exchangeRequired ? EXCHANGE_TOKEN_LABEL : currencyAmountMarkup(pack.cost, { compact: true });
    openPackButton.querySelector("strong").textContent = exchangeRequired ? "交換へ" : sale.available ? "開封" : "期間外";
    renderPackReveal(pack);
    renderPackOpeningModal(pack);
    renderCollectionFilters();
    renderCollectionLengthFilters();
    renderCollectionSorts();
    renderPackExchangeStatus(pack);
    renderPackCollectionProgress(pack);
    renderPackLineup(pack);
    renderPackDetailModal(pack);
    rateRow.innerHTML = Object.entries(pack.rates)
      .map(([label, rate]) => `<span>${rarityMarkupFromRateLabel(label)} <em>${rate}%</em></span>`)
      .join("");

    collectionGrid.innerHTML = "";
    const cards = filteredCollectionCards();
    const guideCard = resolveGuideCard(cards);
    for (const card of cards) {
      const owned = state.owned[card.id] || 0;
      const status = collectionCardStatus(card, owned);
      const cardPack = packForCard(card) || pack;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "collection-card";
      button.dataset.cardId = card.id;
      button.dataset.collectionStatus = status.id;
      button.setAttribute("aria-pressed", card.id === guideCard.id ? "true" : "false");
      if (owned <= 0) {
        button.classList.add("is-locked");
      }
      if (card.id === guideCard.id) {
        button.classList.add("is-guide");
      }
      const exchangeMode = isActivePackExchangeForCard(card);
      const ownedExchangeAction = exchangeMode && owned > 0;
      if (canExchangeCardWithMedals(card, cardPack)) {
        button.classList.add("is-exchangeable");
      }
      const isDeckScreen = state.currentScreen === "deck";
      const isDeckCard = state.deckIds.includes(card.id);
      const isDeckActionable =
        isDeckScreen && !isDeckCard && !ownedExchangeAction && (owned > 0 || canUseChoiceTicketForCard(card) || canExchangeCardWithMedals(card, cardPack));
      const isExchangeActionable = isDeckScreen && exchangeMode;
      const targetLabel = ownedExchangeAction
        ? `交換で${limitBreakLabelFromOwned(owned + 1)}`
        : isDeckActionable
          ? `${formatDeckSlotActionLabel(collectionReplaceSlotIndex())}へ`
          : "";
      if (isDeckActionable || isExchangeActionable) {
        button.classList.add("is-actionable");
      }
      if (targetLabel) {
        button.dataset.deckAction = targetLabel;
      } else {
        delete button.dataset.deckAction;
      }
      applyCardPalette(button, card);
      const ownedText =
        ownedExchangeAction
          ? `${limitBreakLabelFromOwned(owned)} → ${limitBreakLabelFromOwned(owned + 1)}`
          : owned > 0
          ? `${kanaLength(card.readingKana)}字 / ${cardSkillSummary(card) || card.skillName}`
          : canUseChoiceTicketForCard(card)
            ? "選択可"
            : canExchangeCardWithMedals(card, cardPack)
              ? "交換可"
              : `${EXCHANGE_TOKEN_LABEL} ${getPackMedals(cardPack)}/${packExchangeCost(cardPack)}`;
      button.innerHTML = `
        <span class="rarity">${rarityMarkup(card)}</span>
        <span class="collection-tag">${status.label}</span>
        ${targetLabel ? `<span class="collection-target-label">${targetLabel}</span>` : ""}
        <strong class="card-name">${card.displayName}</strong>
        <span class="card-skill">${ownedText}</span>
      `;
      button.addEventListener("click", () => {
        const wasGuideCard = state.guideCardId === card.id;
        state.guideCardId = card.id;
        if (state.currentScreen === "deck") {
          if (wasGuideCard && (isDeckActionable || isExchangeActionable)) {
            tryPutCardInDeck(card.id);
            return;
          }
          playSound("tap");
          renderAll();
          return;
        }
        tryPutCardInDeck(card.id);
        renderPack();
      });
      collectionGrid.appendChild(button);
    }
    renderWordGuide(guideCard);
  }

  function renderPackSelector() {
    if (!packSelector) {
      return;
    }
    packSelector.innerHTML = "";
    for (const pack of DATA.packs || []) {
      const sale = packSaleStatus(pack);
      const featured = packFeaturedCards(pack);
      const leadCard = featured[0];
      const medals = getPackMedals(pack);
      const cost = packExchangeCost(pack);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pack-select-card";
      button.classList.toggle("is-active", pack.id === currentPack().id);
      button.classList.toggle("is-closed", !sale.available);
      button.dataset.packId = pack.id;
      if (leadCard) {
        applyCardPalette(button, leadCard);
      }
      button.innerHTML = `
        <span class="pack-select-label">${sale.available ? "販売中" : sale.reason}</span>
        <strong>${pack.displayName}</strong>
        <small>${packCollectionStatusText(pack)}</small>
        <em class="pack-daruma-line">${currencyAmountMarkup(pack.cost, { compact: true })} / ${EXCHANGE_TOKEN_ICON_MARKUP}<span>${EXCHANGE_TOKEN_LABEL} ${medals}/${cost}</span></em>
      `;
      button.addEventListener("click", () => selectPack(pack.id));
      packSelector.appendChild(button);
    }
  }

  function renderPackDetailModal(pack = currentPack()) {
    if (!packDetailModal) {
      return;
    }
    packDetailModal.hidden = !(state.packDetailOpen && state.currentScreen === "pack");
    if (packDetailTitle) {
      packDetailTitle.textContent = `${pack.displayName} 確率とラインナップ`;
    }
  }

  function renderPackLineup(pack = currentPack()) {
    if (!packLineup) {
      return;
    }
    const cardEntries = packCardEntries(pack);
    packLineup.innerHTML = "";

    const head = document.createElement("div");
    head.className = "pack-lineup-head";
    head.innerHTML = `
      <span>LINEUP</span>
      <strong>${cardEntries.length}種 / タップで詳細</strong>
    `;
    packLineup.appendChild(head);

    const grid = document.createElement("div");
    grid.className = "pack-lineup-grid";
    for (const { entry, card } of cardEntries) {
      const owned = state.owned[card.id] || 0;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pack-lineup-card";
      button.dataset.cardId = card.id;
      button.classList.toggle("is-owned", owned > 0);
      button.classList.toggle("is-exchangeable", canExchangeCardWithMedals(card, pack));
      applyCardPalette(button, card);
      const exchangeText = canExchangeCardWithMedals(card, pack)
        ? " / 交換可"
        : owned > 0
          ? ` / ${limitBreakLabelFromOwned(owned)}`
          : "";
      button.innerHTML = `
        <span class="rarity">${rarityMarkup(card)}</span>
        <strong>${card.displayName}</strong>
        <small>${formatRate(entry.rate)}%${exchangeText}</small>
      `;
      button.addEventListener("click", () => {
        state.guideCardId = card.id;
        state.collectionFilterId = "all";
        state.collectionLengthFilterId = "all";
        playSound("tap");
        showScreen("deck");
      });
      grid.appendChild(button);
    }
    packLineup.appendChild(grid);
  }

  function renderPackCollectionProgress(pack = currentPack()) {
    if (!packCollectionProgress || !packCollectionText || !packCollectionBar || !packCollectionHint) {
      return;
    }
    const cardEntries = packCardEntries(pack);
    const total = Math.max(1, cardEntries.length);
    const ownedCount = cardEntries.filter(({ card }) => (state.owned[card.id] || 0) > 0).length;
    const missingEntries = cardEntries.filter(({ card }) => (state.owned[card.id] || 0) <= 0);
    const nextEntry = missingEntries[0];
    const percent = Math.round((ownedCount / total) * 100);
    packCollectionText.textContent = `${pack.displayName} ${ownedCount}/${total}種`;
    packCollectionBar.style.width = `${percent}%`;
    packCollectionProgress.classList.toggle("is-complete", ownedCount >= total || !nextEntry);
    packCollectionHint.textContent =
      ownedCount >= total || !nextEntry
        ? "全カード入手済み / 凸でスキル強化"
        : `あと${total - ownedCount}種 / 次 ${rarityLabel(nextEntry.card)} ${nextEntry.card.displayName}`;
  }

  function packCollectionStatusText(pack = PACK) {
    const cardEntries = packCardEntries(pack);
    if (cardEntries.length <= 0) {
      return "";
    }
    const ownedCount = cardEntries.filter(({ card }) => (state.owned[card.id] || 0) > 0).length;
    const total = cardEntries.length;
    const nextEntry = cardEntries.find(({ card }) => (state.owned[card.id] || 0) <= 0);
    return nextEntry
      ? `${ownedCount}/${total}種 / 次 ${rarityLabel(nextEntry.card)} ${nextEntry.card.displayName}`
      : `${ownedCount}/${total}種 / 全カード入手済み`;
  }

  function renderPackExchangeStatus(pack = currentPack()) {
    if (!packExchangeStatus) {
      return;
    }
    const cost = packExchangeCost(pack);
    const medals = getPackMedals(pack);
    const ready = cost > 0 && medals >= cost;
    const exchangeableCount = packExchangeableEntries(pack).length;
    const hasExchangeTarget = exchangeableCount > 0;
    packExchangeStatus.classList.toggle("is-ready", ready);
    packExchangeStatus.classList.toggle("is-actionable", ready && hasExchangeTarget);
    packExchangeStatus.setAttribute(
      "aria-label",
      ready && hasExchangeTarget
        ? `${EXCHANGE_TOKEN_LABEL}を使って${pack.displayName}の未所持カードや凸用カードを選ぶ`
        : `${EXCHANGE_TOKEN_LABEL} ${medals}/${cost}`,
    );
    packExchangeStatus.title = ready && hasExchangeTarget ? "クリックで交換カードを選ぶ" : `${EXCHANGE_TOKEN_LABEL} ${medals}/${cost}`;
    const message = ready
      ? hasExchangeTarget
        ? `未所持/凸カードと交換可`
        : `このパックは全カード10凸済み`
      : `このパックを引くと+1`;
    const action = ready && hasExchangeTarget ? `<small>タップで交換へ</small>` : "";
    packExchangeStatus.innerHTML = `
      ${EXCHANGE_TOKEN_ICON_MARKUP}
      <span>${EXCHANGE_TOKEN_LABEL} ${medals}/${cost} / ${message}${action}</span>
    `;
  }

  function renderPackPeriod(pack = currentPack()) {
    if (!packPeriodText) {
      return;
    }
    const sale = packSaleStatus(pack);
    const countdown = formatPackSaleCountdown(pack, sale);
    packPeriodText.textContent = `${pack.displayName} / ${sale.reason}${countdown ? ` / ${countdown}` : ""} ${formatPackPeriod(pack)}`;
    packPeriodText.classList.toggle("is-closed", !sale.available);
  }

  function renderPackFeature(pack = currentPack()) {
    if (!packFeatureRow) {
      return;
    }
    const featured = packFeaturedCards(pack);
    const sale = packSaleStatus(pack);
    const countdown = formatPackSaleCountdown(pack, sale);
    packFeatureRow.innerHTML = "";
    packFeatureRow.classList.toggle("is-closed", !sale.available);

    const copy = document.createElement("div");
    copy.className = "pack-feature-copy";
    copy.innerHTML = `
      <span>FEATURED</span>
      <strong>${sale.available ? "目玉カード" : sale.reason}</strong>
      <small>${countdown || formatPackPeriod(pack)}</small>
    `;
    packFeatureRow.appendChild(copy);

    const cards = document.createElement("div");
    cards.className = "pack-feature-cards";
    for (const card of featured) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pack-feature-card";
      button.dataset.cardId = card.id;
      applyCardPalette(button, card);
      button.innerHTML = `
        <span class="rarity">${rarityMarkup(card)}</span>
        <strong>${card.displayName}</strong>
      `;
      button.addEventListener("click", () => {
        state.guideCardId = card.id;
        state.collectionFilterId = "all";
        state.collectionLengthFilterId = "all";
        playSound("tap");
        showScreen("deck");
      });
      cards.appendChild(button);
    }
    packFeatureRow.appendChild(cards);
  }

  function resolvePackEntries(pack = PACK) {
    return Array.isArray(pack.entries) ? pack.entries : [];
  }

  function packFeaturedCards(pack = PACK) {
    return packCardEntries(pack)
      .slice()
      .sort((a, b) => b.card.rarityG - a.card.rarityG || a.entry.rate - b.entry.rate || a.card.displayName.localeCompare(b.card.displayName, "ja"))
      .slice(0, 2)
      .map(({ card }) => card);
  }

  function packExchangeCost(pack = PACK) {
    return Math.max(1, Number(pack.exchangeMedalCost) || 50);
  }

  function isPackExchangeRequired(pack = currentPack()) {
    const cost = packExchangeCost(pack);
    return cost > 0 && getPackMedals(pack) >= cost && packExchangeableEntries(pack).length > 0;
  }

  function canReceivePackExchange(card) {
    return Boolean(card && (state.owned[card.id] || 0) < MAX_OWNED_COPIES);
  }

  function canExchangeCardWithMedals(card, pack = packForCard(card)) {
    const inPack = Boolean(card && pack && packCardEntries(pack).some(({ card: packCard }) => packCard.id === card.id));
    return Boolean(inPack && canReceivePackExchange(card) && getPackMedals(pack) >= packExchangeCost(pack));
  }

  function activeExchangePack() {
    return state.exchangePackId ? PACK_BY_ID.get(state.exchangePackId) || null : null;
  }

  function isActivePackExchangeForCard(card) {
    const pack = activeExchangePack();
    return Boolean(pack && packForCard(card)?.id === pack.id && canExchangeCardWithMedals(card, pack));
  }

  function packExchangeableEntries(pack = currentPack()) {
    return packCardEntries(pack)
      .filter(({ card }) => canReceivePackExchange(card))
      .sort((a, b) => {
        const aOwned = state.owned[a.card.id] || 0;
        const bOwned = state.owned[b.card.id] || 0;
        const aMissing = aOwned <= 0 ? 0 : 1;
        const bMissing = bOwned <= 0 ? 0 : 1;
        return (
          aMissing - bMissing ||
          aOwned - bOwned ||
          b.card.rarityG - a.card.rarityG ||
          a.card.displayName.localeCompare(b.card.displayName, "ja")
        );
      });
  }

  function canUseChoiceTicketForCard(card) {
    const pack = packForCard(card) || currentPack();
    return Boolean(card && state.choiceTickets > 0 && card.seasonId === pack.seasonId);
  }

  function packCardEntries(pack = PACK) {
    return resolvePackEntries(pack)
      .filter((entry) => entry.type === "card" && CARD_BY_ID.has(entry.cardId))
      .map((entry) => ({ entry, card: CARD_BY_ID.get(entry.cardId) }))
      .sort((a, b) => b.card.rarityG - a.card.rarityG || b.entry.rate - a.entry.rate || a.card.displayName.localeCompare(b.card.displayName, "ja"));
  }

  function packSaleStatus(pack = PACK, now = Date.now()) {
    const start = Date.parse(pack.saleStartsAt || "");
    const end = Date.parse(pack.saleEndsAt || "");
    if (Number.isFinite(start) && now < start) {
      return { available: false, reason: "販売前です", targetAt: start, phase: "before" };
    }
    if (Number.isFinite(end) && now > end) {
      return { available: false, reason: "販売終了", targetAt: end, phase: "after" };
    }
    return { available: true, reason: "販売中", targetAt: Number.isFinite(end) ? end : 0, phase: "active" };
  }

  function formatPackPeriod(pack = PACK) {
    const start = formatPackDate(pack.saleStartsAt);
    const end = formatPackDate(pack.saleEndsAt);
    if (!start && !end) {
      return "常設";
    }
    return `${start || "未定"}-${end || "未定"}`;
  }

  function formatPackDate(value) {
    const date = new Date(value || "");
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
  }

  function formatPackSaleCountdown(pack = PACK, sale = packSaleStatus(pack), now = Date.now()) {
    if (!sale || !Number.isFinite(sale.targetAt) || sale.targetAt <= 0) {
      return "";
    }
    if (sale.phase === "after") {
      return "終了済み";
    }
    const ms = Math.max(0, sale.targetAt - now);
    const days = Math.ceil(ms / 86400000);
    if (sale.phase === "before") {
      return days <= 1 ? "明日開始" : `開始まで${days}日`;
    }
    if (days <= 1) {
      return "本日まで";
    }
    return `残り${days}日`;
  }

  function formatRate(rate) {
    const number = Number(rate);
    if (!Number.isFinite(number)) {
      return "-";
    }
    return number.toFixed(number % 1 === 0 ? 0 : 2).replace(/\.?0+$/, "");
  }

  function renderCollectionFilters() {
    collectionFilterRow.innerHTML = "";
    for (const filter of COLLECTION_FILTERS) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.collectionFilter = filter.id;
      button.className = "collection-filter";
      button.textContent = filter.label;
      button.setAttribute("aria-pressed", filter.id === state.collectionFilterId ? "true" : "false");
      if (filter.id === state.collectionFilterId) {
        button.classList.add("is-active");
      }
      collectionFilterRow.appendChild(button);
    }
  }

  function renderCollectionLengthFilters() {
    if (!collectionLengthRow) {
      return;
    }
    collectionLengthRow.innerHTML = "";
    if (!COLLECTION_LENGTH_FILTER_BY_ID.has(state.collectionLengthFilterId)) {
      state.collectionLengthFilterId = "all";
    }
    for (const filter of COLLECTION_LENGTH_FILTERS) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.collectionLength = filter.id;
      button.className = "collection-length";
      button.textContent = filter.label;
      button.setAttribute("aria-pressed", filter.id === state.collectionLengthFilterId ? "true" : "false");
      if (filter.id === state.collectionLengthFilterId) {
        button.classList.add("is-active");
      }
      collectionLengthRow.appendChild(button);
    }
  }

  function renderCollectionSorts() {
    if (!collectionSortRow) {
      return;
    }
    collectionSortRow.innerHTML = "";
    if (!COLLECTION_SORT_BY_ID.has(state.collectionSortId)) {
      state.collectionSortId = "recommended";
    }
    for (const sort of COLLECTION_SORTS) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.collectionSort = sort.id;
      button.className = "collection-sort";
      button.textContent = sort.label;
      button.setAttribute("aria-pressed", sort.id === state.collectionSortId ? "true" : "false");
      if (sort.id === state.collectionSortId) {
        button.classList.add("is-active");
      }
      collectionSortRow.appendChild(button);
    }
  }

  function onCollectionFilterClick(event) {
    const button = event.target.closest("[data-collection-filter]");
    if (!button || !collectionFilterRow.contains(button)) {
      return;
    }
    const filterId = COLLECTION_FILTER_BY_ID.has(button.dataset.collectionFilter) ? button.dataset.collectionFilter : "all";
    if (state.collectionFilterId === filterId) {
      return;
    }
    state.collectionFilterId = filterId;
    playSound("tap");
    renderPack();
  }

  function onCollectionLengthClick(event) {
    const button = event.target.closest("[data-collection-length]");
    if (!button || !collectionLengthRow?.contains(button)) {
      return;
    }
    const filterId = COLLECTION_LENGTH_FILTER_BY_ID.has(button.dataset.collectionLength) ? button.dataset.collectionLength : "all";
    if (state.collectionLengthFilterId === filterId) {
      return;
    }
    state.collectionLengthFilterId = filterId;
    playSound("tap");
    renderPack();
  }

  function onCollectionSortClick(event) {
    const button = event.target.closest("[data-collection-sort]");
    if (!button || !collectionSortRow?.contains(button)) {
      return;
    }
    const sortId = COLLECTION_SORT_BY_ID.has(button.dataset.collectionSort) ? button.dataset.collectionSort : "recommended";
    if (state.collectionSortId === sortId) {
      return;
    }
    state.collectionSortId = sortId;
    playSound("tap");
    renderPack();
  }

  function filteredCollectionCards() {
    if (!COLLECTION_FILTER_BY_ID.has(state.collectionFilterId)) {
      state.collectionFilterId = "all";
    }
    if (!COLLECTION_LENGTH_FILTER_BY_ID.has(state.collectionLengthFilterId)) {
      state.collectionLengthFilterId = "all";
    }
    let cards = visibleCollectionCards();
    const exchangePack = state.currentScreen === "deck" ? activeExchangePack() : null;
    if (exchangePack) {
      const exchangeableIds = new Set(packExchangeableEntries(exchangePack).map(({ card }) => card.id));
      cards = cards.filter((card) => exchangeableIds.has(card.id));
    }
    switch (state.collectionFilterId) {
      case "owned":
        cards = cards.filter((card) => (state.owned[card.id] || 0) > 0);
        break;
      case "missing":
        cards = cards.filter((card) => (state.owned[card.id] || 0) <= 0);
        break;
      case "g3":
        cards = cards.filter((card) => card.rarityG === 3);
        break;
      case "g2":
        cards = cards.filter((card) => card.rarityG === 2);
        break;
      case "g1":
        cards = cards.filter((card) => card.rarityG === 1);
        break;
      default:
        break;
    }
    const lengthFilter = COLLECTION_LENGTH_FILTER_BY_ID.get(state.collectionLengthFilterId) || COLLECTION_LENGTH_FILTER_BY_ID.get("all");
    cards = cards.filter((card) => lengthFilter.match(kanaLength(card.readingKana)));
    return sortCollectionCards(cards);
  }

  function visibleCollectionCards() {
    return DATA.cards.filter((card) => !HIDDEN_COLLECTION_CARD_IDS.has(card.id));
  }

  function sortCollectionCards(cards) {
    const ordered = cards.slice();
    const selectedSlotCard = state.deckIds[state.selectedDeckSlot];
    const currentSort = COLLECTION_SORT_BY_ID.has(state.collectionSortId) ? state.collectionSortId : "recommended";
    if (currentSort === "rarity") {
      return ordered.sort((a, b) => b.rarityG - a.rarityG || a.displayName.localeCompare(b.displayName, "ja"));
    }
    if (currentSort === "short") {
      return ordered.sort((a, b) => kanaLength(a.readingKana) - kanaLength(b.readingKana) || a.displayName.localeCompare(b.displayName, "ja"));
    }
    if (currentSort === "long") {
      return ordered.sort((a, b) => kanaLength(b.readingKana) - kanaLength(a.readingKana) || a.displayName.localeCompare(b.displayName, "ja"));
    }
    if (currentSort === "name") {
      return ordered.sort((a, b) => a.displayName.localeCompare(b.displayName, "ja"));
    }
    return ordered.sort((a, b) => {
      const aDeck = state.deckIds.includes(a.id) ? 0 : 1;
      const bDeck = state.deckIds.includes(b.id) ? 0 : 1;
      if (a.id === selectedSlotCard) {
        return -1;
      }
      if (b.id === selectedSlotCard) {
        return 1;
      }
      const aOwned = (state.owned[a.id] || 0) > 0 ? 0 : 1;
      const bOwned = (state.owned[b.id] || 0) > 0 ? 0 : 1;
      return aDeck - bDeck || aOwned - bOwned || b.rarityG - a.rarityG || kanaLength(a.readingKana) - kanaLength(b.readingKana);
    });
  }

  function collectionCardStatus(card, owned = state.owned[card.id] || 0) {
    if (isActivePackExchangeForCard(card)) {
      return {
        id: "exchange",
        label: owned > 0 ? `${limitBreakLabelFromOwned(owned)}→${limitBreakLabelFromOwned(owned + 1)}` : "交換可",
      };
    }
    if (state.deckIds.includes(card.id)) {
      return { id: "deck", label: deckMembershipLabel(card.id) || "デッキ入り" };
      return { id: "deck", label: "編成中" };
    }
    if (owned > 0) {
      return { id: "owned", label: limitBreakLabelFromOwned(owned) };
    }
    if (canUseChoiceTicketForCard(card)) {
      return { id: "ticket", label: "選択可" };
    }
    if (canExchangeCardWithMedals(card)) {
      return { id: "exchange", label: "交換可" };
    }
    return { id: "missing", label: "未所持" };
  }

  function guideCategoryForCard(card) {
    const id = CARD_CATEGORY_BY_ID[card?.id] || "town";
    const filter = GUIDE_CATEGORY_BY_ID.get(id) || GUIDE_CATEGORY_BY_ID.get("town");
    return {
      id: filter.id,
      label: filter.label,
      title: filter.title,
    };
  }

  function renderPackReveal(pack = currentPack()) {
    if (!packReveal) {
      return;
    }
    packReveal.classList.remove("is-g1", "is-g2", "is-g3", "is-ticket");
    packReveal.style.setProperty("--reveal-a", "#d99945");
    packReveal.style.setProperty("--reveal-b", "#f7d89b");
    packRevealRarity.textContent = "READY";
    packRevealName.textContent = `${pack.displayName}を開封`;
    packRevealMeta.textContent = `${currencyAmountLabel(pack.cost, { compact: true })}個でカード1枚`;
    if (packRevealAction) {
      packRevealAction.hidden = true;
      packRevealAction.disabled = true;
      packRevealAction.textContent = "カードを見る";
      packRevealAction.removeAttribute("aria-label");
    }
  }

  function formatPercent(value) {
    return `${(value * 100).toFixed(value * 100 < 10 ? 1 : 0)}%`;
  }

  function currencyAmountLabel(amount, options = {}) {
    const separator = options.compact ? "" : " ";
    return `${G_CURRENCY_LABEL}${separator}${formatNumber(amount)}`;
  }

  function currencyAmountMarkup(amount, options = {}) {
    return `<span class="g-daruma-amount">${G_DARUMA_ICON_MARKUP}<span class="g-daruma-amount-text">${currencyAmountLabel(amount, options)}</span></span>`;
  }

  function currencyRewardLabel(amount) {
    return `${G_CURRENCY_LABEL}+${formatNumber(amount)}`;
  }

  function currencyRewardMarkup(amount) {
    return `<span class="g-daruma-amount">${G_DARUMA_ICON_MARKUP}<span class="g-daruma-amount-text">${currencyRewardLabel(amount)}</span></span>`;
  }

  function withCurrencyIconText(text) {
    const value = String(text || "");
    if (!value.includes(G_CURRENCY_LABEL)) {
      return value;
    }
    return value.replace(G_CURRENCY_LABEL, `${G_DARUMA_ICON_MARKUP}${G_CURRENCY_LABEL}`);
  }

  function passiveSkillSummary(skill) {
    if (!skill) {
      return "常時スキル";
    }
    const pushPrefix = skill.isPush ? "推し2倍 " : "";
    if (skill.type === "timePlus") {
      return `${pushPrefix}TIME+${skill.value.toFixed(1)}秒`;
    }
    if (skill.type === "openingScore") {
      return `${pushPrefix}序盤${skill.duration}秒 スコア+${formatPercent(skill.value)}`;
    }
    if (skill.type === "longWordScore") {
      return `${pushPrefix}${skill.minLength}字+ スコア+${formatPercent(skill.value)}(${skill.charges}回)`;
    }
    if (skill.type === "comboScore") {
      return `${pushPrefix}コンボ中 スコア+${formatPercent(skill.value)}`;
    }
    if (skill.type === "shortWordScore") {
      return `${pushPrefix}${skill.maxLength}字以下 スコア+${formatPercent(skill.value)}(${skill.charges}回)`;
    }
    return "常時スキル";
  }

  function passiveSkillDetail(skill) {
    if (!skill) {
      return "ゲーム開始から常時発動";
    }
    const summary = passiveSkillSummary(skill);
    const pushNote = skill.isPush ? " / 推し効果2倍" : "";
    if (skill.type === "timePlus") {
      return `${summary} / GGG限定 / 通常最大${PASSIVE_SKILL_BALANCE.timePlus.max.toFixed(1)}秒${pushNote}`;
    }
    if (skill.type === "openingScore") {
      return `${summary} / 1凸ごとに+${formatPercent(PASSIVE_SKILL_BALANCE.openingScore.perLimitBreak)} / 通常最大${formatPercent(PASSIVE_SKILL_BALANCE.openingScore.max)}${pushNote}`;
    }
    if (skill.type === "longWordScore") {
      return `${summary} / 1凸ごとに+${formatPercent(PASSIVE_SKILL_BALANCE.longWordScore.perLimitBreak)} / 通常最大${formatPercent(PASSIVE_SKILL_BALANCE.longWordScore.max)}${pushNote}`;
    }
    if (skill.type === "comboScore") {
      return `${summary} / 2コンボ以上で常時${pushNote}`;
    }
    if (skill.type === "shortWordScore") {
      return `${summary} / 短いデッキ向け控えめ補正${pushNote}`;
    }
    return `${summary} / ゲーム開始から常時発動`;
  }

  function passiveSkillHudText(skills = []) {
    if (!skills.length) {
      return "常時スキルなし";
    }
    const labels = skills.slice(0, 2).map((skill) => passiveSkillSummary(skill));
    const rest = skills.length - labels.length;
    return rest > 0 ? `${labels.join(" / ")} +${rest}` : labels.join(" / ");
  }

  function cardSkillSummary(card) {
    if (!card) {
      return "";
    }
    return passiveSkillSummary(passiveSkillForCard(card));
    const power = effectiveSkillPower(card);
    if (card.skillId === "score_boost") {
      return `スコア+${Math.round(power * 100)}%`;
    }
    if (card.skillId === "slow_spawn") {
      return `落下ゆっくり ${Math.round(power)}秒`;
    }
    if (card.skillId === "time_plus") {
      return `タイム+${Math.round(power)}秒`;
    }
    if (card.skillId === "letter_blessing") {
      return `かなパネル${Math.round(power)}個を読みへ`;
    }
    if (card.skillId === "sauce_burst") {
      return `ライン消し${Math.max(1, Math.round(power))}回`;
    }
    return "デッキスキルで発動";
  }

  function cardSkillDetail(card) {
    if (!card) {
      return "デッキスキルで発動";
    }
    return passiveSkillDetail(passiveSkillForCard(card));
    const summary = cardSkillSummary(card);
    if (card.skillId === "score_boost") {
      return `${summary} / 8秒間`;
    }
    if (card.skillId === "slow_spawn") {
      return `${summary} / コンボ猶予も延長`;
    }
    if (card.skillId === "time_plus") {
      return `${summary} / 即時回復`;
    }
    if (card.skillId === "letter_blessing") {
      return `${summary} / 盤面のかなを変化`;
    }
    if (card.skillId === "sauce_burst") {
      return `${summary} / 次の言葉で周辺も消す`;
    }
    return summary || "デッキスキルで発動";
  }

  function renderPackOpeningModal(pack = currentPack()) {
    if (!packOpeningModal || !packOpeningCard) {
      return;
    }
    const reveal =
      state.packOpeningOpen && state.lastPackReveal && (!state.lastPackReveal.packId || state.lastPackReveal.packId === pack.id)
        ? state.lastPackReveal
        : null;
    packOpeningModal.hidden = !reveal;
    packOpeningCard.classList.remove("is-g1", "is-g2", "is-g3", "is-ticket", "is-opening", "is-reduced");
    if (!reveal) {
      return;
    }

    packOpeningCard.classList.add(reveal.tier || "is-ticket");
    packOpeningCard.classList.toggle("is-reduced", state.settings.reduceMotion);
    const card = reveal.cardId ? CARD_BY_ID.get(reveal.cardId) : null;
    const palette = card ? getCardPalette(card.id) : ["#ef5d50", "#f5b642"];
    packOpeningCard.style.setProperty("--opening-a", palette[0]);
    packOpeningCard.style.setProperty("--opening-b", palette[1]);
    if (packOpeningKicker) {
      packOpeningKicker.textContent = reveal.cardId ? "CARD GET" : "SELECT";
    }
    if (packOpeningTitle) {
      packOpeningTitle.textContent = `${pack.displayName} 開封`;
    }
    if (packOpeningRarity) {
      packOpeningRarity.innerHTML = reveal.rarityG ? rarityMarkupFromCount(reveal.rarityG) : ticketRarityMarkup();
    }
    if (packOpeningMeta) {
      packOpeningMeta.textContent = reveal.meta || "カードを確認";
    }
    if (packOpeningName) {
      packOpeningName.setAttribute("aria-label", reveal.name || "");
      packOpeningName.replaceChildren(...Array.from(reveal.name || "").map((letter, index) => {
        const span = document.createElement("span");
        span.className = "pack-opening-letter";
        span.style.setProperty("--letter-index", String(index));
        span.textContent = letter;
        return span;
      }));
    }
    if (packOpeningSkill) {
      packOpeningSkill.replaceChildren();
      packOpeningSkill.hidden = !card;
      if (card) {
        const label = document.createElement("b");
        const name = document.createElement("span");
        const detail = document.createElement("small");
        label.textContent = "効果";
        name.textContent = card.skillName || "スキル";
        detail.textContent = cardSkillSummary(card);
        packOpeningSkill.append(label, name, detail);
      }
    }
    if (packOpeningArtFrame) {
      packOpeningArtFrame.classList.toggle("has-card-art", Boolean(card?.artImage));
    }
    if (packOpeningArt) {
      if (card?.artImage) {
        packOpeningArt.src = card.artImage;
        packOpeningArt.alt = `${card.displayName}のカード絵柄`;
        packOpeningArt.hidden = false;
      } else {
        packOpeningArt.removeAttribute("src");
        packOpeningArt.alt = "";
        packOpeningArt.hidden = true;
      }
    }
    if (packOpeningFallback) {
      packOpeningFallback.textContent = card ? rarityLabel(card) : "選";
      packOpeningFallback.hidden = Boolean(card?.artImage);
    }
    if (packOpeningAction) {
      const actionText = reveal.cardId ? "カードを見る" : state.choiceTickets > 0 ? "チケットを使う" : "カード一覧へ";
      packOpeningAction.textContent = actionText;
      packOpeningAction.setAttribute("aria-label", `${reveal.name} ${actionText}`);
      packOpeningAction.disabled = false;
    }
    if (packOpeningAgain) {
      const sale = packSaleStatus(pack);
      const exchangeRequired = isPackExchangeRequired(pack);
      const canOpenAgain = exchangeRequired || (sale.available && state.packStone >= pack.cost);
      packOpeningAgain.hidden = false;
      packOpeningAgain.disabled = !canOpenAgain;
      packOpeningAgain.textContent = exchangeRequired ? "引換へ" : "もう1回引く";
      packOpeningAgain.setAttribute(
        "aria-label",
        exchangeRequired
          ? `${EXCHANGE_TOKEN_LABEL}を使って交換へ`
          : canOpenAgain
            ? `${pack.displayName}をもう1回引く`
            : `${pack.displayName}をもう1回引くには${G_CURRENCY_LABEL}が不足`,
      );
      packOpeningAgain.title = exchangeRequired
        ? `${EXCHANGE_TOKEN_LABEL} ${packExchangeCost(pack)}/${packExchangeCost(pack)}`
        : canOpenAgain
          ? currencyAmountLabel(pack.cost, { compact: true })
          : sale.available
            ? `${G_CURRENCY_LABEL}不足 ${formatNumber(state.packStone)}/${formatNumber(pack.cost)}`
            : sale.reason;
    }
  }

  function triggerPackOpeningAnimation() {
    if (!packOpeningCard || state.settings.reduceMotion) {
      return;
    }
    packOpeningCard.classList.remove("is-opening");
    void packOpeningCard.offsetWidth;
    packOpeningCard.classList.add("is-opening");
  }

  function resolveGuideCard(cards = []) {
    const allowedIds = new Set(cards.map((card) => card.id));
    const candidateIds = [
      state.guideCardId,
      state.deckIds[state.selectedDeckSlot],
      state.pushCardId,
      cards[0]?.id,
      DATA.basicDeckIds[0],
    ].filter(Boolean);
    const card =
      candidateIds
        .map((id) => CARD_BY_ID.get(id))
        .find((candidate) => candidate && (allowedIds.size === 0 || allowedIds.has(candidate.id))) ||
      cards[0] ||
      visibleCollectionCards()[0] ||
      DATA.cards[0];
    state.guideCardId = card.id;
    return card;
  }

  function renderWordGuide(card) {
    if (!card) {
      return;
    }
    const owned = state.owned[card.id] || 0;
    const deckIndex = state.deckIds.indexOf(card.id);
    const targetSlot = collectionReplaceSlotIndex();
    const targetLabel = formatDeckSlotActionLabel(targetSlot);
    const palette = getTilePalette(card.id);
    const canExchange = canExchangeCardWithMedals(card);
    const exchangeMode = isActivePackExchangeForCard(card);
    const ownedExchangeAction = exchangeMode && owned > 0;
    const deckStatus =
      ownedExchangeAction
        ? `${limitBreakLabelFromOwned(owned)} / 交換で${limitBreakLabelFromOwned(owned + 1)}`
        : deckIndex >= 0
        ? `${deckMembershipLabel(card.id)} / ${formatDeckSlotActionLabel(deckIndex)}`
        : owned > 0
          ? `${limitBreakLabelFromOwned(owned)} / ${targetLabel}へ`
          : canUseChoiceTicketForCard(card)
            ? `選択チケット / ${targetLabel}へ`
            : canExchange
              ? `${EXCHANGE_TOKEN_LABEL} / ${targetLabel}へ`
            : "未所持";
    const actionText =
      ownedExchangeAction
        ? `交換で${limitBreakLabelFromOwned(owned + 1)}`
        : deckIndex >= 0
        ? state.pushCardId === card.id
          ? "推し設定中"
          : "推しにする"
        : owned > 0
          ? `${targetLabel}へ入れる`
          : canUseChoiceTicketForCard(card)
            ? `チケットで${targetLabel}へ`
            : canExchange
              ? `交換して${targetLabel}へ`
              : "パックで入手";
    const actionDisabled =
      state.running ||
      (!ownedExchangeAction && deckIndex >= 0 && state.pushCardId === card.id) ||
      (!ownedExchangeAction && deckIndex < 0 && owned <= 0 && !canUseChoiceTicketForCard(card) && !canExchange);
    wordGuidePanel.style.setProperty("--guide-a", palette[0]);
    wordGuidePanel.style.setProperty("--guide-b", palette[1]);
    wordGuideTitle.textContent = card.displayName;
    wordGuideMeta.innerHTML = `${rarityMarkup(card)} <span class="word-guide-meta-text">/ ${card.readingKana} / ${deckStatus}</span>`;
    wordGuideNote.textContent = card.learnNote || "ことばメモ準備中";
    wordGuideLetters.textContent = `${kanaLength(card.readingKana || card.displayName)}字 / かな ${Array.from(card.readingKana || card.displayName).join("・")}`;
    wordGuideStatus.textContent = `${card.skillName || "スキル"}: ${cardSkillSummary(card) || "常時スキル"}`;
    wordGuideAction.textContent = actionText;
    wordGuideAction.disabled = actionDisabled;
    wordGuideAction.classList.toggle("is-primary", !actionDisabled);
    wordGuideAction.setAttribute("aria-label", `${card.displayName} ${actionText}`);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    drawBackground();
    drawBoardFrame();
    drawSpecialCraneAura();
    const sortedTiles = state.tiles.slice().sort((a, b) => a.row - b.row);
    for (const tile of sortedTiles) {
      drawTile(tile);
    }
    drawClearEffects();
    drawRunEventOverlays();
    drawTutorialHint();
    drawDragHint();
    drawEffectHud();
  }

  function drawBackground() {
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    for (let y = 52; y < height; y += 86) {
      ctx.beginPath();
      ctx.ellipse(width * 0.16, y, 38, 8, -0.16, 0, Math.PI * 2);
      ctx.ellipse(width * 0.82, y + 34, 48, 10, 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255, 250, 235, 0.16)";
    ctx.beginPath();
    ctx.roundRect(14, 72, width - 28, height - 98, 20);
    ctx.fill();
    ctx.restore();
  }

  function drawBoardFrame() {
    ctx.save();
    ctx.shadowColor = "rgba(68, 39, 28, 0.2)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "rgba(255, 247, 226, 0.58)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(board.originX - 9, board.originY - 9, board.width + 18, board.height + 18, 18);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.stroke();
    ctx.strokeStyle = "rgba(113, 84, 59, 0.055)";
    ctx.lineWidth = 1;
    for (let col = 1; col < COLS; col += 1) {
      const x = board.originX + col * (board.tile + board.gap) - board.gap / 2;
      ctx.beginPath();
      ctx.moveTo(x, board.originY - 4);
      ctx.lineTo(x, board.originY + board.height + 4);
      ctx.stroke();
    }
    for (let row = 1; row < ROWS; row += 1) {
      const y = board.originY + row * (board.tile + board.gap) - board.gap / 2;
      ctx.beginPath();
      ctx.moveTo(board.originX - 4, y);
      ctx.lineTo(board.originX + board.width + 4, y);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255, 250, 236, 0.16)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.36)";
    ctx.lineWidth = 1;
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const center = tileCenter(col, row);
        drawOrbPath(center.x, center.y, board.tile * 0.49);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawTile(tile) {
    if (tile.kind === "special") {
      drawSpecialTile(tile);
      return;
    }
    const palette = getTilePalette(tile.cardId);
    const artImage = getLoadedCardArt(tile.cardId);
    const size = board.tile;
    const x = tile.x - size / 2;
    const y = tile.y - size / 2;
    const isSelected = state.dragTile === tile;

    ctx.save();
    if (isSelected) {
      ctx.shadowColor = colorToRgba(palette[1], 0.58);
      ctx.shadowBlur = 14;
      ctx.lineWidth = Math.max(4, size * 0.09);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.96)";
      drawOrbPath(tile.x, tile.y, size * 0.53);
      ctx.stroke();
    }
    drawKanaOrbBase(tile.x, tile.y, size, palette, { artImage });
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.lineWidth = state.settings.highContrast ? 2.2 : 1.1;
    ctx.strokeStyle = isSelected ? "#fff7dc" : colorToRgba(palette[1], state.settings.highContrast ? 0.7 : 0.44);
    drawOrbPath(tile.x, tile.y, size * 0.405);
    ctx.stroke();
    if (state.settings.tileMarks) {
      drawTileMark(tile, x, y, size);
    }
    const textFill = "#fffaf0";
    const kanaScale = state.settings.largeText ? 0.6 : 0.53;
    ctx.font = `900 ${Math.floor(size * kanaScale)}px "Hiragino Sans", "Yu Gothic", "Meiryo", Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;
    ctx.lineWidth = Math.max(state.settings.highContrast ? 4.2 : 3.4, Math.floor(size * (state.settings.highContrast ? 0.11 : 0.09)));
    ctx.strokeStyle = state.settings.highContrast ? "rgba(18, 24, 34, 0.94)" : "rgba(18, 24, 34, 0.78)";
    ctx.shadowColor = "rgba(18, 24, 34, 0.24)";
    ctx.shadowBlur = state.settings.highContrast ? 1 : 2;
    ctx.shadowOffsetY = 1;
    ctx.strokeText(tile.char, tile.x, tile.y + 1);
    ctx.fillStyle = textFill;
    ctx.fillText(tile.char, tile.x, tile.y + 1);
    ctx.restore();
  }

  function drawTileMark(tile, x, y, size) {
    const slotIndex = state.deckIds.indexOf(tile.cardId);
    if (slotIndex < 0) {
      return;
    }
    const label = String(slotIndex + 1);
    const markSize = Math.max(14, Math.floor(size * 0.28));
    const inset = Math.max(3, Math.floor(size * 0.06));
    const markX = x + size - markSize - inset;
    const markY = y + inset;

    ctx.save();
    ctx.shadowColor = "rgba(18, 24, 34, 0.22)";
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 1;
    const centerX = markX + markSize / 2;
    const centerY = markY + markSize / 2;
    const badgeGradient = ctx.createLinearGradient(markX, markY, markX + markSize, markY + markSize);
    badgeGradient.addColorStop(0, state.settings.highContrast ? "#1f2937" : "rgba(36, 46, 63, 0.9)");
    badgeGradient.addColorStop(1, state.settings.highContrast ? "#000000" : "rgba(18, 24, 34, 0.72)");
    ctx.fillStyle = badgeGradient;
    drawOrbPath(centerX, centerY, markSize / 2);
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, size * 0.035);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
    ctx.stroke();
    ctx.fillStyle = "#fffaf0";
    ctx.font = `900 ${Math.floor(markSize * 0.64)}px "Hiragino Sans", "Yu Gothic", "Meiryo", Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "transparent";
    ctx.fillText(label, centerX, centerY + 0.5);
    ctx.restore();
  }

  function drawSpecialTile(tile) {
    const colors = SPECIAL_COLORS[tile.special.id] || SPECIAL_COLORS.jam;
    const size = board.tile;
    const x = tile.x - size / 2;
    const y = tile.y - size / 2;
    const pulse = state.settings.reduceMotion ? 0.48 : 0.5 + Math.sin(((lastFrame || performance.now()) + tile.id * 73) / 190) * 0.2;

    ctx.save();
    drawKanaOrbBase(tile.x, tile.y, size, colors, {
      glowColor: colorToRgba(colors[1], 0.58),
      glowBlur: 14 + pulse * 10,
    });
    ctx.strokeStyle = colorToRgba(lightenColor(colors[1], 0.24), 0.7);
    ctx.lineWidth = Math.max(1.5, size * 0.035);
    drawOrbPath(tile.x, tile.y, size * 0.43 + pulse * 1.5);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 247, 203, 0.96)";
    drawOrbPath(x + size - 10, y + 10, Math.max(3.2, size * 0.08 + pulse * 2));
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.94)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x + 9, y + size * 0.22);
    ctx.lineTo(x + 18, y + size * 0.22);
    ctx.moveTo(x + 13.5, y + size * 0.22 - 4.5);
    ctx.lineTo(x + 13.5, y + size * 0.22 + 4.5);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    const labelScale = Array.from(tile.special.shortLabel).length > 2 ? 0.28 : 0.37;
    ctx.font = `900 ${Math.floor(size * labelScale)}px "Hiragino Sans", "Yu Gothic", Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = Math.max(3, Math.floor(size * 0.075));
    ctx.strokeStyle = "rgba(22, 30, 42, 0.48)";
    ctx.shadowColor = "rgba(255, 247, 203, 0.72)";
    ctx.shadowBlur = 8;
    ctx.strokeText(tile.special.shortLabel, tile.x, tile.y + 1);
    ctx.fillText(tile.special.shortLabel, tile.x, tile.y + 1);
    ctx.restore();
  }

  function drawDragHint() {
    if (!state.dragTile) {
      return;
    }
    const size = board.tile;
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 3;
    drawOrbPath(state.dragTile.x, state.dragTile.y, size * 0.56);
    ctx.stroke();
    ctx.restore();
  }

  function drawTutorialHint() {
    if (!state.tutorial.active) {
      return;
    }
    const fromTile = tileAt(state.tutorial.hintFrom.col, state.tutorial.hintFrom.row);
    const toTile = tileAt(state.tutorial.hintTo.col, state.tutorial.hintTo.row);
    if (!fromTile || !toTile) {
      return;
    }

    const pulse = state.settings.reduceMotion ? 0.35 : 0.5 + Math.sin((lastFrame || performance.now()) / 180) * 0.5;
    const from = { x: fromTile.x, y: fromTile.y };
    const to = { x: toTile.x, y: toTile.y };
    const radius = board.tile * (0.54 + pulse * 0.08);
    const arrowStartX = from.x - board.tile * 0.22;
    const arrowEndX = to.x + board.tile * 0.22;
    const y = from.y;

    ctx.save();
    ctx.globalAlpha = 0.82;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(245, 182, 66, 0.72)";
    ctx.shadowBlur = 12;
    for (const point of [from, to]) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(255, 246, 202, 0.96)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(arrowStartX, y);
    ctx.lineTo(arrowEndX, y);
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 246, 202, 0.96)";
    ctx.beginPath();
    ctx.moveTo(arrowEndX - 2, y);
    ctx.lineTo(arrowEndX + 10, y - 8);
    ctx.lineTo(arrowEndX + 10, y + 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawClearEffects() {
    if (state.effects.length === 0) {
      return;
    }
    for (const effect of state.effects) {
      const t = Math.min(1, effect.age / effect.duration);
      const alpha = 1 - easeOutCubic(t);
      if (effect.type === "tile-pop") {
        drawTilePopEffect(effect, t, alpha);
      } else if (effect.type === "ring") {
        drawRingEffect(effect, t, alpha);
      } else if (effect.type === "particle") {
        drawParticleEffect(effect, t, alpha);
      } else if (effect.type === "score") {
        drawScoreEffect(effect, t, alpha);
      }
    }
  }

  function drawTilePopEffect(effect, t, alpha) {
    const size = effect.size * (1 + t * 0.28);
    const y = effect.y - t * 8;
    const palette = effect.palette;

    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.72);
    drawKanaOrbBase(effect.x, y, size, palette, {
      glowColor: colorToRgba(palette[1], 0.5),
      glowBlur: 14,
    });
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.88)";
    ctx.lineWidth = 2;
    drawOrbPath(effect.x, y, size * 0.49);
    ctx.stroke();
    if (effect.char) {
      ctx.font = `900 ${Math.floor(effect.size * 0.5)}px "Hiragino Sans", "Yu Gothic", "Meiryo", Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = Math.max(3, Math.floor(effect.size * 0.08));
      ctx.strokeStyle = "rgba(18, 24, 34, 0.7)";
      ctx.fillStyle = "#fffaf0";
      ctx.strokeText(effect.char, effect.x, y + 1);
      ctx.fillText(effect.char, effect.x, y + 1);
    }
    ctx.restore();
  }

  function drawRingEffect(effect, t, alpha) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.strokeStyle = colorToRgba(effect.color, 0.86);
    ctx.lineWidth = Math.max(2, effect.size * (0.08 - t * 0.04));
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.size * (0.3 + t * 0.54), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawParticleEffect(effect, t, alpha) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.9);
    ctx.translate(effect.x, effect.y);
    ctx.rotate(effect.rotation);
    ctx.fillStyle = effect.color;
    ctx.shadowColor = colorToRgba(effect.color, 0.32);
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.roundRect(-effect.size / 2, -effect.size / 3, effect.size, effect.size * 0.66, 2);
    ctx.fill();
    ctx.restore();
  }

  function drawScoreEffect(effect, t, alpha) {
    const isHudLane = effect.lane === "hud";
    const safeHudY = isHudLane ? effectHudLaneCenterY() : null;
    if (isHudLane && safeHudY === null) {
      return;
    }
    const y = (isHudLane ? safeHudY : effect.y) - easeOutCubic(t) * (isHudLane ? 8 : 32);
    const x = Math.max(board.originX + 36, Math.min(board.originX + board.width - 36, effect.x));
    ctx.save();
    ctx.globalAlpha = Math.min(1, alpha * (isHudLane ? 0.82 : 1.45));
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 ${Math.max(14, Math.floor(board.tile * (isHudLane ? 0.28 : 0.42)))}px "Hiragino Sans", "Yu Gothic", "Meiryo", Arial, sans-serif`;
    ctx.lineWidth = isHudLane ? 3 : 5;
    ctx.strokeStyle = "rgba(18, 24, 34, 0.56)";
    ctx.fillStyle = "#fff7dc";
    ctx.shadowColor = colorToRgba(effect.color, 0.58);
    ctx.shadowBlur = 12;
    ctx.strokeText(effect.text, x, y);
    ctx.fillText(effect.text, x, y);
    ctx.restore();
  }

  function drawRunEventOverlays() {
    if (!state.running || state.startCountdown > 0) {
      return;
    }
    const crane = state.specialCrane || {};
    if (crane.triggered && (crane.active || crane.timer < 4.8)) {
      drawSpecialCraneEdgeSparkles();
    }
    if (crane.triggered && crane.timer < 4.8) {
      drawSpecialCraneOverlay();
    }
  }

  function drawSpecialCraneOverlay() {
    const image = RUN_ART_IMAGES.get("special-crane");
    const timer = state.specialCrane.timer || 0;
    const flyT = Math.min(1, timer / (state.settings.reduceMotion ? 0.8 : 1.8));
    const eased = easeOutCubic(flyT);
    const aspect = image?.naturalWidth > 0 && image?.naturalHeight > 0 ? image.naturalHeight / image.naturalWidth : 0.56;
    const w = Math.min(board.width * 0.62, 224);
    const h = w * aspect;
    const startX = board.originX + board.width + w * 0.24;
    const endX = board.originX + board.width - w + 10;
    const x = startX + (endX - startX) * eased + Math.sin(timer * 2.8) * 3;
    const y = Math.max(8, board.originY - h - 18) + Math.sin(timer * 4.2) * (state.settings.reduceMotion ? 0 : 2.5);
    const fadeOut = timer > 3.9 ? Math.max(0, 1 - (timer - 3.9) / 0.9) : 1;
    ctx.save();
    ctx.globalAlpha = Math.min(1, 0.34 + eased * 0.82) * fadeOut;
    ctx.shadowColor = "rgba(245, 182, 66, 0.48)";
    ctx.shadowBlur = 24;
    if (image?.complete && image.naturalWidth > 0) {
      ctx.drawImage(image, x, y, w, h);
    } else {
      drawSpecialCraneFallback(x, y, w, h);
    }
    ctx.restore();
    drawHudRibbon("上毛鶴 +3%", "#0d9488", "#5ac8c1", board.originY + board.tile * 1.2);
  }

  function specialCraneVisualStrength() {
    const crane = state.specialCrane || {};
    if (!state.running || state.startCountdown > 0 || !crane.triggered) {
      return 0;
    }
    if (crane.active) {
      return 1;
    }
    if (crane.timer < 4.8) {
      return Math.max(0, 1 - Math.max(0, crane.timer - 3.8) / 1);
    }
    return 0;
  }

  function drawSpecialCraneAura() {
    const strength = specialCraneVisualStrength();
    if (strength <= 0) {
      return;
    }
    const timer = state.specialCrane.timer || 0;
    const pulse = state.settings.reduceMotion ? 0.5 : 0.5 + Math.sin(timer * 5.4) * 0.5;
    const outerX = board.originX - 10;
    const outerY = board.originY - 10;
    const outerW = board.width + 20;
    const outerH = board.height + 20;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = strength;
    const topGlow = ctx.createLinearGradient(0, board.originY - 20, 0, board.originY + board.tile * 1.35);
    topGlow.addColorStop(0, "rgba(255, 221, 130, 0.24)");
    topGlow.addColorStop(0.42, "rgba(61, 188, 176, 0.11)");
    topGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = topGlow;
    ctx.fillRect(board.originX - 6, Math.max(0, board.originY - 22), board.width + 12, board.tile * 1.55);
    ctx.strokeStyle = `rgba(245, 182, 66, ${0.3 + pulse * 0.18})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(245, 182, 66, 0.4)";
    ctx.shadowBlur = 14 + pulse * 6;
    ctx.beginPath();
    ctx.roundRect(outerX, outerY, outerW, outerH, 19);
    ctx.stroke();
    ctx.strokeStyle = "rgba(55, 191, 178, 0.24)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(55, 191, 178, 0.32)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(outerX + 4, outerY + 4, outerW - 8, outerH - 8, 15);
    ctx.stroke();
    ctx.restore();
  }

  function drawSpecialCraneEdgeSparkles() {
    const strength = specialCraneVisualStrength();
    if (strength <= 0) {
      return;
    }
    const timer = state.specialCrane.timer || 0;
    const points = [
      [board.originX + board.width * 0.14, board.originY - 14, 0],
      [board.originX + board.width * 0.5, board.originY - 18, 1.7],
      [board.originX + board.width - 18, board.originY + board.tile * 0.18, 3.1],
      [board.originX + 14, board.originY + board.height - 16, 4.3],
      [board.originX + board.width - 16, board.originY + board.height - 18, 5.2],
    ];
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (const [x, y, offset] of points) {
      const twinkle = state.settings.reduceMotion ? 0.75 : 0.55 + Math.sin(timer * 5.8 + offset) * 0.45;
      const size = 4 + twinkle * 5;
      ctx.globalAlpha = strength * (0.4 + twinkle * 0.48);
      ctx.strokeStyle = "rgba(255, 244, 190, 0.9)";
      ctx.lineWidth = 1.4;
      ctx.shadowColor = "rgba(245, 182, 66, 0.7)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y);
      ctx.moveTo(x, y - size);
      ctx.lineTo(x, y + size);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 214, 105, 0.76)";
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1.4, size * 0.18), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSpecialCraneFallback(x, y, w, h) {
    ctx.fillStyle = "#fff4c8";
    ctx.strokeStyle = "#d99945";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.04, y + h * 0.52);
    ctx.lineTo(x + w * 0.52, y + h * 0.18);
    ctx.lineTo(x + w * 0.7, y + h * 0.58);
    ctx.lineTo(x + w * 0.96, y + h * 0.36);
    ctx.lineTo(x + w * 0.76, y + h * 0.72);
    ctx.lineTo(x + w * 0.45, y + h * 0.66);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawHudRibbon(text, colorA, colorB, y) {
    const ribbonW = Math.min(board.width - 38, 210);
    const ribbonH = 28;
    const safeTop = effectHudLaneTopY(ribbonH);
    if (safeTop === null) {
      return;
    }
    const top = Math.min(y, safeTop);
    const x = board.originX + (board.width - ribbonW) / 2;
    const gradient = ctx.createLinearGradient(x, top, x + ribbonW, top + ribbonH);
    gradient.addColorStop(0, colorA);
    gradient.addColorStop(1, colorB);
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.shadowColor = colorToRgba(colorB, 0.38);
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(x, top, ribbonW, ribbonH, 999);
    ctx.fill();
    ctx.fillStyle = "#fffaf0";
    ctx.font = '900 13px "Hiragino Sans", "Yu Gothic", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + ribbonW / 2, top + ribbonH / 2 + 0.5);
    ctx.restore();
  }

  function effectHudLaneTopY(height = 28) {
    const top = board.originY - height - 8;
    return top >= 8 ? top : null;
  }

  function effectHudLaneCenterY(height = 28) {
    const top = effectHudLaneTopY(height);
    return top === null ? null : top + height / 2;
  }

  function drawEffectHud() {
    // Keep combo and temporary-skill chips off the live puzzle field.
  }

  function tileCenter(col, row) {
    return {
      x: board.originX + col * (board.tile + board.gap) + board.tile / 2,
      y: board.originY + row * (board.tile + board.gap) + board.tile / 2,
    };
  }

  function tileAt(col, row) {
    return state.tiles.find((tile) => tile.col === col && tile.row === row) || null;
  }

  function pickTile(x, y) {
    return (
      state.tiles.find((tile) => {
        const half = board.tile / 2;
        return x >= tile.x - half && x <= tile.x + half && y >= tile.y - half && y <= tile.y + half;
      }) || null
    );
  }

  function insideBoard(col, row) {
    return col >= 0 && col < COLS && row >= 0 && row < ROWS;
  }

  function gridKey(col, row) {
    return `${col},${row}`;
  }

  function sameCell(a, b) {
    return Boolean(a && b && a.col === b.col && a.row === b.row);
  }

  function areGridAdjacent(a, b) {
    return Math.abs(a.col - b.col) + Math.abs(a.row - b.row) === 1;
  }

  function nearestSelectedGridDistance(tile, selected) {
    return selected.reduce((best, selectedTile) => Math.min(best, Math.abs(tile.col - selectedTile.col) + Math.abs(tile.row - selectedTile.row)), Infinity);
  }

  function countLetters(letters) {
    const counts = new Map();
    for (const letter of letters) {
      counts.set(letter, (counts.get(letter) || 0) + 1);
    }
    return counts;
  }

  function buildCharPool() {
    return state.deckIds.flatMap((id) => {
      const card = CARD_BY_ID.get(id);
      return Array.from(card.readingKana).map((char) => ({
        char,
        cardId: id,
      }));
    });
  }

  function kanaLength(value) {
    return Array.from(value || "").length;
  }

  function evaluateDeckProfile(deckIds = state.deckIds) {
    const cards = deckIds.map((id) => CARD_BY_ID.get(id)).filter(Boolean);
    const lengths = cards.map((card) => kanaLength(card.readingKana));
    const totalLetters = lengths.reduce((sum, length) => sum + length, 0);
    const counts = new Map();
    for (const card of cards) {
      for (const char of Array.from(card.readingKana)) {
        counts.set(char, (counts.get(char) || 0) + 1);
      }
    }
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
    const isRewardEligible = true;
    const rankLabel = rank.toUpperCase();
    const label = `${rankLabel}${theme ? " THEME" : ""}`;
    const description = rank === "expert"
      ? "上級向け 高スコア倍率 / 文字種類も豊富"
      : rank === "hard"
        ? "高スコア向け / 長めの言葉を狙う"
        : rank === "easy"
          ? `遊びやすい / 報酬あり / スコアとEXPは控えめ`
          : "標準バランス / 扱いやすい";
    return {
      cards,
      counts,
      totalLetters,
      uniqueLetters,
      maxLetterCount,
      maxLetterRate,
      shortCardCount,
      longCardCount,
      theme,
      rank,
      rankLabel,
      label,
      scoreMultiplier,
      rewardMultiplier,
      isRewardEligible,
      description,
    };
  }

  function baseWordScore(length) {
    const safeLength = Math.max(0, Math.floor(Number(length) || 0));
    const scoreMultiplier = SCORE_LENGTH_MULTIPLIERS[Math.min(safeLength, 8)] ?? SCORE_LENGTH_MULTIPLIERS[8] ?? 1;
    return Math.round(SCORE_LENGTH_CUBE_FACTOR * safeLength * safeLength * safeLength * scoreMultiplier);
  }

  function runCardClearCount(cardId) {
    const clears = state.runStats?.cardClears || {};
    return clampInteger(clears[cardId] || 0, 0, 9999);
  }

  function cardRepeatScoreMultiplier(cardId, wordLength) {
    const safeLength = Math.max(0, Math.floor(Number(wordLength) || 0));
    if (safeLength >= 5) {
      return 1;
    }
    const clearCount = runCardClearCount(cardId);
    const isShort = safeLength <= 3;
    const start = isShort ? REPEAT_FATIGUE_CONFIG.shortStart : REPEAT_FATIGUE_CONFIG.midStart;
    const step = isShort ? REPEAT_FATIGUE_CONFIG.shortStep : REPEAT_FATIGUE_CONFIG.midStep;
    const min = isShort ? REPEAT_FATIGUE_CONFIG.shortMin : REPEAT_FATIGUE_CONFIG.midMin;
    const fatigueSteps = Math.max(0, clearCount - start + 1);
    return Math.max(min, 1 - fatigueSteps * step);
  }

  function skillMeterGainForMatch(cardId, wordLength) {
    const safeLength = Math.max(0, Math.floor(Number(wordLength) || 0));
    const isPush = cardId === state.pushCardId;
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

  function randomCharEntry() {
    return state.charPool.length > 0 ? state.charPool[Math.floor(state.rng() * state.charPool.length)] : { char: "ぐ", cardId: state.pushCardId };
  }

  function effectiveSkillPower(card) {
    if (!card) {
      return 0;
    }
    const limitBreak = skillLimitBreak(card);
    const rarityMultiplier = RARITY_SKILL_MULTIPLIERS[card.rarityG] || 1;
    return card.skillPower * rarityMultiplier * (1 + limitBreak * 0.02);
  }

  function pointerPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * width,
      y: ((event.clientY - rect.top) / rect.height) * height,
    };
  }

  function weightedPick(items, key, rng) {
    const total = items.reduce((sum, item) => sum + item[key], 0);
    let roll = rng() * total;
    for (const item of items) {
      roll -= item[key];
      if (roll <= 0) {
        return item;
      }
    }
    return items[items.length - 1];
  }

  function shuffle(items, rng) {
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
  }

  function mulberry32(seed) {
    return function next() {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function rarityLabel(card) {
    return "G".repeat(Math.max(1, Math.min(3, Number(card.rarityG) || 1)));
  }

  function rarityMarkup(card) {
    return rarityMarkupFromCount(card?.rarityG || 1);
  }

  function rarityMarkupFromRateLabel(label) {
    const match = /^G(\d)$/i.exec(label);
    if (match) {
      return rarityMarkupFromCount(Number(match[1]));
    }
    if (label === "choice-ticket" || label === "SELECT") {
      return ticketRarityMarkup();
    }
    return label;
  }

  function ticketRarityMarkup() {
    return `<span class="ticket-rarity-badge">選択券</span>`;
  }

  function rarityMarkupFromCount(count) {
    const safeCount = Math.max(1, Math.min(3, Number(count) || 1));
    const text = "G".repeat(safeCount);
    return `<span class="g-rarity-icons" aria-label="${text}">${Array.from({ length: safeCount }, () => "<span>G</span>").join("")}</span>`;
  }

  function formatNumber(value) {
    return Math.round(value).toLocaleString("ja-JP");
  }

  function clampInteger(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return min;
    }
    return Math.max(min, Math.min(max, Math.floor(number)));
  }

  function normalizePurchaseBundles(bundles) {
    const fallback = [
      { id: "g-12", amount: 12, bonus: 0, priceLabel: "240円" },
      { id: "g-55", amount: 55, bonus: 5, priceLabel: "650円" },
      { id: "g-120", amount: 120, bonus: 20, priceLabel: "1,200円" },
      { id: "g-260", amount: 260, bonus: 60, priceLabel: "2,400円" },
    ];
    const source = Array.isArray(bundles) && bundles.length ? bundles : fallback;
    return source
      .map((bundle, index) => ({
        id: sanitizeTelemetryText(bundle.id || `g-${index + 1}`, 36),
        amount: clampInteger(bundle.amount || 0, 1, 9999),
        bonus: clampInteger(bundle.bonus || 0, 0, 9999),
        priceLabel: sanitizeTelemetryText(bundle.priceLabel || "-", 24),
        badge: sanitizeTelemetryText(bundle.badge || "", 24),
      }))
      .filter((bundle) => bundle.amount > 0);
  }

  function applyCardPalette(element, card, slotIndex = -1) {
    const palette = slotIndex >= 0 ? getDeckSlotPalette(slotIndex) : getCardPalette(card.id);
    const preset = slotIndex >= 0 ? getDeckSlotColor(slotIndex) : null;
    element.style.setProperty("--card-a", palette[0]);
    element.style.setProperty("--card-b", palette[1]);
    element.style.setProperty("--slot-ring", preset ? preset.ring : "rgba(13, 148, 136, 0.26)");
    if (card.artImage) {
      element.classList.add("has-art");
      element.style.setProperty("--card-image", `url("${card.artImage}")`);
    } else {
      element.classList.remove("has-art");
      element.style.removeProperty("--card-image");
    }
  }

  function getCardPalette(cardId) {
    const card = CARD_BY_ID.get(cardId);
    return card ? CARD_PALETTES[card.artKey] || CARD_PALETTES["festival-red"] : CARD_PALETTES["festival-red"];
  }

  function normalizeDeckSlotColors() {
    while (state.deckSlotColors.length < state.deckIds.length) {
      state.deckSlotColors.push(firstAvailableSlotColor(state.deckSlotColors));
    }
    if (state.deckSlotColors.length > state.deckIds.length) {
      state.deckSlotColors.length = state.deckIds.length;
    }
    const seen = new Set();
    for (let index = 0; index < state.deckSlotColors.length; index += 1) {
      if (!SLOT_COLOR_BY_ID.has(state.deckSlotColors[index]) || seen.has(state.deckSlotColors[index])) {
        state.deckSlotColors[index] = firstAvailableSlotColor(state.deckSlotColors, index);
      }
      seen.add(state.deckSlotColors[index]);
    }
  }

  function firstAvailableSlotColor(colors, currentIndex = -1) {
    const used = new Set(colors.filter((_, index) => index !== currentIndex));
    const preset = SLOT_COLOR_PRESETS.find((candidate) => !used.has(candidate.id)) || SLOT_COLOR_PRESETS[0];
    return preset.id;
  }

  function cycleDeckSlotColor(slotIndex) {
    normalizeDeckSlotColors();
    const used = new Set(state.deckSlotColors.filter((_, index) => index !== slotIndex));
    const currentId = state.deckSlotColors[slotIndex];
    const currentIndex = Math.max(0, SLOT_COLOR_PRESETS.findIndex((preset) => preset.id === currentId));
    for (let offset = 1; offset <= SLOT_COLOR_PRESETS.length; offset += 1) {
      const candidate = SLOT_COLOR_PRESETS[(currentIndex + offset) % SLOT_COLOR_PRESETS.length];
      if (!used.has(candidate.id) || state.deckIds.length > SLOT_COLOR_PRESETS.length) {
        state.deckSlotColors[slotIndex] = candidate.id;
        saveState();
        renderAll();
        draw();
        playSound("tap");
        showToast(`${formatDeckSlotLabel(slotIndex)}`);
        return;
      }
    }
  }

  function getDeckSlotColor(slotIndex) {
    normalizeDeckSlotColors();
    return SLOT_COLOR_BY_ID.get(state.deckSlotColors[slotIndex]) || SLOT_COLOR_PRESETS[0];
  }

  function getDeckSlotPalette(slotIndex) {
    return getDeckSlotColor(slotIndex).colors;
  }

  function getTilePalette(cardId) {
    const slotIndex = state.deckIds.indexOf(cardId);
    return slotIndex >= 0 ? getDeckSlotPalette(slotIndex) : getCardPalette(cardId);
  }

  function getLoadedCardArt(cardId) {
    const image = CARD_ART_IMAGES.get(cardId);
    if (!image || !image.complete || image.naturalWidth <= 0) {
      return null;
    }
    return image;
  }

  function drawRoundedTilePath(x, y, size, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, radius);
  }

  function drawOrbPath(cx, cy, radius) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  }

  function drawKanaOrbBase(cx, cy, size, palette, options = {}) {
    const outerRadius = size * 0.48;
    const innerRadius = size * 0.39;
    const artImage = options.artImage || null;
    const glowColor = options.glowColor || "rgba(68, 39, 28, 0.24)";

    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = options.glowBlur ?? 9;
    ctx.shadowOffsetY = options.glowOffsetY ?? 3;

    const rimGradient = ctx.createLinearGradient(cx - outerRadius, cy - outerRadius, cx + outerRadius, cy + outerRadius);
    rimGradient.addColorStop(0, "#fffdf4");
    rimGradient.addColorStop(0.28, "#fff4cf");
    rimGradient.addColorStop(0.7, lightenColor(palette[1], 0.22));
    rimGradient.addColorStop(1, "#c9902a");
    ctx.fillStyle = rimGradient;
    drawOrbPath(cx, cy, outerRadius);
    ctx.fill();

    ctx.shadowColor = "transparent";
    const innerGradient = ctx.createRadialGradient(cx - innerRadius * 0.34, cy - innerRadius * 0.42, innerRadius * 0.08, cx, cy, innerRadius * 1.06);
    innerGradient.addColorStop(0, lightenColor(palette[1], 0.34));
    innerGradient.addColorStop(0.46, palette[0]);
    innerGradient.addColorStop(1, darkenColor(palette[0], 0.2));
    ctx.fillStyle = innerGradient;
    drawOrbPath(cx, cy, innerRadius);
    ctx.fill();

    if (artImage) {
      ctx.save();
      drawOrbPath(cx, cy, innerRadius);
      ctx.clip();
      ctx.globalAlpha = state.settings.highContrast ? 0.2 : 0.34;
      ctx.filter = state.settings.highContrast ? "saturate(0.72) contrast(0.86)" : "saturate(0.9) contrast(1.02)";
      drawCoverImage(artImage, cx - innerRadius, cy - innerRadius, innerRadius * 2, innerRadius * 2);
      ctx.filter = "none";
      ctx.globalAlpha = state.settings.highContrast ? 0.58 : 0.42;
      ctx.fillStyle = colorToRgba(palette[0], 0.72);
      ctx.fillRect(cx - innerRadius, cy - innerRadius, innerRadius * 2, innerRadius * 2);
      ctx.restore();
    }

    const shade = ctx.createLinearGradient(cx, cy - innerRadius, cx, cy + innerRadius);
    shade.addColorStop(0, "rgba(255,255,255,0.2)");
    shade.addColorStop(0.55, "rgba(255,255,255,0)");
    shade.addColorStop(1, "rgba(18, 24, 34, 0.28)");
    ctx.fillStyle = shade;
    drawOrbPath(cx, cy, innerRadius);
    ctx.fill();

    ctx.lineWidth = Math.max(1.8, size * 0.045);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
    drawOrbPath(cx, cy, outerRadius - 0.8);
    ctx.stroke();

    ctx.lineWidth = Math.max(1, size * 0.025);
    ctx.strokeStyle = state.settings.highContrast ? "rgba(18, 24, 34, 0.64)" : "rgba(111, 74, 48, 0.2)";
    drawOrbPath(cx, cy, innerRadius);
    ctx.stroke();

    ctx.save();
    ctx.globalAlpha = state.settings.highContrast ? 0.56 : 0.72;
    ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
    ctx.translate(cx - innerRadius * 0.27, cy - innerRadius * 0.34);
    ctx.rotate(-0.42);
    ctx.beginPath();
    ctx.ellipse(0, 0, innerRadius * 0.33, innerRadius * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "rgba(255, 247, 203, 0.92)";
    drawOrbPath(cx + innerRadius * 0.42, cy - innerRadius * 0.42, Math.max(2.2, size * 0.055));
    ctx.fill();

    ctx.restore();
    return { outerRadius, innerRadius };
  }

  function drawCoverImage(image, x, y, widthValue, heightValue) {
    const sourceRatio = image.naturalWidth / image.naturalHeight;
    const targetRatio = widthValue / heightValue;
    let sourceWidth = image.naturalWidth;
    let sourceHeight = image.naturalHeight;
    let sourceX = 0;
    let sourceY = 0;
    if (sourceRatio > targetRatio) {
      sourceWidth = image.naturalHeight * targetRatio;
      sourceX = (image.naturalWidth - sourceWidth) / 2;
    } else {
      sourceHeight = image.naturalWidth / targetRatio;
      sourceY = (image.naturalHeight - sourceHeight) / 2;
    }
    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, widthValue, heightValue);
  }

  function readableTextColor(palette) {
    const average = palette.reduce((sum, color) => sum + colorLuminance(color), 0) / palette.length;
    return average < 0.43 ? "#ffffff" : "#172033";
  }

  function colorLuminance(hex) {
    const value = hex.replace("#", "");
    const r = parseInt(value.slice(0, 2), 16) / 255;
    const g = parseInt(value.slice(2, 4), 16) / 255;
    const b = parseInt(value.slice(4, 6), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function colorToRgba(hex, alpha) {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function lightenColor(hex, amount) {
    return mixColor(hex, "#ffffff", amount);
  }

  function darkenColor(hex, amount) {
    return mixColor(hex, "#172033", amount);
  }

  function mixColor(a, b, amount) {
    const left = hexToRgb(a);
    const right = hexToRgb(b);
    const mixed = left.map((value, index) => Math.round(value * (1 - amount) + right[index] * amount));
    return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
  }

  function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
  }

  function hexToRgb(hex) {
    const value = hex.replace("#", "");
    return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
  }

  function showToast(message) {
    if (state.currentScreen === "game" && state.running) {
      toast.textContent = message;
      toast.classList.remove("is-visible");
      toastTimer = 0;
      return;
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = 1.45;
  }

  function showWordCall(card, score, comboCount = 1) {
    if (!card) {
      return;
    }
    wordCallText.textContent = card.displayName;
    wordCallScore.textContent = comboCount > 1 ? `+${formatNumber(score)} / ${comboCount} COMBO` : `+${formatNumber(score)}`;
    wordCall.style.setProperty("--word-a", getTilePalette(card.id)[0]);
    wordCall.style.setProperty("--word-b", getTilePalette(card.id)[1]);
    wordCall.classList.remove("is-visible");
    void wordCall.offsetWidth;
    wordCall.classList.add("is-visible");
    wordCall.setAttribute("aria-hidden", "false");
    if (wordCallTimer) {
      window.clearTimeout(wordCallTimer);
    }
    const duration = state.settings.reduceMotion ? 820 : 1180;
    wordCallTimer = window.setTimeout(() => hideWordCall(), duration);
  }

  function hideWordCall() {
    wordCall.classList.remove("is-visible");
    wordCall.setAttribute("aria-hidden", "true");
    if (wordCallTimer) {
      window.clearTimeout(wordCallTimer);
      wordCallTimer = 0;
    }
  }

  window.KanaGunmaPrototype = {
    data: DATA,
    state,
    buildInfo: BUILD_INFO,
    formatBuildLabel,
    buildCharPool,
    startRun,
    finishRun,
    pauseRun,
    resumeRun,
    quitRun,
    returnHomeFromResult,
    openPack,
    findAutoMatch,
    findAutoMatches,
    showScreen,
    slotColorPresets: SLOT_COLOR_PRESETS,
    warmupRuns: WARMUP_RUNS,
    staminaMax: STAMINA_MAX,
    staminaCost: STAMINA_COST,
    staminaRecoverySeconds: STAMINA_RECOVERY_SECONDS,
    recoverStamina,
    recoverStaminaByAd,
    recoverStaminaWithG,
    buyGBundle,
    gPurchaseBundles: G_PURCHASE_BUNDLES,
    gStaminaFullRecoveryCost: G_STAMINA_FULL_RECOVERY_COST,
    formatStaminaCountdown,
    todayDateKey,
    previousDateKey,
    currentWeekKey,
    dailyWordCard,
    dailyScoreTarget: DAILY_SCORE_TARGET,
    weeklyChallenge: WEEKLY_CHALLENGE,
    dailyMissionCatalog: DAILY_MISSION_CATALOG,
    weeklyMissionCatalog: WEEKLY_MISSION_CATALOG,
    currentDailyMissionDefinition,
    currentWeeklyMissionDefinition,
    formatMissionProgress,
    dailyGift: DAILY_GIFT,
    claimDailyGift,
    updateDailyScoreTarget,
    addDailyMissionProgress,
    updateDailyMissionFromRun,
    addWeeklyChallengeProgress,
    updateWeeklyChallengeFromRun,
    updateDailyStreakOnClaim,
    createResultImageDataUrl,
    createResultImageBlob,
    buildShareText,
    buildFeedbackReport,
    buildFeedbackInsightStats,
    recordQuickFeedback,
    quickFeedbackOptions: QUICK_FEEDBACK_OPTIONS,
    syncRanking,
    queueRankingSubmission,
    buildPlayerProfilePayload,
    syncPlayerProfile,
    buildOnlineSeasonRankingEntries,
    buildDailyRankingEntries,
    ownDailyRank,
    updateDailyRankingBestScore,
    claimYesterdayDailyRankingReward,
    playerRankProgress,
    cycleDeckSlotColor,
    getTilePalette,
    buildPassiveSkills,
    passiveSkillForCard,
    passiveSkillSummary,
  };
})();
