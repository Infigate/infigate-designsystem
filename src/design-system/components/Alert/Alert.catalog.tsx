import { useState } from 'react'
import { defineCatalogEntry, definePlayground, ThumbnailLayout } from '@/features/catalog'
import { Button } from '../Button'
import { Alert } from './Alert'
import styles from './Alert.catalog.module.css'
import { ALERT_STATUSES, type AlertStatus } from './Alert.constants'

const STATUS_LABELS = {
  success: 'success（完了・成功）',
  error: 'error（エラー）',
  warning: 'warning（注意）',
  info: 'info（お知らせ）',
} as const satisfies Record<AlertStatus, string>

const TITLE = '見出しが入ります'
const BODY = 'メッセージが入ります。何が起きたのか、次に何をすればよいのかを書きます。'

const ACTIONS = (
  <>
    <Button variant="text" size="sm">
      主要なアクション
    </Button>
    <Button variant="text" theme="secondary" size="sm">
      副次的なアクション
    </Button>
  </>
)

/** 閉じると消え、「もう一度表示」で戻せる見本 */
function Dismissible({ status, single, actions }: { status: AlertStatus; single: boolean; actions: boolean }) {
  const [open, setOpen] = useState(true)
  if (!open) {
    return (
      <Button variant="outline" theme="secondary" size="sm" onClick={() => setOpen(true)}>
        もう一度表示
      </Button>
    )
  }
  return (
    <Alert
      status={status}
      title={single ? 'メッセージが入ります' : TITLE}
      actions={!single && actions ? ACTIONS : undefined}
      onClose={() => setOpen(false)}
    >
      {single ? undefined : BODY}
    </Alert>
  )
}

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'status', options: ALERT_STATUSES, defaultValue: 'success' },
    { type: 'boolean', name: 'singleLine', defaultValue: false },
    { type: 'boolean', name: 'actions', defaultValue: true },
    { type: 'boolean', name: 'close', defaultValue: true },
  ],
  render: ({ status, singleLine, actions, close }) => (
    <div className={styles.box}>
      {close ? (
        <Dismissible key={`${status}${singleLine}${actions}`} status={status} single={singleLine} actions={actions} />
      ) : (
        <Alert
          status={status}
          title={singleLine ? 'メッセージが入ります' : TITLE}
          actions={!singleLine && actions ? ACTIONS : undefined}
        >
          {singleLine ? undefined : BODY}
        </Alert>
      )}
    </div>
  ),
  code: ({ status, singleLine, actions, close }) => {
    const attributes = [
      `status="${status}"`,
      `title="${singleLine ? 'メッセージが入ります' : TITLE}"`,
      !singleLine && actions && 'actions={<>…</>}',
      close && 'onClose={…}',
    ].filter(Boolean)
    return singleLine ? `<Alert ${attributes.join(' ')} />` : `<Alert ${attributes.join(' ')}>\n  ${BODY}\n</Alert>`
  },
})

/**
 * Alert のカタログ定義。
 * Figma: Infigate デザインシステム / Alert（alert）
 */
export default defineCatalogEntry({
  name: 'Alert',
  category: 'feedback',
  description: '画面に留まるメッセージ。数秒で消える通知には使いません。',
  playground,
  // 一覧のカードに出す小さな見本
  thumbnail: () => (
    <ThumbnailLayout fill>
      <Alert status="success" title="保存しました" />
    </ThumbnailLayout>
  ),
  variants: [
    {
      name: 'Statuses',
      description: '本文もアクションもないときは、見出しだけの1行の表示になります。',
      render: () => (
        <div className={styles.grid}>
          {ALERT_STATUSES.map((status) => (
            <div key={status} className={styles.case}>
              <span className={styles.caseLabel}>{STATUS_LABELS[status]}</span>
              <div className={styles.pair}>
                <Alert status={status} title={TITLE} actions={ACTIONS} onClose={() => {}}>
                  {BODY}
                </Alert>
                <Alert status={status} title="メッセージが入ります" onClose={() => {}} />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Actions and close',
      description: '閉じても困らないメッセージだけに閉じるボタンを付け、対処が必要なものには付けません。',
      render: () => (
        <div className={styles.patterns}>
          <div className={styles.case}>
            <span className={styles.caseLabel}>アクションつき</span>
            <Alert status="warning" title={TITLE} actions={ACTIONS}>
              {BODY}
            </Alert>
          </div>
          <div className={styles.case}>
            <span className={styles.caseLabel}>アクションなし・閉じるボタンあり</span>
            <Dismissible status="error" single={false} actions={false} />
          </div>
          <div className={styles.case}>
            <span className={styles.caseLabel}>1行・閉じるボタンなし</span>
            <Alert status="success" title="メッセージが入ります" />
          </div>
        </div>
      ),
    },
  ],
  props: [
    {
      name: 'status',
      type: ALERT_STATUSES.map((s) => `'${s}'`).join(' | '),
      defaultValue: "'info'",
      description: '状態。error・warning はすぐに読み上げ、success・info は読み上げの切れ目で伝える',
    },
    { name: 'title', type: 'ReactNode', required: true, description: '見出し。本文もアクションもなければ1行の表示になる' },
    { name: 'children', type: 'ReactNode', description: '本文。何が起きたのか、次に何をすればよいのかを書く' },
    { name: 'actions', type: 'ReactNode', description: '本文の下の操作。Button の variant="text"・size="sm" を2つまで' },
    { name: 'onClose', type: '() => void', description: '閉じるボタンを押したとき。指定すると閉じるボタンが出る' },
    { name: 'closeLabel', type: 'string', defaultValue: "'閉じる'", description: '閉じるボタンの読み上げ名' },
    { name: '...rest', type: "ComponentPropsWithRef<'div'>", description: 'その他の div 要素の属性（className など）' },
  ],
})
