import type { ComponentPropsWithRef } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from './Pagination.module.css'

export type PaginationButtonProps = ComponentPropsWithRef<'button'> & {
  /** 今見ているページ（Figma: Selected） */
  current?: boolean
}

/**
 * ページ番号・前後のボタンの見た目（Figma: pagination-item・pagination-nav。40×40）。
 * Pagination の中で使うほか、カタログでは状態の見本にも使う。
 */
export function PaginationButton({ current = false, className, ...rest }: PaginationButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={cx(styles.control, className)}
      aria-current={current ? 'page' : undefined}
    />
  )
}
