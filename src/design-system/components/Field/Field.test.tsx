import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TextInput } from '../TextInput'
import { Field } from './Field'

describe('Field', () => {
  describe('ラベル', () => {
    it('ラベルと入力欄を紐づける（ラベルが入力欄の名前になる）', () => {
      render(
        <Field label="氏名">
          <TextInput />
        </Field>,
      )

      expect(screen.getByRole('textbox', { name: '氏名' })).toBeInTheDocument()
    })

    it('ラベルをクリックすると入力欄にフォーカスする', async () => {
      const user = userEvent.setup()
      render(
        <Field label="氏名">
          <TextInput />
        </Field>,
      )

      await user.click(screen.getByText('氏名'))

      expect(screen.getByRole('textbox')).toHaveFocus()
    })

    it('controlId を指定すると、入力欄の id になる', () => {
      render(
        <Field label="氏名" controlId="name">
          <TextInput />
        </Field>,
      )

      expect(screen.getByRole('textbox', { name: '氏名' })).toHaveAttribute('id', 'name')
    })

    it('Field の中では、入力欄に渡した id よりも Field の id を使う（ラベルとの紐づけを保つ）', () => {
      render(
        <Field label="氏名">
          <TextInput id="ignored" />
        </Field>,
      )

      expect(screen.getByRole('textbox', { name: '氏名' })).not.toHaveAttribute('id', 'ignored')
    })
  })

  describe('印', () => {
    it('mark="required" は「必須」を表示し、入力欄を必須（aria-required）にする', () => {
      render(
        <Field label="氏名" mark="required">
          <TextInput />
        </Field>,
      )

      expect(screen.getByText('必須')).toHaveAttribute('data-mark', 'required')
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true')
    })

    it('mark="optional" は「任意」を表示し、入力欄は必須にしない', () => {
      render(
        <Field label="氏名" mark="optional">
          <TextInput />
        </Field>,
      )

      expect(screen.getByText('任意')).toHaveAttribute('data-mark', 'optional')
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-required')
    })

    it('印はラベルの中にあり、読み上げでも伝わる', () => {
      render(
        <Field label="氏名" mark="optional">
          <TextInput />
        </Field>,
      )

      expect(screen.getByRole('textbox', { name: '氏名任意' })).toBeInTheDocument()
    })

    it('mark を省略すると印を付けない', () => {
      render(
        <Field label="氏名">
          <TextInput />
        </Field>,
      )

      expect(screen.queryByText('必須')).not.toBeInTheDocument()
      expect(screen.queryByText('任意')).not.toBeInTheDocument()
    })
  })

  describe('補足文・エラー文', () => {
    it('補足文を入力欄の説明として紐づける', () => {
      render(
        <Field label="氏名" description="姓と名の間にスペースを入れてください">
          <TextInput />
        </Field>,
      )

      expect(screen.getByRole('textbox')).toHaveAccessibleDescription('姓と名の間にスペースを入れてください')
    })

    it('エラー文があると入力欄をエラー（aria-invalid）にし、説明として紐づける', () => {
      render(
        <Field label="氏名" error="必須項目です。入力してください。">
          <TextInput />
        </Field>,
      )
      const input = screen.getByRole('textbox')

      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAccessibleDescription('必須項目です。入力してください。')
    })

    it('エラー文の警告アイコンは装飾として読み上げない', () => {
      const { container } = render(
        <Field label="氏名" error="必須項目です。">
          <TextInput />
        </Field>,
      )

      expect(container.querySelector('svg[data-icon="triangle-alert"]')).toHaveAttribute('aria-hidden', 'true')
    })

    it('補足文とエラー文の両方があれば、補足文・エラー文の順で説明にする', () => {
      render(
        <Field label="氏名" description="全角で入力" error="必須項目です。">
          <TextInput />
        </Field>,
      )

      expect(screen.getByRole('textbox')).toHaveAccessibleDescription('全角で入力 必須項目です。')
    })

    it('入力欄に渡した aria-describedby も残す', () => {
      render(
        <>
          <p id="note">注意事項</p>
          <Field label="氏名" description="全角で入力">
            <TextInput aria-describedby="note" />
          </Field>
        </>,
      )

      expect(screen.getByRole('textbox')).toHaveAccessibleDescription('全角で入力 注意事項')
    })

    it('エラー文がなければ、入力欄はエラーにならない', () => {
      render(
        <Field label="氏名">
          <TextInput />
        </Field>,
      )

      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby')
    })
  })
})
