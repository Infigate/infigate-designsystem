import { Link, useParams } from 'react-router'
import { getCategory } from '../../../domain/category'
import { useCatalogRepository } from '../../catalogContext'
import { Playground } from '../../components/Playground/Playground'
import { PropsTable } from '../../components/PropsTable/PropsTable'
import { VariantPreview } from '../../components/VariantPreview/VariantPreview'
import { catalogPaths } from '../../paths'
import styles from './ComponentDetailPage.module.css'

/** コンポーネント詳細ページ（Playground・Examples（バリエーション一覧）・Props 表） */
export function ComponentDetailPage() {
  const { slug = '' } = useParams()
  const entry = useCatalogRepository().findBySlug(slug)

  if (!entry) {
    return (
      <div className={styles.page}>
        <title>見つかりません | Infigate Design System</title>
        <h1 className={styles.title}>コンポーネントが見つかりません</h1>
        <p>「{slug}」というコンポーネントは登録されていません。</p>
        <p>
          <Link to={catalogPaths.list()}>コンポーネント一覧に戻る</Link>
        </p>
      </div>
    )
  }

  return (
    <article className={styles.page}>
      <title>{`${entry.name} | Infigate Design System`}</title>

      <header className={styles.header}>
        <p className={styles.category}>{getCategory(entry.category).label}</p>
        <h1 className={styles.title}>{entry.name}</h1>
        <p className={styles.description}>{entry.description}</p>
      </header>

      {entry.playground && (
        <section aria-labelledby="playground-heading" className={styles.section}>
          <h2 id="playground-heading" className={styles.sectionTitle}>
            Playground
          </h2>
          {/* 部品を切り替えたら値を初期化するため、slug を key にする */}
          <Playground key={entry.slug} playground={entry.playground} />
        </section>
      )}

      <section aria-labelledby="variants-heading" className={styles.section}>
        <h2 id="variants-heading" className={styles.sectionTitle}>
          Examples
        </h2>
        <div className={styles.variants}>
          {entry.variants.map((variant) => (
            <VariantPreview key={variant.name} variant={variant} />
          ))}
        </div>
      </section>

      <section aria-labelledby="props-heading" className={styles.section}>
        <h2 id="props-heading" className={styles.sectionTitle}>
          Props
        </h2>
        <PropsTable props={entry.props} />
      </section>
    </article>
  )
}
