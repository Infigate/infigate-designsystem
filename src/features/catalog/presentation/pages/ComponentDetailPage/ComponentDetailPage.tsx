import { Link, useParams } from 'react-router'
import { DocHeader, DocPage, DocSection } from '@/shared/ui/DocPage/DocPage'
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
      <DocPage>
        <title>見つかりません | Infigate Design System</title>
        <DocHeader
          title="コンポーネントが見つかりません"
          description={`「${slug}」というコンポーネントは登録されていません。`}
        />
        <p>
          <Link to={catalogPaths.list()}>コンポーネント一覧に戻る</Link>
        </p>
      </DocPage>
    )
  }

  return (
    <DocPage>
      <title>{`${entry.name} | Infigate Design System`}</title>

      <DocHeader eyebrow={getCategory(entry.category).label} title={entry.name} description={entry.description} />

      {entry.playground && (
        <DocSection id="playground-heading" title="Playground">
          {/* 部品を切り替えたら値を初期化するため、slug を key にする */}
          <Playground key={entry.slug} playground={entry.playground} />
        </DocSection>
      )}

      <DocSection id="variants-heading" title="Examples">
        <div className={styles.variants}>
          {entry.variants.map((variant) => (
            <VariantPreview key={variant.name} variant={variant} />
          ))}
        </div>
      </DocSection>

      <DocSection id="props-heading" title="Props">
        <PropsTable props={entry.props} />
      </DocSection>
    </DocPage>
  )
}
