/**
 * Created by tushar on 29/03/18
 */

import {assert} from 'chai'
import {createTestScheduler, EVENT} from 'observable-air/test'
import {NodeWithId} from '../../src/internal/ChildObserver'
import {html} from '../../src/internal/html'
import {HTMLElementObservable} from '../../src/internal/HTMLElementObservable'
import {node} from '../../src/internal/node'

describe('HTMLElementObservable', () => {
  describe('insertAt$', () => {
    it('should insert elements at the position', () => {
      const SH = createTestScheduler()
      const htmlString210 = `<div>210</div>`
      const htmlString212 = `<div>212</div>`
      const htmlString213 = `<div>213</div>`
      const insertAt$ = SH.Hot<NodeWithId>([
        EVENT.next(210, {id: 0, node: html(htmlString210)}),
        EVENT.next(212, {id: 1, node: html(htmlString212)}),
        EVENT.next(213, {id: 0, node: html(htmlString213)})
      ])
      const view$ = new HTMLElementObservable('div.container', {
        insertAt: insertAt$
      })
      const {results} = SH.start(() => view$)
      const htmlStringOutput = html(
        `<div class="container"><div>213</div><div>210</div><div>212</div></div>`
      )
      assert.deepEqual(results, [EVENT.next(210, htmlStringOutput)])
    })
  })

  describe('append$', () => {
    it('should insert at the end', () => {
      const SH = createTestScheduler()
      const children$ = SH.Hot([
        EVENT.next(210, 'HOME'),
        EVENT.next(212, 'ALONE')
      ])
      const view$ = new HTMLElementObservable('div', {
        append: children$
      })
      const {results} = SH.start(() => view$)
      const htmlStringOutput = html(
        `<div><span>HOME</span><span>ALONE</span></div>`
      )
      assert.deepEqual(results, [EVENT.next(210, htmlStringOutput)])
    })
  })

  describe('attrs$', () => {
    it('should set internal attributes', () => {
      const SH = createTestScheduler()
      const attrs$ = SH.Hot([EVENT.next(204, {href: '/home.html'})])
      const children$ = SH.Hot([EVENT.next(210, 'HOME')])
      const view$ = new HTMLElementObservable('a.link', {
        attrs: attrs$,
        append: children$
      })
      const {results} = SH.start(() => view$)
      const htmlStringOutput = html(
        `<a class="link" href="/home.html"><span>HOME</span></a>`
      )
      assert.deepEqual(results, [EVENT.next(210, htmlStringOutput)])
    })
  })

  describe('style$', () => {
    it('should set style', () => {
      const SH = createTestScheduler()
      const style$ = SH.Hot([EVENT.next(204, {color: 'red'})])
      const children$ = SH.Hot([EVENT.next(210, 'CHILD')])
      const view$ = new HTMLElementObservable('div', {
        style: style$,
        append: children$
      })
      const {results} = SH.start(() => view$)
      const htmlStringOutput = html(
        ` <div style="color: red;"><span>CHILD</span></div>`
      )
      assert.deepEqual(results, [EVENT.next(210, htmlStringOutput)])
    })
  })

  describe('removeAt$', () => {
    it('should remove the element', () => {
      const SH = createTestScheduler()
      const removeAt$ = SH.Hot([EVENT.next(225, 2)])
      const children$ = SH.Hot([
        EVENT.next(210, 'A'),
        EVENT.next(211, 'B'),
        EVENT.next(212, 'C'),
        EVENT.next(213, 'D')
      ])
      const view$ = new HTMLElementObservable('div', {
        append: children$,
        removeAt: removeAt$
      })
      const {results} = SH.start(() => view$)
      const htmlStringOutput = html(
        `<div><span>A</span><span>B</span><span>D</span></div>`
      )
      assert.deepEqual(results, [EVENT.next(210, htmlStringOutput)])
    })
  })

  describe('text$', () => {
    it('should set textContent', () => {
      const SH = createTestScheduler()
      const text$ = SH.Hot([
        EVENT.next(210, 'A'),
        EVENT.next(211, 'B'),
        EVENT.next(212, 'C'),
        EVENT.next(213, 'D')
      ])
      const view$ = new HTMLElementObservable('div', {
        text: text$
      })
      const {results} = SH.start(() => view$)
      const htmlStringOutput = html(`<div>D</div>`)
      assert.deepEqual(results, [EVENT.next(210, htmlStringOutput)])
    })
  })

  describe('props$', () => {
    it('should set internal props', () => {
      const SH = createTestScheduler()
      const props$ = SH.Hot([EVENT.next(210, {fruit: 'grapes'})])
      const view$ = new HTMLElementObservable('div', {
        props: props$,
        text: SH.Hot([EVENT.next(201, 'A')])
      })
      const {results} = SH.start(() => view$)
      const htmlStringOutput = html(`<div>A</div>`) as any
      htmlStringOutput['fruit'] = 'grapes'
      assert.deepEqual(results, [EVENT.next(201, htmlStringOutput)])
      assert.strictEqual(node(results).fruit, 'grapes')
    })
  })

  describe('replaceAt$', () => {
    it('should replace the element at a position', () => {
      const SH = createTestScheduler()
      const replaceAt$ = SH.Hot([EVENT.next(225, {id: 2, node: 'X'})])
      const append$ = SH.Hot([
        EVENT.next(210, 'A'),
        EVENT.next(211, 'B'),
        EVENT.next(212, 'C'),
        EVENT.next(213, 'D')
      ])
      const view$ = new HTMLElementObservable('div', {
        append: append$,
        replaceAt: replaceAt$
      })
      const {results} = SH.start(() => view$)
      const htmlStringOutput = html(
        `<div><span>A</span><span>B</span><span>X</span><span>D</span></div>`
      )
      assert.deepEqual(results, [EVENT.next(210, htmlStringOutput)])
    })
  })
})
