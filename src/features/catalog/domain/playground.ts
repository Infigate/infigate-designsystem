import type { ReactNode } from 'react'

/**
 * Playground: 詳細ページで props を切り替えながら、部品の見た目と状態を確かめる欄。
 * 各部品の *.catalog.tsx で definePlayground() を使って定義する。
 */

/** 選択肢から1つ選ぶ */
export type SelectControl = {
  readonly type: 'select'
  readonly name: string
  readonly options: readonly string[]
  readonly defaultValue: string
}

/** オン・オフを切り替える */
export type BooleanControl = {
  readonly type: 'boolean'
  readonly name: string
  readonly defaultValue: boolean
}

/** 文字を入力する */
export type TextControl = {
  readonly type: 'text'
  readonly name: string
  readonly defaultValue: string
}

export type PlaygroundControl = SelectControl | BooleanControl | TextControl

export type PlaygroundValues = Readonly<Record<string, string | boolean>>

export type CatalogPlayground = {
  readonly controls: readonly PlaygroundControl[]
  /** 現在の値で部品を描画する */
  readonly render: (values: PlaygroundValues) => ReactNode
  /** 現在の値に対応するコード例（省略可） */
  readonly code?: (values: PlaygroundValues) => string
}

type ControlValue<C> = C extends { type: 'boolean' }
  ? boolean
  : C extends { type: 'select'; options: readonly (infer O)[] }
    ? O
    : string

/** 切り替え項目の定義から、render・code が受け取る値の型を作る */
export type PlaygroundValuesOf<Cs extends readonly PlaygroundControl[]> = {
  readonly [C in Cs[number] as C['name']]: ControlValue<C>
}

/**
 * Playground を定義する。render・code の引数は切り替え項目の定義から型が付く。
 * 例: select の options が ['sm', 'md'] なら、値の型は 'sm' | 'md' になる。
 */
export function definePlayground<const Cs extends readonly PlaygroundControl[]>(playground: {
  controls: Cs
  render: (values: PlaygroundValuesOf<Cs>) => ReactNode
  code?: (values: PlaygroundValuesOf<Cs>) => string
}): CatalogPlayground {
  // 値の型は定義時に検査済み。保存するときは汎用の型に揃える
  return playground as unknown as CatalogPlayground
}

/** 各項目の初期値 */
export function initialPlaygroundValues(playground: CatalogPlayground): PlaygroundValues {
  return Object.fromEntries(playground.controls.map((control) => [control.name, control.defaultValue]))
}

/** ドメインルールに違反している箇所を列挙する（違反がなければ空配列） */
export function validatePlayground(playground: CatalogPlayground): string[] {
  const problems: string[] = []
  const seen = new Set<string>()

  if (playground.controls.length === 0) problems.push('playground の controls を1件以上定義してください')

  for (const control of playground.controls) {
    if (control.name.trim() === '') problems.push('playground の control 名が空です')
    if (seen.has(control.name)) problems.push(`playground の control 名「${control.name}」が重複しています`)
    seen.add(control.name)

    if (control.type === 'select') {
      if (control.options.length === 0) {
        problems.push(`playground の「${control.name}」に options がありません`)
      } else if (!control.options.includes(control.defaultValue)) {
        problems.push(`playground の「${control.name}」の初期値「${control.defaultValue}」が options にありません`)
      }
    }
  }

  return problems
}
