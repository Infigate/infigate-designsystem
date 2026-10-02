import type { ChangeEvent, ComponentPropsWithRef, ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import { useRadioGroup } from './Radio.context'
import styles from './Radio.module.css'

export type RadioProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'children' | 'value'> & {
  /** 選んだときの値。RadioGroup の value・defaultValue と比べて、選択状態が決まる */
  value: string
  /** ラベル（Figma: Label）。省略すると丸だけになる（Figma: radio-circle）ので、aria-label で名前を付ける */
  children?: ReactNode
}

/**
 * ラジオボタン。選択肢から1つだけ選ぶときに RadioGroup の中で使う。
 * 中身はブラウザ標準の input type="radio" で、見た目だけを差し替えている（矢印キーでの移動もそのまま使える）。
 * className は外側の要素に付き、そのほかの属性は input に付く。
 */
export function Radio({ value, children, className, onChange, ...rest }: RadioProps) {
  const group = useRadioGroup()

  // RadioGroup の中では、name と選択状態を RadioGroup に合わせる
  const groupProps = group && {
    name: group.name,
    ...(group.value !== undefined
      ? { checked: group.value === value }
      : { defaultChecked: group.defaultValue === value }),
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event)
    if (event.target.checked) group?.onValueChange?.(value)
  }

  return (
    <label className={cx(styles.radio, className)}>
      <span className={styles.control}>
        <input
          {...rest}
          {...groupProps}
          type="radio"
          value={value}
          onChange={handleChange}
          className={styles.input}
        />
        <span className={styles.circle} aria-hidden="true" />
      </span>
      {children && <span className={styles.label}>{children}</span>}
    </label>
  )
}
