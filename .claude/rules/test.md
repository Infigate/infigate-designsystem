---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
---

# テスト

- `globals: false` なので `describe`・`it`・`expect` は `vitest` から import する
- props・操作・キーボード操作・読み上げを確かめる
- jsdom に無い `showModal`・`close`・`scrollTo` は `src/shared/test/setup.ts` で補っている

## 書き方

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

## 必ず確かめること

- 既定値（props を省いたときの `data-*` 属性など）
- `className` が既存のクラスに追加されること、HTML の属性と `ref` がそのまま渡ること
- disabled のときに操作できないこと
- キーボード操作（Enter・Space・矢印キー・Esc など、その部品で使うもの）
- 読み上げ（アクセシブルネーム、`aria-*` の状態）

