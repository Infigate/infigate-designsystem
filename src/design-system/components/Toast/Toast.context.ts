// Fast Refresh を効かせるため、コンポーネント以外の export は ToastProvider.tsx から分離している
import { createContext, useContext, type ReactNode } from 'react'
import type { ToastStatus, ToastVariant } from './Toast.constants'

export type ShowToastOptions = {
  /** 状態 */
  status?: ToastStatus
  /** 見た目 */
  variant?: ToastVariant
  /** 見出し */
  title: ReactNode
  /** 説明（1行まで） */
  description?: ReactNode
  /** 状態のアイコンを出すか */
  icon?: boolean
  /** 閉じるボタンを出すか */
  closable?: boolean
  /** 自動で消えるまでの時間（ミリ秒）。ポインターを乗せている間とフォーカスがある間は止まる */
  duration?: number
}

export type ToastApi = {
  /** トーストを出し、その id を返す */
  showToast: (options: ShowToastOptions) => string
  /** id のトーストを閉じる */
  dismissToast: (id: string) => void
}

export const ToastContext = createContext<ToastApi | null>(null)

/** トーストを出す関数を受け取る。ToastProvider の内側で使う */
export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) {
    throw new Error('useToast は ToastProvider の内側で使ってください')
  }
  return api
}
