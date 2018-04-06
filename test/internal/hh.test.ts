/**
 * Created by tushar on 29/03/18
 */

import {assert} from 'chai'
import {createTestScheduler, EVENT} from 'observable-air/test'
import {hh, NodeWithId} from '../../src/internal/hh'
import {html} from '../../src/internal/html'
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
      const view$ = hh('div.container', {
        insertAt: insertAt$
      })
      const {results} = SH.start(() => view$)
      const htmlStringOutput = html(
        `<div class="container"><div>213</div><div>210</div><div>212</div></div>`
      )
      assert.deepEqual(results, [EVENT.next(200, htmlStringOutput)])
    })
  })

  describe('append$', () => {
    it('should insert at the end', () => {
      const SH = createTestScheduler()
      const children$ = SH.Hot([
        EVENT.next(210, html('<span>HOME</span>')),
        EVENT.next(212, html('<span>ALONE</span>'))
      ])
      const view$ = hh('div', {
        append: children$
      })
      const {results} = SH.start(() => view$)
      const htmlStringOutput = html(
        `<div><span>HOME</span><span>ALONE</span></div>`
      )
      assert.deepEqual(results, [EVENT.next(200, htmlStringOutput)])
    })

    it('should insert [input] elements without waiting', () => {
      const SH = createTestScheduler()
      const view$ = hh('input', {})
      const {results} = SH.start(() => view$)
      const htmlStringOutput = html(`<input/>`)
      assert.deepEqual(results, [EVENT.next(200, htmlStringOutput)])
    })
  })

  describe('attrs$', () => {
    it('should set internal attributes', () => {
      const SH = createTestScheduler()
      const attrs$ = SH.Hot([EVENT.next(204, {href: '/home.html'})])
      const children$ = SH.Hot([EVENT.next(210, 'HOME')])
      const view$ = hh('a.link', {
        attrs: attrs$,
        append: children$
      })
      const {results} = SH.start(() => view$)
      const htmlStringOutput = html(
        `<a class="link" href="/home.html">HOME</a>`
      )
      assert.deepEqual(results, [EVENT.next(200, htmlStringOutput)])
    })
  })

  describe('style$', () => {
    it('should set style', () => {
      const SH = createTestScheduler()
      const style$ = SH.Hot([EVENT.next(204, {color: 'red'})])
      const children$ = SH.Hot([EVENT.next(210, 'CHILD')])
      const view$ = hh('div', {
        style: style$,
        append: children$
      })
      const {results} = SH.start(() => view$)
      const htmlStringOutput = html(` <div style="color: red;">CHILD</div>`)
      assert.deepEqual(results, [EVENT.next(200, htmlStringOutput)])
    })
  })

  describe('removeAt$', () => {
    it('should remove the element', () => {
      const SH = createTestScheduler()
      const removeAt$ = SH.Hot([EVENT.next(225, 2)])
      const children$ = SH.Hot([
        EVENT.next(210, html('<span>A</span>')),
        EVENT.next(211, html('<span>B</span>')),
        EVENT.next(212, html('<span>C</span>')),
        EVENT.next(213, html('<span>D</span>'))
      ])
      const view$ = hh('div', {
        append: children$,
        removeAt: removeAt$
      })
      const {results} = SH.start(() => view$)
      const htmlStringOutput = html(
        `<div><span>A</span><span>B</span><span>D</span></div>`
      )
      assert.deepEqual(results, [EVENT.next(200, htmlStringOutput)])
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
      const view$ = hh('div', {
        text: text$
      })
      const {results} = SH.start(() => view$)
      const htmlStringOutput = html(`<div>D</div>`)
      assert.deepEqual(results, [EVENT.next(200, htmlStringOutput)])
    })
  })

  describe('props$', () => {
    it('should set internal props', () => {
      const SH = createTestScheduler()
      const props$ = SH.Hot([EVENT.next(210, {fruit: 'grapes'})])
      const view$ = hh('div', {
        props: props$,
        text: SH.Hot([EVENT.next(201, 'A')])
      })
      const {results} = SH.start(() => view$)
      const htmlStringOutput = html(`<div>A</div>`) as any
      htmlStringOutput['fruit'] = 'grapes'
      assert.deepEqual(results, [EVENT.next(200, htmlStringOutput)])
      assert.strictEqual(node(results).fruit, 'grapes')
    })
  })

  describe('replaceAt$', () => {
    it('should replace the element at a position', () => {
      const SH = createTestScheduler()
      const replaceAt$ = SH.Hot([
        EVENT.next(225, {id: 2, node: html('<span>X</span>')})
      ])
      const append$ = SH.Hot([
        EVENT.next(210, html('<span>A</span>')),
        EVENT.next(211, html('<span>B</span>')),
        EVENT.next(212, html('<span>C</span>')),
        EVENT.next(213, html('<span>D</span>'))
      ])
      const view$ = hh('div', {
        append: append$,
        replaceAt: replaceAt$
      })
      const {results} = SH.start(() => view$)
      const htmlStringOutput = html(
        `<div><span>A</span><span>B</span><span>X</span><span>D</span></div>`
      )
      assert.deepEqual(results, [EVENT.next(200, htmlStringOutput)])
    })
  })
})
