// Fast Refresh を効かせるため、コンポーネント以外の export は Spinner.tsx から分離している

/** 大きさ（Figma: Size）。sm 16px: ボタンの中 / md 24px: 画面の一部 / lg 40px: 画面全体 */
export const SPINNER_SIZES = ['sm', 'md', 'lg'] as const

export type SpinnerSize = (typeof SPINNER_SIZES)[number]

/** 色（Figma: Tone）。brand: 白い下地の上 / inverse: 濃い下地の上 */
export const SPINNER_TONES = ['brand', 'inverse'] as const

export type SpinnerTone = (typeof SPINNER_TONES)[number]
