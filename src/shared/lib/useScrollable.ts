import { useEffect, useState, type RefObject } from 'react'

/**
 * 要素の中身がはみ出して、スクロールできる状態かどうかを返す（大きさや中身が変わるたびに測り直す）。
 * スクロールする枠は、中に押せるものがないとキーボードで移れずスクロールできないので、
 * スクロールできるときだけ tabIndex={0} を付けて Tab キーで移れるようにするのに使う。
 */
export function useScrollable(ref: RefObject<HTMLElement | null>, axis: 'x' | 'y' = 'x'): boolean {
  const [scrollable, setScrollable] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof ResizeObserver === 'undefined') return

    const measure = () =>
      setScrollable(
        axis === 'x' ? element.scrollWidth > element.clientWidth + 1 : element.scrollHeight > element.clientHeight + 1,
      )
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    for (const child of Array.from(element.children)) observer.observe(child)
    return () => observer.disconnect()
  }, [ref, axis])

  return scrollable
}
