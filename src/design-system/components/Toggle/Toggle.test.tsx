import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Toggle } from './Toggle'

describe('Toggle', () => {
  it('ラベルを名前として持つスイッチ（role="switch"）を描画する', () => {
    render(<Toggle>メールで通知を受け取る</Toggle>)
    const toggle = screen.getByRole('switch', { name: 'メールで通知を受け取る' })

    expect(toggle).toHaveAttribute('type', 'checkbox')
    expect(toggle).not.toBeChecked()
  })

  it('ラベルを省略したスイッチだけの形でも、aria-label で名前を付けられる', () => {
    render(<Toggle aria-label="通知" />)

    expect(screen.getByRole('switch', { name: '通知' })).toBeInTheDocument()
  })

  it('クリックとスペースキーでオン・オフを切り替え、onChange を呼ぶ', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Toggle onChange={onChange}>通知</Toggle>)
    const toggle = screen.getByRole('switch')

    await user.click(screen.getByText('通知'))
    expect(toggle).toBeChecked()

    await user.keyboard(' ')
    expect(toggle).not.toBeChecked()
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('defaultChecked で最初からオンにできる', () => {
    render(<Toggle defaultChecked>通知</Toggle>)

    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('className は外側の要素に付き、ref で input 要素を受け取れる', () => {
    const ref = createRef<HTMLInputElement>()
    render(
      <Toggle className="extra" ref={ref}>
        通知
      </Toggle>,
    )

    expect(ref.current).toBe(screen.getByRole('switch'))
    expect(ref.current?.closest('label')).toHaveClass('extra')
  })

  it('disabled のときは切り替えられない', async () => {
    const user = userEvent.setup()
    render(<Toggle disabled>通知</Toggle>)

    await user.click(screen.getByText('通知'))

    expect(screen.getByRole('switch')).toBeDisabled()
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('外の label・説明文と id でつなげられる', () => {
    render(
      <>
        <label htmlFor="mail">メール通知</label>
        <p id="mail-description">新着をお知らせします</p>
        <Toggle id="mail" aria-describedby="mail-description" />
      </>,
    )

    expect(screen.getByRole('switch', { name: 'メール通知' })).toHaveAccessibleDescription('新着をお知らせします')
  })
})
