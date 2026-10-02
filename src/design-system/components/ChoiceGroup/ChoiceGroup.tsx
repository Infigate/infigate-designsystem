import { useId, type ComponentPropsWithRef, type ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import type { FieldMark } from '../Field/Field.constants'
import { FieldDescription, FieldError, FieldHeading } from '../Field/Field.parts'
import type { ChoiceGroupDirection } from './ChoiceGroup.constants'
import styles from './ChoiceGroup.module.css'

export type ChoiceGroupProps = Omit<ComponentPropsWithRef<'fieldset'>, 'children'> & {
  /** グループの見出し */
  label: ReactNode
  /** 見出しに付ける印。省略すると印なし */
  mark?: FieldMark
  /** 補足文 */
  description?: ReactNode
  /** グループ全体のエラー文 */
  error?: ReactNode
  /** 並べ方。vertical: 縦（標準） / horizontal: 横（入りきらなければ折り返す） */
  direction?: ChoiceGroupDirection
  /** 選択肢（Checkbox・Radio） */
  children: ReactNode
}

/**
 * 選択肢のグループの枠（Figma: グループの組み方）。CheckboxGroup・RadioGroup の土台で、デザインシステムの外には公開しない。
 * fieldset と legend で、見出しをグループ全体に付ける（label で包む Field とは作りが違う）。
 * 見出し・印・補足文・エラー文の見た目は Field と同じ部品を使って揃える。
 */
export function ChoiceGroup({
  label,
  mark,
  description,
  error,
  direction = 'vertical',
  children,
  className,
  ...rest
}: ChoiceGroupProps) {
  const baseId = useId()
  const descriptionId = description ? `${baseId}-description` : undefined
  const errorId = error ? `${baseId}-error` : undefined

  return (
    <fieldset
      {...rest}
      className={cx(styles.group, className)}
      aria-describedby={[descriptionId, errorId, rest['aria-describedby']].filter(Boolean).join(' ') || undefined}
    >
      <legend className={styles.legend}>
        <FieldHeading mark={mark}>{label}</FieldHeading>
      </legend>
      <div className={styles.body}>
        <div className={styles.items} data-direction={direction}>
          {children}
        </div>
        {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
        {error && <FieldError id={errorId}>{error}</FieldError>}
      </div>
    </fieldset>
  )
}
