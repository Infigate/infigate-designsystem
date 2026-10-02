import { useEffect, useId, useRef, useState } from 'react'
import { defineCatalogEntry, definePlayground, ForcePseudoState } from '@/features/catalog'
import { FileItem, FileList } from './FileItem'
import { FileUpload } from './FileUpload'
import styles from './FileUpload.catalog.module.css'
import { FILE_ITEM_STATUSES, FILE_UPLOAD_LAYOUTS, type FileItemStatus, type FileUploadLayout } from './FileUpload.constants'
import { FileUploadZone } from './FileUpload.parts'

const HINT = 'PNG・JPG・PDF / 1ファイル 10MB まで'
const ACCEPTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'pdf']
const MAX_SIZE = 10 * 1024 * 1024

type DemoFile = { id: number; name: string; size: number; status: FileItemStatus; progress: number; error?: string }

const SAMPLE_FILES: DemoFile[] = [
  { id: -1, name: '見積書.pdf', size: 2.4 * 1024 * 1024, status: 'uploading', progress: 40 },
  { id: -2, name: '会社ロゴ.png', size: 2.4 * 1024 * 1024, status: 'done', progress: 100 },
  { id: -3, name: '議事録.docx', size: 0.8 * 1024 * 1024, status: 'error', progress: 0, error: 'ファイルの形式が対応していません' },
]

/** 形式と容量を確かめ、満たさなければ理由を返す（実際の画面でも、使う側で確かめる） */
function validate(file: File): string | undefined {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ACCEPTED_EXTENSIONS.includes(extension)) return 'ファイルの形式が対応していません'
  if (file.size > MAX_SIZE) return 'ファイルの容量が 10MB を超えています'
}

/** 実際に選べる見本。送信は模擬で、少しずつ進んで完了になる */
function Demo({ layout }: { layout: FileUploadLayout }) {
  const [files, setFiles] = useState(SAMPLE_FILES)
  const nextId = useRef(0)
  const uploading = files.some((file) => file.status === 'uploading')

  useEffect(() => {
    if (!uploading) return
    const timer = setInterval(() => {
      setFiles((current) =>
        current.map((file) => {
          if (file.status !== 'uploading') return file
          const progress = file.progress + 20
          return progress >= 100 ? { ...file, status: 'done', progress: 100 } : { ...file, progress }
        }),
      )
    }, 400)
    return () => clearInterval(timer)
  }, [uploading])

  return (
    <div className={styles.example} data-mobile={layout === 'mobile' || undefined}>
      <FileUpload
        hint={HINT}
        layout={layout}
        accept=".png,.jpg,.jpeg,.pdf"
        multiple
        onSelect={(selected) => {
          const added = selected.map((file): DemoFile => {
            const error = validate(file)
            nextId.current += 1
            return { id: nextId.current, name: file.name, size: file.size, status: error ? 'error' : 'uploading', progress: 0, error }
          })
          // 新しいファイルを上に足す
          setFiles((current) => [...added.reverse(), ...current])
        }}
      />
      {files.length > 0 && (
        <FileList aria-label="選んだファイル">
          {files.map((file) => (
            <FileItem
              key={file.id}
              name={file.name}
              status={file.status}
              progress={file.progress}
              size={file.size}
              error={file.error}
              onRemove={() => setFiles((current) => current.filter((f) => f.id !== file.id))}
            />
          ))}
        </FileList>
      )}
    </div>
  )
}

const playground = definePlayground({
  controls: [{ type: 'select', name: 'layout', options: FILE_UPLOAD_LAYOUTS, defaultValue: 'auto' }],
  render: ({ layout }) => <Demo key={layout} layout={layout} />,
  code: ({ layout }) =>
    [
      '<FileUpload',
      `  hint="${HINT}"`,
      ...(layout === 'auto' ? [] : [`  layout="${layout}"`]),
      '  accept=".png,.jpg,.jpeg,.pdf"',
      '  multiple',
      '  onSelect={(files) => upload(files)}',
      '/>',
      '<FileList aria-label="選んだファイル">',
      '  <FileItem name="見積書.pdf" status="uploading" progress={40} onRemove={…} />',
      '  <FileItem name="会社ロゴ.png" status="done" size={2516582} onRemove={…} />',
      '  <FileItem name="議事録.docx" status="error" error="ファイルの形式が対応していません" onRemove={…} />',
      '</FileList>',
    ].join('\n'),
})

/** アップロードエリアの見本。Dragover は操作でしか起きないので、見た目だけを出す */
function ZoneSample({ layout, state }: { layout: 'desktop' | 'mobile'; state: 'default' | 'hover' | 'dragover' }) {
  const hintId = useId()
  return (
    <ForcePseudoState state={state === 'hover' ? ['hover'] : undefined}>
      <FileUploadZone hint={HINT} hintId={hintId} layout={layout} dragover={state === 'dragover'} />
    </ForcePseudoState>
  )
}

const ITEM_SAMPLES = {
  uploading: { name: 'ファイル名.pdf', progress: 40 },
  done: { name: 'ファイル名.pdf', size: 2.4 * 1024 * 1024 },
  error: { name: 'ファイル名.pdf', error: 'ファイルの形式が対応していません' },
} as const satisfies Record<FileItemStatus, object>

const ITEM_LABELS = { uploading: 'Uploading', done: 'Done', error: 'Error' } as const

/**
 * FileUpload・FileList・FileItem のカタログ定義。
 * Figma: Infigate デザインシステム / File upload（file-upload・file-item・組み合わせた例）
 */
export default defineCatalogEntry({
  name: 'FileUpload',
  category: 'inputs',
  description: 'ファイルを選ぶ枠と、選んだファイルの一覧。PC ではドラッグ＆ドロップでも選べます。',
  playground,
  variants: [
    {
      name: 'States',
      description: 'モバイルはドラッグできないのでボタンだけにします。使える形式と容量は枠の中に必ず書きます。',
      render: () => (
        <div className={styles.zoneMatrix} inert>
          <span />
          <span className={styles.columnLabel}>Desktop</span>
          <span className={styles.columnLabel}>Mobile</span>
          <span className={styles.rowLabel}>Default</span>
          <ZoneSample layout="desktop" state="default" />
          <ZoneSample layout="mobile" state="default" />
          <span className={styles.rowLabel}>Hover</span>
          <ZoneSample layout="desktop" state="hover" />
          <ZoneSample layout="mobile" state="hover" />
          <span className={styles.rowLabel}>Dragover</span>
          <ZoneSample layout="desktop" state="dragover" />
        </div>
      ),
    },
    {
      name: 'File item',
      description: '送信中は進み具合、完了は容量、失敗は理由を出し、× でいつでも取り消せます。',
      render: () => (
        <div className={styles.itemMatrix} inert>
          {FILE_ITEM_STATUSES.map((status) => (
            <div key={status} className={styles.itemRow}>
              <span className={styles.rowLabel}>{ITEM_LABELS[status]}</span>
              <FileList>
                <FileItem status={status} {...ITEM_SAMPLES[status]} onRemove={() => {}} />
              </FileList>
            </div>
          ))}
        </div>
      ),
    },
  ],
  props: [
    { name: 'hint', type: 'ReactNode', required: true, description: '使える形式と容量。枠の中に必ず書く' },
    {
      name: 'onSelect',
      type: '(files: File[]) => void',
      required: true,
      description: '選んだとき・落としたときに呼ばれる。形式・容量の確かめと送信は使う側で行う',
    },
    {
      name: 'layout',
      type: FILE_UPLOAD_LAYOUTS.map((l) => `'${l}'`).join(' | '),
      defaultValue: "'auto'",
      description: '見せ方。auto はタッチ操作の端末でモバイル（ボタンだけ）にする',
    },
    { name: 'accept', type: 'string', description: '選べる形式（例: ".png,.pdf"）。ドラッグ＆ドロップでは絞り込めないので、使う側でも確かめる' },
    { name: 'multiple', type: 'boolean', defaultValue: 'false', description: '複数のファイルを一度に選べるようにする' },
    { name: 'className', type: 'string', description: '枠に付くクラス名' },
    { name: '...rest', type: "ComponentPropsWithRef<'input'>", description: 'その他の input type="file" の属性（ref・name など）' },
  ],
  subcomponents: [
    {
      name: 'FileItem',
      props: [
        { name: 'name', type: 'string', required: true, description: 'ファイル名' },
        {
          name: 'status',
          type: FILE_ITEM_STATUSES.map((s) => `'${s}'`).join(' | '),
          required: true,
          description: '状態。uploading: 送信中 / done: 完了 / error: 失敗',
        },
        { name: 'progress', type: 'number', defaultValue: '0', description: '送信の進み具合（0〜100）。uploading のときに出す' },
        { name: 'size', type: 'number', description: '容量（バイト）。done のときに「2.4 MB」のように出す' },
        { name: 'error', type: 'ReactNode', description: '失敗の理由。error のときに出す' },
        { name: 'onRemove', type: '() => void', required: true, description: '× を押したときに呼ばれる' },
      ],
    },
    {
      name: 'FileList',
      props: [
        { name: 'children', type: 'ReactNode', required: true, description: 'FileItem。新しいファイルを上に並べる' },
        { name: '...rest', type: "ComponentPropsWithRef<'ul'>", description: 'その他の ul 要素の属性（aria-label など）' },
      ],
    },
  ],
})
