// Fast Refresh を効かせるため、コンポーネント以外の export は Skeleton.tsx から分離している

/** 形（Figma: Shape）。text: 文字1行 / circle: 顔写真やアイコン / rect: 画像や塊 */
export const SKELETON_SHAPES = ['text', 'circle', 'rect'] as const

export type SkeletonShape = (typeof SKELETON_SHAPES)[number]
