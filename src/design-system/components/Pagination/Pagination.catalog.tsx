import { useState } from 'react'
import { defineCatalogEntry, definePlayground, ForcePseudoState } from '@/features/catalog'
import { Icon, type IconName } from '../Icon'
import { Pagination } from './Pagination'
import styles from './Pagination.catalog.module.css'
import { PAGINATION_VARIANTS, type PaginationVariant } from './Pagination.constants'
import { PaginationButton } from './Pagination.parts'

/** 押すとページが切り替わる見本 */
function SamplePagination({
  totalPages,
  initialPage = 1,
  variant = 'default',
  disabled = false,
}: {
  totalPages: number
  initialPage?: number
  variant?: PaginationVariant
  disabled?: boolean
}) {
  const [page, setPage] = useState(initialPage)
  return <Pagination page={page} totalPages={totalPages} onPageChange={setPage} variant={variant} disabled={disabled} />
}

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'variant', options: PAGINATION_VARIANTS, defaultValue: 'default' },
    { type: 'select', name: 'totalPages', options: ['5', '7', '20', '100'], defaultValue: '20' },
    { type: 'boolean', name: 'disabled', defaultValue: false },
  ],
  render: ({ variant, totalPages, disabled }) => (
    <SamplePagination key={totalPages} totalPages={Number(totalPages)} variant={variant} disabled={disabled} />
  ),
  code: ({ variant, totalPages, disabled }) => {
    const attributes = [
      'page={page}',
      `totalPages={${totalPages}}`,
      'onPageChange={setPage}',
      variant !== 'default' && `variant="${variant}"`,
      disabled && 'disabled',
    ].filter(Boolean)
    return `<Pagination ${attributes.join(' ')} />`
  },
})

const ITEM_STATES = [
  { label: 'Default', state: undefined, current: false, disabled: false },
  { label: 'Hover', state: ['hover'], current: false, disabled: false },
  { label: 'Selected', state: undefined, current: true, disabled: false },
  { label: 'Focus', state: ['focus', 'focus-visible'], current: false, disabled: false },
  { label: 'Disabled', state: undefined, current: false, disabled: true },
] as const

const NAV_STATES = ITEM_STATES.filter(({ label }) => label !== 'Selected')

const NAV_ICONS: { label: string; icon: IconName }[] = [
  { label: 'First', icon: 'chevrons-left' },
  { label: 'Prev', icon: 'chevron-left' },
  { label: 'Next', icon: 'chevron-right' },
  { label: 'Last', icon: 'chevrons-right' },
]

/**
 * Pagination のカタログ定義。
 * Figma: Infigate デザインシステム / Pagination（pagination・pagination-item・pagination-nav）
 */
export default defineCatalogEntry({
  name: 'Pagination',
  category: 'navigation',
  description: '一覧をページに分けて送るナビゲーション。',
  playground,
  variants: [
    {
      name: 'Types',
      description: '総ページ数が多いと自動で中間を省略し、最初・最後のボタンを足します。',
      render: () => (
        <div className={styles.stack}>
          <div className={styles.case}>
            <span className={styles.caseLabel}>標準（7ページ以下）</span>
            <SamplePagination totalPages={5} />
          </div>
          <div className={styles.case}>
            <span className={styles.caseLabel}>省略あり（8ページ以上）</span>
            <SamplePagination totalPages={20} initialPage={5} />
          </div>
          <div className={styles.case}>
            <span className={styles.caseLabel}>前後のみ（variant="compact"・スマートフォン向け）</span>
            <SamplePagination totalPages={20} initialPage={3} variant="compact" />
          </div>
        </div>
      ),
    },
    {
      name: 'Page states',
      description: 'Selected は今見ているページで、押しても移動しません。',
      render: () => (
        <div className={styles.states} inert>
          {ITEM_STATES.map(({ label, state, current, disabled }) => (
            <div key={label} className={styles.state}>
              <ForcePseudoState state={state}>
                <PaginationButton current={current} disabled={disabled}>
                  1
                </PaginationButton>
              </ForcePseudoState>
              <span className={styles.caseLabel}>{label}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Navigation states',
      description: '最初・最後のページにいるときは、その向きのボタンを押せなくします。',
      render: () => (
        <div className={styles.navGrid} inert>
          <span />
          {NAV_ICONS.map(({ label }) => (
            <span key={label} className={styles.caseLabel}>
              {label}
            </span>
          ))}
          {NAV_STATES.map(({ label, state, disabled }) => (
            <div key={label} className={styles.navRow}>
              <span className={styles.caseLabel}>{label}</span>
              {NAV_ICONS.map(({ label: direction, icon }) => (
                <ForcePseudoState key={direction} state={state}>
                  <PaginationButton disabled={disabled} aria-label={direction}>
                    <Icon name={icon} size={24} />
                  </PaginationButton>
                </ForcePseudoState>
              ))}
            </div>
          ))}
        </div>
      ),
    },
  ],
  props: [
    { name: 'page', type: 'number', required: true, description: '今見ているページ（1から数える）' },
    { name: 'totalPages', type: 'number', required: true, description: '総ページ数。8以上で中間を省略する' },
    { name: 'onPageChange', type: '(page: number) => void', description: 'ページを選んだとき' },
    {
      name: 'getPageHref',
      type: '(page: number) => string',
      description: '指定すると各ページへのリンクにする。URL でページを表す一覧に使う',
    },
    {
      name: 'variant',
      type: PAGINATION_VARIANTS.map((v) => `'${v}'`).join(' | '),
      defaultValue: "'default'",
      description: '見た目。compact は前後のボタンと「3 / 20」だけのスマートフォン向け',
    },
    { name: 'disabled', type: 'boolean', defaultValue: 'false', description: '読み込み中などで、すべてのボタンを押せなくする' },
    { name: 'label', type: 'string', defaultValue: "'ページ送り'", description: 'ナビゲーションの読み上げ名' },
    { name: '...rest', type: "ComponentPropsWithRef<'nav'>", description: 'その他の nav 要素の属性（className など）' },
  ],
})
