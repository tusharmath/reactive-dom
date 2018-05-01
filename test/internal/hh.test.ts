/**
 * Created by tushar on 29/03/18
 */

import {assert} from 'chai'
import {createTestScheduler, EVENT} from 'observable-air/test'
import {log} from 'util'
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

    it('should remove child on complete', () => {
      const SH = createTestScheduler()
      const a$ = h('span', [SH.Hot('---A')])
      const b$ = h('span', [SH.Hot('--B|')])
      const c$ = h('span', [SH.Hot('-----C')])
      const {results} = SH.start(() => h('div', [a$, b$, c$]))
      const expected = [EVENT.next(202, html(`<div><span>A</span><span>C</span></div>`))]
      assert.deepEqual(results, expected)
    })

    it('should not complete until all children have completed', () => {
      const SH = createTestScheduler()
      const a$ = h('span', [SH.Hot('-A|')])
      const b$ = h('span', [SH.Hot('----B|')])
      const c$ = h('span', [SH.Hot('-------C')])
      const {results} = SH.start(() => h('div', [a$, b$, c$]))
      const expected = [EVENT.next(201, html(`<div><span>C</span></div>`))]
      assert.deepEqual(results, expected)
    })

    it('should complete when all children have completed', () => {
      const SH = createTestScheduler()
      const a$ = h('span', [SH.Hot('-A|')])
      const b$ = h('span', [SH.Hot('----B|')])
      const c$ = h('span', [SH.Hot('-------C|')])
      const {results} = SH.start(() => h('div', [a$, b$, c$]))
      const expected = [EVENT.next(201, html(`<div></div>`)), EVENT.complete(208)]
      assert.deepEqual(results, expected)
    })
  })

  describe('attrs', () => {
    it('should set element attrs', () => {
      const SH = createTestScheduler()
      const attr$ = SH.Hot(EVENT.next(205, {href: '/home'}))
      const {results} = SH.start(() => h('a', {attrs: attr$}, [SH.Hot('-A')]))
      const expected = [EVENT.next(201, html(`<a href="/home">A</a>`))]
      assert.deepEqual(results, expected)
    })

    it('should remove old element attrs', () => {
      const SH = createTestScheduler()
      const attr$ = SH.Hot([EVENT.next(205, {href: '/home', target: '_blank'}), EVENT.next(209, {href: '/profile'})])
      const {results} = SH.start(() => h('a', {attrs: attr$}, [SH.Hot('-A')]))
      const expected = [EVENT.next(201, html(`<a href="/profile">A</a>`))]
      assert.deepEqual(results, expected)
    })

    it('should emit as soon as an attribute is available', () => {
      const SH = createTestScheduler()
      const attr$ = SH.Hot(EVENT.next(201, {href: '/home'}))
      const {results} = SH.start(() => h('a', {attrs: attr$}, [SH.Hot('--------A')]))
      const expected = [EVENT.next(201, html(`<a href="/home">A</a>`))]
      assert.deepEqual(results, expected)
    })
  })
})
