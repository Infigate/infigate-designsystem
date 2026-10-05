import type { ComponentPropsWithRef } from 'react'
import { cx } from '@/shared/lib/cx'
import { Icon, type IconName } from '../Icon'
import type { TabVariant } from './Tabs.constants'
import styles from './Tabs.module.css'

export type TabButtonProps = ComponentPropsWithRef<'button'> & {
  variant: TabVariant
  selected: boolean
  icon?: IconName
}

/**
 * タブの1項目の見た目（Figma: tab-item）。
 * Tab の中で使うほか、カタログでは項目の状態の見本にも使う。
 */
export function TabButton({ variant, selected, icon, className, children, ...rest }: TabButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={cx(styles.tab, className)}
      data-variant={variant}
      data-selected={selected || undefined}
    >
      {icon && <Icon name={icon} size={24} />}
      {children}
    </button>
  )
}
