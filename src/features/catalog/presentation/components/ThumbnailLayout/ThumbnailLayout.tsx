import type { CSSProperties, ReactNode } from 'react'
import styles from './ThumbnailLayout.module.css'

type ThumbnailLayoutProps = {
  /** 並べる向き。row は横並び、column は縦積み。省略すると row（fill のときは column） */
  direction?: 'row' | 'column'
  /** 枠の幅いっぱいに広げる（入力欄やカードなど、幅を持つ部品）。縦積みのときは中の部品も幅いっぱいに伸ばす */
  fill?: boolean
  /** 縮小の倍率（1 未満）。画面幅の部品（Modal・Footer など）を、枠に収まる大きさに縮めて見せる */
  zoom?: number
  children: ReactNode
}

/**
 * 一覧のカードのサムネイル（*.catalog.tsx の thumbnail）で、見本を並べる枠。
 * サムネイルの枠は高さ 140px（内側はおよそ 190×92px）なので、その中に収まる小さな見本を置く。
 */
export function ThumbnailLayout({ direction, fill = false, zoom, children }: ThumbnailLayoutProps) {
  return (
    <div
      className={styles.layout}
      data-direction={direction ?? (fill ? 'column' : 'row')}
      data-fill={fill || undefined}
      style={zoom ? ({ '--thumbnail-zoom': zoom } as CSSProperties) : undefined}
    >
      {children}
    </div>
  )
}
