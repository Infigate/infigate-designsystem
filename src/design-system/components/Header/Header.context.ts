import { createContext } from 'react'

/** ナビゲーション項目から、開いているモバイルのメニューを閉じるための窓口 */
export const HeaderMenuContext = createContext<{ closeMenu: () => void } | null>(null)
