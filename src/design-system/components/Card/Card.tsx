import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import type { CardVariant } from './Card.constants'
import styles from './Card.module.css'

export type CardProps = Omit<ComponentPropsWithRef<'article'>, 'title'> & {
  /** 見た目（Figma: Style）。outline は枠線、elevated は影 */
  variant?: CardVariant
  /** 見出し */
  title: ReactNode
  /** 見出しの段階（h2〜h6）。ページの見出しの流れに合わせる */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  /** 指定すると、カード全体がこのリンクになる（Hover・Focus が付く） */
  href?: string
  /** リンク（a 要素）に渡すその他の属性（target・onClick など） */
  linkProps?: Omit<ComponentPropsWithRef<'a'>, 'href' | 'children'>
  /** 上の画像（Figma: Show media）。img 要素を渡すと、枠いっぱいに切り抜いて表示する */
  media?: ReactNode
  /** 見出しの上の小さな情報（Figma: Show badge）。Badge など */
  meta?: ReactNode
  /** 本文（Figma: Show description）。2行を超える分は「…」で省略する */
  description?: ReactNode
  /** 下のボタン（Figma: Show action）。Button の size="sm" を2つまで。カードのリンクとは別に押せる */
  actions?: ReactNode
  /** 押せない状態にする。リンクを外し、文字と背景を薄くする（中の Button には disabled を付ける） */
  disabled?: boolean
}

/**
 * 画像・見出し・本文などをまとめて見せるカード（Figma: card）。
 * href を指定するとカード全体がリンクになる。中のボタンはリンクの上に重ねて置き、別に押せるようにしている
 * （リンクの中にボタンを入れることはできないため、見出しのリンクの押せる範囲をカード全体に広げている）。
 */
export function Card({
  variant = 'outline',
  title,
  headingLevel = 3,
  href,
  linkProps,
  media,
  meta,
  description,
  actions,
  disabled = false,
  className,
  ...rest
}: CardProps) {
  const Heading = `h${headingLevel}` as const
  const interactive = Boolean(href) && !disabled

  return (
    <article
      {...rest}
      className={cx(styles.card, className)}
      data-variant={variant}
      data-interactive={interactive || undefined}
      data-disabled={disabled || undefined}
      aria-disabled={disabled || undefined}
    >
      {media && <div className={styles.media}>{media}</div>}
      <div className={styles.body}>
        {meta && <div className={styles.meta}>{meta}</div>}
        <div className={styles.texts}>
          <Heading className={styles.title}>
            {interactive ? (
              <a {...linkProps} href={href} className={cx(styles.link, linkProps?.className)}>
                {title}
              </a>
            ) : (
              title
            )}
          </Heading>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </article>
  )
}
