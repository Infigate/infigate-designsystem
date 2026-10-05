// Fast Refresh を効かせるため、コンポーネント以外の export は Pagination.tsx から分離している

/**
 * 見た目（Figma: Type）
 * default: ページ番号を並べる（総ページ数が多いときは自動で「省略あり」になる） / compact: 前後のボタンと「3 / 20」だけ（スマートフォン向け）
 */
export const PAGINATION_VARIANTS = ['default', 'compact'] as const

export type PaginationVariant = (typeof PAGINATION_VARIANTS)[number]

/** ページ番号を置く枠の数。総ページ数がこれ以下なら全部並べ、超えると両端と現在地の前後だけにして間を「…」にする */
const SLOTS = 7

export type PaginationRangeItem = number | 'ellipsis-start' | 'ellipsis-end'

/**
 * 並べるページ番号を決める（Figma: 標準 / 省略あり）。
 * 省略するときも枠の数は変えず、現在地が動いてもボタンの位置がずれないようにする。
 * 例（全20ページ）: 1ページ目 → 1 2 3 4 5 … 20 / 5ページ目 → 1 … 4 5 6 … 20 / 20ページ目 → 1 … 16 17 18 19 20
 */
export function getPaginationRange(page: number, totalPages: number): PaginationRangeItem[] {
  const pages = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, index) => from + index)

  if (totalPages <= SLOTS) return pages(1, totalPages)
  if (page <= 4) return [...pages(1, 5), 'ellipsis-end', totalPages]
  if (page >= totalPages - 3) return [1, 'ellipsis-start', ...pages(totalPages - 4, totalPages)]
  return [1, 'ellipsis-start', page - 1, page, page + 1, 'ellipsis-end', totalPages]
}
