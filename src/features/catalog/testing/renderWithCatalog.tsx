import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router'
import type { CatalogEntry } from '../domain/catalogEntry'
import { createInMemoryCatalogRepository } from '../infrastructure/inMemoryCatalogRepository'
import { CatalogProvider } from '../presentation/CatalogProvider'
import { catalogRoutes } from '../presentation/routes'

type Options = {
  entries: readonly CatalogEntry[]
  /** 初期表示する URL（既定: "/"） */
  path?: string
}

function renderRoutes(routes: RouteObject[], { entries, path = '/' }: Options) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const result = render(
    <CatalogProvider repository={createInMemoryCatalogRepository(entries)}>
      <RouterProvider router={router} />
    </CatalogProvider>,
  )
  return { ...result, router }
}

/** カタログのルート一式を、指定 URL・指定エントリで描画する（ページのテスト用） */
export function renderCatalogRoutes(options: Options) {
  return renderRoutes([{ path: '/', children: catalogRoutes }], options)
}

/** 任意の要素を、どの URL でも描画されるルートに置いて描画する（部品のテスト用） */
export function renderWithCatalog(ui: ReactNode, options: Options) {
  return renderRoutes([{ path: '*', element: ui }], options)
}
