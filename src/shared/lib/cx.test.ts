import { describe, expect, it } from 'vitest'
import { cx } from './cx'

describe('cx', () => {
  it('真値のクラス名だけを連結する', () => {
    expect(cx('a', false, 'b', null, undefined, '', 'c')).toBe('a b c')
  })

  it('引数がなければ空文字を返す', () => {
    expect(cx()).toBe('')
  })
})
