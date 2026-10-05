import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footer, FooterColumn, FooterLink } from './Footer'

describe('Footer', () => {
  it('footer 要素の中に、ロゴ・説明・リンクのまとまり・下の段を置く', () => {
    render(
      <Footer
        theme="dark"
        logo={<a href="/">Sample</a>}
        description="会社の説明"
        copyright="© 2026 Infigate Inc."
        legalLinks={<FooterLink href="/privacy">プライバシーポリシー</FooterLink>}
      >
        <FooterColumn title="サービス">
          <FooterLink href="/web">Webサイト制作</FooterLink>
        </FooterColumn>
      </Footer>,
    )

    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveAttribute('data-theme', 'dark')
    expect(within(footer).getByRole('link', { name: 'Sample' })).toBeInTheDocument()
    expect(within(footer).getByText('会社の説明')).toBeInTheDocument()
    expect(within(footer).getByText('© 2026 Infigate Inc.')).toBeInTheDocument()
    expect(within(footer).getByRole('link', { name: 'プライバシーポリシー' })).toHaveAttribute('href', '/privacy')
  })

  it('リンクのまとまりは名前つきのナビゲーションに入れ、見出しをリストの名前にする', () => {
    render(
      <Footer>
        <FooterColumn title="サービス">
          <FooterLink href="/web">Webサイト制作</FooterLink>
          <FooterLink href="/system">システム開発</FooterLink>
        </FooterColumn>
        <FooterColumn title="会社情報">
          <FooterLink href="/about">会社概要</FooterLink>
        </FooterColumn>
      </Footer>,
    )

    const nav = screen.getByRole('navigation', { name: 'フッターメニュー' })
    const services = within(nav).getByRole('list', { name: 'サービス' })
    expect(within(services).getAllByRole('link')).toHaveLength(2)
    expect(within(nav).getByRole('list', { name: '会社情報' })).toBeInTheDocument()
  })

  it('指定しなかった部分は出さない', () => {
    render(<Footer copyright="© 2026 Infigate Inc." />)

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.getByText('© 2026 Infigate Inc.')).toBeInTheDocument()
  })
})
