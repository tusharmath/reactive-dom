/**
 * Created by tushar on 12/05/18
 */

import {assert} from 'chai'
import {RDElement} from '../../src/internal/RDElement'

describe('RDElement', () => {
  describe('patch', () => {
    it('should update attributes', () => {
      const elm = new RDElement({
        sel: 'div.container',
        attrs: {
          data: 'carbon-di-oxide'
        }
      })
      const actual = elm.getElm().outerHTML
      assert.equal(actual, `<div class="container" data="carbon-di-oxide"></div>`)
    })
    it('should update props', () => {
      const elm = new RDElement({
        sel: 'div.container',
        props: {
          id: 'carbon-di-oxide'
        }
      })
      assert.equal(elm.getElm().id, 'carbon-di-oxide')
    })
    it('should update styles', () => {
      const elm = new RDElement({
        sel: 'div.container',
        style: {
          color: 'red'
        }
      })
      const actual = elm.getElm().outerHTML
      assert.equal(actual, `<div class="container" style="color: red;"></div>`)
    })
    it('should add event listeners', () => {
      let count = 0
      const onClick = () => count++
      const elm = new RDElement({
        sel: 'div.container',
        on: {
          click: onClick
        }
      })
      elm.getElm().dispatchEvent(new Event('click'))
      assert.equal(count, 1, 'No event listeners were attached')
    })

    context('already initialized', () => {
      context('and same selector', () => {
        it('should not throw', () => {
          const elm = new RDElement({sel: 'div.whoopy'})
          assert.doesNotThrow(() => elm.patch({sel: 'div.whoopy'}))
        })
      })
      context('diff selector', () => {
        it('should throw', () => {
          const elm = new RDElement({sel: 'div.container'})
          assert.throws(() => elm.patch({sel: 'div.container-2'}), 'Element already initialized')
        })
      })
    })
  })
  describe('addAt()', () => {
    it('should append child', () => {
      const rd = new RDElement({sel: 'ul'})
      rd.addAt({sel: 'li'}, 0)
      const actual = rd.getElm().outerHTML
      const expected = `<ul><li></li></ul>`
      assert.equal(actual, expected)
    })

    it('should maintain order', () => {
      const rd = new RDElement({sel: 'ul'})
      rd.addAt({sel: 'li.__7'}, 7)
      rd.addAt({sel: 'li.__1'}, 1)
      const actual = rd.getElm().outerHTML
      const expected = `<ul><li class="__1"></li><li class="__7"></li></ul>`
      assert.equal(actual, expected)
    })

    context('index is same', () => {
      it('should apply the diff', () => {
        const rd = new RDElement({sel: 'ul'})
        rd.addAt({sel: 'li', style: {color: 'red'}}, 7)
        rd.addAt({sel: 'li', style: {color: 'green'}}, 7)
        const actual = rd.getElm().outerHTML
        const expected = `<ul><li style="color: green;"></li></ul>`
        assert.equal(actual, expected)
      })

      it('should not create a new element', () => {
        const rd = new RDElement({sel: 'ul'})
        rd.addAt({sel: 'li', style: {color: 'red'}}, 7)
        const node0 = rd.getElm().childNodes[0]
        rd.addAt({sel: 'li', style: {color: 'green'}}, 7)
        const node1 = rd.getElm().childNodes[0]
        assert.strictEqual(node0, node1)
      })

      context('selector is diff', () => {
        it('should create a new child', () => {
          const rd = new RDElement({sel: 'ul'})
          rd.addAt({sel: 'li.aaa'}, 7)
          rd.addAt({sel: 'li.bbb'}, 7)
          const actual = rd.getElm().outerHTML
          const expected = `<ul><li class="bbb"></li></ul>`
          assert.equal(actual, expected)
        })

        it('should remove event listeners', () => {
          let count = 0
          const rd = new RDElement({sel: 'ul'})
          const onClick = () => count++
          rd.addAt({sel: 'li.aaa', on: {click: onClick}}, 7)
          const node = rd.getElm().childNodes[0]
          rd.addAt({sel: 'li.bbb'}, 7)
          node.dispatchEvent(new Event('click'))
          assert.equal(count, 0)
        })
      })
    })
  })
  describe('removeAt()', () => {
    it('should remove dom node', () => {
      const rd = new RDElement({sel: 'ul'})
      rd.addAt({sel: 'li.__7'}, 7)
      rd.addAt({sel: 'li.__1'}, 1)
      rd.addAt({sel: 'li.__3'}, 3)
      rd.removeAt(1)
      const actual = rd.getElm().outerHTML
      const expected = `<ul><li class="__3"></li><li class="__7"></li></ul>`
      assert.equal(actual, expected)
    })
    it('should remove listeners from the removed node', () => {
      let count = 0
      const onClick = () => count++
      const rd = new RDElement({sel: 'ul'})
      rd.addAt({sel: 'li.__7', on: {click: onClick}}, 7)
      rd.addAt({sel: 'li.__1', on: {click: onClick}}, 1)
      rd.addAt({sel: 'li.__3', on: {click: onClick}}, 3)
      const node = rd.getElm().childNodes[0]
      rd.removeAt(1)
      node.dispatchEvent(new Event('click'))
      assert.equal(count, 0)
    })
  })
})
