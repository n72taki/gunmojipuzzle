# ぐんもじぱずる Build Metadata

Last updated: 2026-06-12

## Purpose

Keep every closed-test report, screenshot set, public preview, and Play Console handoff tied to a concrete build identity. This reduces confusion when testers report issues from different app versions.

## Current Build

- Version name: `0.1.0`
- Version code: `1`
- Channel: `closed-test`
- Build id: `0.1.0-closed-test.1`
- Built at: `2026-06-12`

Source of truth: `data/cards.js` `build` object.

## In-App Surfaces

- Settings screen shows `BUILD`, version, build id, channel, version code, and build date.
- Closed-test feedback reports include a `ビルド:` line.
- The bounded non-PII event log adds build/channel details on app open.
- `window.KanaGunmaPrototype.buildInfo` exposes the current build for smoke tests.

## Release Notes

- Keep `versionName` aligned with the public app version shown to testers.
- Keep `versionCode` monotonic for Android builds.
- Increment `buildId` whenever a distributed tester build changes.
- Before Play Console upload, map `versionName` and `versionCode` into the Android wrapper config/build files.
- Archive the build id with closed-test dates, tester count, rating result, Data safety version, store screenshots, and known issues.

## Four-Perspective Review

- Player: testers can mention a visible build id instead of describing when they installed the app.
- Educator: classroom/family feedback can be tied to the exact wording and word-note version used.
- Streamer: stream recordings and result screenshots can be matched to the same build id.
- Viewer: reported readability issues can be compared against the exact UI version shown on stream.
- Release: production access notes can cite the build version tested and fixes shipped after testing.

## Commands

```text
node gunmojipuzzle\tools\check-build-metadata.cjs
node gunmojipuzzle\tools\release-gate.cjs
```

## App Store Metadata Link

- App Store handoff: `docs/APP_STORE_SUBMISSION_PACK.md`.
- App Store Connect template: `ios/app-store-connect.template.json`.
- Keep the iOS Bundle ID `com.sharocatcreate.kanagunmatsuri` aligned with the Android package id unless a deliberate store split is documented.
- Before TestFlight/App Review, archive the Xcode build number, App Store Connect SKU, StoreKit product status, screenshots, and privacy-answer revision beside this build id.
