import { RouterProvider } from 'react-router'
import { CatalogProvider } from '@/features/catalog'
import { TokenProvider } from '@/features/foundations'
import { catalogRepository } from './catalogRepository'
import { router } from './router'
import { tokenRepository } from './tokenRepository'

export function App() {
  return (
    <TokenProvider repository={tokenRepository}>
      <CatalogProvider repository={catalogRepository}>
        <RouterProvider router={router} />
      </CatalogProvider>
    </TokenProvider>
  )
}
