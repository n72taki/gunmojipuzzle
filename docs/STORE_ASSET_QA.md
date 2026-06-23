# ぐんもじぱずる Store Asset QA

Last updated: 2026-06-16

## Purpose

Keep store screenshots useful for Play Console review, closed-test recruiting, and public-facing previews. Screenshots should show the playable product, not only menus or test scaffolding.

## Screenshot Sets

Two screenshot sets are maintained:

- Closed-test screenshots: `store-assets/screenshots/`
- Public-review screenshots: `store-assets/public-screenshots/`

Both sets must contain:

1. `01-title.png`: title and brand signal
2. `02-home.png`: deck, stamina, last run, and primary actions
3. `03-gameplay.png`: live panel board and readable gameplay HUD
4. `04-result.png`: rank, best word, reward summary, replay/top/deck actions
5. `05-deck.png`: deck building and word guide
6. `06-pack.png`: pack reveal and probability context
7. `07-settings.png`: accessibility, sound, policy links
8. `08-missions.png`: daily word, daily goals, score target, and weekly challenge
9. `09-ranking.png`: season ranking, own best score, and whole-user ranking preview

## Capture Commands

```text
node gunmojipuzzle\tools\capture-store-assets.cjs
node gunmojipuzzle\tools\capture-store-assets.cjs --public
node gunmojipuzzle\tools\check-store-assets.cjs
```

The capture viewport is `430x932 @3x`, producing `1290x2796` portrait PNG files.

## Public Screenshot Rules

- Public screenshots must not show `CLOSED TEST`, `TEST AD`, `TEST GRANT`, tester-only feedback report text, or non-PII debug copy.
- Public screenshots can show pack probability and card reveal context.
- If monetization is not production-ready, public screenshots must avoid implying real purchases or real rewarded ads.

## Four-Perspective Review

- Player: screenshots should immediately show how to start, what the board looks like, and why to replay.
- Educator: deck and missions screenshots should expose word notes, kana breakdown, or local-culture hooks without crowding the result screen.
- Streamer: gameplay and result screenshots should show word-call/readability and a clean post-run flow.
- Viewer: screenshots should be understandable when seen small, especially completed words, rank, and deck cards.
- Release: screenshots should use hosted-policy-ready wording before final submission and must match the actual submitted build.

## Mechanical Checks

`tools/check-store-assets.cjs` verifies that:

- all 18 screenshots exist across both sets,
- every file is a valid PNG,
- every screenshot is portrait,
- every screenshot is at least `1080x1920`,
- every screenshot is large enough to be non-empty,
- this document, store listing, and release readiness docs stay linked.
