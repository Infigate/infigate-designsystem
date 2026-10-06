import { Fragment } from 'react'
import { defineCatalogEntry, definePlayground, ForcePseudoState, ThumbnailLayout } from '@/features/catalog'
import { Field } from '../Field'
import { Select } from './Select'
import styles from './Select.catalog.module.css'
import { SELECT_SIZES, type SelectSize } from './Select.constants'

const SIZE_LABELS = { lg: 'Large（48px）', md: 'Medium（40px）', sm: 'Small（32px）' } as const

/** Figma の State。focus は操作で起きる状態なので、擬似クラスを強制して再現する */
const SELECT_STATES = ['default', 'filled', 'focus', 'error', 'disabled'] as const
type SelectState = (typeof SELECT_STATES)[number]
const STATE_LABELS = {
  default: 'Default（未選択）',
  filled: 'Filled（選択済み）',
  focus: 'Focus（選択中）',
  error: 'Error（エラー）',
  disabled: 'Disabled（操作不可）',
} as const satisfies Record<SelectState, string>

const PLACEHOLDER = '選択してください'
const OPTIONS = ['選択肢1', '選択肢2', '選択肢3']
const ERROR_MESSAGE = '必須項目です。選択してください。'

/** Figma の見本と同じく、Field に入れてラベルを付けた状態で見せる */
function Sample({ size, state, label }: { size: SelectSize; state: SelectState; label: string }) {
  return (
    <ForcePseudoState state={state === 'focus' ? ['focus', 'focus-visible'] : undefined}>
      <Field label={label} error={state === 'error' ? ERROR_MESSAGE : undefined}>
        <Select
          // 状態を切り替えたときに選択を作り直す
          key={state}
          size={size}
          placeholder={PLACEHOLDER}
          defaultValue={state === 'default' || state === 'disabled' ? '' : OPTIONS[0]}
          disabled={state === 'disabled'}
        >
          {OPTIONS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </Select>
      </Field>
    </ForcePseudoState>
  )
}

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'size', options: SELECT_SIZES, defaultValue: 'md' },
    { type: 'select', name: 'state', options: SELECT_STATES, defaultValue: 'default' },
    { type: 'text', name: 'label', defaultValue: 'ラベル' },
  ],
  render: ({ size, state, label }) => (
    <div className={styles.fieldBox}>
      <Sample size={size} state={state} label={label} />
    </div>
  ),
  code: ({ size, state, label }) => {
    const fieldAttributes = [`label="${label}"`, state === 'error' && `error="${ERROR_MESSAGE}"`].filter(Boolean)
    const selectAttributes = [
      size !== 'md' && `size="${size}"`,
      `placeholder="${PLACEHOLDER}"`,
      (state === 'filled' || state === 'focus' || state === 'error') && `defaultValue="${OPTIONS[0]}"`,
      state === 'disabled' && 'disabled',
    ].filter(Boolean)
    return [
      `<Field ${fieldAttributes.join(' ')}>`,
      `  <Select ${selectAttributes.join(' ')}>`,
      ...OPTIONS.map((option) => `    <option>${option}</option>`),
      '  </Select>',
      '</Field>',
    ].join('\n')
  },
})

/**
 * Select のカタログ定義。
 * Figma: Infigate デザインシステム / Form（select/trigger・select/option）
 */
export default defineCatalogEntry({
  name: 'Select',
  category: 'inputs',
  description: '決まった選択肢から1つ選ぶ欄。ラベル・補足文・エラー文は Field で付けます。',
  playground,
  // 一覧のカードに出す小さな見本
  thumbnail: () => (
    <ThumbnailLayout fill>
      <Select aria-label="選択肢" placeholder={PLACEHOLDER} defaultValue="">
        {OPTIONS.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </Select>
    </ThumbnailLayout>
  ),
  variants: [
    {
      name: 'Sizes',
      description: 'TextInput と同じ3段階の高さです。並べる TextInput や Button と大きさを揃えます。',
      render: () => (
        <div className={styles.stack}>
          {[...SELECT_SIZES].reverse().map((size) => (
            <Sample key={size} size={size} state="default" label={SIZE_LABELS[size]} />
          ))}
        </div>
      ),
    },
    {
      name: 'States',
      description: 'Hover はありません（TextInput と同じく、枠線の変化に気づきにくく、スマートフォンにないため）。',
      render: () => (
        <div className={styles.scroller}>
          <div className={styles.matrix}>
            <span />
            {[...SELECT_SIZES].reverse().map((size) => (
              <span key={size} className={styles.columnLabel}>
                {SIZE_LABELS[size]}
              </span>
            ))}
            {SELECT_STATES.map((state) => (
              <Fragment key={state}>
                <span className={styles.rowLabel}>{STATE_LABELS[state]}</span>
                {[...SELECT_SIZES].reverse().map((size) => (
                  <Sample key={size} size={size} state={state} label="ラベル" />
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      ),
    },
    {
      name: 'Options',
      description: '開いたメニューはブラウザ標準です。選べない選択肢には disabled を付けます。',
      render: () => (
        <div className={styles.fieldBox}>
          <Field label="お問い合わせの種類">
            <Select placeholder={PLACEHOLDER} defaultValue="">
              <option>製品について</option>
              <option>契約について</option>
              <option>採用について</option>
              <option disabled>その他（受付終了）</option>
            </Select>
          </Field>
        </div>
      ),
    },
  ],
  props: [
    {
      name: 'size',
      type: SELECT_SIZES.map((s) => `'${s}'`).join(' | '),
      defaultValue: "'md'",
      description: '大きさ。lg: 48px / md: 40px / sm: 32px',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '未選択のときに出す文。値が空文字の選択肢として先頭に入り、メニューには出ない',
    },
    {
      name: 'invalid',
      type: 'boolean',
      defaultValue: 'false',
      description: 'エラー表示。Field の中では、Field の error を指定すれば自動で付く',
    },
    { name: 'disabled', type: 'boolean', defaultValue: 'false', description: '操作できない状態にする' },
    { name: 'value / defaultValue', type: 'string', description: '選ばれている値。未選択は空文字' },
    { name: 'children', type: 'ReactNode', description: '選択肢（option・optgroup）' },
    { name: 'className', type: 'string', description: '外側の要素に付くクラス名' },
    { name: '...rest', type: "ComponentPropsWithRef<'select'>", description: 'その他の select 要素の属性（ref・name・onChange など）' },
  ],
})
