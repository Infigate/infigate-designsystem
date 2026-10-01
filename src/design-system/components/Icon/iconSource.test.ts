/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildIconsModule, parseIconFiles, parseIconSvg } from './iconSource'

const svg = (body: string, viewBox = '0 0 24 24') =>
  `<svg width="24" height="24" viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="icon/x">${body}</g></svg>`

describe('parseIconSvg', () => {
  it('形はそのままに、属性名を React 用に変え、id を取り除く', () => {
    const elements = parseIconSvg(
      svg('<path id="vector" d="M5 12H19" stroke="#21272F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
      'x.svg',
    )

    expect(elements).toEqual([
      ['path', { d: 'M5 12H19', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ])
  })

  it('線・塗りの色は currentColor に、白は白抜き（data-knockout）に変える', () => {
    const elements = parseIconSvg(
      svg(
        '<path d="M1 1Z" fill="#697079"/><path d="M2 2" stroke="white" stroke-width="2"/><circle cx="1" cy="2" r="3" fill="#FFFFFF"/>',
      ),
      'x.svg',
    )

    expect(elements).toEqual([
      ['path', { d: 'M1 1Z', fill: 'currentColor' }],
      ['path', { d: 'M2 2', 'data-knockout': 'stroke', strokeWidth: '2' }],
      ['circle', { cx: '1', cy: '2', r: '3', 'data-knockout': 'fill' }],
    ])
  })

  it('入れ子の <g> は無視して中の図形を取り出す', () => {
    expect(parseIconSvg(svg('<g id="vector"><path d="M1 1"/><path d="M2 2"/></g>'), 'x.svg')).toHaveLength(2)
  })

  it.each([
    ['viewBox が 24×24 でない', svg('<path d="M1 1"/>', '0 0 16 16'), /viewBox/],
    ['扱えない要素がある', svg('<defs><clipPath id="a"/></defs><path d="M1 1"/>'), /<defs> は扱えません/],
    ['扱えない属性がある', svg('<path d="M1 1" transform="rotate(45)"/>'), /属性「transform」/],
    ['属性の値が不正', svg('<path d="M1 1" stroke-linecap="pointy"/>'), /値「pointy」/],
    ['単色でない塗り', svg('<path d="M1 1" fill="url(#gradient)"/>'), /色「url\(#gradient\)」/],
    ['線と塗りの両方が白', svg('<path d="M1 1" fill="white" stroke="white"/>'), /両方を白/],
    ['図形がない', svg(''), /図形がありません/],
  ])('%s場合はファイル名付きでエラーにする', (_label, source, message) => {
    expect(() => parseIconSvg(source, 'broken.svg')).toThrow(message)
    expect(() => parseIconSvg(source, 'broken.svg')).toThrow(/broken\.svg/)
  })
})

describe('parseIconFiles', () => {
  const line = svg('<path d="M1 1" stroke="#000"/>')
  const filled = svg('<path d="M1 1Z" fill="#000"/>')

  it('名前順に並べ、.filled.svg を同じ名前の塗りの版としてまとめる', () => {
    const icons = parseIconFiles({ 'zoom.svg': line, 'info.filled.svg': filled, 'info.svg': line })

    expect(Object.keys(icons)).toEqual(['info', 'zoom'])
    expect(icons.info.filled).toEqual([['path', { d: 'M1 1Z', fill: 'currentColor' }]])
    expect(icons.zoom).not.toHaveProperty('filled')
  })

  it('線の版がない塗りの版はエラーにする', () => {
    expect(() => parseIconFiles({ 'info.filled.svg': filled })).toThrow('info.filled.svg: 線の版（info.svg）がありません')
  })

  it.each(['Info.svg', 'arrow_right.svg', 'info.png'])('命名規則に合わないファイル名「%s」はエラーにする', (fileName) => {
    expect(() => parseIconFiles({ [fileName]: line })).toThrow(/ファイル名は/)
  })
})

describe('icons.generated.ts', () => {
  it('svg/ の内容から生成した結果と一致している（ずれていたら npm run icons:generate を実行する）', () => {
    // Vitest はプロジェクトルートで実行される（jsdom 環境では import.meta.url が file: にならない）
    const iconDir = join(process.cwd(), 'src/design-system/components/Icon')
    const svgDir = join(iconDir, 'svg')
    const files = Object.fromEntries(
      readdirSync(svgDir)
        .filter((fileName) => fileName.endsWith('.svg'))
        .sort()
        .map((fileName) => [fileName, readFileSync(join(svgDir, fileName), 'utf8')]),
    )

    expect(readFileSync(join(iconDir, 'icons.generated.ts'), 'utf8')).toBe(buildIconsModule(files))
  })
})
