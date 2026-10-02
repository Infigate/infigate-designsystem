import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from './Toggle.module.css'

export type ToggleProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'role' | 'children'> & {
  /** ラベル（Figma: Label）。省略するとスイッチだけになるので、aria-label などで名前を付ける */
  children?: ReactNode
}

/**
 * トグルスイッチ。切り替えた瞬間に反映される設定に使う。
 * 送信ボタンで確定するフォームの項目には Checkbox を使う。
 * 中身はブラウザ標準の input type="checkbox" に role="switch" を付けたもので、オン・オフとして読み上げられる。
 * className は外側の要素に付き、そのほかの属性は input に付く。
 */
export function Toggle({ children, className, ...rest }: ToggleProps) {
  return (
    <label className={cx(styles.toggle, className)}>
      <span className={styles.control}>
        <input {...rest} type="checkbox" role="switch" className={styles.input} />
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
        </span>
      </span>
      {children && <span className={styles.label}>{children}</span>}
    </label>
  )
}
