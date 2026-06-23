# ぐんもじぱずる Sound QA

Last updated: 2026-06-12

## Current Sound Shape

- The prototype uses generated Web Audio tones from `scripts/game.js`; it does not ship third-party audio files.
- Sound is enabled by default and can be turned off in settings.
- Vibration is controlled separately and uses `navigator.vibrate` when the device supports it.
- The settings screen includes a sound test button so mobile testers can confirm Web Audio unlock before a run or stream.
- Recent sound cue ids are kept only in memory as `state.soundEvents` for smoke tests and closed-test diagnosis.

## Cue Map

| Cue | Trigger | Purpose |
| --- | --- | --- |
| `tap` | Settings/toggle confirmation | Quiet UI confirmation. |
| `open` | Reserved for menu/opening surfaces | Light positive transition. |
| `start` | Run start | Clear start signal for players and viewers. |
| `swap` | Panel slide/swap | Confirms the main verb without covering the playfield. |
| `refresh` | Board refresh | Distinct reset signal. |
| `clear` | Short word clear | Small reward feedback. |
| `clear-big` | Long word clear and sound test | Stronger reward feedback for stream moments. |
| `special` | Jomo crane bonus event | Short musical flourish that makes the special event feel different without shipping external music files. |
| `skill` | Push-card skill activation | Manual power moment. |
| `coin` | Pack stone/stamina reward | Economy reward confirmation. |
| `pack` | Pack opening | Opening flourish. |
| `equip` | Deck/card equip or color change | Deck-building confirmation. |
| `finish` | Run finish | End-of-run transition. |
| `error` | Invalid action or blocked action | Short negative feedback. |

## Four-Perspective QA Notes

- Player: the slide, clear, refresh, and error cues should make the board understandable without looking away from the panels.
- Educator: sound must be optional and should not be required to understand readings, learning notes, or results.
- Streamer: clear-big, skill, special, pack, and finish cues should help create readable moments without relying on copyrighted music or borrowed sound effects.
- Viewer: word-call overlays remain the primary readable feedback; sound is supportive and must not replace on-screen text.

## Mobile QA Checklist

1. Open settings and tap `音を確認`; the toast should say that an effect played.
2. Turn sound off, tap `音を確認`, and confirm the app shows the OFF state instead of silently failing.
3. Start a normal run and confirm `start` is logged in `state.soundEvents`.
4. Slide a panel and confirm `swap` is logged.
5. Clear a word and confirm either `clear` or `clear-big` is logged.
6. Trigger refresh and confirm `refresh` is logged.
7. Confirm no horizontal overflow appears on the settings screen at 390px width.

## Release Notes

- Keep all generated tones original. Do not import official jingles, existing game effects, mascot voices, music loops, or third-party sample packs without a license memo.
- If real audio assets are added later, add their source, license, prompt/source memo, and file names to this document and the rights checklist.
- If analytics starts collecting sound settings or cue events outside the device, update the privacy policy and data safety form before release.
