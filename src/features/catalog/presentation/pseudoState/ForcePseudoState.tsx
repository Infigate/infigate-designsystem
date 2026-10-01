import { useLayoutEffect, type ReactNode } from 'react'
import { buildForcedPseudoCss, FORCE_ATTRIBUTE, fromCssRules, type ForceablePseudoClass } from './forcedPseudoStateCss'

const STYLE_ELEMENT_ID = 'catalog-forced-pseudo-states'

/** ページ内の CSS から強制用のルールを作り、<style> として差し込む（呼ぶたびに作り直す） */
function installForcedPseudoStyles() {
  const rules = Array.from(document.styleSheets)
    .filter((sheet) => (sheet.ownerNode as Element | null)?.id !== STYLE_ELEMENT_ID)
    .flatMap((sheet) => {
      try {
        return fromCssRules(sheet.cssRules)
      } catch {
        return [] // 別オリジンのスタイルシートは読めないので対象外
      }
    })

  let style = document.getElementById(STYLE_ELEMENT_ID)
  if (!style) {
    style = document.createElement('style')
    style.id = STYLE_ELEMENT_ID
    document.head.append(style)
  }
  style.textContent = buildForcedPseudoCss(rules)
}

type ForcePseudoStateProps = {
  /** 強制する擬似クラス（例: ['hover']）。省略すると通常どおり */
  state?: readonly ForceablePseudoClass[]
  children: ReactNode
}

/**
 * 中の要素を、指定した擬似クラスの状態で表示する（カタログの見本用）。
 * 例: <ForcePseudoState state={['hover']}><Button>保存</Button></ForcePseudoState>
 */
export function ForcePseudoState({ state, children }: ForcePseudoStateProps) {
  const value = state?.length ? state.join(' ') : undefined

  useLayoutEffect(() => {
    if (value) installForcedPseudoStyles()
  }, [value])

  return (
    <div {...{ [FORCE_ATTRIBUTE]: value }} style={{ display: 'contents' }}>
      {children}
    </div>
  )
}
