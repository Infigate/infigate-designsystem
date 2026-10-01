import { defineCatalogEntry } from '@/features/catalog'
import { Button } from './Button'
import { BUTTON_SIZES, BUTTON_VARIANTS } from './Button.constants'

/**
 * Button のカタログ定義。
 * *.catalog.tsx を置くとカタログサイトに自動で掲載される（src/app/catalogRepository.ts 参照）。
 */
export default defineCatalogEntry({
  name: 'Button',
  category: 'actions',
  description: 'ユーザーの操作を受け付けるボタン。画面内の重要度に応じて variant を使い分けます。',
  variants: [
    {
      name: 'Variants',
      description: 'primary は画面内で最も重要な操作に1つだけ使います。破壊的な操作には danger を使います。',
      render: () => (
        <>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </>
      ),
    },
    {
      name: 'Sizes',
      render: () => (
        <>
          {BUTTON_SIZES.map((size) => (
            <Button key={size} size={size}>
              Size {size}
            </Button>
          ))}
        </>
      ),
    },
    {
      name: 'Disabled',
      description: '操作できない状態。理由が伝わるよう、近くに補足テキストを置くことを推奨します。',
      render: () => (
        <>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} disabled>
              {variant}
            </Button>
          ))}
        </>
      ),
    },
    {
      name: 'Loading',
      description: '処理中は操作を受け付けず、aria-busy で支援技術にも状態を伝えます。',
      render: () => (
        <>
          <Button loading>保存中</Button>
          <Button variant="secondary" loading>
            読み込み中
          </Button>
        </>
      ),
    },
    {
      name: 'Full width',
      description: 'モバイルのフォーム送信など、親要素の幅いっぱいに広げる場合に使います。',
      render: () => <Button fullWidth>送信する</Button>,
    },
  ],
  props: [
    {
      name: 'variant',
      type: BUTTON_VARIANTS.map((v) => `'${v}'`).join(' | '),
      defaultValue: "'primary'",
      description: '見た目の種類',
    },
    {
      name: 'size',
      type: BUTTON_SIZES.map((s) => `'${s}'`).join(' | '),
      defaultValue: "'md'",
      description: '大きさ',
    },
    { name: 'fullWidth', type: 'boolean', defaultValue: 'false', description: '親要素の幅いっぱいに広げる' },
    { name: 'loading', type: 'boolean', defaultValue: 'false', description: '処理中表示。true の間は操作できない' },
    { name: 'disabled', type: 'boolean', defaultValue: 'false', description: '操作できない状態にする' },
    {
      name: 'type',
      type: "'button' | 'submit' | 'reset'",
      defaultValue: "'button'",
      description: 'form 内で意図せず送信しないよう、既定は button',
    },
    { name: 'children', type: 'ReactNode', required: true, description: 'ボタンのラベル' },
    { name: '...rest', type: "ComponentPropsWithRef<'button'>", description: 'その他の button 要素の属性（ref を含む）' },
  ],
})
