---
paths:
  - "**/*.catalog.tsx"
---

# カタログ（`<Name>.catalog.tsx`）

カタログは Figma を見ない利用者向けの説明書として書く。

- バリエーションの見出しは英語で統一する（Variants / Sizes / States / Disabled / Examples など）
- 説明文は1文程度にする（本文の最大幅 720px で、長くなりすぎないようにする）
- カタログに表示する文章（説明・props の説明）では Figma に触れない。ソースのコメントでは触れてよい
- 別の部品に触れるときは「ボタン」ではなくコンポーネント名（Button など）で書く
- 一覧のカードには `thumbnail` で専用の見本を出し、`ThumbnailLayout`（`direction`・`fill`・`zoom`）で並べる。画面幅の部品は `zoom` で縮める
- hover・active・focus の見本は `ForcePseudoState` で囲む。中の別の部品に状態を移したくない部分は `IgnoreForcedPseudoState` で囲む
- 画面幅の部品の Playground は `definePlayground({ wide: true, … })`

## 説明文と見本

- 部品の説明には、何の部品かに加えて「迷ったら〇〇を使います」と標準の選び方を書く（例: `'ユーザーの操作を受け付けるボタン。迷ったら solid・primary・md を使います。'`）
- バリエーションの説明には、見た目ではなく「いつ使うか」を書く

| 良い例 | 避ける例 |
| --- | --- |
| `'danger は取り消せない操作、warning は確認が必要な操作に使います。'` | `'danger は赤、warning は黄色です。'` |
| `'md が標準です。sm は表やカードの中など狭い場所に限って使います。'` | `'3つの大きさがあります。'` |

- 見本の文言は、実際の画面で使う日本語にする（「保存する」「キャンセル」「削除する」など）。「Button」「テキスト」「ラベル」のような仮の文言にしない（Playground の初期値は除く）

## props の表

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

## Playground

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
