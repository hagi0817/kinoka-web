# KINOKA（木乃家）Web

Figma（`ikrnT6SejNyvcWO2tmXXWv`）を正として実装した静的サイトです。現在は **TOP**、**施工事例一覧**、**施工事例詳細（4件）**、**お問い合わせ**、**木乃家について**、**事業内容**、**家づくりの考え方**、**お知らせ（一覧・記事）**、**プライバシーポリシー** です。

KINOKA（木乃家）は架空の工務店を題材にしたポートフォリオ作品で、掲載している会社情報・事例・スタッフはすべて架空です。

## 使い方

```bash
npm install
npm run dev      # http://localhost:5173/ 、/works/ 、/works/<slug>/ 、/contact/ 、/about/ 、/service/ 、/concept/ 、/news/ 、/news/<slug>/ 、/privacy/
npm run build    # dist/ に出力
npm run preview  # dist/ を http://localhost:4173/ で配信（先に npm run build が必要）
npm run preview:lan  # dist/ を同じWi-FiのiPhoneからも開けるように配信（実機確認用。「iPhone で実機確認する」を参照）
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
- URL は `http://localhost:4173/`。`--host` を付けない限り、同じPCからしか開けません（「npm audit と開発用サーバー」を参照）。iPhone から開くときだけ `npm run preview:lan` を使います（「iPhone で実機確認する（同じWi-Fi内）」を参照）
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
  - 例外は iPhone での実機確認の `npm run preview:lan` だけです。自宅・職場など信頼できる Wi-Fi で、確認している間だけ動かします（`npm run dev` には `--host` を付けません。「iPhone で実機確認する（同じWi-Fi内）」を参照）
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

## iPhone で実機確認する（同じWi-Fi内）

公開先がまだないので、Mac で `dist/` を配信し、同じ Wi-Fi につないだ iPhone の Safari から開いて確認します。ルーターのポート開放、外部に公開するトンネル（ngrok など）、公開サーバーへのデプロイは使いません。

### dev ではなく preview を使う理由

- `npm run preview:lan` は、公開する `dist/` そのものを配信します。404 をステータス 404 で返し、`/about` を `/about/` へ 301 で移動するので、静的ホストに近い動きを確かめられます
- `npm run dev` はソースをその場で変換して配信するため、公開物とは別物です。また esbuild の指摘（「npm audit と開発用サーバー」）は dev サーバーが対象なので、dev は LAN に出しません
- preview は変更を自動で反映しません。ソースを変えたら `npm run build` からやり直し、iPhone で再読み込みします

### 起動と終了（Mac）

```bash
npm install            # 初回だけ
npm run build          # dist/ を作る（ソースを変えたら毎回）
npm run preview:lan    # = vite preview --host --strictPort
```

- `--host` で、Mac のすべてのネットワークの 4173 番ポートで待ち受けます。`--strictPort` は、4173 番が使用中なら別の番号に逃げずにエラーで止めます（iPhone で開くURLが変わらないように）
- 起動すると、ターミナルに次の2行が出ます。iPhone で開くのは `Network` の方です

  ```
  ➜  Local:   http://localhost:4173/
  ➜  Network: http://192.168.1.23:4173/
  ```

- 終了はターミナルで `Ctrl + C`。確認が終わったら必ず止めます。止まったかは `lsof -nP -iTCP:4173 -sTCP:LISTEN` が何も出さないことで確認できます
- `Error: Port 4173 is already in use` が出たら、前に起動した preview が残っています。そのターミナルで `Ctrl + C` してから起動し直します

### Mac のIPアドレスと、iPhone で開くURL

Mac のIPアドレスは次のどれかで確認します（同じ値になります）。

1. `npm run preview:lan` の `Network:` の行（いちばん簡単）
2. ターミナルで `ipconfig getifaddr en0`（Wi-Fi が `en0` でない Mac では `en1`。何も出なければ `networksetup -listallhardwareports` で Wi-Fi のデバイス名を確認）
3. システム設定 →「Wi-Fi」→ 接続中のネットワークの「詳細…」→「TCP/IP」の「IPアドレス」

URL は `http://<MacのIPアドレス>:4173/<ページのパス>` です。IPアドレスが `192.168.1.23` の場合は次のようになります。

| ページ | iPhone の Safari で開くURL |
|---|---|
| TOP | `http://192.168.1.23:4173/` |
| 施工事例一覧／詳細 | `http://192.168.1.23:4173/works/`、`http://192.168.1.23:4173/works/hikari-to-ki/` |
| お知らせ | `http://192.168.1.23:4173/news/` |
| お問い合わせ | `http://192.168.1.23:4173/contact/` |
| 404 の確認 | `http://192.168.1.23:4173/foo/` |

- `https://` ではなく `http://` です。末尾の `:4173` を忘れないでください
- `Macの名前.local` のようなホスト名では開けません（Vite がIPアドレスと `localhost` 以外のホスト名を `403 Blocked request` で拒否するため）。IPアドレスで開きます。この制限は外さないでください
- IPアドレスは Wi-Fi のつなぎ直しや再起動で変わることがあります。開けなくなったら確認し直します
- iPhone の Safari で「共有」→「ホーム画面に追加」やブックマークにしておくと、URLの入力が楽になります（IPアドレスが変わったら作り直し）

### iPhone 側・Mac 側で必要な操作

- **iPhone**：Mac と同じ Wi-Fi につなぐ（モバイルデータ通信やテザリングではなく、同じネットワーク名）。VPN を使っている場合はオフにする。Google Fonts を読み込むので、その Wi-Fi がインターネットにつながっている必要があります
- **Mac**：
  - 初回の起動時に「"node"へのネットワーク受信接続を許可しますか？」と出たら「許可」を選びます（macOS のファイアウォールがオンの場合）
  - 確認中に Mac がスリープしないようにします（スリープすると iPhone から開けなくなります）
  - VPN を使っている場合は、ローカルネットワークへの通信が遮断される設定のことがあります。確認中はオフにします

### 開けないときの確認

上から順に確かめます。

1. Mac のブラウザで `http://localhost:4173/` が開くか。開かなければ preview が動いていないか、`npm run build` をしていません
2. ターミナルに `Network:` の行が出ているか。出ていなければ `npm run preview`（`--host` なし）で起動しています。`npm run preview:lan` で起動し直します
3. Mac のブラウザで `http://<MacのIPアドレス>:4173/` が開くか。開くのに iPhone だけ開けないなら、ネットワークかファイアウォールの問題です
4. iPhone と Mac が同じ Wi-Fi か。ゲスト用 Wi-Fi や、ルーターの「プライバシーセパレーター」「APアイソレーション」が有効なネットワークでは、端末どうしが通信できません。通常の Wi-Fi につなぎ直してください（ルーターの設定は変えません）
5. macOS のファイアウォール：システム設定 →「ネットワーク」→「ファイアウォール」→「オプション…」で、`node` が「受信接続をブロック」になっていたら「受信接続を許可」に変えます。ファイアウォール自体は切りません。「外部からの接続をすべてブロック」がオンの Mac（会社の管理下など）では届かないので、管理者に相談するか、下の「Xcode の iOS シミュレーター」で代わりに確認します
6. `403 Blocked request` と表示される：ホスト名（`.local` など）で開いています。IPアドレスで開きます
7. ページは開くが古い内容のまま：`npm run build` をし直してから、iPhone で再読み込みします

### 安全に使うために

- 起動している間は、同じネットワークにいるほかの端末からもサイトを開けます。カフェ・ホテルなどの公共 Wi-Fi では起動しません
- 配信されるのは `dist/` の静的ファイルだけです。それでも開発用サーバーの既知の指摘（「npm audit と開発用サーバー」）があるので、確認が終わったら `Ctrl + C` で止めます
- `npm run dev -- --host` は使いません。ルーターのポート開放、外部公開のトンネル、ファイアウォールの無効化もしません

### LAN の preview では確かめられないこと

- 本番ホストでの 404・末尾スラッシュの扱い（ここで確かめられるのは vite preview の動き）
- HTTPS でだけ起きること、`SITE_URL` を指定した OGP の絶対URLと SNS のカード表示

これらは公開先（ステージングか本番）が決まってから、同じチェックリストで確認します。

### Android Chrome について

Android の実機がないため、Android Chrome の実機確認は未実施です。今ある環境でできるのは、Playwright（グローバルに入っているもの）の Chromium で Pixel 7 などの端末設定（画面サイズ・タッチ・UA・ピクセル比）を再現する確認までです。エンジンは Android Chrome と同じ Blink ですが、デスクトップ版の Chromium なので、アドレスバーの伸び縮み、キーボード、Google の自動入力、強制ダークモード、端末のフォントは再現されません。「画面幅をスマートフォンに合わせた確認」であって、Android Chrome の実機確認の代わりにはなりません。

本物の Android Chrome で確かめる方法は次のとおりです（どれも今回は導入していません）。

| 方法 | 必要なもの・作業 | 備考 |
|---|---|---|
| Android Studio のエミュレーター | Android Studio と、Google Play 入りのシステムイメージ（数GB〜10GB以上）。AVD を作り、エミュレーターの Chrome で `http://10.0.2.2:4173/`（エミュレーターから見た Mac。`--host` なしの `npm run preview` で開ける）を開く | 実際の Android Chrome が動く。Apple シリコンの Mac でも動作する |
| 実機を借りる | 同じ Wi-Fi で、iPhone と同じ手順（`npm run preview:lan`） | いちばん確実。Mac の Chrome から `chrome://inspect` でリモートデバッグもできる（USB と開発者向けオプションが必要） |
| クラウドの実機サービス（BrowserStack など） | アカウント（有料）。ローカルの preview を見せるには各サービスのトンネルが必要 | 外部へのトンネルになるので、使うなら公開先が決まってから、そのURLで確認する |

iPhone の補完としては、Mac に Xcode を入れていれば、iOS シミュレーターの Safari で `http://localhost:4173/` を開けます（`--host` も不要）。ただしシミュレーターも実機ではないので、タッチの感触・性能・アドレスバーの細かな動きは実機で確認します。

## 実機確認チェックリスト（iOS Safari・Android Chrome）

**NEWS（お知らせ）とお問い合わせフォームは、以前 iPhone で動作確認済みです。** それ以外は、実機ではまだ確認していません（自動テストは 1440／768／390／320px の Chromium で実施済み）。今回は未確認の項目を優先し、NEWS とフォームは ★ の項目だけ再確認します（★ はその後の修正で変わった箇所か、ほかのページとの行き来に関わる箇所です）。

公開先が決まるまでは「iPhone で実機確認する（同じWi-Fi内）」の方法で、決まったら公開先のURLで確認します。端末の目安は次のとおりです。

- iPhone の Safari（最新の iOS とひとつ前）、iPhone SE など幅 375px の端末
- Android の Chrome（Pixel など）。実機がない場合は未確認として残します（「Android Chrome について」を参照）
- 縦向きを基本に、TOP の MV など一部は横向きも確認

### 記録のしかた

確認した日・端末・確認したコミットを書き、各項目の行末に区分と結果を書き足します。

- 区分：**今回確認**（初めて確認）／**今回再確認**（以前確認済みで、今回もう一度確認）／**以前確認済み**（今回は確認していない）
- 結果：OK／NG（NG は内容とスクリーンショットの保存先をメモ）
- 例：`- [x] ハンバーガーで開閉できる。…　— 今回確認・OK（iPhone 15／iOS 26.0）`

| 確認日 | 端末・OS | ブラウザ | 確認したコミット | 確認方法 | 確認者 |
|---|---|---|---|---|---|
| | | Safari | | LAN の preview／公開先のURL | |

### フォームの入力について

フォームはデモで、入力内容は送信も保存もされません。それでも、**実在する個人情報（自分や他人の氏名・住所・電話番号・メールアドレス）は入力せず、架空のテストデータだけで確認します。** 例：氏名「木乃 試験」、フリガナ「キノ シケン」、メール `test@example.com`、電話 `000-0000-0000`、郵便番号 `390-0000`、住所「長野県架空市木乃町1-2-3」。

自動入力の確認では、候補が出ることと入る欄（住所が2行の欄に入るか）だけを見ます。iPhone の自分の連絡先が候補に出ても選ばず、選んだ場合は確認後にページを再読み込みして入力内容を消します。

### 共通・表示

- [ ] 全ページで横スクロールが出ない。文字の折り返しが不自然でない（フッターの「（9:00–18:00／水曜定休）」、見出しの改行位置）
- [ ] 画面の左右の端で、文字・ボタン・カードが切れたり、はみ出したりしない（幅 375px 以下の端末でも）
- [ ] 横向きにしたとき、ノッチ／ダイナミックアイランドの側で文字やボタンが隠れない
- [ ] 画像が欠けていない（灰色の枠や代替テキストだけになっていない）。スクロールして遅れて読み込まれる写真も表示される
- [ ] Google Fonts（Shippori Mincho・Noto Sans JP・Jost）が読み込まれ、読み込み中のちらつきが許容範囲である
- [ ] ピンチで拡大できる（viewport は拡大を禁止していない）
- [ ] ボタン・リンク・チップが指で押しやすく、隣のリンクを誤ってタップしない（フッターのリンク、絞り込みのチップ、MV のドット）
- [ ] Android Chrome の自動ダークモード（ブラウザ側の強制ダーク）が有効でも、写真や文字の色が崩れない
- [ ] ホーム画面に追加したとき、アイコン（`apple-touch-icon.png`・favicon）が表示される

### ヘッダー・SPメニュー

- [ ] ハンバーガーで開閉できる。開いている間は背景がスクロールしない。閉じるとスクロール位置が戻る
- [ ] メニューのリンクで移動したあと、移動先のページでメニューが閉じている
- [ ] TOP では、ヘッダーが MV の上で透過し、スクロールすると白背景に切り替わる
- [ ] VoiceOver・TalkBack で、メニューの開閉とリンクが読み上げられる

### TOP・MVスライダー

- [ ] MV の高さが、アドレスバーの伸び縮みでがたつかない（`svh` で指定）。横向きでも写真が切れすぎない
- [ ] 横スワイプでスライドが切り替わり、縦スクロールの邪魔をしない
- [ ] 前後ボタン・ドットのタップ領域が十分で、番号が正しい
- [ ] スライドの事例名をタップすると、その事例の詳細ページに移動する
- [ ] 縦長写真（2・3枚目）の粗さが、実機で許容範囲か
- [ ] 施工事例・お知らせの横スクロール（スクロールスナップ）とインジケーターが同期する

### SP固定CTA・フッター

- [ ] MV を過ぎると下から出て、フッターに達すると隠れる
- [ ] iPhone のホームインジケーターと重ならない（safe-area の余白）。iOS Safari の下部ツールバーの伸び縮みで位置がずれない
- [ ] 固定CTAが、ページ最下部のフッターの文字やリンクを隠さない
- [ ] 2つのボタンが押しやすく、資料請求・ご相談それぞれのフォーム種別に遷移する
- [ ] お問い合わせページでは表示されない

### 施工事例（一覧 → 詳細）

- [ ] 一覧のカードをタップすると詳細ページに移動する（4件とも）
- [ ] 詳細から「戻る」（ボタンか画面左端からのスワイプ）で一覧に戻り、スクロール位置と絞り込みの状態（URL の `?category=` など）が保たれる
- [ ] 絞り込みのボトムシートが開閉し、シートの中だけがスクロールする（最大高さ 85svh）。結果の件数が正しい
- [ ] 詳細ページの写真（ギャラリー・間取り図）が欠けず、「ほかの事例」から別の詳細ページに移動できる

### お知らせ（NEWS）〔以前 iPhone で確認済み〕

- [ ] ★ TOP の最新3件から記事ページに移動できる
- [ ] ★ 一覧のカテゴリで絞り込める。URL に `?category=` が付き、件数と表示が合う。「すべて」で元に戻る
- [ ] 一覧から記事ページに移動し、「戻る」で一覧（絞り込みの状態）に戻る
- [ ] 記事ページの前後の記事リンク、一覧へ戻るリンクが動く
- [ ] ★ 終了したイベント記事（OB様宅見学会）が過去形で表示される

### お問い合わせフォーム〔以前 iPhone で確認済み〕

上の「フォームの入力について」のとおり、架空のテストデータだけで確認します。

- [ ] 入力欄をタップしても画面が拡大されない（文字サイズ 16px）
- [ ] キーボードの種類：メールはメール用、電話は電話用、郵便番号は数字のキーボードになる
- [ ] ★ 自動入力：名前・メール・電話・郵便番号・住所の候補が出る（iOS は連絡先、Android は Google の自動入力）。住所が2行の欄に入る（住所欄は以前の確認のあとで2行の欄に変えました）
- [ ] 見学予約の日付欄で、ネイティブの日付ピッカーが開く。時間帯の select とラジオボタンが操作できる
- [ ] 未入力で送信すると、エラーの一覧が表示され、キーボードに隠れずに読める
- [ ] ★ 確認画面から、端末やブラウザの「戻る」で入力画面に戻り、値が残っている
- [ ] ★ 送信（デモ）で完了画面が表示され、通信が発生しない
- [ ] ★ 同意欄の「プライバシーポリシー」のリンクが開き、「戻る」でフォームに戻る
- [ ] VoiceOver・TalkBack で、ラベル・必須・エラー文が読み上げられる

### Safari のスクロール・画面遷移

- [ ] 「戻る」「進む」（ボタン・画面端からのスワイプ）でページが正しく表示される。SPメニューが開いたまま、ヘッダーが透過のまま白背景にならない、固定CTAが出ない、といった状態のずれがない
- [ ] ページの最上部・最下部で引っ張ったとき（バウンス）、ヘッダーや固定CTAが不自然に動いたり、すき間が見えたりしない
- [ ] スクロール中にヘッダーや固定CTAがちらついたり、がたついたりしない
- [ ] スクロール中に写真の表示が大きく遅れたり、レイアウトが跳ねたりしない

### リンク・URL

- [ ] ページ内リンクで移動したとき、見出しが固定ヘッダーに隠れない（事業内容の目次 `#custom`・`#renovation`・`#shop`、家づくりの考え方の目次 `#local`・`#material`・`#life`）
- [ ] ほかのページからのページ内リンクが、移動先の位置で止まる（`/service/#flow`、`/service/#support`、`/about/#staff`）
- [ ] スラッシュなしのURL（`/about`、`/works?category=…`）を Safari のアドレスバーに入力すると、スラッシュ付き（`/about/`）で表示される（LAN の preview で確認できる。本番ではホストの設定次第なので公開先でも確認）
- [ ] 電話番号のリンク（`tel:`）で発信の確認が出る

### プライバシーポリシー・404

- [ ] フッターの「プライバシーポリシー」から `/privacy/` に移動できる。本文が読みやすい幅で、横スクロールしない
- [ ] プライバシーポリシーの外部リンク（Google）が開く
- [ ] 存在しないURL（`/foo/`、`/news/no-such-post/`）で 404 ページが表示され、そこから TOP やほかのページへ移動できる（LAN の preview で確認できる。本番ではホストの設定次第なので公開先でも確認）
