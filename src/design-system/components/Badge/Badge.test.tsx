import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './Badge'
import { BADGE_STATUSES, BADGE_VARIANTS } from './Badge.constants'

describe('Badge', () => {
  it('ラベルを表示し、既定は neutral・subtle', () => {
    render(<Badge>下書き</Badge>)
    const badge = screen.getByText('下書き')

    expect(badge).toHaveAttribute('data-status', 'neutral')
    expect(badge).toHaveAttribute('data-variant', 'subtle')
  })

  it.each(BADGE_STATUSES.flatMap((status) => BADGE_VARIANTS.map((variant) => [status, variant] as const)))(
    'status="%s"・variant="%s" を反映する',
    (status, variant) => {
      render(
        <Badge status={status} variant={variant}>
          ラベル
        </Badge>,
      )

      expect(screen.getByText('ラベル')).toHaveAttribute('data-status', status)
      expect(screen.getByText('ラベル')).toHaveAttribute('data-variant', variant)
    },
  )

  it('押せる要素にはならない', () => {
    render(<Badge status="success">公開中</Badge>)

    expect(screen.getByText('公開中').tagName).toBe('SPAN')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('className と ref を受け取れる', () => {
    const ref = createRef<HTMLSpanElement>()
    render(
      <Badge className="extra" ref={ref}>
        お知らせ
      </Badge>,
    )

    expect(ref.current).toBe(screen.getByText('お知らせ'))
    expect(ref.current).toHaveClass('extra')
  })
})
