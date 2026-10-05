import { useState } from 'react'
import { defineCatalogEntry, definePlayground, ForcePseudoState } from '@/features/catalog'
import { Button } from '../Button'
import { IconButton } from '../IconButton'
import { Menu } from './Menu'
import styles from './Menu.catalog.module.css'
import { MENU_ALIGNS, type MenuAlign } from './Menu.constants'
import { MenuItem, MenuPanel, MenuSeparator } from './Menu.parts'

/** 「…」ボタンで開く、行ごとの操作のメニュー */
function RowActions({ name, align = 'end', onAction }: { name: string; align?: MenuAlign; onAction: (action: string) => void }) {
  return (
    <Menu align={align} trigger={<IconButton icon="more-horizontal" size="sm" aria-label={`${name}の操作`} />}>
      <MenuItem onSelect={() => onAction('編集')}>編集</MenuItem>
      <MenuItem onSelect={() => onAction('複製')}>複製</MenuItem>
      <MenuItem disabled>アーカイブ</MenuItem>
      <MenuSeparator />
      <MenuItem onSelect={() => onAction('削除')}>削除</MenuItem>
    </Menu>
  )
}

/** 実際に開ける見本。選んだ操作を下に出す */
function Demo({ align }: { align: MenuAlign }) {
  const [last, setLast] = useState<string>()
  return (
    <div className={styles.demo}>
      <div className={styles.row} data-align={align}>
        <span className={styles.name}>採用サイト制作</span>
        <RowActions name="採用サイト制作" align={align} onAction={setLast} />
      </div>
      <p className={styles.note}>選んだ操作: {last ?? '（まだ選んでいません）'}</p>
    </div>
  )
}

const playground = definePlayground({
  controls: [{ type: 'select', name: 'align', options: MENU_ALIGNS, defaultValue: 'end' }],
  render: ({ align }) => <Demo key={align} align={align} />,
  code: ({ align }) =>
    [
      `<Menu${align === 'end' ? '' : ` align="${align}"`} trigger={<IconButton icon="more-horizontal" size="sm" aria-label="採用サイト制作の操作" />}>`,
      '  <MenuItem onSelect={edit}>編集</MenuItem>',
      '  <MenuItem onSelect={duplicate}>複製</MenuItem>',
      '  <MenuItem disabled>アーカイブ</MenuItem>',
      '  <MenuSeparator />',
      '  <MenuItem onSelect={remove}>削除</MenuItem>',
      '</Menu>',
    ].join('\n'),
})

const ROWS = ['基幹システム刷新', '採用サイト制作', '社内研修']

/** 行ごとの操作の見本 */
function RowActionsExample() {
  const [last, setLast] = useState<string>()
  return (
    <div className={styles.demo}>
      <ul className={styles.list}>
        {ROWS.map((name) => (
          <li key={name} className={styles.row} data-align="end">
            <span className={styles.name}>{name}</span>
            <RowActions name={name} onAction={(action) => setLast(`${name}を${action}`)} />
          </li>
        ))}
      </ul>
      <p className={styles.note}>選んだ操作: {last ?? '（まだ選んでいません）'}</p>
    </div>
  )
}

const ORDERS = ['新しい順', '古い順', '名前順'] as const

/** 表示の切り替えの見本。今どれが選ばれているかをチェックで示す */
function SelectionExample() {
  const [order, setOrder] = useState<(typeof ORDERS)[number]>('新しい順')
  return (
    <Menu
      align="start"
      trigger={
        <Button variant="outline" theme="secondary" size="sm" tailIcon="chevron-down">
          並び順：{order}
        </Button>
      }
    >
      {ORDERS.map((option) => (
        <MenuItem key={option} checked={option === order} onSelect={() => setOrder(option)}>
          {option}
        </MenuItem>
      ))}
    </Menu>
  )
}

/**
 * Menu のカタログ定義。
 * Figma: Infigate デザインシステム / Menu（menu・menu-item・menu-separator・使いどころ）
 */
export default defineCatalogEntry({
  name: 'Menu',
  category: 'actions',
  description: 'ボタンを押すと開く操作のメニュー。行やカードごとの操作を「…」ボタンにまとめるときなどに使います。',
  playground,
  variants: [
    {
      name: 'Items',
      description: '削除のような取り消せない操作は、区切り線でよく使う項目から離します。',
      render: () => (
        <div inert>
          <MenuPanel aria-label="項目の見本" className={styles.panel}>
            <MenuItem>Default</MenuItem>
            <ForcePseudoState state={['hover']}>
              <MenuItem>Hover</MenuItem>
            </ForcePseudoState>
            <ForcePseudoState state={['focus', 'focus-visible']}>
              <MenuItem>Focus</MenuItem>
            </ForcePseudoState>
            <MenuItem disabled>Disabled</MenuItem>
            <MenuSeparator />
            <MenuItem checked>Checked</MenuItem>
            <MenuItem checked={false}>Unchecked</MenuItem>
          </MenuPanel>
        </div>
      ),
    },
    {
      name: 'Row actions',
      description: '行ごとの操作は「…」ボタンにまとめ、ボタンの下に右端をそろえて開きます。',
      render: () => <RowActionsExample />,
    },
    {
      name: 'Selection',
      description: '表示の切り替えでは、今選ばれている項目にチェックを付けます。',
      render: () => <SelectionExample />,
    },
  ],
  props: [
    {
      name: 'trigger',
      type: 'ReactElement',
      required: true,
      description: 'メニューを開くボタン（IconButton・Button など）。開閉の状態は読み上げでも伝わる',
    },
    { name: 'children', type: 'ReactNode', required: true, description: 'MenuItem・MenuSeparator' },
    {
      name: 'align',
      type: MENU_ALIGNS.map((a) => `'${a}'`).join(' | '),
      defaultValue: "'end'",
      description: 'ボタンに対する横の位置。end は右端、start は左端をそろえる',
    },
    { name: 'className', type: 'string', description: 'メニュー本体に付くクラス名' },
  ],
  subcomponents: [
    {
      name: 'MenuItem',
      props: [
        { name: 'children', type: 'ReactNode', required: true, description: '項目の文字' },
        { name: 'onSelect', type: '() => void', description: '選んだときに呼ばれる。呼んだあとメニューは閉じる' },
        {
          name: 'checked',
          type: 'boolean',
          description: '選択中のチェック。表示の切り替えなど、今どれが選ばれているかを示すときに指定する',
        },
        { name: 'disabled', type: 'boolean', defaultValue: 'false', description: '選べない状態にする' },
      ],
    },
    {
      name: 'MenuSeparator',
      props: [{ name: '...rest', type: "ComponentPropsWithRef<'div'>", description: 'その他の div 要素の属性' }],
    },
  ],
})
