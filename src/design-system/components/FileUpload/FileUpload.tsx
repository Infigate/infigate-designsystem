import { useId, useRef, useState, type ComponentPropsWithRef, type DragEvent, type ReactNode } from 'react'
import type { FileUploadLayout } from './FileUpload.constants'
import { FileUploadZone } from './FileUpload.parts'

export type FileUploadProps = Omit<
  ComponentPropsWithRef<'input'>,
  // onSelect は input では「文字を選んだとき」のイベントなので外し、ファイルを選んだときの意味で使う
  'type' | 'value' | 'defaultValue' | 'onChange' | 'onSelect' | 'children' | 'disabled' | 'hidden'
> & {
  /** 使える形式と容量（例: PNG・JPG・PDF / 1ファイル 10MB まで）。枠の中に必ず書く */
  hint: ReactNode
  /** ファイルを選んだとき・落としたときに、選ばれたファイルで呼ばれる */
  onSelect: (files: File[]) => void
  /** 見せ方。auto はタッチ操作の端末でモバイルの見せ方（ボタンだけ）にする */
  layout?: FileUploadLayout
}

/**
 * ファイルを選ぶ枠。PC ではドラッグ＆ドロップとボタンの両方、モバイルではボタンだけで選ぶ。
 * アップロードの処理や形式・容量の確かめは持たないので、onSelect で受け取ったファイルを使う側で扱い、
 * 結果は FileList・FileItem で枠の下に並べる。
 * className は枠に付き、そのほかの属性（accept・multiple・name など）は input type="file" に付く。
 */
export function FileUpload({ hint, onSelect, layout = 'auto', className, ref, ...rest }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragover, setDragover] = useState(false)
  // 枠の中の要素に出入りするたびに dragenter・dragleave が起きるので、入った深さを数える
  const dragDepth = useRef(0)
  const hintId = useId()

  const browse = () => inputRef.current?.click()

  function select(list: FileList | null) {
    const files = list ? [...list] : []
    if (files.length === 0) return
    onSelect(rest.multiple ? files : files.slice(0, 1))
  }

  // ファイル以外（文字や画像のリンクなど）を運んできたときは反応しない
  const hasFiles = (event: DragEvent) => event.dataTransfer.types.includes('Files')

  return (
    <>
      <FileUploadZone
        className={className}
        hint={hint}
        hintId={hintId}
        layout={layout}
        dragover={dragover}
        onBrowse={browse}
        // 枠のどこをクリックしても選べるようにする（キーボードでは「ファイルを選択」ボタンで選ぶ）
        onClick={(event) => {
          if (!(event.target as Element).closest('button')) browse()
        }}
        onDragEnter={(event) => {
          if (!hasFiles(event)) return
          event.preventDefault()
          dragDepth.current += 1
          setDragover(true)
        }}
        onDragOver={(event) => {
          if (!hasFiles(event)) return
          // 既定の動き（ブラウザでファイルを開く）を止め、ここで離せることを示す
          event.preventDefault()
          event.dataTransfer.dropEffect = 'copy'
        }}
        onDragLeave={() => {
          dragDepth.current = Math.max(dragDepth.current - 1, 0)
          if (dragDepth.current === 0) setDragover(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          dragDepth.current = 0
          setDragover(false)
          select(event.dataTransfer.files)
        }}
      />
      <input
        {...rest}
        ref={(element) => {
          inputRef.current = element
          // 受け取った ref（関数・オブジェクトのどちらでも）にも input 要素を渡す
          if (typeof ref === 'function') return ref(element)
          if (ref) ref.current = element
        }}
        type="file"
        hidden
        onChange={(event) => {
          select(event.target.files)
          // 同じファイルをもう一度選んでも onChange が起きるよう、選択を空に戻す
          event.target.value = ''
        }}
      />
    </>
  )
}
