import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { catalogRepository } from './catalogRepository'

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
  })
})
