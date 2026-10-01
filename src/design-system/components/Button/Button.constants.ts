// Fast Refresh を効かせるため、コンポーネント以外の export は Button.tsx から分離している
export const BUTTON_VARIANTS = ['primary', 'secondary', 'ghost', 'danger'] as const
export const BUTTON_SIZES = ['sm', 'md', 'lg'] as const

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number]
export type ButtonSize = (typeof BUTTON_SIZES)[number]
