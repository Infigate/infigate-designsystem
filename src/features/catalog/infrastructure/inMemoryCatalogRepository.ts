import type { CatalogEntry } from '../domain/catalogEntry'
import type { CatalogRepository } from '../domain/catalogRepository'

/**
 * 与えられたエントリをメモリ上に保持するリポジトリ。
 * @throws {Error} slug が重複している場合（URL が衝突するため）
 */
export function createInMemoryCatalogRepository(entries: readonly CatalogEntry[]): CatalogRepository {
  const bySlug = new Map<string, CatalogEntry>()
  for (const entry of entries) {
    const existing = bySlug.get(entry.slug)
    if (existing) {
      throw new Error(`slug「${entry.slug}」が重複しています（${existing.name} / ${entry.name}）`)
    }
    bySlug.set(entry.slug, entry)
  }

  const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name))

  return {
    findAll: () => sorted,
    findBySlug: (slug) => bySlug.get(slug),
  }
}
