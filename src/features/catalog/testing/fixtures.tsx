import { defineCatalogEntry, type CatalogEntry, type CatalogEntryInput } from '../domain/catalogEntry'

/** テスト用のエントリを作る。必要な項目だけ上書きして使う */
export function createTestEntry(overrides: Partial<CatalogEntryInput> = {}): CatalogEntry {
  const name = overrides.name ?? 'Sample'
  return defineCatalogEntry({
    name,
    category: 'actions',
    description: `${name} の説明`,
    variants: [{ name: 'Default', render: () => <span>{name} のプレビュー</span> }],
    ...overrides,
  })
}
