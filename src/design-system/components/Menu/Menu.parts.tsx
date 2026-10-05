import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import { Icon } from '../Icon'
import { useMenu } from './Menu.context'
import styles from './Menu.module.css'

/** メニューの本体（Figma: menu）。Menu の中身で、カタログの見本でも使う */
export function MenuPanel({ className, ...rest }: ComponentPropsWithRef<'div'>) {
  return <div role="menu" {...rest} className={cx(styles.menu, className)} />
}

export type MenuItemProps = Omit<ComponentPropsWithRef<'button'>, 'onSelect' | 'children'> & {
  /** 項目の文字 */
  children: ReactNode
  /** 選んだとき。呼んだあとメニューは閉じる */
  onSelect?: () => void
  /**
   * 選択中のチェック（Figma: Show check）。表示の切り替えなど「今どれが選ばれているか」を示すときに指定する。
   * 指定すると、読み上げでもチェックの付いた項目として伝わる
   */
  checked?: boolean
  /** 選べない状態にする */
  disabled?: boolean
}

/** メニューの項目1つ（Figma: menu-item）。Menu の中に置く */
export function MenuItem({ children, onSelect, checked, disabled = false, className, onClick, ...rest }: MenuItemProps) {
  const menu = useMenu()
  return (
    <button
      type="button"
      role={checked === undefined ? 'menuitem' : 'menuitemcheckbox'}
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      // フォーカスは矢印キーで動かすので、Tab では止まらないようにする
      tabIndex={-1}
      {...rest}
      className={cx(styles.item, className)}
      onClick={(event) => {
        onClick?.(event)
        if (disabled || event.defaultPrevented) return
        onSelect?.()
        menu.close()
      }}
    >
      <span className={styles.label}>{children}</span>
      {checked && <Icon name="check" size={16} className={styles.check} />}
    </button>
  )
}

/** 項目のグループを分ける線（Figma: menu-separator）。削除のような取り消せない操作を、ほかの項目から離すのに使う */
export function MenuSeparator({ className, ...rest }: ComponentPropsWithRef<'div'>) {
  return <div role="separator" {...rest} className={cx(styles.separator, className)} />
}
