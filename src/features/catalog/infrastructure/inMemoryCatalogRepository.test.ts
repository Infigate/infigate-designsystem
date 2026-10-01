import { describe, expect, it } from 'vitest'
import { createTestEntry } from '../testing/fixtures'
import { createInMemoryCatalogRepository } from './inMemoryCatalogRepository'

describe('createInMemoryCatalogRepository', () => {
  const button = createTestEntry({ name: 'Button' })
  const alert = createTestEntry({ name: 'Alert', category: 'feedback' })

  it('findAll は名前順で返す', () => {
    const repository = createInMemoryCatalogRepository([button, alert])

    expect(repository.findAll()).toEqual([alert, button])
  })

  it('findBySlug で該当エントリを返す', () => {
    const repository = createInMemoryCatalogRepository([button, alert])

    expect(repository.findBySlug('button')).toBe(button)
  })

  it('findBySlug で該当がなければ undefined を返す', () => {
    const repository = createInMemoryCatalogRepository([button])

    expect(repository.findBySlug('missing')).toBeUndefined()
  })

  it('slug が重複していれば作成時にエラーにする', () => {
    const duplicated = createTestEntry({ name: 'Button', category: 'inputs' })

    expect(() => createInMemoryCatalogRepository([button, duplicated])).toThrow(/slug「button」が重複/)
  })
})
