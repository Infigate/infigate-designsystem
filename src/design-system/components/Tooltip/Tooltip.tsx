import {
  cloneElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react'
import { createPortal } from 'react-dom'
import type { TooltipPlacement } from './Tooltip.constants'
import styles from './Tooltip.module.css'
import { TooltipBubble } from './Tooltip.parts'

/** 対象と吹き出しのすき間（矢印のはみ出し約 7px ＋ 4px） */
const OFFSET = 11
/** 吹き出しを画面の端から離す距離 */
const VIEWPORT_MARGIN = 8
/** ポインターを乗せてから出すまでの時間（ms）。通り過ぎただけで出ないようにする */
const SHOW_DELAY = 300
/** ポインターが離れてから消すまでの時間（ms）。吹き出しの上へポインターを移せるようにする */
const HIDE_DELAY = 100

const OPPOSITE = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const

/** Tooltip が、対象（trigger）に付け足す属性 */
type TriggerProps = {
  ref?: Ref<HTMLElement>
  'aria-describedby'?: string
  onMouseEnter?: (event: MouseEvent<HTMLElement>) => void
  onMouseLeave?: (event: MouseEvent<HTMLElement>) => void
  onFocus?: (event: FocusEvent<HTMLElement>) => void
  onBlur?: (event: FocusEvent<HTMLElement>) => void
}

export type TooltipProps = {
  /** 補足の説明。短い文にし、操作に必要な情報は入れない（マウスを使わない人には見えにくいため） */
  content: ReactNode
  /** 説明を付ける対象（ボタンなど、フォーカスできるもの） */
  children: ReactElement<TriggerProps>
  /** 対象のどちら側に出すか。入りきらなければ反対側に出す */
  placement?: TooltipPlacement
}

type Position = { top: number; left: number; placement: TooltipPlacement; arrowOffset: number }

/**
 * マウスを乗せたときやフォーカスしたときに出る、短い補足の説明（Figma: tooltip）。
 * 吹き出しの上にポインターを移しても消えず、Esc で消せる。読み上げでは対象の補足説明として伝わる。
 * 画面のいちばん手前に重ねて出すので、横にスクロールする表の中でも切れない。
 */
export function Tooltip({ content, children, placement = 'top' }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const tooltipId = useId()

  const show = (delay: number) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(true), delay)
  }
  const hide = (delay: number) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setOpen(false)
      setPosition(null)
    }, delay)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  // 対象の指定した側に出す。入りきらなければ反対側に出し、画面の端からはみ出さないよう横（縦）にずらす
  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const anchor = triggerRef.current?.getBoundingClientRect()
      const bubble = bubbleRef.current
      if (!anchor || !bubble) return
      const { clientWidth, clientHeight } = document.documentElement
      const { offsetWidth: width, offsetHeight: height } = bubble
      const fits = {
        top: anchor.top - OFFSET - height >= VIEWPORT_MARGIN,
        bottom: anchor.bottom + OFFSET + height <= clientHeight - VIEWPORT_MARGIN,
        left: anchor.left - OFFSET - width >= VIEWPORT_MARGIN,
        right: anchor.right + OFFSET + width <= clientWidth - VIEWPORT_MARGIN,
      }
      const side = fits[placement] || !fits[OPPOSITE[placement]] ? placement : OPPOSITE[placement]
      const clamp = (value: number, size: number, limit: number) =>
        Math.min(Math.max(value, VIEWPORT_MARGIN), limit - size - VIEWPORT_MARGIN)

      if (side === 'top' || side === 'bottom') {
        const center = anchor.left + anchor.width / 2
        const left = clamp(center - width / 2, width, clientWidth)
        setPosition({
          placement: side,
          top: side === 'top' ? anchor.top - OFFSET - height : anchor.bottom + OFFSET,
          left,
          arrowOffset: center - left,
        })
      } else {
        const center = anchor.top + anchor.height / 2
        const top = clamp(center - height / 2, height, clientHeight)
        setPosition({
          placement: side,
          top,
          left: side === 'left' ? anchor.left - OFFSET - width : anchor.right + OFFSET,
          arrowOffset: center - top,
        })
      }
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, placement])

  // Esc で消す（ポインターやフォーカスを動かさなくても消せるようにする）
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide(0)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  // 対象にもともと付いていた ref と処理も、そのまま呼ぶ
  const triggerOwnRef = children.props.ref
  const { onMouseEnter, onMouseLeave, onFocus, onBlur } = children.props
  const describedBy = [children.props['aria-describedby'], tooltipId].filter(Boolean).join(' ')

  return (
    <>
      <TriggerSlot
        element={children}
        ref={(element: HTMLElement | null) => {
          triggerRef.current = element
          return assignRef(triggerOwnRef, element)
        }}
        aria-describedby={describedBy}
        onMouseEnter={(event) => {
          onMouseEnter?.(event)
          show(SHOW_DELAY)
        }}
        onMouseLeave={(event) => {
          onMouseLeave?.(event)
          hide(HIDE_DELAY)
        }}
        onFocus={(event) => {
          onFocus?.(event)
          show(0)
        }}
        onBlur={(event) => {
          onBlur?.(event)
          hide(0)
        }}
      />
      {/* 閉じているあいだも置いておき、読み上げの補足説明として使えるようにする */}
      {createPortal(
        <TooltipBubble
          ref={bubbleRef}
          id={tooltipId}
          role="tooltip"
          placement={position?.placement ?? placement}
          arrowOffset={position?.arrowOffset}
          className={styles.floating}
          hidden={!open}
          data-positioned={position ? '' : undefined}
          style={position ? { top: position.top, left: position.left } : undefined}
          onMouseEnter={() => clearTimeout(timer.current)}
          onMouseLeave={() => hide(HIDE_DELAY)}
        >
          {content}
        </TooltipBubble>,
        document.body,
      )}
    </>
  )
}

/** 対象（trigger）に、Tooltip が用意した属性を付けて描く */
function TriggerSlot({ element, ...props }: TriggerProps & { element: ReactElement<TriggerProps> }) {
  return cloneElement(element, props)
}

/** 受け取った ref（関数・オブジェクトのどちらでも）に要素を渡す。関数の ref が返した片付けの関数はそのまま返す */
function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') return ref(value)
  if (ref) ref.current = value
}
