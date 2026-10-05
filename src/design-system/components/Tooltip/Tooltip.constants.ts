// Fast Refresh を効かせるため、コンポーネント以外の export は Tooltip.tsx から分離している

/**
 * 吹き出しを出す位置（Figma: Direction）。対象の上・下・左・右のどこに出すか。
 * 例えば top は対象の上に出て、矢印は下（対象）を向く
 */
export const TOOLTIP_PLACEMENTS = ['top', 'bottom', 'left', 'right'] as const

export type TooltipPlacement = (typeof TOOLTIP_PLACEMENTS)[number]
