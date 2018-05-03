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

    it('should auto convert non observable children', () => {
      const SH = createTestScheduler()
      const {results} = SH.start(() => h('div', ['Happy Birthday']))
      const expected = [EVENT.next(201, html(`<div>Happy Birthday</div>`))]
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

    /**
     * Empty elements are a genuine use case
     */
    it('should render with no child', () => {
      const SH = createTestScheduler()
      const attr$ = SH.Hot(EVENT.next(201, {href: '/home'}))
      const {results} = SH.start(() => h('a', {attrs: attr$}, []))
      const expected = [EVENT.next(201, html(`<a href="/home"></a>`))]
      assert.deepEqual(results, expected)
    })

    /**
     * If attributes are set via an observable
     * they should also be remove when the observable completes
     */
    it('should remove attrs on completion', () => {
      const SH = createTestScheduler()
      const attr$ = SH.Hot(EVENT.next(201, {href: '/home'}), EVENT.complete(205))
      const {results} = SH.start(() => h('a', {attrs: attr$}, []))
      const expected = [EVENT.next(201, html(`<a></a>`)), EVENT.complete(205)]
      assert.deepEqual(results, expected)
    })
  })
  describe('style', () => {
    it('should set element style', () => {
      const SH = createTestScheduler()
      const color$ = SH.Hot(EVENT.next(205, {color: '#FFF'}))
      const {results} = SH.start(() => h('div', {style: color$}))
      const expected = [EVENT.next(205, html(`<div style="color: rgb(255, 255, 255);"></div>`))]
      assert.deepEqual(results, expected)
    })

    it('should remove old element style', () => {
      const SH = createTestScheduler()
      const style$ = SH.Hot([
        EVENT.next(205, {color: '#FFF', border: '1px solid #000'}),
        EVENT.next(209, {color: '#EEE'})
      ])
      const {results} = SH.start(() => h('div', {style: style$}))
      const expected = [EVENT.next(205, html(`<div style="color: rgb(238, 238, 238);"></div>`))]
      assert.deepEqual(results, expected)
    })

    it('should node as soon as a style is available', () => {
      const SH = createTestScheduler()
      const color$ = SH.Hot(EVENT.next(215, {color: '#FFF'}))
      const {results} = SH.start(() => h('div', {style: color$}))
      const expected = [EVENT.next(215, html(`<div style="color: rgb(255, 255, 255);"></div>`))]
      assert.deepEqual(results, expected)
    })

    it('should remove all styles on completion', () => {
      const SH = createTestScheduler()
      const color$ = SH.Hot(EVENT.next(215, {color: '#FFF'}), EVENT.complete(220))
      const {results} = SH.start(() => h('div', {style: color$}))
      const expected = [EVENT.next(215, html(`<div style=""></div>`)), EVENT.complete(220)]
      assert.deepEqual(results, expected)
    })
  })
  describe('prop', () => {
    it('should set element prop', () => {
      const SH = createTestScheduler()
      const prop = SH.Hot(EVENT.next(205, {someRandomProp: 'someRandomValue'}))
      const elm: any = SH.start(() => h('div', {prop: prop})).results[0]
      assert.equal(elm.value.someRandomProp, 'someRandomValue')
    })

    it('should remove old element prop', () => {
      const SH = createTestScheduler()
      const prop = SH.Hot(
        EVENT.next(205, {someRandomProp: 'someRandomValue'}),
        EVENT.next(210, {someOtherRandomProp: 'someOtherRandomValue'})
      )
      const elm: any = SH.start(() => h('div', {prop: prop})).results[0]
      assert.isUndefined(elm.value.someRandomProp)
      assert.equal(elm.value.someOtherRandomProp, 'someOtherRandomValue')
    })

    it('should node as soon as a prop is available', () => {
      const SH = createTestScheduler()
      const prop = SH.Hot(EVENT.next(215, {someRandomProp: 'someRandomValue'}))
      const time = SH.start(() => h('div', {prop: prop})).results[0].time
      assert.equal(time, 215)
    })

    it('should remove all props on completion', () => {
      const SH = createTestScheduler()
      const prop = SH.Hot(EVENT.next(215, {someRandomProp: 'someRandomValue'}), EVENT.complete(220))
      const elm: any = SH.start(() => h('div', {prop: prop})).results[0]
      assert.isUndefined(elm.value.someRandomProp)
    })
  })
})
