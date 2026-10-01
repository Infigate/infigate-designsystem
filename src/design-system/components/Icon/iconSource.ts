/**
 * Figma から書き出したアイコンの SVG を、React で描画できるデータに変換する。
 * scripts/generate-icons.ts（生成）と iconSource.test.ts（生成物が最新かの検査）の両方から使う。
 * Node から直接実行されるため、このファイルは他のモジュールを import しないこと。
 *
 * 変換で変えるのは色だけで、形（パス・座標）はそのまま使う。
 *   - text/primary などの線・塗りの色 → currentColor（周囲の文字色を受け継ぐ）
 *   - 白（Figma の text/on-brand。塗り版の白抜き部分） → data-knockout（CSS でトークンの色を当てる）
 */

export const ICON_TAGS = ['path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon'] as const
export type IconTag = (typeof ICON_TAGS)[number]

export type IconElementAttributes = {
  readonly d?: string
  readonly cx?: string
  readonly cy?: string
  readonly r?: string
  readonly rx?: string
  readonly ry?: string
  readonly x?: string
  readonly y?: string
  readonly width?: string
  readonly height?: string
  readonly x1?: string
  readonly y1?: string
  readonly x2?: string
  readonly y2?: string
  readonly points?: string
  readonly fill?: 'none' | 'currentColor'
  readonly stroke?: 'none' | 'currentColor'
  readonly strokeWidth?: string
  readonly strokeLinecap?: 'butt' | 'round' | 'square'
  readonly strokeLinejoin?: 'miter' | 'round' | 'bevel'
  readonly fillRule?: 'nonzero' | 'evenodd'
  readonly clipRule?: 'nonzero' | 'evenodd'
  readonly 'data-knockout'?: 'fill' | 'stroke'
}

export type IconElement = readonly [tag: IconTag, attributes: IconElementAttributes]

/** 1つのアイコン。line は必須、filled は状態を表すアイコンなど一部だけが持つ */
export type IconDefinition = {
  readonly line: readonly IconElement[]
  readonly filled?: readonly IconElement[]
}

/** SVG の属性名 → React の属性名（ここにない属性があるとエラーにする） */
const ATTRIBUTE_NAMES: Record<string, keyof IconElementAttributes> = {
  d: 'd',
  cx: 'cx',
  cy: 'cy',
  r: 'r',
  rx: 'rx',
  ry: 'ry',
  x: 'x',
  y: 'y',
  width: 'width',
  height: 'height',
  x1: 'x1',
  y1: 'y1',
  x2: 'x2',
  y2: 'y2',
  points: 'points',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
}

/** 値の候補が決まっている属性 */
const ALLOWED_VALUES: Partial<Record<keyof IconElementAttributes, readonly string[]>> = {
  strokeLinecap: ['butt', 'round', 'square'],
  strokeLinejoin: ['miter', 'round', 'bevel'],
  fillRule: ['nonzero', 'evenodd'],
  clipRule: ['nonzero', 'evenodd'],
}

const IGNORED_ATTRIBUTES = new Set(['id'])
const KNOCKOUT_COLORS = new Set(['white', '#fff', '#ffffff'])
const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function toPaint(value: string, context: string): 'none' | 'currentColor' | 'knockout' {
  const color = value.trim().toLowerCase()
  if (color === 'none') return 'none'
  if (KNOCKOUT_COLORS.has(color)) return 'knockout'
  if (/^#[0-9a-f]{3,8}$/.test(color) || /^[a-z]+$/.test(color)) return 'currentColor'
  throw new Error(`${context}: 色「${value}」は扱えません（単色で書き出してください）`)
}

/** SVG 1ファイル分を、描画用の要素の配列に変換する */
export function parseIconSvg(svg: string, fileName: string): IconElement[] {
  const viewBox = svg.match(/<svg\b[^>]*\bviewBox="([^"]*)"/)?.[1]
  if (viewBox !== '0 0 24 24') {
    throw new Error(`${fileName}: viewBox は "0 0 24 24" にしてください（実際: ${viewBox ?? 'なし'}）`)
  }

  const elements: IconElement[] = []
  const leftover = svg.replace(/<(\/?)([a-zA-Z]+)\b([^>]*?)\/?>/g, (_match, closing: string, tag: string, rawAttributes: string) => {
    if (tag === 'svg' || tag === 'g' || closing) return ''
    if (!(ICON_TAGS as readonly string[]).includes(tag)) {
      throw new Error(`${fileName}: <${tag}> は扱えません（使えるのは ${ICON_TAGS.join(', ')}）`)
    }

    const attributes: Record<string, string> = {}
    for (const [, name, value] of rawAttributes.matchAll(/([\w:-]+)="([^"]*)"/g)) {
      if (IGNORED_ATTRIBUTES.has(name)) continue
      const context = `${fileName} <${tag} ${name}>`

      if (name === 'fill' || name === 'stroke') {
        const paint = toPaint(value, context)
        if (paint === 'knockout') {
          if (attributes['data-knockout']) throw new Error(`${context}: 線と塗りの両方を白にはできません`)
          attributes['data-knockout'] = name
        } else {
          attributes[name] = paint
        }
        continue
      }

      const propName = ATTRIBUTE_NAMES[name]
      if (!propName) throw new Error(`${context}: 属性「${name}」は扱えません`)
      const allowed = ALLOWED_VALUES[propName]
      if (allowed && !allowed.includes(value)) throw new Error(`${context}: 値「${value}」は扱えません`)
      attributes[propName] = value
    }

    elements.push([tag as IconTag, attributes as IconElementAttributes])
    return ''
  })

  if (leftover.trim() !== '') throw new Error(`${fileName}: 解釈できない内容があります: ${leftover.trim().slice(0, 40)}`)
  if (elements.length === 0) throw new Error(`${fileName}: 図形がありません`)
  return elements
}

/** ファイル名（例: info.svg / info.filled.svg）→ SVG の内容 から、全アイコンの定義を作る */
export function parseIconFiles(files: Record<string, string>): Record<string, IconDefinition> {
  const lines = new Map<string, IconElement[]>()
  const filleds = new Map<string, IconElement[]>()

  for (const [fileName, svg] of Object.entries(files)) {
    const match = fileName.match(/^(.+?)(\.filled)?\.svg$/)
    if (!match || !NAME_PATTERN.test(match[1])) {
      throw new Error(`${fileName}: ファイル名は「名前.svg」か「名前.filled.svg」にしてください（名前は英小文字・数字・ハイフン）`)
    }
    const target = match[2] ? filleds : lines
    target.set(match[1], parseIconSvg(svg, fileName))
  }

  for (const name of filleds.keys()) {
    if (!lines.has(name)) throw new Error(`${name}.filled.svg: 線の版（${name}.svg）がありません`)
  }

  return Object.fromEntries(
    [...lines.keys()].sort().map((name) => {
      const filled = filleds.get(name)
      return [name, filled ? { line: lines.get(name)!, filled } : { line: lines.get(name)! }]
    }),
  )
}

const quote = (value: string) => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
const key = (name: string) => (/^[A-Za-z_$][\w$]*$/.test(name) ? name : quote(name))

function renderElements(elements: readonly IconElement[]): string {
  return elements
    .map(([tag, attributes]) => {
      const props = Object.entries(attributes)
        .map(([name, value]) => `${key(name)}: ${quote(String(value))}`)
        .join(', ')
      return `      [${quote(tag)}, { ${props} }],`
    })
    .join('\n')
}

/** icons.generated.ts の内容を作る */
export function buildIconsModule(files: Record<string, string>): string {
  const icons = parseIconFiles(files)
  const entries = Object.entries(icons).map(([name, definition]) => {
    const variants = [`    line: [\n${renderElements(definition.line)}\n    ],`]
    if (definition.filled) variants.push(`    filled: [\n${renderElements(definition.filled)}\n    ],`)
    return `  ${quote(name)}: {\n${variants.join('\n')}\n  },`
  })

  return [
    '// このファイルは scripts/generate-icons.ts が svg/ 内の SVG から生成している。直接編集しないこと。',
    '// アイコンを追加・更新するときは、Figma から書き出した SVG を svg/ に置いて `npm run icons:generate` を実行する。',
    "import type { IconDefinition } from './iconSource'",
    '',
    'export const ICONS = {',
    ...entries,
    '} as const satisfies Record<string, IconDefinition>',
    '',
  ].join('\n')
}
