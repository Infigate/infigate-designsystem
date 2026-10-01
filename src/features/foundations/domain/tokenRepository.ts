import type { DesignToken, ScreenModeId } from './designToken'

/**
 * デザイントークンの取得口。
 * 実装（どこから読むか）は infrastructure 層が持ち、presentation 層はこの型にだけ依存する。
 */
export type TokenRepository = {
  /** 全トークンを、定義されている順（ファイル内の順）で返す */
  findAll(): readonly DesignToken[]
  /** 名前が prefix で始まるトークンを、定義されている順で返す */
  findByPrefix(prefix: string): readonly DesignToken[]
  get(name: string): DesignToken | undefined
  /** 参照をたどった最終的な値（例: --color-text-primary → #21272f） */
  resolve(name: string, mode?: ScreenModeId): string
}
