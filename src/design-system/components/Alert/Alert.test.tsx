import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Alert } from './Alert'

describe('Alert', () => {
  it.each([
    ['error', 'alert', 'エラー'],
    ['warning', 'alert', '注意'],
    ['success', 'status', '完了'],
    ['info', 'status', 'お知らせ'],
  ] as const)('status="%s" は role="%s" で、アイコンでも状態（%s）を伝える', (status, role, label) => {
    render(<Alert status={status} title="見出し" />)
    const alert = screen.getByRole(role)

    expect(alert).toHaveAttribute('data-status', status)
    expect(alert).toContainElement(screen.getByRole('img', { name: label }))
  })

  it('本文やアクションがあれば複数行、見出しだけなら1行の表示にする', () => {
    const { rerender } = render(
      <Alert title="保存しました" data-testid="alert">
        変更は次の更新から反映されます。
      </Alert>,
    )
    expect(screen.getByTestId('alert')).toHaveAttribute('data-layout', 'multi')
    expect(screen.getByText('変更は次の更新から反映されます。')).toBeInTheDocument()

    rerender(<Alert title="保存しました" data-testid="alert" />)
    expect(screen.getByTestId('alert')).toHaveAttribute('data-layout', 'single')

    rerender(<Alert title="保存しました" data-testid="alert" actions={<button type="button">元に戻す</button>} />)
    expect(screen.getByTestId('alert')).toHaveAttribute('data-layout', 'multi')
    expect(screen.getByRole('button', { name: '元に戻す' })).toBeInTheDocument()
  })

  it('onClose を指定したときだけ閉じるボタンを出し、押すと onClose を呼ぶ', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { rerender } = render(<Alert title="保存しました" />)
    expect(screen.queryByRole('button', { name: '閉じる' })).not.toBeInTheDocument()

    rerender(<Alert title="保存しました" onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: '閉じる' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('閉じるボタンの読み上げ名を変えられる', () => {
    render(<Alert title="お知らせ" onClose={() => {}} closeLabel="お知らせを閉じる" />)

    expect(screen.getByRole('button', { name: 'お知らせを閉じる' })).toBeInTheDocument()
  })

  it('既定は info で、className と ref を受け取れる', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Alert title="お知らせ" className="extra" ref={ref} />)

    expect(ref.current).toBe(screen.getByRole('status'))
    expect(ref.current).toHaveAttribute('data-status', 'info')
    expect(ref.current).toHaveClass('extra')
  })
})
