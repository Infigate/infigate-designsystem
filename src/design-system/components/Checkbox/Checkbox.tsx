import { useEffect, useRef, type ComponentPropsWithRef, type ReactNode, type Ref } from 'react'
import { cx } from '@/shared/lib/cx'
import { Icon } from '../Icon'
import styles from './Checkbox.module.css'

export type CheckboxProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'children'> & {
  /**
   * 一部選択（Figma: Checked=Indeterminate）。「すべて選択」のチェックで、一部だけ選ばれているときに使う。
   * 見た目と読み上げ（「一部選択」）だけが変わり、checked の値はそのまま
   */
  indeterminate?: boolean
  /** ラベル（Figma: Label）。省略すると箱だけになる（Figma: checkbox-box）ので、aria-label で名前を付ける */
  children?: ReactNode
}

/**
 * チェックボックス。複数選べるとき、1つの項目をオン・オフするときに使う。
 * 中身はブラウザ標準の input type="checkbox" で、見た目だけを差し替えている。
 * className は外側の要素に付き、そのほかの属性は input に付く。
 */
export function Checkbox({ indeterminate = false, children, className, ref, ...rest }: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // indeterminate は HTML の属性がなく、DOM のプロパティでしか設定できない
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <label className={cx(styles.checkbox, className)}>
      <span className={styles.control}>
        <input
          {...rest}
          ref={(element) => {
            inputRef.current = element
            return assignRef(ref, element)
          }}
          type="checkbox"
          className={styles.input}
        />
        <span className={styles.box} aria-hidden="true">
          <Icon name="check" size={24} className={styles.check} />
          <span className={styles.bar} />
        </span>
      </span>
      {children && <span className={styles.label}>{children}</span>}
    </label>
  )
}

/** 受け取った ref（関数・オブジェクトのどちらでも）に要素を渡す。関数の ref が返した片付けの関数はそのまま返す */
function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') return ref(value)
  if (ref) ref.current = value
}
