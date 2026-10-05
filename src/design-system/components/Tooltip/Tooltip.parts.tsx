import type { ComponentPropsWithRef, CSSProperties } from 'react'
import { cx } from '@/shared/lib/cx'
import type { TooltipPlacement } from './Tooltip.constants'
import styles from './Tooltip.module.css'

export type TooltipBubbleProps = ComponentPropsWithRef<'div'> & {
  /** 対象のどちら側に出ているか。矢印は反対側（対象のある側）に付く */
  placement: TooltipPlacement
  /** 矢印の位置（吹き出しの端から、矢印の中心までの距離 px）。省略すると辺の中央 */
  arrowOffset?: number
}

/** 吹き出しの見た目（Figma: tooltip）。Tooltip の中身で、カタログの見本でも使う */
export function TooltipBubble({ placement, arrowOffset, className, style, children, ...rest }: TooltipBubbleProps) {
  const arrowStyle =
    arrowOffset === undefined ? undefined : ({ '--tooltip-arrow-offset': `${arrowOffset}px` } as CSSProperties)
  return (
    <div {...rest} className={cx(styles.bubble, className)} data-placement={placement} style={{ ...arrowStyle, ...style }}>
      {children}
      <span className={styles.arrow} aria-hidden="true" />
    </div>
  )
}
