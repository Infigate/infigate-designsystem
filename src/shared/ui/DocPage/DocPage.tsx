import type { ReactNode } from 'react'
import styles from './DocPage.module.css'

/**
 * ドキュメントページの共通レイアウト（部品カタログ・基本デザインで共用し、見た目を揃える）。
 *   <DocPage>
 *     <DocHeader eyebrow="アクション" title="Button" description="…" />
 *     <DocSection id="examples-heading" title="Examples">…</DocSection>
 *   </DocPage>
 */
export function DocPage({ children }: { children: ReactNode }) {
  return <article className={styles.page}>{children}</article>
}

type DocHeaderProps = {
  /** タイトルの上に小さく出す分類（例: カテゴリ名） */
  eyebrow?: string
  title: string
  description?: ReactNode
}

export function DocHeader({ eyebrow, title, description }: DocHeaderProps) {
  return (
    <header className={styles.header}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
    </header>
  )
}

type DocSectionProps = {
  /** 見出しの id（section の aria-labelledby に使う） */
  id: string
  title: string
  children: ReactNode
}

export function DocSection({ id, title, children }: DocSectionProps) {
  return (
    <section aria-labelledby={id} className={styles.section}>
      <h2 id={id} className={styles.sectionTitle}>
        {title}
      </h2>
      {children}
    </section>
  )
}

type DocSubsectionProps = {
  title: string
  description?: ReactNode
  children: ReactNode
}

/** セクション内の小見出しのまとまり（見出し・1文の説明・中身） */
export function DocSubsection({ title, description, children }: DocSubsectionProps) {
  return (
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>{title}</h3>
      {description && <p className={styles.subsectionDescription}>{description}</p>}
      {children}
    </div>
  )
}
