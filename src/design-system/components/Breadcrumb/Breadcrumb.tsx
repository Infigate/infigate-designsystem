import { Children, useContext, type ComponentPropsWithRef, type ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import { Icon } from '../Icon'
import { BreadcrumbItemContext } from './Breadcrumb.context'
import styles from './Breadcrumb.module.css'

export type BreadcrumbProps = Omit<ComponentPropsWithRef<'nav'>, 'children'> & {
  /** 項目（BreadcrumbItem）。起点（ホーム）から順に並べ、最後の項目が今いるページになる */
  children: ReactNode
  /** 表示する項目の最大数。超えると、起点と最後の2つを残して中間を「…」で省略する */
  maxItems?: number
  /** ナビゲーションの読み上げ名 */
  label?: string
}

/** 省略したときに、末尾から残す項目の数（現在地とその親） */
const ITEMS_AFTER_COLLAPSE = 2

/**
 * 現在地を示すパンくず（Figma: breadcrumb）。
 * 最後の項目は今いるページなので押せない文字にし、読み上げでも今いるページだと伝える。
 */
export function Breadcrumb({ children, maxItems = 5, label = 'パンくずリスト', className, ...rest }: BreadcrumbProps) {
  const items = Children.toArray(children)
  const lastIndex = items.length - 1
  const collapsed = items.length > maxItems
  const visible = collapsed
    ? [
        { item: items[0], index: 0 },
        { item: null, index: -1 },
        ...items.slice(-ITEMS_AFTER_COLLAPSE).map((item, i) => ({ item, index: lastIndex - ITEMS_AFTER_COLLAPSE + 1 + i })),
      ]
    : items.map((item, index) => ({ item, index }))

  return (
    <nav {...rest} className={cx(styles.breadcrumb, className)} aria-label={label}>
      <ol className={styles.list}>
        {visible.map(({ item, index }, position) => (
          <li key={index} className={styles.entry}>
            {position > 0 && <Icon name="chevron-right" size={24} className={styles.separator} />}
            {item === null ? (
              <span className={styles.ellipsis}>…</span>
            ) : (
              <BreadcrumbItemContext.Provider value={{ current: index === lastIndex }}>{item}</BreadcrumbItemContext.Provider>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export type BreadcrumbItemProps = ComponentPropsWithRef<'a'>

/**
 * パンくずの1項目（Figma: breadcrumb-item）。祖先はリンク色で、ホバーで下線を出す。
 * 最後の項目（今いるページ）は href を付けても押せない文字にする。
 */
export function BreadcrumbItem({ className, href, children, ...rest }: BreadcrumbItemProps) {
  const { current } = useContext(BreadcrumbItemContext)

  if (current) {
    return (
      <span className={cx(styles.item, className)} aria-current="page">
        {children}
      </span>
    )
  }

  return (
    <a {...rest} href={href} className={cx(styles.item, styles.link, className)}>
      {children}
    </a>
  )
}
