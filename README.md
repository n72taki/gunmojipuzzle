# ぐんもじぱずる

スマホ縦持ち向けの60秒スライド文字パネルパズル試作です。

## Play

Open:

```text
gunmojipuzzle\index.html
```

The prototype is static HTML/CSS/JavaScript and does not require a dev server.

## Included

- 初回ユーザー向けに、チュートリアル完了前は日課/スコア目標を隠して `FIRST PLAY` を主導線にするトップメニュー
- 初回チュートリアル後も初回完走まではミッション/ギフト/今日のことばを隠し、まず遊ぶ判断に集中させるトップメニュー
- 初回完走後は今日のことば/差し入れを解放し、3完走後に日課/スコア目標/週替わりをミッション画面で通常表示するウォームアップ表示

- 初回完走後のミッション画面で、日付と現在デッキから決まる「今日のことば」を表示し、図鑑へ移動できる狙い導線
- 1日1回、5000点到達でGだるま+1のデイリースコア目標
- 週替わりで20プレイ相当のお題を達成するとGだるま+10のやり込みチャレンジ
- 初回完走後の次回ログインで、Gだるま+1を受け取れる「今日の差し入れ」モーダル
- 60秒ラン
- プレイ中の手動PAUSE、ポーズからの途中終了、アプリ非表示/画面遷移時の自動PAUSE
- 1プレイ1本消費、最大5本、10分で1本焼き上がる焼きまんじゅう型スタミナ制
- トップメニュー上部で残り焼きまんじゅうを串風表示し、消費済みは食べたように見せ、0の時は報酬なしの練習プレイに切り替わる
- 焼きまんじゅう0のトップメニューに、焼き上がりまでの時間と報酬なし練習導線を表示
- 閉鎖テスト用であることを明示した広告/Gだるま付与テスト導線と、下部バナー広告枠の配置確認
- 日替わりで3プレイ相当のお題を達成するとGだるま+1のデイリー目標
- 今日/昨日を切り替えられるデイリーランキング。トップ10と自分のスコアを表示し、昨日トップ10ならGだるま+3
- デイリー3日連続達成でGだるま+1のストリークボーナス
- リザルトでスコア、ランク、見どころワード、獲得報酬を短く確認できるサマリー
- リザルト後は `もう1回` / `トップへ` / `デッキ構築` の3導線だけを表示
- トップメニューで前回スコアと見どころワードを思い出せるLAST RUN導線
- トップメニューはLAST RUNとゲーム/デッキ/パック/ミッションの主要ボタンを優先し、今日のことばや進捗カードはミッション画面へ分離するプレイ反応優先の動線
- 大きめ文字、高コントラスト、枠番号表示、演出控えめのアクセシビリティ設定
- 設定画面の効果音テストボタンで、端末や配信前にサウンドON/OFFを確認できる導線
- PWA/ラッパー化に向けたサービスワーカーのオフラインキャッシュ
- 消去時に完成語と得点をトップバー直下の盤面外表示帯へ短く出す、非ブロッキングワードコール演出
- デッキ構築/コレクション画面でカードの読みと地域メモを見返せることばメモ
- デッキカードと色変更チップに `枠1 青` のような番号+色名を表示し、色だけに頼らずパネルを見分ける補助
- デッキ構築/コレクションの実用絞り込みで、ALL/所持/未所持/GGG/GG/Gと文字ALL/3字/4字/5字+から編成候補を探せる導線
- デッキ構築/コレクションのソートで、おすすめ/レア/名前の順にカードを並べ替えられる導線
- ことばメモにかな分解、地域メモ、文字数/スキル/所持状態、直接アクションを出し、開発側の狙いラベルはゲーム内に表示しない整理
- ことば図鑑のアクションボタンから、推し設定、デッキ投入、選択チケット入手、引換だるま交換を直接実行できる導線
- 設定画面からプライバシーポリシー、利用規約、特定商取引法に基づく表記へ移動できるリリース準備用リンク
- 設定画面に閉鎖テスト用のビルドID、チャンネル、バージョンコードを表示
- 閉鎖テスト用に、起動、画面遷移、プレイ、パック、設定変更を非PIIの最近イベントとして端末内に保持
- 四角いかなパネルの6列×7行グリッド
- パネルの上下左右スライド移動
- 操作後の隣接かなパネル自動判定
- デッキ内カード名の文字セット一致で自動消去
- リフレッシュボタンによる盤面全リセット
- 特殊アイテムは現行版では出現なし。主役はことば消去、リフレッシュ、デッキスキル
- 3枚デッキ、推しカード、手動カードスキル
- 和祭りポップ背景と基本3枚の生成カードアート
- ベーシックデッキと第1弾カードパック「ぐんまのし」
- `G/GG/GGG` のGアイコンを星代わりにしたレア度表示
- 販売期間を持つパックデータと、将来のランダムカードプール化を見越したパック設定
- パック排出率、選択チケット、重複凸、同名カード制限のデータ
- パック画面で第1弾12種のカードラインナップを確認し、カードをタップしてことばメモへ移動できる導線
- パック開封時にレア度、カード名、重複凸/選択チケットを見せるリワード演出
- パック開封後に当たったカード詳細、または選択チケットで取れる未所持カード候補へ直接移動できる導線
- パック開封ごとに引換だるまを1個付与し、50個で第1弾の未所持カード1枚を選んで入手できる救済導線
- 第1弾コレクションの所持数、進捗バー、次に狙う未所持カードをパック画面で確認できる表示
- Android TWA包装に向けた `twa-manifest.json`、Digital Asset Linksテンプレート、ハンドオフ検査

## Docs

- `docs/GDD.md`: 現在のゲーム仕様
- `docs/ROADMAP.md`: MVPからストア前までの制作順
- `docs/PLAYTEST_CHECKLIST.md`: テストプレイで見る項目
- `docs/BALANCE_MODEL.md`: 現在の数値と調整方針
- `docs/FOUR_PERSPECTIVE_DEBUG.md`: プレイヤー、教育者、配信者、視聴者目線のデバッグ記録
- `docs/RIGHTS_AND_MONETIZATION.md`: 権利、広告、課金の禁止ライン
- `docs/DATA_SAFETY_DRAFT.md`: ストア申告前のデータ安全性メモ
- `docs/ART_PROMPT_LOG.md`: 画像生成カード素材のプロンプト管理
- `docs/MOBILE_RELEASE_READINESS.md`: スマホアプリ配布前の準備メモとゲート
- `docs/GOOGLE_PLAY_UPLOAD_STATUS.md`: Google Playアップロード準備状況、揃っている素材、未解決ブロッカー
- `docs/ANDROID_TWA_HANDOFF.md`: Android TWA包装に必要なホスト、署名、assetlinks、検査手順
- `docs/CLOSED_TEST_PLAN.md`: Google Play closed test のテスター構成、14日シナリオ、停止条件
- `docs/PLAY_CONSOLE_SUBMISSION_PACK.md`: Play Console入力用のアプリ設定、ストア素材、App content、ターゲット年齢、提出ブロッカー
- `docs/CONTENT_RATING_DRAFT.md`: Play Consoleコンテンツレーティング質問票の下書きと再確認条件
- `docs/STORE_ASSET_QA.md`: ストアスクショの順番、解像度、公開用表示の検査方針
- `docs/STORE_LISTING_DRAFT.md`: ストア掲載文、スクショ順、公開前差し替えメモ
- `docs/BUILD_METADATA.md`: 閉鎖テストで使うバージョン名、バージョンコード、ビルドID、検査手順

## Rule Check

Run:

```text
node gunmojipuzzle\tools\release-gate.cjs
```

For focused local checks:

```text
node gunmojipuzzle\tools\check-rules.cjs
node gunmojipuzzle\tools\check-content.cjs
node gunmojipuzzle\tools\check-data-safety.cjs
node gunmojipuzzle\tools\check-balance.cjs
node gunmojipuzzle\tools\check-ranking-server.cjs
node gunmojipuzzle\tools\simulate-pack.cjs 100000
node gunmojipuzzle\tools\check-offline-cache.cjs
node gunmojipuzzle\tools\release-check.cjs
node gunmojipuzzle\tools\build-public-preview.cjs
node gunmojipuzzle\tools\check-public-preview.cjs
node gunmojipuzzle\tools\smoke-public-preview.cjs
node gunmojipuzzle\tools\check-android-handoff.cjs
node gunmojipuzzle\tools\check-closed-test-plan.cjs
node gunmojipuzzle\tools\check-content-rating.cjs
node gunmojipuzzle\tools\check-play-console-pack.cjs
node gunmojipuzzle\tools\check-app-store-pack.cjs
node gunmojipuzzle\tools\check-build-metadata.cjs
node gunmojipuzzle\tools\check-production-readiness.cjs --expect-blockers
node gunmojipuzzle\tools\smoke-offline-pwa.cjs
node gunmojipuzzle\tools\capture-store-assets.cjs
node gunmojipuzzle\tools\capture-store-assets.cjs --public
node gunmojipuzzle\tools\check-store-assets.cjs
node gunmojipuzzle\tools\generate-feature-graphic.cjs
node gunmojipuzzle\tools\check-promo-assets.cjs
```

The release gate runs syntax checks, icon generation, store asset checks, feature graphic generation, promo asset checks, public-preview checks, hosted-policy public-preview production guard checks, Android TWA handoff checks, data safety checks, closed-test plan checks, Play Console submission pack checks, build metadata checks, release metadata, rules, content, balance, pack-rate simulation, offline cache checks, PWA smoke, and the mobile browser smoke.
The store asset capture command writes closed-test screenshots to `store-assets/screenshots`; add `--public` to write public-review screenshots to `store-assets/public-screenshots` with closed-test labels hidden.
Promo asset QA is tracked in `docs/PROMO_ASSET_QA.md`. The feature graphic generator writes `store-assets/feature-graphic.jpg` at `1024x500`.
The public preview build writes `gunmojipuzzle\dist\public-preview`, removing closed-test grant buttons, tester feedback copy, and placeholder rewarded stamina UI from the static app preview. The public preview smoke opens that generated build at a 390px mobile viewport, checks that the public surfaces boot, and saves `gunmojipuzzle\dist\public-preview\screenshot-public-preview.png`.

For a production-review public preview, pass hosted HTTPS policy URLs before building:

```text
$env:PUBLIC_PRIVACY_URL="https://example.com/gunmojipuzzle/privacy"
$env:PUBLIC_TERMS_URL="https://example.com/gunmojipuzzle/terms"
$env:PUBLIC_COMMERCIAL_URL="https://example.com/gunmojipuzzle/commercial-transactions"
node gunmojipuzzle\tools\build-public-preview.cjs
node gunmojipuzzle\tools\check-public-preview.cjs --expect-hosted-policies
node gunmojipuzzle\tools\check-production-readiness.cjs --root gunmojipuzzle\dist\public-preview --skip-native
```

To run the same hosted-policy guard without overwriting the normal preview folder:

```text
$env:PUBLIC_PREVIEW_OUTPUT_DIR="dist/public-preview-hosted-check"
$env:PUBLIC_PRIVACY_URL="https://example.com/gunmojipuzzle/privacy"
$env:PUBLIC_TERMS_URL="https://example.com/gunmojipuzzle/terms"
$env:PUBLIC_COMMERCIAL_URL="https://example.com/gunmojipuzzle/commercial-transactions"
node gunmojipuzzle\tools\build-public-preview.cjs
node gunmojipuzzle\tools\check-public-preview.cjs --expect-hosted-policies
node gunmojipuzzle\tools\check-production-readiness.cjs --root gunmojipuzzle\dist\public-preview-hosted-check --skip-native
```

Prepare Android TWA release handoff files after final host and signing fingerprint are available:

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

Production submission guard:

```text
node gunmojipuzzle\tools\check-production-readiness.cjs
node gunmojipuzzle\tools\check-production-readiness.cjs --root gunmojipuzzle\dist\public-preview --skip-native
```

This command is expected to fail for the current closed-test prototype. It blocks accidental public submission while local policy links, closed-test economy controls, tester feedback panels, placeholder rewarded recovery, local economy authority, TWA TODO placeholders, Digital Asset Links placeholders, or missing native packaging remain unresolved.

## Browser Smoke

Run:

```text
node gunmojipuzzle\tools\smoke-browser.cjs
```

This opens the prototype at a 390px mobile viewport, starts a run, checks that the canvas is nonblank, and verifies that the page has no horizontal overflow.
It also verifies stamina spend/recovery/rewarded recovery, yaki-manju stamina display, no-reward practice mode at empty stamina, mid-run quit, result home/deck/restart return, daily gift claim, daily mission and streak rewards, warmup home pacing, claimed-goal home state, collection category filters, pack opening reveal, pack exchange daruma, settings sound test, sound cue logging, settings policy links, removed result feedback/share/next-goal surfaces, slide swapping, orderless auto matching, result save, then saves `gunmojipuzzle\screenshot-mobile.png`, `gunmojipuzzle\screenshot-deck-category-filter.png`, `gunmojipuzzle\screenshot-practice-result.png`, `gunmojipuzzle\screenshot-warmup-menu.png`, `gunmojipuzzle\screenshot-normal-home-claimed.png`, `gunmojipuzzle\screenshot-pack-reveal.png`, `gunmojipuzzle\screenshot-result-actions.png`, and `gunmojipuzzle\screenshot-settings-policy-links.png`.

Sound QA is tracked in `docs/SOUND_QA.md`. Run `node gunmojipuzzle\tools\check-sound-cues.cjs` to verify the generated Web Audio cue map, settings sound test, haptic fallback, and smoke-test coverage.
