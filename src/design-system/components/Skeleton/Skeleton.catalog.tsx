import { defineCatalogEntry, definePlayground } from '@/features/catalog'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../Table'
import { Skeleton } from './Skeleton'
import styles from './Skeleton.catalog.module.css'
import { SKELETON_SHAPES } from './Skeleton.constants'

const SHAPE_LABELS = { text: 'text（文字1行）', circle: 'circle（顔写真・アイコン）', rect: 'rect（画像・塊）' } as const

const playground = definePlayground({
  controls: [{ type: 'select', name: 'shape', options: SKELETON_SHAPES, defaultValue: 'text' }],
  render: ({ shape }) => (
    <div className={styles.box}>
      <Skeleton shape={shape} width={shape === 'circle' ? undefined : 240} />
    </div>
  ),
  code: ({ shape }) => `<Skeleton${shape !== 'text' ? ` shape="${shape}"` : ''}${shape === 'circle' ? '' : ' width={240}'} />`,
})

/** カードの読み込み中（実際のカードと同じ余白・大きさ） */
function CardSkeleton() {
  return (
    <div className={styles.card}>
      <Skeleton shape="rect" height={160} />
      <div className={styles.cardBody}>
        <div className={styles.cardHead}>
          <Skeleton shape="circle" />
          <Skeleton width={120} height={16} />
        </div>
        <div className={styles.lines}>
          <Skeleton />
          <Skeleton />
          <Skeleton width={160} />
        </div>
      </div>
    </div>
  )
}

const COLUMN_WIDTHS = [180, 140, 120, 80]

/**
 * Skeleton のカタログ定義。
 * Figma: Infigate デザインシステム / Loading（skeleton）
 */
export default defineCatalogEntry({
  name: 'Skeleton',
  category: 'feedback',
  description: '表示される形が分かっている場所に、読み込み中のあいだ置く形。実際の中身と同じ大きさ・同じ位置に置きます。',
  playground,
  variants: [
    {
      name: 'Shapes',
      description: '明るい帯を左から右へ流して、読み込み中であることを表します。',
      render: () => (
        <div className={styles.shapes}>
          {SKELETON_SHAPES.map((shape) => (
            <div key={shape} className={styles.shape}>
              <span className={styles.label}>{SHAPE_LABELS[shape]}</span>
              <Skeleton shape={shape} width={shape === 'circle' ? undefined : 240} />
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Cards',
      description: 'カードと同じ余白・同じ大きさでスケルトンを置きます。',
      render: () => (
        <div className={styles.cards} aria-busy="true" aria-label="読み込み中">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ),
    },
    {
      name: 'Table',
      description: '見出し行はそのまま表示し、本文の行だけをスケルトンにします。行数はだいたい出る数（3〜5行）にします。',
      render: () => (
        <Table aria-label="案件一覧" aria-busy="true" className={styles.table}>
          <TableHead>
            <TableRow>
              <TableHeaderCell>案件名</TableHeaderCell>
              <TableHeaderCell>担当者</TableHeaderCell>
              <TableHeaderCell>状況</TableHeaderCell>
              <TableHeaderCell align="right">金額</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3, 4].map((row) => (
              <TableRow key={row}>
                {COLUMN_WIDTHS.map((width, column) => (
                  <TableCell key={column} align={column === 3 ? 'right' : 'left'}>
                    <Skeleton width={width} className={column === 3 ? styles.alignEnd : undefined} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ),
    },
  ],
  props: [
    {
      name: 'shape',
      type: SKELETON_SHAPES.map((s) => `'${s}'`).join(' | '),
      defaultValue: "'text'",
      description: '形。text は文字1行、circle は顔写真やアイコン、rect は画像や塊',
    },
    { name: 'width', type: 'number | string', description: '幅。数値は px。省略すると text・rect は幅いっぱい、circle は 40px' },
    { name: 'height', type: 'number | string', description: '高さ。数値は px。省略すると text は 12px、rect は 120px、circle は幅と同じ' },
    { name: '...rest', type: "ComponentPropsWithRef<'span'>", description: 'その他の span 要素の属性（className など）' },
  ],
})
