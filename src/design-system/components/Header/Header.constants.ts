// Fast Refresh を効かせるため、コンポーネント以外の export は Header.tsx から分離している

/**
 * 下地の色（Figma: Theme）
 * light: 白い下地 / dark: 濃い下地（ロゴは白のモノクロにする）
 */
export const HEADER_THEMES = ['light', 'dark'] as const

export type HeaderTheme = (typeof HEADER_THEMES)[number]
