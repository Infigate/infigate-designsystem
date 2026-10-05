/// <reference types="node" />
import { globSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * デザイントークンと、それを使う CSS 全体の整合性を検査する。
 * （CSS の見た目はテストできないため、トークンの参照関係とルールを守っているかを確認する）
 *
 * Vitest は CSS の import を空にするため（?raw でも同様）、ファイルは fs で直接読む。
 */

// Vitest はプロジェクトルートで実行される（jsdom 環境では import.meta.url が file: にならない）
const srcDir = join(process.cwd(), 'src')

/** src からの相対パス → ファイル内容 */
function readCss(pattern: string): Record<string, string> {
  return Object.fromEntries(
    globSync(pattern, { cwd: srcDir })
      .sort()
      .map((path) => [path, readFileSync(join(srcDir, path), 'utf8')]),
  )
}

const tokenFiles = readCss('design-system/tokens/*.css')
const allCssFiles = readCss('**/*.css')

const primitives = tokenFiles['design-system/tokens/color-primitives.css']
const semantics = tokenFiles['design-system/tokens/color-semantics.css']
const typography = tokenFiles['design-system/tokens/typography.css']
const dimensions = tokenFiles['design-system/tokens/dimensions.css']
const layout = tokenFiles['design-system/tokens/layout.css']
const elevation = tokenFiles['design-system/tokens/elevation.css']

/** Figma の Responsive コレクションのモード切り替え（モバイルファースト） */
const BREAKPOINTS = [
  ['Tablet', 768],
  ['Desktop', 1024],
] as const

/** `--name: value;` の宣言を名前 → 値のマップにする */
function parseDeclarations(css: string): Map<string, string> {
  const declarations = new Map<string, string>()
  for (const [, name, value] of stripComments(css).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    declarations.set(name, value.trim())
  }
  return declarations
}

/** `@media (min-width: Npx) { :root { ... } }` の中の宣言を取り出す */
function parseMediaBlock(css: string, minWidth: number): Map<string, string> {
  const block = stripComments(css).match(
    new RegExp(String.raw`@media \(min-width: ${minWidth}px\) \{\s*:root \{([^}]*)\}`),
  )?.[1]
  return parseDeclarations(block ?? '')
}

/** `var(--name)` で参照している変数名を列挙する */
function findReferences(css: string): string[] {
  return [...stripComments(css).matchAll(/var\(\s*(--[\w-]+)/g)].map(([, name]) => name)
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

const defined = new Map(Object.values(tokenFiles).flatMap((css) => [...parseDeclarations(css)]))

describe('デザイントークン', () => {
  it('トークンファイルを読み込めている', () => {
    expect(primitives).toContain('--color-')
    expect(semantics).toContain('--color-')
  })

  it('プリミティブカラーはすべて値（16進数）で定義されている', () => {
    const declarations = parseDeclarations(primitives)

    expect(declarations.size).toBe(72) // 7色 × 10段階 + white + black
    for (const [name, value] of declarations) {
      expect(value, name).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('セマンティックカラーは値を直接書かず、他のカラートークンを参照している', () => {
    // 影の色だけは Figma 上でも値で定義されている
    const rawValueAllowed = new Set(['--color-shadow-key', '--color-shadow-ambient'])

    for (const [name, value] of parseDeclarations(semantics)) {
      if (rawValueAllowed.has(name)) continue
      expect(value, name).toMatch(/var\(--color-/)
    }
  })

  it('トークン同士の参照先がすべて定義されている', () => {
    for (const css of Object.values(tokenFiles)) {
      for (const name of findReferences(css)) {
        expect(defined.has(name), `${name} が未定義`).toBe(true)
      }
    }
  })
})

describe('タイポグラフィ', () => {
  const declarations = parseDeclarations(typography)
  const textStyles = [...declarations].filter(([name]) => /^--font-(heading|body|label|link)-/.test(name))

  it('Figma のテキストスタイル12種をすべて定義している', () => {
    expect(textStyles.map(([name]) => name).sort()).toEqual(
      [
        '--font-heading-3xl',
        '--font-heading-2xl',
        '--font-heading-xl',
        '--font-heading-lg',
        '--font-heading-md',
        '--font-heading-sm',
        '--font-body-md',
        '--font-body-sm',
        '--font-body-xs',
        '--font-label-md',
        '--font-label-sm',
        '--font-link-md',
      ].sort(),
    )
  })

  it('テキストスタイルは値を直接書かず、太さ・大きさ・行間・書体のトークンを組み合わせている', () => {
    for (const [name, value] of textStyles) {
      expect(value, name).toMatch(
        /^var\(--font-weight-\w+\) var\(--font-size-\w+\) \/ var\(--line-height-\w+\) var\(--font-family-sans\)$/,
      )
    }
  })

  it('文字サイズは rem で定義している（ブラウザの文字サイズ設定に追従させるため）', () => {
    const sizes = [...stripComments(typography).matchAll(/(--font-size-[\w-]+)\s*:\s*([^;]+);/g)]

    expect(sizes.length).toBeGreaterThan(0)
    for (const [, name, value] of sizes) {
      expect(value, name).toMatch(/^[\d.]+rem$/)
    }
  })

  it.each(BREAKPOINTS)('%s（%ipx 以上）で見出し用の文字サイズを切り替える', (_mode, minWidth) => {
    expect([...parseMediaBlock(typography, minWidth).keys()]).toEqual([
      '--font-size-3xl',
      '--font-size-2xl',
      '--font-size-xl',
      '--font-size-lg',
      '--font-size-md',
    ])
  })
})

describe('スペーシング・角丸', () => {
  const declarations = parseDeclarations(dimensions)
  const byPrefix = (prefix: string) => [...declarations].filter(([name]) => name.startsWith(prefix))

  it('スペーシングは Figma の13段階で、名前の数字（px）と値が一致する', () => {
    const spacings = byPrefix('--spacing-')

    expect(spacings.map(([name]) => name)).toEqual(
      [0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64].map((px) => `--spacing-${px}`),
    )
    for (const [name, value] of spacings) {
      const px = Number(name.replace('--spacing-', ''))
      expect(value, name).toBe(px === 0 ? '0' : `${px / 16}rem`)
    }
  })

  it('スペーシングは4の倍数を基本とし、例外は小さな部品用の 2・6 だけ', () => {
    const exceptions = byPrefix('--spacing-')
      .map(([name]) => Number(name.replace('--spacing-', '')))
      .filter((px) => px % 4 !== 0)
    expect(exceptions).toEqual([2, 6])
  })

  it('角丸は Figma の7段階で定義している', () => {
    expect(Object.fromEntries(byPrefix('--radius-'))).toEqual({
      '--radius-none': '0',
      '--radius-xs': '2px',
      '--radius-sm': '4px',
      '--radius-md': '6px',
      '--radius-lg': '8px',
      '--radius-xl': '12px',
      '--radius-full': '9999px',
    })
  })
})

describe('エレベーション', () => {
  const declarations = parseDeclarations(elevation)

  it('Figma の3段階（elevation/1〜3）を定義している', () => {
    expect([...declarations.keys()]).toEqual(['--elevation-1', '--elevation-2', '--elevation-3'])
  })

  it('影は2枚重ねで、1枚目は shadow/key、2枚目は shadow/ambient の色を使う', () => {
    for (const [name, value] of declarations) {
      expect(value, name).toMatch(
        /^0 \d+px \d+px 0 var\(--color-shadow-key\), 0 \d+px \d+px 0 var\(--color-shadow-ambient\)$/,
      )
    }
  })

  it('段階が上がるほど影が大きくなる', () => {
    const blurs = [...declarations.values()].map((value) => [...value.matchAll(/0 (\d+)px (\d+)px/g)].map(([, , blur]) => Number(blur)))

    for (let level = 1; level < blurs.length; level++) {
      expect(blurs[level][0]).toBeGreaterThan(blurs[level - 1][0])
      expect(blurs[level][1]).toBeGreaterThan(blurs[level - 1][1])
    }
  })
})

describe('レイアウト', () => {
  const layoutTokens = [
    '--breakpoint-min',
    '--layout-columns',
    '--layout-gutter',
    '--layout-margin',
    '--layout-content-max',
  ]

  it('Mobile の値を基本として定義している', () => {
    const base = parseDeclarations(stripComments(layout).split('@media')[0])

    expect([...base.keys()]).toEqual([...layoutTokens, '--layout-reading-max'])
  })

  it.each(BREAKPOINTS)('%s（%ipx 以上）でレイアウトの値を切り替える', (_mode, minWidth) => {
    // reading-max は全モード共通（720px）なので切り替えない
    expect([...parseMediaBlock(layout, minWidth).keys()]).toEqual(layoutTokens)
  })

  it('ガターと左右の余白はスペーシングから選んでいる', () => {
    const all = [parseDeclarations(stripComments(layout).split('@media')[0]), ...BREAKPOINTS.map(([, w]) => parseMediaBlock(layout, w))]

    for (const declarations of all) {
      expect(declarations.get('--layout-gutter')).toMatch(/^var\(--spacing-\d+\)$/)
      expect(declarations.get('--layout-margin')).toMatch(/^var\(--spacing-\d+\)$/)
    }
  })
})

describe('トークンを使う CSS', () => {
  const consumers = Object.entries(allCssFiles).filter(([path]) => !path.startsWith('design-system/tokens/'))

  it('検査対象の CSS を読み込めている', () => {
    expect(consumers.length).toBeGreaterThan(0)
  })

  it.each(consumers)('%s は定義済みのトークンだけを参照している', (_path, css) => {
    // 部品の中で定義した変数（例: Button のテーマごとの --button-*）も参照してよい
    const local = parseDeclarations(css)
    const undefinedNames = findReferences(css).filter((name) => !defined.has(name) && !local.has(name))

    expect(undefinedNames).toEqual([])
  })

  it.each(consumers)('%s は色を直接書かず、トークンを使っている', (_path, css) => {
    const hardCoded = stripComments(css).match(/#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(/gi)

    expect(hardCoded).toBeNull()
  })

  it.each(consumers)('%s は文字の大きさ・太さ・行間・書体を直接書かず、トークンを使っている', (_path, css) => {
    const hardCoded = stripComments(css).match(
      new RegExp(
        [
          String.raw`font-size:\s*[\d.]+(?:px|rem)\b`, // em・% による相対指定は許可
          String.raw`font-weight:\s*\d`,
          String.raw`line-height:\s*[\d.]`,
          String.raw`font-family:(?!\s*(?:var\(|inherit))`,
          String.raw`\bfont:(?!\s*(?:var\(|inherit))`,
        ].join('|'),
        'g',
      ),
    )

    expect(hardCoded).toBeNull()
  })

  it.each(consumers)('%s は余白（padding・margin・gap）を直接書かず、スペーシングを使っている', (_path, css) => {
    // 0 は単位なしで書けるので許可。値に単位付きの数値が含まれていれば違反
    const hardCoded = stripComments(css).match(
      /(?<![\w-])(?:padding|margin|gap|row-gap|column-gap)(?:-[a-z-]+)?:[^;}]*?(?<![\w-])[\d.]+(?:px|rem|em)\b/g,
    )

    expect(hardCoded).toBeNull()
  })

  it.each(consumers)('%s は角丸を直接書かず、トークンを使っている', (_path, css) => {
    const hardCoded = stripComments(css).match(/border(?:-[a-z]+)*-radius:[^;}]*?(?<![\w-])[\d.]+(?:px|rem|em|%)/g)

    expect(hardCoded).toBeNull()
  })

  it.each(consumers)('%s は影を直接書かず、エレベーション（またはフォーカスリング）のトークンを使っている', (_path, css) => {
    const hardCoded = stripComments(css).match(/box-shadow:(?!\s*(?:var\(--(?:elevation-\d|ds-focus-ring|ds-focus-ring-inset)\)|none)\s*;)[^;}]*/g)

    expect(hardCoded).toBeNull()
  })

  it.each(consumers)('%s のメディアクエリは Figma のブレークポイント（768px / 1024px）だけを使っている', (_path, css) => {
    const allowed = new Set(['min-width: 768px', 'min-width: 1024px', 'max-width: 767px', 'max-width: 1023px'])
    const used = [...stripComments(css).matchAll(/\((min-width|max-width):\s*([\d.]+px)\)/g)].map(
      ([, feature, value]) => `${feature}: ${value}`,
    )

    expect(used.filter((query) => !allowed.has(query))).toEqual([])
  })
})
