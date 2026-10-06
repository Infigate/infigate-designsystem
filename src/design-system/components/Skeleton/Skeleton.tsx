import type { ComponentPropsWithRef, CSSProperties } from 'react'
import { cx } from '@/shared/lib/cx'
import type { SkeletonShape } from './Skeleton.constants'
import styles from './Skeleton.module.css'

export type SkeletonProps = Omit<ComponentPropsWithRef<'span'>, 'children'> & {
  /** 形（Figma: Shape）。text: 文字1行 / circle: 顔写真やアイコン / rect: 画像や塊 */
  shape?: SkeletonShape
  /** 幅。数値は px。省略すると text・rect は幅いっぱい、circle は 40px */
  width?: number | string
  /** 高さ。数値は px。省略すると text は 12px、rect は 120px、circle は幅と同じ */
  height?: number | string
}

/**
 * 読み込み中の場所に置く形（Figma: skeleton）。実際の中身と同じ大きさ・同じ位置に置く。
 * 明るい帯を左から右へ流して読み込み中を表す。読み上げはしないので、
 * 読み込み中の範囲には aria-busy を付け、読み込み中であることは別の文字（Spinner の label など）で伝える。
 */
export function Skeleton({ shape = 'text', width, height, className, style, ...rest }: SkeletonProps) {
  const size: CSSProperties = {
    width,
    height: height ?? (shape === 'circle' ? width : undefined),
  }

  return (
    <span
      {...rest}
      aria-hidden="true"
      className={cx(styles.skeleton, className)}
      data-shape={shape}
      style={{ ...size, ...style }}
    />
  )
}
