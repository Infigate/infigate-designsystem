import { useState } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Sortable, type SortableItem } from './Sortable'
import { moveItem } from './Sortable.utils'

const ITEMS: SortableItem[] = [
  { id: 'name', label: '氏名' },
  { id: 'company', label: '会社名' },
  { id: 'email', label: 'メール' },
  { id: 'phone', label: '電話' },
]

/** 並べ替えた結果を items に渡し直す、ふつうの使い方 */
function Controlled({ onReorder }: { onReorder?: (items: SortableItem[]) => void }) {
  const [items, setItems] = useState(ITEMS)
  return (
    <Sortable
      aria-label="列の順番"
      items={items}
      onReorder={(next) => {
        setItems(next)
        onReorder?.(next)
      }}
    />
  )
}

const labels = () => within(screen.getByRole('list')).getAllByRole('listitem').map((row) => row.textContent)
const labelsOf = (items: SortableItem[]) => items.map((item) => item.label)
const handle = (label: string) => screen.getByRole('button', { name: `${label}を並べ替え` })
const announcement = () => document.querySelector('[aria-live]')?.textContent

describe('moveItem', () => {
  it('from 番目を取り出し、残りの to 番目に差し込む（元の配列は変えない）', () => {
    const items = ['a', 'b', 'c', 'd']

    expect(moveItem(items, 0, 2)).toEqual(['b', 'c', 'a', 'd'])
    expect(moveItem(items, 3, 0)).toEqual(['d', 'a', 'b', 'c'])
    expect(items).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('Sortable', () => {
  it('名前付きのリストに、項目の順で行を並べ、行ごとにハンドルを置く', () => {
    render(<Controlled />)

    expect(screen.getByRole('list', { name: '列の順番' })).toBeInTheDocument()
    expect(labels()).toEqual(labelsOf(ITEMS))
    expect(handle('氏名')).toHaveAccessibleDescription(/Space キーで持ち上げ/)
  })

  describe('キーボード', () => {
    it('Space で持ち上げ、↓ で動かし、Space で確定する', async () => {
      const user = userEvent.setup()
      const onReorder = vi.fn()
      render(<Controlled onReorder={onReorder} />)

      handle('氏名').focus()
      await user.keyboard(' ')
      expect(handle('氏名')).toHaveAttribute('aria-pressed', 'true')
      expect(announcement()).toContain('氏名を持ち上げました。4件中1番目です。')

      await user.keyboard('{ArrowDown}{ArrowDown}')
      expect(announcement()).toBe('4件中3番目')

      await user.keyboard(' ')
      expect(onReorder).toHaveBeenCalledWith([ITEMS[1], ITEMS[2], ITEMS[0], ITEMS[3]])
      expect(labels()).toEqual(['会社名', 'メール', '氏名', '電話'])
      expect(announcement()).toBe('氏名を4件中3番目に移動しました。')
      expect(handle('氏名')).toHaveFocus()
      expect(handle('氏名')).toHaveAttribute('aria-pressed', 'false')
    })

    it('Enter でも持ち上げ・確定でき、↑ で上に動かせる', async () => {
      const user = userEvent.setup()
      render(<Controlled />)

      handle('電話').focus()
      await user.keyboard('{Enter}{ArrowUp}{Enter}')

      expect(labels()).toEqual(['氏名', '会社名', '電話', 'メール'])
    })

    it('先頭・末尾より先には動かない', async () => {
      const user = userEvent.setup()
      const onReorder = vi.fn()
      render(<Controlled onReorder={onReorder} />)

      handle('氏名').focus()
      await user.keyboard(' {ArrowUp} ')

      expect(onReorder).not.toHaveBeenCalled()
      expect(announcement()).toBe('氏名は4件中1番目のままです。')
    })

    it('Esc で取り消すと、もとの順のまま', async () => {
      const user = userEvent.setup()
      const onReorder = vi.fn()
      render(<Controlled onReorder={onReorder} />)

      handle('氏名').focus()
      await user.keyboard(' {ArrowDown}{Escape}')

      expect(onReorder).not.toHaveBeenCalled()
      expect(handle('氏名')).toHaveAttribute('aria-pressed', 'false')
      expect(announcement()).toBe('並べ替えを取り消しました。氏名は4件中1番目のままです。')
    })

    it('持ち上げたままほかへフォーカスを移すと、取り消す', async () => {
      const user = userEvent.setup()
      const onReorder = vi.fn()
      render(<Controlled onReorder={onReorder} />)

      handle('氏名').focus()
      await user.keyboard(' {ArrowDown}')
      await user.tab()

      expect(onReorder).not.toHaveBeenCalled()
      expect(handle('氏名')).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('ポインター', () => {
    // 行の高さ 50px・すき間 8px で、縦に並んでいるものとして位置を返す（動かしている行は並びから抜ける）
    const ROW = 50
    const STEP = 58
    function mockLayout() {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        const rect = (top: number, height: number) => ({ top, height, bottom: top + height, left: 0, right: 480, width: 480, x: 0, y: top, toJSON: () => ({}) })
        if (this.tagName === 'UL') return rect(0, STEP * ITEMS.length - 8)
        if (this.tagName !== 'LI') return rect(0, 0)
        const inFlow = [...this.parentElement!.children].filter((row) => !row.hasAttribute('data-floating'))
        return rect(Math.max(inFlow.indexOf(this), 0) * STEP, ROW)
      })
    }

    afterEach(() => {
      vi.restoreAllMocks()
    })

    const slot = () => document.querySelector<HTMLElement>('li[aria-hidden="true"]')

    it('ハンドルをドラッグすると、行が持ち上がって差し込む位置にすき間が開き、離すと並べ替わる', () => {
      mockLayout()
      const onReorder = vi.fn()
      render(<Controlled onReorder={onReorder} />)
      const grip = handle('氏名')
      const row = (label: string) => screen.getByText(label).closest('li')!

      fireEvent.pointerDown(grip, { button: 0, pointerId: 1, clientY: 25 })
      fireEvent.pointerMove(grip, { pointerId: 1, clientY: 35 })
      // 持ち上げた直後は、もとの位置にすき間が開く（まわりの行は動かない）
      expect(slot()).toHaveStyle({ order: '0' })

      // 行の中心が 115px → いちばん近いのは3番目の行の位置（中心 141px）
      fireEvent.pointerMove(grip, { pointerId: 1, clientY: 115 })

      expect(row('氏名')).toHaveAttribute('data-floating')
      expect(row('氏名')).toHaveAttribute('data-lifted')
      expect(slot()).toHaveStyle({ order: '2' })
      // すき間の分だけ、後ろの行が1つずれる
      expect(row('会社名')).toHaveStyle({ order: '0' })
      expect(row('メール')).toHaveStyle({ order: '1' })
      expect(row('電話')).toHaveStyle({ order: '3' })

      fireEvent.pointerUp(grip, { pointerId: 1, clientY: 115 })

      expect(onReorder).toHaveBeenCalledWith([ITEMS[1], ITEMS[2], ITEMS[0], ITEMS[3]])
      expect(labels()).toEqual(['会社名', 'メール', '氏名', '電話'])
      expect(row('氏名')).not.toHaveAttribute('data-floating')
      expect(slot()).toBeNull()
    })

    it('末尾より下に動かすと、最後にすき間が開く', () => {
      mockLayout()
      render(<Controlled />)
      const grip = handle('氏名')

      fireEvent.pointerDown(grip, { button: 0, pointerId: 1, clientY: 25 })
      fireEvent.pointerMove(grip, { pointerId: 1, clientY: 35 })
      fireEvent.pointerMove(grip, { pointerId: 1, clientY: 400 })

      expect(slot()).toHaveStyle({ order: '3' })
    })

    it('押しただけ（少ししか動かさない）では持ち上げず、並べ替えない', () => {
      mockLayout()
      const onReorder = vi.fn()
      render(<Controlled onReorder={onReorder} />)
      const grip = handle('氏名')

      fireEvent.pointerDown(grip, { button: 0, pointerId: 1, clientY: 25 })
      fireEvent.pointerMove(grip, { pointerId: 1, clientY: 27 })
      fireEvent.pointerUp(grip, { pointerId: 1, clientY: 27 })

      expect(screen.getByText('氏名').closest('li')).not.toHaveAttribute('data-lifted')
      expect(onReorder).not.toHaveBeenCalled()
    })

    it('ドラッグが中断されたら（pointercancel）、並べ替えない', () => {
      mockLayout()
      const onReorder = vi.fn()
      render(<Controlled onReorder={onReorder} />)
      const grip = handle('氏名')

      fireEvent.pointerDown(grip, { button: 0, pointerId: 1, clientY: 25 })
      fireEvent.pointerMove(grip, { pointerId: 1, clientY: 35 })
      fireEvent.pointerMove(grip, { pointerId: 1, clientY: 115 })
      fireEvent.pointerCancel(grip, { pointerId: 1 })

      expect(onReorder).not.toHaveBeenCalled()
      expect(labels()).toEqual(labelsOf(ITEMS))
    })
  })
})
