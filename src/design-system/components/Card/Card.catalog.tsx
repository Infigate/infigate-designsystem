import type { MouseEvent } from 'react'
import { defineCatalogEntry, definePlayground, ForcePseudoState, IgnoreForcedPseudoState } from '@/features/catalog'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { Card, type CardProps } from './Card'
import styles from './Card.catalog.module.css'
import { CARD_VARIANTS, type CardVariant } from './Card.constants'
import sampleMedia from './sample-media.jpg'

const VARIANT_LABELS = { outline: 'Outline', elevated: 'Elevated' } as const satisfies Record<CardVariant, string>

const TITLE = '見出しが入ります'
const DESCRIPTION = 'テキストが入ります。テキストが入ります。'

/** 見本のリンクはページを移動させない */
const stay = (event: MouseEvent) => event.preventDefault()

type SampleOptions = {
  variant?: CardVariant
  media?: boolean
  badge?: boolean
  description?: string | false
  actions?: boolean
  disabled?: boolean
} & Pick<CardProps, 'className'>

/** Figma の見本と同じ中身のカード */
function SampleCard({
  variant = 'outline',
  media = true,
  badge = true,
  description = DESCRIPTION,
  actions = true,
  disabled = false,
  className,
}: SampleOptions) {
  return (
    <Card
      className={className}
      variant={variant}
      title={TITLE}
      href="#"
      linkProps={{ onClick: stay }}
      disabled={disabled}
      media={media ? <img src={sampleMedia} alt="" /> : undefined}
      meta={
        badge ? (
          <Badge status={disabled ? 'neutral' : 'info'} variant="subtle">
            バッジ
          </Badge>
        ) : undefined
      }
      description={description || undefined}
      actions={
        actions ? (
          // States の見本でカードを Hover・Focus にしても、ボタンは通常の見た目のままにする
          <IgnoreForcedPseudoState>
            <Button size="sm" disabled={disabled}>
              ラベル
            </Button>
            <Button size="sm" variant="outline" disabled={disabled}>
              ラベル
            </Button>
          </IgnoreForcedPseudoState>
        ) : undefined
      }
    />
  )
}

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'variant', options: CARD_VARIANTS, defaultValue: 'outline' },
    { type: 'boolean', name: 'media', defaultValue: true },
    { type: 'boolean', name: 'meta', defaultValue: true },
    { type: 'boolean', name: 'description', defaultValue: true },
    { type: 'boolean', name: 'actions', defaultValue: true },
    { type: 'boolean', name: 'disabled', defaultValue: false },
  ],
  render: ({ variant, media, meta, description, actions, disabled }) => (
    <SampleCard
      className={styles.single}
      variant={variant}
      media={media}
      badge={meta}
      description={description && DESCRIPTION}
      actions={actions}
      disabled={disabled}
    />
  ),
  code: ({ variant, media, meta, description, actions, disabled }) => {
    const attributes = [
      variant !== 'outline' && `variant="${variant}"`,
      `title="${TITLE}"`,
      'href="/works/1"',
      media && 'media={<img src={…} alt="" />}',
      meta && 'meta={<Badge status="info">バッジ</Badge>}',
      description && `description="${DESCRIPTION}"`,
      actions && 'actions={<>…</>}',
      disabled && 'disabled',
    ].filter(Boolean)
    return ['<Card', ...attributes.map((a) => `  ${a}`), '/>'].join('\n')
  },
})

const STATES = [
  { label: 'Default', state: undefined, disabled: false },
  { label: 'Hover', state: ['hover'], disabled: false },
  { label: 'Focus', state: ['focus-visible'], disabled: false },
  { label: 'Disabled', state: undefined, disabled: true },
] as const

/**
 * Card のカタログ定義。
 * Figma: Infigate デザインシステム / Card（card）
 */
export default defineCatalogEntry({
  name: 'Card',
  category: 'data-display',
  description: '画像・見出し・本文などをまとめて見せるカード。href を指定すると、カード全体がリンクになります。',
  playground,
  variants: [
    {
      name: 'States',
      description: 'Outline は枠線で区切り、Elevated は影で浮かせます。中のボタンはカードのリンクとは別に押せます。',
      render: () => (
        <div className={styles.states}>
          <span />
          {CARD_VARIANTS.map((variant) => (
            <span key={variant} className={styles.label}>
              {VARIANT_LABELS[variant]}
            </span>
          ))}
          {STATES.map(({ label, state, disabled }) => (
            <div key={label} className={styles.stateRow}>
              <span className={styles.label}>{label}</span>
              {CARD_VARIANTS.map((variant) => (
                <ForcePseudoState key={variant} state={state}>
                  <SampleCard className={styles.single} variant={variant} disabled={disabled} />
                </ForcePseudoState>
              ))}
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Parts',
      description: '画像・小さな情報・本文・ボタンは、それぞれ省略できます。',
      render: () => (
        <div className={styles.parts}>
          {[
            { label: 'すべて表示', options: {} },
            { label: '画像なし', options: { media: false } },
            { label: '見出しと本文のみ', options: { media: false, badge: false, actions: false } },
            { label: '画像と見出しのみ', options: { badge: false, description: false as const, actions: false } },
          ].map(({ label, options }) => (
            <div key={label} className={styles.part}>
              <span className={styles.label}>{label}</span>
              <SampleCard {...options} />
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'List',
      description: '一覧に並べるときは幅を伸ばし、本文の長さが違っても同じ行のカードは高さをそろえます。',
      render: () => (
        <div className={styles.list}>
          <SampleCard actions={false} description={DESCRIPTION.repeat(3)} />
          <SampleCard actions={false} description="テキストが入ります。" />
          <SampleCard actions={false} description={DESCRIPTION} />
        </div>
      ),
    },
  ],
  props: [
    {
      name: 'variant',
      type: CARD_VARIANTS.map((v) => `'${v}'`).join(' | '),
      defaultValue: "'outline'",
      description: '見た目。outline は枠線、elevated は影',
    },
    { name: 'title', type: 'ReactNode', required: true, description: '見出し' },
    { name: 'headingLevel', type: '2 | 3 | 4 | 5 | 6', defaultValue: '3', description: '見出しの段階。ページの見出しの流れに合わせる' },
    { name: 'href', type: 'string', description: '指定すると、カード全体がこのリンクになる' },
    { name: 'linkProps', type: "ComponentPropsWithRef<'a'>", description: 'リンクに渡すその他の属性（target・onClick など）' },
    { name: 'media', type: 'ReactNode', description: '上の画像（img 要素）。枠いっぱいに切り抜いて表示する' },
    { name: 'meta', type: 'ReactNode', description: '見出しの上の小さな情報（Badge など）' },
    { name: 'description', type: 'ReactNode', description: '本文。2行を超える分は省略する' },
    { name: 'actions', type: 'ReactNode', description: '下のボタン（Button の size="sm" を2つまで）。カードのリンクとは別に押せる' },
    {
      name: 'disabled',
      type: 'boolean',
      defaultValue: 'false',
      description: '押せない状態にする。中の Button には disabled、Badge は status="neutral" を指定する',
    },
    { name: '...rest', type: "ComponentPropsWithRef<'article'>", description: 'その他の article 要素の属性（className など）' },
  ],
})
