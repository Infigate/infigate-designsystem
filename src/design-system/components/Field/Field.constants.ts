// Fast Refresh を効かせるため、コンポーネント以外の export は Field.tsx から分離している

/**
 * ラベルに付ける印（Figma: form/mark・印の種類）
 * required: 必須（赤） / optional: 任意（グレー）
 * 1つのフォームの中では、必須だけを付けるか任意だけを付けるか、どちらかに統一する。
 */
export const FIELD_MARKS = ['required', 'optional'] as const

export type FieldMark = (typeof FIELD_MARKS)[number]

/** 印の文言 */
export const FIELD_MARK_LABELS = { required: '必須', optional: '任意' } as const satisfies Record<FieldMark, string>
