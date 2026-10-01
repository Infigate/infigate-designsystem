import { resolveTokenValue, SCREEN_MODES, type DesignToken } from '../domain/designToken'
import type { TokenRepository } from '../domain/tokenRepository'

const MODE_BY_MIN_WIDTH = new Map<number, 'tablet' | 'desktop'>([
  [768, 'tablet'],
  [1024, 'desktop'],
])

function declarationsOf(block: string): [string, string][] {
  return [...block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()])
}

/**
 * トークンの CSS ファイル1つ分を読み取る。
 * :root の宣言を基本（Mobile）の値とし、@media (min-width: 768px / 1024px) の中の :root を Tablet・Desktop の値とする。
 * @throws {Error} Figma のブレークポイント以外の @media がある場合
 */
export function parseTokenCss(css: string, source: string): DesignToken[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const responsive = new Map<string, Partial<Record<'tablet' | 'desktop', string>>>()

  const base = withoutComments.replace(
    /@media\s*\(min-width:\s*(\d+)px\)\s*\{\s*:root\s*\{([^}]*)\}\s*\}/g,
    (_match, width: string, block: string) => {
      const mode = MODE_BY_MIN_WIDTH.get(Number(width))
      if (!mode) {
        const allowed = SCREEN_MODES.filter((m) => m.minWidth > 0).map((m) => `${m.minWidth}px`)
        throw new Error(`${source}: @media (min-width: ${width}px) は扱えません（${allowed.join(' / ')} のみ）`)
      }
      for (const [name, value] of declarationsOf(block)) {
        responsive.set(name, { ...responsive.get(name), [mode]: value })
      }
      return ''
    },
  )

  const tokens = new Map<string, DesignToken>()
  for (const [, block] of base.matchAll(/:root\s*\{([^}]*)\}/g)) {
    for (const [name, value] of declarationsOf(block)) {
      tokens.set(name, { name, value, source, ...(responsive.has(name) && { responsive: responsive.get(name) }) })
    }
  }
  return [...tokens.values()]
}

/** トークンの一覧から、メモリ上のリポジトリを作る */
export function createTokenRepository(tokens: readonly DesignToken[]): TokenRepository {
  const byName = new Map(tokens.map((token) => [token.name, token]))
  const lookup = (name: string) => byName.get(name)

  return {
    findAll: () => tokens,
    findByPrefix: (prefix) => tokens.filter((token) => token.name.startsWith(prefix)),
    get: lookup,
    resolve: (name, mode = 'mobile') => resolveTokenValue(`var(${name})`, lookup, mode),
  }
}

/**
 * トークンの CSS ファイル群（ファイルパス → CSS の文字列）からリポジトリを作る。
 * ファイルはパスの順に読み、同じ名前のトークンがあれば後のファイルを優先する。
 */
export function createCssTokenRepository(files: Record<string, string>): TokenRepository {
  const tokens = Object.entries(files)
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([path, css]) => parseTokenCss(css, path.split('/').pop() ?? path))
  return createTokenRepository(tokens)
}
