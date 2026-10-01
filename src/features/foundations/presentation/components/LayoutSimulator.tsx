import { SCREEN_MODES, screenModeAt } from '../../domain/designToken'
import { gridSpecOf, layoutGrid } from '../../domain/layoutGrid'
import { useTokenRepository } from '../tokenContext'
import styles from '../pages/FoundationPages.module.css'

/** 目盛りの右端（px）。これより広い画面は、中央寄せの余りが増えるだけで見た目は変わらない */
const SCALE_MAX = 1920
/** 動かせる幅の下限（px） */
const MIN_WIDTH = 320

/** よくある画面幅 */
const PRESETS = [
  { width: 375, label: 'スマートフォン' },
  { width: 768, label: 'タブレット縦' },
  { width: 1024, label: 'タブレット横' },
  { width: 1280, label: 'ノートPC' },
  { width: 1920, label: '大きな画面' },
] as const

const LEGEND = [
  { kind: 'column', label: '列' },
  { kind: 'gutter', label: 'ガター（列の間）' },
  { kind: 'margin', label: '左右の余白' },
  { kind: 'outside', label: '最大幅の外（中央寄せ）' },
] as const

const percent = (value: number, of: number) => `${(value / of) * 100}%`
const formatPx = (value: number) => `${Math.round(value * 10) / 10}px`

type LayoutSimulatorProps = {
  width: number
  onWidthChange: (width: number) => void
}

/**
 * 画面幅を動かして、どのモードになり、列・余白がどう並ぶかを縮小して見せる。
 * 目盛り・スライダー・画面の見本は同じ縮尺（左端 0px 〜 右端 1920px）で、スライダーのつまみの位置が画面の右端になる。
 */
export function LayoutSimulator({ width, onWidthChange }: LayoutSimulatorProps) {
  const repository = useTokenRepository()
  const mode = screenModeAt(width)
  const spec = gridSpecOf(repository, mode.id)
  const grid = layoutGrid(width, spec)
  const firstColumn = grid.areas.findIndex((area) => area.kind === 'column')

  return (
    <div className={styles.simulator}>
      <div className={styles.simulatorHeader}>
        <p className={styles.readout}>
          <span className={styles.readoutWidth}>{width}px</span>
          <span className={styles.readoutMode}>{mode.label}</span>
          <span className={styles.readoutSpec}>
            {spec.columns}列・ガター {formatPx(spec.gutter)}・左右の余白 {formatPx(spec.margin)}・1列{' '}
            {formatPx(grid.columnWidth)}
            {width > spec.contentMax && `（${formatPx(spec.contentMax)} で止めて中央寄せ）`}
          </span>
        </p>
        <div role="group" aria-label="よくある画面幅" className={styles.presets}>
          {PRESETS.map((preset) => (
            <button
              key={preset.width}
              type="button"
              className={styles.preset}
              aria-pressed={width === preset.width}
              onClick={() => onWidthChange(preset.width)}
            >
              {preset.width}px {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.scale} aria-hidden="true">
        <div className={styles.bands}>
          {SCREEN_MODES.map((m, index) => {
            const end = SCREEN_MODES[index + 1]?.minWidth ?? SCALE_MAX
            return (
              <div
                key={m.id}
                className={styles.band}
                data-current={m.id === mode.id || undefined}
                style={{ left: percent(m.minWidth, SCALE_MAX), width: percent(end - m.minWidth, SCALE_MAX) }}
              >
                {m.label}
              </div>
            )
          })}
        </div>
        <div className={styles.ticks}>
          {SCREEN_MODES.slice(1).map((m) => (
            <span key={m.id} className={styles.tick} style={{ left: percent(m.minWidth, SCALE_MAX) }}>
              {m.minWidth}px
            </span>
          ))}
        </div>
      </div>

      <input
        type="range"
        className={styles.slider}
        min={0}
        max={SCALE_MAX}
        value={width}
        aria-label="画面幅"
        aria-valuetext={`${width}px（${mode.label}）`}
        onChange={(event) => onWidthChange(Math.max(MIN_WIDTH,Number(event.target.value)))}
      />

      <div className={styles.scale}>
        <div
          className={styles.screen}
          role="img"
          aria-label={`${width}px の画面に ${spec.columns}列を並べた見本`}
          style={{ width: percent(width, SCALE_MAX) }}
        >
          {grid.areas.map((area, index) => (
            <div
              key={index}
              className={styles.gridArea}
              data-kind={area.kind}
              style={{ left: percent(area.start, width), width: percent(area.width, width) }}
            >
              {area.kind === 'column' && index - firstColumn + 1}
            </div>
          ))}
        </div>
      </div>

      <ul className={styles.legend}>
        {LEGEND.map((item) => (
          <li key={item.kind} className={styles.legendItem}>
            <span className={styles.legendSwatch} data-kind={item.kind} />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
