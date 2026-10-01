import type { ComponentPropsWithRef } from 'react'
import { cx } from '@/shared/lib/cx'
import type { ButtonSize, ButtonVariant } from './Button.constants'
import styles from './Button.module.css'

export type ButtonProps = ComponentPropsWithRef<'button'> & {
  /** 見た目の種類 */
  variant?: ButtonVariant
  /** 大きさ */
  size?: ButtonSize
  /** 親要素の幅いっぱいに広げる */
  fullWidth?: boolean
  /** 処理中表示。true の間は操作できない */
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={cx(styles.button, className)}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth || undefined}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
    </button>
  )
}
