import type { ComponentPropsWithRef } from 'react'
import { cx } from '@/shared/lib/cx'
import type { BadgeStatus, BadgeVariant } from './Badge.constants'
import styles from './Badge.module.css'

export type BadgeProps = ComponentPropsWithRef<'span'> & {
  /** 状態。色だけで意味を伝えないよう、ラベルの言葉でも状態が分かるようにする */
  status?: BadgeStatus
  /** 見た目 */
  variant?: BadgeVariant
}

/**
 * 状態を短い言葉で示すラベル（Figma: badge）。押せない（押せるものはタグを使う）。
 */
export function Badge({ status = 'neutral', variant = 'subtle', className, ...rest }: BadgeProps) {
  return <span {...rest} className={cx(styles.badge, className)} data-status={status} data-variant={variant} />
}
