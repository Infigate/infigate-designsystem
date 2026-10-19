## 概要

Infigate デザインシステム（React の部品＋デザイントークン）と、それを一覧する静的カタログサイト。部品とトークンは Figma ファイル `o3HtOq4eypxEOpLHB2DgQr` の定義を実装したもの。

作業の前に README.md の該当する章（ディレクトリ構成・依存のルール・コンポーネントの追加手順・テスト・デザイントークン）を読む。このファイルには README に無いことだけを書いている。

コードのコメント・JSDoc・テスト名・画面の文言は日本語で書く。

ファイルの種類ごとの決まり（CSS・テスト・カタログ）は `.claude/rules/` にあり、該当するファイルを触るときに読み込まれる。

## 作業の進め方

- 次の場合は、勝手に決めずに、進める前に確認する
  - 迷ったとき
  - Figma と違う点や、Figma で決まっていない点
  - トークンに無い値が必要なとき（近いトークンに丸めたり、新しいトークンを足したりしない）
- 新しい部品を作るときは、役割や形が近い既存の部品を先に読み、書き方をそろえる（例: 選択肢を持つ部品なら Tabs・RadioGroup、開閉する部品なら Accordion・Modal）
- 事前に確認できなかったものは、作業の報告の最後に「確認してほしいところ」として必ず挙げる。途中で決めた仮の判断もここに書く

## 確認のコマンド

作業を終えるとき、`npm run test:run`・`lint`・`typecheck` が Hook（`.claude/hooks/verify.sh`）で自動実行される。落ちたら直す。作業の途中では、必要に応じて自分でも実行する。

```sh
npx vitest run src/design-system/components/Tabs/Tabs.test.tsx   # 1ファイルだけ
npx vitest run -t "テスト名の一部"                                  # 名前で絞り込み
```

## 部品のファイル構成

`src/design-system/components/<Name>/` に置き、既存の部品（例: Tabs）と同じ分け方にする。

| ファイル | 中身 |
| --- | --- |
| `<Name>.tsx` | 部品だけを export する（Fast Refresh のため） |
| `<Name>.constants.ts` | 選択肢の配列と型（`export const TAB_VARIANTS = ['outline', 'solid'] as const`） |
| `<Name>.context.ts` | 複合部品の Context。`use<Name>Context()` は Provider の外で使うとエラーを投げる |
| `<Name>.parts.tsx` | 内部で使う見た目だけの小部品。カタログで状態の見本を出すのにも使う |
| `<Name>.module.css` | スタイル |
| `<Name>.catalog.tsx` / `.catalog.module.css` | カタログ定義と、見本のレイアウト用のスタイル |
| `index.ts` | 公開する export。`src/design-system/index.ts` にも追加する |

design-system 内の部品同士は相対パスで参照する（`../Icon`、`../Field/Field.constants`）。`@/design-system/components/**` は lint で禁止されている。

## 部品の作り方

- props 名は既存に揃える: 見た目は `variant`、大きさは `size`、意味の色は `status`、背景に合わせた配色は `theme`、並ぶ向きは `orientation`（`'horizontal' | 'vertical'`。`data-orientation` に出す。例: Stepper）
- 見た目の切り替えは `data-*` 属性（`data-variant`・`data-size` など）に出し、CSS で `[data-variant='solid']` のように書く。クラス名を組み立てない
- HTML 要素の props（`ComponentPropsWithRef<'button'>` など）を受け取り、`...rest` と `ref` をその部品の本体の要素に渡す。`className` は `cx()`（`@/shared/lib/cx`）で足す。`className` だけで済ませない
- トリガーと本体を持つ部品（Popover・Menu・Tooltip など）では、`...rest` と `ref` は本体の要素（開いたときに出る側）に渡す。トリガーは、利用者が渡した要素にそのまま付ける。今の Menu・Tooltip は本体に渡せていないので、この2つは真似しない
- フォーカスは `:focus-visible` に `box-shadow: var(--ds-focus-ring)`（内側に付けるときは `--ds-focus-ring-inset`）
- 動きには `--ds-duration-*` を使い、`@media (prefers-reduced-motion: reduce)` で止める
- スクロールする領域は `useScrollable`（`@/shared/lib/useScrollable`）を使う
- モーダルはネイティブの `<dialog>` と `showModal()`
- JSDoc には Figma 上の名前を添えてよい（例: `/** 見た目（Figma: Style） */`）

### 定数と型の名前

選択肢の配列は「部品名＋種類」の大文字・複数形、型はそこから作る単数形にする。型を手で書き写さないことで、選択肢を足したときに型・カタログ・テストがまとめて追従する。

```ts
/**
 * タイプ（Figma: Type）
 * solid: その画面で一番実行してほしい操作。1画面に1つが原則
 * outline: solid と並べる副次的な操作
 * text: 優先度が低い操作や、表の行など密度が高い場所
 */
export const BUTTON_VARIANTS = ['solid', 'outline', 'text'] as const
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number]
```

- 定数の JSDoc には、選択肢ごとの使い分け（いつ使うか）を書く。見た目の説明だけにしない
- 大きさの定数の JSDoc には、選択肢ごとの px と、使い分けを書く（下の `SPINNER_SIZES` の形）。配列は小さい順に並べる

```ts
/** 大きさ（Figma: Size）。sm 16px: ボタンの中 / md 24px: 画面の一部 / lg 40px: 画面全体 */
export const SPINNER_SIZES = ['sm', 'md', 'lg'] as const
```

### 既定値と状態の持ち方

- `size` の既定値は `md` にする。`md` が無い部品は、Figma で標準とされている大きさを既定にし、確認してほしいところに書く
- 値を外から操作できる部品は `value`・`defaultValue`・`onValueChange` の組にする。`value` を渡されたら外の値を使い、渡されなければ内部の state で持つ
- 開閉する部品は `open`・`defaultOpen`・`onOpenChange` の組にする（例: Accordion）
- HTML の `onChange`・`defaultValue` と名前がぶつかるときは、`Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'onChange'>` のように外してから足す

```tsx
export function Tabs({ variant = 'outline', value, defaultValue, onValueChange, children, ...rest }: TabsProps) {
  const [innerValue, setInnerValue] = useState(defaultValue)
  const current = value ?? innerValue

  const select = (next: string) => {
    if (value === undefined) setInnerValue(next)
    if (next !== current) onValueChange?.(next)
  }
  // ...
}
```

### 複合部品

- 組み合わせて使う部品は、`TabList`・`Tab`・`TabPanel` のように別々の名前で export する。`Tabs.List` のようなドット記法にはしない
- 親が持つ状態は `<Name>.context.ts` の Context で子に渡す。子を親の外で使ったときは `use<Name>Context()` がエラーを投げる

### アクセシビリティ

- `aria-labelledby`・`aria-controls`・`aria-describedby` などで要素を紐づける id は `useId()` で作る。固定の文字列にしない（同じ部品を1ページに複数置くと重なるため）
- 押せない状態は、ネイティブの `disabled` 属性と CSS の `:disabled` を基本にする。`aria-disabled` は、フォーカスは残したいなど理由があるときだけ使う
- `nav` などのランドマークを持つ部品は、名前を props で受け取る（Breadcrumb・Pagination の `label`、Header・Footer の `navLabel`）。1ページに同じ種類のランドマークが複数あっても区別できるようにするため

### 重なり順（z-index）

重なり順のトークンはまだ無い。今は次の値で並べている。

| 部品 | z-index |
| --- | --- |
| Header（固定表示のとき） | 900 |
| Menu | 1000 |
| Tooltip | 1100 |
| Toast | 1200 |

部品の中だけで重ねるときは `z-index: 1` を使う。新しく画面の上に重なる部品を足すときは、この並びに合わせた仮の値で進めてよい。選んだ値と理由は「確認してほしいところ」に挙げる。この表は、値が確定してから更新する。仮の値の間は表に足さない。

## Figma の文字サイズ

Figma の font-size の変数は PC の値。コードのテキストスタイルは画面幅で大きさが切り替わるので、数値ではなくテキストスタイルの名前（`heading-lg` など）で合わせる。
