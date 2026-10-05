import { Fragment, useState } from 'react'
import { defineCatalogEntry, definePlayground, ForcePseudoState, type ForceablePseudoClass } from '@/features/catalog'
import { Tag } from './Tag'
import styles from './Tag.catalog.module.css'

/** Figma の State。hover・active・focus は操作で起きる状態なので、擬似クラスを強制して再現する */
const STATES = ['default', 'hover', 'active', 'focus'] as const
type State = (typeof STATES)[number]
const STATE_LABELS = {
  default: 'Default',
  hover: 'Hover',
  active: 'Active',
  focus: 'Focus',
} as const satisfies Record<State, string>
const FORCED_PSEUDO: Partial<Record<State, readonly ForceablePseudoClass[]>> = {
  hover: ['hover'],
  active: ['active'],
  focus: ['focus', 'focus-visible'],
}

/**
 * 見本の行。タグの使い方は「押して選ぶタグ（選択中を持つ）」と「× で外すタグ（本体は押せない）」の2通り。
 * 外すタグは並んでいること自体が「選ばれている」ことを表すので、選択中は持たない
 */
const ROWS = [
  { name: '通常', selected: false, removable: false },
  { name: '選択中', selected: true, removable: false },
  { name: '削除つき', selected: false, removable: true },
] as const

/** Playground の使い方。select: 押して選ぶタグ / remove: × で外すタグ */
const USAGES = ['select', 'remove'] as const

function Sample({
  state,
  selected,
  removable,
  label,
}: {
  state: State
  selected: boolean
  removable: boolean
  label: string
}) {
  return (
    <ForcePseudoState state={FORCED_PSEUDO[state]}>
      <Tag
        selected={selected}
        onClick={removable ? undefined : () => {}}
        onRemove={removable ? () => {} : undefined}
      >
        {label}
      </Tag>
    </ForcePseudoState>
  )
}

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'usage', options: USAGES, defaultValue: 'select' },
    { type: 'select', name: 'state', options: STATES, defaultValue: 'default' },
    // 選択中は、押して選ぶタグ（usage="select"）のときだけ効く
    { type: 'boolean', name: 'selected', defaultValue: false },
    { type: 'text', name: 'label', defaultValue: 'ラベル' },
  ],
  render: ({ usage, state, selected, label }) => (
    <Sample state={state} selected={usage === 'select' && selected} removable={usage === 'remove'} label={label} />
  ),
  code: ({ usage, selected, label }) =>
    usage === 'remove'
      ? `<Tag onRemove={…}>${label}</Tag>`
      : `<Tag${selected ? ' selected' : ''} onClick={…}>${label}</Tag>`,
})

const CATEGORIES = ['デザイン', '開発', 'マーケティング', '営業', '人事']

/** 絞り込みの見本。押すたびに選択中が切り替わる */
function FilterExample() {
  const [selected, setSelected] = useState(['開発'])
  return (
    <div className={styles.stack}>
      <div className={styles.tags} role="group" aria-label="職種で絞り込み">
        {CATEGORIES.map((category) => {
          const isSelected = selected.includes(category)
          return (
            <Tag
              key={category}
              selected={isSelected}
              onClick={() =>
                setSelected(isSelected ? selected.filter((c) => c !== category) : [...selected, category])
              }
            >
              {category}
            </Tag>
          )
        })}
      </div>
      <p className={styles.note}>選択中: {selected.length > 0 ? selected.join('、') : 'なし'}</p>
    </div>
  )
}

/** 選んだ条件を × で外す見本 */
function RemovableExample() {
  const [conditions, setConditions] = useState(['東京都', '正社員', 'リモート可'])
  return (
    <div className={styles.stack}>
      <div className={styles.tags}>
        {conditions.map((condition) => (
          <Tag key={condition} onRemove={() => setConditions(conditions.filter((c) => c !== condition))}>
            {condition}
          </Tag>
        ))}
      </div>
      {conditions.length === 0 && (
        <button type="button" className={styles.reset} onClick={() => setConditions(['東京都', '正社員', 'リモート可'])}>
          元に戻す
        </button>
      )}
    </div>
  )
}

/**
 * Tag のカタログ定義。
 * Figma: Infigate デザインシステム / Tag（tag）
 */
export default defineCatalogEntry({
  name: 'Tag',
  category: 'data-display',
  description: '分類や絞り込みに使うラベル。押して選ぶタグと、× で外すタグの2通りで使います。',
  playground,
  variants: [
    {
      name: 'States',
      description: '削除つきの行は × の状態です。外すタグは本体を押せず、選択中も持ちません。',
      render: () => (
        <div className={styles.matrix}>
          <span />
          {STATES.map((state) => (
            <span key={state} className={styles.columnLabel}>
              {STATE_LABELS[state]}
            </span>
          ))}
          {ROWS.map((row) => (
            <Fragment key={row.name}>
              <span className={styles.rowLabel}>{row.name}</span>
              {STATES.map((state) =>
                // × の Active は Hover と同じ見た目なので、削除つきでは見せない
                row.removable && state === 'active' ? (
                  <span key={state} />
                ) : (
                  <div key={state}>
                    <Sample state={state} selected={row.selected} removable={row.removable} label="ラベル" />
                  </div>
                ),
              )}
            </Fragment>
          ))}
        </div>
      ),
    },
    {
      name: 'Filter',
      description: '絞り込みでは、押すたびに選択中が切り替わります。',
      render: () => <FilterExample />,
    },
    {
      name: 'Removable',
      description: '選んだ条件を外せるようにするときは × を付けます。',
      render: () => <RemovableExample />,
    },
  ],
  props: [
    { name: 'children', type: 'ReactNode', required: true, description: 'ラベル' },
    {
      name: 'selected',
      type: 'boolean',
      defaultValue: 'false',
      description: '選択中。押して選ぶタグ（onClick）で使う。× で外すタグには付けない',
    },
    {
      name: 'onClick',
      type: '(event) => void',
      description: 'タグを押したとき。指定するとタグ全体が押せるボタンになり、selected は「押されている」と読み上げる',
    },
    {
      name: 'onRemove',
      type: '() => void',
      description: '× を押したとき。指定すると右端に × が出る。選んだ条件や入力した値を外すタグで使い、onClick・selected とは組み合わせない',
    },
    { name: 'removeLabel', type: 'string', description: '× の読み上げ名。省略すると「（ラベル）を削除」' },
    { name: 'className', type: 'string', description: '外側の要素に付くクラス名' },
  ],
})
