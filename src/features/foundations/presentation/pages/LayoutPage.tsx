import { useState } from 'react'
import { DocSection } from '@/shared/ui/DocPage/DocPage'
import { SCREEN_MODES, screenModeAt, toPx } from '../../domain/designToken'
import { LayoutSimulator } from '../components/LayoutSimulator'
import { TokenName } from '../components/TokenName'
import { useTokenRepository } from '../tokenContext'
import styles from './FoundationPages.module.css'

/** ブレークポイントの表の列（画面幅ごとに値が変わるトークン） */
const COLUMNS = [
  { name: '--breakpoint-min', label: '下限' },
  { name: '--layout-columns', label: '列数' },
  { name: '--layout-gutter', label: 'ガター' },
  { name: '--layout-margin', label: '左右の余白' },
  { name: '--layout-content-max', label: 'コンテンツ最大幅' },
] as const

export function LayoutPage() {
  const repository = useTokenRepository()
  const [width, setWidth] = useState(1280)
  const currentMode = screenModeAt(width)
  const display = (name: string, mode: (typeof SCREEN_MODES)[number]['id']) => {
    const value = repository.resolve(name, mode)
    const px = toPx(value)
    return px === undefined || name === '--layout-columns' ? value : `${px}px`
  }

  return (
    <>
      <DocSection id="breakpoints-heading" title="Breakpoints">
        <p className={styles.muted}>画面幅を3つに分け、文字サイズとレイアウトの値を切り替えます。</p>
        <LayoutSimulator width={width} onWidthChange={setWidth} />
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">モード</th>
                {COLUMNS.map((column) => (
                  <th key={column.name} scope="col">
                    {column.label}
                    <br />
                    <TokenName name={column.name} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCREEN_MODES.map((mode) => (
                <tr key={mode.id} aria-current={mode.id === currentMode.id || undefined}>
                  <th scope="row">
                    {mode.label}（{mode.range}）
                  </th>
                  {COLUMNS.map((column) => (
                    <td key={column.name}>{display(column.name, mode.id)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection id="reading-width-heading" title="Reading width">
        <p className={styles.muted}>
          記事や説明文など1カラムの本文は <TokenName name="--layout-reading-max" />（
          {display('--layout-reading-max', 'mobile')}）で止めます。16px の日本語で1行あたり約45文字です。
        </p>
        <div className={styles.readingStage}>
          <div className={styles.readingMeasure} aria-hidden="true">
            <span>{display('--layout-reading-max', 'mobile')}</span>
          </div>
          <p className={styles.readingSample}>
            1行が長すぎると、行の終わりから次の行の頭へ視線を戻すときに迷いやすくなります。そのため本文は画面の幅いっぱいには広げず、この幅で折り返します。画面が広いときは、右側に余白が残ってもかまいません。
          </p>
        </div>
      </DocSection>
    </>
  )
}
