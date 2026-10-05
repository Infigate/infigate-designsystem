import type { ComponentPropsWithRef, MouseEvent, ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import { Icon } from '../Icon'
import styles from './Tag.module.css'

export type TagProps = Omit<ComponentPropsWithRef<'span'>, 'onClick' | 'children'> & {
  /** ラベル */
  children: ReactNode
  /** 選択中（Figma: State=Selected）。押して選ぶタグで使い、× で外すタグには付けない */
  selected?: boolean
  /** タグを押したとき。指定するとタグ全体が押せるボタンになり、selected は「押されている」として読み上げる */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  /** × を押したとき。指定すると右端に × が出る（Figma: Show remove）。選んだ条件や入力した値を外すタグで使う */
  onRemove?: () => void
  /** × の読み上げ名。省略すると「（ラベル）を削除」 */
  removeLabel?: string
}

/**
 * 分類や絞り込みに使うラベル（Figma: tag）。押せないものは Badge を使う。
 * 使い方は2通り。
 *   押して選ぶタグ（絞り込み）: onClick と selected を使う
 *   × で外すタグ（選んだ条件・入力した値）: onRemove を使う。本体は押せず、選択中も持たない
 * 角丸を小さくして、Badge（丸い形）と見分けられるようにしている。className は外側の要素に付く。
 */
export function Tag({ children, selected = false, onClick, onRemove, removeLabel, className, ...rest }: TagProps) {
  const clickable = onClick !== undefined

  return (
    <span
      {...rest}
      className={cx(styles.tag, className)}
      data-selected={selected || undefined}
      data-clickable={clickable || undefined}
    >
      {clickable ? (
        <button type="button" className={styles.main} aria-pressed={selected} onClick={onClick}>
          {children}
        </button>
      ) : (
        <span>{children}</span>
      )}
      {onRemove && (
        <button
          type="button"
          className={styles.remove}
          aria-label={removeLabel ?? (typeof children === 'string' ? `${children}を削除` : '削除')}
          onClick={onRemove}
        >
          <Icon name="x" size={24} />
        </button>
      )}
    </span>
  )
}
