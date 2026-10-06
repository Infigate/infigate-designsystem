import { describe, expect, it } from 'vitest'
import { buildForcedPseudoCss, fromCssRules, toForcedSelector } from './forcedPseudoStateCss'

describe('toForcedSelector', () => {
  it.each([
    ['.a:hover', ".a:is(:hover, [data-force-pseudo~='hover'] :not([data-force-pseudo-ignore] *))"],
    ['.a:active:not(:disabled)', ".a:is(:active, [data-force-pseudo~='active'] :not([data-force-pseudo-ignore] *)):not(:disabled)"],
    ['.a:focus-visible', ".a:is(:focus-visible, [data-force-pseudo~='focus-visible'] :not([data-force-pseudo-ignore] *))"],
    ['.a:focus', ".a:is(:focus, [data-force-pseudo~='focus'] :not([data-force-pseudo-ignore] *))"],
    [
      '.a:is(:hover:not(:disabled), :focus-visible)',
      ".a:is(:is(:hover, [data-force-pseudo~='hover'] :not([data-force-pseudo-ignore] *)):not(:disabled), :is(:focus-visible, [data-force-pseudo~='focus-visible'] :not([data-force-pseudo-ignore] *)))",
    ],
    ['.card:has(.link:focus-visible)', ".card:has(.link:is(:focus-visible, [data-force-pseudo~='focus-visible'] :not([data-force-pseudo-ignore] *)))"],
  ])('%s を強制用に置き換える', (selector, expected) => {
    expect(toForcedSelector(selector)).toBe(expected)
  })

  it.each(['.a', '.a:focus-within', '.a:disabled', '.a::before', '.hover-card'])('%s は対象外（null）', (selector) => {
    expect(toForcedSelector(selector)).toBeNull()
  })
})

describe('buildForcedPseudoCss', () => {
  const rule = (selectorText: string, declarations: string) => ({ kind: 'style', selectorText, declarations }) as const

  it('擬似クラスを含むルールだけを、宣言をそのまま引き継いで作る', () => {
    const css = buildForcedPseudoCss([rule('.a', 'color: red;'), rule('.a:hover', 'color: blue;'), { kind: 'other' }])

    expect(css).toBe(".a:is(:hover, [data-force-pseudo~='hover'] :not([data-force-pseudo-ignore] *)) { color: blue; }")
  })

  it('@media の中のルールも、同じ条件で包んで作る（対象がなければ作らない）', () => {
    const css = buildForcedPseudoCss([
      { kind: 'condition', atRule: '@media', condition: '(min-width: 768px)', rules: [rule('.a:active', 'color: green;')] },
      { kind: 'condition', atRule: '@media', condition: '(min-width: 1024px)', rules: [rule('.a', 'color: green;')] },
    ])

    expect(css).toBe("@media (min-width: 768px) { .a:is(:active, [data-force-pseudo~='active'] :not([data-force-pseudo-ignore] *)) { color: green; } }")
  })
})

describe('fromCssRules', () => {
  it('ブラウザの CSS ルールから、セレクタと宣言を取り出す', () => {
    const style = document.createElement('style')
    style.textContent = '.a:hover { color: blue; } .b { color: red; }'
    document.head.append(style)

    const rules = fromCssRules(style.sheet!.cssRules)

    expect(rules).toEqual([
      { kind: 'style', selectorText: '.a:hover', declarations: 'color: blue;' },
      { kind: 'style', selectorText: '.b', declarations: 'color: red;' },
    ])
    style.remove()
  })
})
