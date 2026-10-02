import { createContext, useContext } from 'react'

/** RadioGroup が、中のラジオボタンへ渡す情報 */
export type RadioGroupContextValue = {
  /** グループ内で共通の name（同じ name のラジオボタンは1つしか選べない） */
  name: string
  /** 選ばれている値（RadioGroup に value を渡して制御するとき） */
  value?: string
  /** 最初に選んでおく値（制御しないとき） */
  defaultValue?: string
  /** 選んだときに呼ぶ */
  onValueChange?: (value: string) => void
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

export const useRadioGroup = () => useContext(RadioGroupContext)
