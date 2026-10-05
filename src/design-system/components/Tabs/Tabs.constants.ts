// Fast Refresh を効かせるため、コンポーネント以外の export は Tabs.tsx から分離している

/**
 * 見た目（Figma: Style）
 * outline: 下線タイプ。選択中は下線と文字色で示す / solid: 塗りタイプ。選択中は塗りと白文字で示す
 */
export const TAB_VARIANTS = ['outline', 'solid'] as const

export type TabVariant = (typeof TAB_VARIANTS)[number]
