import {
  cloneElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react'
import { createPortal } from 'react-dom'
import type { MenuAlign } from './Menu.constants'
import { MenuContext } from './Menu.context'
import { MenuPanel } from './Menu.parts'

/** メニューとボタンのすき間（Figma: 4px） */
const OFFSET = 4
/** メニューを画面の端から離す距離 */
const VIEWPORT_MARGIN = 8

/** Menu が、開くボタン（trigger）に付け足す属性 */
type TriggerProps = {
  id?: string
  ref?: Ref<HTMLElement>
  onClick?: (event: MouseEvent<HTMLElement>) => void
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void
  'aria-haspopup'?: 'menu'
  'aria-expanded'?: boolean
  'aria-controls'?: string
}

export type MenuProps = {
  /** メニューを開くボタン（IconButton・Button など）。押すと開き、開閉の状態が読み上げでも伝わる */
  trigger: ReactElement<TriggerProps>
  /** MenuItem・MenuSeparator */
  children: ReactNode
  /** ボタンに対する横の位置。end は右端、start は左端をそろえる */
  align?: MenuAlign
  /** メニュー本体（Figma: menu）に付くクラス名 */
  className?: string
}

/**
 * ボタンを押すと開くメニュー（ドロップダウンメニュー）。行やカードごとの操作を「…」ボタンにまとめるときなどに使う。
 * メニューは画面のいちばん手前に重ねて開くので、横にスクロールする表の中でも切れない。
 * キーボードでは ↑↓・Home・End で項目を移り、Enter で選び、Esc で閉じる（WAI-ARIA のメニューボタンの作り）。
 */
export function Menu({ trigger, children, align = 'end', className }: MenuProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  // 開いたときに、最初の項目と最後の項目のどちらにフォーカスを置くか
  const initialFocus = useRef<'first' | 'last' | null>(null)
  const generatedTriggerId = useId()
  const menuId = useId()
  const triggerId = trigger.props.id ?? generatedTriggerId

  /** 選べる項目（選べない項目は矢印キーで飛ばす） */
  const items = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])') ?? [])

  const openMenu = (focus: 'first' | 'last') => {
    initialFocus.current = focus
    setOpen(true)
  }

  const close = (returnFocus: boolean) => {
    setOpen(false)
    setPosition(null)
    if (returnFocus) triggerRef.current?.focus()
  }

  // ボタンの下に、端をそろえて置く。下に入りきらなければ上に開き、画面の外にははみ出さない
  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const anchor = triggerRef.current?.getBoundingClientRect()
      const menu = menuRef.current
      if (!anchor || !menu) return
      const { clientWidth, clientHeight } = document.documentElement
      const { offsetWidth: width, offsetHeight: height } = menu
      const left = align === 'end' ? anchor.right - width : anchor.left
      const below = anchor.bottom + OFFSET
      const above = anchor.top - OFFSET - height
      setPosition({
        top: below + height > clientHeight - VIEWPORT_MARGIN && above >= VIEWPORT_MARGIN ? above : below,
        left: Math.min(Math.max(left, VIEWPORT_MARGIN), clientWidth - width - VIEWPORT_MARGIN),
      })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, align])

  // 位置が決まったら、最初（または最後）の項目にフォーカスを移す
  useEffect(() => {
    if (!open || !position || !initialFocus.current) return
    const list = items()
    ;(initialFocus.current === 'last' ? list.at(-1) : list[0])?.focus()
    initialFocus.current = null
  }, [open, position])

  // メニューの外を押したら閉じる（フォーカスは押した先に任せる）
  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      close(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const list = items()
    const index = list.indexOf(document.activeElement as HTMLElement)
    const focusAt = (next: number) => list[(next + list.length) % list.length]?.focus()

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        focusAt(index + 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        focusAt(index - 1)
        break
      case 'Home':
        event.preventDefault()
        focusAt(0)
        break
      case 'End':
        event.preventDefault()
        focusAt(list.length - 1)
        break
      case 'Escape':
        event.preventDefault()
        close(true)
        break
      case 'Tab':
        // ボタンにフォーカスを戻してから既定の Tab を進め、ボタンの次（前）の要素へ移す
        close(true)
        break
    }
  }

  // ボタンにもともと付いていた ref にも、要素を渡す
  const triggerOwnRef = trigger.props.ref
  const { onClick: triggerOnClick, onKeyDown: triggerOnKeyDown } = trigger.props

  return (
    <>
      <TriggerSlot
        element={trigger}
        id={triggerId}
        ref={(element: HTMLElement | null) => {
          triggerRef.current = element
          return assignRef(triggerOwnRef, element)
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(event) => {
          triggerOnClick?.(event)
          if (event.defaultPrevented) return
          if (open) close(false)
          else openMenu('first')
        }}
        onKeyDown={(event) => {
          triggerOnKeyDown?.(event)
          if (event.defaultPrevented) return
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            openMenu(event.key === 'ArrowUp' ? 'last' : 'first')
          }
        }}
      />
      {open &&
        createPortal(
          <MenuContext value={{ close: () => close(true) }}>
            <MenuPanel
              ref={menuRef}
              id={menuId}
              aria-labelledby={triggerId}
              className={className}
              data-floating=""
              data-positioned={position ? '' : undefined}
              style={position ?? undefined}
              onKeyDown={handleMenuKeyDown}
            >
              {children}
            </MenuPanel>
          </MenuContext>,
          document.body,
        )}
    </>
  )
}

/** 開くボタン（trigger）に、Menu が用意した属性を付けて描く */
function TriggerSlot({ element, ...props }: TriggerProps & { element: ReactElement<TriggerProps> }) {
  return cloneElement(element, props)
}

/** 受け取った ref（関数・オブジェクトのどちらでも）に要素を渡す。関数の ref が返した片付けの関数はそのまま返す */
function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') return ref(value)
  if (ref) ref.current = value
}
