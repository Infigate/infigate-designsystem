// Fast Refresh を効かせるため、コンポーネント以外の export は Avatar.tsx から分離している

/** 大きさ（px）。24: 表の行内 / 32: ヘッダー / 40: 一覧 / 64: プロフィール */
export const AVATAR_SIZES = [24, 32, 40, 64] as const

export type AvatarSize = (typeof AVATAR_SIZES)[number]
