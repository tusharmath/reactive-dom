import {createTestScheduler, EVENT} from 'observable-air/test'
import {h} from '../src/h'
import {assert} from 'chai'
import {html} from '../src/internal/html'
import * as O from 'observable-air'

describe('h', () => {
  it('should create a dom tree', () => {
    const SH = createTestScheduler()
    const view$ = h('div.ab.cd', [h('h1', ['This is a test'])])
    const {results} = SH.start(() => view$)
    const output = html(
      `<div class="ab cd"><h1><span>This is a test</span></h1></div>`
    )
    assert.deepEqual(results, [EVENT.next(201, output), EVENT.complete(201)])
  })

  it('should create a empty tree', () => {
    const SH = createTestScheduler()
    const view$ = h('div.ab.cd')
    const {results} = SH.start(() => view$)
    const output = html(`<div class="ab cd"></div>`)
    assert.deepEqual(results, [EVENT.next(201, output), EVENT.complete(201)])
  })

  it('should create create node with attributes', () => {
    const SH = createTestScheduler()
    const view$ = h('a.link', {
      attrs: {href: '/home.html'},
      style: {color: 'red'}
    })
    const {results} = SH.start(() => view$)
    const output = html(
      `<a class="link" href="/home.html" style="color: red;"></a>`
    )
    assert.deepEqual(results, [EVENT.next(201, output), EVENT.complete(201)])
  })

  it('should attach observable data', () => {
    const SH = createTestScheduler()
    const view$ = h('a.link', {
      attrs: {href: '/home.html'},
      style: O.of({color: 'red'})
    })
    const {results} = SH.start(() => view$)
    const output = html(
      `<a class="link" href="/home.html" style="color: red;"></a>`
    )
    assert.deepEqual(results, [EVENT.next(201, output), EVENT.complete(201)])
  })

  describe('append', () => {
    it('should insert an element at a location', () => {
      const SH = createTestScheduler()
      const append$ = O.delay(10, h('h1', ['X']))
      const view$ = h('div', {append: append$}, [
        h('h1', ['A']),
        h('h1', ['B'])
      ])
      const {results} = SH.subscribeTo(() => view$)
      const output201 = html(
        `<div><h1><span>A</span></h1><h1><span>B</span></h1></div>`
      )
      const output215 = html(
        `<div><h1><span>A</span></h1><h1><span>B</span></h1><h1><span>X</span></h1></div>`
      )
      SH.advanceTo(201)
      assert.deepEqual(results, [
        EVENT.next(201, output201),
        EVENT.complete(201)
      ])

      SH.advanceTo(216)
      assert.deepEqual(results, [
        EVENT.next(201, output215),
        EVENT.complete(201)
      ])
    })
  })
})
