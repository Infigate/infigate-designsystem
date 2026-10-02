/** from 番目の要素を取り出し、残りの並びの to 番目に差し込んだ新しい配列を返す（元の配列は変えない） */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = [...items]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}
