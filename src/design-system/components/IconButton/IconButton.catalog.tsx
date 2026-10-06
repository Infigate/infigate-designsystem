import { Fragment } from 'react'
import { defineCatalogEntry, definePlayground, ForcePseudoState, ThumbnailLayout, type ForceablePseudoClass } from '@/features/catalog'
import { IconButton } from './IconButton'
import styles from './IconButton.catalog.module.css'
import { ICON_BUTTON_SIZES, type IconButtonSize } from './IconButton.constants'

const SIZE_LABELS = { sm: 'Small（32px）', md: 'Medium（40px）' } as const

/** よく使うアイコンと、その読み上げ名 */
const ICONS = ['more-horizontal', 'more-vertical', 'x', 'plus', 'search', 'download'] as const
const ICON_LABELS = {
  'more-horizontal': 'その他の操作',
  'more-vertical': 'その他の操作',
  x: '閉じる',
  plus: '追加',
  search: '検索',
  download: 'ダウンロード',
} as const satisfies Record<(typeof ICONS)[number], string>

/** Figma の State。hover・focus は操作で起きる状態なので、擬似クラスを強制して再現する */
const STATES = ['default', 'hover', 'focus', 'disabled'] as const
type State = (typeof STATES)[number]
const STATE_LABELS = {
  default: 'Default',
  hover: 'Hover',
  focus: 'Focus',
  disabled: 'Disabled',
} as const satisfies Record<State, string>
const FORCED_PSEUDO: Partial<Record<State, readonly ForceablePseudoClass[]>> = {
  hover: ['hover'],
  focus: ['focus', 'focus-visible'],
}

function Sample({ size, state, icon }: { size: IconButtonSize; state: State; icon: (typeof ICONS)[number] }) {
  return (
    <ForcePseudoState state={FORCED_PSEUDO[state]}>
      <IconButton icon={icon} aria-label={ICON_LABELS[icon]} size={size} disabled={state === 'disabled'} />
    </ForcePseudoState>
  )
}

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'icon', options: ICONS, defaultValue: 'more-horizontal' },
    { type: 'select', name: 'size', options: ICON_BUTTON_SIZES, defaultValue: 'md' },
    { type: 'select', name: 'state', options: STATES, defaultValue: 'default' },
  ],
  render: ({ icon, size, state }) => <Sample icon={icon} size={size} state={state} />,
  code: ({ icon, size, state }) => {
    const attributes = [
      `icon="${icon}"`,
      `aria-label="${ICON_LABELS[icon]}"`,
      size !== 'md' && `size="${size}"`,
      state === 'disabled' && 'disabled',
    ].filter(Boolean)
    return `<IconButton ${attributes.join(' ')} />`
  },
})

/**
 * IconButton のカタログ定義。
 * Figma: Infigate デザインシステム / Menu（icon-button）
 */
export default defineCatalogEntry({
  name: 'IconButton',
  category: 'actions',
  description: 'アイコンだけのボタン。「…」メニューや閉じるボタンなど、文字を置く余裕がない場所で使います。',
  playground,
  // 一覧のカードに出す小さな見本
  thumbnail: () => (
    <ThumbnailLayout>
      <IconButton icon="more-horizontal" aria-label="操作" />
      <IconButton icon="download" aria-label="ダウンロード" />
      <IconButton icon="x" aria-label="閉じる" />
    </ThumbnailLayout>
  ),
  variants: [
    {
      name: 'States',
      description: '何のボタンか伝わるよう、aria-label で読み上げ名を必ず付けます。',
      render: () => (
        <div className={styles.matrix}>
          <span />
          {STATES.map((state) => (
            <span key={state} className={styles.columnLabel}>
              {STATE_LABELS[state]}
            </span>
          ))}
          {[...ICON_BUTTON_SIZES].reverse().map((size) => (
            <Fragment key={size}>
              <span className={styles.rowLabel}>{SIZE_LABELS[size]}</span>
              {STATES.map((state) => (
                <Sample key={state} size={size} state={state} icon="more-horizontal" />
              ))}
            </Fragment>
          ))}
        </div>
      ),
    },
  ],
  props: [
    { name: 'icon', type: 'IconName', required: true, description: '中のアイコン' },
    {
      name: 'aria-label',
      type: 'string',
      required: true,
      description: '読み上げ名。アイコンだけでは伝わらないので必ず付ける（例: 「その他の操作」「閉じる」）',
    },
    {
      name: 'size',
      type: ICON_BUTTON_SIZES.map((s) => `'${s}'`).join(' | '),
      defaultValue: "'md'",
      description: '大きさ。sm: 32px（アイコン 20px） / md: 40px（アイコン 24px）',
    },
    { name: 'disabled', type: 'boolean', defaultValue: 'false', description: '操作できない状態にする' },
    { name: '...rest', type: "ComponentPropsWithRef<'button'>", description: 'その他の button 要素の属性（onClick・ref など）' },
  ],
})
