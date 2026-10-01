import { createHashRouter } from 'react-router'
import { catalogRoutes } from '@/features/catalog'
import { AppLayout } from './layouts/AppLayout'
import { NotFoundPage } from './pages/NotFoundPage'

/**
 * 静的ホスティングでサーバー側のリライト設定なしに動くよう、ハッシュルーティングを使う。
 * （リライトを設定できる環境なら createBrowserRouter に置き換えてよい）
 */
export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [...catalogRoutes, { path: '*', element: <NotFoundPage /> }],
  },
])
