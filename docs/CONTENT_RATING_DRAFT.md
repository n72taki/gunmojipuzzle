# ぐんもじぱずる Content Rating Draft

Last updated: 2026-06-12

## Purpose

Prepare the Play Console content rating questionnaire answers for the current `ぐんもじぱずる` prototype/closed-test build. The official questionnaire result is authoritative; this document is a draft checklist so the submitted answers match the exact uploaded build.

## Official References To Recheck

- Google Play content ratings: https://support.google.com/googleplay/android-developer/answer/9859655
- Google Play target audience and content settings: https://support.google.com/googleplay/android-developer/answer/9867159
- Google Play Data safety form: https://support.google.com/googleplay/android-developer/answer/10787469

## Current Build Content Summary

- Genre: 60-second kana panel puzzle.
- Theme: cheerful Japanese festival pop with abstract local-culture word cards.
- Core interaction: slide panels, clear words, earn score.
- Learning layer: short word notes and kana breakdowns.
- Social layer: user-initiated result text/image sharing.
- Current SDK state: no real ad SDK, no billing SDK, no analytics SDK, no crash-reporting SDK, no account system.
- Current economy state: local prototype pack/stamina system with closed-test labels; no real purchases.

## Questionnaire Draft

| Area | Draft answer for current build | Notes |
| --- | --- | --- |
| Violence | No violence. | Panels disappear with score effects; no characters are harmed. |
| Blood / gore | No. | No injury, blood, gore, or body content. |
| Fear / horror | No. | Festival visuals are bright and non-horror. |
| Sexual content / nudity | No. | No romance, nudity, sexual text, or sexualized imagery. |
| Profanity / crude language | No. | UI and card text use family-safe Japanese. |
| Alcohol / tobacco / drugs | No. | Current card set and store copy should avoid these themes. |
| Gambling | No gambling. | Random packs exist as a game collection mechanic; no cash-out, betting, casino, or real-money prize. If paid random items are enabled, keep probability disclosure and policy review. |
| User-generated content | No. | Users cannot publish text, images, names, chat, or comments in the app. |
| Online interaction | No in-app player communication. | Sharing uses the device share sheet only when the user triggers it. |
| Location | No. | Local-culture words are static card data, not device location. |
| Personal data | No account or PII collection in the current prototype. | See `docs/DATA_SAFETY_DRAFT.md`. |
| Ads | No real ad SDK in the current prototype. | Test grant buttons must not ship in public production. |
| Purchases | No real purchase flow in the current prototype. | Billing requires a new review of rating, target audience, data safety, and commercial notices. |
| Target audience | Initial recommendation: `13+`. | Do not claim under-13/Families until ad, billing, privacy, education claims, and content are reviewed together. |

## Four-Perspective Rating Review

- Player: the content should read as a bright puzzle game, not gambling, casino, or real-money prize play.
- Educator: word notes should remain light local-culture hooks and should not imply formal curriculum, official endorsement, or guaranteed learning outcomes.
- Streamer: no copyrighted music, official mascot voices, third-party characters, or risky chat/UGC surfaces are present in the current build.
- Viewer: store assets and gameplay should not show violent, sexual, horror, substance, or real-money gambling cues.
- Release: answer the official questionnaire for the exact build uploaded, then archive the rating certificate/result alongside closed-test evidence.

## Recheck Triggers

Re-answer the Play Console content rating questionnaire if any of these are added:

- Real rewarded ads or an ad SDK.
- Google Play Billing or paid random packs.
- Account login, profile names, chat, comments, rankings, or friend codes.
- User-generated text or images.
- New card themes involving alcohol, tobacco, drugs, weapons, crime, horror, romance, or adult language.
- Competitive rankings or prizes.
- Third-party licensed characters, voices, music, or brand collaborations.
- A target audience under 13 or Families participation.

## Commands

```text
node gunmojipuzzle\tools\check-content-rating.cjs
node gunmojipuzzle\tools\check-play-console-pack.cjs
node gunmojipuzzle\tools\check-app-store-pack.cjs
node gunmojipuzzle\tools\release-gate.cjs
```

## App Store Rating Recheck

- App Store submission handoff: `docs/APP_STORE_SUBMISSION_PACK.md`.
- Re-answer Apple age rating questions before App Store upload, especially after adding StoreKit purchases, rankings, ads, account sync, or server-side data.
- Current target remains `13+` for store-prep consistency.
