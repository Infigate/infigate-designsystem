import type { ReactNode } from 'react'
import { isCategoryId, type CategoryId } from './category'
import { validatePlayground, type CatalogPlayground } from './playground'

/** コンポーネントの見本（バリエーション）1件 */
export type CatalogVariant = {
  name: string
  description?: string
  render: () => ReactNode
}

/** Props 表の1行 */
export type PropDoc = {
  name: string
  type: string
  defaultValue?: string
  required?: boolean
  description: string
}

/** カタログに掲載する1コンポーネント（エンティティ。slug が識別子） */
export type CatalogEntry = {
  readonly slug: string
  readonly name: string
  readonly category: CategoryId
  readonly description: string
  readonly variants: readonly CatalogVariant[]
  readonly props: readonly PropDoc[]
  /** props を切り替えて確かめる欄（省略可） */
  readonly playground?: CatalogPlayground
}

export type CatalogEntryInput = Omit<CatalogEntry, 'slug' | 'props'> & {
  props?: readonly PropDoc[]
}

export class InvalidCatalogEntryError extends Error {
  readonly problems: readonly string[]

  constructor(name: string, problems: readonly string[]) {
    super(`カタログ定義「${name}」が不正です:\n- ${problems.join('\n- ')}`)
    this.name = 'InvalidCatalogEntryError'
    this.problems = problems
  }
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * コンポーネント名から URL 用の slug を作る。
 * 例: "Button" → "button", "TextField" → "text-field", "IconButton2" → "icon-button2"
 */
export function toSlug(name: string): string {
  return name
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

/** ドメインルールに違反している箇所を列挙する（違反がなければ空配列） */
export function validateCatalogEntry(entry: CatalogEntryInput): string[] {
  const problems: string[] = []

  if (entry.name.trim() === '') {
    problems.push('name が空です')
  } else if (!SLUG_PATTERN.test(toSlug(entry.name))) {
    problems.push(`name「${entry.name}」から有効な slug を作れません（英数字で命名してください）`)
  }
  if (!isCategoryId(entry.category)) {
    problems.push(`category「${String(entry.category)}」は未定義です`)
  }
  if (entry.variants.length === 0) {
    problems.push('variants を1件以上定義してください')
  }
  for (const name of findDuplicates(entry.variants.map((v) => v.name))) {
    problems.push(`variant 名「${name}」が重複しています`)
  }
  for (const name of findDuplicates((entry.props ?? []).map((p) => p.name))) {
    problems.push(`prop 名「${name}」が重複しています`)
  }
  if (entry.playground) {
    problems.push(...validatePlayground(entry.playground))
  }

  return problems
}

/**
 * カタログ定義を作成する。各コンポーネントの *.catalog.tsx から default export すること。
 * @throws {InvalidCatalogEntryError} ドメインルールに違反している場合
 */
export function defineCatalogEntry(input: CatalogEntryInput): CatalogEntry {
  const problems = validateCatalogEntry(input)
  if (problems.length > 0) {
    throw new InvalidCatalogEntryError(input.name, problems)
  }
  return {
    ...input,
    slug: toSlug(input.name),
    props: input.props ?? [],
  }
}

/** 外部から読み込んだ値が CatalogEntry の形をしているか */
export function isCatalogEntry(value: unknown): value is CatalogEntry {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.slug === 'string' &&
    typeof v.name === 'string' &&
    isCategoryId(v.category) &&
    Array.isArray(v.variants) &&
    Array.isArray(v.props)
  )
}

function findDuplicates(values: readonly string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  }
  return [...duplicates]
}
