import { defineCatalogEntry, definePlayground, ThumbnailLayout } from '@/features/catalog'
import { Button } from '../Button'
import { Toast } from './Toast'
import styles from './Toast.catalog.module.css'
import { TOAST_STATUSES, TOAST_VARIANTS, type ToastStatus, type ToastVariant } from './Toast.constants'
import { useToast } from './Toast.context'
import { ToastProvider } from './ToastProvider'

const VARIANT_LABELS = {
  light: 'Light',
  solid: 'Solid',
  dark: 'Dark',
} as const satisfies Record<ToastVariant, string>

const TITLE = '見出しが入ります'
const DESCRIPTION = '説明が1行だけ入ります'
const LONG_DESCRIPTION = '説明は1行までで、入りきらない部分は末尾を省略して表示します'

/** 見本の閉じるボタン（押しても何もしない） */
const noop = () => {}

type PlaygroundOptions = {
  status: ToastStatus
  variant: ToastVariant
  description: boolean
  icon: boolean
  close: boolean
}

/** 見た目の見本と、実際に右下へ出すボタン */
function PlaygroundDemo({ status, variant, description, icon, close }: PlaygroundOptions) {
  const { showToast } = useToast()
  const descriptionText = description ? DESCRIPTION : undefined

  return (
    <div className={styles.demo}>
      <div className={styles.box}>
        <Toast
          status={status}
          variant={variant}
          title={TITLE}
          description={descriptionText}
          icon={icon}
          onClose={close ? noop : undefined}
        />
      </div>
      <Button
        variant="outline"
        theme="secondary"
        size="sm"
        onClick={() => showToast({ status, variant, title: TITLE, description: descriptionText, icon, closable: close })}
      >
        画面に表示する
      </Button>
    </div>
  )
}

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'status', options: TOAST_STATUSES, defaultValue: 'success' },
    { type: 'select', name: 'variant', options: TOAST_VARIANTS, defaultValue: 'light' },
    { type: 'boolean', name: 'description', defaultValue: false },
    { type: 'boolean', name: 'icon', defaultValue: true },
    { type: 'boolean', name: 'close', defaultValue: true },
  ],
  render: (values) => (
    <ToastProvider>
      <PlaygroundDemo {...values} />
    </ToastProvider>
  ),
  code: ({ status, variant, description, icon, close }) => {
    const options = [
      `status: '${status}'`,
      variant !== 'light' && `variant: '${variant}'`,
      `title: '${TITLE}'`,
      description && `description: '${DESCRIPTION}'`,
      !icon && 'icon: false',
      !close && 'closable: false',
    ].filter(Boolean)
    return `const { showToast } = useToast()\n\nshowToast({ ${options.join(', ')} })`
  },
})

/**
 * Toast のカタログ定義。
 * Figma: Infigate デザインシステム / Toast（toast）
 */
export default defineCatalogEntry({
  name: 'Toast',
  category: 'feedback',
  description: '数秒で消える通知。読まなくても困らない内容に使い、対処が必要なことは Alert で出します。',
  playground,
  // 一覧のカードに出す小さな見本
  thumbnail: () => (
    <ThumbnailLayout fill>
      <Toast status="success" title="保存しました" onClose={() => {}} />
    </ThumbnailLayout>
  ),
  variants: [
    {
      name: 'Variants',
      description: 'Solid と Dark は視界の端でも気づきやすいので、短い通知に向きます。',
      render: () => (
        <div className={styles.columns}>
          {TOAST_VARIANTS.map((variant) => (
            <div key={variant} className={styles.column}>
              <span className={styles.label}>{VARIANT_LABELS[variant]}</span>
              {TOAST_STATUSES.map((status) => (
                <Toast key={status} status={status} variant={variant} title={TITLE} onClose={noop} />
              ))}
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Description',
      description: '説明は1行までで、入りきらない部分は「…」で省略します。',
      render: () => (
        <div className={styles.columns}>
          <Toast status="success" title={TITLE} description={LONG_DESCRIPTION} onClose={noop} />
          <Toast status="info" variant="solid" title={TITLE} description={LONG_DESCRIPTION} onClose={noop} />
          <Toast status="error" variant="dark" title={TITLE} description={LONG_DESCRIPTION} onClose={noop} />
        </div>
      ),
    },
    {
      name: 'Without icon',
      description: '種類を伝える必要がない通知では、アイコンを外して文字だけにします。',
      render: () => (
        <div className={styles.pair}>
          <Toast status="info" title={TITLE} icon={false} onClose={noop} />
          <Toast status="info" variant="dark" title={TITLE} icon={false} onClose={noop} />
        </div>
      ),
    },
  ],
  props: [
    {
      name: 'status',
      type: TOAST_STATUSES.map((s) => `'${s}'`).join(' | '),
      defaultValue: "'info'",
      description: '状態。アイコンの形と色が変わる',
    },
    {
      name: 'variant',
      type: TOAST_VARIANTS.map((v) => `'${v}'`).join(' | '),
      defaultValue: "'light'",
      description: '見た目。light は白い面、solid は状態色の塗り、dark は濃い面',
    },
    { name: 'title', type: 'ReactNode', required: true, description: '見出し。1行に収まらない部分は省略する' },
    { name: 'description', type: 'ReactNode', description: '説明。1行までで、収まらない部分は省略する' },
    { name: 'icon', type: 'boolean', defaultValue: 'true', description: '状態のアイコンを出す' },
    { name: 'onClose', type: '() => void', description: '閉じるボタンを押したとき。指定すると閉じるボタンが出る' },
    { name: 'closeLabel', type: 'string', defaultValue: "'閉じる'", description: '閉じるボタンの読み上げ名' },
    { name: '...rest', type: "ComponentPropsWithRef<'div'>", description: 'その他の div 要素の属性（className など）' },
  ],
  subcomponents: [
    {
      name: 'ToastProvider',
      props: [
        { name: 'children', type: 'ReactNode', required: true, description: 'アプリ全体。外側に1つだけ置く' },
        { name: 'max', type: 'number', defaultValue: '3', description: '同時に出せる数。超えた分は古いものから消す' },
        { name: 'label', type: 'string', defaultValue: "'通知'", description: 'トーストを並べる場所の読み上げ名' },
      ],
    },
    {
      name: 'useToast().showToast',
      props: [
        { name: 'title', type: 'ReactNode', required: true, description: '見出し' },
        { name: 'status', type: 'ToastStatus', defaultValue: "'info'", description: '状態' },
        { name: 'variant', type: 'ToastVariant', defaultValue: "'light'", description: '見た目' },
        { name: 'description', type: 'ReactNode', description: '説明（1行まで）' },
        { name: 'icon', type: 'boolean', defaultValue: 'true', description: '状態のアイコンを出す' },
        { name: 'closable', type: 'boolean', defaultValue: 'true', description: '閉じるボタンを出す' },
        {
          name: 'duration',
          type: 'number',
          defaultValue: '5000',
          description: '自動で消えるまでのミリ秒。ポインターを乗せている間とフォーカスがある間は止まる',
        },
      ],
    },
  ],
})
