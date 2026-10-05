import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Tooltip } from './Tooltip'

const renderTooltip = (props: { onFocus?: () => void; 'aria-describedby'?: string } = {}) =>
  render(
    <>
      <p id="note">注記</p>
      <Tooltip content="CSV 形式でダウンロードします">
        <button type="button" {...props}>
          ダウンロード
        </button>
      </Tooltip>
    </>,
  )

const trigger = () => screen.getByRole('button', { name: 'ダウンロード' })
const tooltip = () => screen.getByRole('tooltip', { hidden: true })

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('閉じているあいだも、対象の補足説明として読み上げられる', () => {
    renderTooltip()

    expect(tooltip()).not.toBeVisible()
    expect(trigger()).toHaveAccessibleDescription('CSV 形式でダウンロードします')
  })

  it('フォーカスするとすぐに出て、フォーカスが外れると消える', () => {
    renderTooltip()

    act(() => trigger().focus())
    act(() => vi.runAllTimers())
    expect(tooltip()).toBeVisible()

    act(() => trigger().blur())
    act(() => vi.runAllTimers())
    expect(tooltip()).not.toBeVisible()
  })

  it('ポインターを乗せて少し待つと出る（通り過ぎただけでは出ない）', () => {
    renderTooltip()

    fireEvent.mouseEnter(trigger())
    act(() => vi.advanceTimersByTime(100))
    expect(tooltip()).not.toBeVisible()

    act(() => vi.advanceTimersByTime(300))
    expect(tooltip()).toBeVisible()
  })

  it('吹き出しの上にポインターを移しても消えず、吹き出しから離れると消える', () => {
    renderTooltip()
    fireEvent.mouseEnter(trigger())
    act(() => vi.runAllTimers())

    fireEvent.mouseLeave(trigger())
    fireEvent.mouseEnter(tooltip())
    act(() => vi.runAllTimers())
    expect(tooltip()).toBeVisible()

    fireEvent.mouseLeave(tooltip())
    act(() => vi.runAllTimers())
    expect(tooltip()).not.toBeVisible()
  })

  it('Esc で消せる（フォーカスは動かさない）', () => {
    renderTooltip()

    act(() => trigger().focus())
    act(() => vi.runAllTimers())
    expect(tooltip()).toBeVisible()

    fireEvent.keyDown(document, { key: 'Escape' })
    act(() => vi.runAllTimers())
    expect(tooltip()).not.toBeVisible()
    expect(trigger()).toHaveFocus()
  })

  it('対象にもともと付いていた補足説明と処理も残す', () => {
    const onFocus = vi.fn()
    renderTooltip({ onFocus, 'aria-describedby': 'note' })

    act(() => trigger().focus())

    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(trigger()).toHaveAccessibleDescription('注記 CSV 形式でダウンロードします')
  })
})
