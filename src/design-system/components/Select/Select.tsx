import type { ComponentPropsWithRef } from 'react'
import { cx } from '@/shared/lib/cx'
import { useFieldControlProps } from '../Field/Field.context'
import { Icon } from '../Icon'
import type { SelectSize } from './Select.constants'
import styles from './Select.module.css'

export type SelectProps = Omit<ComponentPropsWithRef<'select'>, 'size' | 'multiple'> & {
  /** 大きさ */
  size?: SelectSize
  /** エラー表示（枠を赤くする）。Field の中では、Field に error を渡せば自動で付く */
  invalid?: boolean
  /**
   * 未選択のときに出す文（Figma: Default の「選択してください」）。
   * 値が空文字の選択肢として先頭に入り、メニューには出ない
   */
  placeholder?: string
}

/**
 * セレクト。決まった選択肢から1つ選ぶときに使う。選択肢は <option> で並べる。
 * 中身はブラウザ標準の select で、開いたメニューは OS のものが出る（キーボード・スマートフォン・読み上げに標準で対応する）。
 * ラベル・補足文・エラー文は Field で付ける。Field の外で使うときは、aria-label などで名前を必ず付ける。
 * className は外側の要素に付き、そのほかの属性は select に付く。
 */
export function Select({ size = 'md', invalid, placeholder, className, children, ...rest }: SelectProps) {
  const fieldProps = useFieldControlProps({ ...rest, invalid })

  return (
    <span className={cx(styles.wrapper, className)} data-size={size}>
      <select {...rest} {...fieldProps} className={styles.select}>
        {placeholder !== undefined && (
          <option value="" hidden data-placeholder>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <Icon name="chevron-down" size={24} className={styles.chevron} />
    </span>
  )
}
