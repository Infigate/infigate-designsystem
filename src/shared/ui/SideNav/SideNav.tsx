import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { cx } from '@/shared/lib/cx'
import styles from './SideNav.module.css'

/**
 * サイドバーのナビゲーションの共通部品（部品カタログ・基本デザインで共用し、見た目を揃える）。
 *   <SideNav label="コンポーネント">
 *     <SideNavGroup id="nav-actions" label="アクション">
 *       <SideNavItem to="/components/button">Button</SideNavItem>
 *     </SideNavGroup>
 *   </SideNav>
 */
export function SideNav({ label, children }: { label: string; children: ReactNode }) {
  return (
    <nav aria-label={label} className={styles.nav}>
      {children}
    </nav>
  )
}

const linkClassName = ({ isActive }: { isActive: boolean }) => cx(styles.link, isActive && styles.active)

type SideNavLinkProps = {
  to: string
  /** true なら、配下の URL では現在地にしない（トップページへのリンクなど） */
  end?: boolean
  children: ReactNode
}

/** グループに属さないリンク */
export function SideNavLink({ to, end, children }: SideNavLinkProps) {
  return (
    <NavLink to={to} end={end} className={linkClassName}>
      {children}
    </NavLink>
  )
}

type SideNavGroupProps = {
  /** 見出しの id（リストの aria-labelledby に使う） */
  id: string
  label: string
  children: ReactNode
}

export function SideNavGroup({ id, label, children }: SideNavGroupProps) {
  return (
    <div className={styles.group}>
      <p id={id} className={styles.groupLabel}>
        {label}
      </p>
      <ul aria-labelledby={id} className={styles.list}>
        {children}
      </ul>
    </div>
  )
}

export function SideNavItem(props: SideNavLinkProps) {
  return (
    <li>
      <SideNavLink {...props} />
    </li>
  )
}
