import { useState } from 'react'
import { defineCatalogEntry, definePlayground } from '@/features/catalog'
import { Button } from '../Button'
import { Field } from '../Field'
import { TextInput } from '../TextInput'
import { Stepper, type StepperStep } from './Stepper'
import styles from './Stepper.catalog.module.css'
import { STEPPER_ORIENTATIONS, STEPPER_SIZES, type StepperOrientation, type StepperSize } from './Stepper.constants'

const DESCRIPTION = 'ディスクリプションが必要な場合はここに入ります。'

const STEPS: StepperStep[] = [
  { title: 'お客様情報', description: DESCRIPTION },
  { title: 'ご利用プラン', description: DESCRIPTION },
  { title: 'お支払い方法', description: DESCRIPTION },
  { title: '確認', description: DESCRIPTION },
]

const withoutDescription = STEPS.map(({ title }) => ({ title }))

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'orientation', options: STEPPER_ORIENTATIONS, defaultValue: 'horizontal' },
    { type: 'select', name: 'size', options: STEPPER_SIZES, defaultValue: 'lg' },
    { type: 'select', name: 'current', options: ['1', '2', '3', '4', '5'], defaultValue: '2' },
    { type: 'boolean', name: 'description', defaultValue: true },
    { type: 'boolean', name: 'labels', defaultValue: true },
  ],
  render: ({ orientation, size, current, description, labels }) => (
    <div className={orientation === 'horizontal' ? styles.wide : styles.narrow}>
      <Stepper
        steps={description ? STEPS : withoutDescription}
        current={Number(current)}
        orientation={orientation}
        size={size}
        labels={labels}
      />
    </div>
  ),
  code: ({ orientation, size, current, labels }) => {
    const attributes = [
      'steps={steps}',
      `current={${current}}`,
      orientation !== 'horizontal' && `orientation="${orientation}"`,
      size !== 'lg' && `size="${size}"`,
      !labels && 'labels={false}',
    ].filter(Boolean)
    return `<Stepper ${attributes.join(' ')} />`
  },
})

/** 「次へ」「戻る」でステップを進められる、入力画面の見本 */
function Wizard({
  orientation,
  size = 'lg',
  labels = true,
  mobile = false,
}: {
  orientation: StepperOrientation
  size?: StepperSize
  labels?: boolean
  mobile?: boolean
}) {
  const [current, setCurrent] = useState(2)
  const steps = orientation === 'vertical' ? STEPS : withoutDescription
  const step = STEPS[Math.min(current, STEPS.length) - 1]

  return (
    <div className={styles.frame} data-layout={orientation} data-mobile={mobile || undefined}>
      <Stepper steps={steps} current={current} orientation={orientation} size={size} labels={labels} className={styles.steps} />
      <div className={styles.content}>
        <p className={styles.count}>{`${Math.min(current, STEPS.length)} / ${STEPS.length}`}</p>
        <h3 className={styles.heading}>{step.title}</h3>
        <p className={styles.lead}>このステップで何をするかの説明が入ります。</p>
        <Field label="ラベル" mark="required">
          <TextInput placeholder="プレースホルダー" />
        </Field>
        <div className={styles.footer}>
          <Button variant="outline" theme="secondary" disabled={current <= 1} onClick={() => setCurrent((n) => n - 1)}>
            戻る
          </Button>
          <Button disabled={current > STEPS.length} onClick={() => setCurrent((n) => n + 1)}>
            次へ
          </Button>
        </div>
      </div>
    </div>
  )
}

/** 手順の一覧を見せる見本（モバイル・縦並び）。「次へ」で進み、全部済んだら最初に戻せる */
function MobileVerticalList() {
  const [current, setCurrent] = useState(2)
  const finished = current > STEPS.length

  return (
    <div className={styles.frame} data-mobile>
      <Stepper steps={STEPS} current={current} orientation="vertical" size="sm" />
      <Button onClick={() => setCurrent((n) => (finished ? 1 : n + 1))}>{finished ? '最初に戻る' : '次へ'}</Button>
    </div>
  )
}

/**
 * Stepper のカタログ定義。
 * Figma: Infigate デザインシステム / Stepper（step-circle・step-node・step-block-horizontal・step-block-vertical・使用例）
 */
export default defineCatalogEntry({
  name: 'Stepper',
  category: 'navigation',
  description: '手順のどこまで進んだかを示すステッパー。済んだステップはチェック、今のステップは太い枠で示します。',
  playground,
  variants: [
    {
      name: 'Horizontal',
      description: '画面の上に手順を等しい幅で並べ、下に今のステップの内容を置きます。',
      render: () => <Wizard orientation="horizontal" />,
    },
    {
      name: 'Vertical',
      description: 'ステップごとの説明を見せたいときや手順が多いときは、左に手順を縦に並べます。',
      render: () => <Wizard orientation="vertical" />,
    },
    {
      name: 'Mobile',
      description: '幅が足りないときは sm にし、横並びでは名前を出さずに丸と線だけにします（名前は読み上げには残ります）。',
      render: () => (
        <div className={styles.mobiles}>
          <Wizard orientation="horizontal" size="sm" labels={false} mobile />
          <MobileVerticalList />
        </div>
      ),
    },
  ],
  props: [
    {
      name: 'steps',
      type: '{ title: ReactNode; description?: ReactNode }[]',
      required: true,
      description: 'ステップ。並べる順に渡す',
    },
    {
      name: 'current',
      type: 'number',
      required: true,
      description: '今のステップの番号（1から数える）。前は済み、後ろはまだになる。全部済んだら steps.length + 1',
    },
    {
      name: 'orientation',
      type: STEPPER_ORIENTATIONS.map((o) => `'${o}'`).join(' | '),
      defaultValue: "'horizontal'",
      description: '並べ方。横並びは等しい幅で分け、縦並びは説明を見せたいときや手順が多いときに使う',
    },
    {
      name: 'size',
      type: STEPPER_SIZES.map((s) => `'${s}'`).join(' | '),
      defaultValue: "'lg'",
      description: '大きさ。lg は主要な画面、sm は幅や高さが限られる場所',
    },
    {
      name: 'labels',
      type: 'boolean',
      defaultValue: 'true',
      description: '名前と説明を出す。モバイルの横並びでは false にして丸と線だけにする（読み上げには残る）',
    },
    { name: '...rest', type: "ComponentPropsWithRef<'ol'>", description: 'その他の ol 要素の属性（aria-label・className など）' },
  ],
})
