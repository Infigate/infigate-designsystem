// Fast Refresh を効かせるため、コンポーネント以外の export は Card.tsx から分離している

/** 見た目（Figma: Style）。outline: 枠線で区切る / elevated: 影で浮かせる */
export const CARD_VARIANTS = ['outline', 'elevated'] as const

export type CardVariant = (typeof CARD_VARIANTS)[number]
