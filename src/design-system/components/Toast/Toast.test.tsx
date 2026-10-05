import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Toast } from './Toast'
import { useToast, type ShowToastOptions } from './Toast.context'
import { ToastProvider } from './ToastProvider'

describe('Toast', () => {
  it.each([
    ['success', '完了'],
    ['error', 'エラー'],
    ['warning', '注意'],
    ['info', 'お知らせ'],
  ] as const)('status="%s" はアイコンでも状態（%s）を伝える', (status, label) => {
    render(<Toast status={status} title="見出し" data-testid="toast" />)

    expect(screen.getByTestId('toast')).toHaveAttribute('data-status', status)
    expect(screen.getByTestId('toast')).toContainElement(screen.getByRole('img', { name: label }))
  })

  it('light は塗りのアイコン、solid・dark は線のアイコンにする', () => {
    const { rerender } = render(<Toast status="success" title="見出し" />)
    expect(screen.getByRole('img', { name: '完了' })).toHaveAttribute('data-variant', 'filled')

    rerender(<Toast status="success" variant="solid" title="見出し" />)
    expect(screen.getByRole('img', { name: '完了' })).toHaveAttribute('data-variant', 'line')

    rerender(<Toast status="success" variant="dark" title="見出し" />)
    expect(screen.getByRole('img', { name: '完了' })).toHaveAttribute('data-variant', 'line')
  })

  it('説明は指定したときだけ出し、icon={false} でアイコンを外せる', () => {
    const { rerender } = render(<Toast title="見出し" />)
    expect(screen.queryByText('説明')).not.toBeInTheDocument()

    rerender(<Toast title="見出し" description="説明" icon={false} />)
    expect(screen.getByText('説明')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('onClose を指定したときだけ閉じるボタンを出し、押すと onClose を呼ぶ', () => {
    const onClose = vi.fn()
    const { rerender } = render(<Toast title="見出し" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()

    rerender(<Toast title="見出し" onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: '閉じる' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe('ToastProvider・useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function Trigger(options: Partial<ShowToastOptions>) {
    const { showToast } = useToast()
    return (
      <button type="button" onClick={() => showToast({ title: '保存しました', ...options })}>
        出す
      </button>
    )
  }

  function show() {
    fireEvent.click(screen.getByRole('button', { name: '出す' }))
  }

  function advance(ms: number) {
    act(() => {
      vi.advanceTimersByTime(ms)
    })
  }

  it('出したトーストは読み上げの切れ目で伝わる場所に並ぶ', () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    )
    show()

    const list = screen.getByRole('list', { name: '通知' })
    expect(list).toHaveAttribute('aria-live', 'polite')
    expect(list).toHaveTextContent('保存しました')
  })

  it('duration が過ぎると消える', () => {
    render(
      <ToastProvider>
        <Trigger duration={3000} />
      </ToastProvider>,
    )
    show()

    advance(2900)
    expect(screen.getByText('保存しました')).toBeInTheDocument()

    advance(100)
    advance(200)
    expect(screen.queryByText('保存しました')).not.toBeInTheDocument()
  })

  it('ポインターを乗せている間は時間を止め、離すと残りの時間から数え直す', () => {
    render(
      <ToastProvider>
        <Trigger duration={3000} />
      </ToastProvider>,
    )
    show()
    advance(2000)

    fireEvent.mouseEnter(screen.getByRole('list', { name: '通知' }))
    advance(10000)
    expect(screen.getByText('保存しました')).toBeInTheDocument()

    fireEvent.mouseLeave(screen.getByRole('list', { name: '通知' }))
    advance(900)
    expect(screen.getByText('保存しました')).toBeInTheDocument()
    advance(100)
    advance(200)
    expect(screen.queryByText('保存しました')).not.toBeInTheDocument()
  })

  it('閉じるボタンで閉じられ、closable={false} なら閉じるボタンを出さない', () => {
    const { unmount } = render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    )
    show()
    fireEvent.click(screen.getByRole('button', { name: '閉じる' }))
    advance(200)
    expect(screen.queryByText('保存しました')).not.toBeInTheDocument()
    unmount()

    render(
      <ToastProvider>
        <Trigger closable={false} />
      </ToastProvider>,
    )
    show()
    expect(screen.queryByRole('button', { name: '閉じる' })).not.toBeInTheDocument()
  })

  it('max を超えた分は古いものから消す', () => {
    render(
      <ToastProvider max={2}>
        <Trigger />
      </ToastProvider>,
    )
    show()
    show()
    show()

    expect(screen.getAllByText('保存しました')).toHaveLength(2)
  })

  it('ToastProvider の外で useToast を使うとエラーにする', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Trigger />)).toThrow('ToastProvider')
    vi.restoreAllMocks()
  })
})
