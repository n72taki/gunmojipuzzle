# ぐんもじぱずる Promo Asset QA

Last updated: 2026-06-12

## Purpose

Prepare store-facing promotional assets that explain the game at a glance without relying on official mascots, logos, maps, copied photos, existing game UI, or third-party IP.

## Current Asset

- Feature graphic: `store-assets/feature-graphic.jpg`
- Generator: `tools/generate-feature-graphic.cjs`
- Checker: `tools/check-promo-assets.cjs`
- Output size: `1024x500`
- Format: JPEG, avoiding alpha-channel concerns.

## Composition

- Left side: `ぐんもじぱずる` title and short gameplay category.
- Right side: a readable panel-board moment with `WORD CLEAR`.
- Lower middle: the three basic deck cards using generated art already tracked in `docs/ART_PROMPT_LOG.md`.
- Palette: cheerful Japanese festival pop, with warm paper, teal, coral, and yellow accents.

## Four-Perspective Review

- Player: should communicate that this is a short, slide-based word puzzle before they read the listing.
- Educator: should show kana and local-word framing without making formal study promises.
- Streamer: should expose a readable clear moment that can work in thumbnails and stream overlays.
- Viewer: should remain legible at small sizes, especially the title, panel letters, and reward moment.
- Release: should avoid time-limited claims, price claims, install calls to action, awards, platform badges, or unsupported gameplay promises.

## Mechanical Checks

`tools/check-promo-assets.cjs` verifies that:

- `store-assets/feature-graphic.jpg` exists,
- the JPEG is exactly `1024x500`,
- the file is non-empty,
- the file is below 15 MB,
- this document, the README, store listing, release readiness notes, and release gate stay linked.

## Rights Notes

- The generator uses only local project art: `stage-festival-bg.png`, `card-basic-gunma-ken.png`, `card-basic-daruma.png`, and `card-basic-akagi-san.png`.
- Promo assets must use no official mascot, no official logo, no copied map, no copied photo, and no third-party IP.
- Do not add official mascot art, official logos, real photos, existing maps, copied UI from similar games, game-console badges, celebrity likenesses, or third-party character references.
- If generated art changes, update `docs/ART_PROMPT_LOG.md` and re-run the promo asset check.

## Commands

```text
node gunmojipuzzle\tools\generate-feature-graphic.cjs
node gunmojipuzzle\tools\check-promo-assets.cjs
```
