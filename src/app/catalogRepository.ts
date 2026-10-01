import { createGlobCatalogRepository } from '@/features/catalog'

/**
 * デザインシステム配下の *.catalog.tsx をビルド時に収集する。
 * コンポーネントのディレクトリに *.catalog.tsx を置くだけでカタログに掲載される。
 */
export const catalogRepository = createGlobCatalogRepository(
  import.meta.glob('/src/design-system/components/**/*.catalog.tsx', { eager: true }),
)
