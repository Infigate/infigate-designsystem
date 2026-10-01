import { SideNav, SideNavGroup, SideNavItem, SideNavLink } from '@/shared/ui/SideNav/SideNav'
import { groupEntriesByCategory } from '../../../application/groupEntriesByCategory'
import { useCatalogRepository } from '../../catalogContext'
import { catalogPaths } from '../../paths'

/** サイドバーのナビゲーション。カテゴリごとにコンポーネントへのリンクを並べる */
export function CatalogNav() {
  const groups = groupEntriesByCategory(useCatalogRepository().findAll())

  return (
    <SideNav label="コンポーネント">
      <SideNavLink to={catalogPaths.list()} end>
        すべてのコンポーネント
      </SideNavLink>
      {groups.map(({ category, entries }) => (
        <SideNavGroup key={category.id} id={`catalog-nav-${category.id}`} label={category.label}>
          {entries.map((entry) => (
            <SideNavItem key={entry.slug} to={catalogPaths.detail(entry.slug)}>
              {entry.name}
            </SideNavItem>
          ))}
        </SideNavGroup>
      ))}
    </SideNav>
  )
}
