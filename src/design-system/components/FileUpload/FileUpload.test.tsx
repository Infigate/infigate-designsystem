import { createRef } from 'react'
import { createEvent, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FileItem, FileList } from './FileItem'
import { FileUpload } from './FileUpload'
import { formatFileSize } from './FileUpload.utils'

const HINT = 'PNG・JPG・PDF / 1ファイル 10MB まで'
const file = (name: string, size = 10) => new File(['x'.repeat(size)], name, { type: 'application/pdf' })
const input = (container: HTMLElement) => container.querySelector<HTMLInputElement>('input[type="file"]')!
const zone = () => screen.getByText('ここにファイルをドラッグ＆ドロップ').closest('div')!

/** ファイルを運んできたときのイベントを起こす（jsdom には DataTransfer がないので、必要な分だけ用意する） */
function drag(type: 'dragEnter' | 'dragOver' | 'dragLeave' | 'drop', target: Element, files: File[] = []) {
  const event = createEvent[type](target)
  Object.defineProperty(event, 'dataTransfer', { value: { types: ['Files'], files, dropEffect: 'none' } })
  fireEvent(target, event)
  return event
}

describe('formatFileSize', () => {
  it.each([
    [512, '512 B'],
    [1536, '1.5 KB'],
    [2.4 * 1024 * 1024, '2.4 MB'],
    [3 * 1024 ** 3, '3.0 GB'],
  ])('%d バイトを「%s」と表す', (bytes, text) => {
    expect(formatFileSize(bytes)).toBe(text)
  })
})

describe('FileUpload', () => {
  it('案内・ボタン・形式と容量を表示し、ボタンの説明に形式と容量をつなぐ', () => {
    render(<FileUpload hint={HINT} onSelect={() => {}} />)

    expect(screen.getByText('ここにファイルをドラッグ＆ドロップ')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ファイルを選択' })).toHaveAccessibleDescription(HINT)
  })

  it('「ファイルを選択」でファイルを選ぶと onSelect を呼ぶ', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { container } = render(<FileUpload hint={HINT} onSelect={onSelect} accept=".pdf" />)
    const click = vi.spyOn(input(container), 'click')

    await user.click(screen.getByRole('button', { name: 'ファイルを選択' }))
    expect(click).toHaveBeenCalledTimes(1)

    await user.upload(input(container), file('見積書.pdf'))
    expect(onSelect).toHaveBeenCalledWith([expect.objectContaining({ name: '見積書.pdf' })])
    expect(input(container)).toHaveAttribute('accept', '.pdf')
  })

  it('枠のどこをクリックしても、ファイルを選ぶ画面を開く', async () => {
    const user = userEvent.setup()
    const { container } = render(<FileUpload hint={HINT} onSelect={() => {}} />)
    const click = vi.spyOn(input(container), 'click')

    await user.click(screen.getByText(HINT))

    expect(click).toHaveBeenCalledTimes(1)
  })

  it('multiple でなければ、複数選んでも先頭の1件だけを渡す', () => {
    const onSelect = vi.fn()
    const { container } = render(<FileUpload hint={HINT} onSelect={onSelect} />)
    // multiple でない input には userEvent でも1件しか入らないので、change を直接起こす
    const files = [file('a.pdf'), file('b.pdf')]
    Object.defineProperty(input(container), 'files', { value: files, configurable: true })
    fireEvent.change(input(container))

    expect(onSelect).toHaveBeenCalledWith([files[0]])
  })

  it('ファイルを運んでくると Dragover の見た目になり、離すと onSelect を呼ぶ', () => {
    const onSelect = vi.fn()
    render(<FileUpload hint={HINT} onSelect={onSelect} multiple />)
    const files = [file('a.pdf'), file('b.pdf')]

    drag('dragEnter', zone())
    expect(zone()).toHaveAttribute('data-dragover')
    expect(drag('dragOver', zone()).defaultPrevented).toBe(true)

    drag('drop', zone(), files)
    expect(zone()).not.toHaveAttribute('data-dragover')
    expect(onSelect).toHaveBeenCalledWith(files)
  })

  it('枠の中の要素に出入りしても Dragover のままで、枠から出ると戻る', () => {
    render(<FileUpload hint={HINT} onSelect={() => {}} />)
    const title = screen.getByText('ここにファイルをドラッグ＆ドロップ')

    drag('dragEnter', zone())
    drag('dragEnter', title)
    drag('dragLeave', title)
    expect(zone()).toHaveAttribute('data-dragover')

    drag('dragLeave', zone())
    expect(zone()).not.toHaveAttribute('data-dragover')
  })

  it('layout="mobile" ではドラッグの案内を出さない', () => {
    render(<FileUpload hint={HINT} onSelect={() => {}} layout="mobile" />)

    expect(screen.getByText('ファイルをアップロード').closest('[data-layout]')).toHaveAttribute('data-layout', 'mobile')
  })

  it('className は枠に付き、ref で input 要素を受け取れる', () => {
    const ref = createRef<HTMLInputElement>()
    const { container } = render(<FileUpload hint={HINT} onSelect={() => {}} className="extra" ref={ref} />)

    expect(ref.current).toBe(input(container))
    expect(zone()).toHaveClass('extra')
  })
})

describe('FileItem', () => {
  const renderItem = (props: Partial<Parameters<typeof FileItem>[0]> = {}) => {
    const onRemove = vi.fn()
    render(
      <FileList aria-label="選んだファイル">
        <FileItem name="見積書.pdf" status="uploading" onRemove={onRemove} {...props} />
      </FileList>,
    )
    return onRemove
  }

  it('送信中は、進み具合をバーで見せる', () => {
    renderItem({ progress: 40 })

    expect(screen.getByRole('progressbar', { name: '見積書.pdfを送信中' })).toHaveAttribute('aria-valuenow', '40')
  })

  it('完了は、完了のアイコンと容量を見せる', () => {
    renderItem({ status: 'done', size: 2.4 * 1024 * 1024 })

    expect(screen.getByRole('img', { name: '完了' })).toBeInTheDocument()
    expect(screen.getByText('2.4 MB')).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('失敗は、エラーのアイコンと理由を見せる', () => {
    renderItem({ status: 'error', error: 'ファイルの形式が対応していません' })

    expect(screen.getByRole('listitem')).toHaveAttribute('data-status', 'error')
    expect(screen.getByRole('img', { name: 'エラー' })).toBeInTheDocument()
    expect(screen.getByText('ファイルの形式が対応していません')).toBeInTheDocument()
  })

  it('× で取り消せる', async () => {
    const user = userEvent.setup()
    const onRemove = renderItem()

    await user.click(screen.getByRole('button', { name: '見積書.pdfを削除' }))

    expect(onRemove).toHaveBeenCalledTimes(1)
  })
})
