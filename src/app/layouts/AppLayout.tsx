import { Link, Outlet, ScrollRestoration } from 'react-router'
import { CatalogNav, catalogPaths } from '@/features/catalog'
import styles from './AppLayout.module.css'

/** サイト全体の枠（ヘッダー・サイドバー・本文） */
export function AppLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to={catalogPaths.list()} className={styles.brand}>
          Infigate Design System
        </Link>
      </header>
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <CatalogNav />
        </aside>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
      <ScrollRestoration />
    </div>
  )
}
