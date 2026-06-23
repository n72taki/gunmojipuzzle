# Ranking Server Notes

`server/ranking-server.py` is the shared ranking API. It uses SQLite automatically for local development, and switches to Postgres when `DATABASE_URL` is set on Render.

The game still works offline. Normal results stay in `localStorage` as pending submissions and are sent when a ranking API is reachable.

SQLite does not need a separate install for this project. The local server uses Python's built-in `sqlite3` module and creates the database file automatically on first start. Render production uses Postgres through `psycopg`.

## Local Run

```powershell
powershell -ExecutionPolicy Bypass -File server\start-ranking-local.ps1
```

Alternative Node wrapper:

```powershell
& 'C:\Users\n_nla\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' server\ranking-server.cjs
```

Default local URL:

```text
http://127.0.0.1:8787
```

Default local SQLite database:

```text
server/ranking.sqlite3
```

To choose another local database path:

```powershell
$env:RANKING_DB_PATH="C:\path\to\ranking.sqlite3"
& 'C:\Users\n_nla\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' server\ranking-server.cjs
```

The local file build auto-connects to this URL while `rankingApi.mode` is `local-auto`.

To force a different local or hosted endpoint in the browser console:

```js
localStorage.setItem("kana-gunmatsuri-ranking-api-url", "http://127.0.0.1:8787");
```

## Render Production

`render.yaml` defines the recommended low-cost production setup. There is also a repository-root `../render.yaml` with `rootDir: gunmojipuzzle` for Render Blueprint deploys from the Git repository root:

- Python web service on the `starter` plan.
- Render Postgres `basic-256mb`.
- `DATABASE_URL` injected from the Postgres database.
- `psycopg[binary]` installed from `requirements.txt`.
- Health check at `/api/health`.

The previous SQLite + Persistent Disk path remains useful for local testing, but Postgres is the better default before public ranking launches because it can grow into user profiles, season history, moderation, and backups more cleanly.

Render start command:

```text
python server/ranking-server.py
```

Render environment variables:

```text
RANKING_HOST=0.0.0.0
RANKING_CONFIG_PATH=server/ranking-config.json
RANKING_MAX_SCORE=1500000
RANKING_RATE_LIMIT_WINDOW_SECONDS=60
RANKING_RATE_LIMIT_MAX=30
DATABASE_URL=<from Render Postgres>
```

After Render deploys, copy the service URL and set the game endpoint to that HTTPS origin in `data/cards.js` before store release:

```js
rankingApi: {
  endpoint: "https://your-render-service.onrender.com"
}
```

For local testing against the hosted API, the browser console override is enough:

```js
localStorage.setItem("kana-gunmatsuri-ranking-api-url", "https://your-render-service.onrender.com");
```

## Stored Data

`ranking_entries` stores the best score for each player per season stage:

- season id and stage id
- player id and display name
- score and rank label
- match count and max combo
- best word and best word card id
- deck ids
- build id
- created/updated timestamps

`player_profiles` stores minimal game profile data:

- player id
- display name
- selected title id and selected title
- player rank and EXP
- best score
- created/last-seen/updated timestamps

No email address, phone number, precise location, contacts, or free-text profile field is stored by this API.

## Basic Protection

The API now applies these first-pass safeguards:

- rejects scores above `RANKING_MAX_SCORE`
- requires a complete active deck
- checks final-stage deck rules server-side
- keeps only the best score per player/stage
- stores profile rank/EXP/best score without allowing weaker replays to lower them
- rate-limits writes per client/player key

Before a large public launch, add an admin moderation screen, scheduled backups, score-audit logs, and a plan for migrating/archiving old seasons.

## API Shape

`GET /api/health`

Returns:

```json
{
  "ok": true,
  "backend": "postgres"
}
```

Local fallback returns:

```json
{
  "ok": true,
  "backend": "sqlite",
  "dbPath": "server/ranking.sqlite3"
}
```

`POST /api/ranking/submit`

Accepts a run result:

```json
{
  "playerId": "player-...",
  "playerName": "あなた",
  "selectedTitleId": "score-b",
  "selectedTitle": "からっ風チャレンジャー",
  "playerRank": 3,
  "playerXp": 780,
  "seasonId": "season-1",
  "stageId": "season-1",
  "dailyDateKey": "2026-06-22",
  "score": 12345,
  "rank": "B",
  "matches": 12,
  "maxCombo": 8,
  "bestWord": "ぐんまけん",
  "bestWordCardId": "basic-gunma-ken",
  "deckIds": ["basic-gunma-ken", "basic-daruma", "basic-akagi-san"],
  "buildId": "0.1.0-closed-test.1"
}
```

`GET /api/ranking/season/:seasonId/stage/:stageId?playerId=player-...&limit=100`

Returns the requested stage's top 100 by default. When `playerId` is supplied and that player is outside the top 100, the response appends that player's own row with their real rank so the client can show "top 100 plus my rank" without downloading the full leaderboard.

Returns ranked entries for the requested stage.

`GET /api/ranking/daily/:dateKey?playerId=player-...&limit=10`

Returns the daily top entries for `YYYY-MM-DD`. When `playerId` is supplied, the player row is included even if it is outside the visible top 10. `POST /api/ranking/submit` stores both the season score and the `dailyDateKey` score when present.

`POST /api/player/profile`

Stores or updates the minimal game profile without a score submission. The game calls this when the player edits their name or title, and score submissions also update the same profile row.

`GET /api/player/profile/:playerId`

Returns the stored minimal game profile.
