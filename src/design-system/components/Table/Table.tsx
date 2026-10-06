import { useRef, type ComponentPropsWithRef } from 'react'
import { cx } from '@/shared/lib/cx'
import { useScrollable } from '@/shared/lib/useScrollable'
import type { TableSize } from './Table.constants'
import { TableSectionContext } from './Table.context'
import styles from './Table.module.css'

export type TableProps = ComponentPropsWithRef<'table'> & {
  /** 高さ。行数が多い表や、数値を細かく見比べる表は sm にして1画面に入る行数を増やす */
  size?: TableSize
  /** 1行おきに背景を付ける（Figma: State=Stripe）。行数が多い表で、目で追いやすくする */
  striped?: boolean
  /** 列のあいだに縦線を引いて格子にする（Figma: Show right border）。列が多く、数値を見比べる表に使う */
  bordered?: boolean
}

/**
 * 表。TableHead・TableBody・TableRow・TableHeaderCell・TableCell を組み合わせて作る。
 * 画面より幅が広いときは、表の中だけ横にスクロールする。スクロールできるときは、キーボードでも
 * スクロールできるよう、枠に Tab キーで移れるようにし、表の名前を枠の名前にもする。
 * className は外側の要素（スクロールする枠）に付き、そのほかの属性は table に付く。
 * 表の名前は aria-label、または表の上の見出しを aria-labelledby でつなげて付ける。
 */
export function Table({ size = 'md', striped = false, bordered = false, className, ...rest }: TableProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollable = useScrollable(containerRef)

  return (
    <div
      ref={containerRef}
      className={cx(styles.container, className)}
      {...(scrollable && {
        tabIndex: 0,
        role: 'region',
        'aria-label': rest['aria-label'],
        'aria-labelledby': rest['aria-labelledby'],
      })}
    >
      <table
        {...rest}
        className={styles.table}
        data-size={size}
        data-striped={striped || undefined}
        data-bordered={bordered || undefined}
      />
    </div>
  )
}

/** 見出しの行をまとめる（thead）。背景は bg/subtle */
export function TableHead({ className, ...rest }: ComponentPropsWithRef<'thead'>) {
  return (
    <TableSectionContext value="head">
      <thead {...rest} className={cx(styles.head, className)} />
    </TableSectionContext>
  )
}

/** 本文の行をまとめる（tbody） */
export function TableBody({ className, ...rest }: ComponentPropsWithRef<'tbody'>) {
  return <tbody {...rest} className={cx(styles.body, className)} />
}

export type TableRowProps = ComponentPropsWithRef<'tr'> & {
  /** 選択中（Figma: State=Selected）。チェック列で選んだ行に付ける */
  selected?: boolean
}

/** 行（tr）。本文の行は、ポインターを乗せると背景が変わる（Figma: State=Hover） */
export function TableRow({ selected = false, className, ...rest }: TableRowProps) {
  return <tr {...rest} className={cx(styles.row, className)} data-selected={selected || undefined} />
}
