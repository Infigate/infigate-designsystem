import { NavLink } from 'react-router'
import { cx } from '@/shared/lib/cx'
import { groupEntriesByCategory } from '../../../application/groupEntriesByCategory'
import { useCatalogRepository } from '../../catalogContext'
import { catalogPaths } from '../../paths'
import styles from './CatalogNav.module.css'

const linkClassName = ({ isActive }: { isActive: boolean }) => cx(styles.link, isActive && styles.active)

/** サイドバーのナビゲーション。カテゴリごとにコンポーネントへのリンクを並べる */
export function CatalogNav() {
  const groups = groupEntriesByCategory(useCatalogRepository().findAll())

  return (
    <nav aria-label="コンポーネント" className={styles.nav}>
      <NavLink to={catalogPaths.list()} end className={linkClassName}>
        すべてのコンポーネント
      </NavLink>
      {groups.map(({ category, entries }) => {
        const labelId = `catalog-nav-${category.id}`
        return (
          <div key={category.id} className={styles.group}>
            <p id={labelId} className={styles.groupLabel}>
              {category.label}
            </p>
            <ul aria-labelledby={labelId} className={styles.list}>
              {entries.map((entry) => (
                <li key={entry.slug}>
                  <NavLink to={catalogPaths.detail(entry.slug)} className={linkClassName}>
                    {entry.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}
