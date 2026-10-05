import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'
import { getPaginationRange } from './Pagination.constants'

describe('getPaginationRange', () => {
  it('7ページ以下なら全部並べる', () => {
    expect(getPaginationRange(1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(getPaginationRange(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it.each([
    [1, [1, 2, 3, 4, 5, 'ellipsis-end', 20]],
    [4, [1, 2, 3, 4, 5, 'ellipsis-end', 20]],
    [5, [1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 20]],
    [16, [1, 'ellipsis-start', 15, 16, 17, 'ellipsis-end', 20]],
    [17, [1, 'ellipsis-start', 16, 17, 18, 19, 20]],
    [20, [1, 'ellipsis-start', 16, 17, 18, 19, 20]],
  ])('全20ページの %i ページ目は、枠の数を変えずに両端と前後を残す', (page, expected) => {
    expect(getPaginationRange(page, 20)).toEqual(expected)
  })
})

describe('Pagination', () => {
  it('名前つきのナビゲーションに並べ、今見ているページを伝える', () => {
    render(<Pagination page={2} totalPages={5} />)

    const nav = screen.getByRole('navigation', { name: 'ページ送り' })
    expect(within(nav).getByRole('button', { name: '2ページ目' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('button', { name: '3ページ目' })).not.toHaveAttribute('aria-current')
    expect(screen.queryByRole('button', { name: '最初のページ' })).not.toBeInTheDocument()
  })

  it('番号や前後のボタンを押すと onPageChange を呼ぶ。今のページを押しても呼ばない', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />)

    await user.click(screen.getByRole('button', { name: '4ページ目' }))
    await user.click(screen.getByRole('button', { name: '前のページ' }))
    await user.click(screen.getByRole('button', { name: '次のページ' }))
    await user.click(screen.getByRole('button', { name: '2ページ目' }))

    expect(onPageChange.mock.calls).toEqual([[4], [1], [3]])
  })

  it('最初のページでは前へ、最後のページでは次へのボタンを押せなくする', () => {
    const { rerender } = render(<Pagination page={1} totalPages={20} />)
    expect(screen.getByRole('button', { name: '最初のページ' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '前のページ' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '次のページ' })).toBeEnabled()

    rerender(<Pagination page={20} totalPages={20} />)
    expect(screen.getByRole('button', { name: '次のページ' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '最後のページ' })).toBeDisabled()
  })

  it('8ページ以上では中間を省略し、最初・最後のボタンを足す', () => {
    render(<Pagination page={5} totalPages={20} />)

    expect(screen.getAllByText('…')).toHaveLength(2)
    expect(screen.getByRole('button', { name: '最初のページ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '20ページ目' })).toBeInTheDocument()
  })

  it('compact は前後のボタンと現在地だけにし、現在地は文章で読み上げる', () => {
    render(<Pagination page={3} totalPages={20} variant="compact" />)

    expect(screen.getAllByRole('button').map((button) => button.getAttribute('aria-label'))).toEqual(['前のページ', '次のページ'])
    expect(screen.getByText('20ページ中 3ページ目')).toBeInTheDocument()
  })

  it('getPageHref を指定するとリンクにし、押せない向きは href を外す', () => {
    render(<Pagination page={1} totalPages={3} getPageHref={(page) => `?page=${page}`} />)

    expect(screen.getByRole('link', { name: '2ページ目' })).toHaveAttribute('href', '?page=2')
    expect(screen.getByRole('link', { name: '1ページ目' })).toHaveAttribute('aria-current', 'page')
    const prev = screen.getByRole('link', { name: '前のページ' })
    expect(prev).not.toHaveAttribute('href')
    expect(prev).toHaveAttribute('aria-disabled', 'true')
  })

  it('disabled ですべてのボタンを押せなくする', () => {
    render(<Pagination page={2} totalPages={5} disabled />)

    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled())
  })
})
