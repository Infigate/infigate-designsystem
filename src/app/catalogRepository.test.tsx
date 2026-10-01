import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { CatalogPlayground, PlaygroundValues } from '@/features/catalog'
import { catalogRepository } from './catalogRepository'

/** 初期値と、各項目を1つずつ切り替えた値（select は全選択肢、boolean は反転。ほかは初期値のまま） */
function playgroundCases(playground: CatalogPlayground): [string, PlaygroundValues][] {
  const initial: PlaygroundValues = Object.fromEntries(playground.controls.map((c) => [c.name, c.defaultValue]))
  const cases: [string, PlaygroundValues][] = [['初期値', initial]]
  for (const control of playground.controls) {
    if (control.type === 'select') {
      for (const option of control.options) {
        if (option !== control.defaultValue) cases.push([`${control.name}=${option}`, { ...initial, [control.name]: option }])
      }
    } else if (control.type === 'boolean') {
      cases.push([`${control.name}=${String(!control.defaultValue)}`, { ...initial, [control.name]: !control.defaultValue }])
    }
  }
  return cases
}

/**
 * 実際に登録されている全 *.catalog.tsx を検査する。
 * コンポーネントを追加すると自動的にテスト対象になる。
 */
describe('登録済みのカタログ定義', () => {
  const entries = catalogRepository.findAll()

  it('1件以上読み込まれている', () => {
    expect(entries.length).toBeGreaterThan(0)
  })

  describe.each(entries.map((entry) => [entry.name, entry] as const))('%s', (_name, entry) => {
    it.each(entry.variants.map((variant) => [variant.name, variant] as const))(
      'バリエーション「%s」がエラーなく描画できる',
      (_variantName, variant) => {
        const Preview = variant.render
        const { container } = render(<Preview />)

        expect(container).not.toBeEmptyDOMElement()
      },
    )

    const playground = entry.playground
    if (playground) {
      it.each(playgroundCases(playground))('Playground（%s）がエラーなく描画でき、コード例を作れる', (_label, values) => {
        const { container } = render(<>{playground.render(values)}</>)

        expect(container).not.toBeEmptyDOMElement()
        if (playground.code) expect(playground.code(values)).not.toBe('')
      })
    }
  })
})
