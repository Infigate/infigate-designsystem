type ClassValue = string | false | null | undefined

/** 真値のクラス名だけを半角スペースで連結する */
export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
