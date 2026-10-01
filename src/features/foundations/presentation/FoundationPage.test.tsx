import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createRealTokenRepository } from '../testing/realTokens'
import { renderFoundationRoute } from '../testing/renderFoundationRoute'
import { FOUNDATION_PAGES } from './foundationPages'

/** ページ内の、トークン名として表示しているテキスト（等幅の code 要素）を集める */
const tokenNamesOnPage = () => new Set([...document.querySelectorAll('main code, article code')].map((el) => el.textContent))
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

describe('基本デザインのページ', () => {
  it.each(FOUNDATION_PAGES.map((page) => [page.title, page.slug] as const))('%s ページを表示できる', (title, slug) => {
    renderFoundationRoute(`/foundations/${slug}`)

    expect(screen.getByText('基本デザイン', { selector: 'header p' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
  })

  it('CSS にあるすべてのトークン（--ds-* を除く）が、どこかのページに載っている', () => {
    const shown = new Set<string>()
    for (const page of FOUNDATION_PAGES) {
      renderFoundationRoute(`/foundations/${page.slug}`)
      for (const name of tokenNamesOnPage()) if (name) shown.add(name)
      cleanup()
    }

    const missing = createRealTokenRepository()
      .findAll()
      .map((token) => token.name)
      .filter((name) => !name.startsWith('--ds-') && !shown.has(name))
    expect(missing).toEqual([])
  })

  it('Color: セマンティックカラーの参照先と値を表示する', () => {
    renderFoundationRoute('/foundations/color')

    const semantics = screen.getByRole('region', { name: 'Semantics' })
    const swatch = within(semantics).getByText('--color-text-primary').closest('li')!
    expect(swatch).toHaveTextContent('→ --color-gray-900')
    expect(within(swatch).getByText('#21272f')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Gray' })).toBeInTheDocument()
  })

  it('Color: ステータスカラーは状態ごとに bg・text・solid・on-inverse の組で表示する', () => {
    renderFoundationRoute('/foundations/color')

    const status = screen.getByRole('region', { name: 'Status' })
    for (const state of ['success', 'error', 'warning', 'info']) {
      const group = within(status).getByRole('heading', { level: 3, name: capitalize(state) }).parentElement!
      const names = within(group)
        .getAllByRole('listitem')
        .map((item) => item.querySelector('code')?.textContent)
      expect(names).toEqual(['bg', 'text', 'solid', 'on-inverse'].map((role) => `--color-status-${state}-${role}`))
    }
  })

  it('Typography: テキストスタイルの大きさ（Desktop / Tablet / Mobile）・太さ・行間を表示する', () => {
    renderFoundationRoute('/foundations/typography')

    const row = screen.getByText('--font-heading-3xl').closest('li')!
    expect(within(row).getByText('40 / 36 / 32px・Bold・140%')).toBeInTheDocument()
    const body = screen.getByText('--font-body-md').closest('li')!
    expect(within(body).getByText('16px・Regular・170%')).toBeInTheDocument()
  })

  it('Spacing: 名前の数字と同じ px を表示する', () => {
    renderFoundationRoute('/foundations/spacing')

    const row = screen.getByText('--spacing-24').closest('li')!
    expect(row).toHaveTextContent('24px・カードの内側（大きめ）、まとまり同士の間')
  })

  it('Elevation: 影の重なりと不透明度を表示する', () => {
    renderFoundationRoute('/foundations/elevation')

    const card = screen.getByText('--elevation-1').closest('li')!
    expect(card).toHaveTextContent('0 1px 2px（10%）＋ 0 2px 6px（6%）')
  })

  it('Layout: 画面幅ごとの値を表で表示する', () => {
    renderFoundationRoute('/foundations/layout')

    const desktop = screen.getByRole('rowheader', { name: 'Desktop（1024px〜）' }).closest('tr')!
    expect(within(desktop).getAllByRole('cell').map((c) => c.textContent)).toEqual(['1024px', '12', '24px', '32px', '1440px'])
  })

  it('Layout: 画面幅を選ぶと、そのモードの列・余白と1列の幅を表示し、表の行を現在地にする', async () => {
    const user = userEvent.setup()
    renderFoundationRoute('/foundations/layout')

    await user.click(screen.getByRole('button', { name: '375px スマートフォン' }))

    expect(screen.getByRole('button', { name: '375px スマートフォン' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/^4列・ガター 16px・左右の余白 16px・1列 73.8px$/)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '375px の画面に 4列を並べた見本' })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'Mobile（〜767px）' }).closest('tr')).toHaveAttribute('aria-current', 'true')
  })

  it('Layout: スライダーで幅を変えられ、最大幅を超えると中央寄せになる（320px 未満にはならない）', () => {
    renderFoundationRoute('/foundations/layout')
    const slider = screen.getByRole('slider', { name: '画面幅' })

    fireEvent.change(slider, { target: { value: '1920' } })
    expect(slider).toHaveAttribute('aria-valuetext', '1920px（Desktop）')
    expect(screen.getByText(/（1440px で止めて中央寄せ）$/)).toBeInTheDocument()

    fireEvent.change(slider, { target: { value: '100' } })
    expect(slider).toHaveAttribute('aria-valuetext', '320px（Mobile）')
  })

  it('存在しないページは「見つかりません」を表示する', () => {
    renderFoundationRoute('/foundations/unknown')

    expect(screen.getByRole('heading', { level: 1, name: 'ページが見つかりません' })).toBeInTheDocument()
  })
})

describe('FoundationNav', () => {
  it('基本デザインの全ページへのリンクを並べ、表示中のページを現在地にする', async () => {
    const user = userEvent.setup()
    const { router } = renderFoundationRoute('/foundations/color')
    const nav = screen.getByRole('navigation', { name: '基本デザイン' })

    expect(within(nav).getAllByRole('link').map((link) => link.textContent)).toEqual(FOUNDATION_PAGES.map((p) => p.title))
    expect(within(nav).getByRole('link', { name: 'Color' })).toHaveAttribute('aria-current', 'page')

    await user.click(within(nav).getByRole('link', { name: 'Radius' }))

    expect(router.state.location.pathname).toBe('/foundations/radius')
    expect(screen.getByRole('heading', { level: 1, name: 'Radius' })).toBeInTheDocument()
  })
})
