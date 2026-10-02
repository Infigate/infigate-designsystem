// Fast Refresh を効かせるため、コンポーネント以外の export は Badge.tsx から分離している

/**
 * 状態（Figma: Status）
 * neutral: 下書きなど、特に意味を持たない状態 / success: 公開中・完了 / error: エラー・失敗
 * warning: 要確認・期限間近 / info: お知らせ・新着
 */
export const BADGE_STATUSES = ['neutral', 'success', 'error', 'warning', 'info'] as const

/**
 * 見た目（Figma: Style）。強調したい度合いで選ぶ
 * solid: いちばん目立つ。特に注意を引きたい1つだけに使う
 * subtle: 標準。一覧にたくさん並べてもうるさくならない
 * outline: いちばん控えめ。情報として添えるだけのとき。
 *          また、色の付いた面の上（アラートの中や選択中の行）では、塗りが重ならないよう強調の度合いにかかわらず outline にする
 */
// 強い順に並べる（カタログの表や Playground もこの順で出る）
export const BADGE_VARIANTS = ['solid', 'subtle', 'outline'] as const

export type BadgeStatus = (typeof BADGE_STATUSES)[number]
export type BadgeVariant = (typeof BADGE_VARIANTS)[number]
