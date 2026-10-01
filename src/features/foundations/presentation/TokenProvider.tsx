import type { ReactNode } from 'react'
import type { TokenRepository } from '../domain/tokenRepository'
import { TokenRepositoryContext } from './tokenContext'

type TokenProviderProps = {
  repository: TokenRepository
  children: ReactNode
}

/** 基本デザインの画面にトークンのリポジトリを注入する */
export function TokenProvider({ repository, children }: TokenProviderProps) {
  return <TokenRepositoryContext value={repository}>{children}</TokenRepositoryContext>
}
