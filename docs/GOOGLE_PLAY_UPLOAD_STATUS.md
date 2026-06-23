# Google Play Upload Status

Last updated: 2026-06-16

## Current Goal

Prepare `ぐんもじぱずる` for a Google Play upload as far as possible before the final Play Console, hosting, signing, and policy decisions are available.

## Current Route

- First Android route: Trusted Web Activity (TWA)
- Package id draft: `com.sharocatcreate.kanagunmatsuri`
- Store target draft: Google Play closed test first, then production after blocker review
- Current wrapper state: TWA handoff/config exists; a Gradle Android project/AAB is not generated yet
- Public web build source: `gunmojipuzzle/`
- Public preview output: `dist/public-preview/`

## Prepared Artifacts

| Area | Status | Files |
| --- | --- | --- |
| Store listing copy | Ready as draft | `docs/STORE_LISTING_DRAFT.md` |
| Play Console input pack | Ready as draft | `docs/PLAY_CONSOLE_SUBMISSION_PACK.md` |
| Data safety answers | Ready as draft, must recheck for final SDKs | `docs/DATA_SAFETY_DRAFT.md` |
| Content rating answers | Ready as draft | `docs/CONTENT_RATING_DRAFT.md` |
| Closed test plan | Ready as draft | `docs/CLOSED_TEST_PLAN.md` |
| Android TWA handoff | Ready as draft with TODO placeholders | `docs/ANDROID_TWA_HANDOFF.md`, `twa-manifest.json`, `android/twa/assetlinks.template.json` |
| Store screenshots | Ready as 9-screen public and closed-test sets | `store-assets/public-screenshots/`, `store-assets/screenshots/` |
| Feature graphic | Ready as generated draft | `store-assets/feature-graphic.jpg` |
| App icons | Ready as PWA icon drafts | `assets/app-icon-192.png`, `assets/app-icon-512.png`, `assets/app-icon.svg` |
| Policy page scaffolds | Ready locally; must be hosted | `../homepage/privacy.html`, `../homepage/terms.html`, `../homepage/commercial-transactions.html` |

## Store Asset Set

Both screenshot sets are expected to contain:

1. `01-title.png`
2. `02-home.png`
3. `03-gameplay.png`
4. `04-result.png`
5. `05-deck.png`
6. `06-pack.png`
7. `07-settings.png`
8. `08-missions.png`
9. `09-ranking.png`

Current generated dimensions:

- Screenshots: `1290x2796` portrait PNG
- Feature graphic: `1024x500` JPG
- App icons: `192x192` and `512x512` PNG

## Play Console Draft Values

| Field | Draft |
| --- | --- |
| App name | `ぐんもじぱずる` |
| Default language | Japanese |
| App type | Game |
| Category | Puzzle |
| Pricing | Free |
| Ads | No real ad SDK in the current public-preview assumption |
| In-app products | No real Google Play Billing flow in the current public-preview assumption |
| Target audience recommendation | `13+` until child/Families, ads, billing, and random-item economy decisions are reviewed together |
| Data collection summary | Local progress/settings plus optional first-party ranking fields if ranking API is configured |
| Permissions | No account, login, precise location, contacts, camera, microphone, photos, analytics SDK, crash SDK, real ad SDK, or real payment SDK in the current prototype |

## Still Blocked Before Actual Upload

- Final HTTPS host for the game and policy pages.
- Final privacy policy, terms, and commercial transactions URLs.
- Release signing key and SHA-256 certificate fingerprint.
- Replacement of `TODO_PUBLIC_HOST`, `TODO_PUBLIC_PRIVACY_URL`, `TODO_PUBLIC_TERMS_URL`, `TODO_PUBLIC_COMMERCIAL_URL`, and `TODO_RELEASE_CERT_SHA256`.
- Published `/.well-known/assetlinks.json` on the production host.
- Generated Android wrapper/AAB from the resolved TWA settings.
- Android target API level verification against the current Google Play policy at wrapper generation time.
- Play Console account access, app creation, developer identity/payment profile items, and official questionnaire submission.
- Final decision on whether `Gだるま` purchase UI is disabled for launch or implemented with Google Play Billing and server authority.

## Commands To Run Before Play Console Entry

From the workspace root:

```text
node gunmojipuzzle\tools\capture-store-assets.cjs
node gunmojipuzzle\tools\capture-store-assets.cjs --public
node gunmojipuzzle\tools\check-store-assets.cjs
node gunmojipuzzle\tools\generate-feature-graphic.cjs
node gunmojipuzzle\tools\check-promo-assets.cjs
node gunmojipuzzle\tools\check-content.cjs
node gunmojipuzzle\tools\check-data-safety.cjs
node gunmojipuzzle\tools\check-content-rating.cjs
node gunmojipuzzle\tools\check-play-console-pack.cjs
node gunmojipuzzle\tools\check-android-handoff.cjs
node gunmojipuzzle\tools\build-public-preview.cjs
node gunmojipuzzle\tools\check-public-preview.cjs
```

With final HTTPS policy URLs:

```text
$env:PUBLIC_PRIVACY_URL="https://example.com/gunmojipuzzle/privacy"
$env:PUBLIC_TERMS_URL="https://example.com/gunmojipuzzle/terms"
$env:PUBLIC_COMMERCIAL_URL="https://example.com/gunmojipuzzle/commercial-transactions"
node gunmojipuzzle\tools\build-public-preview.cjs
node gunmojipuzzle\tools\check-public-preview.cjs --expect-hosted-policies
```

With final host and release fingerprint:

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

