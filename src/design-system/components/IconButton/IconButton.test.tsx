import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { IconButton } from './IconButton'
import { ICON_BUTTON_SIZES } from './IconButton.constants'

describe('IconButton', () => {
  it('aria-label を名前に持つボタンで、アイコンは読み上げない', () => {
    render(<IconButton icon="more-horizontal" aria-label="その他の操作" />)
    const button = screen.getByRole('button', { name: 'その他の操作' })

    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveAttribute('data-size', 'md')
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it.each(ICON_BUTTON_SIZES)('size="%s" で大きさとアイコンの大きさを変える', (size) => {
    render(<IconButton icon="x" aria-label="閉じる" size={size} />)
    const button = screen.getByRole('button')

    expect(button).toHaveAttribute('data-size', size)
    expect(button.querySelector('svg')).toHaveAttribute('data-size', size === 'sm' ? '20' : '24')
  })

  it('押すと onClick を呼び、disabled のときは呼ばない', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const { rerender } = render(<IconButton icon="x" aria-label="閉じる" onClick={onClick} />)

    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)

    rerender(<IconButton icon="x" aria-label="閉じる" onClick={onClick} disabled />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('className と ref を受け取れる', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<IconButton icon="x" aria-label="閉じる" className="extra" ref={ref} />)

    expect(ref.current).toBe(screen.getByRole('button'))
    expect(ref.current).toHaveClass('extra')
  })
})
