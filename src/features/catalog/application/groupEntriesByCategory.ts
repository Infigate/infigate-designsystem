import type { CatalogEntry } from '../domain/catalogEntry'
import { CATEGORIES, type Category } from '../domain/category'

export type CategoryGroup = {
  category: Category
  entries: readonly CatalogEntry[]
}

/**
 * エントリをカテゴリごとにまとめる。
 * グループは CATEGORIES の定義順、グループ内は名前順。エントリのないカテゴリは含めない。
 */
export function groupEntriesByCategory(entries: readonly CatalogEntry[]): CategoryGroup[] {
  return CATEGORIES.map((category) => ({
    category,
    entries: entries.filter((e) => e.category === category.id).sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((group) => group.entries.length > 0)
}
