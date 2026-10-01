import { describe, expect, it } from 'vitest'
import { createRealTokenRepository } from '../testing/realTokens'
import { createCssTokenRepository, parseTokenCss } from './cssTokenRepository'

describe('parseTokenCss', () => {
  it(':root の宣言を、コメントを除いて読み取る', () => {
    const tokens = parseTokenCss(':root {\n  /* 説明 */\n  --a: 1rem; /* 16px */\n  --b: var(--a);\n}', 'x.css')

    expect(tokens).toEqual([
      { name: '--a', value: '1rem', source: 'x.css' },
      { name: '--b', value: 'var(--a)', source: 'x.css' },
    ])
  })

  it('@media (min-width) の中の値を、Tablet・Desktop の値として読み取る', () => {
    const tokens = parseTokenCss(
      ':root { --size: 2rem; --fixed: 1rem; }\n@media (min-width: 768px) { :root { --size: 2.25rem; } }\n@media (min-width: 1024px) { :root { --size: 2.5rem; } }',
      'x.css',
    )

    expect(tokens).toEqual([
      { name: '--size', value: '2rem', source: 'x.css', responsive: { tablet: '2.25rem', desktop: '2.5rem' } },
      { name: '--fixed', value: '1rem', source: 'x.css' },
    ])
  })

  it('Figma のブレークポイント以外の @media はエラーにする', () => {
    expect(() => parseTokenCss('@media (min-width: 640px) { :root { --a: 1px; } }', 'x.css')).toThrow(
      'x.css: @media (min-width: 640px) は扱えません',
    )
  })
})

describe('createCssTokenRepository', () => {
  const repository = createCssTokenRepository({
    '/tokens/b.css': ':root { --text: var(--gray-900); }',
    '/tokens/a.css': ':root { --gray-900: #21272f; --gray-800: #303740; }',
  })

  it('ファイル名と定義の順に並べる', () => {
    expect(repository.findAll().map((t) => `${t.source}:${t.name}`)).toEqual([
      'a.css:--gray-900',
      'a.css:--gray-800',
      'b.css:--text',
    ])
  })

  it('名前の前方一致で取り出せる', () => {
    expect(repository.findByPrefix('--gray-').map((t) => t.name)).toEqual(['--gray-900', '--gray-800'])
  })

  it('ファイルをまたいだ参照も解決できる', () => {
    expect(repository.resolve('--text')).toBe('#21272f')
  })
})

describe('実際のトークン CSS', () => {
  const repository = createRealTokenRepository()

  it('すべてのトークンの参照を解決できる（全モード）', () => {
    for (const token of repository.findAll()) {
      for (const mode of ['mobile', 'tablet', 'desktop'] as const) {
        expect(() => repository.resolve(token.name, mode), token.name).not.toThrow()
      }
    }
  })

  it('セマンティックカラー・レスポンシブな値を Figma どおりに解決する', () => {
    expect(repository.resolve('--color-text-primary')).toBe('#21272f')
    expect(repository.resolve('--color-bg-overlay')).toBe('#21272f99')
    expect(repository.resolve('--font-size-3xl', 'mobile')).toBe('2rem')
    expect(repository.resolve('--font-size-3xl', 'desktop')).toBe('2.5rem')
    expect(repository.resolve('--layout-margin', 'desktop')).toBe('2rem')
  })
})
