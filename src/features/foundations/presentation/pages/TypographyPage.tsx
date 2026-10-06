import { DocSection } from '@/shared/ui/DocPage/DocPage'
import { ScrollRegion } from '@/shared/ui/ScrollRegion/ScrollRegion'
import { parseTextStyle, SCREEN_MODES, toPx } from '../../domain/designToken'
import { TokenName } from '../components/TokenName'
import { useTokenRepository } from '../tokenContext'
import styles from './FoundationPages.module.css'

const WEIGHT_NAMES: Record<string, string> = { '400': 'Regular', '500': 'Medium', '700': 'Bold' }

/** テキストスタイルの用途（Figma の説明より） */
const TEXT_STYLE_USAGES: Record<string, string> = {
  '--font-heading-3xl': 'ページのタイトル（h1）',
  '--font-heading-2xl': '大見出し（h1・h2）',
  '--font-heading-xl': 'セクションの見出し（h2・h3）',
  '--font-heading-lg': '小見出し（h3・h4）',
  '--font-heading-md': 'カード内などの小さな見出し（h4・h5）',
  '--font-heading-sm': '最小の見出し（h5・h6）',
  '--font-body-md': '本文',
  '--font-body-sm': '表の中の文字、補足',
  '--font-body-xs': '注釈',
  '--font-label-md': '通常サイズのボタン',
  '--font-label-sm': '小さいボタン、フォームのラベル',
  '--font-link-md': '本文中のリンク',
}

const LINE_HEIGHT_USAGES: Record<string, string> = {
  '--line-height-tight': '見出し・ラベル',
  '--line-height-relaxed': '本文',
}

const TEXT_STYLE_PREFIXES = ['--font-heading-', '--font-body-', '--font-label-', '--font-link-']

export function TypographyPage() {
  const repository = useTokenRepository()
  const px = (name: string, mode: (typeof SCREEN_MODES)[number]['id']) => toPx(repository.resolve(name, mode))
  const textStyles = repository.findAll().filter((t) => TEXT_STYLE_PREFIXES.some((prefix) => t.name.startsWith(prefix)))

  /** 例: 40 / 36 / 32px（Desktop / Tablet / Mobile。変わらなければ 1つ） */
  const sizeSpec = (sizeToken: string) => {
    const sizes = [...SCREEN_MODES].reverse().map((mode) => px(sizeToken, mode.id))
    return new Set(sizes).size === 1 ? `${sizes[0]}px` : `${sizes.join(' / ')}px`
  }

  return (
    <>
      <DocSection id="font-family-heading" title="Font family">
        <p className={styles.muted}>
          <TokenName name="--font-family-sans" />：{repository.resolve('--font-family-sans')}
        </p>
        <ul className={styles.weights}>
          {repository.findByPrefix('--font-weight-').map(({ name }) => {
            const weight = repository.resolve(name)
            return (
              <li key={name} className={styles.weight}>
                <span className={styles.muted}>
                  {WEIGHT_NAMES[weight] ?? weight} {weight}
                </span>
                <TokenName name={name} />
                <span className={styles.weightSample} style={{ fontWeight: `var(${name})` }}>
                  あア亜 Aa 123
                </span>
              </li>
            )
          })}
        </ul>
      </DocSection>

      <DocSection id="text-styles-heading" title="Text styles">
        <p className={styles.muted}>大きさは Desktop / Tablet / Mobile の順。見出しは画面幅で小さくなり、本文以下は変わりません。</p>
        <ul className={styles.rows}>
          {textStyles.map(({ name, value }) => {
            const parts = parseTextStyle(value)
            const weight = parts && repository.resolve(parts.weight)
            const lineHeight = parts && Math.round(Number(repository.resolve(parts.lineHeight)) * 100)
            return (
              <li key={name} className={styles.row}>
                <div className={styles.rowMeta}>
                  <TokenName name={name} />
                  {parts && weight && (
                    <span className={styles.muted}>
                      {sizeSpec(parts.size)}・{WEIGHT_NAMES[weight] ?? weight}・{lineHeight}%
                    </span>
                  )}
                  <span className={styles.muted}>{TEXT_STYLE_USAGES[name]}</span>
                </div>
                <p
                  style={{
                    margin: 0,
                    font: `var(${name})`,
                    textDecoration: name.startsWith('--font-link-') ? 'underline' : undefined,
                  }}
                >
                  {name.startsWith('--font-heading-') ? '洗練された体験を、すべての人に' : 'デザインシステムは、色や文字、余白などのルールをまとめたものです。'}
                </p>
              </li>
            )
          })}
        </ul>
      </DocSection>

      <DocSection id="font-sizes-heading" title="Font sizes">
        <ScrollRegion label="Font sizes の表" className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">トークン</th>
                {SCREEN_MODES.map((mode) => (
                  <th key={mode.id} scope="col">
                    {mode.label}（{mode.range}）
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {repository.findByPrefix('--font-size-').map(({ name }) => (
                <tr key={name}>
                  <th scope="row">
                    <TokenName name={name} />
                  </th>
                  {SCREEN_MODES.map((mode) => (
                    <td key={mode.id}>{px(name, mode.id)}px</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
      </DocSection>

      <DocSection id="line-heights-heading" title="Line heights">
        <ScrollRegion label="Line heights の表" className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">トークン</th>
                <th scope="col">値</th>
                <th scope="col">用途</th>
              </tr>
            </thead>
            <tbody>
              {repository.findByPrefix('--line-height-').map(({ name }) => (
                <tr key={name}>
                  <th scope="row">
                    <TokenName name={name} />
                  </th>
                  <td>{Math.round(Number(repository.resolve(name)) * 100)}%</td>
                  <td>{LINE_HEIGHT_USAGES[name]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
      </DocSection>
    </>
  )
}
