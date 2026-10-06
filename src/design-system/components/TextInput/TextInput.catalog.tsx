import { Fragment } from 'react'
import { defineCatalogEntry, definePlayground, ForcePseudoState, ThumbnailLayout } from '@/features/catalog'
import { Field } from '../Field'
import { TextInput } from './TextInput'
import styles from './TextInput.catalog.module.css'
import { TEXT_INPUT_SIZES, type TextInputSize } from './TextInput.constants'

const SIZE_LABELS = { lg: 'Large（48px）', md: 'Medium（40px）', sm: 'Small（32px）' } as const

/** Figma の State。focus は操作で起きる状態なので、擬似クラスを強制して再現する */
const TEXT_INPUT_STATES = ['default', 'filled', 'focus', 'error', 'disabled'] as const
type TextInputState = (typeof TEXT_INPUT_STATES)[number]
const STATE_LABELS = {
  default: 'Default（未入力）',
  filled: 'Filled（入力済み）',
  focus: 'Focus（選択中）',
  error: 'Error（エラー）',
  disabled: 'Disabled（操作不可）',
} as const satisfies Record<TextInputState, string>

const PLACEHOLDER = 'プレースホルダー'
const FILLED_VALUE = '山田 太郎'
const ERROR_MESSAGE = '必須項目です。入力してください。'

/** Figma の見本と同じく、Field に入れてラベルを付けた状態で見せる */
function Sample({ size, state, label }: { size: TextInputSize; state: TextInputState; label: string }) {
  return (
    <ForcePseudoState state={state === 'focus' ? ['focus', 'focus-visible'] : undefined}>
      <Field label={label} error={state === 'error' ? ERROR_MESSAGE : undefined}>
        <TextInput
          // 状態を切り替えたときに入力値を作り直す
          key={state}
          size={size}
          placeholder={PLACEHOLDER}
          defaultValue={state === 'default' || state === 'disabled' ? undefined : FILLED_VALUE}
          disabled={state === 'disabled'}
        />
      </Field>
    </ForcePseudoState>
  )
}

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'size', options: TEXT_INPUT_SIZES, defaultValue: 'md' },
    { type: 'select', name: 'state', options: TEXT_INPUT_STATES, defaultValue: 'default' },
    { type: 'text', name: 'label', defaultValue: 'ラベル' },
  ],
  render: ({ size, state, label }) => (
    <div className={styles.fieldBox}>
      <Sample size={size} state={state} label={label} />
    </div>
  ),
  code: ({ size, state, label }) => {
    const fieldAttributes = [`label="${label}"`, state === 'error' && `error="${ERROR_MESSAGE}"`].filter(Boolean)
    const inputAttributes = [
      size !== 'md' && `size="${size}"`,
      `placeholder="${PLACEHOLDER}"`,
      state === 'disabled' && 'disabled',
    ].filter(Boolean)
    return [
      `<Field ${fieldAttributes.join(' ')}>`,
      `  <TextInput ${inputAttributes.join(' ')} />`,
      '</Field>',
    ].join('\n')
  },
})

/**
 * TextInput のカタログ定義。
 * Figma: Infigate デザインシステム / Form（input/text）
 */
export default defineCatalogEntry({
  name: 'TextInput',
  category: 'inputs',
  description: '1行のテキストを入力する欄。ラベル・補足文・エラー文は Field で付けます。',
  playground,
  // 一覧のカードに出す小さな見本
  thumbnail: () => (
    <ThumbnailLayout fill>
      <TextInput aria-label="入力欄" placeholder="プレースホルダー" />
    </ThumbnailLayout>
  ),
  variants: [
    {
      name: 'Sizes',
      description: 'Button と同じ3段階の高さです。並べる Button と大きさを揃えます。',
      render: () => (
        <div className={styles.stack}>
          {[...TEXT_INPUT_SIZES].reverse().map((size) => (
            <Sample key={size} size={size} state="default" label={SIZE_LABELS[size]} />
          ))}
        </div>
      ),
    },
    {
      name: 'States',
      description: 'Hover はありません（枠線の変化に気づきにくく、スマートフォンにないため）。',
      render: () => (
        <div className={styles.scroller}>
          <div className={styles.matrix}>
            <span />
            {[...TEXT_INPUT_SIZES].reverse().map((size) => (
              <span key={size} className={styles.columnLabel}>
                {SIZE_LABELS[size]}
              </span>
            ))}
            {TEXT_INPUT_STATES.map((state) => (
              <Fragment key={state}>
                <span className={styles.rowLabel}>{STATE_LABELS[state]}</span>
                {[...TEXT_INPUT_SIZES].reverse().map((size) => (
                  <Sample key={size} size={size} state={state} label="ラベル" />
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      ),
    },
  ],
  props: [
    {
      name: 'size',
      type: TEXT_INPUT_SIZES.map((s) => `'${s}'`).join(' | '),
      defaultValue: "'md'",
      description: '大きさ。lg: 48px / md: 40px / sm: 32px',
    },
    {
      name: 'invalid',
      type: 'boolean',
      defaultValue: 'false',
      description: 'エラー表示。Field の中では、Field の error を指定すれば自動で付く',
    },
    { name: 'disabled', type: 'boolean', defaultValue: 'false', description: '操作できない状態にする' },
    { name: 'type', type: 'string', defaultValue: "'text'", description: "入力の種類（'email'・'password'・'tel' など）" },
    { name: 'placeholder', type: 'string', description: '入力例。入力すると消えるため、ラベルや補足文の代わりにはしない' },
    { name: '...rest', type: "ComponentPropsWithRef<'input'>", description: 'その他の input 要素の属性（ref を含む）' },
  ],
})
