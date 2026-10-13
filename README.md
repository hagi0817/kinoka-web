# KINOKA（木乃家）Web

Figma（`ikrnT6SejNyvcWO2tmXXWv`）を正として実装した静的サイトです。現在は **TOP**、**施工事例一覧**、**施工事例詳細（4件）**、**お問い合わせ**、**木乃家について**、**事業内容**、**家づくりの考え方**、**お知らせ（一覧・記事）** です。

## 使い方

```bash
npm install
npm run dev      # http://localhost:5173/ 、/works/ 、/works/<slug>/ 、/contact/ 、/about/ 、/service/ 、/concept/ 、/news/ 、/news/<slug>/
npm run build    # dist/ に出力
npm run images   # 原寸PNG → public/images の WebP を再生成（ImageMagick が必要）
```

## 構成

| パス | 内容 |
|---|---|
| `index.html` | TOP |
| `works/index.html` | 施工事例一覧（絞り込み：PCはインライン、SP/mdはボトムシート） |
| `works/hikari-to-ki/index.html` | 施工事例詳細「光と木がつながる家」（大きな写真と余白で光を見せる） |
| `works/atsumaru-hiraya/index.html` | 施工事例詳細「家族が集まる平屋」（縦長写真のヒーロー、L字の間取り図、一日の動き） |
| `works/uketsugu-renovation/index.html` | 施工事例詳細「古い家を受け継ぐリノベーション」（残したもの／変えたもの、改修の進め方） |
| `works/machi-bakery/index.html` | 施工事例詳細「街にひらく木のベーカリー」（番号付きの写真で木の仕事を図解） |
| `about/index.html` | 木乃家について（メッセージ、大切にしていること、体制と地域、スタッフ `#staff`、会社概要） |
| `service/index.html` | 事業内容（導入と目次、注文住宅 `#custom`／リノベーション `#renovation`／店舗・事務所 `#shop`、アフターサポート `#support`、相談から完成までの流れ `#flow`、よくあるご質問） |
| `concept/index.html` | 家づくりの考え方（導入と目次、土地 `#local`／素材 `#material`／暮らし `#life` の3章、考え方を形にした事例） |
| `contact/index.html` | お問い合わせ（入力 → 確認 → 完了を同一ページで切替。送信機能は未接続のデモ） |
| `news/index.html` | お知らせ一覧（カテゴリの絞り込み `?category=`） |
| `src/templates/news-article.html` | お知らせ記事のテンプレート（`/news/<slug>/` を公開記事ごとに生成） |
| `404.html` | ページが見つからないとき（存在しない記事URLなど） |
| `src/data/news.json` | お知らせの記事データ（slug・title・date・category・excerpt・thumbnail・body・published） |
| `src/data/news-categories.json` | お知らせのカテゴリ（キーと表示名） |
| `scripts/news.js` | 記事データの読み込み・検証と、一覧／TOP／記事ページに渡す値の組み立て |
| `src/data/works.json` | 施工事例データ（Works Card、一覧の絞り込み、TOP MV のスライドはここから生成） |
| `src/data/taxonomy.json` | カテゴリ・エリア・タイプのキーと表示名 |
| `src/partials/` | 共通パーツ（Header＋SPメニュー / Footer＋SP固定CTA / CTA / Section Heading / Works Card / アイコン / 間取りSVG） |
| `src/scss/foundation/` | トークン（色・余白・流体値）、テキストスタイルの mixin、ベース |
| `src/scss/components/` | 共通コンポーネント |
| `src/scss/pages/` | ページ固有のスタイル |
| `src/js/main.js` | SPメニュー開閉、ヘッダーの透過→Solid、SP固定CTAの表示切替、カルーセルのインジケーター／矢印キー、Works一覧の絞り込み |
| `src/js/contact.js` | お問い合わせフォーム（`?type=` の初期選択、種別ごとの項目、バリデーション、確認・完了の切替） |
| `scripts/build-images.sh` | 写真の書き出し（Figmaの色調フィルタを焼き込み） |

`src/partials/` は `vite.config.js` の小さなプラグインで読み込みます（`<!-- @include header.html {"key":"value"} -->`、パーツ内の `{{key}}` を置換）。

Works Card は `<!-- @works {"slugs":["hikari-to-ki"]} -->` で `src/data/works.json` から生成します（`slugs` を省くと全件、`"filterable":true` で絞り込み用の `data-*` を付与）。一覧の絞り込みチップは `<!-- @works-filter -->` で `taxonomy.json` から生成します。事例を追加するときは `works.json` に1件足すだけで、一覧・TOP・関連事例のカードに使えます。詳細ページを作ったら、`works/<slug>/index.html` を置き、`vite.config.js` のビルド入力に足して、`works.json` の `url` に `/works/<slug>/` を入れます（`url` が `null` のカードは一覧へリンクします）。詳細ページの共通パーツ（Hero・データ表・Story・Gallery・間取り・担当者・CTA・ほかの事例）は `_works-detail.scss` にあり、ページごとの差は配置の modifier（`work-hero--split`、`gallery__item--w3/w6/w12`、`floor-plan--single` など）で出しています。

TOP の MV スライダーは `<!-- @works-hero media -->`（写真）・`<!-- @works-hero captions -->`（事例名・エリア・リンク）・`<!-- @works-hero controls -->`（前後ボタン・ページネーション）で、`works.json` の先頭から最大4件を生成します（`{"slugs":[…]}` で事例と順番を指定可）。写真は事例の `hero`（PC用の横長写真＋SP用の切り抜き）があればそれを、なければカード写真を中央で切り抜いて使います。1件のときは操作UIを出しません。自動再生はしません（処理は `scripts/works-hero.js` と `src/js/main.js` の `initMvSlider()`）。

## お知らせ（News）の更新

記事は `src/data/news.json` に1件足すだけで、一覧・TOPの最新3件・記事ページ（`/news/<slug>/`）・前後の記事リンクに反映されます。

- `slug`：URLになる英小文字・数字・ハイフン。重複や不正な値はビルドエラーにしています
- `date`：`YYYY-MM-DD`。新しい順に並びます
- `category`：`news-categories.json` のキー
- `thumbnail`：`{"name","large","alt"}`（3:2 の WebP。`npm run images` の News ブロックで書き出し）。なければ `null`
- `body`：本文の HTML（段落・見出し `h2`/`h3`・リスト・表・リンク）を配列で。CMS の本文と同じ扱いで、そのまま出力します
- `published`：`false` の記事は一覧・TOP・記事ページのどれにも出ません

TOP は `<!-- @news {"limit":3} -->`、一覧は `<!-- @news-list -->` / `<!-- @news-filter -->` / `<!-- @news-count -->` で生成します。記事ページはファイルを持たず、`vite.config.js` がテンプレートから生成します（dev・preview では存在しない記事URLに 404 ページを返します）。

## ブレークポイント

Responsive Rules に合わせて SP ファーストで記述しています。

- 〜767px：SP（左右 24px）
- 768〜1023px（md）：SP構造のまま左右 40px。Service は2列カード、CTAカードは最大 640px で中央寄せ
- 1024px〜（lg）：PCレイアウト。1024〜1440px は流体、1440px以上はコンテンツ幅 1200px で中央寄せ

未実装ページ（Privacy）へのリンクは、将来のURL（`/privacy/`）を仮で入れています。

## お問い合わせフォームについて

バックエンドがないため、`/contact/` は **送信機能に接続していないデモ** です。入力・バリデーション・確認画面までは実際に動き、「送信する（デモ）」では入力内容をどこにも送らずに完了画面を表示します（ページ上にもその旨を表示しています）。公開時は `src/js/contact.js` の `data-contact-send` の処理を、フォーム送信サービスや API への送信に置き換えてください。

CTA からは `?type=consultation`（家づくりの相談）/ `document`（資料請求）/ `visit`（見学予約）で遷移し、種別が初期選択されます。それ以外の値は無視します。
