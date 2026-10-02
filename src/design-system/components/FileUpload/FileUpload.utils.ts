const UNITS = ['B', 'KB', 'MB', 'GB'] as const

/** バイト数を「2.4 MB」のような表示にする（1024 で繰り上げ、KB 以上は小数1桁） */
export function formatFileSize(bytes: number): string {
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024
    unit += 1
  }
  return unit === 0 ? `${value} ${UNITS[unit]}` : `${value.toFixed(1)} ${UNITS[unit]}`
}
