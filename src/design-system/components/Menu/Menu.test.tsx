import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { IconButton } from '../IconButton'
import { Menu } from './Menu'
import { MenuItem, MenuSeparator } from './Menu.parts'

const renderMenu = () => {
  const onEdit = vi.fn()
  const onRemove = vi.fn()
  render(
    <>
      <Menu trigger={<IconButton icon="more-horizontal" aria-label="操作" />}>
        <MenuItem onSelect={onEdit}>編集</MenuItem>
        <MenuItem disabled>アーカイブ</MenuItem>
        <MenuSeparator />
        <MenuItem onSelect={onRemove}>削除</MenuItem>
      </Menu>
      <button type="button">次のボタン</button>
    </>,
  )
  return { onEdit, onRemove }
}

const trigger = () => screen.getByRole('button', { name: '操作' })
const item = (name: string) => screen.getByRole('menuitem', { name })

describe('Menu', () => {
  it('ボタンはメニューを開くことを伝え、最初は閉じている', () => {
    renderMenu()

    expect(trigger()).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('ボタンを押すと、ボタンの名前を持つメニューが開き、最初の項目にフォーカスが移る', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(trigger())

    expect(trigger()).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menu', { name: '操作' })).toBeInTheDocument()
    expect(trigger()).toHaveAttribute('aria-controls', screen.getByRole('menu').id)
    expect(item('編集')).toHaveFocus()
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('↑↓ で項目を移り、選べない項目は飛ばし、端では反対の端に戻る', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(trigger())

    await user.keyboard('{ArrowDown}')
    expect(item('削除')).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(item('編集')).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(item('削除')).toHaveFocus()
    await user.keyboard('{Home}')
    expect(item('編集')).toHaveFocus()
    await user.keyboard('{End}')
    expect(item('削除')).toHaveFocus()
  })

  it('ボタンで ↑ を押すと、最後の項目にフォーカスして開く', async () => {
    const user = userEvent.setup()
    renderMenu()

    trigger().focus()
    await user.keyboard('{ArrowUp}')

    expect(item('削除')).toHaveFocus()
  })

  it('Enter で項目を選ぶと onSelect を呼び、閉じてボタンにフォーカスを戻す', async () => {
    const user = userEvent.setup()
    const { onEdit } = renderMenu()

    trigger().focus()
    await user.keyboard('{Enter}')
    await user.keyboard('{Enter}')

    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger()).toHaveFocus()
  })

  it('選べない項目を押しても、何もせず開いたまま', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(trigger())

    await user.click(item('アーカイブ'))

    expect(item('アーカイブ')).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('Esc で閉じて、ボタンにフォーカスを戻す', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(trigger())

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger()).toHaveFocus()
  })

  it('Tab で閉じて、ボタンの次の要素に進む', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(trigger())

    await user.tab()

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '次のボタン' })).toHaveFocus()
  })

  it('メニューの外を押すと閉じ、もう一度ボタンを押すと閉じる', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(trigger())
    await user.click(document.body)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await user.click(trigger())
    await user.click(trigger())
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('checked を指定した項目は、チェックの付いた項目として伝える', async () => {
    const user = userEvent.setup()
    render(
      <Menu trigger={<button type="button">並び順</button>}>
        <MenuItem checked>新しい順</MenuItem>
        <MenuItem checked={false}>古い順</MenuItem>
      </Menu>,
    )
    await user.click(screen.getByRole('button', { name: '並び順' }))

    expect(screen.getByRole('menuitemcheckbox', { name: '新しい順' })).toBeChecked()
    expect(screen.getByRole('menuitemcheckbox', { name: '古い順' })).not.toBeChecked()
  })

  it('ボタンにもともと付いていた onClick も呼ぶ', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Menu trigger={<button type="button" onClick={onClick}>開く</button>}>
        <MenuItem>項目</MenuItem>
      </Menu>,
    )

    await user.click(screen.getByRole('button', { name: '開く' }))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })
})
