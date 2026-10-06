import { defineCatalogEntry, definePlayground, ThumbnailLayout } from '@/features/catalog'
import { Button } from '../Button'
import { IconButton } from '../IconButton'
import { Tooltip } from './Tooltip'
import styles from './Tooltip.catalog.module.css'
import { TOOLTIP_PLACEMENTS } from './Tooltip.constants'
import { TooltipBubble } from './Tooltip.parts'

const PLACEMENT_LABELS = { top: 'Top', bottom: 'Bottom', left: 'Left', right: 'Right' } as const

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'placement', options: TOOLTIP_PLACEMENTS, defaultValue: 'top' },
    { type: 'text', name: 'content', defaultValue: '補足の説明が入ります' },
  ],
  render: ({ placement, content }) => (
    <div className={styles.stage}>
      <Tooltip content={content} placement={placement}>
        <Button variant="outline" theme="secondary">
          ポインターを乗せる・Tab でフォーカス
        </Button>
      </Tooltip>
    </div>
  ),
  code: ({ placement, content }) =>
    [
      `<Tooltip content="${content}"${placement === 'top' ? '' : ` placement="${placement}"`}>`,
      '  <Button>…</Button>',
      '</Tooltip>',
    ].join('\n'),
})

/**
 * Tooltip のカタログ定義。
 * Figma: Infigate デザインシステム / Tooltip（tooltip）
 */
export default defineCatalogEntry({
  name: 'Tooltip',
  category: 'feedback',
  description: 'マウスを乗せたときやフォーカスしたときに出る、短い補足の説明。',
  playground,
  // 一覧のカードに出す小さな見本
  thumbnail: () => (
    <ThumbnailLayout>
      <TooltipBubble placement="top">補足の説明が入ります</TooltipBubble>
    </ThumbnailLayout>
  ),
  variants: [
    {
      name: 'Placements',
      description: '対象の上・下・左・右に出せます。入りきらないときは反対側に出します。',
      render: () => (
        <div className={styles.placements}>
          {TOOLTIP_PLACEMENTS.map((placement) => (
            <div key={placement} className={styles.placement}>
              <span className={styles.label}>{PLACEMENT_LABELS[placement]}</span>
              <TooltipBubble placement={placement}>補足の説明が入ります</TooltipBubble>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Usage',
      description: '操作に必要な情報は入れません。マウスを使わない人には見えにくいためです。',
      render: () => (
        <div className={styles.usage}>
          <Tooltip content="CSV 形式でダウンロードします">
            <IconButton icon="download" aria-label="ダウンロード" />
          </Tooltip>
          <Tooltip content="下書きは 30 日後に自動で消えます" placement="right">
            <Button variant="text" theme="secondary" size="sm" leadIcon="info">
              下書きについて
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ],
  props: [
    {
      name: 'content',
      type: 'ReactNode',
      required: true,
      description: '補足の説明。短い文にし、操作に必要な情報は入れない',
    },
    {
      name: 'children',
      type: 'ReactElement',
      required: true,
      description: '説明を付ける対象。ボタンなど、フォーカスできるものにする',
    },
    {
      name: 'placement',
      type: TOOLTIP_PLACEMENTS.map((p) => `'${p}'`).join(' | '),
      defaultValue: "'top'",
      description: '対象のどちら側に出すか。入りきらなければ反対側に出す',
    },
  ],
})
