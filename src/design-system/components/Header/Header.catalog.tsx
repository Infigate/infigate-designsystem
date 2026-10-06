import { useState, type MouseEvent } from 'react'
import { defineCatalogEntry, definePlayground, ForcePseudoState, ThumbnailLayout } from '@/features/catalog'
import { Button } from '../Button'
import { Header, HeaderNavItem } from './Header'
import styles from './Header.catalog.module.css'
import { HEADER_THEMES, type HeaderTheme } from './Header.constants'
import { HeaderNavList } from './Header.parts'

const NAV_ITEMS = ['サービス', '実績', '会社情報', '採用']

/** 見本のリンクはページを移動させない */
const stay = (event: MouseEvent) => event.preventDefault()

/** ロゴの仮置き。実際はロゴ画像に差し替え、トップページへのリンクにする */
function SampleLogo({ theme }: { theme: HeaderTheme }) {
  return (
    <a href="#" className={styles.logo} onClick={stay}>
      <span className={styles.mark} data-theme={theme} aria-hidden />
      Sample
    </a>
  )
}

function SampleActions({ theme }: { theme: HeaderTheme }) {
  return (
    <>
      {theme === 'dark' ? (
        <Button variant="outline" theme="inverse">
          資料請求
        </Button>
      ) : (
        <Button variant="outline">資料請求</Button>
      )}
      <Button>お問い合わせ</Button>
    </>
  )
}

/** 押した項目が Current になる見本 */
function SampleHeader({
  theme,
  logo = true,
  actions = true,
  defaultMenuOpen,
  navLabel,
}: {
  theme: HeaderTheme
  logo?: boolean
  actions?: boolean
  defaultMenuOpen?: boolean
  /** ナビゲーションの読み上げ名。1ページに見本が複数並ぶので、見本ごとに分ける */
  navLabel: string
}) {
  const [current, setCurrent] = useState(NAV_ITEMS[0])

  return (
    <Header
      theme={theme}
      logo={logo ? <SampleLogo theme={theme} /> : undefined}
      actions={actions ? <SampleActions theme={theme} /> : undefined}
      defaultMenuOpen={defaultMenuOpen}
      navLabel={navLabel}
    >
      {NAV_ITEMS.map((label) => (
        <HeaderNavItem
          key={label}
          href="#"
          current={label === current}
          onClick={(event) => {
            stay(event)
            setCurrent(label)
          }}
        >
          {label}
        </HeaderNavItem>
      ))}
    </Header>
  )
}

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'layout', options: ['desktop', 'mobile'], defaultValue: 'desktop' },
    { type: 'select', name: 'theme', options: HEADER_THEMES, defaultValue: 'light' },
    { type: 'boolean', name: 'logo', defaultValue: true },
    { type: 'boolean', name: 'actions', defaultValue: true },
  ],
  // ヘッダーは幅 1024px 以上で Desktop の見た目になるので、見本を欄の幅いっぱいに広げる
  wide: true,
  render: ({ layout, theme, logo, actions }) => (
    <div className={layout === 'mobile' ? styles.mobile : styles.wide}>
      <SampleHeader key={layout} theme={theme} logo={logo} actions={actions} navLabel="メインメニュー（Playground）" />
    </div>
  ),
  code: ({ theme, logo, actions }) => {
    const attributes = [theme !== 'light' && `theme="${theme}"`, logo && 'logo={<Logo />}', actions && 'actions={<>…</>}'].filter(
      Boolean,
    )
    return [
      attributes.length ? `<Header ${attributes.join(' ')}>` : '<Header>',
      '  <HeaderNavItem href="/services" current>サービス</HeaderNavItem>',
      '  <HeaderNavItem href="/works">実績</HeaderNavItem>',
      '  <HeaderNavItem href="/company">会社情報</HeaderNavItem>',
      '  <HeaderNavItem href="/recruit">採用</HeaderNavItem>',
      '</Header>',
    ].join('\n')
  },
})

const STATES = [
  { label: 'Default', state: undefined, current: false },
  { label: 'Hover', state: ['hover'], current: false },
  { label: 'Current', state: undefined, current: true },
  { label: 'Focus', state: ['focus', 'focus-visible'], current: false },
] as const

/**
 * Header のカタログ定義。
 * Figma: Infigate デザインシステム / Header（header・nav-item・logo）
 */
export default defineCatalogEntry({
  name: 'Header',
  category: 'navigation',
  description: 'サイト共通のヘッダー。ロゴは左、ナビと操作は右にまとめます。',
  playground,
  // 一覧のカードに出す小さな見本
  thumbnail: () => (
    <ThumbnailLayout fill>
      <Header logo={<SampleLogo theme="light" />}>
        <HeaderNavItem href="#">サービス</HeaderNavItem>
      </Header>
    </ThumbnailLayout>
  ),
  variants: [
    {
      name: 'Themes',
      description: 'Dark では、ロゴを白のモノクロにします。',
      render: () => (
        <div className={styles.stack}>
          {HEADER_THEMES.map((theme) => (
            <div key={theme} className={styles.wide}>
              <SampleHeader theme={theme} navLabel={`メインメニュー（${theme}）`} />
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Mobile',
      description: '幅が 1024px より狭いと、ナビと操作をメニューボタンにまとめてヘッダーの下に開きます。',
      render: () => (
        <div className={styles.mobiles}>
          {HEADER_THEMES.map((theme) => (
            <div key={theme} className={styles.mobile}>
              <SampleHeader theme={theme} defaultMenuOpen navLabel={`メインメニュー（モバイル・${theme}）`} />
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Nav item states',
      description: '今いるページは、下線と文字の濃さの2つで示します。',
      render: () => (
        <div className={styles.stack}>
          {HEADER_THEMES.map((theme) => (
            <div key={theme} className={styles.states} data-theme={theme}>
              {STATES.map(({ label, state, current }) => (
                <div key={label} className={styles.state}>
                  <span className={styles.stateLabel}>{label}</span>
                  <ForcePseudoState state={state}>
                    <HeaderNavList theme={theme}>
                      <HeaderNavItem href="#" current={current} onClick={stay}>
                        メニュー
                      </HeaderNavItem>
                    </HeaderNavList>
                  </ForcePseudoState>
                </div>
              ))}
            </div>
          ))}
        </div>
      ),
    },
  ],
  props: [
    {
      name: 'theme',
      type: HEADER_THEMES.map((t) => `'${t}'`).join(' | '),
      defaultValue: "'light'",
      description: '下地の色。dark ではロゴを白のモノクロにし、ボタンは Button の theme="inverse" を使う',
    },
    {
      name: 'logo',
      type: 'ReactNode',
      description: '左端のロゴ。トップページへのリンクにする。ロゴを別の場所に置く画面では省略できる',
    },
    { name: 'children', type: 'ReactNode', description: 'ナビゲーション項目（HeaderNavItem）' },
    { name: 'actions', type: 'ReactNode', description: '右端の操作。Button を2つまでで、主ボタンを右に置く' },
    { name: 'navLabel', type: 'string', defaultValue: "'メインメニュー'", description: 'ナビゲーションの読み上げ名' },
    { name: 'menuLabel', type: 'string', defaultValue: "'メニュー'", description: 'モバイルでメニューを開くボタンの読み上げ名' },
    { name: 'defaultMenuOpen', type: 'boolean', defaultValue: 'false', description: 'モバイルのメニューを開いた状態で表示する' },
    { name: '...rest', type: "ComponentPropsWithRef<'header'>", description: 'その他の header 要素の属性（className など）' },
  ],
  subcomponents: [
    {
      name: 'HeaderNavItem',
      props: [
        { name: 'children', type: 'ReactNode', required: true, description: '項目の文字' },
        { name: 'href', type: 'string', required: true, description: 'リンク先' },
        { name: 'current', type: 'boolean', defaultValue: 'false', description: '今いるページ。読み上げでも伝える' },
        { name: '...rest', type: "ComponentPropsWithRef<'a'>", description: 'その他の a 要素の属性（onClick など）' },
      ],
    },
  ],
})
