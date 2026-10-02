import type { ReactNode } from 'react'
import styles from './Table.module.css'

export type TableEmptyProps = {
  /** 表の列の数。表示を全部の列にまたがらせる */
  colSpan: number
  /** 見出しの文。絞り込みの結果が0件のときは、条件を変えられることが分かる文にする */
  title?: ReactNode
  /** 補足の文 */
  description?: ReactNode
  /** 次の行動のボタン（「条件をクリア」「新規作成」など）。次の行動があるときだけ置く */
  action?: ReactNode
}

/**
 * データが1件もないときの表示（Figma: table-empty）。TableBody の中に、行の代わりに置く。
 * 見出しの行は消さずに残す（何の表だったのか分からなくなるため）。
 */
export function TableEmpty({ colSpan, title = 'データがありません', description, action }: TableEmptyProps) {
  return (
    <tr className={styles.emptyRow}>
      <td colSpan={colSpan} className={styles.emptyCell}>
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{title}</p>
          {description && <p className={styles.emptyDescription}>{description}</p>}
          {action && <div className={styles.emptyAction}>{action}</div>}
        </div>
      </td>
    </tr>
  )
}
