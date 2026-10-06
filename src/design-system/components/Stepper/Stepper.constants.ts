// Fast Refresh を効かせるため、コンポーネント以外の export は Stepper.tsx から分離している

/** 並べ方（Figma: Layout）。horizontal: 横並び / vertical: 縦並び */
export const STEPPER_ORIENTATIONS = ['horizontal', 'vertical'] as const

export type StepperOrientation = (typeof STEPPER_ORIENTATIONS)[number]

/** 大きさ（Figma: Size）。lg: 主要な画面 / sm: 幅や高さが限られる場所 */
export const STEPPER_SIZES = ['lg', 'sm'] as const

export type StepperSize = (typeof STEPPER_SIZES)[number]

/** ステップの状態（Figma: step-circle の State）。done: 済み / current: 今 / todo: まだ */
export type StepStatus = 'done' | 'current' | 'todo'
