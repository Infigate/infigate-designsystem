import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import { Button } from '../Button'
import { Icon } from '../Icon'
import type { FileUploadLayout } from './FileUpload.constants'
import styles from './FileUpload.module.css'

export type FileUploadZoneProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  /** 使える形式と容量 */
  hint: ReactNode
  hintId: string
  layout: FileUploadLayout
  /** ファイルを枠の上まで運んできている（Figma: State=Dragover） */
  dragover?: boolean
  /** 「ファイルを選択」を押したとき */
  onBrowse?: () => void
}

/** アップロードエリアの見た目（Figma: file-upload）。FileUpload の中身で、カタログの見本でも使う */
export function FileUploadZone({
  hint,
  hintId,
  layout,
  dragover = false,
  onBrowse,
  className,
  ...rest
}: FileUploadZoneProps) {
  return (
    <div {...rest} className={cx(styles.zone, className)} data-layout={layout} data-dragover={dragover || undefined}>
      {/* 点線の枠（Figma: 8px 引いて 6px 空ける）。CSS の dashed では間隔を決められないため、SVG で描く */}
      <svg className={styles.outline} aria-hidden="true">
        <rect width="100%" height="100%" rx="8" />
      </svg>
      <Icon name="upload" size={24} className={styles.icon} />
      <p className={styles.title}>
        <span className={styles.desktopOnly}>ここにファイルをドラッグ＆ドロップ</span>
        <span className={styles.mobileOnly}>ファイルをアップロード</span>
      </p>
      <p className={cx(styles.or, styles.desktopOnly)}>または</p>
      <Button variant="outline" leadIcon="folder" aria-describedby={hintId} onClick={onBrowse}>
        ファイルを選択
      </Button>
      <p id={hintId} className={styles.hint}>
        {hint}
      </p>
    </div>
  )
}
