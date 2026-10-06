import { defineCatalogEntry, definePlayground, ThumbnailLayout } from '@/features/catalog'
import { Icon } from '../Icon'
import { Menu, MenuItem } from '../Menu'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../Table'
import { Avatar, AvatarGroup } from './Avatar'
import styles from './Avatar.catalog.module.css'
import { AVATAR_SIZES } from './Avatar.constants'
import samplePhoto from './sample-photo.jpg'

const SIZE_USES = { 24: '表の行内', 32: 'ヘッダー', 40: '一覧', 64: 'プロフィール' } as const

const MEMBERS = [
  { name: '山田 太郎', photo: true },
  { name: '佐藤 花子', photo: false },
  { name: '鈴木 一郎', photo: true },
]

const playground = definePlayground({
  controls: [
    { type: 'select', name: 'size', options: AVATAR_SIZES.map(String), defaultValue: '40' },
    { type: 'boolean', name: 'photo', defaultValue: true },
  ],
  render: ({ size, photo }) => <Avatar size={Number(size) as (typeof AVATAR_SIZES)[number]} src={photo ? samplePhoto : undefined} />,
  code: ({ size, photo }) => `<Avatar size={${size}}${photo ? ' src={user.photoUrl}' : ''} />`,
})

/**
 * Avatar のカタログ定義。
 * Figma: Infigate デザインシステム / Avatar（avatar）
 */
export default defineCatalogEntry({
  name: 'Avatar',
  category: 'data-display',
  description: 'ユーザーを表す丸い画像。アバターだけでは人を見分けられないため、名前と一緒に表示します。',
  playground,
  // 一覧のカードに出す小さな見本
  thumbnail: () => (
    <ThumbnailLayout>
      <AvatarGroup size={40}>
        <Avatar src={samplePhoto} />
        <Avatar src={samplePhoto} />
        <Avatar src={samplePhoto} />
        <Avatar />
        <Avatar />
        <Avatar />
      </AvatarGroup>
    </ThumbnailLayout>
  ),
  variants: [
    {
      name: 'Sizes',
      description: '写真が無い・読み込めないときは、人の形の表示に切り替わります。',
      render: () => (
        <div className={styles.grid}>
          <span />
          {AVATAR_SIZES.map((size) => (
            <span key={size} className={styles.label}>
              {`${size}（${SIZE_USES[size]}）`}
            </span>
          ))}
          <span className={styles.label}>Photo</span>
          {AVATAR_SIZES.map((size) => (
            <Avatar key={size} size={size} src={samplePhoto} />
          ))}
          <span className={styles.label}>Icon</span>
          {AVATAR_SIZES.map((size) => (
            <Avatar key={size} size={size} />
          ))}
        </div>
      ),
    },
    {
      name: 'Account menu',
      description: 'ヘッダーでは 32px を使い、右に名前と下向きの矢印を並べて、押すとメニューを開きます。',
      render: () => (
        <Menu
          align="end"
          trigger={
            <button type="button" className={styles.account}>
              <Avatar size={32} src={samplePhoto} />
              ユーザー名
              <Icon name="chevron-down" size={16} />
            </button>
          }
        >
          <MenuItem>プロフィール</MenuItem>
          <MenuItem>設定</MenuItem>
          <MenuItem>ログアウト</MenuItem>
        </Menu>
      ),
    },
    {
      name: 'In a table',
      description: '表の中では 24px を使い、名前の左に置きます。行の高さを変えずに済む大きさです。',
      render: () => (
        <Table aria-label="メンバー" className={styles.table}>
          <TableHead>
            <TableRow>
              <TableHeaderCell>名前</TableHeaderCell>
              <TableHeaderCell>役割</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MEMBERS.map((member, index) => (
              <TableRow key={member.name}>
                <TableCell>
                  <span className={styles.person}>
                    <Avatar size={24} src={member.photo ? samplePhoto : undefined} />
                    {member.name}
                  </span>
                </TableCell>
                <TableCell>{index === 0 ? '管理者' : 'メンバー'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ),
    },
    {
      name: 'Group',
      description: '複数人は少しずつ重ねて並べ、4人を超える分は「+3」のように残りの人数で示します。',
      render: () => (
        <AvatarGroup aria-label="参加者 7人">
          <Avatar src={samplePhoto} alt="山田 太郎" />
          <Avatar src={samplePhoto} alt="鈴木 一郎" />
          <Avatar src={samplePhoto} alt="高橋 次郎" />
          <Avatar alt="佐藤 花子" />
          <Avatar alt="田中 三郎" />
          <Avatar alt="伊藤 四郎" />
          <Avatar alt="渡辺 五郎" />
        </AvatarGroup>
      ),
    },
  ],
  props: [
    { name: 'src', type: 'string', description: '写真の URL。無いときや読み込めないときは人の形の表示にする' },
    {
      name: 'alt',
      type: 'string',
      defaultValue: "''",
      description: '写真の説明。名前と並べるときは省略し、アバターだけで人を表すとき（AvatarGroup など）は名前を入れる',
    },
    {
      name: 'size',
      type: AVATAR_SIZES.join(' | '),
      defaultValue: '32',
      description: '大きさ（px）。24 は表の行内、32 はヘッダー、40 は一覧、64 はプロフィール',
    },
    { name: '...rest', type: "ComponentPropsWithRef<'span'>", description: 'その他の span 要素の属性（className など）' },
  ],
  subcomponents: [
    {
      name: 'AvatarGroup',
      props: [
        { name: 'children', type: 'ReactNode', required: true, description: 'アバター（Avatar）。人数分を並べる' },
        { name: 'max', type: 'number', defaultValue: '4', description: '表示する最大数。超えた分は「+3」のように残りの人数を出す' },
        { name: 'size', type: AVATAR_SIZES.join(' | '), defaultValue: '40', description: '大きさ（px）。中のアバターもこの大きさにそろう' },
        { name: 'aria-label', type: 'string', description: 'まとまりの読み上げ名（例: 「参加者 7人」）' },
      ],
    },
  ],
})
