import { createContext, useContext } from 'react'
import type { TabVariant } from './Tabs.constants'

type TabsContextValue = {
  variant: TabVariant
  /** 選択中のタブの value */
  value: string | undefined
  select: (value: string) => void
  tabId: (value: string) => string
  panelId: (value: string) => string
}

export const TabsContext = createContext<TabsContextValue | null>(null)

export function useTabsContext(component: string): TabsContextValue {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error(`${component} は Tabs の内側で使ってください`)
  }
  return context
}
