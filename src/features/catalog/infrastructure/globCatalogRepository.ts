import { isCatalogEntry } from '../domain/catalogEntry'
import type { CatalogRepository } from '../domain/catalogRepository'
import { createInMemoryCatalogRepository } from './inMemoryCatalogRepository'

/**
 * `import.meta.glob(..., { eager: true })` の結果からリポジトリを作る。
 * glob の対象パスはアプリ側（コンポジションルート）が決めるため、ここではモジュールの中身だけを扱う。
 *
 * @param modules ファイルパス → モジュール のマップ
 * @throws {Error} default export が defineCatalogEntry() の戻り値でないファイルがある場合
 */
export function createGlobCatalogRepository(modules: Record<string, unknown>): CatalogRepository {
  const entries = Object.entries(modules).map(([path, module]) => {
    const entry = (module as { default?: unknown } | undefined)?.default
    if (!isCatalogEntry(entry)) {
      throw new Error(`${path}: default export に defineCatalogEntry() の戻り値を指定してください`)
    }
    return entry
  })
  return createInMemoryCatalogRepository(entries)
}
