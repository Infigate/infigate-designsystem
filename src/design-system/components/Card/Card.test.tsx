import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Card } from './Card'

describe('Card', () => {
  it('見出し・本文・画像・小さな情報・ボタンを並べる', () => {
    render(
      <Card
        title="見出し"
        description="本文"
        media={<img src="/a.jpg" alt="写真" />}
        meta={<span>バッジ</span>}
        actions={<button type="button">詳しく</button>}
      />,
    )

    expect(screen.getByRole('article')).toContainElement(screen.getByRole('heading', { level: 3, name: '見出し' }))
    expect(screen.getByText('本文')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '写真' })).toBeInTheDocument()
    expect(screen.getByText('バッジ')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '詳しく' })).toBeInTheDocument()
  })

  it('href を指定すると、見出しがリンクになりカード全体で押せる', () => {
    render(<Card title="見出し" href="/works/1" headingLevel={2} />)

    const link = screen.getByRole('link', { name: '見出し' })
    expect(link).toHaveAttribute('href', '/works/1')
    expect(screen.getByRole('heading', { level: 2 })).toContainElement(link)
    expect(screen.getByRole('article')).toHaveAttribute('data-interactive')
  })

  it('中のボタンはリンクの外に置き、リンクとは別に押せる', async () => {
    const user = userEvent.setup()
    const onLink = vi.fn((event: React.MouseEvent) => event.preventDefault())
    const onAction = vi.fn()
    render(
      <Card
        title="見出し"
        href="/works/1"
        linkProps={{ onClick: onLink }}
        actions={
          <button type="button" onClick={onAction}>
            詳しく
          </button>
        }
      />,
    )

    expect(screen.getByRole('link')).not.toContainElement(screen.getByRole('button'))
    await user.click(screen.getByRole('button', { name: '詳しく' }))
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onLink).not.toHaveBeenCalled()
  })

  it('disabled ではリンクを外して押せなくする', () => {
    render(<Card title="見出し" href="/works/1" disabled />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByRole('article')).toHaveAttribute('aria-disabled', 'true')
  })
})
