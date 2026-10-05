import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Tag } from './Tag'

describe('Tag', () => {
  it('onClick がなければ押せない（ボタンにならない）', () => {
    render(<Tag>デザイン</Tag>)

    expect(screen.getByText('デザイン')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('onClick を指定すると押せるボタンになり、selected を「押されている」と伝える', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const { rerender } = render(<Tag onClick={onClick}>デザイン</Tag>)
    const button = screen.getByRole('button', { name: 'デザイン' })

    expect(button).toHaveAttribute('aria-pressed', 'false')
    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)

    rerender(
      <Tag onClick={onClick} selected>
        デザイン
      </Tag>,
    )
    expect(screen.getByRole('button', { name: 'デザイン' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('onRemove を指定すると × が出て、押すと onRemove だけを呼ぶ', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const onRemove = vi.fn()
    render(
      <Tag onClick={onClick} onRemove={onRemove}>
        東京都
      </Tag>,
    )

    await user.click(screen.getByRole('button', { name: '東京都を削除' }))

    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('× の読み上げ名を変えられる', () => {
    render(
      <Tag onRemove={() => {}} removeLabel="条件「東京都」を外す">
        東京都
      </Tag>,
    )

    expect(screen.getByRole('button', { name: '条件「東京都」を外す' })).toBeInTheDocument()
  })

  it('キーボードでタグと × のそれぞれに移って押せる', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const onRemove = vi.fn()
    render(
      <Tag onClick={onClick} onRemove={onRemove}>
        東京都
      </Tag>,
    )

    await user.tab()
    await user.keyboard('{Enter}')
    await user.tab()
    await user.keyboard('{Enter}')

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('selected・className・ref を外側の要素に付ける', () => {
    const ref = createRef<HTMLSpanElement>()
    render(
      <Tag selected className="extra" ref={ref}>
        デザイン
      </Tag>,
    )

    expect(ref.current).toHaveClass('extra')
    expect(ref.current).toHaveAttribute('data-selected')
    expect(ref.current).toHaveTextContent('デザイン')
  })
})
