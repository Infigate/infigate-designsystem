import { describe, expect, it } from 'vitest'
import {
  defineCatalogEntry,
  InvalidCatalogEntryError,
  isCatalogEntry,
  toSlug,
  validateCatalogEntry,
  type CatalogEntryInput,
} from './catalogEntry'

const validInput = (overrides: Partial<CatalogEntryInput> = {}): CatalogEntryInput => ({
  name: 'Button',
  category: 'actions',
  description: '操作を実行するためのボタン',
  variants: [{ name: 'Primary', render: () => null }],
  ...overrides,
})

describe('toSlug', () => {
  it.each([
    ['Button', 'button'],
    ['TextField', 'text-field'],
    ['IconButton2', 'icon-button2'],
    ['HTMLInput', 'html-input'],
    ['MyHTMLInput', 'my-html-input'],
    ['Button Group', 'button-group'],
    ['  date_picker  ', 'date-picker'],
  ])('"%s" → "%s"', (name, expected) => {
    expect(toSlug(name)).toBe(expected)
  })
})

describe('validateCatalogEntry', () => {
  it('妥当な定義なら空配列を返す', () => {
    expect(validateCatalogEntry(validInput())).toEqual([])
  })

  it('name が空なら違反とする', () => {
    expect(validateCatalogEntry(validInput({ name: '  ' }))).toEqual(['name が空です'])
  })

  it('slug を作れない name は違反とする', () => {
    expect(validateCatalogEntry(validInput({ name: 'ボタン' }))).toEqual([
      'name「ボタン」から有効な slug を作れません（英数字で命名してください）',
    ])
  })

  it('未定義の category は違反とする', () => {
    // 型を回避して外部から不正値が来た場合を再現する
    const input = validInput({ category: 'unknown' as CatalogEntryInput['category'] })

    expect(validateCatalogEntry(input)).toEqual(['category「unknown」は未定義です'])
  })

  it('variants が空なら違反とする', () => {
    expect(validateCatalogEntry(validInput({ variants: [] }))).toEqual([
      'variants を1件以上定義してください',
    ])
  })

  it('variant 名・prop 名の重複を違反とする', () => {
    const problems = validateCatalogEntry(
      validInput({
        variants: [
          { name: 'Primary', render: () => null },
          { name: 'Primary', render: () => null },
        ],
        props: [
          { name: 'size', type: 'string', description: '' },
          { name: 'size', type: 'string', description: '' },
        ],
      }),
    )

    expect(problems).toEqual(['variant 名「Primary」が重複しています', 'prop 名「size」が重複しています'])
  })

  it('複数の違反をまとめて返す', () => {
    expect(validateCatalogEntry(validInput({ name: '', variants: [] }))).toHaveLength(2)
  })
})

describe('defineCatalogEntry', () => {
  it('name から slug を付与し、props 省略時は空配列にする', () => {
    const entry = defineCatalogEntry(validInput({ name: 'TextField' }))

    expect(entry.slug).toBe('text-field')
    expect(entry.props).toEqual([])
  })

  it('違反があれば InvalidCatalogEntryError を投げ、違反内容を保持する', () => {
    const define = () => defineCatalogEntry(validInput({ variants: [] }))

    expect(define).toThrow(InvalidCatalogEntryError)
    expect(define).toThrow(/Button/)
    try {
      define()
    } catch (error) {
      expect((error as InvalidCatalogEntryError).problems).toEqual(['variants を1件以上定義してください'])
    }
  })
})

describe('isCatalogEntry', () => {
  it('defineCatalogEntry の戻り値を受け入れる', () => {
    expect(isCatalogEntry(defineCatalogEntry(validInput()))).toBe(true)
  })

  it.each([
    ['null', null],
    ['文字列', 'Button'],
    ['slug なし', { ...validInput(), props: [] }],
    ['未定義カテゴリ', { ...validInput(), slug: 'button', props: [], category: 'x' }],
  ])('%s は拒否する', (_label, value) => {
    expect(isCatalogEntry(value)).toBe(false)
  })
})
