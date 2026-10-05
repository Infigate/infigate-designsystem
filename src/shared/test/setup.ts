import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// globals: false のため Testing Library の自動クリーンアップが効かない。明示的に後始末する
afterEach(() => {
  cleanup()
})

// jsdom は scrollTo を実装していない（ScrollRestoration が呼ぶ）
window.scrollTo = () => {}

// jsdom は <dialog> の開閉（showModal・close）を実装していない（Modal が使う）。open 属性の付け外しと close イベントだけを再現する
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.setAttribute('open', '')
}
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  if (!this.hasAttribute('open')) return
  this.removeAttribute('open')
  this.dispatchEvent(new Event('close'))
}
