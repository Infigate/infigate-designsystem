import { createContext, useContext } from 'react'

/** Field が、中に置いた入力欄へ渡す情報 */
export type FieldContextValue = {
  /** 入力欄の id（ラベルの htmlFor と対応する） */
  controlId: string
  /** 補足文・エラー文の id（スペース区切り。どちらもなければ undefined） */
  describedBy?: string
  /** エラー文があるか */
  invalid: boolean
  /** 印が「必須」か */
  required: boolean
}

export const FieldContext = createContext<FieldContextValue | null>(null)

type Booleanish = boolean | 'true' | 'false'

type OwnControlProps = {
  id?: string
  invalid?: boolean
  'aria-describedby'?: string
  'aria-invalid'?: Booleanish | 'grammar' | 'spelling'
  'aria-required'?: Booleanish
}

/**
 * 入力欄（TextInput など）に付ける、ラベル・補足文・エラー文との紐づけの属性を返す。
 * - id: Field の中では、ラベルと確実に紐づくよう Field の controlId を使う（入力欄に渡した id は使わない）
 * - aria-describedby: Field の補足文・エラー文と、入力欄に渡した値を並べる
 * - aria-invalid・aria-required: 入力欄に渡した値を優先し、なければ Field のエラー文・印から決める
 */
export function useFieldControlProps({
  id,
  invalid,
  'aria-describedby': describedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
}: OwnControlProps) {
  const field = useContext(FieldContext)

  return {
    id: field ? field.controlId : id,
    'aria-describedby': [field?.describedBy, describedBy].filter(Boolean).join(' ') || undefined,
    'aria-invalid': ariaInvalid ?? ((invalid ?? field?.invalid) || undefined),
    'aria-required': ariaRequired ?? (field?.required || undefined),
  }
}
