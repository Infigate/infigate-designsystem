/**
 * 基本デザイン（トークンの一覧ページ）機能の公開API。
 * feature の外からは必ず `@/features/foundations` を import し、内部ファイルを直接参照しないこと（oxlint で検査）。
 */

// domain
export type { DesignToken, ScreenModeId } from './domain/designToken'
export type { TokenRepository } from './domain/tokenRepository'

// infrastructure: アプリ側（コンポジションルート）がリポジトリを組み立てるのに使う
export { createCssTokenRepository } from './infrastructure/cssTokenRepository'

// presentation: アプリ側が画面に組み込むのに使う
export { FoundationNav } from './presentation/FoundationNav'
export { foundationPaths } from './presentation/paths'
export { foundationRoutes } from './presentation/routes'
export { TokenProvider } from './presentation/TokenProvider'
