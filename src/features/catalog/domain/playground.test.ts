import { describe, expect, it } from 'vitest'
import { createTestEntry } from '../testing/fixtures'
import { InvalidCatalogEntryError } from './catalogEntry'
import { definePlayground, initialPlaygroundValues, validatePlayground, type CatalogPlayground } from './playground'

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'size', options: ['sm', 'md'], defaultValue: 'md' },
    { type: 'boolean', name: 'disabled', defaultValue: false },
    { type: 'text', name: 'label', defaultValue: 'ラベル' },
  ],
  render: ({ size, disabled, label }) => `${size}/${String(disabled)}/${label}`,
})

describe('definePlayground', () => {
  it('render・code の引数に、切り替え項目の定義どおりの型を付ける', () => {
    const typed = definePlayground({
      controls: [
        { type: 'select', name: 'size', options: ['sm', 'md'], defaultValue: 'md' },
        { type: 'boolean', name: 'on', defaultValue: false },
      ],
      render: (values) => {
        const size: 'sm' | 'md' = values.size
        const on: boolean = values.on
        // @ts-expect-error 定義にない項目は参照できない
        void values.missing
        return `${size}/${String(on)}`
      },
    })

    expect(typed.render({ size: 'sm', on: true })).toBe('sm/true')
  })
})

describe('initialPlaygroundValues', () => {
  it('各項目の初期値を返す', () => {
    expect(initialPlaygroundValues(playground)).toEqual({ size: 'md', disabled: false, label: 'ラベル' })
  })
})

describe('validatePlayground', () => {
  const withControls = (controls: CatalogPlayground['controls']): CatalogPlayground => ({ controls, render: () => null })

  it('妥当な定義なら空配列を返す', () => {
    expect(validatePlayground(playground)).toEqual([])
  })

  it('切り替え項目がなくてもよい（試せる見本とコード例だけを出す）', () => {
    expect(validatePlayground(withControls([]))).toEqual([])
  })

  it.each([
    [
      '項目名が重複している',
      withControls([
        { type: 'text', name: 'label', defaultValue: '' },
        { type: 'text', name: 'label', defaultValue: '' },
      ]),
      'playground の control 名「label」が重複しています',
    ],
    [
      '選択肢がない',
      withControls([{ type: 'select', name: 'size', options: [], defaultValue: 'md' }]),
      'playground の「size」に options がありません',
    ],
    [
      '初期値が選択肢にない',
      withControls([{ type: 'select', name: 'size', options: ['sm'], defaultValue: 'xl' }]),
      'playground の「size」の初期値「xl」が options にありません',
    ],
  ])('%s場合は違反とする', (_label, target, problem) => {
    expect(validatePlayground(target)).toEqual([problem])
  })

  it('カタログ定義の検査にも含まれる', () => {
    const invalid = withControls([{ type: 'select', name: 'size', options: [], defaultValue: 'md' }])

    expect(() => createTestEntry({ playground: invalid })).toThrow(InvalidCatalogEntryError)
  })
})
