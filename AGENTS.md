# AGENTS.md — KINOKA（木乃家）Web

このリポジトリで作業する AI エージェント（Codex など）向けの作業ルールです。経緯・現状・残タスクは [`docs/HANDOFF.md`](docs/HANDOFF.md) にあります。**作業を始める前に必ず読んでください。**

## プロジェクト概要

- 架空の工務店「株式会社 木乃家（KINOKA）／長野県松本市」の Web サイト。**ポートフォリオ作品**で、会社情報・施工事例・スタッフ・お知らせはすべて架空です。
- 実案件を想定し、企画 → 情報設計 → Figma デザイン → 実装まで一貫して作っています。実装は Figma を正とします。
- Vite 5 + Sass の静的マルチページサイト。フレームワーク・CMS・バックエンドはありません。`dist/` を静的ホストのルートに置けば動きます。
- ページ（全21 HTML）：TOP、施工事例一覧、施工事例詳細4件、About、Service、Concept、お知らせ一覧・記事8件、お問い合わせ、プライバシーポリシー、404。

## セットアップと確認コマンド

Node.js **20.19 以上**（22 系推奨）。

```bash
npm ci
npm run dev        # http://localhost:5173/（--host は付けない）
npm run build      # dist/ に出力。警告なし・HTML 21 件が正常
npm run preview    # dist/ を http://localhost:4173/ で配信（本番に近い確認はこちら）
```

変更後は最低限これを通してください。

```bash
npm run build
find dist -name '*.html' | wc -l                              # 21（ページ追加時は増える）
grep -L 'content="noindex"' $(find dist -name '*.html')       # 何も出なければOK
```

テストフレームワーク・Linter は入っていません。UI を変えたら `npm run preview` で 1440 / 1024 / 768 / 390 / 320px の各幅を目視（またはスクリーンショット）で確認し、横スクロール・はみ出し・画像切れ・コンソールエラーがないことを確かめます。

`npm run images`（ImageMagick）と `npm run ogp`（ImageMagick + Playwright）は原寸写真が必要で、普段は使いません。原寸写真はリポジトリに入っていません（`public/images/` の WebP が書き出し済み）。

## ディレクトリ構成（要点）

| パス | 役割 |
|---|---|
| `index.html`、`works/`、`about/`、`service/`、`concept/`、`news/`、`contact/`、`privacy/`、`404.html` | 各ページの HTML（エントリは `vite.config.js` の `build.rollupOptions.input` に列挙） |
| `src/partials/` | 共通パーツ。`<!-- @include header.html {"key":"value"} -->` で読み込み、`{{key}}` を置換 |
| `src/data/works.json`・`taxonomy.json` | 施工事例データ。Works Card・一覧の絞り込み・TOP MV スライダーを生成 |
| `src/data/news.json`・`news-categories.json` | お知らせ。一覧・TOP 最新3件・記事ページ `/news/<slug>/`（`src/templates/news-article.html` から仮想生成） |
| `scripts/news.js`、`scripts/works-hero.js` | データの検証と HTML 組み立て（`vite.config.js` のプラグインから呼ばれる） |
| `src/scss/foundation/` | デザイントークン（`_tokens.scss`）、テキストスタイル mixin、ベース |
| `src/scss/components/`・`pages/` | 共通コンポーネント / ページ固有スタイル |
| `src/js/main.js` | SP メニュー、ヘッダー透過→Solid、SP 固定 CTA、TOP MV スライダー、カルーセル、Works 絞り込み |
| `src/js/contact.js` | お問い合わせフォーム（入力→確認→完了。**送信しないデモ**） |
| `vite.config.js` | include／@works／@works-hero／@news のプラグイン、記事ページ生成、dev/preview の 404・301 |

詳しい構成・更新手順は `README.md` にあります（News の更新、公開設定、公開手順、iPhone 実機確認、チェックリスト）。

## デザイン方針（変更時に守ること）

- トーンは「静かで印刷物のような上質さ」。ニュートラルな紙面に、写真と明朝の見出しだけで上質さを出す。甘いナチュラル・イラスト・手書き風装飾は使わない。
- 色は `src/scss/foundation/_tokens.scss` の CSS 変数だけを使う（Figma Variables と同名：`color/text/primary` → `--color-text-primary`）。UI はオフホワイト `#F6F4EF` とチャコール `#2B2926` の二色が基本。緑 `--color-accent-green` は CTA・リンクのみ、木色 `--color-accent-wood` は英字ラベル・番号など点で使う（合わせて画面の5%以下）。**新しい色・余白の値を直書きしない。**
- 書体：見出し Shippori Mincho、本文 Noto Sans JP、英字ラベル Jost（字間 0.2em）。明朝は見出しだけ。
- 角丸はボタン 4px、写真 0。線は 1px の細い罫線のみ。
- 余白は 8px ベース（`--space-*`）。ブレークポイントは SP ファースト：〜767px（左右24px）／768〜1023px（md、SP 構造で左右40px）／1024px〜（PC。1440px 以上はコンテンツ幅1200px で中央寄せ）。
- タップ領域は 48px 以上。フォーカスリングを消さない（暗い面では `--focus-color` を上書き）。
- 写真は自然光・彩度控えめ・人物は後ろ姿や手元のみ。色調補正は WebP に焼き込み済みで、CSS filter は使わない。PC/SP の焦点は `object-position` か `<picture>` の別トリミングで出し分ける。
- コンテンツは架空であることを崩さない。実在の会社・人物・数値（受賞歴、施工棟数など）を足さない。

## 必ず守ること

- **全ページ noindex を維持する**（`src/partials/head.html`）。canonical・sitemap は入れない。`robots.txt` で Disallow しない。
- フッターのポートフォリオ注記（「KINOKAは、架空の工務店を題材にした…ポートフォリオ作品です。」）を消さない。
- お問い合わせフォームは送信しないデモのまま。送信先を接続する・解析ツールや Cookie を足すときは、**先に `privacy/index.html` を実装に合わせて直す**。
- 公開 URL をリポジトリに書かない。絶対 URL が必要な OGP は `SITE_URL=… npm run build` のときだけ出力する。
- URL は末尾スラッシュ付き（`/about/`）が正。サイト内リンクもそれに合わせる。
- SPA 用の fallback（全 URL → index.html）は使わない。`vite.config.js` の `appType: 'mpa'` を変えない。
- `npm audit fix --force` を実行しない（vite のメジャー更新になる）。vite 6.4.4 への更新は判断待ち（HANDOFF 参照）。
- 新しい施工事例詳細ページを足すときは：`works/<slug>/index.html` を作る → `vite.config.js` の input に追加 → `works.json` の `url` に `/works/<slug>/`。
- 新しいページは `head.html`・`header.html`・`footer.html` を include する（noindex・OGP・ナビ・注記が自動で付く）。

## Git / PR の運用

- `main` が正（GitHub の既定ブランチはまだ古いブランチなので、clone 後は `git checkout main`）。作業はブランチを切り、PR で `main` に出す。**マージはオーナー（hagi0817）が判断する**ので、エージェントはマージしない。
- PR は小さく、1つの目的に絞る。スタック（PR の base を別の PR ブランチにする）はしない。過去にスタックした PR が main 以外にマージされ、変更が main に入らない事故があった（HANDOFF 参照）。
- squash / rebase merge ではなく merge commit を前提にしている。他人のブランチの履歴を書き換えない。
- `dist/` はコミットしない（`.gitignore` 済み）。
- コミットメッセージは英語の命令形で、何を変えたかが分かる1行（既存の履歴に合わせる）。

## 外部リソース（エージェントから見えない場合あり）

- Figma：ファイルキー `ikrnT6SejNyvcWO2tmXXWv`（オーナーの**個人アカウント**のファイル）。会社アカウントのワークスペースには絶対に作成・複製しない。
- 情報設計・デザイン方針の設計書、各ページの実装レポート、QA スクリーンショットは Claude のプロジェクト共有フォルダにあり、このリポジトリには入っていません。必要な要点は `docs/HANDOFF.md` に転記しています。
