// Fast Refresh を効かせるため、コンポーネント以外の export は Select.tsx から分離している
import { TEXT_INPUT_SIZES } from '../TextInput/TextInput.constants'

/** 大きさ（Figma: Size）。入力欄と同じ箱なので、TextInput と同じ3段階にそろえる */
export const SELECT_SIZES = TEXT_INPUT_SIZES

export type SelectSize = (typeof SELECT_SIZES)[number]
