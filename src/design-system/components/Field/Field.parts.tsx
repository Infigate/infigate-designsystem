import type { ReactNode } from 'react'
import { Icon } from '../Icon'
import { FIELD_MARK_LABELS, type FieldMark as FieldMarkType } from './Field.constants'
import styles from './Field.module.css'

/*
 * Field の見た目の部品。Field と、選択肢のグループ（CheckboxGroup など）で共通に使い、
 * ラベル・印・補足文・エラー文の見た目を揃える。デザインシステムの外には公開しない。
 */

/** 見出し（label・legend）の中身。印を見出しの中に置き、読み上げでも伝わるようにする */
export function FieldHeading({ children, mark }: { children: ReactNode; mark?: FieldMarkType }) {
  return (
    <span className={styles.heading}>
      {children}
      {mark && (
        <span className={styles.mark} data-mark={mark}>
          {FIELD_MARK_LABELS[mark]}
        </span>
      )}
    </span>
  )
}

export function FieldDescription({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className={styles.description}>
      {children}
    </p>
  )
}

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className={styles.error}>
      <Icon name="triangle-alert" size={20} className={styles.errorIcon} />
      <span>{children}</span>
    </p>
  )
}
