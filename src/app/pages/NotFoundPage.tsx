import { Link } from 'react-router'
import { catalogPaths } from '@/features/catalog'

export function NotFoundPage() {
  return (
    <div>
      <title>ページが見つかりません | Infigate Design System</title>
      <h1>ページが見つかりません</h1>
      <p>
        <Link to={catalogPaths.list()}>コンポーネント一覧に戻る</Link>
      </p>
    </div>
  )
}
