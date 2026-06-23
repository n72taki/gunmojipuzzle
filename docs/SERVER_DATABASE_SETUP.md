# Server and Database Setup

This project is prepared for a low-maintenance Render setup:

- Web API: `gunmoji-ranking-api`
- Database: Render Managed Postgres `gunmoji-ranking-db`
- Local development fallback: SQLite at `server/ranking.sqlite3`

## What Is Stored Now

The server currently stores the minimum data needed for online rankings and basic player profiles.

`player_profiles`

- player id
- player name
- selected title id and selected title
- player rank and EXP
- best score
- created, last seen, and updated timestamps

`ranking_entries`

- best season score per player and season stage
- rank label
- words cleared, max combo, best word
- active deck ids
- build id
- created and updated timestamps

`daily_ranking_entries`

- best daily score per player and date
- rank label
- words cleared, max combo, best word
- active deck ids
- build id
- created and updated timestamps

The API does not store email address, phone number, precise location, contacts, or a free-text profile field.

Still local-only for now:

- owned cards and limit-break counts
- G daruma balance
- stamina
- mission progress and claimed rewards
- pack opening history

Those should move server-side before real-money purchases or cross-device account recovery.

## Files Already Prepared

- `render.yaml` at the repository root: Render Blueprint for the Git repository.
- `gunmojipuzzle/render.yaml`: same Blueprint for deploying from the game folder directly.
- `gunmojipuzzle/server/ranking-server.py`: Python API. Uses Postgres when `DATABASE_URL` exists.
- `gunmojipuzzle/server/ranking-server.cjs`: local Node wrapper.
- `gunmojipuzzle/server/ranking-config.json`: season/card config used by the server.
- `gunmojipuzzle/requirements.txt`: installs `psycopg[binary]`.
- `gunmojipuzzle/docs/ranking-server.md`: API details.

## Render Deployment Steps

1. Push the repository to GitHub.

2. Open Render Dashboard and create a new Blueprint from the GitHub repository.

3. Use the repository-root `render.yaml`.

   The root Blueprint has `rootDir: gunmojipuzzle`, so Render builds and runs the game API from the correct folder.

4. Confirm Render will create:

   - Web Service: `gunmoji-ranking-api`
   - Postgres: `gunmoji-ranking-db`

5. Confirm these Web Service environment variables:

   ```text
   RANKING_HOST=0.0.0.0
   RANKING_CONFIG_PATH=server/ranking-config.json
   RANKING_MAX_SCORE=1500000
   RANKING_RATE_LIMIT_WINDOW_SECONDS=60
   RANKING_RATE_LIMIT_MAX=30
   DATABASE_URL=<from gunmoji-ranking-db>
   ```

6. Wait for deploy to finish, then open:

   ```text
   https://<your-render-service>.onrender.com/api/health
   ```

   Expected:

   ```json
   {
     "ok": true,
     "backend": "postgres"
   }
   ```

7. Test the hosted API from the local game before hardcoding it:

   ```js
   localStorage.setItem("kana-gunmatsuri-ranking-api-url", "https://<your-render-service>.onrender.com");
   ```

8. Play one real run, open the ranking screen, and confirm the sync status becomes online/synced.

9. For store release, set the production endpoint in `gunmojipuzzle/data/cards.js`:

   ```js
   rankingApi: {
     endpoint: "https://<your-render-service>.onrender.com"
   }
   ```

10. Run the checks:

    ```powershell
    node tools/check-ranking-server.cjs
    node tools/release-check.cjs
    node tools/build-public-preview.cjs
    node tools/check-public-preview.cjs
    node tools/smoke-browser.cjs
    node tools/smoke-public-preview.cjs
    ```

## Local Server Test

From `gunmojipuzzle`:

```powershell
powershell -ExecutionPolicy Bypass -File server\start-ranking-local.ps1
```

Open:

```text
http://127.0.0.1:8787/api/health
```

Expected:

```json
{
  "ok": true,
  "backend": "sqlite",
  "dbPath": "server/ranking.sqlite3"
}
```

## Quick Data Checks

After test play, use the Render database console or `psql` and check:

```sql
SELECT COUNT(*) FROM player_profiles;
SELECT COUNT(*) FROM ranking_entries;
SELECT COUNT(*) FROM daily_ranking_entries;
SELECT player_id, player_name, player_rank, best_score, updated_at
FROM player_profiles
ORDER BY updated_at DESC
LIMIT 10;
```

## Next Server-Side Work

Before real-money purchases:

- server-side inventory table
- server-side G daruma ledger
- signed purchase receipt validation
- account restore / transfer id
- admin moderation and score audit view
- season archive job
