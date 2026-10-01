import type { ComponentPropsWithRef } from 'react'
import { cx } from '@/shared/lib/cx'
import { useFieldControlProps } from '../Field/Field.context'
import type { TextInputSize } from './TextInput.constants'
import styles from './TextInput.module.css'

export type TextInputProps = Omit<ComponentPropsWithRef<'input'>, 'size'> & {
  /** 大きさ */
  size?: TextInputSize
  /** エラー表示（枠を赤くする）。Field の中では、Field に error を渡せば自動で付く */
  invalid?: boolean
}

/**
 * 1行のテキスト入力。ラベル・補足文・エラー文は Field で付ける。
 * Field の外で使うときは、aria-label などで入力欄の名前を必ず付ける。
 */
export function TextInput({ size = 'md', invalid, type = 'text', className, ...rest }: TextInputProps) {
  const fieldProps = useFieldControlProps({ ...rest, invalid })

  return <input {...rest} {...fieldProps} type={type} className={cx(styles.input, className)} data-size={size} />
}
