import { SideNav, SideNavGroup, SideNavItem } from '@/shared/ui/SideNav/SideNav'
import { FOUNDATION_PAGES } from './foundationPages'
import { foundationPaths } from './paths'

/** サイドバーの「基本デザイン」グループ */
export function FoundationNav() {
  return (
    <SideNav label="基本デザイン">
      <SideNavGroup id="foundation-nav" label="基本デザイン">
        {FOUNDATION_PAGES.map((page) => (
          <SideNavItem key={page.slug} to={foundationPaths.page(page.slug)}>
            {page.title}
          </SideNavItem>
        ))}
      </SideNavGroup>
    </SideNav>
  )
}
