import { createContext, useContext } from 'react'
import type { CatalogRepository } from '../domain/catalogRepository'

export const CatalogRepositoryContext = createContext<CatalogRepository | null>(null)

export function useCatalogRepository(): CatalogRepository {
  const repository = useContext(CatalogRepositoryContext)
  if (!repository) {
    throw new Error('useCatalogRepository は <CatalogProvider> の内側で使用してください')
  }
  return repository
}
