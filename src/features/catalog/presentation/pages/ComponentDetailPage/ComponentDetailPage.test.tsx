import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createTestEntry } from '../../../testing/fixtures'
import { renderCatalogRoutes } from '../../../testing/renderWithCatalog'

const button = createTestEntry({
  name: 'Button',
  category: 'actions',
  description: '操作を実行するためのボタン',
  variants: [
    { name: 'Primary', description: '主要な操作に使う', render: () => <button type="button">主要</button> },
    { name: 'Secondary', render: () => <button type="button">副次</button> },
  ],
  props: [
    { name: 'variant', type: "'primary' | 'secondary'", defaultValue: "'primary'", description: '見た目の種類' },
    { name: 'children', type: 'ReactNode', required: true, description: 'ラベル' },
  ],
})

describe('ComponentDetailPage', () => {
  it('名前・カテゴリ・説明を表示する', () => {
    renderCatalogRoutes({ entries: [button], path: '/components/button' })

    expect(screen.getByRole('heading', { level: 1, name: 'Button' })).toBeInTheDocument()
    expect(screen.getByText('アクション')).toBeInTheDocument()
    expect(screen.getByText('操作を実行するためのボタン')).toBeInTheDocument()
  })

  it('各バリエーションを見出し・説明・実物プレビュー付きで表示する', () => {
    renderCatalogRoutes({ entries: [button], path: '/components/button' })

    const primary = screen.getByRole('region', { name: 'Primary' })
    expect(within(primary).getByText('主要な操作に使う')).toBeInTheDocument()
    expect(within(primary).getByRole('button', { name: '主要' })).toBeInTheDocument()

    const secondary = screen.getByRole('region', { name: 'Secondary' })
    expect(within(secondary).getByRole('button', { name: '副次' })).toBeInTheDocument()
  })

  it('Props 表を表示する', () => {
    renderCatalogRoutes({ entries: [button], path: '/components/button' })

    const table = screen.getByRole('table')
    const rows = within(table).getAllByRole('row').slice(1) // ヘッダー行を除く
    expect(rows).toHaveLength(2)
    expect(within(rows[0]).getAllByRole('cell').map((c) => c.textContent)).toEqual([
      "'primary' | 'secondary'",
      "'primary'",
      '見た目の種類',
    ])
    expect(within(rows[1]).getByRole('rowheader')).toHaveTextContent('children必須')
    expect(within(rows[1]).getAllByRole('cell')[1]).toHaveTextContent('—')
  })

  it('Props が未定義ならその旨を表示する', () => {
    renderCatalogRoutes({ entries: [createTestEntry({ name: 'Divider' })], path: '/components/divider' })

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByText('Props の定義はありません。')).toBeInTheDocument()
  })

  it('存在しない slug なら「見つかりません」を表示し、一覧へ戻れる', async () => {
    const user = userEvent.setup()
    const { router } = renderCatalogRoutes({ entries: [button], path: '/components/unknown' })

    expect(screen.getByRole('heading', { level: 1, name: 'コンポーネントが見つかりません' })).toBeInTheDocument()
    expect(screen.getByText('「unknown」というコンポーネントは登録されていません。')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'コンポーネント一覧に戻る' }))

    expect(router.state.location.pathname).toBe('/')
  })
})
