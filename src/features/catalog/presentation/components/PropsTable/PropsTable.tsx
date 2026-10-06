import { ScrollRegion } from '@/shared/ui/ScrollRegion/ScrollRegion'
import type { PropDoc } from '../../../domain/catalogEntry'
import styles from './PropsTable.module.css'

type PropsTableProps = {
  props: readonly PropDoc[]
  /** 表の名前（例: 「Button の Props」）。横スクロールできるときの枠の読み上げ名にも使う */
  label: string
}

export function PropsTable({ props, label }: PropsTableProps) {
  if (props.length === 0) {
    return <p className={styles.empty}>Props の定義はありません。</p>
  }

  return (
    <ScrollRegion label={label} className={styles.wrapper}>
      <table className={styles.table} aria-label={label}>
        <thead>
          <tr>
            <th scope="col">名前</th>
            <th scope="col">型</th>
            <th scope="col">既定値</th>
            <th scope="col">説明</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name}>
              <th scope="row">
                <code>{prop.name}</code>
                {prop.required && <span className={styles.required}>必須</span>}
              </th>
              <td>
                <code className={styles.type}>{prop.type}</code>
              </td>
              <td>{prop.defaultValue ? <code>{prop.defaultValue}</code> : '—'}</td>
              <td>{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollRegion>
  )
}
