import type { ComponentPropsWithRef } from 'react'
import { cx } from '@/shared/lib/cx'
import { Icon, type IconName } from '../Icon'
import { ICON_BUTTON_ICON_SIZES, type IconButtonSize } from './IconButton.constants'
import styles from './IconButton.module.css'

export type IconButtonProps = Omit<ComponentPropsWithRef<'button'>, 'children'> & {
  /** 中のアイコン */
  icon: IconName
  /** 読み上げ名。アイコンだけでは何のボタンか伝わらないので必ず付ける（例: 「その他の操作」「閉じる」） */
  'aria-label': string
  /** 大きさ */
  size?: IconButtonSize
}

/**
 * アイコンだけのボタン（Figma: icon-button）。「…」メニューや閉じるボタンなど、文字を置く余裕がない場所で使う。
 * 文字を置けるなら、意味が伝わりやすい Button を使う。
 */
export function IconButton({ icon, size = 'md', type = 'button', className, ...rest }: IconButtonProps) {
  return (
    <button {...rest} type={type} className={cx(styles.iconButton, className)} data-size={size}>
      <Icon name={icon} size={ICON_BUTTON_ICON_SIZES[size]} />
    </button>
  )
}
