import * as O from 'observable-air'
import {createTestScheduler, EVENT} from 'observable-air/test'
import {domStream} from '../src/domStream'
import {assert} from 'chai'
import {html} from '../src/html'

const node = (results: any[]) => (results[0] ? results[0].value : null)
describe('domStream', () => {
  it('should create a new HTMLElement', () => {
    const sh = createTestScheduler()
    const {results} = sh.start(() => domStream('div.a', {}, [O.of('XXX')]))
    const expected = [
      EVENT.next(202, html(`<div class="a"><span>XXX</span></div>`)),
      EVENT.complete(202)
    ]
    assert.deepEqual(results, expected)
  })

  it('should attach child HTMLElement', () => {
    const sh = createTestScheduler()
    const {results} = sh.start(() =>
      domStream('div.a', {}, [O.of('A'), O.of('B')])
    )
    const expected = [
      EVENT.next(
        202,
        html(`<div class="a"><span>A</span><span>B</span></div>`)
      ),
      EVENT.complete(202)
    ]
    assert.deepEqual(results, expected)
  })

  it('should maintain child order', () => {
    const sh = createTestScheduler()
    const {results} = sh.subscribeTo(
      () => domStream('div.a', {}, [sh.Hot('--A|'), sh.Hot('-B---|')]),
      200,
      2000
    )
    sh.advanceTo(201)
    assert.deepEqual(node(results), null)
    sh.advanceTo(210)
    assert.deepEqual(node(results), html(`<div class="a"><span>B</span></div>`))
    sh.advanceTo(220)
    assert.deepEqual(
      node(results),
      html(`<div class="a"><span>A</span><span>B</span></div>`)
    )
    sh.advanceTo(2000)
    assert.deepEqual(results, [
      EVENT.next(
        210,
        html(`<div class="a"><span>A</span><span>B</span></div>`)
      ),
      EVENT.complete(250)
    ])
  })

  it('should wait for children to emit before inserting into dom', () => {
    const sh = createTestScheduler()
    const {results} = sh.start(() =>
      domStream('div.a', {}, [sh.Hot('-----A----|')])
    )
    const expected = [
      EVENT.next(250, html(`<div class="a"><span>A</span></div>`)),
      EVENT.complete(300)
    ]
    assert.deepEqual(results, expected)
  })

  it('should update child nodes with time', () => {
    const sh = createTestScheduler()
    const {results} = sh.subscribeTo(
      () => domStream('div.a', {}, [sh.Hot('-ABC|')]),
      200,
      2000
    )
    sh.advanceTo(201)
    assert.deepEqual(results, [])

    sh.advanceTo(210)
    assert.deepEqual(results, [
      EVENT.next(210, html(`<div class="a"><span>A</span></div>`))
    ])
    sh.advanceTo(220)
    assert.deepEqual(results, [
      EVENT.next(210, html(`<div class="a"><span>B</span></div>`))
    ])
    sh.advanceTo(230)
    assert.deepEqual(results, [
      EVENT.next(210, html(`<div class="a"><span>C</span></div>`))
    ])
    sh.advanceTo(240)
    assert.deepEqual(results, [
      EVENT.next(210, html(`<div class="a"><span>C</span></div>`)),
      EVENT.complete(240)
    ])
  })

  it('should update text without create a new span', () => {
    const sh = createTestScheduler()
    const {results} = sh.subscribeTo(
      () => domStream('div.a', {}, [sh.Hot('-ABC|')]),
      200,
      2000
    )
    sh.advanceTo(201)
    assert.deepEqual(node(results), null)
    sh.advanceTo(210)
    assert.deepEqual(node(results), html(`<div class="a"><span>A</span></div>`))
    sh.advanceTo(220)
    assert.deepEqual(node(results), html(`<div class="a"><span>B</span></div>`))
    sh.advanceTo(230)
    assert.deepEqual(node(results), html(`<div class="a"><span>C</span></div>`))
    sh.advanceTo(240)
    assert.deepEqual(results, [
      EVENT.next(210, html(`<div class="a"><span>C</span></div>`)),
      EVENT.complete(240)
    ])
  })
})
