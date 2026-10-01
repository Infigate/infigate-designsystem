import { describe, expect, it } from 'vitest'
import {
  alphaPercent,
  isLightColor,
  parseTextStyle,
  referenceOf,
  resolveTokenValue,
  screenModeAt,
  toPx,
  valueInMode,
  type DesignToken,
} from './designToken'

const token = (name: string, value: string, responsive?: DesignToken['responsive']): DesignToken => ({
  name,
  value,
  source: 'test.css',
  ...(responsive && { responsive }),
})

const tokens = new Map(
  [
    token('--gray-900', '#21272f'),
    token('--text', 'var(--gray-900)'),
    token('--overlay', 'color-mix(in srgb, var(--gray-900) 60%, transparent)'),
    token('--space-16', '1rem'),
    token('--space-24', '1.5rem'),
    token('--gutter', 'var(--space-16)', { tablet: 'var(--space-24)' }),
    token('--loop-a', 'var(--loop-b)'),
    token('--loop-b', 'var(--loop-a)'),
  ].map((t) => [t.name, t]),
)
const lookup = (name: string) => tokens.get(name)

describe('valueInMode', () => {
  it('上書きがなければ、狭い画面の値を引き継ぐ（モバイルファースト）', () => {
    const fontSize = token('--size', '2rem', { tablet: '2.25rem' })

    expect(valueInMode(fontSize, 'mobile')).toBe('2rem')
    expect(valueInMode(fontSize, 'tablet')).toBe('2.25rem')
    expect(valueInMode(fontSize, 'desktop')).toBe('2.25rem')
  })
})

describe('screenModeAt', () => {
  it.each([
    [320, 'mobile'],
    [767, 'mobile'],
    [768, 'tablet'],
    [1023, 'tablet'],
    [1024, 'desktop'],
    [1920, 'desktop'],
  ])('%ipx は %s', (width, mode) => {
    expect(screenModeAt(width).id).toBe(mode)
  })
})

describe('referenceOf', () => {
  it('別のトークンをそのまま参照していれば、その名前を返す', () => {
    expect(referenceOf('var(--gray-900)')).toBe('--gray-900')
  })

  it.each(['#21272f', '1rem', 'var(--a) var(--b)', 'color-mix(in srgb, var(--a) 60%, transparent)'])(
    '%s は単純な参照ではない',
    (value) => {
      expect(referenceOf(value)).toBeUndefined()
    },
  )
})

describe('resolveTokenValue', () => {
  it('参照をたどって最終的な値にする', () => {
    expect(resolveTokenValue('var(--text)', lookup)).toBe('#21272f')
  })

  it('モードごとの値で解決する', () => {
    expect(resolveTokenValue('var(--gutter)', lookup, 'mobile')).toBe('1rem')
    expect(resolveTokenValue('var(--gutter)', lookup, 'desktop')).toBe('1.5rem')
  })

  it('color-mix による透明度は #rrggbbaa にする', () => {
    expect(resolveTokenValue('var(--overlay)', lookup)).toBe('#21272f99')
  })

  it('複数の参照を含む値も、それぞれ解決する', () => {
    expect(resolveTokenValue('0 1px var(--space-16) var(--text)', lookup)).toBe('0 1px 1rem #21272f')
  })

  it('参照先がない・循環している場合はエラーにする', () => {
    expect(() => resolveTokenValue('var(--missing)', lookup)).toThrow('トークン --missing が見つかりません')
    expect(() => resolveTokenValue('var(--loop-a)', lookup)).toThrow(/循環/)
  })
})

describe('toPx', () => {
  it.each([
    ['1rem', 16],
    ['1.5rem', 24],
    ['12px', 12],
    ['0', 0],
    ['9999px', 9999],
  ])('%s → %ipx', (value, px) => {
    expect(toPx(value)).toBe(px)
  })

  it.each(['#fff', '1.4', 'auto'])('%s は長さではない', (value) => {
    expect(toPx(value)).toBeUndefined()
  })
})

describe('parseTextStyle', () => {
  it('テキストスタイルを、参照しているトークンに分解する', () => {
    expect(
      parseTextStyle('var(--font-weight-bold) var(--font-size-xl) / var(--line-height-tight) var(--font-family-sans)'),
    ).toEqual({
      weight: '--font-weight-bold',
      size: '--font-size-xl',
      lineHeight: '--line-height-tight',
      family: '--font-family-sans',
    })
  })

  it('形式が違えば undefined', () => {
    expect(parseTextStyle('700 16px/1.4 sans-serif')).toBeUndefined()
  })
})

describe('isLightColor', () => {
  it.each(['#ffffff', '#f1f4f8', '#edf4fe', '#fef1f9'])('%s は明るい色', (hex) => {
    expect(isLightColor(hex)).toBe(true)
  })

  it.each(['#21272f', '#006ed5', '#c9cdd4', '#21272f99', 'transparent'])('%s は明るい色ではない', (hex) => {
    expect(isLightColor(hex)).toBe(false)
  })
})

describe('alphaPercent', () => {
  it.each([
    ['#21272f1a', 10],
    ['#21272f0f', 6],
    ['#21272f99', 60],
  ])('%s → %i%', (hex, percent) => {
    expect(alphaPercent(hex)).toBe(percent)
  })

  it('透明度がなければ undefined', () => {
    expect(alphaPercent('#21272f')).toBeUndefined()
  })
})
