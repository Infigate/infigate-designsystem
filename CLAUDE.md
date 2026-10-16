## 概要

Infigate デザインシステム（React の部品＋デザイントークン）と、それを一覧する静的カタログサイト。部品とトークンは Figma ファイル `o3HtOq4eypxEOpLHB2DgQr` の定義を実装したもの。

作業の前に README.md の該当する章（ディレクトリ構成・依存のルール・コンポーネントの追加手順・テスト・デザイントークン）を読む。このファイルには README に無いことだけを書いている。

コードのコメント・JSDoc・テスト名・画面の文言は日本語で書く。

## 作業の進め方

- 次の場合は、勝手に決めずに、進める前に確認する
  - 迷ったとき
  - Figma と違う点や、Figma で決まっていない点
  - トークンに無い値が必要なとき（近いトークンに丸めたり、新しいトークンを足したりしない）
- 新しい部品を作るときは、役割や形が近い既存の部品を先に読み、書き方をそろえる（例: 選択肢を持つ部品なら Tabs・RadioGroup、開閉する部品なら Accordion・Modal）
- 事前に確認できなかったものは、作業の報告の最後に「確認してほしいところ」として必ず挙げる。途中で決めた仮の判断もここに書く

## 確認のコマンド

作業の区切りごとに `npm run test:run`・`npm run lint`・`npm run typecheck` を実行し、すべて通してから終える。

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

## CSS の制約（`tokens.test.ts` が全 CSS を検査）

- 色は直書き（`#hex`・`rgb()`・`hsl()`）しない。部品からはセマンティックカラー（`--color-text-primary` など）を使う
- 文字は `font: var(--font-body-md)` のようにテキストスタイルで指定する。`font-size`・`font-weight`・`line-height`・`font-family` は直書きしない
- `padding`・`margin`・`gap` は `--spacing-*`（`0` は可）、`border-radius` は `--radius-*` を使う
- `box-shadow` は `var(--elevation-1〜3)`・`var(--ds-focus-ring)`・`var(--ds-focus-ring-inset)`・`none` だけ
- 寸法（`width`・`height`・`max-width` など）は検査の対象外。トークンにある大きさ（`--size-16`・`20`・`24`・`32`・`40`・`48`）は `--size-*` を使い、無い大きさは `rem` で書く（例: Tooltip の `max-width: 20rem`）。罫線の太さの `1px`・`2px` は `px` でよい。`--size-*` にある値を `rem` で直書きしない
- メディアクエリは `min-width: 768px` / `1024px`、`max-width: 767px` / `1023px` だけ
- 未定義の変数を参照しない。同じファイル内で定義したローカル変数（例: `--button-*`）は参照してよい

## Figma の文字サイズ

Figma の font-size の変数は PC の値。コードのテキストスタイルは画面幅で大きさが切り替わるので、数値ではなくテキストスタイルの名前（`heading-lg` など）で合わせる。

## テスト

- `globals: false` なので `describe`・`it`・`expect` は `vitest` から import する
- props・操作・キーボード操作・読み上げを確かめる
- jsdom に無い `showModal`・`close`・`scrollTo` は `src/shared/test/setup.ts` で補っている

### 書き方

- `describe` は部品名の下を「描画」「操作」など観点で分ける。`it` は振る舞いを日本語の文で書く（例: `'disabled のときは操作できない'`）
- 操作は `userEvent.setup()` を基本にする。`fireEvent` は userEvent で再現できない場合だけ使う
- 要素は `getByRole` を優先して取る（次に `getByLabelText`・`getByText`）。`getByTestId` は使わない
- 選択肢ごとの確認は、定数を使って `it.each(BUTTON_VARIANTS)` のように書く。選択肢を足したときにテストも自動で増える

```tsx
describe('Button', () => {
  describe('描画', () => {
    it('既定は variant=solid / theme=primary / size=md / type=button', () => {
      render(<Button>保存する</Button>)
      const button = screen.getByRole('button')

      expect(button).toHaveAttribute('data-variant', 'solid')
      expect(button).toHaveAttribute('data-size', 'md')
    })

    it.each(BUTTON_VARIANTS)('variant="%s" を反映する', (variant) => {
      render(<Button variant={variant}>ボタン</Button>)

      expect(screen.getByRole('button')).toHaveAttribute('data-variant', variant)
    })
  })

  describe('操作', () => {
    it('キーボード（Enter / Space）でも onClick を呼ぶ', async () => {
      const user = userEvent.setup()
      // ...
    })
  })
})
```

### 必ず確かめること

- 既定値（props を省いたときの `data-*` 属性など）
- `className` が既存のクラスに追加されること、HTML の属性と `ref` がそのまま渡ること
- disabled のときに操作できないこと
- キーボード操作（Enter・Space・矢印キー・Esc など、その部品で使うもの）
- 読み上げ（アクセシブルネーム、`aria-*` の状態）

## カタログ（`<Name>.catalog.tsx`）

カタログは Figma を見ない利用者向けの説明書として書く。

- バリエーションの見出しは英語で統一する（Variants / Sizes / States / Disabled / Examples など）
- 説明文は1文程度で、1行（本文の最大幅 720px）に収める
- カタログに表示する文章（説明・props の説明）では Figma に触れない。ソースのコメントでは触れてよい
- 別の部品に触れるときは「ボタン」ではなくコンポーネント名（Button など）で書く
- 一覧のカードには `thumbnail` で専用の見本を出し、`ThumbnailLayout`（`direction`・`fill`・`zoom`）で並べる。画面幅の部品は `zoom` で縮める
- hover・active・focus の見本は `ForcePseudoState` で囲む。中の別の部品に状態を移したくない部分は `IgnoreForcedPseudoState` で囲む
- 画面幅の部品の Playground は `definePlayground({ wide: true, … })`

### 説明文と見本

- 部品の説明には、何の部品かに加えて「迷ったら〇〇を使います」と標準の選び方を書く（例: `'ユーザーの操作を受け付けるボタン。迷ったら solid・primary・md を使います。'`）
- バリエーションの説明には、見た目ではなく「いつ使うか」を書く

| 良い例 | 避ける例 |
| --- | --- |
| `'danger は取り消せない操作、warning は確認が必要な操作に使います。'` | `'danger は赤、warning は黄色です。'` |
| `'md が標準です。sm は表やカードの中など狭い場所に限って使います。'` | `'3つの大きさがあります。'` |

- 見本の文言は、実際の画面で使う日本語にする（「保存する」「キャンセル」「削除する」など）。「Button」「テキスト」「ラベル」のような仮の文言にしない（Playground の初期値は除く）

### props の表

- 選択肢の型は定数から作り、手で書き写さない
- 既定値がある props は `defaultValue` を書く
- 表の最後に `...rest` を載せ、どの HTML 要素の属性を受け取るかを書く

```tsx
props: [
  {
    name: 'variant',
    type: BUTTON_VARIANTS.map((v) => `'${v}'`).join(' | '),
    defaultValue: "'solid'",
    description: 'タイプ。強さを表す',
  },
  // ...
  { name: '...rest', type: "ComponentPropsWithRef<'button'>", description: 'その他の button 要素の属性（ref を含む）' },
],
```

### Playground

- `code` で表示するコードには、既定値と同じ props を書かない（利用者がそのまま貼って使える最小の形にする）

```tsx
code: ({ variant, size, label }) => {
  const attributes = [
    variant !== 'solid' && `variant="${variant}"`,
    size !== 'md' && `size="${size}"`,
  ].filter(Boolean)
  return `<Button${attributes.map((a) => ` ${a}`).join('')}>${label}</Button>`
},
```
