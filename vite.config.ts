import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 相対パスで出力し、任意のサブディレクトリに静的配置できるようにする
  base: './',
  resolve: {
    // tsconfig.app.json の paths（@/*）をそのまま解決に使う
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/shared/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
