import { describe, expect, it } from 'vitest'
import { createTestEntry } from '../testing/fixtures'
import { createGlobCatalogRepository } from './globCatalogRepository'

describe('createGlobCatalogRepository', () => {
  it('各モジュールの default export をエントリとして読み込む', () => {
    const button = createTestEntry({ name: 'Button' })
    const alert = createTestEntry({ name: 'Alert' })

    const repository = createGlobCatalogRepository({
      '/src/Button.catalog.tsx': { default: button },
      '/src/Alert.catalog.tsx': { default: alert },
    })

    expect(repository.findAll()).toEqual([alert, button])
  })

  it('モジュールがなければ空のリポジトリになる', () => {
    expect(createGlobCatalogRepository({}).findAll()).toEqual([])
  })

  it.each([
    ['default export がない', {}],
    ['default export が CatalogEntry でない', { default: { name: 'Button' } }],
  ])('%s場合はファイルパス付きでエラーにする', (_label, module) => {
    expect(() => createGlobCatalogRepository({ '/src/Broken.catalog.tsx': module })).toThrow(
      '/src/Broken.catalog.tsx: default export に defineCatalogEntry() の戻り値を指定してください',
    )
  })
})
