import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Stepper } from './Stepper'

const steps = [{ title: '入力' }, { title: '確認', description: '内容を確かめます' }, { title: '完了' }]

describe('Stepper', () => {
  it('手順を順番つきのリストで並べ、今のステップを aria-current で伝える', () => {
    render(<Stepper steps={steps} current={2} />)

    const list = screen.getByRole('list', { name: '手順' })
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[1]).toHaveAttribute('aria-current', 'step')
    expect(items[0]).not.toHaveAttribute('aria-current')
  })

  it('前のステップは済み、後ろはまだにし、状態を読み上げにも残す', () => {
    render(<Stepper steps={steps} current={2} />)

    const [first, second, third] = screen.getAllByRole('listitem')
    expect(first).toHaveAttribute('data-status', 'done')
    expect(first).toHaveTextContent('入力（完了）')
    expect(second).toHaveAttribute('data-status', 'current')
    expect(second).toHaveTextContent('確認（現在のステップ）')
    expect(third).toHaveAttribute('data-status', 'todo')
  })

  it('済んだステップの次のステップへは、線が届いている印を付ける', () => {
    render(<Stepper steps={steps} current={3} />)

    const [first, second, third] = screen.getAllByRole('listitem')
    expect(first).not.toHaveAttribute('data-reached')
    expect(second).toHaveAttribute('data-reached')
    expect(third).toHaveAttribute('data-reached')
  })

  it('済んだステップはチェック、それ以外は番号を丸に出す', () => {
    const { container } = render(<Stepper steps={steps} current={2} />)

    const circles = container.querySelectorAll('li > span:first-child')
    expect(circles[0].querySelector('svg[data-icon="check"]')).toBeInTheDocument()
    expect(circles[1]).toHaveTextContent('2')
    expect(circles[2]).toHaveTextContent('3')
  })

  it('説明は指定したステップだけに出す', () => {
    render(<Stepper steps={steps} current={1} />)

    expect(screen.getByText('内容を確かめます')).toBeInTheDocument()
  })
})
