import { DocSection } from '@/shared/ui/DocPage/DocPage'
import { toPx } from '../../domain/designToken'
import { TokenName } from '../components/TokenName'
import { useTokenRepository } from '../tokenContext'
import styles from './FoundationPages.module.css'

/** 用途（Figma の説明より） */
const SPACING_USAGES: Record<string, string> = {
  '--spacing-0': '余白なし',
  '--spacing-4': 'アイコンと文字の間',
  '--spacing-8': 'ボタンの上下の余白、関連する要素の間',
  '--spacing-12': 'フォームのラベルと入力欄の間',
  '--spacing-16': 'ボタンの左右の余白、カードの内側',
  '--spacing-20': '小見出しと本文の間',
  '--spacing-24': 'カードの内側（大きめ）、まとまり同士の間',
  '--spacing-32': 'セクション内のブロックの間',
  '--spacing-40': '大きなブロックの間',
  '--spacing-48': 'セクションの間',
  '--spacing-64': 'ページの外側の余白',
}

const SIZE_USAGES: Record<string, string> = {
  '--size-16': '小さいボタン・表の中のアイコン',
  '--size-20': '通常のボタン・フォームのアイコン',
  '--size-24': '単体・ナビゲーションのアイコン',
  '--size-32': 'Small のボタンの高さ',
  '--size-40': 'Medium のボタン・入力欄の高さ',
  '--size-48': 'Large のボタンの高さ',
}

export function SpacingPage() {
  const repository = useTokenRepository()

  return (
    <>
      <DocSection id="spacing-heading" title="Scale">
        <p className={styles.muted}>4の倍数で統一しています。要素の間隔（gap）と内側の余白（padding）に使います。</p>
        <ul className={styles.rows}>
          {repository.findByPrefix('--spacing-').map(({ name }) => (
            <li key={name} className={styles.row}>
              <div className={styles.rowMeta}>
                <TokenName name={name} />
                <span className={styles.muted}>
                  {toPx(repository.resolve(name))}px・{SPACING_USAGES[name]}
                </span>
              </div>
              <div className={styles.bar} style={{ width: `var(${name})` }} />
            </li>
          ))}
        </ul>
      </DocSection>

      <DocSection id="size-heading" title="Size">
        <p className={styles.muted}>部品の高さとアイコンの大きさに使います。</p>
        <ul className={styles.rows}>
          {repository.findByPrefix('--size-').map(({ name }) => (
            <li key={name} className={styles.row}>
              <div className={styles.rowMeta}>
                <TokenName name={name} />
                <span className={styles.muted}>
                  {toPx(repository.resolve(name))}px・{SIZE_USAGES[name]}
                </span>
              </div>
              <div className={styles.square} style={{ width: `var(${name})`, height: `var(${name})` }} />
            </li>
          ))}
        </ul>
      </DocSection>
    </>
  )
}
