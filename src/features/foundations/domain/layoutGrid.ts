import { toPx, type ScreenModeId } from './designToken'
import type { TokenRepository } from './tokenRepository'

/**
 * レイアウトグリッド（列・ガター・左右の余白・コンテンツの最大幅）の計算。
 * コンテンツは最大幅で止めて中央に寄せ、その内側に左右の余白をとって列を並べる（最大幅は余白を含む）。
 */
export type GridSpec = {
  readonly columns: number
  /** 以下はすべて px */
  readonly gutter: number
  readonly margin: number
  readonly contentMax: number
}

export type GridArea = {
  /** outside: 最大幅の外（中央寄せの余り） / margin: 左右の余白 / column: 列 */
  readonly kind: 'outside' | 'margin' | 'column'
  /** 画面の左端からの位置（px） */
  readonly start: number
  readonly width: number
}

export type GridLayout = {
  /** 最大幅で止めたあとの幅（左右の余白を含む） */
  readonly containerWidth: number
  readonly columnWidth: number
  /** 左から順に並べた領域（ガターは列と列のすき間なので含まない） */
  readonly areas: readonly GridArea[]
}

/** モードでのグリッドの値をトークンから読む */
export function gridSpecOf(repository: TokenRepository, mode: ScreenModeId): GridSpec {
  const px = (name: string) => {
    const value = toPx(repository.resolve(name, mode))
    if (value === undefined) throw new Error(`${name} が長さではありません`)
    return value
  }
  return {
    columns: Number(repository.resolve('--layout-columns', mode)),
    gutter: px('--layout-gutter'),
    margin: px('--layout-margin'),
    contentMax: px('--layout-content-max'),
  }
}

/** 画面幅に、列・余白を並べる */
export function layoutGrid(screenWidth: number, spec: GridSpec): GridLayout {
  const containerWidth = Math.min(screenWidth, spec.contentMax)
  const outside = (screenWidth - containerWidth) / 2
  const columnWidth = (containerWidth - spec.margin * 2 - spec.gutter * (spec.columns - 1)) / spec.columns

  const columns = Array.from({ length: spec.columns }, (_, index) => ({
    kind: 'column' as const,
    start: outside + spec.margin + index * (columnWidth + spec.gutter),
    width: columnWidth,
  }))
  const outsides = outside > 0 ? ([{ kind: 'outside', start: 0, width: outside }] as const) : []

  return {
    containerWidth,
    columnWidth,
    areas: [
      ...outsides,
      { kind: 'margin', start: outside, width: spec.margin },
      ...columns,
      { kind: 'margin', start: outside + containerWidth - spec.margin, width: spec.margin },
      ...outsides.map((area) => ({ ...area, start: screenWidth - outside })),
    ],
  }
}
