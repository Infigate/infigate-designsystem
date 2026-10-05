// Fast Refresh を効かせるため、コンポーネント以外の export は Menu.tsx から分離している

/** メニューの横の位置。end: ボタンと右端をそろえる（標準。表の行末など右端に置くボタン向け） / start: 左端をそろえる */
export const MENU_ALIGNS = ['start', 'end'] as const

export type MenuAlign = (typeof MENU_ALIGNS)[number]
