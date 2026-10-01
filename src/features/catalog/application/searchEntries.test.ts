import { describe, expect, it } from 'vitest'
import { createTestEntry } from '../testing/fixtures'
import { searchEntries } from './searchEntries'

const button = createTestEntry({
  name: 'Button',
  category: 'actions',
  description: '操作を実行する',
  variants: [
    { name: 'Primary', render: () => null },
    { name: 'Loading', render: () => null },
  ],
})
const textField = createTestEntry({
  name: 'TextField',
  category: 'inputs',
  description: '1行のテキストを入力する',
})
const entries = [button, textField]

describe('searchEntries', () => {
  it.each(['', '   ', '　'])('空のクエリ "%s" なら全件を返す', (query) => {
    expect(searchEntries(entries, query)).toBe(entries)
  })

  it('名前の大文字・小文字を区別しない', () => {
    expect(searchEntries(entries, 'button')).toEqual([button])
  })

  it('全角英字でも一致する', () => {
    expect(searchEntries(entries, 'ＢＵＴＴＯＮ')).toEqual([button])
  })

  it('説明文で一致する', () => {
    expect(searchEntries(entries, 'テキスト')).toEqual([textField])
  })

  it('カテゴリ名で一致する', () => {
    expect(searchEntries(entries, '入力')).toEqual([textField])
  })

  it('バリエーション名で一致する', () => {
    expect(searchEntries(entries, 'loading')).toEqual([button])
  })

  it('空白区切りは AND 条件として扱う', () => {
    expect(searchEntries(entries, 'button 操作')).toEqual([button])
    expect(searchEntries(entries, 'button テキスト')).toEqual([])
  })

  it('一致しなければ空配列を返す', () => {
    expect(searchEntries(entries, 'modal')).toEqual([])
  })
})
