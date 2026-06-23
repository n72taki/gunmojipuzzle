# ぐんもじぱずる Data Safety Draft

Last updated: 2026-06-15

## Scope

This is the store-submission data safety draft for `ぐんもじぱずる`. It reflects the current static prototype, closed-test build, and optional first-party ranking API backed by local SQLite or Render Postgres. Recheck this document before any SDK, analytics, crash reporting, ads, purchases, account sync, support form, or broader server authority is added.

## Current Data Handling

| Category | Current state | Stored where | Sent off device | Notes |
| --- | --- | --- | --- | --- |
| Gameplay progress | Deck, owned cards, Gだるま, tickets, best score, best word, last result, completed runs | Browser/App WebView `localStorage` | No | Used to resume play and show results. |
| Stamina/economy state | Stamina count and recovery timestamp | `localStorage` | No | Prototype authority only. Server authority is mandatory before monetized recovery. |
| Ranking submission and game profile | Player id, display name, selected title id/title, player rank/EXP, season/stage, score, rank, matches, max combo, best word, best word card id, deck ids, build id, and timestamps | `localStorage` pending queue and first-party SQLite/Postgres ranking database when the API URL is configured | Yes, only when the ranking API is configured and reachable | Used to show the whole-user ranking and preserve minimal in-game profile state. No account, email, phone number, location, or free-text profile is required. |
| Settings | Sound, vibration, reduced motion, large text, high contrast, panel number marks | `localStorage` | No | Used for accessibility and readability. |
| Closed-test event log | Recent non-PII actions such as app open, screen view, run start/finish, pack open, settings changes | `localStorage`, max 24 events | No automatic send | Copied only if the tester taps the report copy action. |
| Quick feedback | Result chip selection such as fun/difficult/learning/exciting/viewability | `localStorage`, max 12 entries | No automatic send | Short closed-test feedback, no free text. |
| Result and pack share text/image | Generated in memory when the user taps share/save | Device share sheet, clipboard, or download flow chosen by user | User-controlled only | No automatic upload by the app. |
| Audio and vibration | Sound playback and optional haptics | Not stored beyond settings | No | Uses Web Audio and `navigator.vibrate` when available. |

## Current Non-Collection Claims

- No account registration.
- No email or phone login.
- No precise location.
- No contacts.
- No photos or camera access.
- No microphone access.
- No free-text personal profile.
- No third-party analytics SDK.
- No crash-reporting SDK.
- No ad SDK connected in the public preview.
- No real payment SDK flow in the current prototype.

## Store Listing / Policy Wording

Use wording consistent with:

- The app stores gameplay progress and settings on the device.
- Optional ranking sync sends only gameplay ranking fields to the first-party ranking server when the API URL is configured.
- Closed-test reports may include recent non-PII operation logs only when the tester chooses to copy/share the report.
- Current public preview removes test grant buttons and placeholder rewarded stamina UI, and shows a pack note that opening uses only free in-game `Gだるま` from daily gifts, missions, or goals.
- If ads, purchases, analytics, crash reports, account sync, support forms, or server-side stamina are added later, the privacy policy, data safety form, consent wording, and production guard must be updated before release.

## Four-Perspective Risk Notes

- Player: local-only saves are easy to understand, but users must not believe prototype test recovery is real ad reward behavior.
- Educator: no account, location, microphone, or camera access makes classroom/family testing easier to explain.
- Streamer: result and pack-opening sharing are user-triggered, so streamers stay in control of what leaves the device.
- Viewer: public screenshots should not show tester report panels or test economy labels.
- Release: the SQLite ranking server is the minimum first-party ranking authority for prototype testing. Before a competitive public launch, add HTTPS, backups, rate limits, abuse controls, monitoring, and matching privacy/data safety updates. Stronger server authority is mandatory before paid stamina recovery or account sync.

## Release Gate Expectations

The release gate should verify:

- This document exists and mentions `localStorage`, `非PII`, and SDK recheck requirements.
- This document describes the optional first-party SQLite/Postgres ranking database and the limited ranking/profile fields sent off device.
- Homepage privacy policy mentions `ぐんもじぱずる`, `localStorage`, and `非PII`.
- Public preview checks still reject tester-only report surfaces and test economy labels.
- Production readiness still blocks placeholder rewarded recovery and local economy authority.

## StoreKit / Billing Recheck

- Apple App Store handoff is tracked in `docs/APP_STORE_SUBMISSION_PACK.md`.
- Google Play handoff is tracked in `docs/PLAY_CONSOLE_SUBMISSION_PACK.md`.
- Current `G` purchase buttons are closed-test mock grants only, not real payments.
- Before enabling paid `G`, update this draft, hosted privacy policy, commercial transactions page, Google Play Data safety, and App Store privacy answers.
- iOS paid `G` must use StoreKit; Android paid `G` must use Google Play Billing.
