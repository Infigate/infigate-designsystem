import { defineCatalogEntry } from '@/features/catalog'
import { Icon } from './Icon'
import styles from './Icon.catalog.module.css'
import { FILLED_ICON_NAMES, ICON_NAMES, ICON_SIZES, ICON_VARIANTS } from './Icon.constants'

const SIZE_USAGES = { 16: '小さいボタン・表の中', 20: '通常のボタン・フォーム', 24: '単体・ナビゲーション' } as const

/**
 * Icon のカタログ定義。
 * アイコンは Figma のコンポーネントページ「icons」フレームから書き出した SVG（svg/）を元にしている。
 */
export default defineCatalogEntry({
  name: 'Icon',
  category: 'data-display',
  description:
    'Lucide を基準にしたアイコンセット（24px グリッド・線幅2px）。色は周囲の文字色を受け継ぎます。基本は線、状態を伝える場面だけ塗りを使います。',
  variants: [
    {
      name: 'すべてのアイコン',
      description: `登録されている ${ICON_NAMES.length} 種類。名前は Figma の icon/名前・Lucide の名前と同じです。`,
      render: () => (
        <ul className={styles.grid}>
          {ICON_NAMES.map((name) => (
            <li key={name} className={styles.cell}>
              <Icon name={name} />
              <span className={styles.name}>{name}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      name: '線と塗り',
      description:
        '塗り（filled）は、アラートやトーストのように状態そのものを伝える場面に限って使います。塗りの版があるのは次のアイコンだけです。',
      render: () => (
        <ul className={styles.grid}>
          {FILLED_ICON_NAMES.map((name) => (
            <li key={name} className={styles.cell}>
              <span className={styles.pair}>
                <Icon name={name} />
                <Icon name={name} variant="filled" />
              </span>
              <span className={styles.name}>{name}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      name: 'サイズ',
      description: '24px を基準に 16px・20px を使います。線は大きさに合わせて細くなります。',
      render: () => (
        <div className={styles.sizes}>
          {ICON_SIZES.map((size) => (
            <div key={size} className={styles.size}>
              <Icon name="check" size={size} />
              <span className={styles.sizeLabel}>{size}px</span>
              <span className={styles.name}>{SIZE_USAGES[size]}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: '色',
      description: 'アイコンは周囲の文字色を受け継ぎます。文字と同じ色で使い、アイコンだけ別の色にはしません。',
      render: () => (
        <>
          <span className={`${styles.inline} ${styles.primary}`}>
            <Icon name="download" size={20} />
            ダウンロード
          </span>
          <span className={`${styles.inline} ${styles.link}`}>
            詳しく見る
            <Icon name="external-link" size={20} />
          </span>
          <span className={`${styles.inline} ${styles.success}`}>
            <Icon name="circle-check" variant="filled" size={20} />
            保存しました
          </span>
          <span className={`${styles.inline} ${styles.error}`}>
            <Icon name="circle-x" variant="filled" size={20} />
            入力に誤りがあります
          </span>
        </>
      ),
    },
  ],
  props: [
    { name: 'name', type: 'IconName', required: true, description: 'アイコンの名前（例: "search"）' },
    {
      name: 'variant',
      type: ICON_VARIANTS.map((v) => `'${v}'`).join(' | '),
      defaultValue: "'line'",
      description: `線か塗りか。'filled' は ${FILLED_ICON_NAMES.join('・')} だけ指定できる`,
    },
    {
      name: 'size',
      type: ICON_SIZES.join(' | '),
      defaultValue: '24',
      description: '大きさ（px）。16: 小さいボタン・表の中 / 20: 通常のボタン・フォーム / 24: 単体・ナビゲーション',
    },
    {
      name: 'label',
      type: 'string',
      description: 'アイコンだけで意味を伝えるときの読み上げ名。省略すると装飾として支援技術から隠す',
    },
    { name: '...rest', type: "ComponentPropsWithRef<'svg'>", description: 'その他の svg 要素の属性（ref を含む）' },
  ],
})
