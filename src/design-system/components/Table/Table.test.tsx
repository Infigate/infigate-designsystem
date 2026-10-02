import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Table, TableBody, TableHead, TableRow } from './Table'
import { TableCell, TableHeaderCell, TableSelectCell } from './TableCell'
import { TableEmpty } from './TableEmpty'

describe('Table', () => {
  it('名前付きの表に、列の見出しと本文のセルを並べる', () => {
    render(
      <Table aria-label="案件一覧">
        <TableHead>
          <TableRow>
            <TableHeaderCell>案件名</TableHeaderCell>
            <TableHeaderCell align="right">金額</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>採用サイト制作</TableCell>
            <TableCell align="right">3,200,000</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    const table = screen.getByRole('table', { name: '案件一覧' })

    expect(within(table).getAllByRole('columnheader').map((th) => th.textContent)).toEqual(['案件名', '金額'])
    expect(within(table).getByRole('columnheader', { name: '案件名' })).toHaveAttribute('scope', 'col')
    expect(within(table).getByRole('cell', { name: '3,200,000' })).toHaveAttribute('data-align', 'right')
  })

  it('size・striped・bordered を table に反映し、className は外側の枠に付ける', () => {
    render(
      <Table aria-label="表" size="sm" striped bordered className="extra">
        <TableBody />
      </Table>,
    )
    const table = screen.getByRole('table')

    expect(table).toHaveAttribute('data-size', 'sm')
    expect(table).toHaveAttribute('data-striped')
    expect(table).toHaveAttribute('data-bordered')
    expect(table.parentElement).toHaveClass('extra')
  })

  it('文字だけのセルと、部品を入れたセルを見分ける（部品のセルは上下の余白をとらない）', () => {
    render(
      <Table aria-label="表">
        <TableBody>
          <TableRow>
            <TableCell>文字</TableCell>
            <TableCell>
              <a href="#detail">詳細</a>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )

    expect(screen.getByRole('cell', { name: '文字' })).toHaveAttribute('data-content', 'text')
    expect(screen.getByRole('cell', { name: '詳細' })).toHaveAttribute('data-content', 'slot')
  })

  it('選択中の行に印を付ける', () => {
    render(
      <Table aria-label="表">
        <TableBody>
          <TableRow selected>
            <TableCell>選択中</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )

    expect(screen.getByRole('row')).toHaveAttribute('data-selected')
  })
})

describe('TableHeaderCell の並び替え', () => {
  const renderHeader = (onSort = vi.fn()) => {
    render(
      <Table aria-label="表">
        <TableHead>
          <TableRow>
            <TableHeaderCell sort="asc" onSort={onSort}>
              案件名
            </TableHeaderCell>
            <TableHeaderCell sort="none">金額</TableHeaderCell>
            <TableHeaderCell>担当者</TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>,
    )
    return onSort
  }

  it('並び替えの状態を aria-sort で伝え、並び替えできない列には付けない', () => {
    renderHeader()

    expect(screen.getByRole('columnheader', { name: '案件名' })).toHaveAttribute('aria-sort', 'ascending')
    expect(screen.getByRole('columnheader', { name: '金額' })).toHaveAttribute('aria-sort', 'none')
    expect(screen.getByRole('columnheader', { name: '担当者' })).not.toHaveAttribute('aria-sort')
  })

  it('並び替えできる見出しはボタンになり、押すと onSort を呼ぶ', async () => {
    const user = userEvent.setup()
    const onSort = renderHeader()

    await user.click(screen.getByRole('button', { name: '案件名' }))

    expect(onSort).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: '担当者' })).not.toBeInTheDocument()
  })

  it('キーボードでも並び替えられる', async () => {
    const user = userEvent.setup()
    const onSort = renderHeader()

    await user.tab()
    await user.keyboard('{Enter}')

    expect(onSort).toHaveBeenCalledTimes(1)
  })
})

describe('TableSelectCell', () => {
  it('見出しでは th、本文では td の中にチェックボックスを置く', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Table aria-label="表">
        <TableHead>
          <TableRow>
            <TableSelectCell aria-label="すべての行を選択" checked={false} indeterminate onChange={() => {}} />
            <TableHeaderCell>案件名</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableSelectCell aria-label="採用サイト制作を選択" checked={false} onChange={onChange} />
            <TableCell>採用サイト制作</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    const selectAll = screen.getByRole('checkbox', { name: 'すべての行を選択' })
    const selectRow = screen.getByRole('checkbox', { name: '採用サイト制作を選択' })

    expect(selectAll.closest('th, td')?.tagName).toBe('TH')
    expect(selectAll).toBePartiallyChecked()
    expect(selectRow.closest('th, td')?.tagName).toBe('TD')

    await user.click(selectRow)
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})

describe('TableEmpty', () => {
  it('全部の列にまたがって、データがないことと次の行動を出す', () => {
    render(
      <Table aria-label="表">
        <TableBody>
          <TableEmpty colSpan={4} description="条件を変えてください。" action={<button type="button">条件をクリア</button>} />
        </TableBody>
      </Table>,
    )
    const cell = screen.getByRole('cell')

    expect(cell).toHaveAttribute('colspan', '4')
    expect(cell).toHaveTextContent('データがありません')
    expect(cell).toHaveTextContent('条件を変えてください。')
    expect(within(cell).getByRole('button', { name: '条件をクリア' })).toBeInTheDocument()
  })
})
