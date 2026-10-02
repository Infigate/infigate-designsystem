import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import styles from './Sortable.module.css'
import { SortableList, SortablePlaceholder, SortableRow } from './Sortable.parts'
import { moveItem } from './Sortable.utils'

export type SortableItem = {
  /** 並べ替えても変わらない、行ごとに一意の値 */
  id: string
  /** 行の文字。ハンドルの読み上げ名と、並べ替えのお知らせにも使う */
  label: string
}

export type SortableProps<T extends SortableItem> = Omit<ComponentPropsWithoutRef<'ul'>, 'children'> & {
  /** 並べる項目（この順に表示する） */
  items: readonly T[]
  /** 並べ替えたときに、新しい順の項目で呼ばれる */
  onReorder: (items: T[]) => void
}

/** ポインターをこれだけ動かしたら持ち上げる（px）。ハンドルを押しただけでは持ち上げない */
const DRAG_THRESHOLD = 4

/** すき間を開けたときに、まわりの行をずらす時間（ms）。--ds-duration-fast と同じ */
const SHIFT_DURATION = 120

type DragState =
  /** ポインターで動かしている。to は、並べ替えたあとの位置（すき間を開ける位置） */
  | {
      mode: 'pointer'
      id: string
      from: number
      to: number
      /** 動かしている行の上端（リストの上端から） */
      top: number
      rowHeight: number
      listHeight: number
      /** 持ち上げる前の、各行の中心（リストの上端から）。すき間を開ける位置の計算に使う */
      slotCenters: number[]
    }
  /** キーボードで持ち上げている。to は、並べ替えたあとの位置 */
  | { mode: 'keyboard'; id: string; from: number; to: number }

type PointerStart = { id: string; index: number; startY: number; grabOffset: number }

/**
 * ドラッグで並べ替えるリスト。項目の順番をユーザーが決めるときに使う。
 * つかめるのは左端のハンドルだけ。ドラッグ中は、まわりの行がずれて差し込む位置にすき間が開く。キーボードでは、ハンドルで Space（Enter）を押して持ち上げ、
 * 上下の矢印キーで動かし、Space（Enter）で確定、Esc で取り消す。動きは読み上げでも知らせる。
 * 並びは持たないので、onReorder で受け取った並びを items に渡し直す。
 */
export function Sortable<T extends SortableItem>({ items, onReorder, ...rest }: SortableProps<T>) {
  const [drag, setDrag] = useState<DragState | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const listRef = useRef<HTMLUListElement>(null)
  const rowRefs = useRef(new Map<string, HTMLLIElement>())
  const handleRefs = useRef(new Map<string, HTMLButtonElement>())
  const pointerStart = useRef<PointerStart | null>(null)
  const focusAfterDrop = useRef<string | null>(null)
  const rowOffsets = useRef(new Map<string, number>())
  const instructionsId = useId()

  // 並べ替えると行の要素が動き、ハンドルのフォーカスが外れることがあるので戻す
  useLayoutEffect(() => {
    if (!focusAfterDrop.current) return
    handleRefs.current.get(focusAfterDrop.current)?.focus()
    focusAfterDrop.current = null
  })

  // すき間の位置が変わったら、まわりの行を前の位置から滑らせる（位置の差を打ち消してから戻す）
  useLayoutEffect(() => {
    const shifting = drag?.mode === 'pointer' && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    for (const [id, row] of rowRefs.current) {
      if (row.hasAttribute('data-floating')) continue
      const previous = rowOffsets.current.get(id)
      const current = row.offsetTop
      if (shifting && previous !== undefined && previous !== current) {
        row.animate?.([{ transform: `translateY(${previous - current}px)` }, { transform: 'none' }], {
          duration: SHIFT_DURATION,
          easing: 'ease-out',
        })
      }
      rowOffsets.current.set(id, current)
    }
  })

  const position = (index: number) => `${items.length}件中${index + 1}番目`

  function drop(state: DragState) {
    const item = items[state.from]
    if (state.from !== state.to) {
      onReorder(moveItem(items, state.from, state.to))
      setAnnouncement(`${item.label}を${position(state.to)}に移動しました。`)
    } else {
      setAnnouncement(`${item.label}は${position(state.from)}のままです。`)
    }
    if (handleRefs.current.get(item.id) === document.activeElement) focusAfterDrop.current = item.id
    setDrag(null)
  }

  function cancel(state: DragState) {
    setAnnouncement(`並べ替えを取り消しました。${items[state.from].label}は${position(state.from)}のままです。`)
    setDrag(null)
  }

  // ---- キーボード ----
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, item: T, index: number) {
    if (drag?.mode === 'pointer') return
    const lifted = drag?.mode === 'keyboard' && drag.id === item.id ? drag : null

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (lifted) {
        drop(lifted)
      } else {
        setDrag({ mode: 'keyboard', id: item.id, from: index, to: index })
        setAnnouncement(
          `${item.label}を持ち上げました。${position(index)}です。上下の矢印キーで動かし、Space キーで確定、Esc キーで取り消します。`,
        )
      }
      return
    }
    if (!lifted) return

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      const to = Math.min(Math.max(lifted.to + (event.key === 'ArrowUp' ? -1 : 1), 0), items.length - 1)
      if (to === lifted.to) return
      setDrag({ ...lifted, to })
      setAnnouncement(position(to))
    } else if (event.key === 'Escape') {
      event.preventDefault()
      cancel(lifted)
    }
  }

  // ---- ポインター（マウス・タッチ・ペン） ----
  function handlePointerDown(event: PointerEvent<HTMLButtonElement>, item: T, index: number) {
    if (drag || event.button !== 0) return
    // ハンドルの外へ動かしても、離すまでこのハンドルでイベントを受け取る
    event.currentTarget.setPointerCapture?.(event.pointerId)
    pointerStart.current = { id: item.id, index, startY: event.clientY, grabOffset: 0 }
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const start = pointerStart.current
    const list = listRef.current
    const row = start && rowRefs.current.get(start.id)
    if (!start || !list || !row) return
    const listRect = list.getBoundingClientRect()

    if (!drag) {
      if (Math.abs(event.clientY - start.startY) < DRAG_THRESHOLD) return
      const rowRect = row.getBoundingClientRect()
      start.grabOffset = start.startY - rowRect.top
      setDrag({
        mode: 'pointer',
        id: start.id,
        from: start.index,
        to: start.index,
        top: rowRect.top - listRect.top,
        rowHeight: rowRect.height,
        listHeight: listRect.height,
        slotCenters: items.map((item) => {
          const rect = rowRefs.current.get(item.id)?.getBoundingClientRect()
          return rect ? rect.top - listRect.top + rect.height / 2 : 0
        }),
      })
      return
    }
    if (drag.mode !== 'pointer') return

    const top = Math.min(Math.max(event.clientY - start.grabOffset - listRect.top, 0), drag.listHeight - drag.rowHeight)
    const center = top + drag.rowHeight / 2
    // すき間は、動かしている行の中心にいちばん近い、もとの行の位置に開ける（すき間が動いても位置の計算がぶれない）
    setDrag({ ...drag, top, to: nearestIndex(drag.slotCenters, center) })
  }

  function handlePointerUp() {
    pointerStart.current = null
    if (drag?.mode === 'pointer') drop(drag)
  }

  function handlePointerCancel() {
    pointerStart.current = null
    if (drag?.mode === 'pointer') cancel(drag)
  }

  // ---- 表示 ----
  // キーボードでは、持ち上げた行をその場で動かして見せる（要素の順は変えず、CSS の order で並べる。フォーカスが外れないように）
  const keyboardOrder = drag?.mode === 'keyboard' ? moveItem(items, drag.from, drag.to) : null
  // ポインターでは、動かしている行がリストの上に浮き、残りの行のあいだの差し込む位置にすき間を開ける
  const slot = drag?.mode === 'pointer' ? drag : null
  const others = slot ? items.filter((item) => item.id !== slot.id) : []

  return (
    <>
      <SortableList
        {...rest}
        ref={listRef}
        data-dragging={drag ? drag.mode : undefined}
      >
        {items.map((item, index) => {
          const dragged = drag?.id === item.id ? drag : null
          return (
            <SortableRow
              key={item.id}
              ref={(element) => {
                if (element) rowRefs.current.set(item.id, element)
                else rowRefs.current.delete(item.id)
              }}
              label={item.label}
              lifted={dragged !== null}
              floating={dragged?.mode === 'pointer'}
              style={
                dragged?.mode === 'pointer'
                  ? { top: dragged.top }
                  : keyboardOrder
                    ? { order: keyboardOrder.indexOf(item) }
                    : slot
                      ? // すき間の分だけ、後ろの行を1つずらす（要素の順は変えず、CSS の order で並べる）
                        { order: others.indexOf(item) + (others.indexOf(item) < slot.to ? 0 : 1) }
                      : undefined
              }
              handleProps={{
                ref: (element) => {
                  if (element) handleRefs.current.set(item.id, element)
                  else handleRefs.current.delete(item.id)
                },
                'aria-describedby': instructionsId,
                'aria-pressed': dragged?.mode === 'keyboard',
                onKeyDown: (event) => handleKeyDown(event, item, index),
                onBlur: () => {
                  if (dragged?.mode === 'keyboard') cancel(dragged)
                },
                onPointerDown: (event) => handlePointerDown(event, item, index),
                onPointerMove: handlePointerMove,
                onPointerUp: handlePointerUp,
                onPointerCancel: handlePointerCancel,
              }}
            />
          )
        })}
        {slot && <SortablePlaceholder style={{ order: slot.to, height: slot.rowHeight }} />}
      </SortableList>
      <p id={instructionsId} hidden>
        Space キーで持ち上げ、上下の矢印キーで動かし、Space キーで確定します。Esc キーで取り消します。
      </p>
      <div className={styles.announcement} aria-live="assertive" aria-atomic="true">
        {announcement}
      </div>
    </>
  )
}

/** values のうち、target にいちばん近い値の位置 */
function nearestIndex(values: readonly number[], target: number): number {
  return values.reduce(
    (nearest, value, index) => (Math.abs(value - target) < Math.abs(values[nearest] - target) ? index : nearest),
    0,
  )
}
