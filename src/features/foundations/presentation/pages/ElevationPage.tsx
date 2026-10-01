import { DocSection } from '@/shared/ui/DocPage/DocPage'
import { alphaPercent } from '../../domain/designToken'
import { TokenName } from '../components/TokenName'
import { useTokenRepository } from '../tokenContext'
import styles from './FoundationPages.module.css'

/** 用途（Figma の説明より） */
const ELEVATION_USAGES: Record<string, string> = {
  '--elevation-1': 'カード、面を軽く区切りたいところ',
  '--elevation-2': 'ドロップダウン、ポップオーバー、ツールチップ、固定ヘッダー',
  '--elevation-3': 'モーダル、ダイアログ',
}

/** 影1枚ずつの説明。例: 0 1px 2px 0 #21272f1a, 0 2px 6px 0 #21272f0f → ['0 1px 2px（10%）', '0 2px 6px（6%）'] */
function describeShadowLayers(resolved: string): string[] {
  return resolved.split(/,\s*/).map((layer) => {
    const [x, y, blur, , color] = layer.trim().split(/\s+/)
    const alpha = alphaPercent(color ?? '')
    return `${x} ${y} ${blur}${alpha === undefined ? '' : `（${alpha}%）`}`
  })
}

export function ElevationPage() {
  const repository = useTokenRepository()

  return (
    <DocSection id="elevation-heading" title="Levels">
      <p className={styles.muted}>
        影は一時的に浮いているものだけに使い、迷ったら線を使います。
        <TokenName name="--color-shadow-key" /> と <TokenName name="--color-shadow-ambient" /> の2枚重ねです。
      </p>
      <ul className={styles.surface}>
        {repository.findByPrefix('--elevation-').map(({ name }) => (
          <li key={name} className={styles.elevationCard} style={{ boxShadow: `var(${name})` }}>
            <TokenName name={name} />
            {describeShadowLayers(repository.resolve(name)).map((layer, index) => (
              <span key={index} className={styles.muted}>
                {index > 0 && '＋ '}
                {layer}
              </span>
            ))}
            <span className={styles.muted}>{ELEVATION_USAGES[name]}</span>
          </li>
        ))}
      </ul>
    </DocSection>
  )
}
