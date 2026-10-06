import { defineCatalogEntry, definePlayground, ThumbnailLayout } from '@/features/catalog'
import { Spinner } from './Spinner'
import styles from './Spinner.catalog.module.css'
import { SPINNER_SIZES, SPINNER_TONES, type SpinnerTone } from './Spinner.constants'

const SIZE_LABELS = { sm: 'sm（16px・ボタンの中）', md: 'md（24px・画面の一部）', lg: 'lg（40px・画面全体）' } as const

const TONE_LABELS = { brand: 'brand', inverse: 'inverse（濃い下地）' } as const satisfies Record<SpinnerTone, string>

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'size', options: SPINNER_SIZES, defaultValue: 'md' },
    { type: 'select', name: 'tone', options: SPINNER_TONES, defaultValue: 'brand' },
  ],
  render: ({ size, tone }) => (
    <div className={styles.surface} data-tone={tone}>
      <Spinner size={size} tone={tone} />
    </div>
  ),
  code: ({ size, tone }) => {
    const attributes = [size !== 'md' && `size="${size}"`, tone !== 'brand' && `tone="${tone}"`].filter(Boolean)
    return `<Spinner${attributes.length ? ` ${attributes.join(' ')}` : ''} />`
  },
})

/**
 * Spinner のカタログ定義。
 * Figma: Infigate デザインシステム / Loading（spinner）
 */
export default defineCatalogEntry({
  name: 'Spinner',
  category: 'feedback',
  description: '何が表示されるか決まっていない処理の待ち時間に出す、回転するリング。',
  playground,
  // 一覧のカードに出す小さな見本
  thumbnail: () => (
    <ThumbnailLayout>
      <Spinner size="lg" />
    </ThumbnailLayout>
  ),
  variants: [
    {
      name: 'Sizes and tones',
      description: '濃い下地の上では inverse を使います。',
      render: () => (
        <div className={styles.grid}>
          {SPINNER_TONES.map((tone) => (
            <div key={tone} className={styles.row}>
              <span className={styles.label}>{TONE_LABELS[tone]}</span>
              <div className={styles.surface} data-tone={tone}>
                {SPINNER_SIZES.map((size) => (
                  <div key={size} className={styles.item}>
                    <Spinner size={size} tone={tone} />
                    <span className={styles.itemLabel}>{SIZE_LABELS[size]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'With text',
      description: '「読み込み中」と文字を並べるときは、文字だけを読み上げるよう label を null にします。',
      render: () => (
        <div className={styles.withText} aria-live="polite">
          <Spinner label={null} />
          読み込み中…
        </div>
      ),
    },
  ],
  props: [
    {
      name: 'size',
      type: SPINNER_SIZES.map((s) => `'${s}'`).join(' | '),
      defaultValue: "'md'",
      description: '大きさ。sm 16px はボタンの中、md 24px は画面の一部、lg 40px は画面全体',
    },
    {
      name: 'tone',
      type: SPINNER_TONES.map((t) => `'${t}'`).join(' | '),
      defaultValue: "'brand'",
      description: '色。濃い下地の上では inverse',
    },
    {
      name: 'label',
      type: 'string | null',
      defaultValue: "'読み込み中'",
      description: '読み上げる文。周りの文字で読み込み中だと分かるときは null にして読み上げない',
    },
    { name: '...rest', type: "ComponentPropsWithRef<'span'>", description: 'その他の span 要素の属性（className など）' },
  ],
})
