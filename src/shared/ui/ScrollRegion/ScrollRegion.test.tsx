import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ScrollRegion } from './ScrollRegion'

/** jsdom は大きさを測れないので、ResizeObserver と中身の幅を差し替える */
function mockSizes({ scrollWidth, clientWidth }: { scrollWidth: number; clientWidth: number }) {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      callback: () => void
      constructor(callback: () => void) {
        this.callback = callback
      }
      observe() {
        this.callback()
      }
      disconnect() {}
    },
  )
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(scrollWidth)
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(clientWidth)
}

describe('ScrollRegion', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('中身が入りきらないときは、Tab キーで移れる名前つきの領域にする', () => {
    mockSizes({ scrollWidth: 800, clientWidth: 300 })
    render(<ScrollRegion label="Props の表">中身</ScrollRegion>)

    const region = screen.getByRole('region', { name: 'Props の表' })
    expect(region).toHaveAttribute('tabindex', '0')
  })

  it('入りきるときは、Tab キーの移り先にしない', () => {
    mockSizes({ scrollWidth: 300, clientWidth: 300 })
    const { container } = render(<ScrollRegion label="Props の表">中身</ScrollRegion>)

    expect(screen.queryByRole('region')).not.toBeInTheDocument()
    expect(container.firstElementChild).not.toHaveAttribute('tabindex')
  })
})
