# Infigate Design System

UI コンポーネントと、それを一覧・確認するための静的カタログサイトです。

- React 19 / Vite 8 / TypeScript 6
- React Router 8（ハッシュルーティング。静的ホスティングでそのまま動く）
- CSS Modules + CSS 変数（デザイントークン）
- Noto Sans JP（`@fontsource-variable/noto-sans-jp` で同梱。外部 CDN に依存しない）
- Vitest 5 + Testing Library（jsdom）
- oxlint（アーキテクチャ境界のチェックを含む）

## コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm test` | テスト（watch モード） |
| `npm run test:run` | テストを1回だけ実行（CI 用） |
| `npm run typecheck` | 型チェック |
| `npm run lint` | Lint（import 境界の違反も検出） |
| `npm run build` | `dist/` に静的サイトを出力 |
| `npm run preview` | ビルド結果をローカルで確認 |
| `npm run icons:generate` | `Icon/svg/` の SVG からアイコンのデータ（`icons.generated.ts`）を生成 |

`dist/` は相対パス（`base: './'`）で出力されるため、任意のサーバー・サブディレクトリに置けます。

## ディレクトリ構成

機能（feature）単位で分割し、各 feature の中をドメイン駆動のレイヤーで構成しています。

```
src/
├── app/                      # アプリケーション層: 各機能を組み立てて起動する（コンポジションルート）
│   ├── main.tsx              #   エントリポイント
│   ├── App.tsx               #   Provider と Router の組み立て
│   ├── router.tsx            #   ルーティング（各 feature のルートを差し込む）
│   ├── catalogRepository.ts  #   *.catalog.tsx を収集してリポジトリを生成
│   ├── layouts/              #   サイト共通の枠
│   └── pages/                #   機能に属さないページ（404 など）
│
├── features/                 # 機能モジュール（境界づけられたコンテキスト）
│   └── catalog/              #   コンポーネントカタログ
│       ├── index.ts          #     公開API。外部からはここ経由でのみ参照する
│       ├── domain/           #     エンティティ・値・ルール（CatalogEntry, Category, リポジトリの型）
│       ├── application/      #     ユースケース（検索、カテゴリ別グループ化）
│       ├── infrastructure/   #     リポジトリ実装（glob 読み込み / インメモリ）
│       ├── presentation/     #     画面（pages）・部品（components）・ルート定義
│       └── testing/          #     この feature のテスト用ヘルパー・フィクスチャ
│
├── design-system/            # デザインシステム本体（カタログが扱う対象）
│   ├── index.ts              #   公開API
│   ├── tokens/               #   デザイントークン（CSS 変数）
│   │   ├── tokens.css            # 入口（下記を @import ＋ 未対応の仮トークン）
│   │   ├── typography.css        # Figma「Responsive」の font-size ＋ テキストスタイル
│   │   ├── dimensions.css        # Figma「Dimensions」の spacing ・ radius ・ size
│   │   ├── layout.css            # Figma「Responsive」の breakpoint ・ layout（グリッド・最大幅）
│   │   ├── elevation.css         # Figma のエフェクトスタイル elevation/1〜3
│   │   ├── color-primitives.css  # Figma「Color-Primitives」
│   │   ├── color-semantics.css   # Figma「Color-Semantics」
│   │   └── tokens.test.ts        # トークンの参照整合性・値の直書き禁止を検査
│   └── components/
│       └── Button/
│           ├── Button.tsx            # 実装
│           ├── Button.constants.ts   # variant / size の定義
│           ├── Button.module.css     # スタイル（トークンのみ参照）
│           ├── Button.test.tsx       # ユニットテスト
│           ├── Button.catalog.tsx    # カタログ掲載用の定義
│           └── index.ts
│       └── Icon/
│           ├── svg/                  # Figma から書き出したアイコンの SVG（元データ）
│           ├── icons.generated.ts    # svg/ から生成したデータ（直接編集しない）
│           ├── iconSource.ts         # SVG → データの変換（生成スクリプトとテストで共用）
│           └── Icon.tsx ほか
│
└── shared/                   # 特定の機能に属さない汎用コード
    ├── lib/                  #   ユーティリティ
    └── test/                 #   テスト共通セットアップ

scripts/
└── generate-icons.ts         # npm run icons:generate の本体
```

### 依存のルール

```
app ──▶ features/* (公開APIのみ) ──▶ shared
 │                                     ▲
 └────▶ design-system (公開APIのみ) ───┘

features/<name> の内部:  presentation ──▶ application ──▶ domain ◀── infrastructure
```

- feature の内部ファイルを外から直接 import しない（`@/features/catalog` を使う）
- デザインシステムはカタログサイトに依存しない。例外は `*.catalog.tsx` だけで、`@/features/catalog` の公開APIのみ使える
- domain 層は React の描画処理や外部 I/O に依存しない（型の参照のみ）

上の import ルールは `.oxlintrc.json` の `no-restricted-imports` で検査しています。

## コンポーネントの追加手順

1. `src/design-system/components/<Name>/` を作り、`<Name>.tsx` と `<Name>.module.css` を実装する
2. `<Name>.test.tsx` にユニットテストを書く
3. `<Name>.catalog.tsx` を作り、`defineCatalogEntry()` の戻り値を default export する
4. `src/design-system/index.ts` から export する

`*.catalog.tsx` はビルド時に自動収集されるため、ルーティングや一覧への登録作業は不要です。
`name` から URL（slug）が自動生成されます（例: `TextField` → `#/components/text-field`）。

```tsx
import { defineCatalogEntry } from '@/features/catalog'
import { TextField } from './TextField'

export default defineCatalogEntry({
  name: 'TextField',
  category: 'inputs', // src/features/catalog/domain/category.ts で定義
  description: '1行のテキスト入力',
  variants: [{ name: 'Default', render: () => <TextField label="氏名" /> }],
  props: [{ name: 'label', type: 'string', required: true, description: 'ラベル' }],
})
```

定義に不備（variant が0件、名前の重複、未定義カテゴリなど）があると、読み込み時にエラーになります。

バリエーションの見出しは英語（Variants / Sizes / Disabled など）で統一し、説明文は1文程度に短くします。

### Playground（任意）

`playground` を定義すると、詳細ページの説明の下に、props を切り替えて確かめる欄が表示されます。
`definePlayground()` を使うと、`render`・`code` の引数に切り替え項目どおりの型が付きます。

```tsx
import { defineCatalogEntry, definePlayground, ForcePseudoState } from '@/features/catalog'

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'size', options: ['sm', 'md'], defaultValue: 'md' }, // 6個以下はボタン型、それ以上はセレクト
    { type: 'boolean', name: 'disabled', defaultValue: false },
    { type: 'text', name: 'label', defaultValue: '入力' },
  ],
  render: ({ size, disabled, label }) => <TextField size={size} disabled={disabled} label={label} />,
  code: ({ size }) => `<TextField size="${size}" />`, // 省略可
})

export default defineCatalogEntry({ name: 'TextField', /* ... */ playground })
```

hover・active・focus のように操作で起きる状態は、`<ForcePseudoState state={['hover']}>` で囲むと再現できます。
部品の CSS には手を入れず、ページ内の CSS から `:hover` などのルールを集めて、強制用のルールを自動で追加しています。

## テスト

| 対象 | 置き場所 | 内容 |
| --- | --- | --- |
| デザインシステムの各コンポーネント | `design-system/components/*/*.test.tsx` | props・操作・アクセシビリティ |
| デザイントークン | `design-system/tokens/tokens.test.ts` | 未定義トークンの参照・色／文字／余白／角丸／影の直書き・Figma 以外のブレークポイントがないか（全 CSS が対象） |
| アイコンの生成 | `design-system/components/Icon/iconSource.test.ts` | SVG の変換ルールと、`icons.generated.ts` が `svg/` と一致しているか |
| ドメイン / ユースケース | `features/*/domain`, `application` | 純粋関数のルール |
| リポジトリ | `features/*/infrastructure` | 読み込み・重複検出 |
| 画面 | `features/*/presentation` | 表示・検索・遷移（インメモリのリポジトリを注入） |
| 登録済みカタログ全体 | `app/catalogRepository.test.tsx` | 全コンポーネントの全バリエーションが描画できるか（追加すると自動で対象になる） |
| 結合 | `app/App.test.tsx` | 実際のルーター・データでの画面遷移 |

テストは実装の隣に置き（コロケーション）、要素の取得は role / ラベルなど利用者から見える情報を優先します。

## デザイントークン

値は `src/design-system/tokens/` に集約し、CSS では色やサイズを直接書かずに必ずトークンを参照します（テストで検査）。

### カラー

Figma「[Infigate デザインシステム / Color](https://www.figma.com/design/o3HtOq4eypxEOpLHB2DgQr/Infigate-%E3%83%87%E3%82%B6%E3%82%A4%E3%83%B3%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0?node-id=2-2)」のバリアブルを実装しています。

| 層 | ファイル | 例 | 使い方 |
| --- | --- | --- | --- |
| プリミティブ | `color-primitives.css` | `--color-blue-500` | 基本パレット。原則として部品から直接使わない |
| セマンティック | `color-semantics.css` | `--color-text-primary`, `--color-border-focus` | 役割名。部品からはこちらを使う |

- 変数名は Figma のバリアブル名の `/` を `-` にし、先頭に `color-` を付けたもの（`text/primary` → `--color-text-primary`）
- セマンティックは Figma と同じ参照関係で定義している（`text/primary` → `gray/900` なら `var(--color-gray-900)`）
- キーカラーを変えるときは `--color-keycolor-50`〜`900` の参照先だけを差し替える

### タイポグラフィ

Figma「[Infigate デザインシステム / Typography / Link](https://www.figma.com/design/o3HtOq4eypxEOpLHB2DgQr/Infigate-%E3%83%87%E3%82%B6%E3%82%A4%E3%83%B3%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0?node-id=19-1120)」の文字サイズ変数とテキストスタイルを実装しています（`typography.css`）。

テキストスタイルは `font` プロパティにそのまま指定します。

```css
.title {
  font: var(--font-heading-xl); /* 太さ・大きさ・行間・書体がまとめて決まる */
}
```

| 種類 | トークン | 用途（Figma の説明より） |
| --- | --- | --- |
| 見出し | `--font-heading-3xl` 〜 `--font-heading-sm` | 3xl はページの h1（1ページに1回）、md はカード内の見出し |
| 本文 | `--font-body-md` / `-sm` / `-xs` | md が標準。xs は注釈だけ |
| ラベル | `--font-label-md` / `-sm` | ボタン・タブ・フォームのラベル |
| リンク | `--font-link-md` | 本文中のリンク。`text-decoration: underline` を必ず併用する |

- 見出しの大きさは画面幅で切り替わる（Mobile ≤767px / Tablet 768〜1023px / Desktop ≥1024px）。本文（16px）以下は変わらない
- 名前はサイズ基準で、h1〜h6 とは独立している。対応の目安は Figma のページを参照
- 文字サイズは rem で持つ（ブラウザの文字サイズ設定に追従させるため）

### スペーシング・角丸・レイアウト

Figma「[Infigate デザインシステム / Layout・Radius](https://www.figma.com/design/o3HtOq4eypxEOpLHB2DgQr/Infigate-%E3%83%87%E3%82%B6%E3%82%A4%E3%83%B3%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0?node-id=127-966)」の定義を実装しています。

| 種類 | トークン | 使い方 |
| --- | --- | --- |
| スペーシング | `--spacing-0` 〜 `--spacing-64` | padding・margin・gap に使う。数字は px 値（4の倍数）。値は rem で持つ |
| 角丸 | `--radius-none` / `xs` / `sm` / `md` / `lg` / `xl` / `full` | md はボタン・入力欄、lg はカード、xl はモーダル、full はバッジ |
| レイアウト | `--layout-columns` / `gutter` / `margin` | グリッドの列数・列間・画面左右の余白。画面幅で切り替わる |
| 最大幅 | `--layout-content-max` / `--layout-reading-max` | レイアウト全体（Desktop 1440px）と、1カラムの本文（720px） |

- ブレークポイントは Mobile 〜767px / Tablet 768〜1023px / Desktop 1024px〜。メディアクエリでは `var()` が使えないため、`(min-width: 768px)` `(min-width: 1024px)`（max なら 767px / 1023px）を直接書く
- CSS の余白・角丸は値を直接書かずにトークンを使う。メディアクエリも上の境界値以外は使わない（テストで検査）

### エレベーション

Figma「[Infigate デザインシステム / Elevation・Icon](https://www.figma.com/design/o3HtOq4eypxEOpLHB2DgQr/Infigate-%E3%83%87%E3%82%B6%E3%82%A4%E3%83%B3%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0?node-id=136-983)」のエフェクトスタイルを実装しています（`elevation.css`）。`box-shadow: var(--elevation-2);` のように使います。

| トークン | 用途 |
| --- | --- |
| `--elevation-1` | カード、境界線の代わりに軽く区切りたい面 |
| `--elevation-2` | ドロップダウン、ポップオーバー、ツールチップ、固定ヘッダー |
| `--elevation-3` | モーダル、ダイアログ（これより上は作らない） |

迷ったら影ではなく線（border）を使います。影は「操作に応じて一時的に出てくるもの」だけに使います。

## アイコン

Lucide を基準に Figma で整えたアイコンセットを `Icon` コンポーネントとして登録しています。一覧はカタログの「Icon」で確認できます。

```tsx
import { Icon } from '@/design-system'

<Icon name="search" size={20} />                  // 文字と並べるとき（装飾として読み上げない）
<Icon name="x" label="閉じる" />                   // アイコンだけで意味を伝えるとき
<Icon name="circle-check" variant="filled" />     // 状態を伝えるとき（塗りの版があるものだけ）
```

- 色は周囲の文字色（`currentColor`）を受け継ぐ。アイコンだけ別の色にはしない
- 大きさは 16（小さいボタン・表の中）/ 20（通常のボタン・フォーム）/ 24（単体・ナビゲーション）
- 塗り（`filled`）を指定できるのは塗りの版があるアイコンだけ（型で検査される）

### アイコンの追加手順

1. Figma の「コンポーネント（マスター）」ページ → icons フレームのアイコンを SVG で書き出す
2. `src/design-system/components/Icon/svg/` に `名前.svg`（塗りの版は `名前.filled.svg`）で置く。名前は Figma の `icon/名前` と同じ
3. `npm run icons:generate` を実行する

変換で変わるのは色だけです（線・塗りの色 → `currentColor`、白抜き → `text/on-brand`）。形はそのまま使います。生成し忘れるとテストが失敗します。

### 未対応（仮の値）

フォーカスリング・アニメーション時間・等幅フォントの `--ds-*` はまだ仮の値です（Figma に定義がないもの）。
