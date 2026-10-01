import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App（結合）', () => {
  it('一覧からサイドバー経由で Button の詳細ページへ遷移できる', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(await screen.findByRole('heading', { level: 1, name: 'コンポーネント' })).toBeInTheDocument()

    const nav = screen.getByRole('navigation', { name: 'コンポーネント' })
    await user.click(within(nav).getByRole('link', { name: 'Button' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Button' })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/components/button')
  })
})
