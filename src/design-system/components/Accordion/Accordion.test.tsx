import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Accordion, AccordionItem } from './Accordion'

const renderItem = (props: Partial<Parameters<typeof AccordionItem>[0]> = {}) =>
  render(
    <Accordion>
      <AccordionItem title="申し込みに必要なもの" {...props}>
        本人確認書類が必要です。
      </AccordionItem>
    </Accordion>,
  )

const header = () => screen.getByRole('button', { name: '申し込みに必要なもの' })
/** 本文（閉じているときは inert で、読み上げと Tab 移動の対象から外れる） */
const panel = (button = header()) => document.getElementById(button.getAttribute('aria-controls')!)!

describe('AccordionItem', () => {
  it('見出しの中に、本文を開閉するボタンを置く（最初は閉じている）', () => {
    renderItem()

    expect(screen.getByRole('heading', { level: 3, name: '申し込みに必要なもの' })).toContainElement(header())
    expect(header()).toHaveAttribute('aria-expanded', 'false')
    expect(panel()).toHaveAttribute('inert')
  })

  it('見出しを押すと本文が開き、もう一度押すと閉じる', async () => {
    const user = userEvent.setup()
    renderItem()

    await user.click(header())
    expect(header()).toHaveAttribute('aria-expanded', 'true')
    expect(panel()).toHaveRole('region')
    expect(panel()).toHaveAccessibleName('申し込みに必要なもの')
    expect(panel()).toHaveTextContent('本人確認書類が必要です。')
    expect(panel()).not.toHaveAttribute('inert')

    await user.click(header())
    expect(header()).toHaveAttribute('aria-expanded', 'false')
    expect(panel()).toHaveAttribute('inert')
  })

  it('キーボード（Enter・Space）でも開閉できる', async () => {
    const user = userEvent.setup()
    renderItem()

    await user.tab()
    await user.keyboard('{Enter}')
    expect(header()).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard(' ')
    expect(header()).toHaveAttribute('aria-expanded', 'false')
  })

  it('defaultOpen で最初から開いておける', () => {
    renderItem({ defaultOpen: true })

    expect(header()).toHaveAttribute('aria-expanded', 'true')
    expect(panel()).not.toHaveAttribute('inert')
  })

  it('open・onOpenChange で開閉を制御できる', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    function Controlled() {
      const [open, setOpen] = useState(false)
      return (
        <AccordionItem
          title="申し込みに必要なもの"
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            onOpenChange(next)
          }}
        >
          本文
        </AccordionItem>
      )
    }
    render(<Controlled />)

    await user.click(header())

    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(header()).toHaveAttribute('aria-expanded', 'true')
  })

  it('disabled のときは開閉できない（開いていれば開いたまま）', async () => {
    const user = userEvent.setup()
    renderItem({ disabled: true, defaultOpen: true })

    await user.click(header())

    expect(header()).toBeDisabled()
    expect(header()).toHaveAttribute('aria-expanded', 'true')
  })

  it('headingLevel で見出しの階層を変えられる', () => {
    renderItem({ headingLevel: 2 })

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('項目ごとに開閉できる', async () => {
    const user = userEvent.setup()
    render(
      <Accordion>
        <AccordionItem title="1つ目">本文1</AccordionItem>
        <AccordionItem title="2つ目">本文2</AccordionItem>
      </Accordion>,
    )

    await user.click(screen.getByRole('button', { name: '1つ目' }))
    await user.click(screen.getByRole('button', { name: '2つ目' }))

    expect(panel(screen.getByRole('button', { name: '1つ目' }))).not.toHaveAttribute('inert')
    expect(panel(screen.getByRole('button', { name: '2つ目' }))).not.toHaveAttribute('inert')
  })
})
