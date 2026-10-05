import { useContext, useEffect, useId, useRef, useState, type ComponentPropsWithRef, type MouseEvent, type ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import { Icon } from '../Icon'
import type { HeaderTheme } from './Header.constants'
import { HeaderMenuContext } from './Header.context'
import { HeaderNavList } from './Header.parts'
import styles from './Header.module.css'

export type HeaderProps = Omit<ComponentPropsWithRef<'header'>, 'children'> & {
  /** 下地の色（Figma: Theme） */
  theme?: HeaderTheme
  /** 左端のロゴ。トップページへのリンクにする */
  logo: ReactNode
  /** ナビゲーション項目（HeaderNavItem） */
  children?: ReactNode
  /** 右端の操作（Button を2つまで。主ボタンを右に置く） */
  actions?: ReactNode
  /** ナビゲーションの読み上げ名 */
  navLabel?: string
  /** モバイルでメニューを開くボタンの読み上げ名 */
  menuLabel?: string
  /** モバイルのメニューを開いた状態で表示する */
  defaultMenuOpen?: boolean
}

/**
 * サイト共通のヘッダー（Figma: header）。
 * 幅 1024px 以上ではナビと操作を右に並べ、それより狭いとメニューボタンにまとめてヘッダーの下に開く。
 * 幅はヘッダー自身の幅で判定する（画面の幅いっぱいに置けば画面幅と同じ）。
 */
export function Header({
  theme = 'light',
  logo,
  children,
  actions,
  navLabel = 'メインメニュー',
  menuLabel = 'メニュー',
  defaultMenuOpen = false,
  className,
  ...rest
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(defaultMenuOpen)
  const barRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  // 開いている間は、Esc とヘッダーの外を押したときに閉じる
  useEffect(() => {
    if (!menuOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (!barRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [menuOpen])

  return (
    <header {...rest} className={cx(styles.header, className)} data-theme={theme}>
      <div ref={barRef} className={styles.bar}>
        <div className={styles.logo}>{logo}</div>
        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-label={menuLabel}
          aria-expanded={menuOpen}
          aria-controls={panelId}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name={menuOpen ? 'x' : 'menu'} size={24} />
        </button>
        <div id={panelId} className={styles.panel} data-open={menuOpen || undefined}>
          <div className={styles.panelInner}>
            {children && (
              <nav aria-label={navLabel}>
                <HeaderMenuContext.Provider value={{ closeMenu: () => setMenuOpen(false) }}>
                  <HeaderNavList>{children}</HeaderNavList>
                </HeaderMenuContext.Provider>
              </nav>
            )}
            {actions && (
              // 操作を押したら（画面の切り替えやダイアログを開くなど）、モバイルのメニューは閉じる
              <div
                className={styles.actions}
                onClick={(event) => {
                  if ((event.target as Element).closest('a, button')) setMenuOpen(false)
                }}
              >
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export type HeaderNavItemProps = ComponentPropsWithRef<'a'> & {
  /** 今いるページ（Figma: State=Current）。下線と文字の濃さで示し、読み上げでも伝える */
  current?: boolean
}

/** ヘッダーのナビゲーション項目（Figma: nav-item）。押すとモバイルのメニューは閉じる */
export function HeaderNavItem({ current = false, className, onClick, ...rest }: HeaderNavItemProps) {
  const menu = useContext(HeaderMenuContext)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    menu?.closeMenu()
  }

  return (
    <li className={styles.navItem}>
      <a
        {...rest}
        className={cx(styles.link, className)}
        aria-current={current ? 'page' : undefined}
        onClick={handleClick}
      />
    </li>
  )
}
