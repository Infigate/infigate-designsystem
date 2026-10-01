import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Icon } from './Icon'
import { FILLED_ICON_NAMES, ICON_NAMES, ICON_SIZES } from './Icon.constants'

function renderIcon(ui: React.ReactElement) {
  const { container } = render(ui)
  return container.querySelector('svg')!
}

describe('Icon', () => {
  describe('描画', () => {
    it('24×24 の座標系で、既定は 24px・線（line）で描画する', () => {
      const svg = renderIcon(<Icon name="plus" />)

      expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
      expect(svg).toHaveAttribute('data-icon', 'plus')
      expect(svg).toHaveAttribute('data-size', '24')
      expect(svg).toHaveAttribute('data-variant', 'line')
    })

    it.each(ICON_SIZES)('size=%i を反映する', (size) => {
      expect(renderIcon(<Icon name="plus" size={size} />)).toHaveAttribute('data-size', String(size))
    })

    it('variant="filled" で塗りの版を描画する', () => {
      const line = renderIcon(<Icon name="info" />)
      const lineShapes = line.innerHTML
      const filled = renderIcon(<Icon name="info" variant="filled" />)

      expect(filled).toHaveAttribute('data-variant', 'filled')
      expect(filled.innerHTML).not.toBe(lineShapes)
      expect(filled.querySelector('[data-knockout]')).not.toBeNull()
    })

    it('塗りの版がないアイコンに filled を指定しても、線の版で描画する', () => {
      // @ts-expect-error 塗りの版がないアイコンには variant="filled" を指定できない（型で防ぐ）
      const svg = renderIcon(<Icon name="plus" variant="filled" />)

      expect(svg.querySelector('path')).toHaveAttribute('stroke', 'currentColor')
    })

    it('className を既存のクラスに追加し、その他の属性と ref を渡す', () => {
      const ref = createRef<SVGSVGElement>()
      const svg = renderIcon(<Icon name="plus" className="custom" data-testid="icon" ref={ref} />)

      expect(svg).toHaveClass('custom')
      expect(svg.classList.length).toBeGreaterThan(1)
      expect(svg).toHaveAttribute('data-testid', 'icon')
      expect(ref.current).toBe(svg)
    })
  })

  describe('アクセシビリティ', () => {
    it('label がなければ装飾として支援技術から隠す', () => {
      const svg = renderIcon(<Icon name="search" />)

      expect(svg).toHaveAttribute('aria-hidden', 'true')
      expect(svg).not.toHaveAttribute('role')
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('label があれば、その名前を持つ画像として扱う', () => {
      render(<Icon name="search" label="検索" />)

      expect(screen.getByRole('img', { name: '検索' })).not.toHaveAttribute('aria-hidden')
    })

    it('キーボードのフォーカス対象にしない', () => {
      expect(renderIcon(<Icon name="search" />)).toHaveAttribute('focusable', 'false')
    })
  })

  describe('登録されているアイコン', () => {
    it('名前は英小文字・数字・ハイフン（Figma の icon/名前・Lucide の名前と同じ形式）で、名前順に並んでいる', () => {
      for (const name of ICON_NAMES) expect(name).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(ICON_NAMES).toEqual([...ICON_NAMES].sort())
    })

    it('状態を表すアイコンは塗りの版を持つ（Figma: アラート・トーストで使う）', () => {
      expect(FILLED_ICON_NAMES).toEqual(expect.arrayContaining(['circle-check', 'circle-x', 'info', 'triangle-alert']))
    })

    const allVariants = [
      ...ICON_NAMES.map((name) => [name, 'line'] as const),
      ...FILLED_ICON_NAMES.map((name) => [name, 'filled'] as const),
    ]

    it.each(allVariants)('%s（%s）は図形を持ち、色は currentColor か白抜きだけを使う', (name, variant) => {
      const svg = renderIcon(variant === 'filled' ? <Icon name={name as 'info'} variant="filled" /> : <Icon name={name} />)
      const shapes = [...svg.children]

      expect(shapes.length).toBeGreaterThan(0)
      for (const shape of shapes) {
        for (const paint of ['fill', 'stroke']) {
          const value = shape.getAttribute(paint)
          if (value !== null) expect(['currentColor', 'none'], `${shape.outerHTML} の ${paint}`).toContain(value)
        }
      }
    })
  })
})
