/**
 * コンポーネントの分類。配列の順序がそのままカタログ上の表示順になる。
 */
export const CATEGORIES = [
  { id: 'actions', label: 'アクション' },
  { id: 'inputs', label: '入力' },
  { id: 'data-display', label: 'データ表示' },
  { id: 'feedback', label: 'フィードバック' },
  { id: 'navigation', label: 'ナビゲーション' },
  { id: 'layout', label: 'レイアウト' },
] as const satisfies readonly { id: string; label: string }[]

export type Category = (typeof CATEGORIES)[number]
export type CategoryId = Category['id']

const categoryById = new Map<string, Category>(CATEGORIES.map((c) => [c.id, c]))

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === 'string' && categoryById.has(value)
}

export function getCategory(id: CategoryId): Category {
  // CategoryId 型が保証しているため undefined にはならない
  return categoryById.get(id)!
}
