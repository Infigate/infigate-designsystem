import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Header, HeaderNavItem } from './Header'

function renderHeader(props: Partial<Parameters<typeof Header>[0]> = {}) {
  return render(
    <>
      <Header logo={<a href="/">Sample</a>} actions={<button type="button">お問い合わせ</button>} {...props}>
        <HeaderNavItem href="/services" current>
          サービス
        </HeaderNavItem>
        <HeaderNavItem href="/works">実績</HeaderNavItem>
      </Header>
      <p>本文</p>
    </>,
  )
}

describe('Header', () => {
  it('header 要素の中に、名前つきのナビゲーションと操作を置く', () => {
    renderHeader({ theme: 'dark' })

    expect(screen.getByRole('banner')).toHaveAttribute('data-theme', 'dark')
    const nav = screen.getByRole('navigation', { name: 'メインメニュー' })
    expect(nav).toContainElement(screen.getByRole('link', { name: '実績' }))
    expect(screen.getByRole('button', { name: 'お問い合わせ' })).toBeInTheDocument()
  })

  it('logo は省略でき、そのときはロゴの場所を作らない', () => {
    const { container } = render(
      <Header>
        <HeaderNavItem href="/works">実績</HeaderNavItem>
      </Header>,
    )

    expect(container.querySelector('header')?.firstElementChild?.firstElementChild).toHaveAttribute('aria-label', 'メニュー')
  })

  it('今いるページの項目は aria-current="page" で伝える', () => {
    renderHeader()

    expect(screen.getByRole('link', { name: 'サービス' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: '実績' })).not.toHaveAttribute('aria-current')
  })

  it('メニューボタンで開閉し、開閉の状態とメニューの場所を伝える', async () => {
    const user = userEvent.setup()
    renderHeader()
    const toggle = screen.getByRole('button', { name: 'メニュー' })
    const panel = document.getElementById(toggle.getAttribute('aria-controls')!)!

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(panel).not.toHaveAttribute('data-open')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(panel).toHaveAttribute('data-open')
    expect(panel).toContainElement(screen.getByRole('navigation'))

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('開いたメニューは Esc で閉じ、メニューボタンにフォーカスを戻す', async () => {
    const user = userEvent.setup()
    renderHeader({ defaultMenuOpen: true })
    const toggle = screen.getByRole('button', { name: 'メニュー' })

    screen.getByRole('link', { name: '実績' }).focus()
    await user.keyboard('{Escape}')

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })

  it('項目を押すか、ヘッダーの外を押すとメニューを閉じる', () => {
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault())
    render(
      <>
        <Header logo="Sample" defaultMenuOpen>
          <HeaderNavItem href="/works" onClick={onClick}>
            実績
          </HeaderNavItem>
        </Header>
        <p>本文</p>
      </>,
    )
    const toggle = screen.getByRole('button', { name: 'メニュー' })

    fireEvent.click(screen.getByRole('link', { name: '実績' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    fireEvent.pointerDown(screen.getByText('本文'))
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('右端の操作を押したときもメニューを閉じる', () => {
    const onClick = vi.fn()
    render(
      <Header logo="Sample" actions={<button type="button" onClick={onClick}>お問い合わせ</button>} defaultMenuOpen />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'お問い合わせ' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'メニュー' })).toHaveAttribute('aria-expanded', 'false')
  })
})
