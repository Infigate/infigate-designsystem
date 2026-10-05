// Fast Refresh を効かせるため、コンポーネント以外の export は IconButton.tsx から分離している

/** 大きさ（Figma: Size）。sm: Small 32px（アイコン 20px） / md: Medium 40px（アイコン 24px、標準）。Button と同じ高さ */
export const ICON_BUTTON_SIZES = ['sm', 'md'] as const

export type IconButtonSize = (typeof ICON_BUTTON_SIZES)[number]

/** 大きさごとのアイコンの大きさ（px） */
export const ICON_BUTTON_ICON_SIZES = { sm: 20, md: 24 } as const satisfies Record<IconButtonSize, 20 | 24>
