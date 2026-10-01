import { describe, expect, it } from 'vitest'
import { createRealTokenRepository } from '../testing/realTokens'
import { gridSpecOf, layoutGrid } from './layoutGrid'

const mobile = { columns: 4, gutter: 16, margin: 16, contentMax: 768 }
const desktop = { columns: 12, gutter: 24, margin: 32, contentMax: 1440 }

describe('gridSpecOf', () => {
  it('モードごとのグリッドの値を px で読む', () => {
    const repository = createRealTokenRepository()

    expect(gridSpecOf(repository, 'mobile')).toEqual(mobile)
    expect(gridSpecOf(repository, 'desktop')).toEqual(desktop)
  })
})

describe('layoutGrid', () => {
  it('余白の内側に、ガターをはさんで列を並べる', () => {
    const grid = layoutGrid(375, mobile)

    expect(grid.columnWidth).toBe(73.75) // (375 - 16×2 - 16×3) ÷ 4
    expect(grid.areas.map((area) => [area.kind, area.start, area.width])).toEqual([
      ['margin', 0, 16],
      ['column', 16, 73.75],
      ['column', 105.75, 73.75],
      ['column', 195.5, 73.75],
      ['column', 285.25, 73.75],
      ['margin', 359, 16],
    ])
  })

  it('最大幅より広い画面では、最大幅で止めて中央に寄せる', () => {
    const grid = layoutGrid(1920, desktop)

    expect(grid.containerWidth).toBe(1440)
    expect(grid.areas.at(0)).toEqual({ kind: 'outside', start: 0, width: 240 })
    expect(grid.areas.at(1)).toEqual({ kind: 'margin', start: 240, width: 32 })
    expect(grid.areas.at(-2)).toEqual({ kind: 'margin', start: 1648, width: 32 })
    expect(grid.areas.at(-1)).toEqual({ kind: 'outside', start: 1680, width: 240 })
  })

  it('最大幅以下なら、中央寄せの余りはない', () => {
    expect(layoutGrid(1280, desktop).areas.some((area) => area.kind === 'outside')).toBe(false)
  })
})
