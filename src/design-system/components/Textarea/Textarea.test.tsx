import { createRef, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Field } from '../Field'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  describe('描画', () => {
    it('aria-label を名前として持つ複数行の入力欄を描画する', () => {
      render(<Textarea aria-label="お問い合わせ内容" />)
      const textarea = screen.getByRole('textbox', { name: 'お問い合わせ内容' })

      expect(textarea.tagName).toBe('TEXTAREA')
      expect(textarea).not.toHaveAttribute('aria-invalid')
    })

    it('maxLength がなければ文字数カウンターを出さない', () => {
      render(<Textarea aria-label="内容" />)

      expect(screen.queryByText(/\/ \d+$/)).not.toBeInTheDocument()
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby')
    })

    it('rows を渡せる（高さの調整に使う）', () => {
      render(<Textarea aria-label="内容" rows={8} />)

      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '8')
    })
  })

  describe('文字数カウンター', () => {
    it('maxLength を指定すると「入力した文字数 / 上限」を表示し、入力欄の説明として紐づける', () => {
      render(<Textarea aria-label="内容" maxLength={500} />)
      const textarea = screen.getByRole('textbox')

      expect(screen.getByText('0 / 500')).toBeInTheDocument()
      expect(textarea).toHaveAttribute('maxlength', '500')
      expect(textarea).toHaveAccessibleDescription('0 / 500')
    })

    it('入力に合わせて文字数を数え直す', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<Textarea aria-label="内容" maxLength={500} onChange={onChange} />)

      await user.type(screen.getByRole('textbox'), 'こんにちは')

      expect(screen.getByText('5 / 500')).toBeInTheDocument()
      expect(onChange).toHaveBeenCalledTimes(5)
    })

    it('defaultValue の文字数から数え始める', () => {
      render(<Textarea aria-label="内容" maxLength={10} defaultValue="abc" />)

      expect(screen.getByText('3 / 10')).toBeInTheDocument()
    })

    it('value を渡す（制御する）場合は value の文字数を表示する', async () => {
      const user = userEvent.setup()
      function Controlled() {
        const [text, setText] = useState('ab')
        return <Textarea aria-label="内容" maxLength={10} value={text} onChange={(e) => setText(e.target.value)} />
      }
      render(<Controlled />)

      expect(screen.getByText('2 / 10')).toBeInTheDocument()
      await user.type(screen.getByRole('textbox'), 'c')
      expect(screen.getByText('3 / 10')).toBeInTheDocument()
    })

    it('エラーのときはカウンターもエラーの色にする', () => {
      render(<Textarea aria-label="内容" maxLength={500} invalid />)

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByText('0 / 500')).toHaveAttribute('data-invalid', 'true')
    })
  })

  describe('状態・操作', () => {
    it('disabled のときは入力できない', async () => {
      const user = userEvent.setup()
      render(<Textarea aria-label="内容" disabled />)
      const textarea = screen.getByRole('textbox')

      await user.type(textarea, 'abc')

      expect(textarea).toBeDisabled()
      expect(textarea).toHaveValue('')
    })

    it('ref で textarea 要素を受け取れ、className は textarea に付く', () => {
      const ref = createRef<HTMLTextAreaElement>()
      render(<Textarea aria-label="内容" ref={ref} className="extra" />)

      expect(ref.current).toBe(screen.getByRole('textbox'))
      expect(ref.current).toHaveClass('extra')
    })
  })

  describe('Field の中で使う', () => {
    it('ラベル・補足文・エラー文・カウンターを紐づける', () => {
      render(
        <Field label="お問い合わせ内容" mark="required" description="できるだけ具体的に" error="入力してください。">
          <Textarea maxLength={500} />
        </Field>,
      )
      const textarea = screen.getByRole('textbox', { name: 'お問い合わせ内容必須' })

      expect(textarea).toHaveAttribute('aria-invalid', 'true')
      expect(textarea).toHaveAttribute('aria-required', 'true')
      expect(textarea).toHaveAccessibleDescription('できるだけ具体的に 入力してください。 0 / 500')
      expect(screen.getByText('0 / 500')).toHaveAttribute('data-invalid', 'true')
    })
  })
})
