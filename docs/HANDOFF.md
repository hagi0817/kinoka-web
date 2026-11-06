# KINOKA 引き継ぎメモ（Claude → Codex）

作成日：2026-11-06。作業ルールはリポジトリ直下の [`AGENTS.md`](../AGENTS.md) を参照してください。

## 1. ひとことで

サイトの実装・QA はほぼ完了しています。cloud（Chromium）での最終 QA は全項目合格です。残りは **(a) main に入っていない8コミットの取り込み**、**(b) iPhone 実機確認**、**(c) 公開先が決まってからの公開作業**、**(d) 判断待ちの小さな改善** の4つです。

## 2. プロジェクトの前提

- 題材：架空の工務店「株式会社 木乃家（KINOKA）」。長野県松本市、創業約25年、松本・安曇野・塩尻の中信地域が対象エリア。
- 目的：ポートフォリオとして公開できる品質の、実案件を想定したサイト。企画・情報設計・UI/UX・ビジュアルデザイン・実装を一通り見せる。
- ゴール設定（架空）：初訪問のユーザーが3分以内に「どんな会社か・どんな家か・自分たちに合いそうか」を判断し、相談・資料請求・見学予約に進める。主要デバイスは SP 7割想定。
- ターゲット：「おしゃれだけど、ちゃんと暮らしやすい家」を探す中信地域の30〜40代子育て世帯。施工事例 → 考え方 → 費用感の順に比較検討する前提。
- CTA は温度の違う3種：資料請求（弱）→ 見学予約（中）→ 相談（強）。`/contact/?type=consultation|document|visit` で初期選択。
- グローバルナビは検討フロー順：About・Works・Concept・Service・News・Contact ＋ 常設 CTA「家づくりを相談する」。
- 検索結果には出さない（全ページ noindex）が、URL を知っていれば誰でも見られる・SNS で共有できる、という公開方針。

## 3. デザインの要点

AGENTS.md の「デザイン方針」に加えて：

- 参照は住宅誌・建築誌のレイアウト。親しみは「語り口と写真の人の気配」で出す。
- タイポグラフィ（PC / SP）：MV キャッチ 56 / 34px、セクション見出し 36 / 26px、小見出し 22 / 19px（いずれも Shippori Mincho Medium）、本文 16px・行間2.0 / 15px・1.9（Noto Sans JP）、英字ラベル 13 / 12px（Jost Medium、字間0.2em）。
- 写真比率は4種に絞る：16:9（Works 詳細メイン）、4:5（Works カード）、4:3（Concept）、3:2（Service）。MV は PC 1440×860・SP 390×720 で別トリミング。
- グリッド：PC 12カラム・コンテンツ幅1200px・ガター24px・セクション間160px ／ SP 4カラム・左右24px・ガター16px・セクション間96px。PC 値は 1024〜1440px で流体（`_tokens.scss` の clamp）。
- SP は PC の縮小ではなく別レイアウト：Works カードは横スクロール（次のカードを少し見せる）、Service はサムネイル付きリスト、MV 通過後に下部固定 CTA バー。
- Works 詳細は「写真集」ではなく「この家族の要望にどう応えたか」を読むページ。Hero → データ表 → Story → 設計のポイント3つ → ギャラリー → 間取り図 → 担当スタッフ → 文脈 CTA → 関連事例。ページごとの違いは `_works-detail.scss` の modifier で出す。
- Figma：ファイルキー `ikrnT6SejNyvcWO2tmXXWv`（オーナーの個人アカウント）。主なページは `00_Cover`、`01_Design System`（Variables・Text Styles・コンポーネント、`Photo Assets` ボード、`Works Detail Components`）、`10_TOP_PC`、`11_TOP_SP`、`21_Works Detail_PC`、`22_Works Detail_SP`。About・Service 用の生成写真は Figma にまだ配置していません（実装には入っています）。
- 写真はすべて生成 AI で作った架空のものです（プライバシーポリシーの「生成AIの利用について」に記載）。

## 4. リポジトリの現状（2026-11-06 時点）

- `main` の先端：`9db6ef3`（PR #5 のマージ）。PR #1・#2・#5 はマージ済み。オープンな PR はありません（この引き継ぎ PR を除く）。
- **main に入っていない8コミット（6つの変更）があります。** PR #3（README）と PR #4（MV 写真）は、スタックした base（`claude/project-thread-w4vh96`、`claude/kinoka-readme-pclhi8`）にマージされたため、main に届いていません。

  | コミット | 内容 |
  |---|---|
  | `2ddd38c` | README 補完（preview・ogp、Node バージョン、末尾スラッシュ、SITE_URL、イベント日付、npm audit、実機チェックリスト） |
  | `ff497e2` | iPhone 確認用の `npm run preview:lan` とチェックリスト |
  | `c133682` | iPhone Safari の不具合2件の修正と MV スワイプの強化 |
  | `417c09d` | MV スワイプを touch イベントで検出（iOS Safari 対応） |
  | `fdade0e` | README 追記（dev server、dist 構成、公開前確認、npm audit、スワイプのチェック項目） |
  | `54d1d72` | TOP MV 2・3枚目（平屋・リノベ）を PC で横長写真に（`works.json` の `hero`） |

  これらは全部 `claude/kinoka-readme-pclhi8`（先端 `add6f14`）に揃っています。差分は README・`package.json`・`src/data/works.json`・`src/js/main.js`・`_base.scss`・`_works-index.scss` の6ファイル。取り込み用の PR #7 を出しています（下記 5-1）。
- `claude/` で始まるほかのブランチは、作業スレッドごとに作られた古いブランチで、すべて上記のどちらかに含まれます。消してもコミットは失われません（削除はオーナー判断）。
- GitHub の既定ブランチが `main` ではなく `claude/kinoka-top-works-detail-yiz5iu` になっています（2026-11-06 に `git ls-remote --symref` で確認）。clone 直後はこの古いブランチ（PR #1 時点）が checkout されるので注意。リポジトリの Settings で `main` を既定にするのを推奨。
- `add6f14` で `npm ci && npm run build` が警告なしで成功し、HTML 21件・全件 noindex を確認済み（2026-11-06、Node 22）。

## 5. 残タスク

### 5-1. 最初にやること

1. **main に8コミットを取り込む**：PR #7（`claude/kinoka-readme-pclhi8` → `main`）をオーナーがマージする（merge commit で）。マージ後 `git merge-base --is-ancestor 54d1d72 origin/main` が成功することを確認。
2. 取り込み後の main で `npm ci && npm run build` → `npm run preview` で TOP MV（PC 4枚・SP スワイプ）、Works 一覧の絞り込み、SP メニューを確認。

### 5-2. iPhone 実機確認（オーナーの手作業が必要）

- 修正（`c133682`・`417c09d`）後の実機確認がまだです。対象：MV のスワイプ、SP メニューの × ボタンの枠、Works の絞り込み（ボトムシート）。
- 手順とチェックリストは README の「iPhone で実機確認する」「実機確認チェックリスト」。**必ず最新コミットからビルドし直してから** `npm run preview:lan` で確認する（以前、古いビルドを配信していて誤判定した）。
- 未確認：safe-area（`viewport-fit=cover` を付けていないため、固定 CTA の下余白は 16px のみの見込み）、Safari（Mac）・Firefox・Android Chrome。
- エージェントにできるのは、Playwright の端末エミュレーション（iPhone 13 / SE）での事前確認まで。

### 5-3. 公開前（公開先が決まってから）

公開先・公開 URL は**未定**です（オーナーの判断待ち）。決まったら：

1. **イベント記事を過去形にする**：2026-11-06 時点で `open-house-azumino-2026-10`（完成見学会 10/24・25）は終了済み。`autumn-consultation-2026`（〜11/29）も公開時期によっては終了。書き方は README「公開前にイベント日付を確認する」、見本は `owner-house-visit-2026-06`。`title`・`date` は変えない。
2. `year-end-holiday-2026`（`published: false`、日付 2026-12-01）を出すか決める。
3. `SITE_URL=https://… npm run build` でビルドし、`og:url`・`og:image` を確認。
4. 公開先で 404（ステータス 404）と末尾スラッシュなし URL（`/about` → `/about/`）の挙動を確認。必要ならホスト側設定。
5. プライバシーポリシーの「公開サーバーのアクセス記録」の説明を、公開先ホストの仕様に合わせる。
6. 公開後に SNS のカードプレビューで OGP を確認。
7. README「公開手順」の確認項目を一通り。

### 5-4. 判断待ちの改善（推奨つき）

| 項目 | 推奨 | メモ |
|---|---|---|
| vite 5.4.21 → 6.4.4 | 上げる（1 PR で） | `npm audit` の2件（high 1・moderate 1）はどちらも dev/preview サーバーだけの問題で、公開物には影響しない。作業用コピーで audit 0件・出力 HTML がハッシュ以外同一・404/301 同じを確認済み。手順は README「npm audit と開発用サーバー」 |
| HTML 検証の最終記録 | `dist/` に Nu HTML Checker を1回かけて記録 | 過去の検証ではエラーなし。html-validate の推奨ルール約150件は直さなくてよい判断 |
| MV の縦長写真 | `54d1d72` で2・3枚目は解消 | ほかに 928×1152 のカード写真を PC で拡大している箇所が出たら、横長カットを `hero` に登録 |
| 古い `claude/*` ブランチの整理 | 取り込み後に削除 | すべて main（取り込み後）に含まれる |

## 6. 経緯（主な流れ）

1. 情報設計・デザイン方針の設計書 → Figma で TOP（PC/SP）、デザインシステム、写真配置。
2. 実装：TOP・Works 詳細（PR #1）→ 実装レビュー指摘の修正（PR #2）。
3. Works 一覧、お問い合わせ、About、Service、Concept、News、TOP MV のスライダー化、Works 詳細の残り3件、プライバシーポリシー、noindex/OGP/favicon/404、生成 AI 注記、QA 修正4・5（PR #5 に26コミット）。
4. README 整備、iPhone 実機確認の環境と修正、MV の横長写真（PR #3・#4 → 上記のとおり main 未到達）。
5. 最終 QA（cloud / Chromium、`54d1d72`）：21ページ×6幅でレイアウト崩れ・画像切れ・リンク切れ・JS エラーなし、MV（PC・タッチ再現）、SP メニュー、固定 CTA、ページ内リンク、フォーム（入力→確認→修正→完了、通信なし）、noindex、OGP すべて合格。axe も過去に12ページ×4幅で違反0件。
6. ローカル作業フォルダ（Mac の共有ボリューム上の複数 worktree）を整理し、GitHub から clone し直す方針にした。未 push のコミットはなかった。

## 7. 注意点・ハマりどころ

- iPhone で「直っていない」と見えたら、まず配信中の `dist/` が最新コミットのビルドかを疑う。
- iOS Safari ではポインタイベントだけではスワイプが取れないため、MV は touch イベントで検出している（`initMvSlider()`）。縦スクロールを邪魔しない・2本指で切り替えない・リンク上のスワイプで遷移しない、を壊さないこと。
- 記事ページ `/news/<slug>/` はファイルを持たず、`vite.config.js` がテンプレートから生成する。`news.json` の slug 重複・不正値はビルドエラーになる。
- dev/preview は存在しない URL に 404 をステータス 404 で返し、スラッシュなしは 301 で移動する（本番ホストの挙動に寄せるため）。
- 共有ボリューム（SMB）上で作業すると `.smbdelete*` が残ることがある。内容はコミット済みのものと同じで、無視してよい。
- お知らせの文言は閲覧日で自動的に変わらない。日付が過ぎたイベントは手で過去形にする。
