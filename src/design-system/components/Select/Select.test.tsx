import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Field } from '../Field'
import { Select, type SelectProps } from './Select'
import { SELECT_SIZES } from './Select.constants'

const renderSelect = (props: Partial<SelectProps> = {}) =>
  render(
    <Select aria-label="種類" {...props}>
      <option value="product">製品について</option>
      <option value="contract">契約について</option>
      <option value="other" disabled>
        その他
      </option>
    </Select>,
  )

describe('Select', () => {
  describe('描画', () => {
    it('aria-label を名前として持つセレクトを描画する', () => {
      renderSelect()

      expect(screen.getByRole('combobox', { name: '種類' })).toBeInTheDocument()
    })

    it('既定は size=md で、エラー表示なし', () => {
      renderSelect()
      const select = screen.getByRole('combobox')

      expect(select.parentElement).toHaveAttribute('data-size', 'md')
      expect(select).not.toHaveAttribute('aria-invalid')
    })

    it.each(SELECT_SIZES)('size="%s" を反映する', (size) => {
      renderSelect({ size })

      expect(screen.getByRole('combobox').parentElement).toHaveAttribute('data-size', size)
    })

    it('placeholder を指定すると、値が空文字の選択肢を先頭に入れて、最初は未選択にする', () => {
      renderSelect({ placeholder: '選択してください' })
      const select = screen.getByRole('combobox')

      expect(select).toHaveValue('')
      expect(select).toHaveDisplayValue('選択してください')
    })

    it('placeholder がなければ、先頭の選択肢を選んだ状態になる', () => {
      renderSelect()

      expect(screen.getByRole('combobox')).toHaveValue('product')
    })
  })

  describe('状態', () => {
    it('invalid のとき aria-invalid="true" を付ける（枠が赤くなる）', () => {
      renderSelect({ invalid: true })

      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
    })

    it('disabled のときは選べない', () => {
      renderSelect({ disabled: true })

      expect(screen.getByRole('combobox')).toBeDisabled()
    })
  })

  describe('操作', () => {
    it('選ぶと onChange が呼ばれ、値が反映される', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      renderSelect({ placeholder: '選択してください', onChange })
      const select = screen.getByRole('combobox')

      await user.selectOptions(select, 'contract')

      expect(select).toHaveValue('contract')
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('disabled の選択肢は選べない', async () => {
      const user = userEvent.setup()
      renderSelect()

      await user.selectOptions(screen.getByRole('combobox'), 'other')

      expect(screen.getByRole('option', { name: 'その他' })).toBeDisabled()
      expect(screen.getByRole('combobox')).toHaveValue('product')
    })

    it('className は外側の要素に付き、ref で select 要素を受け取れる', () => {
      const ref = createRef<HTMLSelectElement>()
      renderSelect({ ref, className: 'extra', name: 'type' })

      expect(ref.current).toBe(screen.getByRole('combobox'))
      expect(ref.current).toHaveAttribute('name', 'type')
      expect(ref.current?.parentElement).toHaveClass('extra')
    })
  })

  describe('Field の中', () => {
    it('ラベル・補足文・エラー文・必須とつながる', () => {
      render(
        <Field label="種類" mark="required" description="1つ選んでください" error="選択してください。">
          <Select placeholder="選択してください">
            <option>製品</option>
          </Select>
        </Field>,
      )
      const select = screen.getByRole('combobox', { name: '種類必須' })

      expect(select).toHaveAttribute('aria-invalid', 'true')
      expect(select).toHaveAttribute('aria-required', 'true')
      expect(select).toHaveAccessibleDescription('1つ選んでください 選択してください。')
    })
  })
})
