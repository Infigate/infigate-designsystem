import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('読み上げない飾りとして置く', () => {
    const { container } = render(<Skeleton />)

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.firstElementChild).toHaveAttribute('data-shape', 'text')
  })

  it('幅と高さを指定でき、数値は px として扱う', () => {
    const { container } = render(<Skeleton shape="rect" width={240} height="10rem" />)

    const skeleton = container.firstElementChild as HTMLElement
    expect(skeleton.style.width).toBe('240px')
    expect(skeleton.style.height).toBe('10rem')
  })

  it('circle は高さを省略すると幅と同じにする', () => {
    const { container } = render(<Skeleton shape="circle" width={64} />)

    expect(container.firstElementChild).toHaveStyle({ width: '64px', height: '64px' })
  })
})
