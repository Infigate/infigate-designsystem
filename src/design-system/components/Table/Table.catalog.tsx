import { useState } from 'react'
import { defineCatalogEntry, definePlayground, ForcePseudoState, ThumbnailLayout, type ForceablePseudoClass } from '@/features/catalog'
import { Badge, type BadgeStatus } from '../Badge'
import { Button } from '../Button'
import { Table, TableBody, TableHead, TableRow } from './Table'
import styles from './Table.catalog.module.css'
import { TABLE_ALIGNS, TABLE_SIZES, TABLE_SORTS, type TableAlign, type TableSize, type TableSort } from './Table.constants'
import { TableCell, TableHeaderCell, TableSelectCell } from './TableCell'
import { TableEmpty } from './TableEmpty'

type DealStatus = '受注' | '提案中' | '見積中'
type Deal = { id: string; name: string; owner: string; status: DealStatus; amount: number }

/** 状況ごとのバッジの色 */
const STATUS_COLORS = { 受注: 'success', 提案中: 'info', 見積中: 'neutral' } as const satisfies Record<DealStatus, BadgeStatus>

const DEALS: Deal[] = [
  { id: 'd1', name: '基幹システム刷新', owner: '山田 太郎', status: '提案中', amount: 12_400_000 },
  { id: 'd2', name: '採用サイト制作', owner: '佐藤 花子', status: '受注', amount: 3_200_000 },
  { id: 'd3', name: '社内研修', owner: '鈴木 一郎', status: '見積中', amount: 850_000 },
  { id: 'd4', name: 'アプリ保守', owner: '高橋 美咲', status: '受注', amount: 1_980_000 },
  { id: 'd5', name: 'データ移行', owner: '田中 健', status: '提案中', amount: 5_600_000 },
]

const yen = (amount: number) => amount.toLocaleString('ja-JP')

/** 並び替えの次の状態。押すたびに 昇順 → 降順 → 昇順 と切り替える */
const nextSort = (sort: TableSort): TableSort => (sort === 'asc' ? 'desc' : 'asc')

type SortKey = 'name' | 'amount'

/** 並び替えと選択ができる見本 */
function DealTable({
  size = 'md',
  striped = false,
  bordered = false,
  selectable = false,
  align = 'left',
  label,
}: {
  /** 表の名前。1ページに見本が複数並ぶので、見本ごとに分ける */
  label: string
  size?: TableSize
  striped?: boolean
  bordered?: boolean
  selectable?: boolean
  /** 文字の列（案件名・担当者・状況）の寄せ。金額は数値なので右寄せのまま */
  align?: TableAlign
}) {
  const [sort, setSort] = useState<{ key: SortKey; direction: TableSort }>({ key: 'name', direction: 'asc' })
  const [selected, setSelected] = useState<string[]>(['d4'])

  const rows = [...DEALS].sort((a, b) => {
    const order = sort.key === 'amount' ? a.amount - b.amount : a.name.localeCompare(b.name, 'ja')
    return sort.direction === 'desc' ? -order : order
  })
  const sortOf = (key: SortKey): TableSort => (sort.key === key ? sort.direction : 'none')
  const toggleSort = (key: SortKey) => setSort({ key, direction: nextSort(sortOf(key)) })
  const all = selected.length === DEALS.length

  return (
    <Table aria-label={label} size={size} striped={striped} bordered={bordered}>
      <TableHead>
        <TableRow>
          {selectable && (
            <TableSelectCell
              aria-label="すべての行を選択"
              checked={all}
              indeterminate={selected.length > 0 && !all}
              onChange={() => setSelected(all ? [] : DEALS.map((deal) => deal.id))}
            />
          )}
          <TableHeaderCell align={align} sort={sortOf('name')} onSort={() => toggleSort('name')}>
            案件名
          </TableHeaderCell>
          <TableHeaderCell align={align}>担当者</TableHeaderCell>
          <TableHeaderCell align={align}>状況</TableHeaderCell>
          <TableHeaderCell align="right" sort={sortOf('amount')} onSort={() => toggleSort('amount')}>
            金額（円）
          </TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((deal) => {
          const isSelected = selected.includes(deal.id)
          return (
            <TableRow key={deal.id} selected={selectable && isSelected}>
              {selectable && (
                <TableSelectCell
                  aria-label={`${deal.name}を選択`}
                  checked={isSelected}
                  onChange={() =>
                    setSelected(isSelected ? selected.filter((id) => id !== deal.id) : [...selected, deal.id])
                  }
                />
              )}
              <TableCell align={align}>{deal.name}</TableCell>
              <TableCell align={align}>{deal.owner}</TableCell>
              <TableCell align={align}>
                {/* 選択中の行は色の付いた面なので、塗りが重ならない outline にする */}
                <Badge status={STATUS_COLORS[deal.status]} variant={selectable && isSelected ? 'outline' : 'subtle'}>
                  {deal.status}
                </Badge>
              </TableCell>
              <TableCell align="right">{yen(deal.amount)}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'size', options: TABLE_SIZES, defaultValue: 'md' },
    { type: 'boolean', name: 'striped', defaultValue: false },
    { type: 'boolean', name: 'bordered', defaultValue: false },
    { type: 'boolean', name: 'selectable', defaultValue: false },
    { type: 'select', name: 'align', options: TABLE_ALIGNS, defaultValue: 'left' },
  ],
  render: (values) => (
    <div className={styles.box}>
      <DealTable {...values} label="案件一覧（Playground）" />
    </div>
  ),
  code: ({ size, striped, bordered, selectable, align }) => {
    const alignAttribute = align === 'left' ? '' : ` align="${align}"`
    const attributes = [
      'aria-label="案件一覧"',
      size !== 'md' && `size="${size}"`,
      striped && 'striped',
      bordered && 'bordered',
    ].filter(Boolean)
    return [
      `<Table ${attributes.join(' ')}>`,
      '  <TableHead>',
      '    <TableRow>',
      ...(selectable ? ['      <TableSelectCell aria-label="すべての行を選択" checked={…} onChange={…} />'] : []),
      `      <TableHeaderCell${alignAttribute} sort="asc" onSort={…}>案件名</TableHeaderCell>`,
      `      <TableHeaderCell${alignAttribute}>担当者</TableHeaderCell>`,
      `      <TableHeaderCell${alignAttribute}>状況</TableHeaderCell>`,
      '      <TableHeaderCell align="right" sort="none" onSort={…}>金額（円）</TableHeaderCell>',
      '    </TableRow>',
      '  </TableHead>',
      '  <TableBody>',
      `    <TableRow${selectable ? ' selected={…}' : ''}>`,
      ...(selectable ? ['      <TableSelectCell aria-label="基幹システム刷新を選択" checked={…} onChange={…} />'] : []),
      `      <TableCell${alignAttribute}>基幹システム刷新</TableCell>`,
      `      <TableCell${alignAttribute}>山田 太郎</TableCell>`,
      `      <TableCell${alignAttribute}>`,
      '        <Badge status="info">提案中</Badge>',
      '      </TableCell>',
      '      <TableCell align="right">12,400,000</TableCell>',
      '    </TableRow>',
      '  </TableBody>',
      '</Table>',
    ].join('\n')
  },
})

/** 見出しの見本。hover・focus は操作で起きる状態なので、擬似クラスを強制して再現する */
const HEADER_STATES: { name: string; force?: readonly ForceablePseudoClass[] }[] = [
  { name: 'Default' },
  { name: 'Hover', force: ['hover'] },
  { name: 'Focus', force: ['focus', 'focus-visible'] },
]

/** 行の見本。1行だけの表を、状態ごとに並べる */
const ROW_STATES: { name: string; force?: readonly ForceablePseudoClass[]; selected?: boolean }[] = [
  { name: 'Default' },
  { name: 'Hover', force: ['hover'] },
  { name: 'Selected', selected: true },
]

/**
 * Table のカタログ定義。
 * Figma: Infigate デザインシステム / Table（table-header-cell・table-sort-icon・table-cell・table-row・table-empty）・
 * Table / 使用例
 */
export default defineCatalogEntry({
  name: 'Table',
  category: 'data-display',
  description: '行と列でデータを見せる表。並び替え・行の選択・縞模様・格子を組み合わせて使います。',
  playground,
  // 一覧のカードに出す小さな見本
  thumbnail: () => (
    <ThumbnailLayout fill zoom={0.8}>
      <Table size="sm" aria-label="案件">
        <TableHead>
          <TableRow>
            <TableHeaderCell>案件名</TableHeaderCell>
            <TableHeaderCell>状況</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>採用サイト</TableCell>
            <TableCell>
              <Badge status="success">公開中</Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </ThumbnailLayout>
  ),
  variants: [
    {
      name: 'Basic',
      description: '並び替えできる列の見出しにはアイコンが付きます。数値の列は右にそろえます。',
      render: () => (
        <div className={styles.box}>
          <DealTable label="案件一覧（基本）" />
        </div>
      ),
    },
    {
      name: 'Striped and selectable',
      description: '行数が多い表は縞模様にし、まとめて操作する表はチェック列を付けます。',
      render: () => (
        <div className={styles.box}>
          <DealTable striped selectable label="案件一覧（縞模様・選択）" />
        </div>
      ),
    },
    {
      name: 'Bordered',
      description: '列が多く数値を見比べる表は格子にし、高さを sm にして1画面に入る行数を増やします。',
      render: () => (
        <div className={styles.box}>
          <DealTable size="sm" bordered label="案件一覧（格子・sm）" />
        </div>
      ),
    },
    {
      name: 'Empty',
      description: 'データがないときも見出しの行は残し、次の行動があるときだけボタンを置きます。',
      render: () => (
        <div className={styles.box}>
          <Table aria-label="案件一覧（データなし）">
            <TableHead>
              <TableRow>
                <TableHeaderCell sort="none">案件名</TableHeaderCell>
                <TableHeaderCell>担当者</TableHeaderCell>
                <TableHeaderCell>状況</TableHeaderCell>
                <TableHeaderCell align="right" sort="none">
                  金額（円）
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableEmpty
                colSpan={4}
                title="条件に合う案件がありません"
                description="絞り込みの条件を変えてください。"
                action={<Button variant="outline">条件をクリア</Button>}
              />
            </TableBody>
          </Table>
        </div>
      ),
    },
    {
      name: 'Header states',
      description: '並び替えできる見出しだけが押せます。今の並びの向きは矢印を濃くして示します。',
      render: () => (
        <div className={styles.matrix} inert>
          {HEADER_STATES.map(({ name, force }) => (
            <div key={name} className={styles.matrixRow}>
              <span className={styles.rowLabel}>{name}</span>
              <ForcePseudoState state={force}>
                <Table aria-label={`見出しの見本（${name}）`}>
                  <TableHead>
                    <TableRow>
                      {TABLE_SORTS.map((sort, index) => (
                        <TableHeaderCell key={sort} sort={sort} align={TABLE_ALIGNS[index]}>
                          {sort === 'none' ? '並び替えなし' : sort === 'asc' ? '昇順' : '降順'}
                        </TableHeaderCell>
                      ))}
                    </TableRow>
                  </TableHead>
                </Table>
              </ForcePseudoState>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Row states',
      description: '選んだ行は、縞模様やポインターを乗せたときより優先して色を付けます。',
      render: () => (
        <div className={styles.matrix} inert>
          {ROW_STATES.map(({ name, force, selected }) => (
            <div key={name} className={styles.matrixRow}>
              <span className={styles.rowLabel}>{name}</span>
              <ForcePseudoState state={force}>
                <Table aria-label={`行の見本（${name}）`}>
                  <TableBody>
                    <TableRow selected={selected}>
                      <TableSelectCell aria-label="行を選択" checked={selected ?? false} readOnly />
                      <TableCell>テキスト</TableCell>
                      <TableCell>テキスト</TableCell>
                      <TableCell align="right">1,234</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </ForcePseudoState>
            </div>
          ))}
        </div>
      ),
    },
  ],
  props: [
    {
      name: 'size',
      type: TABLE_SIZES.map((s) => `'${s}'`).join(' | '),
      defaultValue: "'md'",
      description: '高さ。sm: 見出し 36px・行 40px / md: 見出し 52px・行 56px',
    },
    { name: 'striped', type: 'boolean', defaultValue: 'false', description: '1行おきに背景を付ける' },
    { name: 'bordered', type: 'boolean', defaultValue: 'false', description: '列のあいだに縦線を引いて格子にする' },
    { name: 'aria-label', type: 'string', description: '表の名前。表の上に見出しがあるときは aria-labelledby でつなぐ' },
    { name: 'className', type: 'string', description: '外側の要素（横にスクロールする枠）に付くクラス名' },
    { name: '...rest', type: "ComponentPropsWithRef<'table'>", description: 'その他の table 要素の属性' },
  ],
  subcomponents: [
    {
      name: 'TableHeaderCell',
      props: [
        {
          name: 'align',
          type: TABLE_ALIGNS.map((a) => `'${a}'`).join(' | '),
          defaultValue: "'left'",
          description: '文字の寄せ。本文のセルとそろえる',
        },
        {
          name: 'sort',
          type: TABLE_SORTS.map((s) => `'${s}'`).join(' | '),
          description: '並び替えの状態。指定すると見出しが押せるボタンになる',
        },
        { name: 'onSort', type: '() => void', description: '見出しを押したときに呼ばれる。次の並びは使う側で決める' },
        { name: 'children', type: 'ReactNode', required: true, description: '見出しの文字' },
      ],
    },
    {
      name: 'TableCell',
      props: [
        {
          name: 'align',
          type: TABLE_ALIGNS.map((a) => `'${a}'`).join(' | '),
          defaultValue: "'left'",
          description: '文字の寄せ。数値は right にそろえる',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '文字、または部品（リンク・ボタンなど）。部品のときは行の高さがそろうよう上下の余白をとらない',
        },
      ],
    },
    {
      name: 'TableRow',
      props: [{ name: 'selected', type: 'boolean', defaultValue: 'false', description: '選択中。チェック列で選んだ行に付ける' }],
    },
    {
      name: 'TableSelectCell',
      props: [
        { name: 'aria-label', type: 'string', required: true, description: 'チェックボックスの読み上げ名' },
        { name: 'checked / indeterminate', type: 'boolean', description: '選択の状態。見出しでは一部だけ選ばれているとき indeterminate にする' },
        { name: '...rest', type: 'CheckboxProps', description: 'その他の Checkbox の属性（onChange など）' },
      ],
    },
    {
      name: 'TableEmpty',
      props: [
        { name: 'colSpan', type: 'number', required: true, description: '表の列の数' },
        { name: 'title', type: 'ReactNode', defaultValue: "'データがありません'", description: '見出しの文' },
        { name: 'description', type: 'ReactNode', description: '補足の文' },
        { name: 'action', type: 'ReactNode', description: '次の行動のボタン。次の行動があるときだけ置く' },
      ],
    },
  ],
})
