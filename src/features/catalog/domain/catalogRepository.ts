import type { CatalogEntry } from './catalogEntry'

/**
 * カタログエントリの取得口。
 * 実装（どこから集めるか）は infrastructure 層が持ち、presentation 層はこの型にだけ依存する。
 */
export type CatalogRepository = {
  /** 全エントリを名前順で返す */
  findAll(): readonly CatalogEntry[]
  findBySlug(slug: string): CatalogEntry | undefined
}
