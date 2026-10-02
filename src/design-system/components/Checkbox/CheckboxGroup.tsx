import { ChoiceGroup, type ChoiceGroupProps } from '../ChoiceGroup/ChoiceGroup'

export type CheckboxGroupProps = ChoiceGroupProps

/**
 * チェックボックスのグループ。見出し・印・補足文・エラー文をグループ全体に付ける。
 * disabled を指定すると、中のチェックボックスがすべて操作できなくなる（fieldset の働き）。
 */
export function CheckboxGroup(props: CheckboxGroupProps) {
  return <ChoiceGroup {...props} />
}
