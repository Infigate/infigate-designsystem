import { Children, useState, type ComponentPropsWithRef, type ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import type { AvatarSize } from './Avatar.constants'
import styles from './Avatar.module.css'

export type AvatarProps = Omit<ComponentPropsWithRef<'span'>, 'children'> & {
  /** 写真の URL（Figma: Type=Photo）。無いときや読み込めないときは、人の形の代わりの表示（Figma: Type=Icon）にする */
  src?: string
  /**
   * 写真の説明（読み上げ名）。名前と並べて置くときは省略し、装飾として扱う。
   * アバターだけで人を表すとき（AvatarGroup など）は名前を入れる
   */
  alt?: string
  /** 大きさ（px） */
  size?: AvatarSize
}

/**
 * ユーザーを表す丸い画像（Figma: avatar）。
 * アバターだけでは人を見分けられないため、名前と一緒に表示する。
 */
export function Avatar({ src, alt = '', size = 32, className, ...rest }: AvatarProps) {
  // 読み込めなかった写真の URL。別の URL に変わったら、もう一度写真を試す
  const [failedSrc, setFailedSrc] = useState<string>()
  const showPhoto = Boolean(src) && failedSrc !== src

  return (
    <span
      {...rest}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cx(styles.avatar, className)}
      data-size={size}
    >
      {showPhoto ? (
        <img src={src} alt="" className={styles.photo} onError={() => setFailedSrc(src)} />
      ) : (
        // 写真が使えないときの代わりの表示（Figma: Type=Icon）。頭と体の丸を、下を丸い枠で切って描く
        <svg viewBox="0 0 24 24" className={styles.fallback} focusable="false">
          <circle cx="12" cy="8.16" r="4.08" />
          <circle cx="12" cy="23.52" r="9.12" />
        </svg>
      )}
    </span>
  )
}

export type AvatarGroupProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  /** アバター（Avatar）。人数分を並べる */
  children: ReactNode
  /** 表示するアバターの最大数。超えた分は最後に「+3」のように残りの人数を出す */
  max?: number
  /** 大きさ（px）。中のアバターもこの大きさにそろう */
  size?: AvatarSize
}

/**
 * 複数人のアバターを少しずつ重ねて並べる。
 * 下地と同じ色の枠で境目を作る（下地が白以外のときは --avatar-ring で枠の色を合わせる）。
 */
export function AvatarGroup({ children, max = 4, size = 40, className, ...rest }: AvatarGroupProps) {
  const avatars = Children.toArray(children)
  const restCount = avatars.length - max

  return (
    <div {...rest} role="group" className={cx(styles.group, className)} data-size={size}>
      {avatars.slice(0, max)}
      {restCount > 0 && (
        <span className={cx(styles.avatar, styles.more)} role="img" aria-label={`ほか${restCount}人`}>
          {`+${restCount}`}
        </span>
      )}
    </div>
  )
}
