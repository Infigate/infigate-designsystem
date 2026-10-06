import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Modal, type ModalProps } from './Modal'

function renderModal(props: Partial<ModalProps> = {}) {
  return render(
    <Modal open title="変更を保存しますか" onClose={() => {}} actions={<button type="button">保存する</button>} {...props}>
      保存すると変更が表示されます。
    </Modal>,
  )
}

describe('Modal', () => {
  it('見出しを名前、本文を説明にしたダイアログとして開く', () => {
    renderModal()

    const dialog = screen.getByRole('dialog', { name: '変更を保存しますか' })
    expect(dialog).toHaveAttribute('open')
    expect(dialog).toHaveAccessibleDescription('保存すると変更が表示されます。')
    expect(screen.getByRole('heading', { name: '変更を保存しますか' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '保存する' })).toBeInTheDocument()
  })

  it('confirm は alertdialog にして、警告のアイコンを出す', () => {
    const { container } = renderModal({ variant: 'confirm' })

    expect(screen.getByRole('alertdialog', { name: '変更を保存しますか' })).toBeInTheDocument()
    expect(container.querySelector('svg[data-icon="triangle-alert"]')).toBeInTheDocument()
  })

  it('icon={false} でアイコンを外す', () => {
    const { container } = renderModal({ icon: false })

    expect(container.querySelector('svg[data-icon="info"]')).not.toBeInTheDocument()
  })

  it('閉じるボタンと Esc で onClose を呼ぶ', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderModal({ onClose })

    await user.click(screen.getByRole('button', { name: '閉じる' }))
    screen.getByRole('dialog').dispatchEvent(new Event('cancel', { cancelable: true }))

    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('open を false にすると閉じ、後ろの画面のスクロールを戻す', async () => {
    const user = userEvent.setup()

    function Example() {
      const [open, setOpen] = useState(true)
      return (
        <Modal open={open} title="確認" onClose={() => setOpen(false)}>
          本文
        </Modal>
      )
    }
    render(<Example />)
    expect(document.documentElement.style.overflow).toBe('hidden')

    await user.click(screen.getByRole('button', { name: '閉じる' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.documentElement.style.overflow).toBe('')
  })
})
