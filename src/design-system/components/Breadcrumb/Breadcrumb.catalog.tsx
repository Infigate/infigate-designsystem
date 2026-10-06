import type { MouseEvent } from 'react'
import { defineCatalogEntry, definePlayground, ForcePseudoState, ThumbnailLayout } from '@/features/catalog'
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb'
import styles from './Breadcrumb.catalog.module.css'

/** 見本のリンクはページを移動させない */
const stay = (event: MouseEvent) => event.preventDefault()

const LEVEL_OPTIONS = ['2', '3', '4', '5', '6', '7'] as const

/** 階層の数だけ項目を並べた見本（起点はホーム、ほかはページ） */
/** label: 1ページに見本が複数並ぶので、見本ごとに読み上げ名を分ける */
function SampleBreadcrumb({ levels, label }: { levels: number; label: string }) {
  return (
    <Breadcrumb label={label}>
      {Array.from({ length: levels }, (_, index) => (
        <BreadcrumbItem key={index} href="#" onClick={stay}>
          {index === 0 ? 'ホーム' : `ページ${index}`}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  )
}

const playground = definePlayground({
  controls: [{ type: 'select', name: 'levels', options: LEVEL_OPTIONS, defaultValue: '3' }],
  render: ({ levels }) => <SampleBreadcrumb levels={Number(levels)} label="パンくずリスト（Playground）" />,
  code: ({ levels }) =>
    [
      '<Breadcrumb>',
      ...Array.from({ length: Number(levels) }, (_, index) =>
        index === 0
          ? '  <BreadcrumbItem href="/">ホーム</BreadcrumbItem>'
          : `  <BreadcrumbItem href="/page${index}">ページ${index}</BreadcrumbItem>`,
      ),
      '</Breadcrumb>',
    ].join('\n'),
})

const STATES = [
  { label: 'Default', state: undefined },
  { label: 'Hover', state: ['hover'] },
  { label: 'Focus', state: ['focus', 'focus-visible'] },
] as const

/**
 * Breadcrumb のカタログ定義。
 * Figma: Infigate デザインシステム / Breadcrumb（breadcrumb・breadcrumb-item）
 */
export default defineCatalogEntry({
  name: 'Breadcrumb',
  category: 'navigation',
  description: '今いるページの位置を、起点からの階層で示すナビゲーション。',
  playground,
  // 一覧のカードに出す小さな見本
  thumbnail: () => (
    <ThumbnailLayout>
      <Breadcrumb>
        <BreadcrumbItem href="#">ホーム</BreadcrumbItem>
        <BreadcrumbItem href="#">製品</BreadcrumbItem>
        <BreadcrumbItem>詳細</BreadcrumbItem>
      </Breadcrumb>
    </ThumbnailLayout>
  ),
  variants: [
    {
      name: 'Levels',
      description: '最後の項目は今いるページなので、押せない通常の文字色にします。',
      render: () => (
        <div className={styles.stack}>
          {[2, 3, 4, 5].map((levels) => (
            <SampleBreadcrumb key={levels} levels={levels} label={`パンくずリスト（${levels}階層）`} />
          ))}
        </div>
      ),
    },
    {
      name: 'Item states',
      description: '祖先はリンク色で押せることを伝え、常時の下線は付けずにホバーで出します。',
      render: () => (
        <div className={styles.states}>
          {STATES.map(({ label, state }) => (
            <div key={label} className={styles.state}>
              <ForcePseudoState state={state}>
                <BreadcrumbItem href="#" onClick={stay}>
                  ラベル
                </BreadcrumbItem>
              </ForcePseudoState>
              <span className={styles.stateLabel}>{label}</span>
            </div>
          ))}
          <div className={styles.state}>
            <Breadcrumb label="Current の見本">
              <BreadcrumbItem>ラベル</BreadcrumbItem>
            </Breadcrumb>
            <span className={styles.stateLabel}>Current</span>
          </div>
        </div>
      ),
    },
    {
      name: 'Collapsed',
      description: '5階層を超えると、起点と現在地の近くを残して中間を「…」で省略します。',
      render: () => <SampleBreadcrumb levels={7} label="パンくずリスト（省略あり）" />,
    },
  ],
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description: '項目（BreadcrumbItem）。起点から順に並べ、最後の項目が今いるページになる',
    },
    {
      name: 'maxItems',
      type: 'number',
      defaultValue: '5',
      description: '表示する項目の最大数。超えると起点と最後の2つを残して中間を省略する',
    },
    { name: 'label', type: 'string', defaultValue: "'パンくずリスト'", description: 'ナビゲーションの読み上げ名' },
    { name: '...rest', type: "ComponentPropsWithRef<'nav'>", description: 'その他の nav 要素の属性（className など）' },
  ],
  subcomponents: [
    {
      name: 'BreadcrumbItem',
      props: [
        { name: 'children', type: 'ReactNode', required: true, description: '項目の文字' },
        { name: 'href', type: 'string', description: 'リンク先。最後の項目（今いるページ）では使わない' },
        { name: '...rest', type: "ComponentPropsWithRef<'a'>", description: 'その他の a 要素の属性（onClick など）' },
      ],
    },
  ],
})
