import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Tab, TabList, TabPanel, Tabs, type TabsProps } from './Tabs'

function renderTabs(props: Partial<TabsProps> = {}, { disabledLast = false } = {}) {
  return render(
    <Tabs defaultValue="a" {...props}>
      <TabList aria-label="設定">
        <Tab value="a">概要</Tab>
        <Tab value="b">詳細</Tab>
        <Tab value="c" disabled={disabledLast}>
          履歴
        </Tab>
      </TabList>
      <TabPanel value="a">概要の中身</TabPanel>
      <TabPanel value="b">詳細の中身</TabPanel>
      <TabPanel value="c">履歴の中身</TabPanel>
    </Tabs>,
  )
}

describe('Tabs', () => {
  it('タブとその中身を、選択中のものだけ表示して結び付ける', () => {
    renderTabs()

    const tab = screen.getByRole('tab', { name: '概要' })
    expect(screen.getByRole('tablist', { name: '設定' })).toContainElement(tab)
    expect(tab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: '詳細' })).toHaveAttribute('aria-selected', 'false')

    const panel = screen.getByRole('tabpanel', { name: '概要' })
    expect(panel).toHaveTextContent('概要の中身')
    expect(tab).toHaveAttribute('aria-controls', panel.id)
    expect(screen.queryByText('詳細の中身')).not.toBeVisible()
  })

  it('タブを押すと中身が切り替わり、onValueChange を呼ぶ', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderTabs({ onValueChange })

    await user.click(screen.getByRole('tab', { name: '詳細' }))

    expect(screen.getByRole('tab', { name: '詳細' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: '詳細' })).toBeVisible()
    expect(onValueChange).toHaveBeenCalledWith('b')
  })

  it('Tab キーで入るのは選択中のタブだけで、← → Home End で移って切り替える', async () => {
    const user = userEvent.setup()
    renderTabs()

    await user.tab()
    expect(screen.getByRole('tab', { name: '概要' })).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: '詳細' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: '詳細' })).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{End}')
    expect(screen.getByRole('tab', { name: '履歴' })).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: '概要' })).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('tab', { name: '履歴' })).toHaveFocus()

    await user.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: '概要' })).toHaveFocus()

    // 次の Tab キーではタブの並びを抜けて中身に移る
    await user.tab()
    expect(screen.getByRole('tabpanel')).toHaveFocus()
  })

  it('選べないタブは矢印キーでも飛ばす', async () => {
    const user = userEvent.setup()
    renderTabs({}, { disabledLast: true })

    await user.tab()
    await user.keyboard('{ArrowLeft}')

    expect(screen.getByRole('tab', { name: '履歴' })).toBeDisabled()
    expect(screen.getByRole('tab', { name: '詳細' })).toHaveFocus()
  })

  it('value を指定すると、外から選択中のタブを決められる', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <Tabs value="a" onValueChange={onValueChange}>
        <TabList>
          <Tab value="a">概要</Tab>
          <Tab value="b">詳細</Tab>
        </TabList>
      </Tabs>,
    )

    await user.click(screen.getByRole('tab', { name: '詳細' }))
    expect(onValueChange).toHaveBeenCalledWith('b')
    expect(screen.getByRole('tab', { name: '概要' })).toHaveAttribute('aria-selected', 'true')

    rerender(
      <Tabs value="b" onValueChange={onValueChange}>
        <TabList>
          <Tab value="a">概要</Tab>
          <Tab value="b">詳細</Tab>
        </TabList>
      </Tabs>,
    )
    expect(screen.getByRole('tab', { name: '詳細' })).toHaveAttribute('aria-selected', 'true')
  })
})
