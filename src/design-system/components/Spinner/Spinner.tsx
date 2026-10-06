import type { ComponentPropsWithRef } from 'react'
import { cx } from '@/shared/lib/cx'
import type { SpinnerSize, SpinnerTone } from './Spinner.constants'
import styles from './Spinner.module.css'

export type SpinnerProps = Omit<ComponentPropsWithRef<'span'>, 'children'> & {
  /** 大きさ（Figma: Size）。sm 16px / md 24px / lg 40px */
  size?: SpinnerSize
  /** 色（Figma: Tone）。濃い下地の上では inverse */
  tone?: SpinnerTone
  /** 読み上げる文。周りの文字で読み込み中だと分かるときは null にして読み上げない */
  label?: string | null
}

/**
 * 読み込み中を示す回転するリング（Figma: spinner）。
 * 何が表示されるか決まっていない処理の待ち時間に出す。形が分かっている場所には Skeleton を置く。
 */
export function Spinner({ size = 'md', tone = 'brand', label = '読み込み中', className, ...rest }: SpinnerProps) {
  return (
    <span {...rest} role={label ? 'status' : undefined} className={cx(styles.spinner, className)} data-size={size} data-tone={tone}>
      {/* 輪の太さは大きさの 14%。弧は上から時計回りに 3/4 周 */}
      <svg viewBox="0 0 40 40" className={styles.ring} aria-hidden="true" focusable="false">
        <circle cx="20" cy="20" r="17.2" className={styles.track} />
        <circle cx="20" cy="20" r="17.2" pathLength="100" className={styles.arc} />
      </svg>
      {label && <span className={styles.visuallyHidden}>{label}</span>}
    </span>
  )
}
