import { isLightColor, referenceOf } from '../../domain/designToken'
import { useTokenRepository } from '../tokenContext'
import styles from '../pages/FoundationPages.module.css'
import { TokenName } from './TokenName'

/** 色見本1つ分（色・トークン名・参照先・値）。白っぽい色だけ、背景と見分けられるよう枠線を付ける */
export function ColorSwatch({ name }: { name: string }) {
  const repository = useTokenRepository()
  const token = repository.get(name)
  const reference = token ? referenceOf(token.value) : undefined
  const value = repository.resolve(name)

  return (
    <li className={styles.swatch}>
      <div
        className={styles.swatchChip}
        data-light={isLightColor(value) || undefined}
        style={{ background: `var(${name})` }}
      />
      <TokenName name={name} className={styles.swatchName} />
      {reference && (
        <span className={styles.swatchReference}>
          → <TokenName name={reference} />
        </span>
      )}
      <span className={styles.swatchValue}>{value}</span>
    </li>
  )
}
