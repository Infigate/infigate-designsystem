import { useId, type ComponentPropsWithRef, type ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import type { FooterTheme } from './Footer.constants'
import styles from './Footer.module.css'

export type FooterProps = Omit<ComponentPropsWithRef<'footer'>, 'children'> & {
  /** 下地の色（Figma: Theme）。ヘッダーとそろえる */
  theme?: FooterTheme
  /** 左上のロゴ。トップページへのリンクにする */
  logo?: ReactNode
  /** ロゴの下の、会社やサービスの短い説明 */
  description?: ReactNode
  /** リンクのまとまり（FooterColumn） */
  children?: ReactNode
  /** リンクのまとまりを囲むナビゲーションの読み上げ名 */
  navLabel?: string
  /** 下の段の左に置く著作権表示 */
  copyright?: ReactNode
  /** 下の段の右に置く、規約やポリシーへのリンク（FooterLink） */
  legalLinks?: ReactNode
}

/**
 * サイト共通のフッター（Figma: footer）。ずっとそこにあるものなので影は付けない。
 * 幅 1024px 以上はロゴと説明を左、リンクのまとまりを右に並べ、それより狭いと縦に積む。
 * 幅はフッター自身の幅で判定する（画面の幅いっぱいに置けば画面幅と同じ）。
 */
export function Footer({
  theme = 'light',
  logo,
  description,
  children,
  navLabel = 'フッターメニュー',
  copyright,
  legalLinks,
  className,
  ...rest
}: FooterProps) {
  const hasBrand = Boolean(logo || description)
  const hasMain = hasBrand || Boolean(children)
  const hasBottom = Boolean(copyright || legalLinks)

  return (
    <footer {...rest} className={cx(styles.footer, className)} data-theme={theme}>
      <div className={styles.inner}>
        {hasMain && (
          <div className={styles.main}>
            {hasBrand && (
              <div className={styles.brand}>
                {logo && <div className={styles.logo}>{logo}</div>}
                {description && <p className={styles.description}>{description}</p>}
              </div>
            )}
            {children && (
              <nav className={styles.columns} aria-label={navLabel}>
                {children}
              </nav>
            )}
          </div>
        )}
        {hasBottom && (
          <div className={styles.bottom}>
            {copyright && <p className={styles.copyright}>{copyright}</p>}
            {legalLinks && <ul className={styles.legal}>{legalLinks}</ul>}
          </div>
        )}
      </div>
    </footer>
  )
}

export type FooterColumnProps = Omit<ComponentPropsWithRef<'div'>, 'title'> & {
  /** まとまりの見出し */
  title: ReactNode
  /** リンク（FooterLink） */
  children: ReactNode
}

/** 見出しつきのリンクのまとまり（Figma: column）。見出しはリストの名前として読み上げる */
export function FooterColumn({ title, children, className, ...rest }: FooterColumnProps) {
  const titleId = useId()

  return (
    <div {...rest} className={cx(styles.column, className)}>
      <p id={titleId} className={styles.columnTitle}>
        {title}
      </p>
      <ul className={styles.columnList} aria-labelledby={titleId}>
        {children}
      </ul>
    </div>
  )
}

export type FooterLinkProps = ComponentPropsWithRef<'a'>

/** フッターのリンク。FooterColumn の中と、Footer の legalLinks に並べる */
export function FooterLink({ className, ...rest }: FooterLinkProps) {
  return (
    <li className={styles.item}>
      <a {...rest} className={cx(styles.link, className)} />
    </li>
  )
}
