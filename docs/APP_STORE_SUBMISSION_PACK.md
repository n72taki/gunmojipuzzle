Source template: `ios/app-store-connect.template.json`
Native wrapper template: `ios/wkwebview-wrapper.template.json`

# App Store Submission Pack

Last updated: 2026-06-14

## Summary

`ぐんもじぱずる` is not ready for direct App Store upload yet because there is no checked-in Xcode project, no signed iOS archive, and the new `G` purchase UI is still a browser-side closed-test mock. This pack makes those blockers explicit and gives the iOS/App Store handoff a repeatable checklist.

The intended App Store route is a native iOS shell with `WKWebView`, using the public-review build of the game. The binary must either integrate StoreKit for paid `G` bundles or submit with the purchase UI disabled like the public preview.

## Official References To Recheck

- Apple upcoming requirements: `https://developer.apple.com/news/upcoming-requirements/`
- App Review Guidelines: `https://developer.apple.com/app-store/review/guidelines/`
- App Store Connect app information: `https://developer.apple.com/help/app-store-connect/reference/app-information/`
- Google Play target API requirements: `https://developer.android.com/google/play/requirements/target-sdk`
- Google Play payments policy explainer: `https://support.google.com/googleplay/android-developer/answer/10281818`
- Google Play Data safety: `https://support.google.com/googleplay/android-developer/answer/10787469`

## App Store Connect Draft

- Name: `ぐんもじぱずる`
- Bundle ID: `com.sharocatcreate.kanagunmatsuri`
- SKU: `KANAGUNMATSURI-IOS-001`
- Primary locale: `ja-JP`
- Category: `Games`
- Secondary category: `Education`
- App price: Free
- Age rating target: `13+`
- Kids Category: No
- User-generated content: No
- Account/login: No
- Location/camera/microphone/photos/contacts: No
- Tracking: No in the current build
- Privacy policy URL: `TODO_PUBLIC_PRIVACY_URL`
- Support URL: `TODO_PUBLIC_SUPPORT_URL`
- Marketing URL: `TODO_PUBLIC_MARKETING_URL`

## iOS Wrapper Requirements

- Build on macOS with Xcode 26 or later and the iOS 26 SDK or later.
- Use `WKWebView` in a native portrait shell.
- Prefer bundled public-review assets so the game opens even if network is unavailable during review.
- Keep JavaScript enabled and local storage available.
- Keep safe-area padding active on all iPhone sizes.
- Do not add analytics, crash reporting, ads, or purchase SDKs without updating `docs/DATA_SAFETY_DRAFT.md`, homepage policy pages, and App Store privacy answers.
- If native sharing or haptics are added later, document permissions and privacy impact before upload.

## G Purchase / StoreKit Decision

Current `G` purchase state:

- Closed-test web build: purchase buttons grant test `G` locally.
- Public preview: purchase buttons are disabled and marked `購入なし`.
- App Store submission: must choose one of these production-safe routes:
  - integrate StoreKit consumable products for `G12`, `G55`, `G120`, and `G260`; or
  - disable/hide the purchase UI and rely only on free `G` from missions and gifts.

Do not submit a binary with `purchaseTestNotice`, `購入モック`, `G_SHOP_PURCHASES_ENABLED = true`, or local-only paid `G` grants.

## App Review Notes Draft

Use this as the starting review note:

```text
ぐんもじぱずる is a 60-second portrait kana puzzle game themed around Gunma words. It has no login, no account creation, no chat/UGC, no location, no camera, no microphone, and no personal data upload in this build.

The game stores progress and settings locally on device. Ranking/server and paid purchase features are not enabled in this submitted build unless otherwise noted.

If the submitted build includes G purchases, they are StoreKit consumable in-app purchases. If StoreKit is not connected, the G purchase screen is disabled and no real purchase occurs.
```

## Screenshot And Metadata Assets

- Store screenshot source: `store-assets/public-screenshots/`
- Feature graphic / promo reference: `store-assets/feature-graphic.jpg`
- Icon source: `assets/app-icon.svg`
- Icon PNGs: `assets/app-icon-192.png`, `assets/app-icon-512.png`
- Shared store copy: `docs/STORE_LISTING_DRAFT.md`
- Privacy/data reference: `docs/DATA_SAFETY_DRAFT.md`
- Rating draft: `docs/CONTENT_RATING_DRAFT.md`
- Rights and monetization rules: `docs/RIGHTS_AND_MONETIZATION.md`

## Required Commands

Run from the workspace root:

```text
node gunmojipuzzle\tools\build-public-preview.cjs
node gunmojipuzzle\tools\check-public-preview.cjs
node gunmojipuzzle\tools\smoke-public-preview.cjs
node gunmojipuzzle\tools\capture-store-assets.cjs --public
node gunmojipuzzle\tools\check-store-assets.cjs
node gunmojipuzzle\tools\check-app-store-pack.cjs
node gunmojipuzzle\tools\check-production-readiness.cjs --expect-blockers
```

For a hosted-policy rehearsal:

```text
$env:PUBLIC_PREVIEW_OUTPUT_DIR="dist/public-preview-hosted-check"
$env:PUBLIC_PRIVACY_URL="https://example.com/gunmojipuzzle/privacy"
$env:PUBLIC_TERMS_URL="https://example.com/gunmojipuzzle/terms"
$env:PUBLIC_COMMERCIAL_URL="https://example.com/gunmojipuzzle/commercial-transactions"
node gunmojipuzzle\tools\build-public-preview.cjs
node gunmojipuzzle\tools\check-public-preview.cjs --expect-hosted-policies
node gunmojipuzzle\tools\check-production-readiness.cjs --root gunmojipuzzle\dist\public-preview-hosted-check --skip-native
```

## Production Blockers

- No Xcode project or signed `.ipa` exists yet.
- App Store Connect template still contains hosted URL TODO values.
- `G` purchase bundles are not connected to StoreKit.
- Current closed-test build still contains purchase mock/test grant controls.
- Native device QA on small and large iPhones has not been run.
- App privacy answers must be rechecked after any SDK, ranking server, account sync, ads, purchases, or crash logging is added.
