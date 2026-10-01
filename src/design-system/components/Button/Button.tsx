import type { ComponentPropsWithRef } from 'react'
import { cx } from '@/shared/lib/cx'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'
import { BUTTON_ICON_SIZES } from './Button.constants'
import type { ButtonSize, ButtonTheme, ButtonVariant } from './Button.constants'
import styles from './Button.module.css'

/** inverse は濃い下地用のため、outline・text でだけ使える */
type ButtonAppearanceProps =
  | { variant?: ButtonVariant; theme?: Exclude<ButtonTheme, 'inverse'> }
  | { variant: Exclude<ButtonVariant, 'solid'>; theme: 'inverse' }

export type ButtonProps = ComponentPropsWithRef<'button'> &
  ButtonAppearanceProps & {
    /** 大きさ */
    size?: ButtonSize
    /** ラベルの左に置くアイコン。操作の意味を補強するときに使う（例: download） */
    leadIcon?: IconName
    /** ラベルの右に置くアイコン。次へ進む・展開するなど方向を示すときに使う（例: arrow-right） */
    tailIcon?: IconName
    /** 親要素の幅いっぱいに広げる */
    fullWidth?: boolean
    /** 処理中表示。通信の待ち時間に使い、二重送信を防ぐため操作できなくする */
    loading?: boolean
  }

export function Button({
  variant = 'solid',
  theme = 'primary',
  size = 'md',
  leadIcon,
  tailIcon,
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const iconSize = BUTTON_ICON_SIZES[size]

  return (
    <button
      {...rest}
      type={type}
      className={cx(styles.button, className)}
      data-variant={variant}
      data-theme={theme}
      data-size={size}
      data-full-width={fullWidth || undefined}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {leadIcon && <Icon name={leadIcon} size={iconSize} className={styles.content} />}
      <span className={styles.content}>{children}</span>
      {tailIcon && <Icon name={tailIcon} size={iconSize} className={styles.content} />}
      {loading && <Spinner size={iconSize} />}
    </button>
  )
}

/** Figma の spinner（20px / 16px）と同じ形。色はボタンの文字色を受け継ぐ */
const SPINNER_PATHS = {
  20: {
    track:
      'M10 18.75C14.8325 18.75 18.75 14.8325 18.75 10C18.75 5.16751 14.8325 1.25 10 1.25C5.16751 1.25 1.25 5.16751 1.25 10C1.25 14.8325 5.16751 18.75 10 18.75Z',
    arc: 'M10 1.25C12.3206 1.25 14.5462 2.17187 16.1872 3.81282C17.8281 5.45376 18.75 7.67936 18.75 10',
  },
  16: {
    track: 'M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15Z',
    arc: 'M8 1C9.85652 1 11.637 1.7375 12.9497 3.05025C14.2625 4.36301 15 6.14348 15 8',
  },
} as const

function Spinner({ size }: { size: 16 | 20 }) {
  const { track, arc } = SPINNER_PATHS[size]
  return (
    <svg
      className={styles.spinner}
      data-size={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={track} stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <path d={arc} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
