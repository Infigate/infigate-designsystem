import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import { Icon, type IconName } from '../Icon'
import { getPaginationRange, type PaginationVariant } from './Pagination.constants'
import { PaginationButton } from './Pagination.parts'
import styles from './Pagination.module.css'

export type PaginationProps = Omit<ComponentPropsWithRef<'nav'>, 'onChange'> & {
  /** 今見ているページ（1から数える） */
  page: number
  /** 総ページ数 */
  totalPages: number
  /** ページを選んだとき */
  onPageChange?: (page: number) => void
  /** 指定すると、各ページへのリンク（a 要素）にする。URL でページを表す一覧に使う */
  getPageHref?: (page: number) => string
  /** 見た目（Figma: Type）。compact は前後のボタンと「3 / 20」だけのスマートフォン向け */
  variant?: PaginationVariant
  /** 読み込み中などで、すべてのボタンを押せなくする */
  disabled?: boolean
  /** ナビゲーションの読み上げ名 */
  label?: string
}

/**
 * ページ送り（Figma: pagination）。
 * 総ページ数が7以下なら番号を全部並べ（標準）、それより多いと両端と現在地の前後だけにして、最初・最後のボタンを足す（省略あり）。
 * 最初・最後のページにいるときは、その向きのボタンを押せなくする。
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  getPageHref,
  variant = 'default',
  disabled = false,
  label = 'ページ送り',
  className,
  ...rest
}: PaginationProps) {
  const isFirst = page <= 1
  const isLast = page >= totalPages
  const collapsed = totalPages > 7

  const control = (target: number, options: { label?: string; current?: boolean; inactive?: boolean; children: ReactNode }) => (
    <PageControl
      page={target}
      href={getPageHref?.(target)}
      current={options.current}
      disabled={disabled || options.inactive}
      label={options.label}
      onSelect={options.current ? undefined : () => onPageChange?.(target)}
    >
      {options.children}
    </PageControl>
  )

  const nav = (target: number, icon: IconName, navLabel: string, inactive: boolean, key: string) => (
    <li key={key}>
      {control(target, { label: navLabel, inactive, children: <Icon name={icon} size={24} /> })}
    </li>
  )

  return (
    <nav {...rest} className={cx(styles.pagination, className)} aria-label={label}>
      <ul className={styles.list} data-variant={variant}>
        {variant === 'default' && collapsed && nav(1, 'chevrons-left', '最初のページ', isFirst, 'first')}
        {nav(page - 1, 'chevron-left', '前のページ', isFirst, 'prev')}
        {variant === 'compact' ? (
          <li className={styles.status}>
            <span aria-hidden>{`${page} / ${totalPages}`}</span>
            <span className={styles.visuallyHidden}>{`${totalPages}ページ中 ${page}ページ目`}</span>
          </li>
        ) : (
          getPaginationRange(page, totalPages).map((item) =>
            typeof item === 'number' ? (
              <li key={item}>
                {control(item, { label: `${item}ページ目`, current: item === page, children: item })}
              </li>
            ) : (
              <li key={item} className={styles.ellipsis} aria-hidden>
                …
              </li>
            ),
          )
        )}
        {nav(page + 1, 'chevron-right', '次のページ', isLast, 'next')}
        {variant === 'default' && collapsed && nav(totalPages, 'chevrons-right', '最後のページ', isLast, 'last')}
      </ul>
    </nav>
  )
}

type PageControlProps = {
  page: number
  href?: string
  current?: boolean
  disabled?: boolean
  label?: string
  onSelect?: () => void
  children: ReactNode
}

/** 1つのボタン。getPageHref があればリンク、なければボタンにする */
function PageControl({ page, href, current = false, disabled = false, label, onSelect, children }: PageControlProps) {
  if (href === undefined) {
    return (
      <PaginationButton current={current} disabled={disabled} aria-label={label} data-page={page} onClick={onSelect}>
        {children}
      </PaginationButton>
    )
  }

  // 押せないリンクは href を外してフォーカスが当たらないようにし、リンクであることは role で残す
  return (
    <a
      className={styles.control}
      href={disabled ? undefined : href}
      role={disabled ? 'link' : undefined}
      aria-current={current ? 'page' : undefined}
      aria-disabled={disabled || undefined}
      aria-label={label}
      data-page={page}
      onClick={(event) => {
        if (disabled) return event.preventDefault()
        onSelect?.()
      }}
    >
      {children}
    </a>
  )
}
