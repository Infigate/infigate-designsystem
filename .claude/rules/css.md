---
paths:
  - "**/*.css"
---

# CSS の制約（`tokens.test.ts` が全 CSS を検査）

- 色は直書き（`#hex`・`rgb()`・`hsl()`）しない。部品からはセマンティックカラー（`--color-text-primary` など）を使う
- 文字は `font: var(--font-body-md)` のようにテキストスタイルで指定する。`font-size`・`font-weight`・`line-height`・`font-family` は直書きしない
- `padding`・`margin`・`gap` は `--spacing-*`（`0` は可）、`border-radius` は `--radius-*` を使う
- `box-shadow` は `var(--elevation-1〜3)`・`var(--ds-focus-ring)`・`var(--ds-focus-ring-inset)`・`none` だけ
- 寸法（`width`・`height`・`max-width` など）は検査の対象外。トークンにある大きさ（`--size-16`・`20`・`24`・`32`・`40`・`48`）は `--size-*` を使い、無い大きさは `rem` で書く（例: Tooltip の `max-width: 20rem`）。罫線の太さの `1px`・`2px` は `px` でよい。`--size-*` にある値を `rem` で直書きしない
- メディアクエリは `min-width: 768px` / `1024px`、`max-width: 767px` / `1023px` だけ
- 未定義の変数を参照しない。同じファイル内で定義したローカル変数（例: `--button-*`）は参照してよい

