// Fast Refresh を効かせるため、コンポーネント以外の export は Button.tsx から分離している

/**
 * タイプ（Figma: Type）
 * solid: その画面で一番実行してほしい操作。1画面に1つが原則
 * outline: solid と並べる副次的な操作
 * text: 優先度が低い操作や、表の行など密度が高い場所
 */
export const BUTTON_VARIANTS = ['solid', 'outline', 'text'] as const

/**
 * テーマ（Figma: Theme ＋ button-inverse）
 * primary: 通常の主要操作 / secondary: 中立的な操作（キャンセル・閉じる・戻る）
 * danger: 削除や退会など取り消せない操作 / warning: 取り消せるが確認が必要な操作
 * inverse: 濃い下地の上で使う（outline・text のみ）
 */
export const BUTTON_THEMES = ['primary', 'secondary', 'danger', 'warning', 'inverse'] as const

/** 大きさ（Figma: Size）。lg: Large 48px / md: Medium 40px（標準） / sm: Small 32px */
export const BUTTON_SIZES = ['sm', 'md', 'lg'] as const

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number]
export type ButtonTheme = (typeof BUTTON_THEMES)[number]
export type ButtonSize = (typeof BUTTON_SIZES)[number]

/** ボタンの大きさごとのアイコンの大きさ（px） */
export const BUTTON_ICON_SIZES = { sm: 16, md: 20, lg: 20 } as const satisfies Record<ButtonSize, 16 | 20>
