import type { ComponentPropsWithRef } from 'react'
import { cx } from '@/shared/lib/cx'
import { Icon } from '../Icon'
import styles from './Sortable.module.css'

/** 行を縦に並べるリスト。Sortable の中身で、カタログの見本でも使う */
export function SortableList({ className, ...rest }: ComponentPropsWithRef<'ul'>) {
  return <ul {...rest} className={cx(styles.list, className)} />
}

export type SortableRowProps = Omit<ComponentPropsWithRef<'li'>, 'children'> & {
  /** 行の文字。ハンドルの読み上げ名にも使う */
  label: string
  /** 持ち上げている（Figma: State=Dragging）。影を付ける */
  lifted?: boolean
  /** ポインターについて動かしている。もとの位置から抜けて、リストの上に重なる */
  floating?: boolean
  /** ハンドル（button）に渡す属性 */
  handleProps?: ComponentPropsWithRef<'button'>
}

/** 並べ替えの1行（Figma: sortable-item）。つかめるのは左端のハンドルだけ */
export function SortableRow({ label, lifted, floating, handleProps, className, ...rest }: SortableRowProps) {
  return (
    <li
      {...rest}
      className={cx(styles.item, className)}
      data-lifted={lifted || undefined}
      data-floating={floating || undefined}
    >
      <button type="button" aria-label={`${label}を並べ替え`} {...handleProps} className={styles.handle}>
        <Icon name="grip-vertical" size={20} />
      </button>
      <span className={styles.label}>{label}</span>
    </li>
  )
}

/**
 * ドラッグ中に、差し込む位置に開けるすき間（Figma: State=Drop target を置き換えたもの）。
 * 高さは動かしている行に合わせて指定する。読み上げには出さない
 */
export function SortablePlaceholder({ className, ...rest }: Omit<ComponentPropsWithRef<'li'>, 'children'>) {
  return <li {...rest} aria-hidden="true" className={cx(styles.placeholder, className)} />
}
