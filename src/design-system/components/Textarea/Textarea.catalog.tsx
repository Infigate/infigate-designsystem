import { defineCatalogEntry, definePlayground, ForcePseudoState, ThumbnailLayout } from '@/features/catalog'
import { Field } from '../Field'
import { Textarea } from './Textarea'
import styles from './Textarea.catalog.module.css'

/** Figma の State。focus は操作で起きる状態なので、擬似クラスを強制して再現する */
const TEXTAREA_STATES = ['default', 'filled', 'focus', 'error', 'disabled'] as const
type TextareaState = (typeof TEXTAREA_STATES)[number]
const STATE_LABELS = {
  default: 'Default（未入力）',
  filled: 'Filled（入力済み）',
  focus: 'Focus（選択中）',
  error: 'Error（エラー）',
  disabled: 'Disabled（操作不可）',
} as const satisfies Record<TextareaState, string>

const PLACEHOLDER = 'お問い合わせ内容を入力してください'
const FILLED_VALUE = 'ここにテキストが入ります'
const ERROR_MESSAGE = '必須項目です。入力してください。'
const MAX_LENGTH = 500

/** Figma の見本と同じく、Field に入れてラベルを付けた状態で見せる */
function Sample({ state, label, counter = true }: { state: TextareaState; label: string; counter?: boolean }) {
  return (
    <ForcePseudoState state={state === 'focus' ? ['focus', 'focus-visible'] : undefined}>
      <Field label={label} error={state === 'error' ? ERROR_MESSAGE : undefined}>
        <Textarea
          // 状態を切り替えたときに入力値を作り直す
          key={state}
          placeholder={PLACEHOLDER}
          defaultValue={state === 'default' || state === 'disabled' ? undefined : FILLED_VALUE}
          disabled={state === 'disabled'}
          maxLength={counter ? MAX_LENGTH : undefined}
        />
      </Field>
    </ForcePseudoState>
  )
}

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'state', options: TEXTAREA_STATES, defaultValue: 'default' },
    { type: 'boolean', name: 'counter', defaultValue: true },
    { type: 'text', name: 'label', defaultValue: 'ラベル' },
  ],
  render: ({ state, counter, label }) => (
    <div className={styles.fieldBox}>
      <Sample state={state} counter={counter} label={label} />
    </div>
  ),
  code: ({ state, counter, label }) => {
    const fieldAttributes = [`label="${label}"`, state === 'error' && `error="${ERROR_MESSAGE}"`].filter(Boolean)
    const textareaAttributes = [
      `placeholder="${PLACEHOLDER}"`,
      counter && `maxLength={${MAX_LENGTH}}`,
      state === 'disabled' && 'disabled',
    ].filter(Boolean)
    return [`<Field ${fieldAttributes.join(' ')}>`, `  <Textarea ${textareaAttributes.join(' ')} />`, '</Field>'].join('\n')
  },
})

/**
 * Textarea のカタログ定義。
 * Figma: Infigate デザインシステム / Form（textarea）
 */
export default defineCatalogEntry({
  name: 'Textarea',
  category: 'inputs',
  description: '複数行のテキストを入力する欄。ラベル・補足文・エラー文は Field で付けます。',
  playground,
  // 一覧のカードに出す小さな見本
  thumbnail: () => (
    <ThumbnailLayout fill zoom={0.8}>
      <Textarea aria-label="入力欄" placeholder="お問い合わせ内容を入力してください" />
    </ThumbnailLayout>
  ),
  variants: [
    {
      name: 'States',
      description: 'TextInput と同じく、Hover はありません。',
      render: () => (
        <div className={styles.grid}>
          {TEXTAREA_STATES.map((state) => (
            <div key={state} className={styles.cell}>
              <span className={styles.caption}>{STATE_LABELS[state]}</span>
              <Sample state={state} label="ラベル" />
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Counter',
      description: '文字数に上限があるときは maxLength を指定し、カウンターを表示します。',
      render: () => (
        <div className={styles.grid}>
          <div className={styles.cell}>
            <span className={styles.caption}>上限あり</span>
            <Sample state="filled" label="自己紹介" />
          </div>
          <div className={styles.cell}>
            <span className={styles.caption}>上限なし</span>
            <Sample state="filled" label="備考" counter={false} />
          </div>
        </div>
      ),
    },
    {
      name: 'Height',
      description: '大きさの違いはありません。入力してほしい量に合わせて rows で高さを変えます。',
      render: () => (
        <Field className={styles.wideBox} label="お問い合わせ内容">
          <Textarea rows={8} placeholder={PLACEHOLDER} />
        </Field>
      ),
    },
  ],
  props: [
    {
      name: 'maxLength',
      type: 'number',
      description: '文字数の上限。指定すると文字数カウンターを表示する',
    },
    { name: 'rows', type: 'number', description: '表示する行数。高さの調整に使う（最低 104px）' },
    {
      name: 'invalid',
      type: 'boolean',
      defaultValue: 'false',
      description: 'エラー表示。Field の中では、Field の error を指定すれば自動で付く',
    },
    { name: 'disabled', type: 'boolean', defaultValue: 'false', description: '操作できない状態にする' },
    { name: 'placeholder', type: 'string', description: '入力例。入力すると消えるため、ラベルや補足文の代わりにはしない' },
    { name: '...rest', type: "ComponentPropsWithRef<'textarea'>", description: 'その他の textarea 要素の属性（ref を含む）' },
  ],
})
