import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TextInput } from './TextInput'
import { TEXT_INPUT_SIZES } from './TextInput.constants'

describe('TextInput', () => {
  describe('描画', () => {
    it('aria-label を名前として持つテキスト入力欄を描画する', () => {
      render(<TextInput aria-label="氏名" />)

      expect(screen.getByRole('textbox', { name: '氏名' })).toBeInTheDocument()
    })

    it('既定は size=md / type=text で、エラー表示なし', () => {
      render(<TextInput aria-label="氏名" />)
      const input = screen.getByRole('textbox')

      expect(input).toHaveAttribute('data-size', 'md')
      expect(input).toHaveAttribute('type', 'text')
      expect(input).not.toHaveAttribute('aria-invalid')
    })

    it.each(TEXT_INPUT_SIZES)('size="%s" を反映する', (size) => {
      render(<TextInput aria-label="氏名" size={size} />)

      expect(screen.getByRole('textbox')).toHaveAttribute('data-size', size)
    })

    it('type を変えられる（例: email）', () => {
      render(<TextInput aria-label="メールアドレス" type="email" />)

      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    })

    it('プレースホルダーを表示する', () => {
      render(<TextInput aria-label="氏名" placeholder="山田 太郎" />)

      expect(screen.getByPlaceholderText('山田 太郎')).toBeInTheDocument()
    })
  })

  describe('状態', () => {
    it('invalid のとき aria-invalid="true" を付ける（枠が赤くなる）', () => {
      render(<TextInput aria-label="氏名" invalid />)

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    })

    it('disabled のときは入力できない', async () => {
      const user = userEvent.setup()
      render(<TextInput aria-label="氏名" disabled />)
      const input = screen.getByRole('textbox')

      await user.type(input, 'abc')

      expect(input).toBeDisabled()
      expect(input).toHaveValue('')
    })
  })

  describe('操作', () => {
    it('入力すると onChange が呼ばれ、値が反映される', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<TextInput aria-label="氏名" onChange={onChange} />)
      const input = screen.getByRole('textbox')

      await user.type(input, '山田')

      expect(input).toHaveValue('山田')
      expect(onChange).toHaveBeenCalledTimes(2)
    })

    it('ref で input 要素を受け取れる', () => {
      const ref = createRef<HTMLInputElement>()
      render(<TextInput aria-label="氏名" ref={ref} />)

      expect(ref.current).toBe(screen.getByRole('textbox'))
    })

    it('className と、その他の input の属性を渡せる', () => {
      render(<TextInput aria-label="氏名" className="extra" name="name" autoComplete="name" />)
      const input = screen.getByRole('textbox')

      expect(input).toHaveClass('extra')
      expect(input).toHaveAttribute('name', 'name')
      expect(input).toHaveAttribute('autocomplete', 'name')
    })
  })
})
