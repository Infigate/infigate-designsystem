import { createContext, useContext } from 'react'

/** Menu が、中の MenuItem に渡す操作 */
export type MenuContextValue = {
  /** メニューを閉じ、開いたボタンにフォーカスを戻す */
  close: () => void
}

/** Menu の外（カタログの見本など）では、項目を押しても何もしない */
export const MenuContext = createContext<MenuContextValue>({ close: () => {} })

export const useMenu = () => useContext(MenuContext)
