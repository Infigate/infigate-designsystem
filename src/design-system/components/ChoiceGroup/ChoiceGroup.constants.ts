// Fast Refresh を効かせるため、コンポーネント以外の export は ChoiceGroup.tsx から分離している

/** 選択肢の並べ方（Figma: グループの組み方 > 縦・横並び） */
export const CHOICE_GROUP_DIRECTIONS = ['vertical', 'horizontal'] as const

export type ChoiceGroupDirection = (typeof CHOICE_GROUP_DIRECTIONS)[number]
