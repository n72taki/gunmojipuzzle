# ぐんもじぱずる Google Play Closed Test Plan

Last updated: 2026-06-12

## Purpose

Prepare `ぐんもじぱずる` for a Google Play closed test that produces useful product feedback, not only a pass/fail install check. This plan is Android-first and assumes the TWA route in `docs/ANDROID_TWA_HANDOFF.md`.

## Official References Checked

- Google Play app testing tracks, including internal, closed, and open testing: https://support.google.com/googleplay/android-developer/answer/9845334
- Google Play production access testing requirements for personal developer accounts, including 12 opted-in testers for at least 14 days: https://support.google.com/googleplay/android-developer/answer/14151465
- Google Play Data safety form requirements: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play target audience and content settings: https://support.google.com/googleplay/android-developer/answer/9867159

Recheck these pages before submission. Store policy and Play Console flows can change.

## Current Release Shape

- Current app state: playable static web prototype with PWA metadata and public preview build.
- Android wrapper state: TWA handoff draft exists, but production host, signing fingerprint, and Digital Asset Links are still TODO.
- Store metadata state: store listing draft, public screenshots, policy scaffolds, and data safety draft exist.
- Production readiness state: expected to fail until hosted HTTPS URLs, TWA placeholders, closed-test UI, SDK/economy authority, and native packaging are resolved.

## Track Strategy

1. Internal test smoke
   - Use the smallest group first to verify install, launch, portrait lock, sound unlock, offline cache, and policy links.
   - Do not treat internal testing as product validation; it is only a packaging and crash check.
2. Closed test
   - Minimum target: 12 opted-in testers active for at least 14 days if the Play Console account is subject to the personal-account production access requirement.
   - Practical target: recruit 16-20 testers so drop-off does not break the 12-tester floor.
   - Use the four-perspective cohorts below so feedback covers fun, learning, stream readability, and viewer clarity.
3. Production access preparation
   - Keep a record of test dates, build version, tester count, known issues, feedback themes, and fixes.
   - Prepare answers about who tested, what changed, why the app is ready, and how policies/data safety are handled.

## Tester Cohorts

| Cohort | Minimum | What to learn | Main scenario |
| --- | ---: | --- | --- |
| Player | 5 | First-run fun, difficulty, replay reason, stamina friction, daily gift feel | Complete 3 normal runs, claim the daily gift, and try one no-reward practice run. |
| Educator / Family | 3 | Whether word notes and local culture hooks are understandable | Open deck guide, read kana breakdown, play one run, explain one card aloud. |
| Streamer | 3 | Whether sound, word-call, and result recap are easy to read while showing the game | Play one run, watch the result flow, run sound test. |
| Viewer / Accessibility | 3 | Whether watching or large-text/high-contrast play is readable | Watch a run or play with high contrast, large text, and panel numbers enabled. |

Recommended total: 16-20 testers. Ask each tester to pick a primary cohort and one secondary note.

## 14-Day Test Script

| Day | Tester action | Evidence to collect |
| --- | --- | --- |
| 0 | Install, launch, open policies, run sound test | Install success, policy link result, sound state |
| 1 | First normal run and result flow | Score, best word, replay/top/deck button clarity |
| 2 | Deck screen and word guide check | Confusing words, missing local context, readable kana |
| 3 | Daily gift, stamina, and no-reward practice check | Whether the free gift feels welcome and empty stamina feels fair or annoying |
| 4 | Viewer watch check | Word-call readability, result recap clarity, no extra feedback/share clutter |
| 5 | Pack screen probability and reward reveal check | Whether pack odds and test labels are understood |
| 6 | Accessibility check | Large text, high contrast, panel number marks |
| 7 | Midpoint issue triage | Top 3 friction points |
| 8 | New build if fixes are ready | Regression notes |
| 9 | Share text/image check | Share sheet behavior, screenshot quality |
| 10 | Short session check | Can the tester enjoy a 60-second session while busy? |
| 11 | Family/education prompt check | Whether learning hooks feel natural |
| 12 | Retention check | Why would the tester return tomorrow? |
| 13 | Final run and tester report copy | Final report text, latest score, known bugs |
| 14 | Production readiness survey | Keep/stop decision, required fixes before wider release |

## Feedback Questions

- Player: What made you want one more run? What stopped you?
- Educator: Did any word note feel useful, confusing, or too thin?
- Streamer: Could viewers read the completed word and understand the goal?
- Viewer: Which screen was hardest to follow without touching the game?
- Release: Did anything look like real money, real ads, or data collection in a misleading way?

## Required Before Starting Closed Test

- Android build generated from resolved TWA settings.
- `/.well-known/assetlinks.json` published on the final HTTPS host.
- Hosted privacy policy, terms, and commercial transactions URLs replacing local `../homepage/` links.
- Data safety draft reviewed against the actual build.
- Public preview screenshots regenerated after closed-test-only UI is removed or clearly labeled for test builds.
- `tools/release-gate.cjs` passing.
- `tools/check-production-readiness.cjs` reviewed; remaining blockers must be intentional for closed test or resolved before production submission.

## Stop Conditions

- Crash on launch or resume.
- Horizontal overflow or unreadable core UI on 390px width.
- Sound or post-run navigation causing browser/app errors.
- Policy links missing or pointing to local file paths in a distributed build.
- Test grant, test ad, or tester report UI appearing in public-review surfaces.
- Testers misunderstand test stone/stamina recovery as real purchases or real rewarded ads.

## Production Access Notes To Preserve

- Number of opted-in testers and days active.
- Build version tested.
- Build metadata source: `docs/BUILD_METADATA.md`; current closed-test build id is `0.1.0-closed-test.1`.
- Main feedback themes by four-perspective cohort.
- Fixes shipped during the test.
- Remaining known issues and whether they block production.
- Privacy/data safety decisions and any SDKs included in the tested build.
