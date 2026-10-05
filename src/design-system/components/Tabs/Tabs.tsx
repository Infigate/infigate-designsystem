import { useId, useState, type ComponentPropsWithRef, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import type { IconName } from '../Icon'
import type { TabVariant } from './Tabs.constants'
import { TabsContext, useTabsContext } from './Tabs.context'
import { TabButton } from './Tabs.parts'
import styles from './Tabs.module.css'

export type TabsProps = Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'onChange'> & {
  /** 見た目（Figma: Style） */
  variant?: TabVariant
  /** 選択中のタブ（外から決めるとき） */
  value?: string
  /** 最初に選択しておくタブ */
  defaultValue?: string
  /** タブを切り替えたとき */
  onValueChange?: (value: string) => void
  /** TabList と TabPanel */
  children: ReactNode
}

/**
 * 同じ画面の中身を切り替えるタブ（Figma: tabs）。ページの移動には使わない。
 * TabList の中に Tab を並べ、同じ value の TabPanel を対応させる。
 */
export function Tabs({ variant = 'outline', value, defaultValue, onValueChange, children, ...rest }: TabsProps) {
  const [innerValue, setInnerValue] = useState(defaultValue)
  const baseId = useId()
  const current = value ?? innerValue
  const toId = (kind: string, tabValue: string) => `${baseId}-${kind}-${tabValue.replace(/\s+/g, '-')}`

  const select = (next: string) => {
    if (value === undefined) setInnerValue(next)
    if (next !== current) onValueChange?.(next)
  }

  return (
    <TabsContext.Provider
      value={{
        variant,
        value: current,
        select,
        tabId: (tabValue) => toId('tab', tabValue),
        panelId: (tabValue) => toId('panel', tabValue),
      }}
    >
      <div {...rest}>{children}</div>
    </TabsContext.Provider>
  )
}

export type TabListProps = ComponentPropsWithRef<'div'> & {
  /** タブ（Tab） */
  children: ReactNode
}

/**
 * タブの並び。下の細い線が土台で、選択中のタブだけ色が乗る。
 * ← → でタブを移って切り替え、Home・End で端のタブへ移る。入りきらないときは横にスクロールする。
 */
export function TabList({ className, children, onKeyDown, ...rest }: TabListProps) {
  const { variant } = useTabsContext('TabList')

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'))
    const index = tabs.indexOf(document.activeElement as HTMLButtonElement)
    if (index === -1) return

    const next = {
      ArrowRight: tabs[(index + 1) % tabs.length],
      ArrowLeft: tabs[(index - 1 + tabs.length) % tabs.length],
      Home: tabs[0],
      End: tabs[tabs.length - 1],
    }[event.key]
    if (!next) return

    event.preventDefault()
    next.focus()
    next.click()
  }

  return (
    <div className={cx(styles.listFrame, className)} data-variant={variant}>
      <div {...rest} role="tablist" className={styles.list} data-variant={variant} onKeyDown={handleKeyDown}>
        {children}
      </div>
    </div>
  )
}

export type TabProps = Omit<ComponentPropsWithRef<'button'>, 'value'> & {
  /** タブの値。同じ value の TabPanel を表示する */
  value: string
  /** 文字の左に置くアイコン */
  icon?: IconName
}

/** タブの1項目（Figma: tab-item） */
export function Tab({ value, icon, onClick, ...rest }: TabProps) {
  const { variant, value: current, select, tabId, panelId } = useTabsContext('Tab')
  const selected = current === value

  return (
    <TabButton
      {...rest}
      id={tabId(value)}
      role="tab"
      aria-selected={selected}
      aria-controls={panelId(value)}
      tabIndex={selected ? 0 : -1}
      variant={variant}
      selected={selected}
      icon={icon}
      onClick={(event) => {
        onClick?.(event)
        select(value)
      }}
    />
  )
}

export type TabPanelProps = ComponentPropsWithRef<'div'> & {
  /** 対応するタブの value */
  value: string
}

/** タブで切り替える中身。選択中でないものは隠す（中の入力内容などは残る） */
export function TabPanel({ value, className, ...rest }: TabPanelProps) {
  const { value: current, tabId, panelId } = useTabsContext('TabPanel')

  return (
    <div
      {...rest}
      id={panelId(value)}
      role="tabpanel"
      aria-labelledby={tabId(value)}
      tabIndex={0}
      hidden={current !== value}
      className={cx(styles.panel, className)}
    />
  )
}
