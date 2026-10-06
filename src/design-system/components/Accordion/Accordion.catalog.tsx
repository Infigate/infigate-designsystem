import { Fragment } from 'react'
import { defineCatalogEntry, definePlayground, ForcePseudoState, ThumbnailLayout, type ForceablePseudoClass } from '@/features/catalog'
import { Accordion, AccordionItem } from './Accordion'
import styles from './Accordion.catalog.module.css'

/** Figma の State と Open。hover・focus は操作で起きる状態なので、擬似クラスを強制して再現する */
const STATES = ['default', 'hover', 'focus', 'disabled'] as const
type State = (typeof STATES)[number]
const STATE_LABELS = {
  default: 'Default',
  hover: 'Hover',
  focus: 'Focus',
  disabled: 'Disabled',
} as const satisfies Record<State, string>
const FORCED_PSEUDO: Partial<Record<State, readonly ForceablePseudoClass[]>> = {
  hover: ['hover'],
  focus: ['focus', 'focus-visible'],
}

const BODY =
  'テキストが入ります。テキストが入ります。テキストが入ります。テキストが入ります。テキストが入ります。テキストが入ります。テキストが入ります。'

/** Disabled は閉じた状態だけを見せる（開いたまま操作できない項目は、使う場面がほぼないため） */
const isOpen = (open: boolean, state: State) => open && state !== 'disabled'

function Sample({ open, state, title }: { open: boolean; state: State; title: string }) {
  return (
    <ForcePseudoState state={FORCED_PSEUDO[state]}>
      <Accordion className={styles.sample}>
        {/* 状態を切り替えたときに、開閉を作り直す */}
        <AccordionItem
          key={String(isOpen(open, state))}
          title={title}
          defaultOpen={isOpen(open, state)}
          disabled={state === 'disabled'}
        >
          {BODY}
        </AccordionItem>
      </Accordion>
    </ForcePseudoState>
  )
}

const playground = definePlayground({
  controls: [
    { type: 'boolean', name: 'open', defaultValue: false },
    { type: 'select', name: 'state', options: STATES, defaultValue: 'default' },
    { type: 'text', name: 'title', defaultValue: 'タイトルが入ります' },
  ],
  render: ({ open, state, title }) => (
    // 開閉で幅が変わらないよう、Group と同じ幅に揃える
    <div className={styles.group}>
      <Sample open={open} state={state} title={title} />
    </div>
  ),
  code: ({ open, state, title }) => {
    const attributes = [`title="${title}"`, isOpen(open, state) && 'defaultOpen', state === 'disabled' && 'disabled'].filter(
      Boolean,
    )
    return ['<Accordion>', `  <AccordionItem ${attributes.join(' ')}>`, '    本文', '  </AccordionItem>', '</Accordion>'].join(
      '\n',
    )
  },
})

/**
 * Accordion・AccordionItem のカタログ定義。
 * Figma: Infigate デザインシステム / Accordion（accordion-item・accordion）
 */
export default defineCatalogEntry({
  name: 'Accordion',
  category: 'data-display',
  description: '見出しを押すと本文が開閉する項目。長い説明や FAQ を、必要なところだけ読めるようにします。',
  playground,
  // 一覧のカードに出す小さな見本
  thumbnail: () => (
    <ThumbnailLayout fill>
      <Accordion>
        <AccordionItem title="よくある質問">回答が入ります。</AccordionItem>
      </Accordion>
    </ThumbnailLayout>
  ),
  variants: [
    {
      name: 'States',
      description: '見出し行全体が押せる範囲です。開いているときだけ本文が出て、シェブロンが反転します。',
      render: () => (
        <div className={styles.scroller} inert>
          <div className={styles.matrix}>
            <span />
            <span className={styles.columnLabel}>Closed</span>
            <span className={styles.columnLabel}>Open</span>
            {STATES.map((state) => (
              <Fragment key={state}>
                <span className={styles.rowLabel}>{STATE_LABELS[state]}</span>
                {[false, true].map((open) =>
                  state === 'disabled' && open ? (
                    <span key="open" />
                  ) : (
                    <Sample key={String(open)} open={open} state={state} title="タイトルが入ります" />
                  ),
                )}
              </Fragment>
            ))}
          </div>
        </div>
      ),
    },
    {
      name: 'Group',
      description: '項目は Accordion でまとめ、区切り線でつなげます。項目ごとに開閉できます。',
      render: () => (
        <Accordion className={styles.group}>
          <AccordionItem title="申し込みに必要なものは何ですか？" defaultOpen>
            本人確認書類（運転免許証・マイナンバーカードなど）と、引き落とし口座の情報が必要です。
          </AccordionItem>
          <AccordionItem title="申し込みのあと、いつから使えますか？">
            審査が終わりしだい、メールでお知らせします。通常は2〜3営業日です。
          </AccordionItem>
          <AccordionItem title="解約の方法を教えてください">
            マイページの「契約内容」から手続きできます。月の途中で解約しても、その月の料金がかかります。
          </AccordionItem>
        </Accordion>
      ),
    },
  ],
  props: [
    { name: 'children', type: 'ReactNode', required: true, description: 'AccordionItem' },
    { name: '...rest', type: "ComponentPropsWithRef<'div'>", description: 'その他の div 要素の属性（className など）' },
  ],
  subcomponents: [
    {
      name: 'AccordionItem',
      props: [
        { name: 'title', type: 'ReactNode', required: true, description: '見出し。押すと本文が開閉する' },
        { name: 'children', type: 'ReactNode', required: true, description: '本文' },
        { name: 'defaultOpen', type: 'boolean', defaultValue: 'false', description: '最初から開いておく' },
        { name: 'open', type: 'boolean', description: '開いているか。onOpenChange と組み合わせて、開閉を制御する' },
        { name: 'onOpenChange', type: '(open: boolean) => void', description: '開閉したときに、開いたかどうかで呼ばれる' },
        { name: 'disabled', type: 'boolean', defaultValue: 'false', description: '開閉できない状態にする（開いていれば開いたまま）' },
        {
          name: 'headingLevel',
          type: '2 | 3 | 4 | 5 | 6',
          defaultValue: '3',
          description: '見出しの階層（h2〜h6）。ページの見出しの並びに合わせる',
        },
        { name: '...rest', type: "ComponentPropsWithRef<'div'>", description: 'その他の div 要素の属性（className など）' },
      ],
    },
  ],
})
