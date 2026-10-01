// Fast Refresh を効かせるため、コンポーネント以外の export は TextInput.tsx から分離している

/** 大きさ（Figma: Size）。lg: Large 48px / md: Medium 40px（標準） / sm: Small 32px。Button と同じ高さ */
export const TEXT_INPUT_SIZES = ['sm', 'md', 'lg'] as const

export type TextInputSize = (typeof TEXT_INPUT_SIZES)[number]
