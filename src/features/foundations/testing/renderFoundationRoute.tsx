import { render } from '@testing-library/react'
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router'
import { FoundationNav } from '../presentation/FoundationNav'
import { foundationRoutes } from '../presentation/routes'
import { TokenProvider } from '../presentation/TokenProvider'
import { createRealTokenRepository } from './realTokens'

/** 実際のトークン CSS を使って、基本デザインのページとサイドバーを描画する */
export function renderFoundationRoute(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <>
            <FoundationNav />
            <Outlet />
          </>
        ),
        children: foundationRoutes,
      },
    ],
    { initialEntries: [path] },
  )
  const result = render(
    <TokenProvider repository={createRealTokenRepository()}>
      <RouterProvider router={router} />
    </TokenProvider>,
  )
  return { ...result, router }
}
