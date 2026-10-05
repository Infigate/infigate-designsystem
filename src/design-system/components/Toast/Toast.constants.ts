// Fast Refresh を効かせるため、コンポーネント以外の export は Toast.tsx から分離している

/**
 * 状態（Figma: Status）
 * success: 完了・成功 / error: エラー / warning: 注意 / info: お知らせ
 */
export const TOAST_STATUSES = ['success', 'error', 'warning', 'info'] as const

export type ToastStatus = (typeof TOAST_STATUSES)[number]

/**
 * 見た目（Figma: Style）
 * light: 白い面に色のアイコン / solid: 状態色の塗りに白文字 / dark: 濃い面に白文字
 */
export const TOAST_VARIANTS = ['light', 'solid', 'dark'] as const

export type ToastVariant = (typeof TOAST_VARIANTS)[number]

/** 表示してから自動で消えるまでの時間（ミリ秒） */
export const TOAST_DEFAULT_DURATION = 5000
