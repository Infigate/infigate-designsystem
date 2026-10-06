import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar, AvatarGroup } from './Avatar'

describe('Avatar', () => {
  it('写真があれば写真を出し、なければ人の形の表示にする', () => {
    const { container, rerender } = render(<Avatar src="/photo.jpg" />)
    expect(container.querySelector('img')).toHaveAttribute('src', '/photo.jpg')

    rerender(<Avatar />)
    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('写真が読み込めないときは人の形の表示に切り替え、別の写真になったらもう一度試す', () => {
    const { container, rerender } = render(<Avatar src="/broken.jpg" />)
    fireEvent.error(container.querySelector('img')!)
    expect(container.querySelector('img')).not.toBeInTheDocument()

    rerender(<Avatar src="/photo.jpg" />)
    expect(container.querySelector('img')).toHaveAttribute('src', '/photo.jpg')
  })

  it('alt がなければ装飾として読み上げず、あれば名前として読み上げる', () => {
    const { container, rerender } = render(<Avatar src="/photo.jpg" />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')

    rerender(<Avatar src="/photo.jpg" alt="山田 太郎" />)
    expect(screen.getByRole('img', { name: '山田 太郎' })).toBeInTheDocument()
  })
})

describe('AvatarGroup', () => {
  it('max を超えた分は「+人数」にまとめて、残りの人数を読み上げる', () => {
    render(
      <AvatarGroup max={2} aria-label="参加者">
        <Avatar alt="A" />
        <Avatar alt="B" />
        <Avatar alt="C" />
        <Avatar alt="D" />
      </AvatarGroup>,
    )

    const group = screen.getByRole('group', { name: '参加者' })
    expect(group).toHaveTextContent('+2')
    expect(screen.getByRole('img', { name: 'ほか2人' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'B' })).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'C' })).not.toBeInTheDocument()
  })

  it('max 以下なら全員を出し、「+人数」は出さない', () => {
    render(
      <AvatarGroup>
        <Avatar alt="A" />
        <Avatar alt="B" />
      </AvatarGroup>,
    )

    expect(screen.getAllByRole('img')).toHaveLength(2)
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })
})
