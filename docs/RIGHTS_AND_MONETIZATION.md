# 権利・広告・課金ガードレール

## 素材方針

- 既存ゲームの名称、UI、キャラ、演出、素材を流用しない。
- 公式キャラ、自治体ロゴ、店舗ロゴ、商品ロゴ、写真、既存地図、第三者IPをカード絵に混ぜない。
- 群馬らしさは、一般的な地名、自然、温泉、食文化、風、山、祭りなどの抽象表現で作る。
- 生成画像を使う場合、プロンプト、生成日、権利メモ、使用範囲を記録する。
- `rightsStatus`が`prototype-safe`以外のカードはMVPに入れない。

## カード名の扱い

- 地名や一般名詞を中心にする。
- 実在の店舗名、商品名、イベント名、団体名は原則入れない。
- 似せたキャラ、似せたロゴ、特徴的すぎる外観は避ける。
- 同じ名称の別カードを作る場合も、デザインとスキルは独自にする。

## パックと課金

- 購入前に排出率を表示する。
- 1パックはカード1枚、または選択チケット1枚。
- 1パック開封ごとに引換だるまを1個付与し、50個で同パック内の未所持カード1枚を選べる救済を入れる。費用、獲得量、対象カードは購入前に分かる表示にする。
- 全カードは無料入手可能にする。
- 有料購入は時間短縮として扱う。
- 有料限定のスコア有利カードは禁止。
- コンプガチャ型の報酬は禁止。
- デイリーストリーク報酬は無料の少量アイテムに限定し、有料限定カードやランキング有利報酬に直結させない。
- デイリースコア目標報酬は無料の少量アイテムに限定し、有料回復や有料カード購入を前提にしない。
- 週替わりチャレンジ報酬は無料の少量アイテムに限定し、有料限定カードや課金スタミナを前提にした達成条件にしない。
- SDK未接続の閉鎖テストでは、石付与ボタンに`CLOSED TEST`や`TEST GRANT`を明示し、本番購入が発生するように見せない。

## 広告

- 全年齢向けを想定し、広告カテゴリと広告SDKを制限する。
- 広告視聴報酬は、課金と同じゲーム内アイテムに変換する。
- 広告10回分で1パックを目安にする。
- スタミナ回復広告は1視聴で+1回復までにし、満タン時は再生させない。
- 広告視聴の失敗、途中離脱、通信エラー時の扱いを明記する。
- SDK未接続の広告テストは`TEST AD`として表示し、実広告視聴済みの報酬に見せない。

## テストログとプライバシー

- 閉鎖テストの操作ログは、起動、画面遷移、プレイ、パック、スタミナ、設定変更などの非PIIイベントに限定する。
- イベントログは端末内に最大24件だけ保持し、テスターが設定画面からレポートをコピーした時だけ共有される。
- リザルトのクイック感想は、短い選択肢、スコア、ランク、練習かどうかだけを保存し、自由入力や個人情報を含めない。
- 本番分析やクラッシュ収集を導入する場合は、プライバシーポリシー、同意表示、送信先、保持期間を別途明記する。
- ストア申告前に `docs/DATA_SAFETY_DRAFT.md` と `tools/check-data-safety.cjs` を確認し、localStorage、非PIIログ、広告/課金/分析/クラッシュSDKの有無を最新状態にする。

## ストア前チェック

- Apple/Google Playの最新ガイドラインで、ランダムアイテム、広告、子ども向け設定を再確認する。
- 課金画面、パック画面、排出率画面をスクリーンショットで保存する。
- ユーザーが課金前に内容、価格、確率を理解できる表示にする。
## StoreKit / Play Billing Gate

- App Store submission handoff: `docs/APP_STORE_SUBMISSION_PACK.md`.
- Play Console submission handoff: `docs/PLAY_CONSOLE_SUBMISSION_PACK.md`.
- The current `G` shop is a closed-test mock and must not be submitted as paid digital goods.
- iOS paid `G` must use StoreKit consumable products or the purchase UI must be disabled.
- Android paid `G` must use Google Play Billing consumable products or the purchase UI must be disabled.
- Random-item/card-pack probability disclosure and exchange-daruma terms must remain visible before spending paid or free `G`.
