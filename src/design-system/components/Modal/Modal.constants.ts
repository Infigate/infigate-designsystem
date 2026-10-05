// Fast Refresh を効かせるため、コンポーネント以外の export は Modal.tsx から分離している

/**
 * 種類（Figma: Type）
 * standard: 通常の用途 / confirm: 取り消せない操作の確認（警告のアイコンを出し、主ボタンは Button の theme="danger" にする）
 */
export const MODAL_VARIANTS = ['standard', 'confirm'] as const

export type ModalVariant = (typeof MODAL_VARIANTS)[number]

/** 幅（Figma: Size）。sm 400px / md 560px / lg 720px */
export const MODAL_SIZES = ['sm', 'md', 'lg'] as const

export type ModalSize = (typeof MODAL_SIZES)[number]
