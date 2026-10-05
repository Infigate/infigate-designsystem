import { useEffect, useId, useRef, type ComponentPropsWithRef, type ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import type { ModalSize, ModalVariant } from './Modal.constants'
import { ModalContent } from './Modal.parts'
import styles from './Modal.module.css'

export type ModalProps = Omit<ComponentPropsWithRef<'dialog'>, 'title' | 'open' | 'onClose'> & {
  /** 開いているか */
  open: boolean
  /** 閉じるボタン・Esc で閉じようとしたとき。open を false にして閉じる */
  onClose: () => void
  /** 種類（Figma: Type）。confirm は取り消せない操作の確認 */
  variant?: ModalVariant
  /** 幅（Figma: Size）。sm 400px / md 560px / lg 720px。スマートフォンでは左右 16px を残して幅いっぱい */
  size?: ModalSize
  /** 見出し */
  title: ReactNode
  /** 見出しの左のアイコン（Figma: Show icon）。standard は info、confirm は警告 */
  icon?: boolean
  /** 本文。長いときは見出しとボタンを残して本文だけがスクロールする */
  children?: ReactNode
  /** 下のボタン（Button）。副ボタン・主ボタンの順に並べると、主ボタンが右（スマートフォンでは上）になる */
  actions?: ReactNode
  /** 閉じるボタンの読み上げ名 */
  closeLabel?: string
}

/**
 * モーダルダイアログ（Figma: modal）。画面の中央に重ね、後ろの画面は暗くして操作できなくする。
 * 開いている間はフォーカスを中に閉じ込め、閉じると開く前の場所に戻す（ブラウザの dialog 要素の働き）。
 * 入力の途中で消えないよう、背景を押しても閉じない。
 */
export function Modal({
  open,
  onClose,
  variant = 'standard',
  size = 'sm',
  title,
  icon = true,
  children,
  actions,
  closeLabel = '閉じる',
  className,
  ...rest
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const bodyId = useId()

  // open に合わせて開閉する。開いている間は後ろの画面をスクロールさせない
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !open) return
    dialog.showModal()
    const { overflow } = document.documentElement.style
    document.documentElement.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.documentElement.style.overflow = overflow
    }
  }, [open])

  return (
    <dialog
      {...rest}
      ref={dialogRef}
      role={variant === 'confirm' ? 'alertdialog' : undefined}
      className={cx(styles.modal, className)}
      data-size={size}
      aria-labelledby={titleId}
      aria-describedby={children ? bodyId : undefined}
      onCancel={(event) => {
        // Esc で閉じるかどうかは利用側（open）に任せる
        event.preventDefault()
        onClose()
      }}
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
    </dialog>
  )
}
