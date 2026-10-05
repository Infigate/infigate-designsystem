// Fast Refresh を効かせるため、コンポーネント以外の export は Footer.tsx から分離している

/**
 * 下地の色（Figma: Theme）
 * light: 薄いグレーの面 / dark: 濃い面（ロゴは白のモノクロにする）
 */
export const FOOTER_THEMES = ['light', 'dark'] as const

export type FooterTheme = (typeof FOOTER_THEMES)[number]
