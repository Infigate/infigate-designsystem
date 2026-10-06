import { Fragment } from 'react'
import { defineCatalogEntry, definePlayground, ThumbnailLayout } from '@/features/catalog'
import { Badge } from './Badge'
import styles from './Badge.catalog.module.css'
import { BADGE_STATUSES, BADGE_VARIANTS, type BadgeStatus } from './Badge.constants'

/** 状態ごとの言葉の例（Figma の見本と同じ） */
const LABELS = {
  neutral: '下書き',
  success: '公開中',
  error: 'エラー',
  warning: '要確認',
  info: 'お知らせ',
} as const satisfies Record<BadgeStatus, string>

const VARIANT_LABELS = { subtle: 'Subtle', outline: 'Outline', solid: 'Solid' } as const

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'status', options: BADGE_STATUSES, defaultValue: 'success' },
    { type: 'select', name: 'variant', options: BADGE_VARIANTS, defaultValue: 'subtle' },
    { type: 'text', name: 'label', defaultValue: '公開中' },
  ],
  render: ({ status, variant, label }) => (
    <Badge status={status} variant={variant}>
      {label}
    </Badge>
  ),
  code: ({ status, variant, label }) => {
    const attributes = [status !== 'neutral' && `status="${status}"`, variant !== 'subtle' && `variant="${variant}"`].filter(
      Boolean,
    )
    return `<Badge${attributes.map((a) => ` ${a}`).join('')}>${label}</Badge>`
  },
})

/**
 * Badge のカタログ定義。
 * Figma: Infigate デザインシステム / Badge（badge）
 */
export default defineCatalogEntry({
  name: 'Badge',
  category: 'data-display',
  description: '状態を短い言葉で示すラベル。押せないので、操作には使いません。',
  playground,
  // 一覧のカードに出す小さな見本
  thumbnail: () => (
    <ThumbnailLayout>
      <Badge status="success" variant="solid">
        公開中
      </Badge>
      <Badge status="warning">確認中</Badge>
      <Badge variant="outline">下書き</Badge>
    </ThumbnailLayout>
  ),
  variants: [
    {
      name: 'Variants',
      description: '強調したい度合いで Solid ＞ Subtle ＞ Outline の順に選びます。ふだんは Subtle を使います。',
      render: () => (
        <div className={styles.matrix}>
          {BADGE_VARIANTS.map((variant) => (
            <Fragment key={variant}>
              <span className={styles.rowLabel}>{VARIANT_LABELS[variant]}</span>
              <div className={styles.row}>
                {BADGE_STATUSES.map((status) => (
                  <Badge key={status} status={status} variant={variant}>
                    {LABELS[status]}
                  </Badge>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      ),
    },
    {
      name: 'On colored surface',
      description: '選択中の行など色の付いた面の上では、強調の度合いにかかわらず、塗りが重ならない Outline にします。',
      render: () => (
        <div className={styles.surface}>
          {BADGE_STATUSES.map((status) => (
            <Badge key={status} status={status} variant="outline">
              {LABELS[status]}
            </Badge>
          ))}
        </div>
      ),
    },
  ],
  props: [
    {
      name: 'status',
      type: BADGE_STATUSES.map((s) => `'${s}'`).join(' | '),
      defaultValue: "'neutral'",
      description: '状態。色だけで伝えず、ラベルの言葉でも状態が分かるようにする',
    },
    {
      name: 'variant',
      type: BADGE_VARIANTS.map((v) => `'${v}'`).join(' | '),
      defaultValue: "'subtle'",
      description: '見た目。強調の度合いで選ぶ（solid ＞ subtle ＞ outline）。色の付いた面の上では outline',
    },
    { name: 'children', type: 'ReactNode', required: true, description: 'ラベル。短い言葉にする' },
    { name: '...rest', type: "ComponentPropsWithRef<'span'>", description: 'その他の span 要素の属性（className など）' },
  ],
})
