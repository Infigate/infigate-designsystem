import type { ComponentPropsWithRef } from 'react'
import { cx } from '@/shared/lib/cx'
import type { HeaderTheme } from './Header.constants'
import styles from './Header.module.css'

export type HeaderNavListProps = ComponentPropsWithRef<'ul'> & {
  /** 下地の色。Header の中では省略し、Header の theme に従う */
  theme?: HeaderTheme
}

/**
 * ナビゲーション項目（HeaderNavItem）を並べるリスト。
 * Header の中で使うほか、カタログでは項目の状態の見本にも使う。
 */
export function HeaderNavList({ theme, className, ...rest }: HeaderNavListProps) {
  return <ul {...rest} className={cx(styles.navList, className)} data-theme={theme} />
}
