import { Fragment, useState } from 'react'
import { defineCatalogEntry, definePlayground, ForcePseudoState, type ForceablePseudoClass } from '@/features/catalog'
import { CHOICE_GROUP_DIRECTIONS } from '../ChoiceGroup/ChoiceGroup.constants'
import { FIELD_MARKS } from '../Field/Field.constants'
import { Checkbox } from './Checkbox'
import styles from './Checkbox.catalog.module.css'
import { CheckboxGroup } from './CheckboxGroup'

/** Figma の Checked と State。hover・focus は操作で起きる状態なので、擬似クラスを強制して再現する */
const CHECKED_STATES = ['unchecked', 'checked', 'indeterminate'] as const
type CheckedState = (typeof CHECKED_STATES)[number]
const CHECKED_LABELS = { unchecked: '未選択', checked: '選択', indeterminate: '一部選択' } as const
const STATES = ['default', 'hover', 'focus', 'disabled'] as const
type State = (typeof STATES)[number]
const FORCED_PSEUDO: Partial<Record<State, readonly ForceablePseudoClass[]>> = {
  hover: ['hover'],
  focus: ['focus', 'focus-visible'],
}

function Sample({ checked, state, label }: { checked: CheckedState; state: State; label: string }) {
  return (
    <ForcePseudoState state={FORCED_PSEUDO[state]}>
      <Checkbox
        // 状態を切り替えたときに選択状態を作り直す
        key={checked}
        defaultChecked={checked === 'checked'}
        indeterminate={checked === 'indeterminate'}
        disabled={state === 'disabled'}
      >
        {label}
      </Checkbox>
    </ForcePseudoState>
  )
}

const OPTIONS = ['選択肢1', '選択肢2', '選択肢3']

/** すべて選択（一部だけ選ばれているときは一部選択の表示にする） */
function SelectAll() {
  const [selected, setSelected] = useState<string[]>(['選択肢1'])
  const all = selected.length === OPTIONS.length
  const some = selected.length > 0 && !all

  return (
    <CheckboxGroup label="すべて選択（Indeterminate）">
      <Checkbox checked={all} indeterminate={some} onChange={() => setSelected(all ? [] : OPTIONS)}>
        すべて選択
      </Checkbox>
      <div className={styles.children}>
        {OPTIONS.map((option) => (
          <Checkbox
            key={option}
            checked={selected.includes(option)}
            onChange={(event) =>
              setSelected(event.target.checked ? [...selected, option] : selected.filter((s) => s !== option))
            }
          >
            {option}
          </Checkbox>
        ))}
      </div>
    </CheckboxGroup>
  )
}

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'checked', options: CHECKED_STATES, defaultValue: 'unchecked' },
    { type: 'select', name: 'state', options: STATES, defaultValue: 'default' },
    { type: 'text', name: 'label', defaultValue: 'ラベル' },
  ],
  render: ({ checked, state, label }) => <Sample checked={checked} state={state} label={label} />,
  code: ({ checked, state, label }) => {
    const attributes = [
      checked === 'checked' && 'defaultChecked',
      checked === 'indeterminate' && 'indeterminate',
      state === 'disabled' && 'disabled',
    ].filter(Boolean)
    return `<Checkbox${attributes.map((a) => ` ${a}`).join('')}>${label}</Checkbox>`
  },
})

/**
 * Checkbox・CheckboxGroup のカタログ定義。
 * Figma: Infigate デザインシステム / Form（checkbox・checkbox-box・グループの組み方）
 */
export default defineCatalogEntry({
  name: 'Checkbox',
  category: 'inputs',
  description: '複数選べるとき、1つの項目をオン・オフするときに使うチェックボックス。',
  playground,
  variants: [
    {
      name: 'States',
      description: '一部選択（Indeterminate）は「すべて選択」で、一部だけ選ばれている状態に使います。',
      render: () => (
        <div className={styles.matrix}>
          <span />
          {STATES.map((state) => (
            <span key={state} className={styles.columnLabel}>
              {state}
            </span>
          ))}
          {CHECKED_STATES.map((checked) => (
            <Fragment key={checked}>
              <span className={styles.rowLabel}>{CHECKED_LABELS[checked]}</span>
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
      description: '選択肢は CheckboxGroup でまとめ、見出しをグループ全体に付けます。',
      render: () => (
        <div className={styles.groups}>
          <CheckboxGroup label="複数選択">
            <Checkbox defaultChecked>選択肢1</Checkbox>
            <Checkbox>選択肢2</Checkbox>
            <Checkbox>選択肢3</Checkbox>
          </CheckboxGroup>
          <SelectAll />
          <CheckboxGroup label="操作できない項目を含む">
            <Checkbox defaultChecked>選択肢1</Checkbox>
            <Checkbox>選択肢2</Checkbox>
            <Checkbox disabled>選択肢3</Checkbox>
          </CheckboxGroup>
        </div>
      ),
    },
    {
      name: 'Horizontal',
      description: '選択肢が短く数が少ないときは、横に並べます。',
      render: () => (
        <CheckboxGroup label="横並び" direction="horizontal">
          {['選択肢1', '選択肢2', '選択肢3', '選択肢4', '選択肢5'].map((option, index) => (
            <Checkbox key={option} defaultChecked={index === 0}>
              {option}
            </Checkbox>
          ))}
        </CheckboxGroup>
      ),
    },
    {
      name: 'Group error',
      description: 'エラー文はグループ全体に1つ付けます。',
      render: () => (
        <CheckboxGroup label="興味のある分野" mark="required" error="1つ以上選んでください。">
          <Checkbox>デザイン</Checkbox>
          <Checkbox>開発</Checkbox>
          <Checkbox>マーケティング</Checkbox>
        </CheckboxGroup>
      ),
    },
    {
      name: 'Without label',
      description: '表のチェック列など、ラベルを置けない場所では箱だけにし、aria-label で名前を付けます。',
      render: () => (
        <>
          <Checkbox aria-label="すべての行を選択" indeterminate />
          <Checkbox aria-label="1行目を選択" defaultChecked />
          <Checkbox aria-label="2行目を選択" />
        </>
      ),
    },
  ],
  props: [
    {
      name: 'indeterminate',
      type: 'boolean',
      defaultValue: 'false',
      description: '一部選択。見た目と読み上げだけが変わり、checked はそのまま',
    },
    { name: 'checked / defaultChecked', type: 'boolean', description: '選択状態' },
    { name: 'disabled', type: 'boolean', defaultValue: 'false', description: '操作できない状態にする' },
    { name: 'children', type: 'ReactNode', description: 'ラベル。省略すると箱だけになるので、aria-label で名前を付ける' },
    { name: 'className', type: 'string', description: '外側の要素（label）に付くクラス名' },
    { name: '...rest', type: "ComponentPropsWithRef<'input'>", description: 'その他の input 要素の属性（ref・name・value・onChange など）' },
  ],
  subcomponents: [
    {
      name: 'CheckboxGroup',
      props: [
        { name: 'label', type: 'ReactNode', required: true, description: 'グループの見出し' },
        {
          name: 'mark',
          type: FIELD_MARKS.map((m) => `'${m}'`).join(' | '),
          description: '見出しに付ける印。省略すると印なし（Field と同じ）',
        },
        { name: 'description', type: 'ReactNode', description: '補足文' },
        { name: 'error', type: 'ReactNode', description: 'グループ全体のエラー文' },
        {
          name: 'direction',
          type: CHOICE_GROUP_DIRECTIONS.map((d) => `'${d}'`).join(' | '),
          defaultValue: "'vertical'",
          description: '並べ方。horizontal は入りきらなければ折り返す',
        },
        { name: 'disabled', type: 'boolean', defaultValue: 'false', description: '中のチェックボックスをすべて操作できなくする' },
        { name: 'children', type: 'ReactNode', required: true, description: 'Checkbox' },
        { name: '...rest', type: "ComponentPropsWithRef<'fieldset'>", description: 'その他の fieldset 要素の属性' },
      ],
    },
  ],
})
