import type { MouseEvent } from 'react'
import { defineCatalogEntry, definePlayground, ThumbnailLayout } from '@/features/catalog'
import { Footer, FooterColumn, FooterLink } from './Footer'
import styles from './Footer.catalog.module.css'
import { FOOTER_THEMES, type FooterTheme } from './Footer.constants'

const COLUMNS = [
  { title: 'サービス', links: ['Webサイト制作', 'システム開発', '保守・運用'] },
  { title: '会社情報', links: ['会社概要', 'アクセス', '採用情報'] },
  { title: 'サポート', links: ['お問い合わせ', 'よくある質問'] },
]

const LEGAL_LINKS = ['プライバシーポリシー', '利用規約']

/** 見本のリンクはページを移動させない */
const stay = (event: MouseEvent) => event.preventDefault()

/** ロゴの仮置き。実際はロゴ画像に差し替え、トップページへのリンクにする */
function SampleLogo({ theme }: { theme: FooterTheme }) {
  return (
    <a href="#" className={styles.logo} onClick={stay}>
      <span className={styles.mark} data-theme={theme} aria-hidden />
      Sample
    </a>
  )
}

function SampleFooter({ theme, description = true, legal = true }: { theme: FooterTheme; description?: boolean; legal?: boolean }) {
  return (
    <Footer
      theme={theme}
      logo={<SampleLogo theme={theme} />}
      description={description ? '会社の簡単な説明がここに入ります。' : undefined}
      copyright="© 2026 Infigate Inc."
      legalLinks={
        legal
          ? LEGAL_LINKS.map((label) => (
              <FooterLink key={label} href="#" onClick={stay}>
                {label}
              </FooterLink>
            ))
          : undefined
      }
    >
      {COLUMNS.map((column) => (
        <FooterColumn key={column.title} title={column.title}>
          {column.links.map((label) => (
            <FooterLink key={label} href="#" onClick={stay}>
              {label}
            </FooterLink>
          ))}
        </FooterColumn>
      ))}
    </Footer>
  )
}

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'layout', options: ['desktop', 'mobile'], defaultValue: 'desktop' },
    { type: 'select', name: 'theme', options: FOOTER_THEMES, defaultValue: 'light' },
    { type: 'boolean', name: 'description', defaultValue: true },
    { type: 'boolean', name: 'legalLinks', defaultValue: true },
  ],
  // フッターは幅 1024px 以上で Desktop の見た目になるので、見本を欄の幅いっぱいに広げる
  wide: true,
  render: ({ layout, theme, description, legalLinks }) => (
    <div className={layout === 'mobile' ? styles.mobile : styles.wide}>
      <SampleFooter theme={theme} description={description} legal={legalLinks} />
    </div>
  ),
  code: ({ theme, description, legalLinks }) => {
    const attributes = [
      theme !== 'light' && `theme="${theme}"`,
      'logo={<Logo />}',
      description && 'description="会社の簡単な説明がここに入ります。"',
      'copyright="© 2026 Infigate Inc."',
      legalLinks && 'legalLinks={<>…</>}',
    ].filter(Boolean)
    return [
      '<Footer',
      ...attributes.map((attribute) => `  ${attribute}`),
      '>',
      '  <FooterColumn title="サービス">',
      '    <FooterLink href="/services/web">Webサイト制作</FooterLink>',
      '    …',
      '  </FooterColumn>',
      '  …',
      '</Footer>',
    ].join('\n')
  },
})

/**
 * Footer のカタログ定義。
 * Figma: Infigate デザインシステム / Footer（footer・logo）
 */
export default defineCatalogEntry({
  name: 'Footer',
  category: 'navigation',
  description: 'サイト共通のフッター。下地の色は Header とそろえて使います。',
  playground,
  // 一覧のカードに出す小さな見本
  thumbnail: () => (
    <ThumbnailLayout fill zoom={0.5}>
      <Footer theme="dark" logo={<SampleLogo theme="dark" />} copyright="© 2026 Infigate Inc." />
    </ThumbnailLayout>
  ),
  variants: [
    {
      name: 'Themes',
      description: 'Dark ではロゴを白のモノクロにし、文字は白と薄いグレーの2段階で組みます。',
      render: () => (
        <div className={styles.stack}>
          {FOOTER_THEMES.map((theme) => (
            <div key={theme} className={styles.wide}>
              <SampleFooter theme={theme} />
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Mobile',
      description: '幅が 1024px より狭いと、ロゴ・リンクのまとまり・下の段を縦に積みます。',
      render: () => (
        <div className={styles.mobiles}>
          {FOOTER_THEMES.map((theme) => (
            <div key={theme} className={styles.mobile}>
              <SampleFooter theme={theme} />
            </div>
          ))}
        </div>
      ),
    },
  ],
  props: [
    {
      name: 'theme',
      type: FOOTER_THEMES.map((t) => `'${t}'`).join(' | '),
      defaultValue: "'light'",
      description: '下地の色。Header とそろえる',
    },
    { name: 'logo', type: 'ReactNode', description: '左上のロゴ。トップページへのリンクにする' },
    { name: 'description', type: 'ReactNode', description: 'ロゴの下の、会社やサービスの短い説明' },
    { name: 'children', type: 'ReactNode', description: 'リンクのまとまり（FooterColumn）' },
    { name: 'copyright', type: 'ReactNode', description: '下の段の左に置く著作権表示' },
    { name: 'legalLinks', type: 'ReactNode', description: '下の段の右に置く、規約やポリシーへのリンク（FooterLink）' },
    { name: 'navLabel', type: 'string', defaultValue: "'フッターメニュー'", description: 'リンクのまとまりを囲むナビゲーションの読み上げ名' },
    { name: '...rest', type: "ComponentPropsWithRef<'footer'>", description: 'その他の footer 要素の属性（className など）' },
  ],
  subcomponents: [
    {
      name: 'FooterColumn',
      props: [
        { name: 'title', type: 'ReactNode', required: true, description: 'まとまりの見出し。リストの名前としても読み上げる' },
        { name: 'children', type: 'ReactNode', required: true, description: 'リンク（FooterLink）' },
      ],
    },
    {
      name: 'FooterLink',
      props: [
        { name: 'children', type: 'ReactNode', required: true, description: 'リンクの文字' },
        { name: 'href', type: 'string', required: true, description: 'リンク先' },
        { name: '...rest', type: "ComponentPropsWithRef<'a'>", description: 'その他の a 要素の属性（onClick など）' },
      ],
    },
  ],
})
