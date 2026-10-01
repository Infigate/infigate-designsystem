import type { ComponentType } from 'react'
import { ColorPage } from './pages/ColorPage'
import { ElevationPage } from './pages/ElevationPage'
import { LayoutPage } from './pages/LayoutPage'
import { RadiusPage } from './pages/RadiusPage'
import { SpacingPage } from './pages/SpacingPage'
import { TypographyPage } from './pages/TypographyPage'

export type FoundationPageDefinition = {
  readonly slug: string
  readonly title: string
  readonly description: string
  readonly Content: ComponentType
}

/** 基本デザインのページ一覧。この順でサイドバーに並ぶ */
export const FOUNDATION_PAGES: readonly FoundationPageDefinition[] = [
  {
    slug: 'color',
    title: 'Color',
    description: '基本パレット（プリミティブ）と、役割を決めた色（セマンティック）です。部品からはセマンティックを使います。',
    Content: ColorPage,
  },
  {
    slug: 'typography',
    title: 'Typography',
    description: '書体は Noto Sans JP。テキストスタイルを font プロパティにそのまま指定して使います。',
    Content: TypographyPage,
  },
  {
    slug: 'spacing',
    title: 'Spacing',
    description: '余白と、部品・アイコンの大きさです。',
    Content: SpacingPage,
  },
  {
    slug: 'radius',
    title: 'Radius',
    description: '角丸の大きさです。',
    Content: RadiusPage,
  },
  {
    slug: 'elevation',
    title: 'Elevation',
    description: '影の3段階です。',
    Content: ElevationPage,
  },
  {
    slug: 'layout',
    title: 'Layout',
    description: '画面幅ごとのグリッドと、コンテンツの最大幅です。',
    Content: LayoutPage,
  },
]

export function findFoundationPage(slug: string): FoundationPageDefinition | undefined {
  return FOUNDATION_PAGES.find((page) => page.slug === slug)
}
