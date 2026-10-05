import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import { Icon, type FilledIconName } from '../Icon'
import type { AlertStatus } from './Alert.constants'
import styles from './Alert.module.css'

/** 状態ごとのアイコンと、その読み上げ名 */
const STATUS_ICONS = {
  success: { name: 'circle-check', label: '完了' },
  error: { name: 'circle-x', label: 'エラー' },
  warning: { name: 'triangle-alert', label: '注意' },
  info: { name: 'info', label: 'お知らせ' },
} as const satisfies Record<AlertStatus, { name: FilledIconName; label: string }>

export type AlertProps = Omit<ComponentPropsWithRef<'div'>, 'title'> & {
  /** 状態 */
  status?: AlertStatus
  /** 見出し。本文もアクションもなければ、見出しだけの1行の表示になる */
  title: ReactNode
  /** 本文。何が起きたのか、次に何をすればよいのかを書く */
  children?: ReactNode
  /** 本文の下に置く操作（Button の variant="text"・size="sm" を2つまで） */
  actions?: ReactNode
  /** 閉じるボタンを押したとき。指定すると右上に閉じるボタンが出る。対処が必要なものには付けない */
  onClose?: () => void
  /** 閉じるボタンの読み上げ名 */
  closeLabel?: string
}

/**
 * 画面に留まるメッセージ（Figma: alert）。数秒で消える通知にはトーストを使う。
 * error・warning は表示されたらすぐに読み上げ、success・info は読み上げの切れ目で伝える。
 */
export function Alert({
  status = 'info',
  title,
  children,
  actions,
  onClose,
  closeLabel = '閉じる',
  className,
  ...rest
}: AlertProps) {
  const icon = STATUS_ICONS[status]
  const singleLine = !children && !actions

  return (
    <div
      role={status === 'error' || status === 'warning' ? 'alert' : 'status'}
      {...rest}
      className={cx(styles.alert, className)}
      data-status={status}
      data-layout={singleLine ? 'single' : 'multi'}
    >
      <Icon name={icon.name} variant="filled" size={24} label={icon.label} className={styles.icon} />
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        {children && <div className={styles.body}>{children}</div>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {onClose && (
        <button type="button" className={styles.close} aria-label={closeLabel} onClick={onClose}>
          <Icon name="x" size={24} />
        </button>
      )}
    </div>
  )
}
