import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createTestEntry } from '../../../testing/fixtures'
import { renderCatalogRoutes } from '../../../testing/renderWithCatalog'

const button = createTestEntry({ name: 'Button', category: 'actions', description: '操作を実行する' })
const iconButton = createTestEntry({ name: 'IconButton', category: 'actions', description: 'アイコンだけのボタン' })
const textField = createTestEntry({ name: 'TextField', category: 'inputs', description: 'テキストを入力する' })
const entries = [textField, iconButton, button]

describe('ComponentListPage', () => {
  it('見出しと登録件数を表示する', () => {
    renderCatalogRoutes({ entries })

    expect(screen.getByRole('heading', { level: 1, name: 'コンポーネント' })).toBeInTheDocument()
    expect(screen.getByText(/3 件/)).toBeInTheDocument()
  })

  it('カテゴリ定義順にグループを並べ、グループ内は名前順にカードを並べる', () => {
    renderCatalogRoutes({ entries })

    const sections = screen.getAllByRole('region')
    expect(sections.map((s) => within(s).getByRole('heading', { level: 2 }).textContent)).toEqual([
      'アクション',
      '入力',
    ])
    expect(
      within(sections[0])
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(['Button', 'IconButton'])
  })

  it('カードに先頭バリエーションのプレビュー・説明・バリエーション数を表示する', () => {
    renderCatalogRoutes({ entries: [button] })

    const card = screen.getByRole('article')
    expect(within(card).getByText('Button のプレビュー')).toBeInTheDocument()
    expect(within(card).getByText('操作を実行する')).toBeInTheDocument()
    expect(within(card).getByText('1 バリエーション')).toBeInTheDocument()
  })

  it('キーワードで絞り込める', async () => {
    const user = userEvent.setup()
    renderCatalogRoutes({ entries })

    await user.type(screen.getByRole('searchbox', { name: 'キーワードで絞り込む' }), '入力')

    expect(screen.getByRole('link', { name: 'TextField' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Button' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'アクション' })).not.toBeInTheDocument()
  })

  it('一致するものがなければその旨を表示する', async () => {
    const user = userEvent.setup()
    renderCatalogRoutes({ entries })

    await user.type(screen.getByRole('searchbox'), 'Modal')

    expect(screen.getByRole('status')).toHaveTextContent('「Modal」に一致するコンポーネントはありません。')
  })

  it('カードのリンクから詳細ページへ遷移する', async () => {
    const user = userEvent.setup()
    const { router } = renderCatalogRoutes({ entries })

    await user.click(screen.getByRole('link', { name: 'TextField' }))

    expect(router.state.location.pathname).toBe('/components/text-field')
    expect(screen.getByRole('heading', { level: 1, name: 'TextField' })).toBeInTheDocument()
  })
})
