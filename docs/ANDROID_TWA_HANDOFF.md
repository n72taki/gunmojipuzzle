# Android TWA Handoff

Last updated: 2026-06-16

## Purpose

This document keeps the Android-first release path concrete without pretending the native wrapper is finished. The recommended first wrapper route is a Trusted Web Activity (TWA) after the public preview is hosted on HTTPS.

## Current Decision

- Package id draft: `com.sharocatcreate.kanagunmatsuri`
- First store target: Google Play closed test
- Source web app: `gunmojipuzzle/`
- Public preview output: `gunmojipuzzle/dist/public-preview/`
- Wrapper config draft: `twa-manifest.json`
- Digital Asset Links template: `android/twa/assetlinks.template.json`

## Required Before Wrapper Generation

1. Host the public preview on the final HTTPS origin.
2. Replace `TODO_PUBLIC_HOST` in `twa-manifest.json`.
3. Replace local policy links with production HTTPS URLs.
4. Generate the Android release signing key.
5. Replace `TODO_RELEASE_CERT_SHA256` with the release certificate SHA-256 fingerprint.
6. Publish `/.well-known/assetlinks.json` on the same host using the final package id and fingerprint.
7. Decide whether public builds remove rewarded recovery entirely or replace it with a real SDK success callback.
8. Move stamina/economy authority server-side before monetized recovery, ranking, or account sync.
9. Generate the Android wrapper with a target API level that satisfies the current Google Play target API policy.

## Public Preview Commands

Run these from the workspace root:

```text
node gunmojipuzzle\tools\build-public-preview.cjs
node gunmojipuzzle\tools\check-public-preview.cjs
node gunmojipuzzle\tools\smoke-public-preview.cjs
```

If the hosted policy URLs are ready, pass them into the preview build:

```text
$env:PUBLIC_PRIVACY_URL="https://example.com/gunmojipuzzle/privacy"
$env:PUBLIC_TERMS_URL="https://example.com/gunmojipuzzle/terms"
$env:PUBLIC_COMMERCIAL_URL="https://example.com/gunmojipuzzle/commercial-transactions"
node gunmojipuzzle\tools\build-public-preview.cjs
node gunmojipuzzle\tools\check-public-preview.cjs --expect-hosted-policies
node gunmojipuzzle\tools\check-production-readiness.cjs --root gunmojipuzzle\dist\public-preview --skip-native
```

## Release File Preparation

After the final host and release certificate fingerprint are known, validate the Android release values without writing files:

```text
$env:PUBLIC_HOST="example.com"
$env:PUBLIC_PRIVACY_URL="https://example.com/gunmojipuzzle/privacy"
$env:PUBLIC_TERMS_URL="https://example.com/gunmojipuzzle/terms"
$env:PUBLIC_COMMERCIAL_URL="https://example.com/gunmojipuzzle/commercial-transactions"
$env:RELEASE_CERT_SHA256="AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
node gunmojipuzzle\tools\prepare-android-release.cjs --dry-run
```

When the values are final, run the same command without `--dry-run`. It writes:

- `dist/android-release/twa-manifest.json`
- `dist/android-release/.well-known/assetlinks.json`

Verify the generated files:

```text
node gunmojipuzzle\tools\check-android-release-output.cjs
```

Upload the generated `assetlinks.json` to the production host at `/.well-known/assetlinks.json`, then generate the wrapper from the prepared TWA manifest.

## Production Guard

The guard must remain red until real hosting, signing, policy, SDK, and economy decisions are resolved:

```text
node gunmojipuzzle\tools\check-production-readiness.cjs
node gunmojipuzzle\tools\check-production-readiness.cjs --root gunmojipuzzle\dist\public-preview --skip-native
```

The TWA draft intentionally contains TODO placeholders. These are release blockers, not harmless notes.

## Bubblewrap Mapping

If Bubblewrap is used later, map fields from `twa-manifest.json`:

- `packageId` -> Android application id
- `host` -> hosted origin
- `name` -> full app name
- `launcherName` -> launcher label
- `startUrl` -> launch URL path
- `themeColor` / `backgroundColor` -> Android theme colors
- `signing.sha256CertFingerprints` -> Digital Asset Links fingerprint

## Four-Perspective Release Notes

- Player: TWA launch should feel instant, portrait-locked, and recover gracefully offline after the shell is cached.
- Educator: hosted policy pages must be readable before classroom or family testing.
- Streamer: result readability, word-call timing, and post-run navigation should be retested in the Android wrapper, not only desktop browser APIs.
- Viewer: public screenshots and listing copy should show gameplay, word-call, result recap, and deck cards without closed-test labels.
