import * as O from 'observable-air'
import {createTestScheduler, EVENT} from 'observable-air/test'
import {HTMLElementObservable} from '../src/HTMLElementObservable'
import {assert} from 'chai'
import {html} from '../src/internal/html'
import {EventStart} from 'observable-air/src/internal/Events'

const node = (results: any[]) => (results[0] ? results[0].value : null)
describe('HTMLElementObservable', () => {
  describe('children', () => {
    it('should attach child HTMLElement', () => {
      const sh = createTestScheduler()
      const {results} = sh.start(
        () => new HTMLElementObservable('div.a', {}, [O.of('A'), O.of('B')])
      )
      const expected = [
        EVENT.next(
          201,
          html(`<div class="a"><span>A</span><span>B</span></div>`)
        ),
        EVENT.complete(201)
      ]
      assert.deepEqual(results, expected)
    })
    it('should maintain child order', () => {
      const sh = createTestScheduler()
      const {results} = sh.subscribeTo(
        () =>
          new HTMLElementObservable('div.a', {}, [
            sh.Hot('---A|'),
            sh.Hot('--B---|')
          ])
      )
      sh.advanceTo(201)
      assert.deepEqual(node(results), null)
      sh.advanceTo(202)
      assert.deepEqual(
        node(results),
        html(`<div class="a"><span>B</span></div>`)
      )
      sh.advanceTo(203)
      assert.deepEqual(
        node(results),
        html(`<div class="a"><span>A</span><span>B</span></div>`)
      )
      sh.advanceTo(2000)
      assert.deepEqual(results, [
        EVENT.next(
          202,
          html(`<div class="a"><span>A</span><span>B</span></div>`)
        ),
        EVENT.complete(206)
      ])
    })
    it('should wait for children before inserting into dom', () => {
      const sh = createTestScheduler()
      const {results} = sh.start(
        () => new HTMLElementObservable('div.a', {}, [sh.Hot('-----A----|')])
      )
      const expected = [
        EVENT.next(205, html(`<div class="a"><span>A</span></div>`)),
        EVENT.complete(210)
      ]
      assert.deepEqual(results, expected)
    })
    it('should update child nodes with time', () => {
      const sh = createTestScheduler()
      const {results} = sh.subscribeTo(
        () => new HTMLElementObservable('div.a', {}, [sh.Hot('--ABC|')])
      )
      sh.advanceTo(201)
      assert.deepEqual(node(results), null)
      sh.advanceTo(202)
      assert.deepEqual(
        node(results),
        html(`<div class="a"><span>A</span></div>`)
      )
      sh.advanceTo(203)
      assert.deepEqual(
        node(results),
        html(`<div class="a"><span>B</span></div>`)
      )
      sh.advanceTo(204)
      assert.deepEqual(
        node(results),
        html(`<div class="a"><span>C</span></div>`)
      )

      sh.advanceTo(205)
      assert.deepEqual(results, [
        EVENT.next(202, html(`<div class="a"><span>C</span></div>`)),
        EVENT.complete(205)
      ])
    })
    it('should update text (string) without create a new span', () => {
      const sh = createTestScheduler()
      const {results} = sh.subscribeTo(
        () => new HTMLElementObservable('div.a', {}, [sh.Hot('--AB|')])
      )
      sh.advanceTo(202)
      const div210 = node(results)
      const span210 = div210.childNodes[0]
      assert.deepEqual(div210, html(`<div class="a"><span>A</span></div>`))

      sh.advanceTo(203)
      const div220 = node(results)
      const span220 = div220.childNodes[0]
      assert.deepEqual(div220, html(`<div class="a"><span>B</span></div>`))

      assert.strictEqual(div210, div220)
      assert.strictEqual(span210, span220)
    })
    it('should update text (number) without create a new span', () => {
      const sh = createTestScheduler()
      const {results} = sh.subscribeTo(
        () =>
          new HTMLElementObservable('div.a', {}, [
            sh.Hot(EVENT.next(202, 1), EVENT.next(203, 2))
          ])
      )
      sh.advanceTo(202)
      const div210 = node(results)
      const span210 = div210.childNodes[0]
      assert.deepEqual(div210, html(`<div class="a"><span>1</span></div>`))

      sh.advanceTo(203)
      const div220 = node(results)
      const span220 = div220.childNodes[0]
      assert.deepEqual(div220, html(`<div class="a"><span>2</span></div>`))

      assert.strictEqual(div210, div220)
      assert.strictEqual(span210, span220)
    })
    it('should create elements with empty string', () => {
      const sh = createTestScheduler()
      const {results} = sh.start(
        () => new HTMLElementObservable('div.wonky', {}, [O.of('')])
      )
      const expected = [
        EVENT.next(201, html(`<div class="wonky"></div>`)),
        EVENT.complete(201)
      ]
      assert.deepEqual(results, expected)
    })
    it('should should delete elements on empty string', () => {
      const sh = createTestScheduler()
      const child$ = sh.Hot(
        EVENT.next(212, html(`<h1><span>Air</span></h1>`)),
        EVENT.next(213, ``),
        EVENT.next(214, html(`<h1><span>No Air</span></h1>`)),
        EVENT.complete(215)
      )
      const {results} = sh.subscribeTo(
        () => new HTMLElementObservable('div.wonky', {}, [child$])
      )

      assert.deepEqual(node(results), null)
      sh.advanceTo(212)
      assert.deepEqual(
        node(results),
        html(`<div class="wonky"><h1><span>Air</span></h1></div>`)
      )

      sh.advanceTo(213)
      assert.deepEqual(node(results), html(`<div class="wonky"></div>`))

      sh.advanceTo(214)
      assert.deepEqual(
        node(results),
        html(`<div class="wonky"><h1><span>No Air</span></h1></div>`)
      )
    })
    it('should reuse the child span')
  })

  it('should create a new HTMLElement', () => {
    const sh = createTestScheduler()
    const {results} = sh.start(
      () => new HTMLElementObservable('div.a', {}, [O.of('XXX')])
    )
    const expected = [
      EVENT.next(201, html(`<div class="a"><span>XXX</span></div>`)),
      EVENT.complete(201)
    ]
    assert.deepEqual(results, expected)
  })

  describe('style$', () => {
    it('should set style$', () => {
      const sh = createTestScheduler()
      const {results} = sh.start(
        () =>
          new HTMLElementObservable(
            'div.a',
            {
              style: O.of({transform: 'translateX(10px)'})
            },
            [O.of('A')]
          )
      )
      const htmlString = `<div class="a" style="transform: translateX(10px);"><span>A</span></div>`
      const expected = [EVENT.next(201, html(htmlString)), EVENT.complete(201)]
      assert.deepEqual(results, expected)
      assert.deepEqual(node(results), html(htmlString))
    })
    it('should unsubscribe from style$', () => {
      const sh = createTestScheduler()
      const style$ = sh.Hot([EVENT.next(2100, {transform: 'translateX(10px)'})])

      sh.start(
        () => new HTMLElementObservable('div.a', {style: style$}, [O.of('A')])
      )
      const actual = style$.subscriptions
      const subscription = <EventStart>style$.subscriptions[0]
      const expected = [
        EVENT.start(201, subscription.subscription),
        EVENT.end(2000, subscription.subscription)
      ]
      assert.deepEqual(actual, expected)
    })
  })
  describe('attrs$', () => {
    it('should set attr$', () => {
      const sh = createTestScheduler()
      const {results} = sh.start(
        () =>
          new HTMLElementObservable(
            'a',
            {
              attrs: O.of({href: '/home.html'})
            },
            [O.of('A')]
          )
      )
      const htmlString = `<a href="/home.html"><span>A</span></a>`
      const expected = [EVENT.next(201, html(htmlString)), EVENT.complete(201)]
      assert.deepEqual(results, expected)
      assert.deepEqual(node(results), html(htmlString))
    })
    it('should unsubscribe from style$', () => {
      const sh = createTestScheduler()
      const attrs$ = sh.Hot(EVENT.next(2010, {href: '/home.html'}))
      sh.start(
        () =>
          new HTMLElementObservable(
            'a',
            {
              attrs: attrs$
            },
            [O.of('A')]
          )
      )
      const actual = attrs$.subscriptions
      const subscription = <EventStart>attrs$.subscriptions[0]
      const expected = [
        EVENT.start(201, subscription.subscription),
        EVENT.end(2000, subscription.subscription)
      ]
      assert.deepEqual(actual, expected)
    })
  })

  describe('props$', () => {
    it('should set props$', () => {
      const sh = createTestScheduler()
      const {results} = sh.start(
        () =>
          new HTMLElementObservable(
            'div',
            {
              props: O.of({isWonky: true})
            },
            [O.of('A')]
          )
      )
      assert.isTrue(node(results).isWonky)
    })
    it('should unsubscribe from style$', () => {
      const sh = createTestScheduler()
      const props$ = sh.Hot([EVENT.next(2100, {})])
      sh.start(
        () => new HTMLElementObservable('div.a', {props: props$}, [O.of('A')])
      )
      const actual = props$.subscriptions
      const subscription = <EventStart>props$.subscriptions[0]
      const expected = [
        EVENT.start(201, subscription.subscription),
        EVENT.end(2000, subscription.subscription)
      ]
      assert.deepEqual(actual, expected)
    })
  })
})
