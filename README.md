# Infigate Design System

UI コンポーネントと、それを一覧・確認するための静的カタログサイトです。

- React 19 / Vite 8 / TypeScript 6
- React Router 8（ハッシュルーティング。静的ホスティングでそのまま動く）
- CSS Modules + CSS 変数（デザイントークン）
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
│   ├── tokens/tokens.css     #   デザイントークン（CSS 変数）
│   └── components/
│       └── Button/
│           ├── Button.tsx            # 実装
│           ├── Button.constants.ts   # variant / size の定義
│           ├── Button.module.css     # スタイル（トークンのみ参照）
│           ├── Button.test.tsx       # ユニットテスト
│           ├── Button.catalog.tsx    # カタログ掲載用の定義
│           └── index.ts
│
└── shared/                   # 特定の機能に属さない汎用コード
    ├── lib/                  #   ユーティリティ
    └── test/                 #   テスト共通セットアップ
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

## テスト

| 対象 | 置き場所 | 内容 |
| --- | --- | --- |
| デザインシステムの各コンポーネント | `design-system/components/*/*.test.tsx` | props・操作・アクセシビリティ |
| ドメイン / ユースケース | `features/*/domain`, `application` | 純粋関数のルール |
| リポジトリ | `features/*/infrastructure` | 読み込み・重複検出 |
| 画面 | `features/*/presentation` | 表示・検索・遷移（インメモリのリポジトリを注入） |
| 登録済みカタログ全体 | `app/catalogRepository.test.tsx` | 全コンポーネントの全バリエーションが描画できるか（追加すると自動で対象になる） |
| 結合 | `app/App.test.tsx` | 実際のルーター・データでの画面遷移 |

テストは実装の隣に置き（コロケーション）、要素の取得は role / ラベルなど利用者から見える情報を優先します。

## デザインの差し替え

色・余白・角丸・フォントなどの値は `src/design-system/tokens/tokens.css` に集約しています。
コンポーネントの CSS はトークンだけを参照しているため、デザイン確定後はまずこのファイルを差し替えてください。
