import type { ComponentPropsWithRef } from 'react'
import { cx } from '@/shared/lib/cx'
import { Checkbox, type CheckboxProps } from '../Checkbox'
import type { TableAlign, TableSort } from './Table.constants'
import { useTableSection } from './Table.context'
import styles from './Table.module.css'

const ARIA_SORT = { none: 'none', asc: 'ascending', desc: 'descending' } as const satisfies Record<TableSort, string>

export type TableHeaderCellProps = ComponentPropsWithRef<'th'> & {
  /** 文字の寄せ。本文のセルとそろえる */
  align?: TableAlign
  /** 並び替えの状態。指定すると見出しが押せるボタンになり、並び替えのアイコンが付く */
  sort?: TableSort
  /** 見出しを押したとき。次の並び（none → asc → desc など）は使う側で決める */
  onSort?: () => void
}

/**
 * 見出しセル（Figma: table-header-cell）。TableHead の中の TableRow に置く。
 * 並び替えできる列は sort を指定する。押せるのはその列だけで、Hover・Focus を持つ。
 */
export function TableHeaderCell({ align = 'left', sort, onSort, className, children, ...rest }: TableHeaderCellProps) {
  return (
    <th
      scope="col"
      aria-sort={sort ? ARIA_SORT[sort] : undefined}
      {...rest}
      className={cx(styles.headerCell, className)}
      data-align={align}
      data-sortable={sort ? true : undefined}
    >
      {sort ? (
        <button type="button" className={styles.sortButton} onClick={onSort}>
          {children}
          <SortIcon sort={sort} />
        </button>
      ) : (
        children
      )}
    </th>
  )
}

/** 並び替えのアイコン（Figma: table-sort-icon）。none は薄い ↑↓、asc・desc は今の向きの矢印だけを濃く出す */
function SortIcon({ sort }: { sort: TableSort }) {
  return (
    <svg
      className={styles.sortIcon}
      data-sort={sort}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {sort === 'none' && (
        <>
          <path d="M4 14V2M7 5L4 2L1 5" strokeWidth="1.5" />
          <path d="M12 2V14M15 11L12 14L9 11" strokeWidth="1.5" />
        </>
      )}
      {sort === 'asc' && <path d="M8 14V2M12 6L8 2L4 6" strokeWidth="2" />}
      {sort === 'desc' && <path d="M8 2V14M12 10L8 14L4 10" strokeWidth="2" />}
    </svg>
  )
}

export type TableCellProps = ComponentPropsWithRef<'td'> & {
  /** 文字の寄せ。数値は right にそろえる */
  align?: TableAlign
}

/**
 * 本文セル（Figma: table-cell・table-cell-slot）。TableBody の中の TableRow に置く。
 * 文字だけのセルは上下に余白をとり、部品（リンク・ボタンなど）を入れたセルは行の高さがそろうよう上下の余白をとらない。
 */
export function TableCell({ align = 'left', className, children, ...rest }: TableCellProps) {
  const isText = typeof children === 'string' || typeof children === 'number'
  return (
    <td {...rest} className={cx(styles.cell, className)} data-align={align} data-content={isText ? 'text' : 'slot'}>
      {children}
    </td>
  )
}

export type TableSelectCellProps = Omit<CheckboxProps, 'children'> & {
  /** チェックボックスの読み上げ名（例: 「すべての行を選択」「山田 太郎を選択」） */
  'aria-label': string
}

/**
 * チェック列のセル（Figma: table-row の check）。見出しでは「すべて選択」、本文では行の選択に使う。
 * 見出し（TableHead）の中では th、本文では td になる。
 */
export function TableSelectCell({ className, ...rest }: TableSelectCellProps) {
  const Cell = useTableSection() === 'head' ? 'th' : 'td'
  return (
    <Cell className={cx(Cell === 'th' ? styles.headerCell : styles.cell, styles.selectCell)}>
      <Checkbox {...rest} className={cx(styles.selectControl, className)} />
    </Cell>
  )
}
