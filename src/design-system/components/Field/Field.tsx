import { useId, useMemo, type ComponentPropsWithRef, type ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import { Icon } from '../Icon'
import { FIELD_MARK_LABELS, type FieldMark } from './Field.constants'
import { FieldContext, type FieldContextValue } from './Field.context'
import styles from './Field.module.css'

export type FieldProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  /** ラベル（Figma: Label） */
  label: ReactNode
  /** ラベルに付ける印（Figma: 印の種類）。省略すると印なし */
  mark?: FieldMark
  /** 補足文。入力のヒントや形式の説明に使う */
  description?: ReactNode
  /** エラー文。指定すると入力欄の枠が赤くなり、読み上げでもエラーが伝わる */
  error?: ReactNode
  /** 入力欄の id。エラーの一覧からリンクするなど、id を決めたいときに指定する（省略すると自動で付く） */
  controlId?: string
  /** 入力欄（TextInput など）。1つだけ置く */
  children: ReactNode
}

/**
 * フォームの1項目。ラベル・印（必須／任意）・入力欄・補足文・エラー文をまとめる。
 * 中に置いた入力欄には、ラベル・補足文・エラー文との紐づけ（id・aria-describedby・aria-invalid）が自動で付く。
 */
export function Field({ label, mark, description, error, controlId: ownControlId, children, className, ...rest }: FieldProps) {
  const baseId = useId()
  const controlId = ownControlId ?? `${baseId}-control`
  const descriptionId = description ? `${baseId}-description` : undefined
  const errorId = error ? `${baseId}-error` : undefined

  const context = useMemo<FieldContextValue>(
    () => ({
      controlId,
      describedBy: [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
      invalid: Boolean(error),
      required: mark === 'required',
    }),
    [controlId, descriptionId, errorId, error, mark],
  )

  return (
    <div {...rest} className={cx(styles.field, className)}>
      <label htmlFor={controlId} className={styles.label}>
        {label}
        {mark && (
          <span className={styles.mark} data-mark={mark}>
            {FIELD_MARK_LABELS[mark]}
          </span>
        )}
      </label>
      <FieldContext value={context}>{children}</FieldContext>
      {description && (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          <Icon name="triangle-alert" size={20} className={styles.errorIcon} />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
