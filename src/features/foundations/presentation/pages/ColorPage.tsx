import { DocSection, DocSubsection } from '@/shared/ui/DocPage/DocPage'
import { ColorSwatch } from '../components/ColorSwatch'
import { useTokenRepository } from '../tokenContext'
import styles from './FoundationPages.module.css'

/** セマンティックカラーのまとまり（定義順に表示する） */
const SEMANTIC_GROUPS = [
  {
    title: 'Keycolor',
    description: 'キーカラーの10段階。blue を参照し、部品からは blue を直接使いません。',
    match: (name: string) => /^--color-keycolor-\d+$/.test(name),
  },
  {
    title: 'Keycolor roles',
    description: '役割名があるものは、番号ではなくこちらを使います。',
    match: (name: string) => /^--color-keycolor-[a-z]+$/.test(name),
  },
  {
    title: 'Text',
    description: '本文は primary か secondary を使い、tertiary は補助的な文字に限ります。',
    match: (name: string) => name.startsWith('--color-text-'),
  },
  {
    title: 'Link',
    description: 'リンク専用の色。訪問済みはマゼンタにして既読が分かるようにします。',
    match: (name: string) => name.startsWith('--color-link-'),
  },
  {
    title: 'Background',
    description: '白い地色の上に、薄いグレーで区画を作ります。',
    match: (name: string) => name.startsWith('--color-bg-'),
  },
  {
    title: 'Border',
    description: '区切りは subtle、部品の枠は default、強調は strong を使います。',
    match: (name: string) => name.startsWith('--color-border-'),
  },
  {
    title: 'Shadow',
    description: '影の色。エレベーションで使います。',
    match: (name: string) => name.startsWith('--color-shadow-'),
  },
] as const

/** ステータスカラーの種類（Figma: ステータスカラー。使用例の通知バーの文言も Figma のまま） */
const STATUSES = [
  { id: 'success', title: 'Success', message: '保存しました。' },
  { id: 'error', title: 'Error', message: '必須項目が入力されていません。' },
  { id: 'warning', title: 'Warning', message: 'この操作は取り消せません。' },
  { id: 'info', title: 'Info', message: 'メンテナンスを 9/20 に予定しています。' },
] as const

/** プリミティブの色相名（--color-blue-500 → blue。番号のない white・black は mono） */
const hueOf = (name: string) => name.match(/^--color-([a-z]+)-\d+$/)?.[1] ?? 'mono'
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

function SwatchGrid({ names }: { names: readonly string[] }) {
  return (
    <ul className={styles.swatchGrid}>
      {names.map((name) => (
        <ColorSwatch key={name} name={name} />
      ))}
    </ul>
  )
}

export function ColorPage() {
  const tokens = useTokenRepository().findByPrefix('--color-')
  const primitives = tokens.filter((t) => t.source === 'color-primitives.css').map((t) => t.name)
  const semantics = tokens.filter((t) => t.source === 'color-semantics.css').map((t) => t.name)

  // 色相ごとにまとめる（定義順を保つ）
  const hues = new Map<string, string[]>()
  for (const name of primitives) hues.set(hueOf(name), [...(hues.get(hueOf(name)) ?? []), name])

  return (
    <>
      <DocSection id="primitives-heading" title="Primitives">
        {[...hues].map(([hue, names]) => (
          <DocSubsection key={hue} title={capitalize(hue)}>
            <SwatchGrid names={names} />
          </DocSubsection>
        ))}
      </DocSection>

      <DocSection id="semantics-heading" title="Semantics">
        {SEMANTIC_GROUPS.map((group) => (
          <DocSubsection key={group.title} title={group.title} description={group.description}>
            <SwatchGrid names={semantics.filter(group.match)} />
          </DocSubsection>
        ))}
      </DocSection>

      <DocSection id="status-heading" title="Status">
        <p className={styles.muted}>
          状態ごとに bg（背景）・text（文字）・solid（バッジなどの塗り）・on-inverse（濃い面の上で使う色）の4色を組にしています。
        </p>
        {STATUSES.map((status) => (
          <DocSubsection key={status.id} title={status.title}>
            <SwatchGrid names={semantics.filter((name) => name.startsWith(`--color-status-${status.id}-`))} />
          </DocSubsection>
        ))}
        <DocSubsection
          title="Example"
          description="枠線は solid と同じ色にし、solid の上の文字は白（warning だけ濃い文字）にします。"
        >
          <ul className={styles.statusBanners}>
            {STATUSES.map((status) => (
              <li key={status.id} className={styles.statusBanner} data-status={status.id}>
                <span className={styles.statusBadge}>{status.id}</span>
                <span>{status.message}</span>
              </li>
            ))}
          </ul>
        </DocSubsection>
      </DocSection>
    </>
  )
}
