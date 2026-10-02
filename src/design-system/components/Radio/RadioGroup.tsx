import { useId, useMemo } from 'react'
import { ChoiceGroup, type ChoiceGroupProps } from '../ChoiceGroup/ChoiceGroup'
import { RadioGroupContext, type RadioGroupContextValue } from './Radio.context'

export type RadioGroupProps = Omit<ChoiceGroupProps, 'onChange' | 'defaultValue'> & {
  /** グループ内で共通の name。省略すると自動で付く */
  name?: string
  /** 選ばれている値（制御するとき）。onValueChange と組み合わせて使う */
  value?: string
  /** 最初に選んでおく値（制御しないとき） */
  defaultValue?: string
  /** 選択が変わったときに、選ばれた値で呼ぶ */
  onValueChange?: (value: string) => void
}

/**
 * ラジオボタンのグループ。選択肢から1つだけ選ぶ。
 * 見出し・印・補足文・エラー文をグループ全体に付け、中のラジオボタンの name と選択状態をまとめて扱う。
 * 選択は取り消せないので、「選ばない」が必要なときは「指定なし」の選択肢を用意する。
 */
export function RadioGroup({ name, value, defaultValue, onValueChange, mark, error, ...rest }: RadioGroupProps) {
  const generatedName = useId()

  const context = useMemo<RadioGroupContextValue>(
    () => ({ name: name ?? generatedName, value, defaultValue, onValueChange }),
    [name, generatedName, value, defaultValue, onValueChange],
  )

  return (
    <RadioGroupContext value={context}>
      <ChoiceGroup
        {...rest}
        mark={mark}
        error={error}
        // fieldset に radiogroup の役割を与え、必須・エラーも伝える
        role="radiogroup"
        aria-required={mark === 'required' || undefined}
        aria-invalid={error ? true : undefined}
      />
    </RadioGroupContext>
  )
}
