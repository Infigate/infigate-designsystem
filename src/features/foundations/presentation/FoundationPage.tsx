import { useParams } from 'react-router'
import { DocHeader, DocPage } from '@/shared/ui/DocPage/DocPage'
import { findFoundationPage } from './foundationPages'

/** 基本デザインの1ページ（共通の見出し ＋ ページごとの中身） */
export function FoundationPage() {
  const { slug = '' } = useParams()
  const page = findFoundationPage(slug)

  if (!page) {
    return (
      <DocPage>
        <title>見つかりません | Infigate Design System</title>
        <DocHeader title="ページが見つかりません" description={`「${slug}」という基本デザインのページはありません。`} />
      </DocPage>
    )
  }

  return (
    <DocPage>
      <title>{`${page.title} | Infigate Design System`}</title>
      <DocHeader eyebrow="基本デザイン" title={page.title} description={page.description} />
      <page.Content />
    </DocPage>
  )
}
