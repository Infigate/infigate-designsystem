import { useCallback, useEffect, useMemo, useRef, useState, type FocusEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Toast } from './Toast'
import { TOAST_DEFAULT_DURATION } from './Toast.constants'
import { ToastContext, type ShowToastOptions, type ToastApi } from './Toast.context'
import styles from './Toast.module.css'

/** 消えるときの動きの長さ（--ds-duration-normal と同じ） */
const LEAVE_DURATION = 200

type ToastEntry = ShowToastOptions & { id: string; leaving: boolean }

export type ToastProviderProps = {
  children: ReactNode
  /** 同時に出せる数。超えた分は古いものから消す */
  max?: number
  /** トーストを並べる場所の読み上げ名 */
  label?: string
}

/**
 * トーストを画面の右下に出す。アプリの外側に1つだけ置き、内側から useToast で呼び出す。
 * 出したトーストは読み上げの切れ目で伝える（aria-live="polite"）。
 */
export function ToastProvider({ children, max = 3, label = '通知' }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastEntry[]>([])
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const nextId = useRef(0)

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)))
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (options: ShowToastOptions) => {
      nextId.current += 1
      const id = `toast-${nextId.current}`
      setToasts((current) => [...current, { ...options, id, leaving: false }].slice(-max))
      return id
    },
    [max],
  )

  const api = useMemo<ToastApi>(() => ({ showToast, dismissToast }), [showToast, dismissToast])

  const handleBlur = (event: FocusEvent<HTMLOListElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setFocused(false)
    }
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <ol
          className={styles.list}
          aria-label={label}
          aria-live="polite"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
        >
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              paused={hovered || focused}
              onDismiss={dismissToast}
              onRemove={removeToast}
            />
          ))}
        </ol>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

type ToastItemProps = {
  toast: ToastEntry
  paused: boolean
  onDismiss: (id: string) => void
  onRemove: (id: string) => void
}

function ToastItem({ toast, paused, onDismiss, onRemove }: ToastItemProps) {
  const { id, leaving, duration = TOAST_DEFAULT_DURATION, closable = true, ...props } = toast
  const itemRef = useRef<HTMLLIElement>(null)
  const remaining = useRef(duration)

  // 残り時間を数え、止めている間は減らさない
  useEffect(() => {
    if (leaving || paused) return
    const startedAt = Date.now()
    const timer = setTimeout(() => onDismiss(id), remaining.current)
    return () => {
      clearTimeout(timer)
      remaining.current -= Date.now() - startedAt
    }
  }, [id, leaving, paused, onDismiss])

  // 消える動きのあとで取り除く。中にあったフォーカスは外し、ほかのトーストの時間を止めたままにしない
  useEffect(() => {
    if (!leaving) return
    const timer = setTimeout(() => {
      const active = document.activeElement
      if (active instanceof HTMLElement && itemRef.current?.contains(active)) {
        active.blur()
      }
      onRemove(id)
    }, LEAVE_DURATION)
    return () => clearTimeout(timer)
  }, [id, leaving, onRemove])

  return (
    <li ref={itemRef} className={styles.item} data-leaving={leaving || undefined}>
      <Toast {...props} onClose={closable ? () => onDismiss(id) : undefined} />
    </li>
  )
}
