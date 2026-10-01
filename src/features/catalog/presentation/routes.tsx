import type { RouteObject } from 'react-router'
import { ComponentDetailPage } from './pages/ComponentDetailPage/ComponentDetailPage'
import { ComponentListPage } from './pages/ComponentListPage/ComponentListPage'

/** カタログ機能が持つルート。アプリ側のレイアウト配下にそのまま差し込む */
export const catalogRoutes: RouteObject[] = [
  { index: true, element: <ComponentListPage /> },
  { path: 'components/:slug', element: <ComponentDetailPage /> },
]
