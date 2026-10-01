import { Link } from 'react-router'
import type { CatalogEntry } from '../../../domain/catalogEntry'
import { catalogPaths } from '../../paths'
import styles from './ComponentCard.module.css'

type ComponentCardProps = {
  entry: CatalogEntry
}

/** 一覧用のカード。先頭バリエーションをサムネイルとして表示する */
export function ComponentCard({ entry }: ComponentCardProps) {
  // render は hooks を使えるよう、関数呼び出しではなくコンポーネントとして描画する
  const Thumbnail = entry.variants[0].render

  return (
    <article className={styles.card}>
      {/* サムネイル内のボタン等にフォーカスが移らないよう inert にする */}
      <div className={styles.thumbnail} inert>
        <Thumbnail />
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>
          {/* ::after でカード全体をクリック可能にする（stretched link） */}
          <Link to={catalogPaths.detail(entry.slug)} className={styles.link}>
            {entry.name}
          </Link>
        </h3>
        <p className={styles.description}>{entry.description}</p>
        <p className={styles.meta}>{entry.variants.length} バリエーション</p>
      </div>
    </article>
  )
}
