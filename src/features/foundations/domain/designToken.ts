/**
 * デザイントークン（CSS 変数）1つ分。
 * 値は CSS に書かれたまま（var() の参照を含む）で持ち、表示するときに resolveTokenValue() で解決する。
 */

/** 画面幅のモード（Figma: Responsive コレクション）。CSS はモバイルファーストで、min-width で上書きする */
export const SCREEN_MODES = [
  { id: 'mobile', label: 'Mobile', minWidth: 0, range: '〜767px' },
  { id: 'tablet', label: 'Tablet', minWidth: 768, range: '768〜1023px' },
  { id: 'desktop', label: 'Desktop', minWidth: 1024, range: '1024px〜' },
] as const

export type ScreenMode = (typeof SCREEN_MODES)[number]
export type ScreenModeId = ScreenMode['id']

/** 画面幅（px）に当てはまるモード */
export function screenModeAt(width: number): ScreenMode {
  return SCREEN_MODES.findLast((mode) => width >= mode.minWidth) ?? SCREEN_MODES[0]
}

export type DesignToken = {
  /** CSS 変数名（例: --color-gray-900） */
  readonly name: string
  /** Mobile（基本）の値。CSS に書かれたまま */
  readonly value: string
  /** Tablet・Desktop で上書きしている値 */
  readonly responsive?: Readonly<Partial<Record<Exclude<ScreenModeId, 'mobile'>, string>>>
  /** 定義しているファイル名（例: color-primitives.css） */
  readonly source: string
}

/** モードでの値（モバイルファーストなので、上書きがなければ狭い画面の値を引き継ぐ） */
export function valueInMode(token: DesignToken, mode: ScreenModeId = 'mobile'): string {
  if (mode === 'desktop') return token.responsive?.desktop ?? token.responsive?.tablet ?? token.value
  if (mode === 'tablet') return token.responsive?.tablet ?? token.value
  return token.value
}

/** 値が別のトークンをそのまま参照しているとき、その名前を返す（例: var(--color-gray-900) → --color-gray-900） */
export function referenceOf(value: string): string | undefined {
  return value.match(/^var\((--[\w-]+)\)$/)?.[1]
}

type Lookup = (name: string) => DesignToken | undefined

/**
 * var() の参照をたどって、最終的な値にする。
 * color-mix(in srgb, #rrggbb N%, transparent) は透明度付きの16進数（#rrggbbaa）にする。
 * @throws {Error} 参照先が見つからない・循環している場合
 */
export function resolveTokenValue(
  value: string,
  lookup: Lookup,
  mode: ScreenModeId = 'mobile',
  visiting: ReadonlySet<string> = new Set(),
): string {
  const replaced = value.replace(/var\((--[\w-]+)\)/g, (_match, name: string) => {
    if (visiting.has(name)) throw new Error(`トークン ${name} の参照が循環しています`)
    const token = lookup(name)
    if (!token) throw new Error(`トークン ${name} が見つかりません`)
    return resolveTokenValue(valueInMode(token, mode), lookup, mode, new Set([...visiting, name]))
  })

  return replaced.replace(
    /color-mix\(in srgb, (#[0-9a-f]{6}) ([\d.]+)%, transparent\)/gi,
    (_match, hex: string, percent: string) =>
      hex.toLowerCase() + Math.round((Number(percent) / 100) * 255).toString(16).padStart(2, '0'),
  )
}

/** rem・px の長さを px の数値にする（1rem = 16px）。長さでなければ undefined */
export function toPx(value: string): number | undefined {
  const match = value.trim().match(/^(-?[\d.]+)(rem|px)?$/)
  if (!match) return undefined
  const number = Number(match[1])
  if (match[2] === 'rem') return number * 16
  if (match[2] === 'px' || number === 0) return number
  return undefined
}

/** テキストスタイル（font の一括指定）を、参照しているトークンに分解する */
export function parseTextStyle(value: string):
  | { weight: string; size: string; lineHeight: string; family: string }
  | undefined {
  const match = value.match(
    /^var\((--font-weight-[\w-]+)\) var\((--font-size-[\w-]+)\) \/ var\((--line-height-[\w-]+)\) var\((--font-family-[\w-]+)\)$/,
  )
  return match ? { weight: match[1], size: match[2], lineHeight: match[3], family: match[4] } : undefined
}

/**
 * 白い背景の上で見分けにくい明るい色か（色見本に枠線を付けるかの判定に使う）。
 * 透明度付きの色は、白い背景に重ねた色で判定する。
 */
export function isLightColor(hex: string): boolean {
  const match = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i)
  if (!match) return false
  const alpha = match[4] ? parseInt(match[4], 16) / 255 : 1
  const [r, g, b] = [match[1], match[2], match[3]].map((h) => {
    const channel = (parseInt(h, 16) / 255) * alpha + (1 - alpha) // 白に重ねる
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.8
}

/** 透明度付きの16進数（#rrggbbaa）から不透明度（%）を返す。透明度がなければ undefined */
export function alphaPercent(hex: string): number | undefined {
  const match = hex.match(/^#[0-9a-f]{6}([0-9a-f]{2})$/i)
  return match ? Math.round((parseInt(match[1], 16) / 255) * 100) : undefined
}
