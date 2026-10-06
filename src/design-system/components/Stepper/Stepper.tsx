import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import { Icon } from '../Icon'
import type { StepperOrientation, StepperSize, StepStatus } from './Stepper.constants'
import styles from './Stepper.module.css'

export type StepperStep = {
  /** ステップの名前 */
  title: ReactNode
  /** 補足の説明 */
  description?: ReactNode
}

export type StepperProps = Omit<ComponentPropsWithRef<'ol'>, 'children'> & {
  /** ステップ。並べる順に渡す */
  steps: readonly StepperStep[]
  /** 今のステップの番号（1から数える）。前のステップは済み、後ろはまだになる。全部済んだら steps.length + 1 */
  current: number
  /** 並べ方（Figma: Layout）。横並びは等しい幅で分け、縦並びは手順ごとの説明を見せたいときや手順が多いときに使う */
  orientation?: StepperOrientation
  /** 大きさ（Figma: Size）。lg は主要な画面、sm は幅や高さが限られる場所 */
  size?: StepperSize
  /** 名前と説明を出すか。幅が足りないモバイルの横並びでは false にして、丸と線だけにする（名前は読み上げには残す） */
  labels?: boolean
}

const STATUS_LABELS = { done: '完了', current: '現在のステップ', todo: '' } as const satisfies Record<StepStatus, string>

/**
 * 手順の中の今の位置を示すステッパー（Figma: step-circle・step-node・step-block-horizontal・step-block-vertical）。
 * 済んだステップはチェック、今のステップは太い枠、まだのステップは薄い枠で示し、済んだところまでの線をキーカラーにする。
 */
export function Stepper({
  steps,
  current,
  orientation = 'horizontal',
  size = 'lg',
  labels = true,
  className,
  ...rest
}: StepperProps) {
  const statusOf = (index: number): StepStatus => (index + 1 < current ? 'done' : index + 1 === current ? 'current' : 'todo')

  return (
    <ol
      aria-label="手順"
      {...rest}
      className={cx(styles.stepper, className)}
      data-orientation={orientation}
      data-size={size}
      data-labels={labels || undefined}
    >
      {steps.map((step, index) => {
        const status = statusOf(index)
        return (
          <li
            key={index}
            className={styles.step}
            data-status={status}
            // 前のステップが済んでいれば、ここへ来る線もキーカラーにする
            data-reached={index > 0 && statusOf(index - 1) === 'done' ? true : undefined}
            aria-current={status === 'current' ? 'step' : undefined}
          >
            <span className={styles.node} aria-hidden="true">
              <span className={styles.circle}>
                {status === 'done' ? <Icon name="check" size={16} className={styles.check} /> : index + 1}
              </span>
            </span>
            <span className={styles.texts}>
              <span className={styles.title}>
                {step.title}
                {STATUS_LABELS[status] && <span className={styles.visuallyHidden}>{`（${STATUS_LABELS[status]}）`}</span>}
              </span>
              {step.description && <span className={styles.description}>{step.description}</span>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
