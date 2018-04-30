/**
 * Created by tushar on 29/03/18
 */

import {assert} from 'chai'
import {createTestScheduler, EVENT} from 'observable-air/test'
import {h} from '../../src/internal/hh'
import {html} from '../../src/internal/html'

describe('HTMLElementObservable', () => {
  describe('children', () => {
    it('should append child to parent', () => {
      const SH = createTestScheduler()
      const text$ = SH.Hot('--A')
      const {results} = SH.start(() => h('div', [text$]))
      assert.deepEqual(results, [EVENT.next(202, html(`<div>A</div>`))])
    })

    it('should update child', () => {
      const SH = createTestScheduler()
      const text$ = SH.Hot('--ABC')
      const {results} = SH.start(() => h('div', [text$]))
      assert.deepEqual(results, [EVENT.next(202, html(`<div>C</div>`))])
    })

    it('should maintain component order', () => {
      const SH = createTestScheduler()
      const a$ = h('span', [SH.Hot('---A')])
      const b$ = h('span', [SH.Hot('--B')])
      const c$ = h('span', [SH.Hot('-----C')])
      const {results} = SH.start(() => h('div', [a$, b$, c$]))
      const expected = [EVENT.next(202, html(`<div><span>A</span><span>B</span><span>C</span></div>`))]
      assert.deepEqual(results, expected)
    })
  })
})
