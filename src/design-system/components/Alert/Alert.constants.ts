// Fast Refresh を効かせるため、コンポーネント以外の export は Alert.tsx から分離している

/**
 * 状態（Figma: Status）
 * success: 完了・成功 / error: エラー / warning: 注意 / info: お知らせ
 */
export const ALERT_STATUSES = ['success', 'error', 'warning', 'info'] as const

export type AlertStatus = (typeof ALERT_STATUSES)[number]
