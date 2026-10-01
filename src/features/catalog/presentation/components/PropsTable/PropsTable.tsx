import type { PropDoc } from '../../../domain/catalogEntry'
import styles from './PropsTable.module.css'

type PropsTableProps = {
  props: readonly PropDoc[]
}

export function PropsTable({ props }: PropsTableProps) {
  if (props.length === 0) {
    return <p className={styles.empty}>Props の定義はありません。</p>
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
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
    </div>
  )
}
