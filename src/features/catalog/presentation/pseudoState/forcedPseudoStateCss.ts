/**
 * :hover などの擬似クラスを、マウスやキーボードを使わずに再現するための CSS を作る。
 *
 * ページ内の CSS から擬似クラスを含むルールを集め、
 *   .button:hover  →  .button:is(:hover, [data-force-pseudo~='hover'] :not([data-force-pseudo-ignore] *))
 * のように「実際にその状態」か「強制指定した範囲の中にある」ときに当たるルールを追加する。
 * 部品の CSS には手を入れずに、カタログ上で全状態を見せられる。
 * 範囲の中でも、data-force-pseudo-ignore を付けた要素の中（カードの中のボタンなど）には当てない。
 */

export const FORCEABLE_PSEUDO_CLASSES = ['hover', 'active', 'focus', 'focus-visible'] as const
export type ForceablePseudoClass = (typeof FORCEABLE_PSEUDO_CLASSES)[number]

export const FORCE_ATTRIBUTE = 'data-force-pseudo'
export const FORCE_IGNORE_ATTRIBUTE = 'data-force-pseudo-ignore'

// focus-visible を focus より先に置き、:focus-within などの別の擬似クラスには当てない
const PSEUDO_PATTERN = /:(hover|active|focus-visible|focus)(?![\w-])/g

/** セレクタの擬似クラスを「実際の状態 または 強制指定の範囲内」に置き換える。対象がなければ null */
export function toForcedSelector(selector: string): string | null {
  let changed = false
  const forced = selector.replace(PSEUDO_PATTERN, (_match, pseudo: string) => {
    changed = true
    return `:is(:${pseudo}, [${FORCE_ATTRIBUTE}~='${pseudo}'] :not([${FORCE_IGNORE_ATTRIBUTE}] *))`
  })
  return changed ? forced : null
}

/** CSS ルールのうち、ここで扱うものの形 */
export type RuleLike =
  | { readonly kind: 'style'; readonly selectorText: string; readonly declarations: string }
  | { readonly kind: 'condition'; readonly atRule: '@media' | '@supports'; readonly condition: string; readonly rules: readonly RuleLike[] }
  | { readonly kind: 'other' }

/** ブラウザの CSS ルール（CSSOM）を、扱いやすい形に変換する */
export function fromCssRules(rules: ArrayLike<CSSRule>): RuleLike[] {
  return Array.from(rules, (rule): RuleLike => {
    if ('selectorText' in rule && 'style' in rule) {
      const styleRule = rule as CSSStyleRule
      return { kind: 'style', selectorText: styleRule.selectorText, declarations: styleRule.style.cssText }
    }
    if ('conditionText' in rule && 'cssRules' in rule) {
      const conditionRule = rule as CSSConditionRule
      return {
        kind: 'condition',
        atRule: rule.constructor.name === 'CSSSupportsRule' ? '@supports' : '@media',
        condition: conditionRule.conditionText,
        rules: fromCssRules(conditionRule.cssRules),
      }
    }
    return { kind: 'other' }
  })
}

/** ルールの一覧から、強制用の CSS を作る（@media・@supports の中も対象にする） */
export function buildForcedPseudoCss(rules: readonly RuleLike[]): string {
  const blocks: string[] = []

  for (const rule of rules) {
    if (rule.kind === 'style') {
      const selector = toForcedSelector(rule.selectorText)
      if (selector) blocks.push(`${selector} { ${rule.declarations} }`)
    } else if (rule.kind === 'condition') {
      const inner = buildForcedPseudoCss(rule.rules)
      if (inner) blocks.push(`${rule.atRule} ${rule.condition} { ${inner} }`)
    }
  }

  return blocks.join('\n')
}
