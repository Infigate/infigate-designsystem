import { createCssTokenRepository } from '@/features/foundations'

/**
 * デザイントークンの CSS をビルド時に文字列として取り込み、基本デザインのページに渡す。
 * 表示する値は CSS から読み取るため、トークンを変えればページにもそのまま反映される。
 */
export const tokenRepository = createCssTokenRepository(
  import.meta.glob<string>('/src/design-system/tokens/*.css', { query: '?raw', import: 'default', eager: true }),
)
