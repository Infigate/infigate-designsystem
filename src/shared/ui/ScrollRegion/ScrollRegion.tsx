import { useRef, type ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import { useScrollable } from '@/shared/lib/useScrollable'
import styles from './ScrollRegion.module.css'

type ScrollRegionProps = {
  /** スクロールできるときの、枠の読み上げ名 */
  label: string
  className?: string
  children: ReactNode
}

/**
 * 中身が入りきらないとき、枠の中だけ横にスクロールする枠（表・見本など）。
 * スクロールできるときだけ Tab キーで移れるようにし、キーボードでもスクロールできるようにする。
 */
export function ScrollRegion({ label, className, children }: ScrollRegionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const scrollable = useScrollable(ref)

  return (
    <div
      ref={ref}
      className={cx(styles.region, className)}
      {...(scrollable && { tabIndex: 0, role: 'region', 'aria-label': label })}
    >
      {children}
    </div>
  )
}
