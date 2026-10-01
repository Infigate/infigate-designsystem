import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createTestEntry } from '../../../testing/fixtures'
import { renderWithCatalog } from '../../../testing/renderWithCatalog'
import { CatalogNav } from './CatalogNav'

const entries = [
  createTestEntry({ name: 'TextField', category: 'inputs' }),
  createTestEntry({ name: 'Button', category: 'actions' }),
]

describe('CatalogNav', () => {
  it('カテゴリごとにコンポーネントへのリンクを並べる', () => {
    renderWithCatalog(<CatalogNav />, { entries })

    const nav = screen.getByRole('navigation', { name: 'コンポーネント' })
    expect(within(nav).getByRole('list', { name: 'アクション' })).toHaveTextContent('Button')
    expect(within(nav).getByRole('list', { name: '入力' })).toHaveTextContent('TextField')
    expect(within(nav).getByRole('link', { name: 'Button' })).toHaveAttribute('href', '/components/button')
  })

  it('一覧ページでは「すべてのコンポーネント」を現在地とする', () => {
    renderWithCatalog(<CatalogNav />, { entries, path: '/' })

    expect(screen.getByRole('link', { name: 'すべてのコンポーネント' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Button' })).not.toHaveAttribute('aria-current')
  })

  it('詳細ページでは該当コンポーネントを現在地とする', () => {
    renderWithCatalog(<CatalogNav />, { entries, path: '/components/button' })

    expect(screen.getByRole('link', { name: 'Button' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'すべてのコンポーネント' })).not.toHaveAttribute('aria-current')
  })
})
