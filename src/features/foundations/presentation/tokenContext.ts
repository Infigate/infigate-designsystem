import { createContext, useContext } from 'react'
import type { TokenRepository } from '../domain/tokenRepository'

export const TokenRepositoryContext = createContext<TokenRepository | null>(null)

export function useTokenRepository(): TokenRepository {
  const repository = useContext(TokenRepositoryContext)
  if (!repository) {
    throw new Error('useTokenRepository は <TokenProvider> の内側で使用してください')
  }
  return repository
}
