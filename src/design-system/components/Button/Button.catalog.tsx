import { Fragment } from 'react'
import { defineCatalogEntry, definePlayground, ForcePseudoState, type ForceablePseudoClass } from '@/features/catalog'
import { ICON_NAMES } from '../Icon'
import { Button } from './Button'
import styles from './Button.catalog.module.css'
import { BUTTON_SIZES, BUTTON_THEMES, BUTTON_VARIANTS } from './Button.constants'

const SIZE_LABELS = { lg: 'Large（48px）', md: 'Medium（40px）', sm: 'Small（32px）' } as const
const STANDARD_THEMES = BUTTON_THEMES.filter((theme) => theme !== 'inverse')
/** テーマの用途が伝わる文言（Themes の表で使う） */
const THEME_LABELS = { primary: '保存する', secondary: 'キャンセル', danger: '削除する', warning: '破棄する' } as const

/** Figma の State。hover・active・focus は操作で起きる状態なので、擬似クラスを強制して再現する */
const BUTTON_STATES = ['default', 'hover', 'active', 'focus', 'disabled', 'loading'] as const
const FORCED_PSEUDO: Partial<Record<(typeof BUTTON_STATES)[number], readonly ForceablePseudoClass[]>> = {
  hover: ['hover'],
  active: ['active'],
  focus: ['focus', 'focus-visible'],
}

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'variant', options: BUTTON_VARIANTS, defaultValue: 'solid' },
    { type: 'select', name: 'theme', options: BUTTON_THEMES, defaultValue: 'primary' },
    { type: 'select', name: 'size', options: BUTTON_SIZES, defaultValue: 'md' },
    { type: 'select', name: 'state', options: BUTTON_STATES, defaultValue: 'default' },
    { type: 'select', name: 'leadIcon', options: ['none', ...ICON_NAMES], defaultValue: 'none' },
    { type: 'select', name: 'tailIcon', options: ['none', ...ICON_NAMES], defaultValue: 'none' },
    { type: 'boolean', name: 'fullWidth', defaultValue: false },
    { type: 'text', name: 'label', defaultValue: 'ラベル' },
  ],
  render: ({ variant, theme, size, state, leadIcon, tailIcon, fullWidth, label }) => {
    // inverse は outline・text でだけ使える
    const appearance = theme === 'inverse' ? (variant === 'solid' ? null : { variant, theme }) : { variant, theme }
    if (!appearance) return <p className={styles.note}>theme="inverse" は outline・text でのみ使えます。</p>

    const button = (
      <ForcePseudoState state={FORCED_PSEUDO[state]}>
        <Button
          {...appearance}
          size={size}
          leadIcon={leadIcon === 'none' ? undefined : leadIcon}
          tailIcon={tailIcon === 'none' ? undefined : tailIcon}
          disabled={state === 'disabled'}
          loading={state === 'loading'}
          fullWidth={fullWidth}
        >
          {label}
        </Button>
      </ForcePseudoState>
    )
    return theme === 'inverse' ? <div className={styles.inverseStage}>{button}</div> : button
  },
  code: ({ variant, theme, size, state, leadIcon, tailIcon, fullWidth, label }) => {
    const attributes = [
      variant !== 'solid' && `variant="${variant}"`,
      theme !== 'primary' && `theme="${theme}"`,
      size !== 'md' && `size="${size}"`,
      leadIcon !== 'none' && `leadIcon="${leadIcon}"`,
      tailIcon !== 'none' && `tailIcon="${tailIcon}"`,
      state === 'disabled' && 'disabled',
      state === 'loading' && 'loading',
      fullWidth && 'fullWidth',
    ].filter(Boolean)
    return `<Button${attributes.map((a) => ` ${a}`).join('')}>${label}</Button>`
  },
})

/**
 * Button のカタログ定義。
 * Figma: Infigate デザインシステム / Button（button・button-inverse）
 */
export default defineCatalogEntry({
  name: 'Button',
  category: 'actions',
  description: 'ユーザーの操作を受け付けるボタン。迷ったら solid・primary・md を使います。',
  playground,
  variants: [
    {
      name: 'Variants',
      description: 'solid は画面で一番重要な操作に1つだけ使い、それ以外は outline・text にします。',
      render: () => (
        <>
          <Button variant="solid">保存する</Button>
          <Button variant="outline">下書き保存</Button>
          <Button variant="text">キャンセル</Button>
        </>
      ),
    },
    {
      name: 'Themes',
      description: 'danger は取り消せない操作、warning は確認が必要な操作に使います。',
      render: () => (
        <div className={styles.matrix}>
          <span />
          {BUTTON_VARIANTS.map((variant) => (
            <span key={variant} className={styles.columnLabel}>
              {variant}
            </span>
          ))}
          {STANDARD_THEMES.map((theme) => (
            <Fragment key={theme}>
              <span className={styles.rowLabel}>{theme}</span>
              {BUTTON_VARIANTS.map((variant) => (
                <Button key={variant} variant={variant} theme={theme}>
                  {THEME_LABELS[theme]}
                </Button>
              ))}
            </Fragment>
          ))}
        </div>
      ),
    },
    {
      name: 'Sizes',
      description: 'md が標準です。sm は表やカードの中など狭い場所に限って使います。',
      render: () => (
        <>
          {[...BUTTON_SIZES].reverse().map((size) => (
            <Button key={size} size={size} tailIcon="arrow-right">
              {SIZE_LABELS[size]}
            </Button>
          ))}
        </>
      ),
    },
    {
      name: 'Icons',
      description: '左は操作の意味の補強に、右は方向（次へ・展開）を示すときに使います。',
      render: () => (
        <>
          <Button leadIcon="download">ダウンロード</Button>
          <Button variant="outline" leadIcon="plus">
            追加する
          </Button>
          <Button variant="outline" tailIcon="arrow-right">
            次へ
          </Button>
          <Button variant="text" tailIcon="chevron-down">
            もっと見る
          </Button>
        </>
      ),
    },
    {
      name: 'Disabled',
      description: '押せない理由が画面上で分かるときだけ使います。',
      render: () => (
        <>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} disabled>
              {variant}
            </Button>
          ))}
        </>
      ),
    },
    {
      name: 'Loading',
      description: '通信の待ち時間に使い、二重送信を防ぎます。',
      render: () => (
        <>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} loading>
              {variant}
            </Button>
          ))}
        </>
      ),
    },
    {
      name: 'Inverse',
      description: '濃い下地の上では theme="inverse" を使います（outline・text のみ）。',
      render: () => (
        <div className={styles.inverseSurface}>
          <Button variant="solid">ログイン</Button>
          <Button variant="outline" theme="inverse" leadIcon="user">
            マイページ
          </Button>
          <Button variant="text" theme="inverse">
            ヘルプ
          </Button>
          <Button variant="outline" theme="inverse" disabled>
            利用不可
          </Button>
        </div>
      ),
    },
    {
      name: 'Full width',
      description: 'モバイルのフォーム送信など、親要素の幅いっぱいに広げる場合に使います。',
      render: () => (
        <Button size="lg" fullWidth>
          送信する
        </Button>
      ),
    },
  ],
  props: [
    {
      name: 'variant',
      type: BUTTON_VARIANTS.map((v) => `'${v}'`).join(' | '),
      defaultValue: "'solid'",
      description: 'タイプ（Figma: Type）。強さを表す',
    },
    {
      name: 'theme',
      type: BUTTON_THEMES.map((t) => `'${t}'`).join(' | '),
      defaultValue: "'primary'",
      description: "テーマ（Figma: Theme）。'inverse' は濃い下地用で、variant が outline・text のときだけ指定できる",
    },
    {
      name: 'size',
      type: BUTTON_SIZES.map((s) => `'${s}'`).join(' | '),
      defaultValue: "'md'",
      description: '大きさ（Figma: Size）。lg: 48px / md: 40px / sm: 32px',
    },
    { name: 'leadIcon', type: 'IconName', description: 'ラベルの左に置くアイコン（Figma: Lead icon）' },
    { name: 'tailIcon', type: 'IconName', description: 'ラベルの右に置くアイコン（Figma: Tail icon）' },
    { name: 'loading', type: 'boolean', defaultValue: 'false', description: '処理中表示。true の間は操作できない' },
    { name: 'disabled', type: 'boolean', defaultValue: 'false', description: '押せない状態にする' },
    { name: 'fullWidth', type: 'boolean', defaultValue: 'false', description: '親要素の幅いっぱいに広げる' },
    {
      name: 'type',
      type: "'button' | 'submit' | 'reset'",
      defaultValue: "'button'",
      description: 'form 内で意図せず送信しないよう、既定は button',
    },
    { name: 'children', type: 'ReactNode', required: true, description: 'ボタンのラベル（Figma: Label）' },
    { name: '...rest', type: "ComponentPropsWithRef<'button'>", description: 'その他の button 要素の属性（ref を含む）' },
  ],
})
