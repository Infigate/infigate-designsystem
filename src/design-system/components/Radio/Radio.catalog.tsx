import { Fragment, useState } from 'react'
import { defineCatalogEntry, definePlayground, ForcePseudoState, type ForceablePseudoClass } from '@/features/catalog'
import { CHOICE_GROUP_DIRECTIONS } from '../ChoiceGroup/ChoiceGroup.constants'
import { FIELD_MARKS } from '../Field/Field.constants'
import { Radio } from './Radio'
import styles from './Radio.catalog.module.css'
import { RadioGroup } from './RadioGroup'

/** Figma の Checked と State。hover・focus は操作で起きる状態なので、擬似クラスを強制して再現する */
const STATES = ['default', 'hover', 'focus', 'disabled'] as const
type State = (typeof STATES)[number]
const STATE_LABELS = {
  default: 'Default',
  hover: 'Hover',
  focus: 'Focus',
  disabled: 'Disabled',
} as const satisfies Record<State, string>
const FORCED_PSEUDO: Partial<Record<State, readonly ForceablePseudoClass[]>> = {
  hover: ['hover'],
  focus: ['focus', 'focus-visible'],
}

function Sample({ checked, state, label }: { checked: boolean; state: State; label: string }) {
  return (
    <ForcePseudoState state={FORCED_PSEUDO[state]}>
      {/* 見本ごとに選択状態を独立させるため、name を付けずに1つずつ置く */}
      <Radio key={String(checked)} value="sample" defaultChecked={checked} disabled={state === 'disabled'}>
        {label}
      </Radio>
    </ForcePseudoState>
  )
}

/** 選んだ値を画面に出す例（value・onValueChange で制御する） */
function ControlledGroup() {
  const [plan, setPlan] = useState('standard')
  return (
    <div className={styles.stack}>
      <RadioGroup label="プラン" value={plan} onValueChange={setPlan}>
        <Radio value="free">フリー</Radio>
        <Radio value="standard">スタンダード</Radio>
        <Radio value="enterprise">エンタープライズ</Radio>
      </RadioGroup>
      <p className={styles.note}>選択中: {plan}</p>
    </div>
  )
}

const playground = definePlayground({
  controls: [
    { type: 'boolean', name: 'checked', defaultValue: false },
    { type: 'select', name: 'state', options: STATES, defaultValue: 'default' },
    { type: 'text', name: 'label', defaultValue: 'ラベル' },
  ],
  render: ({ checked, state, label }) => <Sample checked={checked} state={state} label={label} />,
  code: ({ checked, state, label }) => {
    const attributes = ['value="…"', checked && 'defaultChecked', state === 'disabled' && 'disabled'].filter(Boolean)
    return `<Radio ${attributes.join(' ')}>${label}</Radio>`
  },
})

/**
 * Radio・RadioGroup のカタログ定義。
 * Figma: Infigate デザインシステム / Form（radio・radio-circle・グループの組み方）
 */
export default defineCatalogEntry({
  name: 'Radio',
  category: 'inputs',
  description: '選択肢から1つだけ選ぶときに使うラジオボタン。RadioGroup の中に置きます。',
  playground,
  variants: [
    {
      name: 'States',
      description: '1つだけ選ぶときは丸の Radio、複数選べるときは四角の Checkbox を使います。',
      render: () => (
        <div className={styles.matrix}>
          <span />
          {STATES.map((state) => (
            <span key={state} className={styles.columnLabel}>
              {STATE_LABELS[state]}
            </span>
          ))}
          {[false, true].map((checked) => (
            <Fragment key={String(checked)}>
              <span className={styles.rowLabel}>{checked ? '選択' : '未選択'}</span>
              {STATES.map((state) => (
                <Sample key={state} checked={checked} state={state} label="ラベル" />
              ))}
            </Fragment>
          ))}
        </div>
      ),
    },
    {
      name: 'Group',
      description: '選択は取り消せないので、選ばないことがあるなら「指定なし」を用意します。',
      render: () => (
        <div className={styles.groups}>
          <RadioGroup label="お問い合わせの種類" defaultValue="product">
            <Radio value="product">製品について</Radio>
            <Radio value="contract">契約について</Radio>
            <Radio value="other">その他</Radio>
          </RadioGroup>
          <RadioGroup label="連絡方法" defaultValue="none">
            <Radio value="mail">メール</Radio>
            <Radio value="phone">電話</Radio>
            <Radio value="none">指定なし</Radio>
          </RadioGroup>
          <ControlledGroup />
        </div>
      ),
    },
    {
      name: 'Horizontal',
      description: '選択肢が短く数が少ないときは、横に並べます。',
      render: () => (
        <RadioGroup label="横並び" direction="horizontal" defaultValue="1">
          {['1', '2', '3', '4', '5'].map((n) => (
            <Radio key={n} value={n}>
              選択肢{n}
            </Radio>
          ))}
        </RadioGroup>
      ),
    },
    {
      name: 'Group error',
      description: 'エラー文はグループ全体に1つ付けます。',
      render: () => (
        <RadioGroup label="ご利用の目的" mark="required" error="どれか1つを選んでください。">
          <Radio value="work">仕事</Radio>
          <Radio value="study">学習</Radio>
          <Radio value="private">個人の利用</Radio>
        </RadioGroup>
      ),
    },
    {
      name: 'Without label',
      description: '表の中など、ラベルを置けない場所では丸だけにし、aria-label で名前を付けます。',
      render: () => (
        <RadioGroup label="既定の支払い方法" direction="horizontal" defaultValue="card">
          <Radio value="card" aria-label="クレジットカード" />
          <Radio value="bank" aria-label="銀行振込" />
        </RadioGroup>
      ),
    },
  ],
  props: [
    { name: 'value', type: 'string', required: true, description: '選んだときの値' },
    { name: 'disabled', type: 'boolean', defaultValue: 'false', description: '選べない状態にする' },
    { name: 'children', type: 'ReactNode', description: 'ラベル。省略すると丸だけになるので、aria-label で名前を付ける' },
    { name: 'className', type: 'string', description: '外側の要素（label）に付くクラス名' },
    { name: '...rest', type: "ComponentPropsWithRef<'input'>", description: 'その他の input 要素の属性（ref・onChange など）' },
  ],
  subcomponents: [
    {
      name: 'RadioGroup',
      props: [
        { name: 'label', type: 'ReactNode', required: true, description: 'グループの見出し' },
        { name: 'defaultValue', type: 'string', description: '最初に選んでおく値' },
        { name: 'value', type: 'string', description: '選ばれている値。onValueChange と組み合わせて、選択を制御する' },
        { name: 'onValueChange', type: '(value: string) => void', description: '選択が変わったときに、選ばれた値で呼ばれる' },
        { name: 'name', type: 'string', description: '中のラジオボタンに共通で付く name。省略すると自動で付く' },
        {
          name: 'mark',
          type: FIELD_MARKS.map((m) => `'${m}'`).join(' | '),
          description: '見出しに付ける印。省略すると印なし',
        },
        { name: 'description', type: 'ReactNode', description: '補足文' },
        { name: 'error', type: 'ReactNode', description: 'グループ全体のエラー文' },
        {
          name: 'direction',
          type: CHOICE_GROUP_DIRECTIONS.map((d) => `'${d}'`).join(' | '),
          defaultValue: "'vertical'",
          description: '並べ方。horizontal は入りきらなければ折り返す',
        },
        { name: 'disabled', type: 'boolean', defaultValue: 'false', description: '中のラジオボタンをすべて選べなくする' },
        { name: 'children', type: 'ReactNode', required: true, description: 'Radio' },
      ],
    },
  ],
})
