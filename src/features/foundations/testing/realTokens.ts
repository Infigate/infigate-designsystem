/// <reference types="node" />
import { globSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createCssTokenRepository } from '../infrastructure/cssTokenRepository'

/**
 * テスト用: 実際のトークン CSS（src/design-system/tokens/*.css）を読み込む。
 * Vitest は CSS の import を空にするため、fs で直接読む（実行場所はプロジェクトルート）。
 */
export function readRealTokenFiles(): Record<string, string> {
  const dir = join(process.cwd(), 'src/design-system/tokens')
  return Object.fromEntries(
    globSync('*.css', { cwd: dir }).map((file) => [`/src/design-system/tokens/${file}`, readFileSync(join(dir, file), 'utf8')]),
  )
}

export function createRealTokenRepository() {
  return createCssTokenRepository(readRealTokenFiles())
}
