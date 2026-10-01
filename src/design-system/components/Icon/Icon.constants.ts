// Fast Refresh を効かせるため、コンポーネント以外の export は Icon.tsx から分離している
import { ICONS } from './icons.generated'

/** 登録されているアイコンの名前（Figma の icon/名前 と同じ。Lucide の名前に揃えている） */
export type IconName = keyof typeof ICONS

/** 塗り（Filled）の版を持つアイコンの名前 */
export type FilledIconName = {
  [K in IconName]: (typeof ICONS)[K] extends { readonly filled: unknown } ? K : never
}[IconName]

export const ICON_NAMES = Object.keys(ICONS) as IconName[]
export const FILLED_ICON_NAMES = ICON_NAMES.filter((name): name is FilledIconName => 'filled' in ICONS[name])

/** 16: 小さいボタン・表の中 / 20: 通常のボタン・フォーム / 24: 単体・ナビゲーション */
export const ICON_SIZES = [16, 20, 24] as const
export type IconSize = (typeof ICON_SIZES)[number]

/** 基本は線（line）。塗り（filled）は状態そのものを伝える場面（アラート・トースト）に限る */
export const ICON_VARIANTS = ['line', 'filled'] as const
export type IconVariant = (typeof ICON_VARIANTS)[number]
