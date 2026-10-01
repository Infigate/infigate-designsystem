import { DocSection } from '@/shared/ui/DocPage/DocPage'
import { toPx } from '../../domain/designToken'
import { TokenName } from '../components/TokenName'
import { useTokenRepository } from '../tokenContext'
import styles from './FoundationPages.module.css'

/** 用途（Figma の説明より） */
const RADIUS_USAGES: Record<string, string> = {
  '--radius-none': '角丸なし',
  '--radius-xs': 'チェックボックス、タグ',
  '--radius-sm': '小さいボタン、ツールチップ',
  '--radius-md': 'ボタン、入力欄（標準）',
  '--radius-lg': 'カード',
  '--radius-xl': 'モーダル',
  '--radius-full': 'バッジ、丸いボタン',
}

export function RadiusPage() {
  const repository = useTokenRepository()

  return (
    <DocSection id="radius-heading" title="Scale">
      <p className={styles.muted}>小さい部品ほど小さい角丸を使います。full は円形です。</p>
      <ul className={styles.radiusGrid}>
        {repository.findByPrefix('--radius-').map(({ name }) => (
          <li key={name} className={styles.radiusItem}>
            <div className={styles.radiusSample} style={{ borderRadius: `var(${name})` }} />
            <div className={styles.rowMeta}>
              <TokenName name={name} />
              <span className={styles.muted}>{toPx(repository.resolve(name))}px</span>
              <span className={styles.muted}>{RADIUS_USAGES[name]}</span>
            </div>
          </li>
        ))}
      </ul>
    </DocSection>
  )
}
