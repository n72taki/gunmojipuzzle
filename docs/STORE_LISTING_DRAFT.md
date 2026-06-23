# ぐんもじぱずる Store Listing Draft

Last updated: 2026-06-16

## Positioning

- Target first release: Android closed test using the TWA handoff route once HTTPS hosting and signing are ready.
- Primary audience: short-session puzzle players, Gunma/local culture fans, families, teachers, and stream viewers.
- Promise: a 60-second Japanese kana panel puzzle where local words pop out through simple slides.
- Tone: cheerful Japanese festival pop, readable on a phone and understandable when watched on stream.

## App Name

ぐんもじぱずる

## Short Description

60秒で群馬のことばを作る、和祭りポップなかなパネルパズル。

## Full Description Draft

`ぐんもじぱずる`は、四角いかなパネルを上下左右にスライドして、デッキ内の群馬ゆかりのことばを見つける60秒パズルです。

操作はシンプル。パネルを動かして、隣り合った文字の組み合わせがカード名と一致すると自動で消えてスコアになります。順番は自由なので、短い時間でもひらめきと連鎖の気持ちよさを楽しめます。

デッキには`ぐんまけん`、`だるま`、`あかぎさん`などのカードが入り、それぞれに短いことばメモがあります。遊びながら、地域のことばに少しずつ触れられる構成です。

配信や家族で見ている時にも分かりやすいよう、完成したことば、スコア、コンボ、リザルトの見どころを大きく表示します。

### Features

- 1プレイ60秒のスマホ縦持ちパズル
- かなパネルをスライドして、隣接文字セットでことばを完成
- 3枚デッキ、デッキスキル、推しカード、リフレッシュ
- ことばメモつきカードコレクション
- デイリー、週替わり、スタミナ、報酬なし練習モード
- ワードコール、シンプルなリザルト、効果音テスト
- 大きめ文字、高コントラスト、パネル番号表示、演出控えめ設定

## Screenshot Set

Run:

```text
node gunmojipuzzle\tools\capture-store-assets.cjs
```

Closed-test output:

- `store-assets/screenshots/01-title.png`: title and brand signal
- `store-assets/screenshots/02-home.png`: current deck, stamina, last run, and primary actions
- `store-assets/screenshots/03-gameplay.png`: live panel board and readable gameplay HUD
- `store-assets/screenshots/04-result.png`: score, rank, best word, replay/home/deck actions
- `store-assets/screenshots/05-deck.png`: deck building and word guide
- `store-assets/screenshots/06-pack.png`: pack reveal and probability context
- `store-assets/screenshots/07-settings.png`: accessibility, sound check, policy links
- `store-assets/screenshots/08-missions.png`: daily word, daily goals, score target, and weekly challenge
- `store-assets/screenshots/09-ranking.png`: season ranking and whole-user ranking preview

Public-review capture:

```text
node gunmojipuzzle\tools\capture-store-assets.cjs --public
node gunmojipuzzle\tools\check-store-assets.cjs
```

This writes the same ordered set to `store-assets/public-screenshots/` and hides closed-test copy such as `CLOSED TEST`, `TEST AD`, and `TEST GRANT`.
`check-store-assets.cjs` verifies both screenshot sets are present, portrait, high-resolution PNGs. Detailed QA notes live in `docs/STORE_ASSET_QA.md`.

## Promo Assets

Run:

```text
node gunmojipuzzle\tools\generate-feature-graphic.cjs
node gunmojipuzzle\tools\check-promo-assets.cjs
```

Current output:

- `store-assets/feature-graphic.jpg`: `1024x500` feature graphic draft using project-generated stage/card art and a readable `WORD CLEAR` gameplay moment.

Detailed promo QA notes live in `docs/PROMO_ASSET_QA.md`.

## Production Notes

- The current screenshots are suitable for internal review and closed-test preparation.
- Use the `--public` screenshot mode for public-review drafts, then replace any remaining prototype economy behavior with production SDK behavior before final submission.
- Use `node gunmojipuzzle\tools\build-public-preview.cjs`, `node gunmojipuzzle\tools\check-public-preview.cjs`, and `node gunmojipuzzle\tools\smoke-public-preview.cjs` before wrapper handoff or public-facing review. The preview removes closed-test grant buttons and placeholder rewarded stamina UI from the static app surface, then boots that generated preview in a 390px mobile viewport.
- For final-host rehearsal, set `PUBLIC_PREVIEW_OUTPUT_DIR=dist/public-preview-hosted-check` plus hosted HTTPS policy URLs, then run `check-public-preview.cjs --expect-hosted-policies` and `check-production-readiness.cjs --root gunmojipuzzle\dist\public-preview-hosted-check --skip-native` to verify the web-public build separately from native signing and assetlinks blockers.
- Use `docs/ANDROID_TWA_HANDOFF.md` and `node gunmojipuzzle\tools\check-android-handoff.cjs` for Android wrapper handoff. `twa-manifest.json` and `android/twa/assetlinks.template.json` intentionally keep TODO placeholders until production host and signing values are known.
- Use `docs/DATA_SAFETY_DRAFT.md` and `node gunmojipuzzle\tools\check-data-safety.cjs` before filling the Play Console data safety form. Current claims assume local-only progress/settings storage, non-PII closed-test logs, no account, no location, no camera/microphone/photos, and no real ad/payment/analytics/crash SDKs.
- Use `docs/CLOSED_TEST_PLAN.md` and `node gunmojipuzzle\tools\check-closed-test-plan.cjs` before recruiting Google Play closed-test users. The plan keeps four-perspective cohorts, a 14-day script, and production access notes in one place.
- Use `docs/PLAY_CONSOLE_SUBMISSION_PACK.md` and `node gunmojipuzzle\tools\check-play-console-pack.cjs` before entering Play Console app setup, store listing, app content, target audience, and content rating values.
- Use `docs/CONTENT_RATING_DRAFT.md` and `node gunmojipuzzle\tools\check-content-rating.cjs` before answering the Play Console content rating questionnaire.
- Use `docs/PROMO_ASSET_QA.md` and `node gunmojipuzzle\tools\check-promo-assets.cjs` before uploading the feature graphic or refreshing store art.
- Use `docs/BUILD_METADATA.md` and `node gunmojipuzzle\tools\check-build-metadata.cjs` before uploading a tester or store-review build so screenshots and Play Console version fields refer to the same build id.
- Run `node gunmojipuzzle\tools\check-production-readiness.cjs` before public submission. It is expected to fail until closed-test controls, local policy links, placeholder rewarded recovery, local economy authority, native packaging, TWA host/signing placeholders, and Digital Asset Links placeholders are resolved.
- Replace local `../homepage/` policy links with hosted production URLs before submission.
- Keep probability disclosure, pack lineup, sale period, and exchange-daruma terms visible before any random-item purchase.
- Do not show official mascots, official logos, real store names, third-party IP, copied photos, or existing maps in store assets.
- The non-PII event log remains local in this prototype. Production analytics requires policy wording, consent handling, destination, and retention-period review.

## App Store Listing Notes

- App Store submission handoff: `docs/APP_STORE_SUBMISSION_PACK.md`
- App Store Connect template: `ios/app-store-connect.template.json`
- iOS wrapper template: `ios/wkwebview-wrapper.template.json`
- Run `node gunmojipuzzle\tools\check-app-store-pack.cjs` before entering App Store Connect values.
- If the `G` purchase screen is included in the App Store binary, it must use StoreKit consumable products. If StoreKit is not connected, submit with purchase UI disabled like the public preview.
