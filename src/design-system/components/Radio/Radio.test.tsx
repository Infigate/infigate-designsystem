import { createRef, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Radio } from './Radio'
import { RadioGroup } from './RadioGroup'

describe('Radio', () => {
  it('ラベルを名前として持つラジオボタンを描画する', () => {
    render(<Radio value="mail">メール</Radio>)
    const radio = screen.getByRole('radio', { name: 'メール' })

    expect(radio).not.toBeChecked()
    expect(radio).toHaveAttribute('value', 'mail')
  })

  it('ラベルを省略した丸だけの形でも、aria-label で名前を付けられる', () => {
    render(<Radio value="a" aria-label="プランA" />)

    expect(screen.getByRole('radio', { name: 'プランA' })).toBeInTheDocument()
  })

  it('className は外側の要素に付き、ref で input 要素を受け取れる', () => {
    const ref = createRef<HTMLInputElement>()
    render(
      <Radio value="a" className="extra" ref={ref}>
        A
      </Radio>,
    )

    expect(ref.current).toBe(screen.getByRole('radio'))
    expect(ref.current?.closest('label')).toHaveClass('extra')
  })

  it('disabled のときは選べない', async () => {
    const user = userEvent.setup()
    render(
      <Radio value="a" disabled>
        A
      </Radio>,
    )

    await user.click(screen.getByText('A'))

    expect(screen.getByRole('radio')).toBeDisabled()
    expect(screen.getByRole('radio')).not.toBeChecked()
  })
})

describe('RadioGroup', () => {
  const options = [
    ['product', '製品について'],
    ['contract', '契約について'],
    ['other', 'その他'],
  ] as const

  const renderGroup = (props: Partial<Parameters<typeof RadioGroup>[0]> = {}) =>
    render(
      <RadioGroup label="お問い合わせの種類" {...props}>
        {options.map(([value, label]) => (
          <Radio key={value} value={value}>
            {label}
          </Radio>
        ))}
      </RadioGroup>,
    )

  it('見出しを名前に持つ radiogroup で、中のラジオボタンに共通の name を付ける', () => {
    renderGroup()
    const group = screen.getByRole('radiogroup', { name: 'お問い合わせの種類' })
    const names = new Set(screen.getAllByRole('radio').map((radio) => radio.getAttribute('name')))

    expect(group.tagName).toBe('FIELDSET')
    expect(names.size).toBe(1)
    expect([...names][0]).toBeTruthy()
  })

  it('name を指定すると、その name を使う', () => {
    renderGroup({ name: 'type' })

    for (const radio of screen.getAllByRole('radio')) expect(radio).toHaveAttribute('name', 'type')
  })

  it('defaultValue の選択肢を最初から選び、1つだけ選べる', async () => {
    const user = userEvent.setup()
    renderGroup({ defaultValue: 'contract' })

    expect(screen.getByRole('radio', { name: '契約について' })).toBeChecked()

    await user.click(screen.getByText('その他'))

    expect(screen.getByRole('radio', { name: 'その他' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '契約について' })).not.toBeChecked()
  })

  it('選んだ値で onValueChange を呼ぶ', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderGroup({ onValueChange })

    await user.click(screen.getByText('製品について'))

    expect(onValueChange).toHaveBeenCalledWith('product')
  })

  it('value を渡すと、その値の選択肢を選んだ状態にする（制御）', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [value, setValue] = useState('product')
      return (
        <>
          <RadioGroup label="種類" value={value} onValueChange={setValue}>
            <Radio value="product">製品</Radio>
            <Radio value="other">その他</Radio>
          </RadioGroup>
          <p>選択中: {value}</p>
        </>
      )
    }
    render(<Controlled />)

    expect(screen.getByRole('radio', { name: '製品' })).toBeChecked()
    await user.click(screen.getByText('その他'))
    expect(screen.getByRole('radio', { name: 'その他' })).toBeChecked()
    expect(screen.getByText('選択中: other')).toBeInTheDocument()
  })

  it('矢印キーで選択肢を移動して選べる', async () => {
    const user = userEvent.setup()
    renderGroup({ defaultValue: 'product' })

    await user.tab()
    await user.keyboard('{ArrowDown}')

    expect(screen.getByRole('radio', { name: '契約について' })).toHaveFocus()
    expect(screen.getByRole('radio', { name: '契約について' })).toBeChecked()
  })

  it('印・エラーを、必須・エラーとしても伝える', () => {
    renderGroup({ mark: 'required', error: '選んでください。', description: '1つ選んでください' })
    const group = screen.getByRole('radiogroup', { name: 'お問い合わせの種類必須' })

    expect(group).toHaveAttribute('aria-required', 'true')
    expect(group).toHaveAttribute('aria-invalid', 'true')
    expect(group).toHaveAccessibleDescription('1つ選んでください 選んでください。')
  })

  it('disabled を指定すると、中のラジオボタンがすべて選べなくなる', () => {
    renderGroup({ disabled: true })

    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled()
  })
})
