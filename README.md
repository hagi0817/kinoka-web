# KINOKA（木乃家）Web

Figma（`ikrnT6SejNyvcWO2tmXXWv`）を正として実装した静的サイトです。現在は **TOP**、**施工事例一覧**、**施工事例詳細「光と木がつながる家」**、**お問い合わせ**、**木乃家について** の5ページです。

## 使い方

```bash
npm install
npm run dev      # http://localhost:5173/ 、/works/ 、/works/hikari-to-ki/ 、/contact/ 、/about/
npm run build    # dist/ に出力
npm run images   # 原寸PNG → public/images の WebP を再生成（ImageMagick が必要）
```

## 構成

| パス | 内容 |
|---|---|
| `index.html` | TOP |
| `works/index.html` | 施工事例一覧（絞り込み：PCはインライン、SP/mdはボトムシート） |
| `works/hikari-to-ki/index.html` | 施工事例詳細 |
| `about/index.html` | 木乃家について（メッセージ、大切にしていること、体制と地域、スタッフ `#staff`、会社概要） |
| `contact/index.html` | お問い合わせ（入力 → 確認 → 完了を同一ページで切替。送信機能は未接続のデモ） |
| `src/data/works.json` | 施工事例データ（Works Card と一覧の絞り込みはここから生成） |
| `src/data/taxonomy.json` | カテゴリ・エリア・タイプのキーと表示名 |
| `src/partials/` | 共通パーツ（Header＋SPメニュー / Footer＋SP固定CTA / CTA / Section Heading / Works Card / アイコン / 間取りSVG） |
| `src/scss/foundation/` | トークン（色・余白・流体値）、テキストスタイルの mixin、ベース |
| `src/scss/components/` | 共通コンポーネント |
| `src/scss/pages/` | ページ固有のスタイル |
| `src/js/main.js` | SPメニュー開閉、ヘッダーの透過→Solid、SP固定CTAの表示切替、カルーセルのインジケーター／矢印キー、Works一覧の絞り込み |
| `src/js/contact.js` | お問い合わせフォーム（`?type=` の初期選択、種別ごとの項目、バリデーション、確認・完了の切替） |
| `scripts/build-images.sh` | 写真の書き出し（Figmaの色調フィルタを焼き込み） |

`src/partials/` は `vite.config.js` の小さなプラグインで読み込みます（`<!-- @include header.html {"key":"value"} -->`、パーツ内の `{{key}}` を置換）。

Works Card は `<!-- @works {"slugs":["hikari-to-ki"]} -->` で `src/data/works.json` から生成します（`slugs` を省くと全件、`"filterable":true` で絞り込み用の `data-*` を付与）。一覧の絞り込みチップは `<!-- @works-filter -->` で `taxonomy.json` から生成します。事例を追加するときは `works.json` に1件足すだけで、一覧・TOP・関連事例のカードに使えます。

## ブレークポイント

Responsive Rules に合わせて SP ファーストで記述しています。

- 〜767px：SP（左右 24px）
- 768〜1023px（md）：SP構造のまま左右 40px。Service は2列カード、CTAカードは最大 640px で中央寄せ
- 1024px〜（lg）：PCレイアウト。1024〜1440px は流体、1440px以上はコンテンツ幅 1200px で中央寄せ

未実装ページ（Concept / Service / News / Privacy など）へのリンクは、将来のURL（`/concept/` など）を仮で入れています。

## お問い合わせフォームについて

バックエンドがないため、`/contact/` は **送信機能に接続していないデモ** です。入力・バリデーション・確認画面までは実際に動き、「送信する（デモ）」では入力内容をどこにも送らずに完了画面を表示します（ページ上にもその旨を表示しています）。公開時は `src/js/contact.js` の `data-contact-send` の処理を、フォーム送信サービスや API への送信に置き換えてください。

CTA からは `?type=consultation`（家づくりの相談）/ `document`（資料請求）/ `visit`（見学予約）で遷移し、種別が初期選択されます。それ以外の値は無視します。
