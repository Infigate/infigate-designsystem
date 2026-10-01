import styles from '../pages/FoundationPages.module.css'

/** トークン名（CSS 変数名）を等幅で表示する */
export function TokenName({ name, className }: { name: string; className?: string }) {
  return <code className={className ? `${styles.tokenName} ${className}` : styles.tokenName}>{name}</code>
}
