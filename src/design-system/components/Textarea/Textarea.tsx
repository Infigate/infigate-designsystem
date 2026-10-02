import { useId, useState, type ChangeEvent, type ComponentPropsWithRef } from 'react'
import { cx } from '@/shared/lib/cx'
import { useFieldControlProps } from '../Field/Field.context'
import styles from './Textarea.module.css'

export type TextareaProps = ComponentPropsWithRef<'textarea'> & {
  /** エラー表示（枠を赤くする）。Field の中では、Field に error を渡せば自動で付く */
  invalid?: boolean
}

/**
 * 複数行のテキスト入力。大きさの違いは作らず、高さは rows で調整する（最低 104px）。
 * maxLength を指定すると、下に文字数カウンター（例: 0 / 500）を表示する。
 * ラベル・補足文・エラー文は Field で付ける。Field の外で使うときは、aria-label などで名前を必ず付ける。
 */
export function Textarea({ invalid, maxLength, value, defaultValue, onChange, className, ...rest }: TextareaProps) {
  const counterId = useId()
  const hasCounter = maxLength !== undefined
  const [uncontrolledLength, setUncontrolledLength] = useState(() => String(defaultValue ?? '').length)
  const length = value !== undefined ? String(value).length : uncontrolledLength

  const fieldProps = useFieldControlProps({
    ...rest,
    invalid,
    // カウンターも説明として読み上げる（上限の文字数が伝わる）
    'aria-describedby': [rest['aria-describedby'], hasCounter && counterId].filter(Boolean).join(' ') || undefined,
  })

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setUncontrolledLength(event.target.value.length)
    onChange?.(event)
  }

  return (
    <div className={styles.control}>
      <textarea
        {...rest}
        {...fieldProps}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        onChange={handleChange}
        className={cx(styles.textarea, className)}
      />
      {hasCounter && (
        <p id={counterId} className={styles.counter} data-invalid={fieldProps['aria-invalid'] ? true : undefined}>
          {length} / {maxLength}
        </p>
      )}
    </div>
  )
}
