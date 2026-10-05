import { defineCatalogEntry, definePlayground, ForcePseudoState } from '@/features/catalog'
import type { IconName } from '../Icon'
import { Tab, TabList, TabPanel, Tabs } from './Tabs'
import styles from './Tabs.catalog.module.css'
import { TAB_VARIANTS, type TabVariant } from './Tabs.constants'
import { TabButton } from './Tabs.parts'

const VARIANT_LABELS = {
  outline: 'Outline',
  solid: 'Solid',
} as const satisfies Record<TabVariant, string>

const SAMPLE_ICONS: IconName[] = ['user', 'calendar', 'folder', 'download', 'search']

/** 本数ぶんのタブと中身を並べた見本 */
function SampleTabs({
  variant,
  count,
  icon = false,
  disabled = false,
}: {
  variant: TabVariant
  count: number
  icon?: boolean
  disabled?: boolean
}) {
  const values = Array.from({ length: count }, (_, index) => `tab${index + 1}`)

  return (
    <Tabs variant={variant} defaultValue="tab1" className={styles.tabs}>
      <TabList aria-label="タブの見本">
        {values.map((value, index) => (
          <Tab
            key={value}
            value={value}
            icon={icon ? SAMPLE_ICONS[index] : undefined}
            disabled={disabled && index === count - 1}
          >
            {`タブ${index + 1}`}
          </Tab>
        ))}
      </TabList>
      {values.map((value, index) => (
        <TabPanel key={value} value={value} className={styles.panel}>
          {`タブ${index + 1}の中身が入ります。`}
        </TabPanel>
      ))}
    </Tabs>
  )
}

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'variant', options: TAB_VARIANTS, defaultValue: 'outline' },
    { type: 'select', name: 'items', options: ['2', '3', '4', '5'], defaultValue: '3' },
    { type: 'boolean', name: 'icon', defaultValue: false },
    { type: 'boolean', name: 'disabled', defaultValue: false },
  ],
  render: ({ variant, items, icon, disabled }) => (
    <SampleTabs key={items} variant={variant} count={Number(items)} icon={icon} disabled={disabled} />
  ),
  code: ({ variant, items, icon, disabled }) => {
    const count = Number(items)
    const tabs = Array.from({ length: count }, (_, index) => {
      const attributes = [
        `value="tab${index + 1}"`,
        icon && `icon="${SAMPLE_ICONS[index]}"`,
        disabled && index === count - 1 && 'disabled',
      ].filter(Boolean)
      return `    <Tab ${attributes.join(' ')}>タブ${index + 1}</Tab>`
    })
    return [
      `<Tabs${variant !== 'outline' ? ` variant="${variant}"` : ''} defaultValue="tab1">`,
      '  <TabList aria-label="…">',
      ...tabs,
      '  </TabList>',
      '  <TabPanel value="tab1">…</TabPanel>',
      '  …',
      '</Tabs>',
    ].join('\n')
  },
})

const STATES = [
  { label: 'Default', state: undefined, selected: false, disabled: false },
  { label: 'Hover', state: ['hover'], selected: false, disabled: false },
  { label: 'Selected', state: undefined, selected: true, disabled: false },
  { label: 'Focus', state: ['focus', 'focus-visible'], selected: false, disabled: false },
  { label: 'Disabled', state: undefined, selected: false, disabled: true },
] as const

/**
 * Tabs のカタログ定義。
 * Figma: Infigate デザインシステム / Tabs（tabs・tab-item）
 */
export default defineCatalogEntry({
  name: 'Tabs',
  category: 'navigation',
  description: '同じ画面の中身を切り替えるタブ。ページの移動には使いません。',
  playground,
  variants: [
    {
      name: 'Variants',
      description: 'Outline は下線と文字色、Solid は塗りと白文字で選択中のタブを示します。',
      render: () => (
        <div className={styles.stack}>
          {TAB_VARIANTS.map((variant) => (
            <div key={variant} className={styles.case}>
              <span className={styles.caseLabel}>{VARIANT_LABELS[variant]}</span>
              <SampleTabs variant={variant} count={4} />
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Item states',
      description: 'Solid は上の2角だけを角丸にし、下の中身の面とつながって見せます。',
      render: () => (
        <div className={styles.states} inert>
          <span />
          {TAB_VARIANTS.map((variant) => (
            <span key={variant} className={styles.caseLabel}>
              {VARIANT_LABELS[variant]}
            </span>
          ))}
          {STATES.map(({ label, state, selected, disabled }) => (
            <div key={label} className={styles.stateRow}>
              <span className={styles.caseLabel}>{label}</span>
              {TAB_VARIANTS.map((variant) => (
                <ForcePseudoState key={variant} state={state}>
                  <TabButton variant={variant} selected={selected} disabled={disabled}>
                    ラベル
                  </TabButton>
                </ForcePseudoState>
              ))}
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'With icons',
      description: 'アイコンは文字の左に置き、文字は省略しません。',
      render: () => <SampleTabs variant="outline" count={3} icon />,
    },
  ],
  props: [
    {
      name: 'variant',
      type: TAB_VARIANTS.map((v) => `'${v}'`).join(' | '),
      defaultValue: "'outline'",
      description: '見た目。outline は下線タイプ、solid は塗りタイプ',
    },
    { name: 'defaultValue', type: 'string', description: '最初に選択しておくタブの value' },
    { name: 'value', type: 'string', description: '選択中のタブの value（外から決めるとき）' },
    { name: 'onValueChange', type: '(value: string) => void', description: 'タブを切り替えたとき' },
    { name: 'children', type: 'ReactNode', required: true, description: 'TabList と TabPanel' },
  ],
  subcomponents: [
    {
      name: 'TabList',
      props: [
        { name: 'children', type: 'ReactNode', required: true, description: 'タブ（Tab）。← → で移り、Home・End で端へ移る' },
        { name: 'aria-label', type: 'string', description: 'タブの並びの読み上げ名' },
      ],
    },
    {
      name: 'Tab',
      props: [
        { name: 'value', type: 'string', required: true, description: 'タブの値。同じ value の TabPanel を表示する' },
        { name: 'children', type: 'ReactNode', required: true, description: 'タブの文字' },
        { name: 'icon', type: 'IconName', description: '文字の左に置くアイコン' },
        { name: 'disabled', type: 'boolean', defaultValue: 'false', description: '選べない状態にする' },
      ],
    },
    {
      name: 'TabPanel',
      props: [
        { name: 'value', type: 'string', required: true, description: '対応するタブの value' },
        { name: 'children', type: 'ReactNode', description: '中身。選択中でないときは隠す（入力内容などは残る）' },
      ],
    },
  ],
})
