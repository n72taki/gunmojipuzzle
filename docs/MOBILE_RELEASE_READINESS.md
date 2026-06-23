# ぐんもじぱずる Mobile Release Readiness

Last updated: 2026-06-12

## Current Release Shape

- Current build is a static HTML/CSS/Canvas prototype in `gunmojipuzzle/`.
- Primary target is portrait smartphone play around 390px width.
- Android-first native packaging route is now drafted as a Trusted Web Activity handoff. The wrapper is not generated yet, but the required host, signing, and Digital Asset Links placeholders are tracked.

## Added For App Readiness

- PWA-style metadata in `index.html` and `manifest.webmanifest`.
- Service worker offline cache for the static game shell, data, scripts, icons, and generated art when served over HTTP/HTTPS.
- App icon source at `assets/app-icon.svg` and generated PNGs at `assets/app-icon-192.png` / `assets/app-icon-512.png`.
- Local save for deck, deck slot colors, push card, owned cards, Gだるま, choice tickets, stamina, settings, best score, and best word.
- Light yaki-manju stamina loop: 1 piece per play, max 5, and 1 recovery every 10 minutes.
- No-reward practice mode when stamina is empty, so players can keep learning controls without advancing rewards, best score, daily goals, or pack currency.
- Home top-status yaki-manju pips with a skewer and eaten empty state so players can see remaining plays before the deck, primary buttons, and bottom ad slot.
- Empty-yaki-manju home guidance with recovery countdown and a no-reward practice button, reducing confusion between paid/rewarded recovery and practice.
- Manual pause, mid-run quit, result home return, plus automatic pause on app/browser hide or screen navigation, protecting 60-second runs from mobile interruptions.
- Rewarded-ad placeholder for +1 stamina recovery, kept separate from natural recovery so an SDK callback can replace it.
- Bottom banner ad slot placeholder across app screens, with mobile padding so it can be tested without covering the board, deck builder, pack buttons, or settings controls.
- Daily mission loop: clear 3 words in a day to receive 1 free pack stone.
- Daily score target loop: reach 5,000 points in a day to receive 1 free pack stone.
- Daily gift loop: after the first completed run, claim 1 free pack stone from the next-login modal once per day as a light return hook without interrupting the immediate post-run reaction flow or taking permanent home-screen height.
- Daily streak loop: clear the daily mission 3 days in a row to receive 1 extra free pack stone.
- Weekly non-paid challenge loop: clear 12 words in a week to receive 1 free pack stone, hidden until the warmup phase is over.
- First-session home focus that hides daily pressure until the first completed run and presents `FIRST PLAY`/`PLAY` as the main action.
- First-run tutorial coach that tells players to slide the glowing panels, keeps a static hint visible under reduced motion, and auto-demos a successful `ぐんまけん` clear after 8 seconds of hesitation.
- Warmup home pacing that keeps daily, score, and weekly goals hidden until 3 completed runs.
- Post-run home hierarchy that shows `LAST RUN` and the main action buttons first, with only a compact mission summary on the home menu, keeping replay/deck/pack reactions faster than reward review.
- Dedicated missions screen for the daily word, daily mission, score goal, and weekly challenge, so goal review is available without crowding the top menu.
- Mission-screen daily-word target after the first completed run, selecting one current-deck card per day as a non-reward play prompt with a direct word-guide shortcut. The visible copy stays player-facing and avoids internal `topic/learning/stream/viewer` labels.
- Claimed daily and score-goal mission panels after warmup, making completed goals feel like a satisfying daily stopping point.
- Result screen with rank, best score, cleared word count, max combo, best word, reward summary, and only three actions: replay, top menu, and deck builder.
- Result screen no longer shows mission progress, next-goal copy, word-note shortcuts, feedback chips, result sharing, or image sharing; missions and word notes stay on their dedicated screens.
- Result reward summary for earned free Gだるま, achievement reason, and no-reward practice clarity.
- Collection word guide on the deck screen so players and educators can review card readings, short local notes, card status, and direct deck/pack actions outside a run.
- Game-facing collection filters for `ALL`, owned, missing, `GGG`, `GG`, and `G`, replacing the earlier mountain/hot-spring-style category filters in deck construction.
- Collection sorting for recommended, rarity, short words, long words, and kana/name order, so deck construction can be tested for speed and clarity.
- Kana breakdown and internal card prompt data remain available for planning and closed-test reports, but the word guide does not show `話題/学び/配信/視聴` labels in-game.
- Direct word-guide action button for push-card setting, deck insertion, choice-ticket acquisition, and exchange-daruma acquisition, reducing the number of taps after opening a pack lineup card.
- Transient non-blocking word-call on clears so nearby viewers can read the completed word and score moment without covering the next slide target.
- Word-call emphasis stays outside the puzzle board below the top bar instead of the center, preserving tile visibility and touch flow during repeated clears.
- Result recap keeps the best word highlight on the normal result screen without adding a separate stream-only mode or post-run goal prompt.
- In-app settings links to the privacy policy, terms, and commercial transactions page scaffolds in `../homepage/`.
- Bounded non-PII event log for closed tests to help reproduce play, pack, stamina, settings, and runtime-error issues without exposing an in-game feedback panel.
- Data safety draft at `docs/DATA_SAFETY_DRAFT.md`, matching the current local-only save, non-PII test log, no-account, no-location, no-camera, no-microphone, no-real-SDK prototype state.
- Mobile feedback hooks: Web Audio effects and `navigator.vibrate` when vibration is enabled.
- Settings sound-test button so testers can confirm audio output and mobile Web Audio unlock behavior before a run or stream.
- Sound QA at `docs/SOUND_QA.md` and `tools/check-sound-cues.cjs`, documenting the cue map for start, slide, clear, refresh, skill, pack, finish, and blocked-action feedback.
- Build metadata at `docs/BUILD_METADATA.md` and `tools/check-build-metadata.cjs`, tying settings-screen build display, feedback reports, Play Console notes, and release-gate checks to `0.1.0-closed-test.1`.
- Accessibility toggles for reduced motion, larger UI/panel text, higher contrast panels, and optional panel number marks.
- Deck color chips expose the color name, while card labels expose only `推し` or `デッキ入り`; panel numbers remain an optional board accessibility setting instead of a deck concept.
- Closed-test economy labels on pack and stamina ad controls, making it clear that test grants are not production purchases.
- Pack opening reward reveal with rarity, card/ticket name, and new-or-duplicate context for player and viewer readability.
- First card pack `ぐんまのし`, with 12 generated city-card images, sale period fields, fixed current entries, and a future randomizable-card-pool marker.
- Rarity display changed from numeric `G1/G2/G3` copy to repeated G icon badges (`G/GG/GGG`) across deck, collection, pack rates, reveal, and word guide surfaces.
- Pack screen lineup previews all 12 city cards with individual rates and owned state, and each mini card links into the word guide for disclosure and pre-purchase comprehension.
- Pack exchange daruma: every opening grants 1 local exchange daruma, and 50 can be spent on one unowned card from the current pack to reduce random-item frustration in closed tests.
- Pack collection progress: the pack screen shows owned count, a progress bar, and the next unowned target card so collection has a visible goal without adding paid-only rewards.
- Pack reveal detail action: after an opening, the reward card or choice-ticket target can be opened directly in the word guide/deck builder.
- Pack reveal share action: after an opening, the result can be shared or copied with rarity, card name, pack name, featured cards, sale period, and collection progress.
- Deck construction supports adding owned pack cards into the deck and setting a favorite, while preserving panel colors and same-name restrictions.
- Deck construction hides the retired `くさつおんせん` collection candidate while keeping `やきまんじゅう` visible so the stamina motif still has an in-game card reference.
- Result screen keeps replay/top/deck actions visible and leaves next goals to the player or missions screen.
- Store listing draft and repeatable high-resolution screenshot capture tool for closed-test/store-prep review.
- Store screenshot QA at `docs/STORE_ASSET_QA.md` and `tools/check-store-assets.cjs`, verifying both closed-test and public-review screenshot sets, including the dedicated missions screen.
- Promo asset QA at `docs/PROMO_ASSET_QA.md`, plus `tools/generate-feature-graphic.cjs` and `tools/check-promo-assets.cjs` for a `1024x500` feature graphic draft.
- Public store screenshot capture mode at `tools/capture-store-assets.cjs --public`, writing to `store-assets/public-screenshots/` with closed-test labels and tester-only panels hidden.
- Public static preview build at `tools/build-public-preview.cjs`, writing to `dist/public-preview/` with closed-test grant buttons, tester feedback copy, and placeholder rewarded stamina UI removed.
- Public preview browser smoke at `tools/smoke-public-preview.cjs`, opening the generated preview at 390px width and checking title, menu, pack, settings, game start, and closed-test UI absence.
- Isolated hosted-policy public preview guard: `PUBLIC_PREVIEW_OUTPUT_DIR=dist/public-preview-hosted-check` can build a second preview with HTTPS policy URLs, then run `check-public-preview.cjs --expect-hosted-policies` and `check-production-readiness.cjs --root ... --skip-native` so web-public blockers are separated from native host/signing blockers.
- Android TWA handoff artifacts: `twa-manifest.json`, `android/twa/assetlinks.template.json`, `docs/ANDROID_TWA_HANDOFF.md`, and `tools/check-android-handoff.cjs`.
- Production submission guard at `tools/check-production-readiness.cjs`, which fails public-release checks while closed-test economy controls, local policy links, placeholder rewarded recovery, local economy authority, tester feedback panels, missing native packaging, or TWA/assetlinks TODO placeholders remain.
- Closed-test plan at `docs/CLOSED_TEST_PLAN.md`, with 12 opted-in tester / 14-day Google Play requirement notes, 16-20 tester recruiting target, four-perspective cohorts, and stop conditions.
- Play Console submission pack at `docs/PLAY_CONSOLE_SUBMISSION_PACK.md`, with app setup, store listing inputs, app-content draft answers, target-audience guidance, and production blockers.
- Google Play upload status at `docs/GOOGLE_PLAY_UPLOAD_STATUS.md`, summarizing prepared artifacts, Play Console draft values, and blockers that need final host/signing/account decisions.
- Content rating draft at `docs/CONTENT_RATING_DRAFT.md`, documenting current no-violence, no-UGC, no-real-ad, no-real-payment assumptions and the recheck triggers.
- Existing probability display for packs and rule/content/balance verification tools.

## Store Submission Blockers

- Confirm the Android TWA route, then generate the wrapper from `twa-manifest.json` after HTTPS hosting is ready.
- Create native app identifiers, signing keys, app versioning, and build pipeline. Replace `TODO_RELEASE_CERT_SHA256` in both TWA and assetlinks files.
- Run `node gunmojipuzzle\tools\check-production-readiness.cjs` and resolve every blocker before a public store submission. In the current prototype, this is expected to fail until production URLs, native packaging, and SDK/economy decisions are complete.
- Run `node gunmojipuzzle\tools\check-android-handoff.cjs` before wrapper handoff to verify the TWA draft, Digital Asset Links template, and handoff document stay aligned.
- Run `node gunmojipuzzle\tools\build-public-preview.cjs` and `node gunmojipuzzle\tools\check-public-preview.cjs` before reviewing any public-facing build screenshots or wrapper handoff.
- For final-host rehearsal before native packaging, build a second preview with `PUBLIC_PREVIEW_OUTPUT_DIR=dist/public-preview-hosted-check` and hosted HTTPS policy URLs, then run `check-public-preview.cjs --expect-hosted-policies` plus `check-production-readiness.cjs --root gunmojipuzzle\dist\public-preview-hosted-check --skip-native`.
- Prepare final store assets: final-review feature graphic, optional short trailer, hosted policy URLs, and public screenshots with closed-test labels removed where needed. Draft listing, feature graphic generation, and repeatable screenshot capture tools now exist.
- Run `node gunmojipuzzle\tools\check-store-assets.cjs` after screenshot capture to verify all 18 screenshots are valid portrait PNGs at store-ready resolution.
- Publish hosted app-specific privacy policy, terms, and commercial transactions URLs, then replace the prototype's local `../homepage/` links before store submission.
- Recheck `docs/DATA_SAFETY_DRAFT.md`, homepage privacy/terms/commercial pages, and the Play Console data safety form after any SDK, analytics, crash reporting, ad, purchase, account, ranking, or server authority change.
- Use `docs/CLOSED_TEST_PLAN.md` before the Google Play closed test, then preserve tester count, active days, build version, feedback themes, fixes, and known issues for production access review.
- Use `docs/PLAY_CONSOLE_SUBMISSION_PACK.md` and `tools/check-play-console-pack.cjs` before entering Play Console values, so store copy, data safety, target audience, content rating, screenshots, and TWA blockers stay aligned.
- Use `docs/BUILD_METADATA.md` and `tools/check-build-metadata.cjs` before distributing each tester build, then archive the exact build id with screenshots, feedback themes, and fixes.
- Use `docs/CONTENT_RATING_DRAFT.md` and `tools/check-content-rating.cjs` before answering the Play Console content rating questionnaire.
- Test service-worker caching through the selected Android/iOS packaging route, because `file://` local preview intentionally skips registration.
- Before production release, replace the closed-test ad/test grant buttons and rewarded stamina recovery with real SDK success callbacks, or remove monetization entirely from that build.
- Move stamina recovery authority to server time before competitive ranking or monetized stamina recovery.
- Move daily mission and streak authority to server time before adding leaderboards, account sync, or paid recovery.
- Verify Apple/Google random item probability disclosure, ads policy, child/family settings, and paid item wording.
- Confirm every card/art prompt has a rights memo and no official logo, mascot, photo copy, existing map, or third-party IP.
- Run device QA on low-end Android, modern Android, iPhone small screen, and iPhone large screen.

## Popularity Improvement Backlog

- Tune the daily gift, daily mission, and stamina pacing together after closed-test retention feedback, keeping free rewards helpful without turning the home screen into pressure.
- Check whether the daily-word target increases first-run clarity, family conversation, and stream/viewer commentary without adding home-screen pressure.
- Native wrapper handoff should keep result navigation simple and avoid adding share/report buttons back into the post-run surface.
- If broad external testing needs written feedback, use an external form or support mailbox outside the in-game result and settings flow.
- Weekly non-paid ranking or local friend-code ranking after anti-cheat requirements are defined.
- Tune pack opening timing after live playtests, while keeping odds visible before purchase.
- Tune the exchange daruma cost after closed-test data; the current 50-openings setting may need adjustment before real monetization.
- Accessibility pass: TalkBack/VoiceOver labels in native wrapper and larger-screen tablet layout.

## Release Gate Commands

Run these before sharing a build:

```text
node gunmojipuzzle\tools\release-gate.cjs
```

For a shorter local iteration, set `PACK_SIM_RUNS=20000` before running the same gate.

Generate and verify the public static preview:

```text
node gunmojipuzzle\tools\build-public-preview.cjs
node gunmojipuzzle\tools\check-public-preview.cjs
node gunmojipuzzle\tools\smoke-public-preview.cjs
node gunmojipuzzle\tools\check-android-handoff.cjs
node gunmojipuzzle\tools\check-data-safety.cjs
node gunmojipuzzle\tools\check-closed-test-plan.cjs
node gunmojipuzzle\tools\check-build-metadata.cjs
```

Generate a production-review public preview with hosted policy URLs:

```text
$env:PUBLIC_PRIVACY_URL="https://example.com/gunmojipuzzle/privacy"
$env:PUBLIC_TERMS_URL="https://example.com/gunmojipuzzle/terms"
$env:PUBLIC_COMMERCIAL_URL="https://example.com/gunmojipuzzle/commercial-transactions"
node gunmojipuzzle\tools\build-public-preview.cjs
node gunmojipuzzle\tools\check-public-preview.cjs --expect-hosted-policies
node gunmojipuzzle\tools\check-production-readiness.cjs --root gunmojipuzzle\dist\public-preview --skip-native
```

Validate Android TWA release handoff values after the final host and release certificate fingerprint are known:

```text
$env:PUBLIC_HOST="example.com"
$env:PUBLIC_PRIVACY_URL="https://example.com/gunmojipuzzle/privacy"
$env:PUBLIC_TERMS_URL="https://example.com/gunmojipuzzle/terms"
$env:PUBLIC_COMMERCIAL_URL="https://example.com/gunmojipuzzle/commercial-transactions"
$env:RELEASE_CERT_SHA256="AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
node gunmojipuzzle\tools\prepare-android-release.cjs --dry-run
node gunmojipuzzle\tools\prepare-android-release.cjs
node gunmojipuzzle\tools\check-android-release-output.cjs
```

Check public-production blockers separately:

```text
node gunmojipuzzle\tools\check-production-readiness.cjs
node gunmojipuzzle\tools\check-production-readiness.cjs --root gunmojipuzzle\dist\public-preview --skip-native
```

For the current closed-test prototype, validate that the guard is still catching known blockers:

```text
node gunmojipuzzle\tools\check-production-readiness.cjs --expect-blockers
```

Generate closed-test/store-prep screenshots:

```text
node gunmojipuzzle\tools\capture-store-assets.cjs
node gunmojipuzzle\tools\capture-store-assets.cjs --public
node gunmojipuzzle\tools\check-store-assets.cjs
```

## Apple App Store Readiness Addendum

- App Store handoff is tracked in `docs/APP_STORE_SUBMISSION_PACK.md`.
- iOS wrapper templates live in `ios/app-store-connect.template.json` and `ios/wkwebview-wrapper.template.json`.
- The intended iOS route is a native `WKWebView` game shell built on macOS with Xcode 26+ and the iOS 26 SDK+.
- The current `G` purchase screen is a closed-test browser mock. It must be replaced with StoreKit consumable products or disabled before App Review.
- Run `node gunmojipuzzle\tools\check-app-store-pack.cjs` before TestFlight or App Review handoff.
- Production readiness now blocks `G_SHOP_PURCHASES_ENABLED = true`, purchase mock copy, unresolved StoreKit/disabled-purchase decisions, and missing iOS native packaging.
