/**
 * src/design-system/components/Icon/svg/ の SVG（Figma から書き出したもの）から icons.generated.ts を生成する。
 * 実行: npm run icons:generate
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildIconsModule } from '../src/design-system/components/Icon/iconSource.ts'

const iconDir = join(import.meta.dirname, '../src/design-system/components/Icon')
const svgDir = join(iconDir, 'svg')

const files = Object.fromEntries(
  readdirSync(svgDir)
    .filter((fileName) => fileName.endsWith('.svg'))
    .sort()
    .map((fileName) => [fileName, readFileSync(join(svgDir, fileName), 'utf8')]),
)

writeFileSync(join(iconDir, 'icons.generated.ts'), buildIconsModule(files))
console.log(`icons.generated.ts を生成しました（SVG ${Object.keys(files).length} ファイル）`)
