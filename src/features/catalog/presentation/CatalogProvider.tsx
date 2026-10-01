import type { ReactNode } from 'react'
import type { CatalogRepository } from '../domain/catalogRepository'
import { CatalogRepositoryContext } from './catalogContext'

type CatalogProviderProps = {
  repository: CatalogRepository
  children: ReactNode
}

/** カタログ画面にリポジトリを注入する。テストではインメモリ実装を渡す */
export function CatalogProvider({ repository, children }: CatalogProviderProps) {
  return <CatalogRepositoryContext value={repository}>{children}</CatalogRepositoryContext>
}
