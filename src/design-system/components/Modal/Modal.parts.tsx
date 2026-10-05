import { useEffect, useId, useRef, useState, type ComponentPropsWithRef, type ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import { Icon } from '../Icon'
import type { ModalSize, ModalVariant } from './Modal.constants'
import styles from './Modal.module.css'

export type ModalContentProps = {
  variant: ModalVariant
  title: ReactNode
  icon: boolean
  children?: ReactNode
  actions?: ReactNode
  closeLabel: string
  onClose?: () => void
  titleId: string
  bodyId: string
}

/** 見出し・本文・ボタンの3段（Figma: header・body・footer） */
export function ModalContent({
  variant,
  title,
  icon,
  children,
  actions,
  closeLabel,
  onClose,
  titleId,
  bodyId,
}: ModalContentProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [scrollable, setScrollable] = useState(false)

  // 本文がスクロールするときだけ、スクロールする範囲の上下に境界線を出す
  useEffect(() => {
    const body = bodyRef.current
    if (!body || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => setScrollable(body.scrollHeight > body.clientHeight))
    observer.observe(body)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div className={styles.header}>
        {icon && (
          <Icon
            name={variant === 'confirm' ? 'triangle-alert' : 'info'}
            variant="filled"
            size={24}
            className={styles.icon}
            data-tone={variant}
          />
        )}
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <ModalCloseButton aria-label={closeLabel} onClick={onClose} />
      </div>
      {children && (
        <div ref={bodyRef} id={bodyId} className={styles.body} data-scrollable={scrollable || undefined}>
          {children}
        </div>
      )}
      {actions && <div className={styles.actions}>{actions}</div>}
    </>
  )
}

/** 閉じるボタン（Figma: modal-close。32×32）。見出しの右端に置く */
export function ModalCloseButton({ className, ...rest }: ComponentPropsWithRef<'button'>) {
  return (
    <button type="button" {...rest} className={cx(styles.close, className)}>
      <Icon name="x" size={24} />
    </button>
  )
}

export type ModalPanelProps = Omit<ComponentPropsWithRef<'div'>, 'title'> & {
  variant?: ModalVariant
  size?: ModalSize
  title: ReactNode
  icon?: boolean
  actions?: ReactNode
  closeLabel?: string
  onClose?: () => void
  /** mobile にすると、画面の幅によらずスマートフォンの見た目にする */
  layout?: 'mobile'
}

/**
 * 開閉せずにその場に置くモーダルの見た目。カタログで種類や幅を並べて見せるために使う。
 * 画面に重ねて出すときは Modal を使う。
 */
export function ModalPanel({
  variant = 'standard',
  size = 'sm',
  title,
  icon = true,
  children,
  actions,
  closeLabel = '閉じる',
  onClose,
  layout,
  className,
  ...rest
}: ModalPanelProps) {
  const titleId = useId()
  const bodyId = useId()

  return (
    <div
      {...rest}
      role="group"
      aria-labelledby={titleId}
      className={cx(styles.modal, styles.panel, className)}
      data-size={size}
      data-layout={layout}
    >
      <ModalContent
        variant={variant}
        title={title}
        icon={icon}
        actions={actions}
        closeLabel={closeLabel}
        onClose={onClose}
        titleId={titleId}
        bodyId={bodyId}
      >
        {children}
      </ModalContent>
    </div>
  )
}
