import { useId, useState, type MouseEvent } from 'react'
import { Link, Outlet, ScrollRestoration } from 'react-router'
import { Icon } from '@/design-system'
import { CatalogNav, catalogPaths } from '@/features/catalog'
import { FoundationNav } from '@/features/foundations'
import styles from './AppLayout.module.css'

/** サイト全体の枠（ヘッダー・サイドバー・本文） */
export function AppLayout() {
  // スマートフォン幅では、ナビゲーションを「メニュー」ボタンの中にたたむ（PC 幅では常に表示）
  const [navOpen, setNavOpen] = useState(false)
  const navId = useId()

  // ナビゲーションのリンクを押したら、ページを移るのでたたむ
  const closeOnLinkClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as Element).closest('a')) setNavOpen(false)
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to={catalogPaths.list()} className={styles.brand}>
          Infigate Design System
        </Link>
      </header>
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <button
            type="button"
            className={styles.navToggle}
            aria-expanded={navOpen}
            aria-controls={navId}
            onClick={() => setNavOpen((open) => !open)}
          >
            メニュー
            <Icon name="chevron-down" size={20} className={styles.navToggleIcon} />
          </button>
          <div id={navId} className={styles.navs} data-open={navOpen || undefined} onClick={closeOnLinkClick}>
            <FoundationNav />
            <CatalogNav />
          </div>
        </aside>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
      <ScrollRestoration />
    </div>
  )
}
