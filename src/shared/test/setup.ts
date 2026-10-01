import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// globals: false のため Testing Library の自動クリーンアップが効かない。明示的に後始末する
afterEach(() => {
  cleanup()
})

// jsdom は scrollTo を実装していない（ScrollRestoration が呼ぶ）
window.scrollTo = () => {}
