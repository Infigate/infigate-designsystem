import { RouterProvider } from 'react-router'
import { CatalogProvider } from '@/features/catalog'
import { catalogRepository } from './catalogRepository'
import { router } from './router'

export function App() {
  return (
    <CatalogProvider repository={catalogRepository}>
      <RouterProvider router={router} />
    </CatalogProvider>
  )
}
