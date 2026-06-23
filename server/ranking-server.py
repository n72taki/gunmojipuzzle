import json
import os
import re
import sqlite3
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse


HOST = os.environ.get("RANKING_HOST", "127.0.0.1")
PORT = int(os.environ.get("RANKING_PORT") or os.environ.get("PORT") or "8787")
DATABASE_URL = os.environ.get("DATABASE_URL") or os.environ.get("RANKING_DATABASE_URL") or ""
DB_PATH = Path(os.environ.get("RANKING_DB_PATH", Path(__file__).with_name("ranking.sqlite3")))
BACKEND = "postgres" if DATABASE_URL else "sqlite"
MAX_ENTRIES = 100
MAX_SCORE = int(os.environ.get("RANKING_MAX_SCORE", "1500000"))
RATE_LIMIT_WINDOW_SECONDS = int(os.environ.get("RANKING_RATE_LIMIT_WINDOW_SECONDS", "60"))
RATE_LIMIT_MAX = int(os.environ.get("RANKING_RATE_LIMIT_MAX", "30"))
DB_CONNECT_RETRIES = int(os.environ.get("RANKING_DB_CONNECT_RETRIES", "6"))
DB_CONNECT_DELAY_SECONDS = float(os.environ.get("RANKING_DB_CONNECT_DELAY_SECONDS", "5"))
PLAYER_ID_PATTERN = re.compile(r"^player-[a-z0-9-]{8,80}$", re.IGNORECASE)
DATE_KEY_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")
RATE_LIMIT_BUCKETS = {}

if DATABASE_URL:
    try:
        import psycopg
        from psycopg.rows import dict_row
    except ImportError as error:
        raise RuntimeError("DATABASE_URL is set, but psycopg is not installed. Run pip install -r requirements.txt.") from error
else:
    psycopg = None
    dict_row = None


def utc_now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def load_config():
    raw = os.environ.get("RANKING_CONFIG_JSON", "")
    config_path = os.environ.get("RANKING_CONFIG_PATH", "")
    if raw:
        return json.loads(raw)
    if config_path:
        return json.loads(Path(config_path).read_text(encoding="utf-8"))
    raise RuntimeError("ranking config missing")


CONFIG = load_config()
SEASON = CONFIG["rankingSeason"]
DECK_SIZE = int(CONFIG.get("deckSize", 3))
CARD_BY_ID = {card["id"]: card for card in CONFIG.get("cards", [])}
STAGE_BY_ID = {stage["id"]: stage for stage in SEASON.get("stages", [])}


def parse_integer(value, fallback=0):
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return fallback


def clamp_integer(value, minimum, maximum):
    number = parse_integer(value, minimum)
    return max(minimum, min(maximum, number))


def clean_text(value, fallback="", limit=48):
    text = str(value if value is not None else fallback)
    text = re.sub(r"[\x00-\x1f\x7f]", "", text).strip()
    return text[:limit]


def clean_deck_ids(deck_ids):
    if not isinstance(deck_ids, list):
        return []
    return [card_id for card_id in deck_ids if card_id in CARD_BY_ID][:DECK_SIZE]


def clean_date_key(value):
    text = clean_text(value, "", 10)
    return text if DATE_KEY_PATTERN.match(text) else ""


def kana_length(value):
    return len(str(value or ""))


def deck_rule_failure(stage, deck_ids):
    rules = stage.get("rules") if stage.get("type") == "final" else []
    if not rules and stage.get("type") == "final":
        rules = SEASON.get("finalRules", [])
    if not rules:
        return ""
    cards = [CARD_BY_ID[card_id] for card_id in clean_deck_ids(deck_ids) if card_id in CARD_BY_ID]
    for rule in rules:
        if rule.get("type") == "minCardLength":
            minimum = clamp_integer(rule.get("value"), 1, 99)
            if any(kana_length(card.get("readingKana")) < minimum for card in cards):
                return f"deck rule failed: {rule.get('id', 'minCardLength')}"
        if rule.get("type") == "requiredDeckKana":
            pool = []
            for card in cards:
                pool.extend(list(str(card.get("readingKana", ""))))
            if any(kana not in pool for kana in rule.get("values", [])):
                return f"deck rule failed: {rule.get('id', 'requiredDeckKana')}"
    return ""


def execute(connection, sqlite_sql, postgres_sql=None, params=()):
    sql = postgres_sql if BACKEND == "postgres" and postgres_sql else sqlite_sql
    return connection.execute(sql, params)


def ensure_sqlite_schema(connection):
    connection.execute("PRAGMA journal_mode=WAL")
    connection.execute("PRAGMA busy_timeout=3000")
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS player_profiles (
          player_id TEXT PRIMARY KEY,
          player_name TEXT NOT NULL,
          selected_title_id TEXT NOT NULL DEFAULT 'auto',
          selected_title TEXT NOT NULL DEFAULT '',
          player_rank INTEGER NOT NULL DEFAULT 1,
          player_xp INTEGER NOT NULL DEFAULT 0,
          best_score INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          last_seen_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
        """
    )
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS ranking_entries (
          season_id TEXT NOT NULL,
          stage_id TEXT NOT NULL,
          player_id TEXT NOT NULL,
          player_name TEXT NOT NULL,
          score INTEGER NOT NULL,
          rank_label TEXT NOT NULL DEFAULT '',
          matches INTEGER NOT NULL DEFAULT 0,
          max_combo INTEGER NOT NULL DEFAULT 0,
          best_word TEXT NOT NULL DEFAULT '',
          best_word_card_id TEXT NOT NULL DEFAULT '',
          deck_ids TEXT NOT NULL DEFAULT '[]',
          build_id TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (season_id, stage_id, player_id)
        )
        """
    )
    connection.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_ranking_entries_stage_score
        ON ranking_entries (season_id, stage_id, score DESC, updated_at ASC)
        """
    )
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS daily_ranking_entries (
          daily_date TEXT NOT NULL,
          player_id TEXT NOT NULL,
          player_name TEXT NOT NULL,
          score INTEGER NOT NULL,
          rank_label TEXT NOT NULL DEFAULT '',
          matches INTEGER NOT NULL DEFAULT 0,
          max_combo INTEGER NOT NULL DEFAULT 0,
          best_word TEXT NOT NULL DEFAULT '',
          best_word_card_id TEXT NOT NULL DEFAULT '',
          deck_ids TEXT NOT NULL DEFAULT '[]',
          build_id TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (daily_date, player_id)
        )
        """
    )
    connection.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_daily_ranking_entries_score
        ON daily_ranking_entries (daily_date, score DESC, updated_at ASC)
        """
    )
    connection.commit()


def ensure_postgres_schema(connection):
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS player_profiles (
          player_id TEXT PRIMARY KEY,
          player_name TEXT NOT NULL,
          selected_title_id TEXT NOT NULL DEFAULT 'auto',
          selected_title TEXT NOT NULL DEFAULT '',
          player_rank INTEGER NOT NULL DEFAULT 1,
          player_xp INTEGER NOT NULL DEFAULT 0,
          best_score INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          last_seen_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
        """
    )
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS ranking_entries (
          season_id TEXT NOT NULL,
          stage_id TEXT NOT NULL,
          player_id TEXT NOT NULL,
          player_name TEXT NOT NULL,
          score INTEGER NOT NULL,
          rank_label TEXT NOT NULL DEFAULT '',
          matches INTEGER NOT NULL DEFAULT 0,
          max_combo INTEGER NOT NULL DEFAULT 0,
          best_word TEXT NOT NULL DEFAULT '',
          best_word_card_id TEXT NOT NULL DEFAULT '',
          deck_ids TEXT NOT NULL DEFAULT '[]',
          build_id TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (season_id, stage_id, player_id)
        )
        """
    )
    connection.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_ranking_entries_stage_score
        ON ranking_entries (season_id, stage_id, score DESC, updated_at ASC)
        """
    )
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS daily_ranking_entries (
          daily_date TEXT NOT NULL,
          player_id TEXT NOT NULL,
          player_name TEXT NOT NULL,
          score INTEGER NOT NULL,
          rank_label TEXT NOT NULL DEFAULT '',
          matches INTEGER NOT NULL DEFAULT 0,
          max_combo INTEGER NOT NULL DEFAULT 0,
          best_word TEXT NOT NULL DEFAULT '',
          best_word_card_id TEXT NOT NULL DEFAULT '',
          deck_ids TEXT NOT NULL DEFAULT '[]',
          build_id TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (daily_date, player_id)
        )
        """
    )
    connection.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_daily_ranking_entries_score
        ON daily_ranking_entries (daily_date, score DESC, updated_at ASC)
        """
    )
    connection.commit()


def db_connect():
    if BACKEND == "postgres":
        last_error = None
        for attempt in range(1, max(1, DB_CONNECT_RETRIES) + 1):
            try:
                connection = psycopg.connect(DATABASE_URL, row_factory=dict_row)
                ensure_postgres_schema(connection)
                return connection
            except psycopg.OperationalError as error:
                last_error = error
                if attempt >= DB_CONNECT_RETRIES:
                    break
                print(
                    json.dumps(
                        {
                            "ok": False,
                            "backend": BACKEND,
                            "event": "db_connect_retry",
                            "attempt": attempt,
                            "maxAttempts": DB_CONNECT_RETRIES,
                            "error": str(error),
                        },
                        ensure_ascii=False,
                    ),
                    flush=True,
                )
                time.sleep(DB_CONNECT_DELAY_SECONDS)
        raise last_error
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    ensure_sqlite_schema(connection)
    return connection


def ranked_entries(connection, season_id, stage_id, limit=100, player_id=""):
    safe_limit = clamp_integer(limit, 1, MAX_ENTRIES)
    rows = execute(
        connection,
        """
        SELECT player_id, player_name, score, updated_at
        FROM ranking_entries
        WHERE season_id = ? AND stage_id = ?
        ORDER BY score DESC, updated_at ASC
        LIMIT ?
        """,
        """
        SELECT player_id, player_name, score, updated_at
        FROM ranking_entries
        WHERE season_id = %s AND stage_id = %s
        ORDER BY score DESC, updated_at ASC
        LIMIT %s
        """,
        (season_id, stage_id, safe_limit),
    ).fetchall()
    entries = []
    for index, row in enumerate(rows, start=1):
        is_player = row["player_id"] == player_id
        entries.append(
            {
                "id": row["player_id"],
                "playerId": row["player_id"],
                "name": "あなた" if is_player else row["player_name"],
                "score": row["score"],
                "rank": index,
                "updatedAt": row["updated_at"],
                "isPlayer": is_player,
            }
        )
    if player_id and not any(entry["isPlayer"] for entry in entries):
        player_row = execute(
            connection,
            """
            SELECT player_id, player_name, score, updated_at
            FROM ranking_entries
            WHERE season_id = ? AND stage_id = ? AND player_id = ?
            """,
            """
            SELECT player_id, player_name, score, updated_at
            FROM ranking_entries
            WHERE season_id = %s AND stage_id = %s AND player_id = %s
            """,
            (season_id, stage_id, player_id),
        ).fetchone()
        if player_row:
            better_count = execute(
                connection,
                """
                SELECT COUNT(*) AS count
                FROM ranking_entries
                WHERE season_id = ? AND stage_id = ?
                  AND (score > ? OR (score = ? AND updated_at < ?))
                """,
                """
                SELECT COUNT(*) AS count
                FROM ranking_entries
                WHERE season_id = %s AND stage_id = %s
                  AND (score > %s OR (score = %s AND updated_at < %s))
                """,
                (
                    season_id,
                    stage_id,
                    player_row["score"],
                    player_row["score"],
                    player_row["updated_at"],
                ),
            ).fetchone()["count"]
            entries.append(
                {
                    "id": player_row["player_id"],
                    "playerId": player_row["player_id"],
                    "name": "あなた",
                    "score": player_row["score"],
                    "rank": int(better_count) + 1,
                    "updatedAt": player_row["updated_at"],
                    "isPlayer": True,
                }
            )
    return entries


def ranked_daily_entries(connection, daily_date, limit=10, player_id=""):
    safe_limit = clamp_integer(limit, 1, MAX_ENTRIES)
    rows = execute(
        connection,
        """
        SELECT player_id, player_name, score, updated_at
        FROM daily_ranking_entries
        WHERE daily_date = ?
        ORDER BY score DESC, updated_at ASC
        LIMIT ?
        """,
        """
        SELECT player_id, player_name, score, updated_at
        FROM daily_ranking_entries
        WHERE daily_date = %s
        ORDER BY score DESC, updated_at ASC
        LIMIT %s
        """,
        (daily_date, safe_limit),
    ).fetchall()
    entries = []
    for index, row in enumerate(rows, start=1):
        is_player = row["player_id"] == player_id
        entries.append(
            {
                "id": row["player_id"],
                "playerId": row["player_id"],
                "name": "あなた" if is_player else row["player_name"],
                "score": row["score"],
                "rank": index,
                "updatedAt": row["updated_at"],
                "isPlayer": is_player,
            }
        )
    if player_id and not any(entry["isPlayer"] for entry in entries):
        player_row = execute(
            connection,
            """
            SELECT player_id, player_name, score, updated_at
            FROM daily_ranking_entries
            WHERE daily_date = ? AND player_id = ?
            """,
            """
            SELECT player_id, player_name, score, updated_at
            FROM daily_ranking_entries
            WHERE daily_date = %s AND player_id = %s
            """,
            (daily_date, player_id),
        ).fetchone()
        if player_row:
            better_count = execute(
                connection,
                """
                SELECT COUNT(*) AS count
                FROM daily_ranking_entries
                WHERE daily_date = ? AND score > ?
                """,
                """
                SELECT COUNT(*) AS count
                FROM daily_ranking_entries
                WHERE daily_date = %s AND score > %s
                """,
                (daily_date, player_row["score"]),
            ).fetchone()["count"]
            entries.append(
                {
                    "id": player_row["player_id"],
                    "playerId": player_row["player_id"],
                    "name": "あなた",
                    "score": player_row["score"],
                    "rank": int(better_count) + 1,
                    "updatedAt": player_row["updated_at"],
                    "isPlayer": True,
                }
            )
    return entries


def public_profile(row):
    if not row:
        return None
    return {
        "playerId": row["player_id"],
        "playerName": row["player_name"],
        "selectedTitleId": row["selected_title_id"],
        "selectedTitle": row["selected_title"],
        "playerRank": row["player_rank"],
        "playerXp": row["player_xp"],
        "bestScore": row["best_score"],
        "createdAt": row["created_at"],
        "lastSeenAt": row["last_seen_at"],
        "updatedAt": row["updated_at"],
    }


def get_player_profile(connection, player_id):
    row = execute(
        connection,
        """
        SELECT player_id, player_name, selected_title_id, selected_title, player_rank,
               player_xp, best_score, created_at, last_seen_at, updated_at
        FROM player_profiles
        WHERE player_id = ?
        """,
        """
        SELECT player_id, player_name, selected_title_id, selected_title, player_rank,
               player_xp, best_score, created_at, last_seen_at, updated_at
        FROM player_profiles
        WHERE player_id = %s
        """,
        (player_id,),
    ).fetchone()
    return public_profile(row)


def sanitize_player_profile(body, fallback_score=0):
    player_id = clean_text(body.get("playerId"), "", 96)
    if not PLAYER_ID_PATTERN.match(player_id):
        return None, "invalid playerId"
    now = utc_now()
    return (
        {
            "player_id": player_id,
            "player_name": clean_text(body.get("playerName") or body.get("name"), "PLAYER", 24),
            "selected_title_id": clean_text(body.get("selectedTitleId"), "auto", 48) or "auto",
            "selected_title": clean_text(body.get("selectedTitle"), "", 24),
            "player_rank": clamp_integer(body.get("playerRank"), 1, 999),
            "player_xp": clamp_integer(body.get("playerXp"), 0, 999999999),
            "best_score": clamp_integer(body.get("bestScore"), fallback_score, MAX_SCORE),
            "created_at": clean_text(body.get("createdAt"), now, 32),
            "last_seen_at": now,
            "updated_at": now,
        },
        "",
    )


def sanitize_submission(body):
    season_id = clean_text(body.get("seasonId"), SEASON.get("id", "season-1"), 48)
    stage_id = clean_text(body.get("stageId"), SEASON.get("activeStageId", "season-1"), 48)
    stage = STAGE_BY_ID.get(stage_id)
    if season_id != SEASON.get("id") or not stage:
        return None, None, "unknown season or stage"

    score = parse_integer(body.get("score"), 0)
    if score <= 0:
        return None, None, "score must be positive"
    if score > MAX_SCORE:
        return None, None, "score exceeds server limit"

    player_id = clean_text(body.get("playerId"), "", 96)
    if not PLAYER_ID_PATTERN.match(player_id):
        return None, None, "invalid playerId"

    deck_ids = clean_deck_ids(body.get("deckIds"))
    if len(deck_ids) != DECK_SIZE:
        return None, None, "deckIds must contain the active deck"
    rule_failure = deck_rule_failure(stage, deck_ids)
    if rule_failure:
        return None, None, rule_failure

    now = utc_now()
    profile, profile_error = sanitize_player_profile(body, score)
    if profile_error:
        return None, None, profile_error
    profile["best_score"] = score
    return (
        {
            "season_id": season_id,
            "stage_id": stage_id,
            "player_id": player_id,
            "player_name": profile["player_name"],
            "score": score,
            "rank_label": clean_text(body.get("rank"), "", 8),
            "matches": clamp_integer(body.get("matches"), 0, 9999),
            "max_combo": clamp_integer(body.get("maxCombo"), 0, 9999),
            "best_word": clean_text(body.get("bestWord"), "", 24),
            "best_word_card_id": body.get("bestWordCardId") if body.get("bestWordCardId") in CARD_BY_ID else "",
            "deck_ids": json.dumps(deck_ids, ensure_ascii=False),
            "build_id": clean_text(body.get("buildId"), "", 48),
            "created_at": clean_text(body.get("createdAt"), now, 32),
            "updated_at": now,
        },
        profile,
        "",
    )


def upsert_player_profile(connection, profile):
    fields = [
        "player_id",
        "player_name",
        "selected_title_id",
        "selected_title",
        "player_rank",
        "player_xp",
        "best_score",
        "created_at",
        "last_seen_at",
        "updated_at",
    ]
    values = tuple(profile[field] for field in fields)
    execute(
        connection,
        """
        INSERT INTO player_profiles (
          player_id, player_name, selected_title_id, selected_title,
          player_rank, player_xp, best_score, created_at, last_seen_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(player_id) DO UPDATE SET
          player_name = excluded.player_name,
          selected_title_id = excluded.selected_title_id,
          selected_title = excluded.selected_title,
          player_rank = MAX(player_profiles.player_rank, excluded.player_rank),
          player_xp = MAX(player_profiles.player_xp, excluded.player_xp),
          best_score = MAX(player_profiles.best_score, excluded.best_score),
          last_seen_at = excluded.last_seen_at,
          updated_at = excluded.updated_at
        """,
        """
        INSERT INTO player_profiles (
          player_id, player_name, selected_title_id, selected_title,
          player_rank, player_xp, best_score, created_at, last_seen_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT(player_id) DO UPDATE SET
          player_name = excluded.player_name,
          selected_title_id = excluded.selected_title_id,
          selected_title = excluded.selected_title,
          player_rank = GREATEST(player_profiles.player_rank, excluded.player_rank),
          player_xp = GREATEST(player_profiles.player_xp, excluded.player_xp),
          best_score = GREATEST(player_profiles.best_score, excluded.best_score),
          last_seen_at = excluded.last_seen_at,
          updated_at = excluded.updated_at
        """,
        values,
    )
    connection.commit()


def upsert_best_score(connection, entry):
    previous = execute(
        connection,
        """
        SELECT score, created_at
        FROM ranking_entries
        WHERE season_id = ? AND stage_id = ? AND player_id = ?
        """,
        """
        SELECT score, created_at
        FROM ranking_entries
        WHERE season_id = %s AND stage_id = %s AND player_id = %s
        """,
        (entry["season_id"], entry["stage_id"], entry["player_id"]),
    ).fetchone()
    if previous and entry["score"] < previous["score"]:
        return False
    if previous:
        entry["created_at"] = previous["created_at"]
    fields = [
        "season_id",
        "stage_id",
        "player_id",
        "player_name",
        "score",
        "rank_label",
        "matches",
        "max_combo",
        "best_word",
        "best_word_card_id",
        "deck_ids",
        "build_id",
        "created_at",
        "updated_at",
    ]
    values = tuple(entry[field] for field in fields)
    execute(
        connection,
        """
        INSERT INTO ranking_entries (
          season_id, stage_id, player_id, player_name, score, rank_label,
          matches, max_combo, best_word, best_word_card_id, deck_ids, build_id,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(season_id, stage_id, player_id) DO UPDATE SET
          player_name = excluded.player_name,
          score = excluded.score,
          rank_label = excluded.rank_label,
          matches = excluded.matches,
          max_combo = excluded.max_combo,
          best_word = excluded.best_word,
          best_word_card_id = excluded.best_word_card_id,
          deck_ids = excluded.deck_ids,
          build_id = excluded.build_id,
          updated_at = excluded.updated_at
        """,
        """
        INSERT INTO ranking_entries (
          season_id, stage_id, player_id, player_name, score, rank_label,
          matches, max_combo, best_word, best_word_card_id, deck_ids, build_id,
          created_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT(season_id, stage_id, player_id) DO UPDATE SET
          player_name = excluded.player_name,
          score = excluded.score,
          rank_label = excluded.rank_label,
          matches = excluded.matches,
          max_combo = excluded.max_combo,
          best_word = excluded.best_word,
          best_word_card_id = excluded.best_word_card_id,
          deck_ids = excluded.deck_ids,
          build_id = excluded.build_id,
          updated_at = excluded.updated_at
        """,
        values,
    )
    connection.commit()
    return True


def upsert_daily_best_score(connection, entry, daily_date):
    if not daily_date:
        return False
    previous = execute(
        connection,
        """
        SELECT score, created_at
        FROM daily_ranking_entries
        WHERE daily_date = ? AND player_id = ?
        """,
        """
        SELECT score, created_at
        FROM daily_ranking_entries
        WHERE daily_date = %s AND player_id = %s
        """,
        (daily_date, entry["player_id"]),
    ).fetchone()
    if previous and entry["score"] < previous["score"]:
        return False
    created_at = previous["created_at"] if previous else entry["created_at"]
    values = (
        daily_date,
        entry["player_id"],
        entry["player_name"],
        entry["score"],
        entry["rank_label"],
        entry["matches"],
        entry["max_combo"],
        entry["best_word"],
        entry["best_word_card_id"],
        entry["deck_ids"],
        entry["build_id"],
        created_at,
        entry["updated_at"],
    )
    execute(
        connection,
        """
        INSERT INTO daily_ranking_entries (
          daily_date, player_id, player_name, score, rank_label,
          matches, max_combo, best_word, best_word_card_id, deck_ids, build_id,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(daily_date, player_id) DO UPDATE SET
          player_name = excluded.player_name,
          score = excluded.score,
          rank_label = excluded.rank_label,
          matches = excluded.matches,
          max_combo = excluded.max_combo,
          best_word = excluded.best_word,
          best_word_card_id = excluded.best_word_card_id,
          deck_ids = excluded.deck_ids,
          build_id = excluded.build_id,
          updated_at = excluded.updated_at
        """,
        """
        INSERT INTO daily_ranking_entries (
          daily_date, player_id, player_name, score, rank_label,
          matches, max_combo, best_word, best_word_card_id, deck_ids, build_id,
          created_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT(daily_date, player_id) DO UPDATE SET
          player_name = excluded.player_name,
          score = excluded.score,
          rank_label = excluded.rank_label,
          matches = excluded.matches,
          max_combo = excluded.max_combo,
          best_word = excluded.best_word,
          best_word_card_id = excluded.best_word_card_id,
          deck_ids = excluded.deck_ids,
          build_id = excluded.build_id,
          updated_at = excluded.updated_at
        """,
        values,
    )
    connection.commit()
    return True


def client_ip(handler):
    forwarded_for = handler.headers.get("X-Forwarded-For", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return handler.client_address[0] if handler.client_address else "unknown"


def rate_limited(handler, player_id):
    if RATE_LIMIT_MAX <= 0:
        return False
    now = time.time()
    cutoff = now - RATE_LIMIT_WINDOW_SECONDS
    key = f"{client_ip(handler)}:{player_id}"
    bucket = [timestamp for timestamp in RATE_LIMIT_BUCKETS.get(key, []) if timestamp >= cutoff]
    if len(bucket) >= RATE_LIMIT_MAX:
        RATE_LIMIT_BUCKETS[key] = bucket
        return True
    bucket.append(now)
    RATE_LIMIT_BUCKETS[key] = bucket
    if len(RATE_LIMIT_BUCKETS) > 5000:
        for stale_key in list(RATE_LIMIT_BUCKETS.keys()):
            RATE_LIMIT_BUCKETS[stale_key] = [
                timestamp for timestamp in RATE_LIMIT_BUCKETS[stale_key] if timestamp >= cutoff
            ]
            if not RATE_LIMIT_BUCKETS[stale_key]:
                del RATE_LIMIT_BUCKETS[stale_key]
    return False


class RankingHandler(BaseHTTPRequestHandler):
    server_version = "GunmojiRanking/1.3"

    def log_message(self, fmt, *args):
        if os.environ.get("RANKING_ACCESS_LOG") == "1":
            super().log_message(fmt, *args)

    def send_json(self, status, payload):
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def read_json_body(self):
        try:
            length = clamp_integer(self.headers.get("Content-Length"), 0, 64 * 1024)
            return json.loads(self.rfile.read(length).decode("utf-8") or "{}"), ""
        except Exception:
            return None, "invalid json"

    def do_OPTIONS(self):
        self.send_json(204, {})

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            payload = {"ok": True, "backend": BACKEND}
            if BACKEND == "sqlite":
                payload["dbPath"] = str(DB_PATH)
            self.send_json(200, payload)
            return

        match = re.match(r"^/api/player/profile/([^/]+)$", parsed.path)
        if match:
            player_id = clean_text(unquote(match.group(1)), "", 96)
            if not PLAYER_ID_PATTERN.match(player_id):
                self.send_json(400, {"error": "invalid playerId"})
                return
            with db_connect() as connection:
                profile = get_player_profile(connection, player_id)
            if not profile:
                self.send_json(404, {"error": "player not found"})
                return
            self.send_json(200, {"ok": True, "profile": profile})
            return

        match = re.match(r"^/api/ranking/season/([^/]+)/stage/([^/]+)$", parsed.path)
        if match:
            season_id = unquote(match.group(1))
            stage_id = unquote(match.group(2))
            if season_id != SEASON.get("id") or stage_id not in STAGE_BY_ID:
                self.send_json(404, {"error": "unknown season or stage"})
                return
            query = parse_qs(parsed.query)
            with db_connect() as connection:
                self.send_json(
                    200,
                    {
                        "seasonId": season_id,
                        "stageId": stage_id,
                        "entries": ranked_entries(
                            connection,
                            season_id,
                            stage_id,
                            query.get("limit", ["100"])[0],
                            query.get("playerId", [""])[0],
                        ),
                    },
                )
            return

        match = re.match(r"^/api/ranking/daily/([^/]+)$", parsed.path)
        if match:
            daily_date = clean_date_key(unquote(match.group(1)))
            if not daily_date:
                self.send_json(400, {"error": "invalid daily date"})
                return
            query = parse_qs(parsed.query)
            with db_connect() as connection:
                self.send_json(
                    200,
                    {
                        "dailyDateKey": daily_date,
                        "entries": ranked_daily_entries(
                            connection,
                            daily_date,
                            query.get("limit", ["10"])[0],
                            query.get("playerId", [""])[0],
                        ),
                    },
                )
            return

        self.send_json(404, {"error": "not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        body, body_error = self.read_json_body()
        if body_error:
            self.send_json(400, {"error": body_error})
            return

        if parsed.path == "/api/player/profile":
            profile, error = sanitize_player_profile(body)
            if error:
                self.send_json(400, {"error": error})
                return
            if rate_limited(self, profile["player_id"]):
                self.send_json(429, {"error": "rate limited"})
                return
            with db_connect() as connection:
                upsert_player_profile(connection, profile)
                stored_profile = get_player_profile(connection, profile["player_id"])
            self.send_json(200, {"ok": True, "profile": stored_profile})
            return

        if parsed.path == "/api/ranking/submit":
            entry, profile, error = sanitize_submission(body)
            if error:
                self.send_json(400, {"error": error})
                return
            if rate_limited(self, entry["player_id"]):
                self.send_json(429, {"error": "rate limited"})
                return
            with db_connect() as connection:
                upsert_player_profile(connection, profile)
                upsert_best_score(connection, entry)
                daily_date = clean_date_key(body.get("dailyDateKey"))
                if daily_date:
                    upsert_daily_best_score(connection, entry, daily_date)
                self.send_json(
                    200,
                    {
                        "ok": True,
                        "seasonId": entry["season_id"],
                        "stageId": entry["stage_id"],
                        "dailyDateKey": daily_date,
                        "profile": get_player_profile(connection, entry["player_id"]),
                        "entries": ranked_entries(
                            connection,
                            entry["season_id"],
                            entry["stage_id"],
                            100,
                            entry["player_id"],
                        ),
                        "dailyEntries": ranked_daily_entries(connection, daily_date, 10, entry["player_id"]) if daily_date else [],
                    },
                )
            return

        self.send_json(404, {"error": "not found"})


def main():
    with db_connect():
        pass
    server = ThreadingHTTPServer((HOST, PORT), RankingHandler)
    actual_port = server.server_address[1]
    print(
        json.dumps({"ok": True, "url": f"http://{HOST}:{actual_port}", "backend": BACKEND}, ensure_ascii=False),
        flush=True,
    )
    server.serve_forever()


if __name__ == "__main__":
    main()
