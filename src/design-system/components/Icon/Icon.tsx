import type { ComponentPropsWithRef } from 'react'
import { cx } from '@/shared/lib/cx'
import type { FilledIconName, IconName, IconSize, IconVariant } from './Icon.constants'
import styles from './Icon.module.css'
import type { IconDefinition } from './iconSource'
import { ICONS } from './icons.generated'

/** variant="filled" は塗りの版があるアイコンにだけ指定できる */
type IconNameProps = { name: IconName; variant?: Extract<IconVariant, 'line'> } | { name: FilledIconName; variant: IconVariant }

export type IconProps = Omit<ComponentPropsWithRef<'svg'>, 'children'> &
  IconNameProps & {
    /** 大きさ（px） */
    size?: IconSize
    /**
     * アイコンだけで意味を伝えるときの読み上げ名。
     * 省略すると装飾として扱い、支援技術から隠す（文字と並べて使う場合はこちら）。
     */
    label?: string
  }

/**
 * アイコン。色は周囲の文字色（currentColor）を受け継ぐため、アイコンだけ別の色にしない。
 */
export function Icon({ name, variant = 'line', size = 24, label, className, ...rest }: IconProps) {
  const definition: IconDefinition = ICONS[name]
  const elements = variant === 'filled' && definition.filled ? definition.filled : definition.line
  const accessibility = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }

  return (
    <svg
      {...rest}
      {...accessibility}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      focusable="false"
      className={cx(styles.icon, className)}
      data-icon={name}
      data-variant={variant}
      data-size={size}
    >
      {elements.map(([Tag, attributes], index) => (
        <Tag key={index} {...attributes} />
      ))}
    </svg>
  )
}
