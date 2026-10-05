import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import { Icon, type FilledIconName } from '../Icon'
import type { ToastStatus, ToastVariant } from './Toast.constants'
import styles from './Toast.module.css'

/** 状態ごとのアイコンと、その読み上げ名 */
const STATUS_ICONS = {
  success: { name: 'circle-check', label: '完了' },
  error: { name: 'circle-x', label: 'エラー' },
  warning: { name: 'triangle-alert', label: '注意' },
  info: { name: 'info', label: 'お知らせ' },
} as const satisfies Record<ToastStatus, { name: FilledIconName; label: string }>

export type ToastProps = Omit<ComponentPropsWithRef<'div'>, 'title'> & {
  /** 状態 */
  status?: ToastStatus
  /** 見た目（Figma: Style） */
  variant?: ToastVariant
  /** 見出し。1行に収まらない部分は「…」で省略する */
  title: ReactNode
  /** 説明（Figma: Description）。1行までで、収まらない部分は「…」で省略する */
  description?: ReactNode
  /** 状態のアイコンを出すか（Figma: Show icon） */
  icon?: boolean
  /** 閉じるボタンを押したとき。指定すると右端に閉じるボタンが出る（Figma: Show close） */
  onClose?: () => void
  /** 閉じるボタンの読み上げ名 */
  closeLabel?: string
}

/**
 * 数秒で消える通知の見た目（Figma: toast）。
 * 画面に出すときは ToastProvider と useToast を使う。対処が必要なことは Alert で出す。
 */
export function Toast({
  status = 'info',
  variant = 'light',
  title,
  description,
  icon = true,
  onClose,
  closeLabel = '閉じる',
  className,
  ...rest
}: ToastProps) {
  const statusIcon = STATUS_ICONS[status]

  return (
    <div {...rest} className={cx(styles.toast, className)} data-status={status} data-variant={variant}>
      {icon && (
        <Icon
          name={statusIcon.name}
          variant={variant === 'light' ? 'filled' : 'line'}
          size={24}
          label={statusIcon.label}
          className={styles.icon}
        />
      )}
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {onClose && (
        <button type="button" className={styles.close} aria-label={closeLabel} onClick={onClose}>
          <Icon name="x" size={24} />
        </button>
      )}
    </div>
  )
}
