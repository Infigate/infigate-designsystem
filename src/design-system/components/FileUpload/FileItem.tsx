import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import { Icon } from '../Icon'
import type { FileItemStatus } from './FileUpload.constants'
import styles from './FileUpload.module.css'
import { formatFileSize } from './FileUpload.utils'

/** 選んだファイルを並べるリスト。FileUpload の下に置き、新しいファイルを上に足す */
export function FileList({ className, ...rest }: ComponentPropsWithRef<'ul'>) {
  return <ul {...rest} className={cx(styles.list, className)} />
}

export type FileItemProps = Omit<ComponentPropsWithRef<'li'>, 'children'> & {
  /** ファイル名 */
  name: string
  /** 状態。uploading: 送信中 / done: 完了 / error: 失敗 */
  status: FileItemStatus
  /** 送信の進み具合（0〜100）。uploading のときにバーで見せる */
  progress?: number
  /** 容量（バイト）。done のときに「2.4 MB」のように見せる */
  size?: number
  /** 失敗の理由。error のときに見せる */
  error?: ReactNode
  /** × を押したとき。送信中・完了・失敗のどの状態でも取り消せるようにする */
  onRemove: () => void
}

/** 選んだファイル1件（Figma: file-item）。FileList の中に置く */
export function FileItem({ name, status, progress = 0, size, error, onRemove, className, ...rest }: FileItemProps) {
  const percent = Math.min(Math.max(Math.round(progress), 0), 100)

  return (
    <li {...rest} className={cx(styles.item, className)} data-status={status}>
      {status === 'done' && (
        <Icon name="circle-check" variant="filled" size={20} label="完了" className={styles.statusIcon} />
      )}
      {status === 'error' && (
        <Icon name="triangle-alert" variant="filled" size={20} label="エラー" className={styles.statusIcon} />
      )}
      <div className={styles.texts}>
        <span className={styles.name}>{name}</span>
        {status === 'uploading' && (
          <div
            role="progressbar"
            aria-label={`${name}を送信中`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className={styles.progress}
          >
            <div className={styles.bar} style={{ width: `${percent}%` }} />
          </div>
        )}
        {status === 'done' && size !== undefined && <span className={styles.sub}>{formatFileSize(size)}</span>}
        {status === 'error' && error && <span className={styles.sub}>{error}</span>}
      </div>
      <button type="button" className={styles.remove} aria-label={`${name}を削除`} onClick={onRemove}>
        <Icon name="x" size={24} />
      </button>
    </li>
  )
}
