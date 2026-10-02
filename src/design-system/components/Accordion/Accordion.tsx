import { useId, useState, type ComponentPropsWithRef, type ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import { Icon } from '../Icon'
import styles from './Accordion.module.css'

/** 項目を区切り線でつなげたまとまり（Figma: accordion）。先頭に線を1本引き、各項目は下に線を持つ */
export function Accordion({ className, ...rest }: ComponentPropsWithRef<'div'>) {
  return <div {...rest} className={cx(styles.accordion, className)} />
}

export type AccordionItemProps = Omit<ComponentPropsWithRef<'div'>, 'title'> & {
  /** 見出し。押すと本文が開閉する */
  title: ReactNode
  /** 本文 */
  children: ReactNode
  /** 最初から開いておく */
  defaultOpen?: boolean
  /** 開いているか。onOpenChange と組み合わせて、開閉を制御する */
  open?: boolean
  /** 開閉したときに、開いたかどうかで呼ばれる */
  onOpenChange?: (open: boolean) => void
  /** 開閉できない状態にする（開いていれば開いたまま） */
  disabled?: boolean
  /** 見出しの階層（h2〜h6）。ページの見出しの並びに合わせる */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}

/**
 * 開閉する項目1つ分（Figma: accordion-item）。Accordion の中に置く。
 * 見出し行全体が押せるボタンで、開いているときだけ本文を出し、右端のシェブロンを反転する。
 */
export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  disabled = false,
  headingLevel = 3,
  className,
  ...rest
}: AccordionItemProps) {
  const [openState, setOpenState] = useState(defaultOpen)
  const open = openProp ?? openState
  const buttonId = useId()
  const panelId = useId()
  const Heading = `h${headingLevel}` as const

  const toggle = () => {
    if (openProp === undefined) setOpenState(!open)
    onOpenChange?.(!open)
  }

  return (
    <div {...rest} className={cx(styles.item, className)} data-open={open || undefined}>
      <Heading className={styles.heading}>
        <button
          type="button"
          id={buttonId}
          className={styles.header}
          aria-expanded={open}
          aria-controls={panelId}
          disabled={disabled}
          onClick={toggle}
        >
          <span className={styles.title}>{title}</span>
          <Icon name="chevron-down" size={24} className={styles.chevron} />
        </button>
      </Heading>
      {/* 高さを伸び縮みさせて開閉する。閉じている本文は inert にして、読み上げと Tab 移動の対象から外す */}
      <div className={styles.collapse}>
        <div id={panelId} role="region" aria-labelledby={buttonId} className={styles.panel} inert={!open}>
          <div className={styles.body}>{children}</div>
        </div>
      </div>
    </div>
  )
}
