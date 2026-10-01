import { describe, expect, it } from 'vitest'
import { createTestEntry } from '../testing/fixtures'
import { groupEntriesByCategory } from './groupEntriesByCategory'

describe('groupEntriesByCategory', () => {
  it('カテゴリ定義順にグループ化し、グループ内は名前順に並べる', () => {
    const textField = createTestEntry({ name: 'TextField', category: 'inputs' })
    const iconButton = createTestEntry({ name: 'IconButton', category: 'actions' })
    const button = createTestEntry({ name: 'Button', category: 'actions' })

    const groups = groupEntriesByCategory([textField, iconButton, button])

    expect(groups.map((g) => g.category.id)).toEqual(['actions', 'inputs'])
    expect(groups[0].entries).toEqual([button, iconButton])
    expect(groups[1].entries).toEqual([textField])
  })

  it('エントリのないカテゴリは含めない', () => {
    const groups = groupEntriesByCategory([createTestEntry({ category: 'layout' })])

    expect(groups.map((g) => g.category.id)).toEqual(['layout'])
  })

  it('空配列なら空配列を返す', () => {
    expect(groupEntriesByCategory([])).toEqual([])
  })

  it('入力配列を変更しない', () => {
    const entries = [createTestEntry({ name: 'B' }), createTestEntry({ name: 'A' })]
    const snapshot = [...entries]

    groupEntriesByCategory(entries)

    expect(entries).toEqual(snapshot)
  })
})
