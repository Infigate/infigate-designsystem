import { Fragment, useId, useState } from 'react'
import { defineCatalogEntry, definePlayground, ForcePseudoState, ThumbnailLayout, type ForceablePseudoClass } from '@/features/catalog'
import { Toggle } from './Toggle'
import styles from './Toggle.catalog.module.css'

/** Figma の Checked と State。hover・focus は操作で起きる状態なので、擬似クラスを強制して再現する */
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

function Sample({ checked, state, label }: { checked: boolean; state: State; label: string }) {
  return (
    <ForcePseudoState state={FORCED_PSEUDO[state]}>
      {/* 状態を切り替えたときに、オン・オフを作り直す */}
      <Toggle key={String(checked)} defaultChecked={checked} disabled={state === 'disabled'}>
        {label}
      </Toggle>
    </ForcePseudoState>
  )
}

/** 設定画面の1行（Figma: setting-row）。見出しをクリックしても切り替わるよう、label の htmlFor でつなぐ */
function SettingRow({
  title,
  description,
  defaultChecked = false,
}: {
  title: string
  description: string
  defaultChecked?: boolean
}) {
  const id = useId()
  const descriptionId = useId()
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <div className={styles.row}>
      <div className={styles.texts}>
        <label htmlFor={id} className={styles.title}>
          {title}
        </label>
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      </div>
      <Toggle
        id={id}
        aria-describedby={descriptionId}
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
      />
    </div>
  )
}

const playground = definePlayground({
  controls: [
    { type: 'boolean', name: 'checked', defaultValue: false },
    { type: 'select', name: 'state', options: STATES, defaultValue: 'default' },
    { type: 'text', name: 'label', defaultValue: 'ラベル' },
  ],
  render: ({ checked, state, label }) => <Sample checked={checked} state={state} label={label} />,
  code: ({ checked, state, label }) => {
    const attributes = [checked && 'defaultChecked', state === 'disabled' && 'disabled'].filter(Boolean)
    return `<Toggle${attributes.map((a) => ` ${a}`).join('')}>${label}</Toggle>`
  },
})

/**
 * Toggle のカタログ定義。
 * Figma: Infigate デザインシステム / Form（toggle・設定行の例）
 */
export default defineCatalogEntry({
  name: 'Toggle',
  category: 'inputs',
  description: 'すぐに反映される設定のオン・オフに使うスイッチ。送信して確定するフォームの項目には Checkbox を使います。',
  playground,
  // 一覧のカードに出す小さな見本
  thumbnail: () => (
    <ThumbnailLayout direction="column">
      <Toggle defaultChecked>通知を受け取る</Toggle>
      <Toggle>自動で保存する</Toggle>
    </ThumbnailLayout>
  ),
  variants: [
    {
      name: 'States',
      description: 'オン・オフは色だけでなく、つまみの位置でも分かるようにしています。',
      render: () => (
        <div className={styles.matrix}>
          <span />
          {STATES.map((state) => (
            <span key={state} className={styles.columnLabel}>
              {STATE_LABELS[state]}
            </span>
          ))}
          {[false, true].map((checked) => (
            <Fragment key={String(checked)}>
              <span className={styles.rowLabel}>{checked ? 'オン' : 'オフ'}</span>
              {STATES.map((state) => (
                <Sample key={state} checked={checked} state={state} label="ラベル" />
              ))}
            </Fragment>
          ))}
        </div>
      ),
    },
    {
      name: 'Setting row',
      description: '設定画面では、見出しと補足文を左、スイッチを右に置きます。',
      render: () => (
        <div className={styles.settings}>
          <SettingRow
            title="メールで通知を受け取る"
            description="新着のお問い合わせをメールでお知らせします"
            defaultChecked
          />
          <SettingRow title="週次レポートを受け取る" description="毎週月曜に送信します" />
        </div>
      ),
    },
  ],
  props: [
    { name: 'checked / defaultChecked', type: 'boolean', description: 'オン・オフの状態' },
    {
      name: 'onChange',
      type: '(event: ChangeEvent<HTMLInputElement>) => void',
      description: '切り替えたときに呼ばれる。オン・オフは event.target.checked で受け取る',
    },
    { name: 'disabled', type: 'boolean', defaultValue: 'false', description: '操作できない状態にする' },
    { name: 'children', type: 'ReactNode', description: 'ラベル。省略するとスイッチだけになるので、aria-label などで名前を付ける' },
    { name: 'className', type: 'string', description: '外側の要素（label）に付くクラス名' },
    { name: '...rest', type: "ComponentPropsWithRef<'input'>", description: 'その他の input 要素の属性（ref・id・name など）' },
  ],
})
