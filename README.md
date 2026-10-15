# KINOKA（木乃家）Web

Figma（`ikrnT6SejNyvcWO2tmXXWv`）を正として実装した静的サイトです。現在は **TOP** と **施工事例詳細「光と木がつながる家」** の2ページのみ。

## 使い方

```bash
npm install
npm run dev      # http://localhost:5173/ と /works/hikari-to-ki/
npm run build    # dist/ に出力
npm run images   # 原寸PNG → public/images の WebP を再生成（ImageMagick が必要）
```

## 構成

| パス | 内容 |
|---|---|
| `index.html` | TOP |
| `works/hikari-to-ki/index.html` | 施工事例詳細 |
| `src/partials/` | 共通パーツ（Header＋SPメニュー / Footer＋SP固定CTA / CTA / Section Heading / Works Card / アイコン / 間取りSVG） |
| `src/scss/foundation/` | トークン（色・余白・流体値）、テキストスタイルの mixin、ベース |
| `src/scss/components/` | 共通コンポーネント |
| `src/scss/pages/` | ページ固有のスタイル |
| `src/js/main.js` | SPメニュー開閉、ヘッダーの透過→Solid、SP固定CTAの表示切替、カルーセルのインジケーター／矢印キー |
| `scripts/build-images.sh` | 写真の書き出し（Figmaの色調フィルタを焼き込み） |

`src/partials/` は `vite.config.js` の小さなプラグインで読み込みます（`<!-- @include header.html {"key":"value"} -->`、パーツ内の `{{key}}` を置換）。

## ブレークポイント

Responsive Rules に合わせて SP ファーストで記述しています。

- 〜767px：SP（左右 24px）
- 768〜1023px（md）：SP構造のまま左右 40px。Service は2列カード、CTAカードは最大 640px で中央寄せ
- 1024px〜（lg）：PCレイアウト。1024〜1440px は流体、1440px以上はコンテンツ幅 1200px で中央寄せ

未実装ページ（About / Works一覧 / Concept / Service / News / Contact など）へのリンクは、将来のURL（`/about/` など）を仮で入れています。
