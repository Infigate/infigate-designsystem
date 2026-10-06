import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('読み込み中であることを、status として読み上げる', () => {
    render(<Spinner />)

    expect(screen.getByRole('status')).toHaveTextContent('読み込み中')
  })

  it('label で読み上げる文を変えられ、null なら読み上げない', () => {
    const { container, rerender } = render(<Spinner label="保存中" />)
    expect(screen.getByRole('status')).toHaveTextContent('保存中')

    rerender(<Spinner label={null} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(container.firstElementChild).toHaveTextContent('')
  })

  it('大きさと色を指定できる', () => {
    render(<Spinner size="lg" tone="inverse" />)

    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('data-size', 'lg')
    expect(spinner).toHaveAttribute('data-tone', 'inverse')
  })
})
