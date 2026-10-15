# KINOKA（木乃家）Web

Figma（`ikrnT6SejNyvcWO2tmXXWv`）を正として実装した静的サイトです。現在は **TOP**、**施工事例一覧**、**施工事例詳細（4件）**、**お問い合わせ**、**木乃家について**、**事業内容**、**家づくりの考え方**、**お知らせ（一覧・記事）**、**プライバシーポリシー** です。

KINOKA（木乃家）は架空の工務店を題材にしたポートフォリオ作品で、掲載している会社情報・事例・スタッフはすべて架空です。

## 使い方

```bash
npm install
npm run dev      # http://localhost:5173/ 、/works/ 、/works/<slug>/ 、/contact/ 、/about/ 、/service/ 、/concept/ 、/news/ 、/news/<slug>/ 、/privacy/
npm run build    # dist/ に出力
npm run preview  # dist/ を http://localhost:4173/ で配信（先に npm run build が必要）
npm run images   # 原寸PNG → public/images の WebP を再生成（ImageMagick が必要）
npm run ogp      # OGP画像 public/ogp.jpg を再生成（ImageMagick と Playwright〈Chromium〉が必要）
```

### 動作環境（Node.js）

- **Node.js 20.19 以上**を使ってください（LTS の 22 系を推奨。動作確認は Node 22.22.0／npm 10.9.4）
- 根拠は `package-lock.json` に固定されている依存の `engines` です。`sass` 1.105.1 が `>=20.19.0`、`vite` 5.4.21 が `^18.0.0 || >=20.0.0` を求めているため、20.19 が下限になります（Node 18 では sass の条件を満たしません）
- `package.json` の `engines` や `.nvmrc` は置いていないので、バージョンは手元で `node -v` を確認してください

### `npm run preview`

`vite preview` で、ビルド済みの `dist/` をローカルで配信します。公開するファイルそのものを、静的ホストに近い動きで確認するためのコマンドです。

- 中身は `dist/` なので、ソースを変えたら `npm run build` をし直してから開きます（`npm run dev` と違い、変更は自動で反映されません）
- URL は `http://localhost:4173/`。`--host` を付けない限り、同じPCからしか開けません（「npm audit と開発用サーバー」を参照）
- 存在しないURLは 404 ページをステータス 404 で、末尾スラッシュなしのURL（`/about`）は `/about/` へ 301 で返します（「404」「末尾スラッシュ」を参照）
- OGP の絶対URLを含めて確かめるときは、`SITE_URL=… npm run build` のあとに `npm run preview` を実行し、HTML の `og:url` などを確認します

### `npm run ogp`

`scripts/build-ogp.mjs` を実行し、`scripts/ogp/ogp.html` をテンプレートに `public/ogp.jpg`（1200×630）を書き出します。ロゴや文言、写真を変えたときだけ使います。ビルド（`npm run build`）では実行されず、書き出した `public/ogp.jpg` をコミットして使います。

```bash
npm run ogp                                  # 原寸写真のフォルダを省略した場合（下記）
npm run ogp -- /path/to/photos/original      # 原寸写真のフォルダを指定（P01.png を使います）
NODE_PATH=$(npm root -g) npm run ogp         # Playwright をグローバルに入れている場合
```

- 必要なもの：ImageMagick の `convert`（`npm run images` と同じ色調補正をかけます）、Playwright と Chromium、Google Fonts を読み込むためのネットワーク接続
- Playwright はこのプロジェクトの依存に入れていません。ローカルかグローバルにインストールしたものを使います
- 写真フォルダを省略すると、制作環境の共有フォルダ（`/mnt/project-files/kinoka/photos/original`）を読みます。ほかの環境では、`P01.png` のあるフォルダを引数で渡してください（`npm run images` も同じ）

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

TOP の MV スライダーは `<!-- @works-hero media -->`（写真）と `<!-- @works-hero slider -->`（事例名・エリア・リンク、前後ボタン・ページネーション）で、`works.json` の先頭から最大4件を生成します（`{"slugs":[…]}` で事例と順番を指定可）。写真は事例の `hero`（PC用の横長写真＋SP用の切り抜き）があればそれを、なければカード写真を中央で切り抜いて使います。1件のときは操作UIを出さず、カルーセル・スライドとしてのARIA属性も付けません。自動再生はしません（処理は `scripts/works-hero.js` と `src/js/main.js` の `initMvSlider()`）。

## お知らせ（News）の更新

記事は `src/data/news.json` に1件足すだけで、一覧・TOPの最新3件・記事ページ（`/news/<slug>/`）・前後の記事リンクに反映されます。

- `slug`：URLになる英小文字・数字・ハイフン。重複や不正な値はビルドエラーにしています
- `date`：`YYYY-MM-DD`。新しい順に並びます
- `category`：`news-categories.json` のキー
- `thumbnail`：`{"name","large","alt"}`（3:2 の WebP。`npm run images` の News ブロックで書き出し）。なければ `null`
- `body`：本文の HTML（段落・見出し `h2`/`h3`・リスト・表・リンク）を配列で。CMS の本文と同じ扱いで、そのまま出力します
- `published`：`false` の記事は一覧・TOP・記事ページのどれにも出ません

TOP は `<!-- @news {"limit":3} -->`、一覧は `<!-- @news-list -->` / `<!-- @news-filter -->` / `<!-- @news-count -->` で生成します。記事ページはファイルを持たず、`vite.config.js` がテンプレートから生成します（dev・preview では存在しない記事URLに 404 ページを返します）。

### 公開前にイベント日付を確認する

お知らせの記事は、閲覧する日付に合わせて自動で切り替わりません。開催日が過ぎたイベントも「開催します」「受付中」のまま表示されるので、公開する前（と、公開を続けている間）に日付を確認します。

1. 公開中のイベント記事を一覧にします

   ```bash
   node -e "for (const p of require('./src/data/news.json')) if (p.category === 'event' && p.published) console.log(p.date, p.slug, p.title)"
   ```

2. 各記事の本文にある「開催概要」の日時・期間を、公開日（閲覧される時期）と比べます。2026年10月15日時点で開催前の記事は次の2件です

   | 記事（slug） | 開催日・期間 |
   |---|---|
   | `open-house-azumino-2026-10`（完成見学会） | 2026年10月24日（土）・25日（日） |
   | `autumn-consultation-2026`（秋の家づくり相談会） | 2026年9月5日（土）〜11月29日（日）の土曜・日曜 |

3. 開催日が過ぎていたら、文言を過去形にします。終了済みの `owner-house-visit-2026-06`（OB様宅見学会）と同じ書き方にそろえます
   - `excerpt`：「〜を開催しました（終了しました）。」
   - `body` の冒頭に `<p><strong>この見学会は終了しました。</strong>…</p>` を置き、本文・見学時のお願いを過去形にする
   - 開催概要の「ご予約」欄や、予約フォームへのリンク（`/contact/?type=visit`、`?type=consultation`）を、終了後の案内に合わせて直す
   - 日時・会場などの事実は変えない。`title` と `date` もそのままにします（URL と並び順が変わらないように）
4. あわせて `published: false` の記事（年末年始休業のお知らせ、`date` は 2026-12-01）を、公開時期に合わせて `true` にするか確認します
5. `npm run build` し直し、TOP の最新3件・一覧・記事ページで表示を確認します

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

  `og:image` は `public/ogp.jpg`（1200×630。MVの外観写真 P01 の中央に、ロゴと「架空の工務店を題材にしたWebサイト制作のポートフォリオ作品」をまとめたもの。中央 630×630 に文字を収めているので、正方形に切り抜かれても欠けません）です。404 ページには `og:url` を付けません
- OGP画像は `scripts/ogp/ogp.html` をテンプレートに `npm run ogp` で書き出します（ImageMagick と Playwright〈Chromium〉が必要。Playwright をグローバルに入れている場合は `NODE_PATH=$(npm root -g) npm run ogp`）
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

### 末尾スラッシュ

このサイトのURLは、**末尾スラッシュ付き（`/about/`）を正**としています。

- ビルドは各ページを `index.html` 入りのフォルダとして出力します（`dist/about/index.html` → `/about/`）。404 ページ（`/404.html`）を除き、`.html` で終わるページURLはありません
- サイト内リンク・パンくず・`og:url` は、すべて末尾スラッシュ付きで書いています（例 `SITE_URL=https://（公開先のURL） npm run build` で `og:url` は `https://（公開先のURL）/about/`）
- `SITE_URL` の末尾のスラッシュは自動で取り除くので、`https://（公開先のURL）` と `https://（公開先のURL）/` のどちらで指定しても二重スラッシュにはなりません
- `npm run dev` と `npm run preview` では、スラッシュなし（`/about`、`/news/<slug>`）はクエリを保ったまま `/about/` へ 301 で移動します（`/works?category=…` → `/works/?category=…`）。`/about/index.html` も同じページを返します
- **本番での扱いはホスティング先の設定次第**です。ソース側にはリダイレクトの設定ファイルを置いていません。公開したら、スラッシュなしの `/about` を開いて、`/about/` へ移動するか（または同じページが表示されるか）、404 にならないかを確認してください。nginx では `try_files $uri $uri/ =404;` のように、フォルダの `index.html` を探す設定が必要です
- 「URLの末尾スラッシュを取り除く」設定（ホスティングの trailing slash 無効化など）は使わないでください。ページの実体がフォルダの `index.html` なので、リダイレクトが往復したり、404 になったりするおそれがあります

### 公開URL（`SITE_URL`）の指定

公開URLはまだ決まっていません。リポジトリのどこにも公開URLは書かず、ビルドのときに環境変数 `SITE_URL` で渡します。

```bash
SITE_URL=https://（公開先のURL） npm run build
```

- 指定すると、全ページに `og:url`（404 を除く）・`og:image`（`<SITE_URL>/ogp.jpg`、1200×630）・`twitter:card` が出力されます。指定しないと、この3つは出力されません（ほかの OGP と noindex は出力されます）
- 値はプロトコル付きのオリジン（例の形：`https://` から始まり、パスを含まない）にしてください。サイトはルート（`/`）に置く前提のため、サブディレクトリを含む URL には対応していません
- ホスティング先のビルド設定で実行する場合は、そのサービスの環境変数の設定画面で `SITE_URL` を登録します
- 指定できたかは、`grep -h 'og:url' dist/index.html dist/about/index.html` で確認できます

### npm audit と開発用サーバー

`npm audit` は 2026年10月15日時点で次の2件を報告します（high 1、moderate 1）。どちらも開発用の依存（`devDependencies`）です。

| パッケージ | 経路 | 内容 | 影響する場面 |
|---|---|---|---|
| esbuild 0.21.5（moderate） | vite 5.4.21 → esbuild | 開発サーバーに、他サイトからリクエストを送って応答を読める（GHSA-67mh-4wv8-2f99） | `npm run dev` の開発サーバー |
| vite 5.4.21（high） | 直接依存 | optimized deps の `.map` のパストラバーサル（GHSA-4w7w-66w2-5vf9）、Windows での `server.fs.deny` 回避（GHSA-fx2h-pf6j-xcff。high はこれで、Windows だけが対象）、launch-editor の Windows UNC パス（GHSA-v6wh-96g9-6wx3） | `npm run dev`／`npm run preview` のサーバー |

- **公開サイトへの影響はありません**。公開するのは `dist/` の静的ファイルで、vite と esbuild は含まれません。公開のブロッカーではありません
- リスクがあるのは、開発中に dev／preview サーバーを動かしている間だけです。それまでは次の運用で扱います
  - `npm run dev`・`npm run preview` は `--host` を付けずに動かす（LAN に公開しない）
  - サーバーを動かしている間、同じPCのブラウザで不審なサイトを開かない
  - 使い終わったらサーバーを止める
- **`npm audit fix --force` は実行しないでください**。vite 8 へのメジャー更新になります
- 解消する候補は vite 6.4.4 です（5→6 のメジャー更新）。QA では作業用コピーで audit 0件・出力 HTML がアセットのハッシュ以外同一・dev／preview の 404 と 301 も同じ、を確認済みですが、リポジトリには適用せず判断待ちにしています。適用するときは `npm install -D vite@^6.4.4` → `npm run build` と `dist/` の差分確認 → dev／preview で 404・301・include を確認、の順に進めます

### 公開手順

1. `npm install` → `npm run build`（OGP画像を使うなら `SITE_URL=… npm run build`。「公開URL（`SITE_URL`）の指定」を参照）
2. `dist/` の中身をそのまま公開先のルートに置きます（`/works/`、`/news/<slug>/` などは `index.html` 入りのフォルダとして出力済み）。サイトはルート（`/`）に置く前提で、サブディレクトリに置く場合は `vite.config.js` の `base` とサイト内リンクの調整が必要です
3. 公開前の確認
   - 全ページの `<head>` に `noindex` があること：`grep -L 'content="noindex"' $(find dist -name '*.html')` が何も出さない
   - `/robots.txt` が `Disallow` していないこと
   - 存在しないURL（例 `/foo/`）が 404 ページをステータス 404 で返すこと
   - `/favicon.ico`、`/ogp.jpg`（`SITE_URL` 指定時）が開けること
   - お問い合わせフォームがデモのまま（送信しない）で、プライバシーポリシーの説明と合っていること
   - スラッシュなしのURL（例 `/about`）が `/about/` へ移動するか、同じページを表示すること（「末尾スラッシュ」を参照）
   - イベント記事の開催日が過ぎていないこと。過ぎていれば過去形にしてからビルドし直す（「公開前にイベント日付を確認する」を参照）
   - `SITE_URL` を指定した場合、`og:url`・`og:image` が公開先のURLになっていること
   - SNS のカードプレビューで OGP の見え方
4. 公開先（ステージングか本番）のURLで、下の「実機確認チェックリスト」を実施します

## 実機確認チェックリスト（iOS Safari・Android Chrome）

まだ実機での確認はしていません（自動テストは 1440／768／390／320px の Chromium で実施済み）。公開先のURLで、次の端末を目安に確認します。

- iPhone の Safari（最新の iOS とひとつ前）、iPhone SE など幅 375px の端末
- Android の Chrome（Pixel など）
- 縦向きを基本に、TOP の MV など一部は横向きも確認

### 共通・表示

- [ ] 全ページで横スクロールが出ない。文字の折り返しが不自然でない（フッターの「（9:00–18:00／水曜定休）」、見出しの改行位置）
- [ ] Google Fonts（Shippori Mincho・Noto Sans JP・Jost）が読み込まれ、読み込み中のちらつきが許容範囲である
- [ ] ピンチで拡大できる（viewport は拡大を禁止していない）
- [ ] Android Chrome の自動ダークモード（ブラウザ側の強制ダーク）が有効でも、写真や文字の色が崩れない
- [ ] ホーム画面に追加したとき、アイコン（`apple-touch-icon.png`・favicon）が表示される

### ヘッダー・SPメニュー

- [ ] ハンバーガーで開閉できる。開いている間は背景がスクロールしない。閉じるとスクロール位置が戻る
- [ ] TOP では、ヘッダーが MV の上で透過し、スクロールすると白背景に切り替わる
- [ ] VoiceOver・TalkBack で、メニューの開閉とリンクが読み上げられる

### TOP・MVスライダー

- [ ] MV の高さが、アドレスバーの伸び縮みでがたつかない（`svh` で指定）。横向きでも写真が切れすぎない
- [ ] 横スワイプでスライドが切り替わり、縦スクロールの邪魔をしない
- [ ] 前後ボタン・ドットのタップ領域が十分で、番号が正しい
- [ ] 縦長写真（2・3枚目）の粗さが、実機で許容範囲か
- [ ] 施工事例・お知らせの横スクロール（スクロールスナップ）とインジケーターが同期する

### SP固定CTA

- [ ] MV を過ぎると下から出て、フッターに達すると隠れる
- [ ] iPhone のホームインジケーターと重ならない（safe-area の余白）。iOS Safari の下部ツールバーの伸び縮みで位置がずれない
- [ ] 2つのボタンが押しやすく、資料請求・ご相談それぞれのフォーム種別に遷移する
- [ ] お問い合わせページでは表示されない

### 施工事例一覧

- [ ] 絞り込みのボトムシートが開閉し、シートの中だけがスクロールする（最大高さ 85svh）。結果の件数が正しい

### お問い合わせフォーム

- [ ] 入力欄をタップしても画面が拡大されない（文字サイズ 16px）
- [ ] キーボードの種類：メールはメール用、電話は電話用、郵便番号は数字のキーボードになる
- [ ] 自動入力：名前・メール・電話・郵便番号・住所が補完される（iOS は連絡先、Android は Google の自動入力）。住所が2行の欄に入る
- [ ] 見学予約の日付欄で、ネイティブの日付ピッカーが開く。時間帯の select とラジオボタンが操作できる
- [ ] 未入力で送信すると、エラーの一覧が表示され、キーボードに隠れずに読める
- [ ] 確認画面から、端末やブラウザの「戻る」で入力画面に戻り、値が残っている
- [ ] 送信（デモ）で完了画面が表示され、通信が発生しない
- [ ] VoiceOver・TalkBack で、ラベル・必須・エラー文が読み上げられる

### リンク・その他

- [ ] 電話番号のリンク（`tel:`）で発信の確認が出る
- [ ] 存在しないURLで 404 ページが表示される（本番のホストで確認）
- [ ] スラッシュなしのURL（`/about`）で `/about/` が表示される（本番のホストで確認）
- [ ] プライバシーポリシーの外部リンク（Google）が開く
