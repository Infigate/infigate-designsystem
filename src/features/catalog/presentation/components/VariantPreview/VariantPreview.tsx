import { useId } from 'react'
import type { CatalogVariant } from '../../../domain/catalogEntry'
import styles from './VariantPreview.module.css'

type VariantPreviewProps = {
  variant: CatalogVariant
}

/** バリエーション1件の見出し・説明・実物プレビュー */
export function VariantPreview({ variant }: VariantPreviewProps) {
  const headingId = useId()
  // render は hooks を使えるよう、関数呼び出しではなくコンポーネントとして描画する
  const Preview = variant.render

  return (
    <section aria-labelledby={headingId} className={styles.section}>
      <h3 id={headingId} className={styles.title}>
        {variant.name}
      </h3>
      {variant.description && <p className={styles.description}>{variant.description}</p>}
      <div className={styles.canvas}>
        <Preview />
      </div>
    </section>
  )
}
