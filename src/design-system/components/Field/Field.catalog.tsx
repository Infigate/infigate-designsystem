import { defineCatalogEntry, definePlayground } from '@/features/catalog'
import { TextInput } from '../TextInput'
import { Field } from './Field'
import styles from './Field.catalog.module.css'
import { FIELD_MARKS } from './Field.constants'

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'mark', options: ['none', ...FIELD_MARKS], defaultValue: 'required' },
    { type: 'text', name: 'label', defaultValue: 'ラベル' },
    { type: 'text', name: 'description', defaultValue: '補足の説明が入ります' },
    { type: 'text', name: 'error', defaultValue: '' },
  ],
  render: ({ mark, label, description, error }) => (
    <Field
      className={styles.fieldBox}
      label={label}
      mark={mark === 'none' ? undefined : mark}
      description={description || undefined}
      error={error || undefined}
    >
      <TextInput placeholder="プレースホルダー" />
    </Field>
  ),
  code: ({ mark, label, description, error }) => {
    const attributes = [
      `label="${label}"`,
      mark !== 'none' && `mark="${mark}"`,
      description && `description="${description}"`,
      error && `error="${error}"`,
    ].filter(Boolean)
    return [`<Field ${attributes.join(' ')}>`, '  <TextInput placeholder="プレースホルダー" />', '</Field>'].join('\n')
  },
})

/**
 * Field のカタログ定義。
 * Figma: Infigate デザインシステム / Form（field・form/mark）
 */
export default defineCatalogEntry({
  name: 'Field',
  category: 'inputs',
  description: 'フォームの1項目。ラベル・印・補足文・エラー文を入力欄とまとめます。',
  playground,
  variants: [
    {
      name: 'Marks',
      description: '1つのフォームの中では、必須だけを付けるか任意だけを付けるか、どちらかに統一します。',
      render: () => (
        <div className={styles.cases}>
          <Field className={styles.fieldBox} label="氏名" mark="required">
            <TextInput placeholder="山田 太郎" />
          </Field>
          <Field className={styles.fieldBox} label="会社名" mark="optional">
            <TextInput placeholder="株式会社インフィゲート" />
          </Field>
          <Field className={styles.fieldBox} label="部署名">
            <TextInput placeholder="営業部" />
          </Field>
        </div>
      ),
    },
    {
      name: 'Description',
      description: '入力の形式やヒントは補足文で伝え、消えてしまうプレースホルダーには頼りません。',
      render: () => (
        <Field className={styles.fieldBox} label="電話番号" mark="required" description="半角数字で、ハイフンなしで入力してください">
          <TextInput type="tel" placeholder="09012345678" />
        </Field>
      ),
    },
    {
      name: 'Error',
      description: 'エラー文には、何が問題でどう直せばよいかを書きます。',
      render: () => (
        <Field className={styles.fieldBox} label="メールアドレス" mark="required" error="メールアドレスの形式で入力してください。">
          <TextInput type="email" defaultValue="yamada@example" />
        </Field>
      ),
    },
  ],
  props: [
    { name: 'label', type: 'ReactNode', required: true, description: 'ラベル（Figma: Label）' },
    {
      name: 'mark',
      type: FIELD_MARKS.map((m) => `'${m}'`).join(' | '),
      description: '印（Figma: 印の種類）。省略すると印なし。required のとき入力欄を必須（aria-required）にする',
    },
    { name: 'description', type: 'ReactNode', description: '補足文。入力の形式やヒントを書く' },
    { name: 'error', type: 'ReactNode', description: 'エラー文。指定すると入力欄の枠が赤くなり、読み上げでもエラーが伝わる' },
    { name: 'controlId', type: 'string', description: '入力欄の id。省略すると自動で付く' },
    { name: 'children', type: 'ReactNode', required: true, description: '入力欄（TextInput など）を1つ' },
    { name: '...rest', type: "ComponentPropsWithRef<'div'>", description: 'その他の div 要素の属性' },
  ],
})
