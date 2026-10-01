import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'
import { BUTTON_SIZES, BUTTON_THEMES, BUTTON_VARIANTS } from './Button.constants'

describe('Button', () => {
  describe('描画', () => {
    it('children をアクセシブルネームとして持つボタンを描画する', () => {
      render(<Button>保存する</Button>)

      expect(screen.getByRole('button', { name: '保存する' })).toBeInTheDocument()
    })

    it('既定は variant=solid / theme=primary / size=md / type=button', () => {
      render(<Button>保存する</Button>)
      const button = screen.getByRole('button')

      expect(button).toHaveAttribute('data-variant', 'solid')
      expect(button).toHaveAttribute('data-theme', 'primary')
      expect(button).toHaveAttribute('data-size', 'md')
      // form 内で意図せず submit しないよう、既定は type="button"
      expect(button).toHaveAttribute('type', 'button')
    })

    it.each(BUTTON_VARIANTS)('variant="%s" を反映する', (variant) => {
      render(<Button variant={variant}>ボタン</Button>)

      expect(screen.getByRole('button')).toHaveAttribute('data-variant', variant)
    })

    it.each(BUTTON_THEMES.filter((theme) => theme !== 'inverse'))('theme="%s" を反映する', (theme) => {
      render(<Button theme={theme}>ボタン</Button>)

      expect(screen.getByRole('button')).toHaveAttribute('data-theme', theme)
    })

    it('theme="inverse" は outline・text と組み合わせて使う', () => {
      render(
        <>
          <Button variant="outline" theme="inverse">
            枠線
          </Button>
          <Button variant="text" theme="inverse">
            文字
          </Button>
          {/* @ts-expect-error inverse は solid と組み合わせられない（型で防ぐ） */}
          <Button variant="solid" theme="inverse">
            塗り
          </Button>
        </>,
      )

      expect(screen.getByRole('button', { name: '枠線' })).toHaveAttribute('data-theme', 'inverse')
      expect(screen.getByRole('button', { name: '文字' })).toHaveAttribute('data-theme', 'inverse')
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

    it('className を既存のクラスに追加し、ネイティブ属性と ref を渡す', () => {
      const ref = createRef<HTMLButtonElement>()
      render(
        <Button className="custom" aria-describedby="hint" ref={ref}>
          ボタン
        </Button>,
      )
      const button = screen.getByRole('button')

      expect(button).toHaveClass('custom')
      expect(button.classList.length).toBeGreaterThan(1)
      expect(button).toHaveAttribute('aria-describedby', 'hint')
      expect(ref.current).toBe(button)
    })
  })

  describe('アイコン', () => {
    it('leadIcon はラベルの左、tailIcon はラベルの右に置く', () => {
      render(
        <Button leadIcon="download" tailIcon="arrow-right">
          ダウンロード
        </Button>,
      )
      const children = [...screen.getByRole('button').children]

      expect(children[0]).toHaveAttribute('data-icon', 'download')
      expect(children[1]).toHaveTextContent('ダウンロード')
      expect(children[2]).toHaveAttribute('data-icon', 'arrow-right')
    })

    it('アイコンは装飾として扱い、アクセシブルネームはラベルだけにする', () => {
      render(<Button leadIcon="download">ダウンロード</Button>)

      expect(screen.getByRole('button', { name: 'ダウンロード' })).toBeInTheDocument()
      expect(screen.getByRole('button').querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    })

    it.each([
      ['lg', '20'],
      ['md', '20'],
      ['sm', '16'],
    ] as const)('size="%s" のボタンではアイコンを %spx にする', (size, iconSize) => {
      render(
        <Button size={size} tailIcon="arrow-right">
          次へ
        </Button>,
      )

      expect(screen.getByRole('button').querySelector('[data-icon]')).toHaveAttribute('data-size', iconSize)
    })

    it('指定しなければアイコンを表示しない', () => {
      render(<Button>保存する</Button>)

      expect(screen.getByRole('button').querySelector('svg')).toBeNull()
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

    it('ラベルを残したままスピナーを重ねる（幅が変わらない）', () => {
      render(
        <Button loading size="sm" tailIcon="arrow-right">
          保存する
        </Button>,
      )
      const button = screen.getByRole('button')
      const spinner = button.querySelector(':scope > svg:not([data-icon])')

      expect(button).toHaveTextContent('保存する')
      expect(button.querySelector('[data-icon="arrow-right"]')).not.toBeNull()
      expect(spinner).toHaveAttribute('aria-hidden', 'true')
      expect(spinner).toHaveAttribute('data-size', '16')
    })

    it('loading でなければ aria-busy もスピナーも付けない', () => {
      render(<Button>保存する</Button>)
      const button = screen.getByRole('button')

      expect(button).not.toHaveAttribute('aria-busy')
      expect(button.querySelector('svg')).toBeNull()
    })
  })
})
