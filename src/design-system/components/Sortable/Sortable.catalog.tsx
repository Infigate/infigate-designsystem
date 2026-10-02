import { useState } from 'react'
import { defineCatalogEntry, definePlayground, ForcePseudoState } from '@/features/catalog'
import { Sortable, type SortableItem } from './Sortable'
import styles from './Sortable.catalog.module.css'
import { SortableList, SortablePlaceholder, SortableRow } from './Sortable.parts'

const FIELDS: SortableItem[] = [
  { id: 'name', label: '氏名' },
  { id: 'company', label: '会社名' },
  { id: 'email', label: 'メールアドレス' },
  { id: 'phone', label: '電話番号' },
  { id: 'address', label: '住所' },
]

/** 実際に並べ替えられる見本 */
function Demo({ count }: { count: number }) {
  const [items, setItems] = useState(FIELDS.slice(0, count))
  return (
    <div className={styles.box}>
      <Sortable aria-label="表示する列の順番" items={items} onReorder={setItems} />
      <p className={styles.note}>並び: {items.map((item) => item.label).join(' → ')}</p>
    </div>
  )
}

const playground = definePlayground({
  // 切り替える props がないので、実際に並べ替えて試せる見本とコード例だけを出す
  controls: [],
  render: () => <Demo count={4} />,
  code: () =>
    [
      'const [items, setItems] = useState([',
      "  { id: 'name', label: '氏名' },",
      "  { id: 'company', label: '会社名' },",
      '  …',
      '])',
      '',
      '<Sortable aria-label="表示する列の順番" items={items} onReorder={setItems} />',
    ].join('\n'),
})

/** 状態ごとの見本。操作できないよう inert にする */
const STATES = [
  { name: 'Default', row: <SortableRow label="ラベル" /> },
  {
    name: 'Hover',
    row: (
      <ForcePseudoState state={['hover']}>
        <SortableRow label="ラベル" />
      </ForcePseudoState>
    ),
  },
  { name: 'Dragging', row: <SortableRow label="ラベル" lifted /> },
  {
    name: 'Drop target',
    // すき間だと分かるよう、下に行を並べて見せる
    row: (
      <>
        <SortablePlaceholder className={styles.slotSample} />
        <SortableRow label="ラベル" />
      </>
    ),
  },
]

/**
 * Sortable のカタログ定義。
 * Figma: Infigate デザインシステム / Sortable（sortable-item・並べ替えているとき）
 */
export default defineCatalogEntry({
  name: 'Sortable',
  category: 'inputs',
  description: 'ドラッグで項目の順番を並べ替えるリスト。キーボードでも並べ替えられます。',
  playground,
  variants: [
    {
      name: 'States',
      description: 'つかめるのは左端のハンドルだけです。差し込む位置は、キーカラーのすき間で示します。',
      render: () => (
        <div className={styles.matrix} inert>
          {STATES.map(({ name, row }) => (
            <div key={name} className={styles.matrixRow}>
              <span className={styles.rowLabel}>{name}</span>
              <SortableList className={styles.sample}>{row}</SortableList>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Reordering',
      description: '動かしている行はもとの位置から抜け、まわりの行がずれて差し込む位置にすき間が開きます。',
      render: () => (
        <div className={styles.box} inert>
          <SortableList>
            <SortableRow label="会社名" />
            <SortablePlaceholder className={styles.slotSample} />
            <SortableRow label="メールアドレス" />
            <SortableRow label="電話番号" />
            <SortableRow label="氏名" lifted floating className={styles.floatingSample} />
          </SortableList>
        </div>
      ),
    },
    {
      name: 'Keyboard',
      description: 'ハンドルで Space を押して持ち上げ、↑↓ で動かし、Space で確定、Esc で取り消します。',
      render: () => <Demo count={3} />,
    },
  ],
  props: [
    {
      name: 'items',
      type: 'readonly { id: string; label: string }[]',
      required: true,
      description: '並べる項目。id は並べ替えても変わらない一意の値、label は行の文字',
    },
    {
      name: 'onReorder',
      type: '(items) => void',
      required: true,
      description: '並べ替えたときに、新しい順の項目で呼ばれる。受け取った並びを items に渡し直す',
    },
    { name: 'aria-label', type: 'string', description: 'リストの名前。見出しがあるときは aria-labelledby でつなぐ' },
    { name: '...rest', type: "ComponentPropsWithoutRef<'ul'>", description: 'その他の ul 要素の属性（className など）' },
  ],
})
