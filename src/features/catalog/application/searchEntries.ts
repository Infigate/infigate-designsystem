import type { CatalogEntry } from '../domain/catalogEntry'
import { getCategory } from '../domain/category'

/** 全角/半角・大文字/小文字の違いを吸収する */
function normalize(text: string): string {
  return text.normalize('NFKC').toLowerCase()
}

/**
 * キーワードでエントリを絞り込む。
 * 空白区切りの全キーワードが「名前・説明・カテゴリ名・バリエーション名」のいずれかに含まれるものを返す（AND 検索）。
 */
export function searchEntries(entries: readonly CatalogEntry[], query: string): readonly CatalogEntry[] {
  const keywords = normalize(query).split(/\s+/).filter(Boolean)
  if (keywords.length === 0) return entries

  return entries.filter((entry) => {
    const haystack = normalize(
      [entry.name, entry.description, getCategory(entry.category).label, ...entry.variants.map((v) => v.name)].join(
        '\n',
      ),
    )
    return keywords.every((keyword) => haystack.includes(keyword))
  })
}
