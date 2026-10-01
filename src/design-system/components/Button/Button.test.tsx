import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'
import { BUTTON_SIZES, BUTTON_VARIANTS } from './Button.constants'

describe('Button', () => {
  describe('描画', () => {
    it('children をアクセシブルネームとして持つボタンを描画する', () => {
      render(<Button>保存する</Button>)

      expect(screen.getByRole('button', { name: '保存する' })).toBeInTheDocument()
    })

    it('既定値は variant=primary / size=md / type=button', () => {
      render(<Button>保存する</Button>)
      const button = screen.getByRole('button')

      expect(button).toHaveAttribute('data-variant', 'primary')
      expect(button).toHaveAttribute('data-size', 'md')
      // form 内で意図せず submit しないよう、既定は type="button"
      expect(button).toHaveAttribute('type', 'button')
    })

    it.each(BUTTON_VARIANTS)('variant="%s" を反映する', (variant) => {
      render(<Button variant={variant}>ボタン</Button>)

      expect(screen.getByRole('button')).toHaveAttribute('data-variant', variant)
    })

    it.each(BUTTON_SIZES)('size="%s" を反映する', (size) => {
      render(<Button size={size}>ボタン</Button>)

      expect(screen.getByRole('button')).toHaveAttribute('data-size', size)
    })

    it('fullWidth のときだけ data-full-width を付与する', () => {
      const { rerender } = render(<Button>ボタン</Button>)
      expect(screen.getByRole('button')).not.toHaveAttribute('data-full-width')

      rerender(<Button fullWidth>ボタン</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('data-full-width')
    })

    it('type を上書きできる', () => {
      render(<Button type="submit">送信</Button>)

      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('className を既存のクラスに追加する', () => {
      render(<Button className="custom">ボタン</Button>)
      const button = screen.getByRole('button')

      expect(button).toHaveClass('custom')
      expect(button.classList.length).toBeGreaterThan(1)
    })

    it('ネイティブ属性（aria-* など）をそのまま渡す', () => {
      render(<Button aria-describedby="hint">ボタン</Button>)

      expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', 'hint')
    })

    it('ref で button 要素を参照できる', () => {
      const ref = createRef<HTMLButtonElement>()
      render(<Button ref={ref}>ボタン</Button>)

      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })

  describe('操作', () => {
    it('クリックで onClick を呼ぶ', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      render(<Button onClick={onClick}>保存する</Button>)

      await user.click(screen.getByRole('button'))

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('キーボード（Enter / Space）でも onClick を呼ぶ', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      render(<Button onClick={onClick}>保存する</Button>)

      await user.tab()
      expect(screen.getByRole('button')).toHaveFocus()
      await user.keyboard('{Enter}')
      await user.keyboard(' ')

      expect(onClick).toHaveBeenCalledTimes(2)
    })

    it('disabled のときは操作できない', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      render(
        <Button disabled onClick={onClick}>
          保存する
        </Button>,
      )

      await user.click(screen.getByRole('button'))

      expect(screen.getByRole('button')).toBeDisabled()
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('loading', () => {
    it('処理中であることを支援技術に伝え、操作を無効にする', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      render(
        <Button loading onClick={onClick}>
          保存する
        </Button>,
      )
      const button = screen.getByRole('button', { name: '保存する' })

      await user.click(button)

      expect(button).toHaveAttribute('aria-busy', 'true')
      expect(button).toBeDisabled()
      expect(onClick).not.toHaveBeenCalled()
    })

    it('loading でなければ aria-busy を付与しない', () => {
      render(<Button>保存する</Button>)

      expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy')
    })
  })
})
