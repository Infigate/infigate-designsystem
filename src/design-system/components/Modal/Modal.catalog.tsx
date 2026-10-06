import { useState } from 'react'
import { defineCatalogEntry, definePlayground, ForcePseudoState } from '@/features/catalog'
import { Button } from '../Button'
import { Field } from '../Field'
import { TextInput } from '../TextInput'
import { Modal } from './Modal'
import styles from './Modal.catalog.module.css'
import { MODAL_SIZES, MODAL_VARIANTS, type ModalVariant } from './Modal.constants'
import { ModalCloseButton, ModalPanel } from './Modal.parts'

const SIZE_LABELS = { sm: 'sm（400px）', md: 'md（560px）', lg: 'lg（720px）' } as const

const TEXT = {
  standard: { title: '変更を保存しますか', body: '保存すると、ほかのメンバーにも変更が表示されます。', primary: '保存する' },
  confirm: { title: 'ファイルを削除しますか', body: '削除したファイルは元に戻せません。', primary: '削除する' },
} as const satisfies Record<ModalVariant, { title: string; body: string; primary: string }>

const LONG_BODY = Array.from({ length: 12 }, () => '本文が長いときは、見出しとボタンを残して本文だけがスクロールします。').join('')

/** 副ボタン・主ボタンの順に並べる（confirm の主ボタンは Danger） */
function SampleActions({ variant, onClose }: { variant: ModalVariant; onClose?: () => void }) {
  return (
    <>
      <Button variant="outline" theme="secondary" onClick={onClose}>
        キャンセル
      </Button>
      <Button theme={variant === 'confirm' ? 'danger' : 'primary'} onClick={onClose}>
        {TEXT[variant].primary}
      </Button>
    </>
  )
}

/** ボタンで開く本物のモーダル */
function OpenDemo({ variant, size, icon, long }: { variant: ModalVariant; size: (typeof MODAL_SIZES)[number]; icon: boolean; long: boolean }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <Button variant="outline" theme="secondary" size="sm" onClick={() => setOpen(true)}>
        画面に表示する
      </Button>
      <Modal
        open={open}
        onClose={close}
        variant={variant}
        size={size}
        icon={icon}
        title={TEXT[variant].title}
        actions={<SampleActions variant={variant} onClose={close} />}
      >
        {long ? LONG_BODY : TEXT[variant].body}
      </Modal>
    </>
  )
}

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'variant', options: MODAL_VARIANTS, defaultValue: 'standard' },
    { type: 'select', name: 'size', options: MODAL_SIZES, defaultValue: 'sm' },
    { type: 'boolean', name: 'icon', defaultValue: true },
    { type: 'boolean', name: 'longText', defaultValue: false },
  ],
  render: ({ variant, size, icon, longText }) => (
    <div className={styles.demo}>
      <ModalPanel
        className={longText ? styles.fixedHeight : undefined}
        variant={variant}
        size={size}
        icon={icon}
        title={TEXT[variant].title}
        actions={<SampleActions variant={variant} />}
      >
        {longText ? LONG_BODY : TEXT[variant].body}
      </ModalPanel>
      <OpenDemo variant={variant} size={size} icon={icon} long={longText} />
    </div>
  ),
  code: ({ variant, size, icon }) => {
    const attributes = [
      'open={open}',
      'onClose={() => setOpen(false)}',
      variant !== 'standard' && `variant="${variant}"`,
      size !== 'sm' && `size="${size}"`,
      !icon && 'icon={false}',
      `title="${TEXT[variant].title}"`,
      'actions={<>…</>}',
    ].filter(Boolean)
    return ['<Modal', ...attributes.map((a) => `  ${a}`), '>', `  ${TEXT[variant].body}`, '</Modal>'].join('\n')
  },
})

/**
 * Modal のカタログ定義。
 * Figma: Infigate デザインシステム / Modal（modal・modal-close・modal-login・modal-mobile）
 */
export default defineCatalogEntry({
  name: 'Modal',
  category: 'feedback',
  description: '画面の中央に重ねて、確認や入力を求めるダイアログ。後ろの画面は操作できなくなります。',
  playground,
  variants: [
    {
      name: 'Variants',
      description: '取り消せない操作の確認は confirm にし、主ボタンを Button の theme="danger" にします。',
      render: () => (
        <div className={styles.row}>
          {MODAL_VARIANTS.map((variant) => (
            <ModalPanel
              key={variant}
              variant={variant}
              title={TEXT[variant].title}
              actions={<SampleActions variant={variant} />}
            >
              {TEXT[variant].body}
            </ModalPanel>
          ))}
        </div>
      ),
    },
    {
      name: 'Sizes',
      description: '中身の量に合わせて、幅を 400 / 560 / 720px から選びます。',
      render: () => (
        <div className={styles.stack}>
          {MODAL_SIZES.map((size) => (
            <div key={size} className={styles.case}>
              <span className={styles.caseLabel}>{SIZE_LABELS[size]}</span>
              <ModalPanel size={size} title={TEXT.standard.title} actions={<SampleActions variant="standard" />}>
                {TEXT.standard.body}
              </ModalPanel>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Long content',
      description: '本文が長いときは、見出しとボタンを残して本文だけをスクロールし、上下に境界線を出します。',
      render: () => (
        <ModalPanel
          className={styles.fixedHeight}
          size="md"
          title="利用規約"
          icon={false}
          actions={<SampleActions variant="standard" />}
        >
          {LONG_BODY}
        </ModalPanel>
      ),
    },
    {
      name: 'With form',
      description: '入力欄を入れるときは、本文の代わりに Field を縦に積みます。',
      render: () => (
        <ModalPanel
          size="md"
          title="ログイン"
          icon={false}
          actions={
            <>
              <Button variant="outline" theme="secondary">
                キャンセル
              </Button>
              <Button>ログイン</Button>
            </>
          }
        >
          <div className={styles.form}>
            <Field label="メールアドレス" error="必須項目です。入力してください。">
              <TextInput placeholder="name@example.com" />
            </Field>
            <Field label="パスワード" description="半角英数字で入力してください。">
              <TextInput type="password" />
            </Field>
          </div>
        </ModalPanel>
      ),
    },
    {
      name: 'Mobile',
      description: '画面の幅が 768px より狭いと、左右 16px を残して広げ、ボタンを縦に積んで主ボタンを上にします。',
      render: () => (
        <div className={styles.row}>
          {MODAL_VARIANTS.map((variant) => (
            <ModalPanel
              key={variant}
              className={styles.mobile}
              layout="mobile"
              variant={variant}
              title={TEXT[variant].title}
              actions={<SampleActions variant={variant} />}
            >
              {TEXT[variant].body}
            </ModalPanel>
          ))}
        </div>
      ),
    },
    {
      name: 'Close button',
      description: '閉じるボタンは見出しの右端に置き、押せる範囲を 32×32 にします。',
      render: () => (
        <div className={styles.closeStates} inert>
          {[
            { label: 'Default', state: undefined },
            { label: 'Hover', state: ['hover'] as const },
            { label: 'Focus', state: ['focus', 'focus-visible'] as const },
          ].map(({ label, state }) => (
            <div key={label} className={styles.closeState}>
              <ForcePseudoState state={state}>
                <ModalCloseButton aria-label="閉じる" />
              </ForcePseudoState>
              <span className={styles.caseLabel}>{label}</span>
            </div>
          ))}
        </div>
      ),
    },
  ],
  props: [
    { name: 'open', type: 'boolean', required: true, description: '開いているか' },
    {
      name: 'onClose',
      type: '() => void',
      required: true,
      description: '閉じるボタン・Esc で閉じようとしたとき。open を false にして閉じる（背景を押しても閉じない）',
    },
    {
      name: 'variant',
      type: MODAL_VARIANTS.map((v) => `'${v}'`).join(' | '),
      defaultValue: "'standard'",
      description: '種類。confirm は取り消せない操作の確認で、警告のアイコンを出す',
    },
    {
      name: 'size',
      type: MODAL_SIZES.map((s) => `'${s}'`).join(' | '),
      defaultValue: "'sm'",
      description: '幅。sm 400px / md 560px / lg 720px。スマートフォンでは左右 16px を残して幅いっぱい',
    },
    { name: 'title', type: 'ReactNode', required: true, description: '見出し' },
    { name: 'icon', type: 'boolean', defaultValue: 'true', description: '見出しの左のアイコン。standard は info、confirm は警告' },
    { name: 'children', type: 'ReactNode', description: '本文。長いときは本文だけがスクロールする' },
    {
      name: 'actions',
      type: 'ReactNode',
      description: '下のボタン（Button）。副ボタン・主ボタンの順に並べると、主ボタンが右（スマートフォンでは上）になる',
    },
    { name: 'closeLabel', type: 'string', defaultValue: "'閉じる'", description: '閉じるボタンの読み上げ名' },
    { name: '...rest', type: "ComponentPropsWithRef<'dialog'>", description: 'その他の dialog 要素の属性（className など）' },
  ],
})
