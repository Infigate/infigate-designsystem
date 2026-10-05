import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb'

function renderLevels(levels: number, maxItems?: number) {
  return render(
    <Breadcrumb maxItems={maxItems}>
      {Array.from({ length: levels }, (_, index) => (
        <BreadcrumbItem key={index} href={`/p${index}`}>
          {`項目${index}`}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>,
  )
}

describe('Breadcrumb', () => {
  it('名前つきのナビゲーションの中に、順番つきのリストで並べる', () => {
    renderLevels(3)

    const nav = screen.getByRole('navigation', { name: 'パンくずリスト' })
    expect(within(nav).getAllByRole('listitem')).toHaveLength(3)
  })

  it('祖先はリンクにし、最後の項目は押せない文字にして今いるページだと伝える', () => {
    renderLevels(3)

    expect(screen.getByRole('link', { name: '項目0' })).toHaveAttribute('href', '/p0')
    expect(screen.getByRole('link', { name: '項目1' })).toHaveAttribute('href', '/p1')
    expect(screen.queryByRole('link', { name: '項目2' })).not.toBeInTheDocument()
    expect(screen.getByText('項目2')).toHaveAttribute('aria-current', 'page')
  })

  it('区切りのアイコンは読み上げない', () => {
    const { container } = renderLevels(3)

    const separators = container.querySelectorAll('svg[data-icon="chevron-right"]')
    expect(separators).toHaveLength(2)
    separators.forEach((separator) => expect(separator).toHaveAttribute('aria-hidden', 'true'))
  })

  it('maxItems を超えると、起点と最後の2つを残して中間を「…」で省略する', () => {
    renderLevels(7)

    const items = screen.getAllByRole('listitem').map((item) => item.textContent)
    expect(items).toEqual(['項目0', '…', '項目5', '項目6'])
  })

  it('maxItems 以下なら省略しない', () => {
    renderLevels(5)

    expect(screen.queryByText('…')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
  })
})
