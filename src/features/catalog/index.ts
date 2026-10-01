/**
 * カタログ機能の公開API。
 * feature の外からは必ず `@/features/catalog` を import し、内部ファイルを直接参照しないこと（oxlint で検査）。
 */

// domain: カタログ定義を書く側（*.catalog.tsx）が使う
export { defineCatalogEntry, InvalidCatalogEntryError } from './domain/catalogEntry'
export type { CatalogEntry, CatalogEntryInput, CatalogVariant, PropDoc } from './domain/catalogEntry'
export { CATEGORIES } from './domain/category'
export type { Category, CategoryId } from './domain/category'
export type { CatalogRepository } from './domain/catalogRepository'

// infrastructure: アプリ側（コンポジションルート）がリポジトリを組み立てるのに使う
export { createGlobCatalogRepository } from './infrastructure/globCatalogRepository'
export { createInMemoryCatalogRepository } from './infrastructure/inMemoryCatalogRepository'

// presentation: アプリ側が画面に組み込むのに使う
export { CatalogProvider } from './presentation/CatalogProvider'
export { CatalogNav } from './presentation/components/CatalogNav/CatalogNav'
export { catalogPaths } from './presentation/paths'
export { catalogRoutes } from './presentation/routes'
