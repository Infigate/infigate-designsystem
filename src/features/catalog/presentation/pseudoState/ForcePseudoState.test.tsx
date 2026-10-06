import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ForcePseudoState, IgnoreForcedPseudoState } from './ForcePseudoState'

const STYLE_ID = 'catalog-forced-pseudo-states'

describe('ForcePseudoState', () => {
  afterEach(() => {
    document.getElementById(STYLE_ID)?.remove()
    document.querySelectorAll('style[data-test]').forEach((style) => style.remove())
  })

  it('指定した擬似クラスを、中の要素を囲む属性として付ける', () => {
    render(
      <ForcePseudoState state={['focus', 'focus-visible']}>
        <button type="button">保存</button>
      </ForcePseudoState>,
    )

    expect(screen.getByRole('button').parentElement).toHaveAttribute('data-force-pseudo', 'focus focus-visible')
  })

  it('IgnoreForcedPseudoState で囲んだ部分には、状態を強制しない印を付ける', () => {
    render(
      <ForcePseudoState state={['hover']}>
        <IgnoreForcedPseudoState>
          <button type="button">保存</button>
        </IgnoreForcedPseudoState>
      </ForcePseudoState>,
    )

    expect(screen.getByRole('button').parentElement).toHaveAttribute('data-force-pseudo-ignore')
  })

  it('ページの CSS から、擬似クラスを強制するためのスタイルを差し込む', () => {
    document.head.insertAdjacentHTML('beforeend', '<style data-test>.btn:hover { color: blue; }</style>')

    render(
      <ForcePseudoState state={['hover']}>
        <button type="button">保存</button>
      </ForcePseudoState>,
    )

    expect(document.getElementById(STYLE_ID)?.textContent).toBe(
      ".btn:is(:hover, [data-force-pseudo~='hover'] :not([data-force-pseudo-ignore] *)) { color: blue; }",
    )
  })

  it('state を指定しなければ何もしない', () => {
    render(
      <ForcePseudoState>
        <button type="button">保存</button>
      </ForcePseudoState>,
    )

    expect(screen.getByRole('button').parentElement).not.toHaveAttribute('data-force-pseudo')
    expect(document.getElementById(STYLE_ID)).toBeNull()
  })
})
