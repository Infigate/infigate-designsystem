// Fast Refresh を効かせるため、コンポーネント以外の export は FileUpload.tsx から分離している

/**
 * 見せ方（Figma: Layout）
 * auto: 端末に合わせる（タッチ操作の端末ではモバイル）
 * desktop: ドラッグ＆ドロップとボタンの両方 / mobile: ドラッグできないのでボタンだけ
 */
export const FILE_UPLOAD_LAYOUTS = ['auto', 'desktop', 'mobile'] as const

export type FileUploadLayout = (typeof FILE_UPLOAD_LAYOUTS)[number]

/** 選んだファイルの状態（Figma: file-item の State） */
export const FILE_ITEM_STATUSES = ['uploading', 'done', 'error'] as const

export type FileItemStatus = (typeof FILE_ITEM_STATUSES)[number]
