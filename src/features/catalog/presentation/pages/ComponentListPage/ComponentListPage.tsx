import { useId, useMemo, useState } from 'react'
import { groupEntriesByCategory } from '../../../application/groupEntriesByCategory'
import { searchEntries } from '../../../application/searchEntries'
import { useCatalogRepository } from '../../catalogContext'
import { ComponentCard } from '../../components/ComponentCard/ComponentCard'
import styles from './ComponentListPage.module.css'

/** コンポーネント（パーツ）一覧ページ */
export function ComponentListPage() {
  const entries = useCatalogRepository().findAll()
  const [query, setQuery] = useState('')
  const searchId = useId()

  const groups = useMemo(() => groupEntriesByCategory(searchEntries(entries, query)), [entries, query])

  return (
    <div className={styles.page}>
      <title>コンポーネント一覧 | Infigate Design System</title>

      <header className={styles.header}>
        <h1 className={styles.title}>コンポーネント</h1>
        <p className={styles.lead}>デザインシステムに登録されている UI パーツの一覧です（{entries.length} 件）。</p>
      </header>

      <div className={styles.search}>
        <label htmlFor={searchId} className={styles.searchLabel}>
          キーワードで絞り込む
        </label>
        <input
          id={searchId}
          type="search"
          className={styles.searchInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例: Button, 入力"
        />
      </div>

      {groups.length === 0 ? (
        <p role="status" className={styles.empty}>
          「{query}」に一致するコンポーネントはありません。
        </p>
      ) : (
        groups.map(({ category, entries: groupEntries }) => {
          const headingId = `category-${category.id}`
          return (
            <section key={category.id} aria-labelledby={headingId} className={styles.group}>
              <h2 id={headingId} className={styles.groupTitle}>
                {category.label}
              </h2>
              <ul className={styles.grid}>
                {groupEntries.map((entry) => (
                  <li key={entry.slug}>
                    <ComponentCard entry={entry} />
                  </li>
                ))}
              </ul>
            </section>
          )
        })
      )}
    </div>
  )
}
