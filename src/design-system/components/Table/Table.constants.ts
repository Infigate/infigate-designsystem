// Fast Refresh を効かせるため、コンポーネント以外の export は Table.tsx から分離している

/** 高さ（Figma: Size）。sm: Small（見出し 36px・行 40px） / md: Medium（見出し 52px・行 56px、標準） */
export const TABLE_SIZES = ['sm', 'md'] as const

export type TableSize = (typeof TABLE_SIZES)[number]

/** 文字の寄せ（Figma: Align）。数値は right にそろえる */
export const TABLE_ALIGNS = ['left', 'center', 'right'] as const

export type TableAlign = (typeof TABLE_ALIGNS)[number]

/** 並び替えの状態（Figma: table-sort-icon の Sort）。none は並び替えできるが、今はその列で並んでいない */
export const TABLE_SORTS = ['none', 'asc', 'desc'] as const

export type TableSort = (typeof TABLE_SORTS)[number]
