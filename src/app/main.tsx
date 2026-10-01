import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 書体 Noto Sans JP（可変フォント）。文字範囲ごとに分割されており、使う文字の分だけ読み込まれる
import '@fontsource-variable/noto-sans-jp'
import '@/design-system/tokens/tokens.css'
import './styles/global.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
