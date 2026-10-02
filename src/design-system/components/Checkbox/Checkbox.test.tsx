import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from './Checkbox'
import { CheckboxGroup } from './CheckboxGroup'

describe('Checkbox', () => {
  describe('描画', () => {
    it('ラベルを名前として持つチェックボックスを描画する', () => {
      render(<Checkbox>メールで受け取る</Checkbox>)

      expect(screen.getByRole('checkbox', { name: 'メールで受け取る' })).not.toBeChecked()
    })

    it('ラベルを省略した箱だけの形でも、aria-label で名前を付けられる', () => {
      render(<Checkbox aria-label="この行を選択" />)

      expect(screen.getByRole('checkbox', { name: 'この行を選択' })).toBeInTheDocument()
    })

    it('className は外側の要素に、そのほかの属性は input に付く', () => {
      render(
        <Checkbox className="extra" name="news" value="mail">
          メール
        </Checkbox>,
      )
      const checkbox = screen.getByRole('checkbox')

      expect(checkbox).toHaveAttribute('name', 'news')
      expect(checkbox).toHaveAttribute('value', 'mail')
      expect(checkbox.closest('label')).toHaveClass('extra')
    })

    it('ref で input 要素を受け取れる', () => {
      const ref = createRef<HTMLInputElement>()
      render(<Checkbox ref={ref}>メール</Checkbox>)

      expect(ref.current).toBe(screen.getByRole('checkbox'))
    })
  })

  describe('状態', () => {
    it('checked・defaultChecked で選択状態にできる', () => {
      render(
        <>
          <Checkbox checked onChange={() => {}}>
            A
          </Checkbox>
          <Checkbox defaultChecked>B</Checkbox>
        </>,
      )

      expect(screen.getByRole('checkbox', { name: 'A' })).toBeChecked()
      expect(screen.getByRole('checkbox', { name: 'B' })).toBeChecked()
    })

    it('indeterminate で一部選択（読み上げでは mixed）にする', () => {
      const { rerender } = render(<Checkbox indeterminate>すべて選択</Checkbox>)
      const checkbox = screen.getByRole<HTMLInputElement>('checkbox')

      expect(checkbox.indeterminate).toBe(true)
      expect(checkbox).toBePartiallyChecked()

      rerender(<Checkbox>すべて選択</Checkbox>)
      expect(checkbox.indeterminate).toBe(false)
    })

    it('disabled のときは操作できない', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(
        <Checkbox disabled onChange={onChange}>
          メール
        </Checkbox>,
      )

      await user.click(screen.getByText('メール'))

      expect(screen.getByRole('checkbox')).toBeDisabled()
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('操作', () => {
    it('ラベルをクリックしても切り替わり、onChange が呼ばれる', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<Checkbox onChange={onChange}>メール</Checkbox>)

      await user.click(screen.getByText('メール'))

      expect(screen.getByRole('checkbox')).toBeChecked()
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('スペースキーで切り替えられる', async () => {
      const user = userEvent.setup()
      render(<Checkbox>メール</Checkbox>)

      await user.tab()
      await user.keyboard(' ')

      expect(screen.getByRole('checkbox')).toHaveFocus()
      expect(screen.getByRole('checkbox')).toBeChecked()
    })
  })
})

describe('CheckboxGroup', () => {
  const renderGroup = (props: Partial<Parameters<typeof CheckboxGroup>[0]> = {}) =>
    render(
      <CheckboxGroup label="興味のある分野" {...props}>
        <Checkbox>デザイン</Checkbox>
        <Checkbox>開発</Checkbox>
      </CheckboxGroup>,
    )

  it('見出しをグループ全体の名前にする（fieldset と legend）', () => {
    renderGroup()
    const group = screen.getByRole('group', { name: '興味のある分野' })

    expect(group.tagName).toBe('FIELDSET')
    expect(screen.getAllByRole('checkbox')).toHaveLength(2)
  })

  it('印を見出しの中に表示する', () => {
    renderGroup({ mark: 'required' })

    expect(screen.getByRole('group', { name: '興味のある分野必須' })).toBeInTheDocument()
    expect(screen.getByText('必須')).toHaveAttribute('data-mark', 'required')
  })

  it('補足文・エラー文をグループの説明として紐づける', () => {
    renderGroup({ description: '複数選べます', error: '1つ以上選んでください。' })

    expect(screen.getByRole('group')).toHaveAccessibleDescription('複数選べます 1つ以上選んでください。')
  })

  it('既定は縦並びで、direction="horizontal" で横並びにする', () => {
    const { container, rerender } = renderGroup()
    expect(container.querySelector('[data-direction]')).toHaveAttribute('data-direction', 'vertical')

    rerender(
      <CheckboxGroup label="興味のある分野" direction="horizontal">
        <Checkbox>デザイン</Checkbox>
      </CheckboxGroup>,
    )
    expect(container.querySelector('[data-direction]')).toHaveAttribute('data-direction', 'horizontal')
  })

  it('disabled を指定すると、中のチェックボックスがすべて操作できなくなる', () => {
    renderGroup({ disabled: true })

    for (const checkbox of screen.getAllByRole('checkbox')) expect(checkbox).toBeDisabled()
  })
})
