# カード素材プロンプトログ

カード画像を生成・採用したら、このファイルに追記します。公式キャラ、公式ロゴ、写真、既存地図、第三者IPは使いません。

## 共通ネガティブ指定

```text
no official mascot, no government logo, no store logo, no product logo, no map, no photo-real landmark copy, no third-party IP, no anime character that resembles an existing character, no readable brand text
```

## 共通スタイル

```text
original mobile puzzle game card frame, cheerful local festival mood, clean vector-like painted illustration, rounded square card art, bold readable silhouette, colorful but not neon, no text in image
```

## basic-gunma-ken

- 表示名: ぐんまけん
- 権利メモ: 一般的な県名表現。公式ロゴ、地図形状、公式キャラは使わない。
- プロンプト:

```text
original fantasy festival card art inspired by a broad Japanese inland prefecture mood, red and gold paper lanterns, soft mountains in the distance, playful kana puzzle energy, no text in image
```

## basic-daruma

- 表示名: だるま
- 権利メモ: 一般的な縁起物モチーフ。特定店舗や既存商品の意匠に寄せない。
- プロンプト:

```text
original lucky round daruma-inspired festival ornament, warm coral and cream colors, abstract face-like pattern without copying a real product, celebratory paper confetti, no text in image
```

## basic-akagi-san

- 表示名: あかぎさん
- 権利メモ: 一般的な山名表現。写真や既存観光素材を参照しない。
- プロンプト:

```text
original green mountain spirit scenery, layered gentle peaks, fresh wind ribbons, sunrise festival atmosphere, mobile puzzle game card art, no text in image
```

## 2026-06-10 採用素材

- 生成モード: built-in image generation
- 保存先:
  - `assets/generated/stage-festival-bg.png`
  - `assets/generated/card-basic-gunma-ken.png`
  - `assets/generated/card-basic-daruma.png`
  - `assets/generated/card-basic-akagi-san.png`
- 共通指定:

```text
original mobile puzzle game art, cheerful Japanese local festival mood, clean painted illustration, bold readable silhouette, colorful but not neon, no text in image, no official mascot, no logo, no map, no photo copy, no third-party IP
```

- ステージ背景プロンプト:

```text
original vertical mobile puzzle stage background, warm Japanese festival paper lantern glow, abstract mountain breeze ribbons, soft teal sky and coral festival floor, playful but uncluttered, empty center area for puzzle grid, no text
```

## 2026-06-12 第1弾「ぐんまのし」採用素材

- 生成モード: built-in image generation
- 保存先:
  - `assets/generated/card-city-maebashi.png`
  - `assets/generated/card-city-takasaki.png`
  - `assets/generated/card-city-kiryu.png`
  - `assets/generated/card-city-isesaki.png`
  - `assets/generated/card-city-ota.png`
  - `assets/generated/card-city-numata.png`
  - `assets/generated/card-city-tatebayashi.png`
  - `assets/generated/card-city-shibukawa.png`
  - `assets/generated/card-city-fujioka.png`
  - `assets/generated/card-city-tomioka.png`
  - `assets/generated/card-city-annaka.png`
  - `assets/generated/card-city-midori.png`
- 権利メモ: 各市の一般的な観光・文化・自然モチーフを抽象化したオリジナルカード背景。公式キャラ、公式ロゴ、既存地図、写真模写、実在看板、企業ロゴ、第三者IPは入れない。たかさき以外はだるま人形を入れない指定で特徴の混線を避けた。
- 共通指定:

```text
Use case: stylized-concept. Asset type: 3:4 mobile puzzle collectible card art for a Japanese local word puzzle game. Cheerful Japanese local festival pop style, clean painted illustration, bold readable silhouette, colorful but not neon, no text in image. No official mascot, no logo, no map, no photo copy, no real signage, no third-party IP, no recognizable copyrighted character, no watermark. Avoid exact reproduction of buildings, products, trains, bridges, streets, gardens, or photos. Vertical composition with clear central subject, suitable as a card background behind UI text.
```

- 市別モチーフ:

```text
まえばし: broad river, gentle Akagi mountain silhouette, rose garden petals, warm festival lantern glow, civic city-center feeling.
たかさき: round red daruma-inspired good-luck shapes, music-note-like festival ribbons, city lights, warm lantern glow.
きりゅう: woven textile threads, geometric fabric patterns, sawtooth-roof workshop silhouettes, soft mountain backdrop, lantern glow.
いせさき: vivid Meisen-style textile patterns, festival lanterns, flowing silk ribbons, bright local street festival mood.
おおた: hilltop castle ruin silhouette, golden industrial light, clean mechanical rhythm shapes, festival lanterns.
ぬまた: stepped river terraces, apple orchards, generic castle-town stone wall silhouette, cool mountain air, lantern glow.
たてばやし: bright azalea blossoms, calm pond water, lowland festival lanterns, breezy eastern Gunma town mood.
しぶかわ: hot spring steam, stone steps climbing through a town, mountain evening glow, warm lanterns.
ふじおか: winter cherry blossoms on rolling hills, soft purple flower ribbons, warm lanterns, calm hillside festival mood.
とみおか: silk threads, soft cocoons, generic red-brick silk mill atmosphere, western Gunma hills, warm lantern glow.
あんなか: generic red-brick arch bridge, mountain pass, old railway travel mood, autumn leaves, warm lanterns.
みどり: green mountain valley, generic small scenic train without logo, clear river, spring leaves, warm festival lanterns.
```

- 検証メモ: 生成後、だるまが混入した `ぬまた` と `とみおか` は「no daruma dolls / no round doll faces」を追加して差し替えた。採用PNGはゲーム用に3:4比率へクロップし、768x1024へ軽量化した。

## 2026-06-12 logo-style refresh

- Generation mode: built-in image generation.
- Saved files:
  - `assets/generated/stage-festival-bg.png`
  - `assets/generated/card-basic-gunma-ken.png`
  - `assets/generated/card-basic-daruma.png`
  - `assets/generated/card-basic-akagi-san.png`
  - `assets/generated/card-city-maebashi.png`
  - `assets/generated/card-city-takasaki.png`
  - `assets/generated/card-city-kiryu.png`
  - `assets/generated/card-city-isesaki.png`
  - `assets/generated/card-city-ota.png`
  - `assets/generated/card-city-numata.png`
  - `assets/generated/card-city-tatebayashi.png`
  - `assets/generated/card-city-shibukawa.png`
  - `assets/generated/card-city-fujioka.png`
  - `assets/generated/card-city-tomioka.png`
  - `assets/generated/card-city-annaka.png`
  - `assets/generated/card-city-midori.png`
  - `assets/generated/card-city-contact-sheet.png`
- Direction: replace the previous festival-lantern mood with the main logo's glossy world: kana marbles, thick white sticker outlines, rounded teal mountains, onsen steam, shiny G medals, cream paper, coral/deep-blue/teal/pink/gold palette.
- Negative constraints: no festival lanterns, no stalls, no fireworks, no crowd, no official mascot, no government logo, no store logo, no company logo, no product logo, no map, no photo-real landmark copy, no third-party IP, no watermark.
- Background prompt summary:

```text
Polished vertical mobile puzzle background matching glossy kana marble logo style; thick white sticker outlines, shiny gold G-medal accents, soft teal mountains, small onsen steam, rounded toy-like shapes, bright cream background, coral red, deep blue, teal, pink, and gold; no hanging lanterns, stalls, fireworks, crowd, text, or watermark; large clear playable center.
```

- Card prompt summary:

```text
Vertical collectible card artwork for Gunmoji Puzzle matching the glossy logo style; city or basic Gunma motif as rounded toy stickers with thick white outlines, polished gold trim, cream background, shiny gold G medal, and glossy kana marbles; centered clean silhouette; no festival lanterns, stalls, fireworks, crowd, readable brand text, or watermark.
```

- Processing note: city cards were cropped/resized to `768x1024`; basic cards remain `1024x1536`; stage background was resized to `853x1844`; the city contact sheet was regenerated from the refreshed city PNGs.
