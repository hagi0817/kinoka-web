# KINOKA（木乃家）Web

Figma（`ikrnT6SejNyvcWO2tmXXWv`）を正として実装した静的サイトです。現在は **TOP**、**施工事例一覧**、**施工事例詳細（4件）**、**お問い合わせ**、**木乃家について**、**事業内容**、**家づくりの考え方**、**お知らせ（一覧・記事）**、**プライバシーポリシー** です。

KINOKA（木乃家）は架空の工務店を題材にしたポートフォリオ作品で、掲載している会社情報・事例・スタッフはすべて架空です。

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
| `privacy/index.html` | プライバシーポリシー（デモとしての実際の動作：フォームは送信・保存しない、Cookie・解析なし、Google Fonts の利用） |
| `404.html` | ページが見つからないとき（存在しない記事URLなど） |
| `public/` | そのまま `dist/` に出る静的ファイル（`images/`、`favicon.ico`／`favicon.svg`／`apple-touch-icon.png`、OGP画像 `ogp.jpg`、`robots.txt`） |
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


## お問い合わせフォームについて

バックエンドがないため、`/contact/` は **送信機能に接続していないデモ** です。入力・バリデーション・確認画面までは実際に動き、「送信する（デモ）」では入力内容をどこにも送らずに完了画面を表示します（ページ上にもその旨を表示しています）。公開時は `src/js/contact.js` の `data-contact-send` の処理を、フォーム送信サービスや API への送信に置き換えてください。

CTA からは `?type=consultation`（家づくりの相談）/ `document`（資料請求）/ `visit`（見学予約）で遷移し、種別が初期選択されます。それ以外の値は無視します。

## 公開設定（検索エンジン・OGP・404）

ポートフォリオとして共有・閲覧はできるが、架空の会社として検索結果には出さない、という方針です。

### noindex

- 全ページの `<head>` は `src/partials/head.html` から出力しており、ここで `<meta name="robots" content="noindex">` を一括で付けています（404 ページを含む全21ページ）。ページを足すときも `head.html` を読み込めば自動で付きます
- noindex は「検索結果に載せない」指示で、アクセス制限ではありません。URL を知っている人は誰でも開けますし、リンクやSNSでの共有もできます。見せる相手を限定したいときは、ホスティング側のパスワード保護などを使ってください
- `public/robots.txt` はクロールを禁止していません（`Allow: /`）。robots.txt で `Disallow` するとクローラーがページを読めず noindex を認識できないため、noindex の方針と揃えています

### canonical・sitemap

- **canonical は入れていません**。インデックスさせないページに正規URLを示す意味がなく、noindex と canonical の併用は検索エンジンに矛盾した指示になるためです。また公開URLも未確定です
- **sitemap.xml は作っていません**。sitemap は検索エンジンに「登録してほしいURL」を伝えるもので、noindex の方針と逆になるためです。robots.txt にも `Sitemap:` は書いていません

### OGP・favicon

- 各ページの `og:title`／`og:description` は、そのページの `<title>`／`description` と同じ値です（`head.html` で同じパラメータから出力）。`og:type`=website、`og:site_name`、`og:locale` も全ページ共通で付けています
- `og:url`・`og:image`・`twitter:card` は絶対URLが必要なため、**公開URLを指定してビルドしたときだけ**出力します。指定しなければ出力しません（仮のドメインは書きません）

  ```bash
  SITE_URL=https://（公開先のURL） npm run build
  ```

  `og:image` は `public/ogp.jpg`（1200×630。MVの外観写真 P01 にロゴと「架空の工務店を題材にしたWebサイト制作のポートフォリオ作品」の一文を重ねたもの）です。404 ページには `og:url` を付けません
- favicon は `public/favicon.ico`（16／32px）、`favicon.svg`、`apple-touch-icon.png`（180px）。濃色の角丸に「K」の線画です
- noindex でも OGP は読まれます（SNSのカード表示は検索登録とは別の仕組みです）。公開後は各SNSのカードプレビューで見え方を確認してください

### 404

- `404.html` は `dist/404.html` に出力します（noindex 付き）
- `npm run dev` と `npm run preview` は本番の静的ホストに合わせて、存在しないURLに **404 ページをステータス 404 で** 返します。Vite の初期設定（SPA fallback）だと存在しないURLでも TOP が返るため、`vite.config.js` で `appType: 'mpa'` にし、`kinoka-not-found` プラグインで 404 ページを返しています。末尾スラッシュなし（`/about`）は `/about/` へ 301 で移動します
- **本番で 404 ページが出るかはホスティング先の設定次第**です。ソース側で用意しているのは `dist/404.html` だけなので、公開先で次を確認してください
  - Netlify・GitHub Pages・Cloudflare Pages：ルートの `404.html` を自動で使います（追加設定なし）
  - Vercel：静的出力ならルートの `404.html` を使います
  - Apache：`.htaccess` に `ErrorDocument 404 /404.html`
  - nginx：`error_page 404 /404.html;`
  - SPA 用の「すべてのURLを index.html に返す」設定（rewrite／fallback）は**使わないでください**。存在しないURLが TOP として 200 で返ります

### 公開手順

1. `npm install` → `npm run build`（OGP画像を使うなら `SITE_URL=… npm run build`）
2. `dist/` の中身をそのまま公開先のルートに置きます（`/works/`、`/news/<slug>/` などは `index.html` 入りのフォルダとして出力済み）。サイトはルート（`/`）に置く前提で、サブディレクトリに置く場合は `vite.config.js` の `base` とサイト内リンクの調整が必要です
3. 公開前の確認
   - 全ページの `<head>` に `noindex` があること：`grep -L 'content="noindex"' $(find dist -name '*.html')` が何も出さない
   - `/robots.txt` が `Disallow` していないこと
   - 存在しないURL（例 `/foo/`）が 404 ページをステータス 404 で返すこと
   - `/favicon.ico`、`/ogp.jpg`（`SITE_URL` 指定時）が開けること
   - お問い合わせフォームがデモのまま（送信しない）で、プライバシーポリシーの説明と合っていること
   - SNS のカードプレビューで OGP の見え方
