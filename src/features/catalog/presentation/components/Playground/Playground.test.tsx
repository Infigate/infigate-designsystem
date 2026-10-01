import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { definePlayground } from '../../../domain/playground'
import { Playground } from './Playground'

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'size', options: ['sm', 'md', 'lg'], defaultValue: 'md' },
    { type: 'select', name: 'icon', options: ['none', 'a', 'b', 'c', 'd', 'e', 'f'], defaultValue: 'none' },
    { type: 'boolean', name: 'disabled', defaultValue: false },
    { type: 'text', name: 'label', defaultValue: '保存する' },
  ],
  render: ({ size, icon, disabled, label }) => (
    <button type="button" data-size={size} data-icon={icon} disabled={disabled}>
      {label}
    </button>
  ),
  code: ({ size, label }) => `<Button size="${size}">${label}</Button>`,
})

const preview = () => within(screen.getByRole('region', { name: 'プレビュー' }))

describe('Playground', () => {
  it('初期値でプレビューとコード例を表示する', () => {
    render(<Playground playground={playground} />)

    const button = preview().getByRole('button', { name: '保存する' })
    expect(button).toHaveAttribute('data-size', 'md')
    expect(button).not.toBeDisabled()
    expect(screen.getByLabelText('コード例')).toHaveTextContent('<Button size="md">保存する</Button>')
  })

  it('選択肢が少ない項目はボタン型で切り替えられる', async () => {
    const user = userEvent.setup()
    render(<Playground playground={playground} />)

    const group = screen.getByRole('radiogroup', { name: 'size' })
    expect(within(group).getByRole('radio', { name: 'md' })).toBeChecked()
    await user.click(within(group).getByRole('radio', { name: 'lg' }))

    expect(preview().getByRole('button')).toHaveAttribute('data-size', 'lg')
    expect(screen.getByLabelText('コード例')).toHaveTextContent('size="lg"')
  })

  it('選択肢が多い項目はセレクトボックスで切り替えられる', async () => {
    const user = userEvent.setup()
    render(<Playground playground={playground} />)

    await user.selectOptions(screen.getByRole('combobox', { name: 'icon' }), 'c')

    expect(preview().getByRole('button')).toHaveAttribute('data-icon', 'c')
  })

  it('オン・オフの項目はチェックボックスで切り替えられる', async () => {
    const user = userEvent.setup()
    render(<Playground playground={playground} />)

    await user.click(screen.getByRole('checkbox', { name: 'disabled' }))

    expect(preview().getByRole('button')).toBeDisabled()
  })

  it('文字の項目は入力した内容がプレビューに反映される', async () => {
    const user = userEvent.setup()
    render(<Playground playground={playground} />)

    const input = screen.getByRole('textbox', { name: 'label' })
    await user.clear(input)
    await user.type(input, '削除する')

    expect(preview().getByRole('button', { name: '削除する' })).toBeInTheDocument()
  })

  it('code を定義していなければコード例を表示しない', () => {
    render(<Playground playground={{ ...playground, code: undefined }} />)

    expect(screen.queryByLabelText('コード例')).not.toBeInTheDocument()
  })
})
