import { useId, useRef, useState } from 'react'
import { useScrollable } from '@/shared/lib/useScrollable'
import {
  initialPlaygroundValues,
  type CatalogPlayground,
  type PlaygroundControl,
  type PlaygroundValues,
} from '../../../domain/playground'
import styles from './Playground.module.css'

/** 選択肢がこの数以下ならボタン型（ラジオ）、それより多ければセレクトボックスで表示する */
const MAX_SEGMENTED_OPTIONS = 6

type PlaygroundProps = {
  playground: CatalogPlayground
}

/** props を切り替えながら、部品の見た目と状態を確かめる欄 */
export function Playground({ playground }: PlaygroundProps) {
  const [values, setValues] = useState(() => initialPlaygroundValues(playground))
  const change = (name: string, value: string | boolean) => setValues((current) => ({ ...current, [name]: value }))
  const code = playground.code?.(values)
  const hasControls = playground.controls.length > 0
  // コード例が横にスクロールするときだけ、キーボードでもスクロールできるよう Tab キーで移れるようにする
  const codeRef = useRef<HTMLPreElement>(null)
  const codeScrollable = useScrollable(codeRef)

  return (
    <div className={styles.container}>
      <div
        className={styles.playground}
        data-has-controls={hasControls || undefined}
        data-wide={playground.wide || undefined}
      >
        <div className={styles.stage} role="region" aria-label="プレビュー">
          {playground.render(values)}
        </div>
        {/* 切り替え項目がない部品は、切り替え欄を出さずにプレビューを広げる */}
        {hasControls && (
          <form className={styles.controls} aria-label="表示の切り替え" onSubmit={(e) => e.preventDefault()}>
            {playground.controls.map((control) => (
              <ControlRow key={control.name} control={control} values={values} onChange={change} />
            ))}
          </form>
        )}
        {code !== undefined && (
          <pre ref={codeRef} className={styles.code} aria-label="コード例" tabIndex={codeScrollable ? 0 : undefined}>
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  )
}

type ControlRowProps = {
  control: PlaygroundControl
  values: PlaygroundValues
  onChange: (name: string, value: string | boolean) => void
}

/** 1項目 = 1行（左に項目名、右に切り替え） */
function ControlRow({ control, values, onChange }: ControlRowProps) {
  const id = useId()
  const labelId = `${id}-label`
  const value = values[control.name]

  if (control.type === 'boolean') {
    return (
      <div className={styles.row}>
        <label htmlFor={id} className={styles.rowLabel}>
          {control.name}
        </label>
        <input
          id={id}
          type="checkbox"
          className={styles.checkbox}
          checked={value === true}
          onChange={(e) => onChange(control.name, e.target.checked)}
        />
      </div>
    )
  }

  if (control.type === 'text' || control.options.length > MAX_SEGMENTED_OPTIONS) {
    return (
      <div className={styles.row}>
        <label htmlFor={id} className={styles.rowLabel}>
          {control.name}
        </label>
        {control.type === 'text' ? (
          <input
            id={id}
            type="text"
            className={styles.input}
            value={String(value)}
            onChange={(e) => onChange(control.name, e.target.value)}
          />
        ) : (
          <select id={id} className={styles.input} value={String(value)} onChange={(e) => onChange(control.name, e.target.value)}>
            {control.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      </div>
    )
  }

  return (
    <div className={styles.row}>
      <span id={labelId} className={styles.rowLabel}>
        {control.name}
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className={styles.segmented}>
        {control.options.map((option) => (
          <label key={option} className={styles.segment}>
            <input
              type="radio"
              name={id}
              value={option}
              checked={value === option}
              onChange={() => onChange(control.name, option)}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  )
}
