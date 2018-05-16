/**
 * Created by tushar on 12/05/18
 */

import {assert} from 'chai'
import {Patcher} from '../../src/internal/Patcher'

describe('Patcher', () => {
  describe('patch', () => {
    context('already initialized', () => {
      context('and same selector', () => {
        it('should not throw', () => {
          const elm = new Patcher({sel: 'div.whoopy'})
          assert.doesNotThrow(() => elm.patch({sel: 'div.whoopy'}))
        })
      })
      context('diff selector', () => {
        it('should create new elm', () => {
          const elm = new Patcher({sel: 'div.container'})
          const node0 = elm.getElm()
          elm.patch({sel: 'div.container-2'})
          const node1 = elm.getElm()
          const actual = elm.getElm().outerHTML
          const expected = `<div class="container-2"></div>`
          assert.equal(actual, expected)
          assert.notEqual(node0, node1)
        })

        it('should dispose the old elm', () => {
          let count = 0
          const onClick = () => count++
          const elm = new Patcher({
            sel: 'div.container',
            on: {click: onClick}
          })
          const node = elm.getElm()
          elm.patch({sel: 'div.container-2'})
          node.dispatchEvent(new CustomEvent('click'))
          assert.equal(count, 0, 'Event listener was not removed')
        })
      })
    })
    context('index is same', () => {
      it('should apply the diff', () => {
        const rd = new Patcher({sel: 'ul'})
        rd.patch({sel: 'ul', children: [{sel: 'li', style: {color: 'red'}}]})
        rd.patch({sel: 'ul', children: [{sel: 'li', style: {color: 'green'}}]})
        const actual = rd.getElm().outerHTML
        const expected = `<ul><li style="color: green;"></li></ul>`
        assert.equal(actual, expected)
      })

      it('should not create a new element', () => {
        const rd = new Patcher({sel: 'ul'})
        rd.patch({sel: 'ul', children: [{sel: 'li', style: {color: 'red'}}]})
        const node0 = rd.getElm().childNodes[0]
        rd.patch({sel: 'ul', children: [{sel: 'li', style: {color: 'green'}}]})
        const node1 = rd.getElm().childNodes[0]
        assert.strictEqual(node0, node1)
      })

      context('selector is diff', () => {
        it('should create a new child', () => {
          const rd = new Patcher({sel: 'ul'})
          rd.patch({sel: 'ul', children: [{sel: 'li.aaa'}]})
          rd.patch({sel: 'ul', children: [{sel: 'li.bbb'}]})
          const actual = rd.getElm().outerHTML
          const expected = `<ul><li class="bbb"></li></ul>`
          assert.equal(actual, expected)
        })

        it('should remove event listeners', () => {
          let count = 0
          const rd = new Patcher({sel: 'ul'})
          const onClick = () => count++
          rd.patch({
            sel: 'ul',
            children: [{sel: 'li.aaa', on: {click: onClick}}]
          })
          const node = rd.getElm().childNodes[0]
          rd.patch({sel: 'ul', children: [{sel: 'li.aaa'}, {sel: 'li.bbb'}]})
          node.dispatchEvent(new Event('click'))
          assert.equal(count, 0)
        })
      })
    })
    describe('on', () => {
      it('should add event listeners', () => {
        let count = 0
        const onClick = () => count++
        const elm = new Patcher({
          sel: 'div.container',
          on: {
            click: onClick
          }
        })
        elm.getElm().dispatchEvent(new Event('click'))
        assert.equal(count, 1, 'No event listeners were attached')
      })
      it('should remove listeners from the removed node', () => {
        let count = 0
        const onClick = () => count++
        const rd = new Patcher({sel: 'ul'})
        rd.patch({
          sel: 'ul',
          children: [
            {sel: 'li.__1', on: {click: onClick}},
            {sel: 'li.__2', on: {click: onClick}}
          ]
        })
        const node = rd.getElm().childNodes[1]
        rd.patch({sel: 'ul', children: [{sel: 'li.__1', on: {click: onClick}}]})
        node.dispatchEvent(new Event('click'))
        assert.equal(count, 0)
      })
    })
    describe('style', () => {
      it('should update styles', () => {
        const elm = new Patcher({
          sel: 'div.container',
          style: {
            color: 'red'
          }
        })
        const actual = elm.getElm().outerHTML
        assert.equal(
          actual,
          `<div class="container" style="color: red;"></div>`
        )
      })

      context('style key is removed', () => {
        it('should remove the styles from dom elm', () => {
          const elm = new Patcher({sel: 'div.whoopy', style: {color: 'red'}})
          elm.patch({sel: 'div.whoopy'})
          const actual = elm.getElm().outerHTML
          const expected = `<div class="whoopy" style=""></div>`
          assert.equal(actual, expected)
        })
      })
    })
    describe('attrs', () => {
      it('should update attributes', () => {
        const elm = new Patcher({
          sel: 'div.container',
          attrs: {
            data: 'carbon-di-oxide'
          }
        })
        const actual = elm.getElm().outerHTML
        assert.equal(
          actual,
          `<div class="container" data="carbon-di-oxide"></div>`
        )
      })

      context('attrs key is removed', () => {
        it('should remove the attrs from dom elm', () => {
          const elm = new Patcher({sel: 'a', attrs: {href: '/a'}})
          elm.patch({sel: 'a'})
          const actual = elm.getElm().outerHTML
          const expected = `<a></a>`
          assert.equal(actual, expected)
        })
      })
    })
    describe('props', () => {
      it('should update props', () => {
        const elm = new Patcher({
          sel: 'div.container',
          props: {
            id: 'carbon-di-oxide'
          }
        })
        assert.equal(elm.getElm().id, 'carbon-di-oxide')
      })

      context('props key is removed', () => {
        it('should remove the props from dom elm', () => {
          const elm: any = new Patcher({sel: 'h1', props: {asd: 'ALPHA'}})
          assert.ok(elm.getElm().asd)
          elm.patch({sel: 'h1'})
          const actual = elm.getElm().asd
          assert.isUndefined(actual)
        })
      })
    })
    describe('children', () => {
      it('should update children', () => {
        const elm = new Patcher({
          sel: 'ul.nav',
          children: [{sel: 'li'}, {sel: 'li.active'}, {sel: 'li'}]
        })
        const actual = elm.getElm().outerHTML
        const expected = `<ul class="nav"><li></li><li class="active"></li><li></li></ul>`
        assert.equal(actual, expected)
      })
      it('should append child', () => {
        const rd = new Patcher({sel: 'ul'})
        rd.patch({sel: 'ul', children: [{sel: 'li.__0', key: '0'}]})
        rd.patch({
          sel: 'ul',
          children: [{sel: 'li.__0', key: '0'}, {sel: 'li.__1', key: '1'}]
        })
        const actual = rd.getElm().outerHTML
        const expected = `<ul><li class="__0"></li><li class="__1"></li></ul>`
        assert.equal(actual, expected)
      })
      it('should maintain order', () => {
        const rd = new Patcher({sel: 'ul'})
        rd.patch({sel: 'ul', children: [{sel: 'li.__7'}]})
        rd.patch({sel: 'ul', children: [{sel: 'li.__1'}, {sel: 'li.__7'}]})
        const actual = rd.getElm().outerHTML
        const expected = `<ul><li class="__1"></li><li class="__7"></li></ul>`
        assert.equal(actual, expected)
      })
      it('should remove dom node', () => {
        const rd = new Patcher({sel: 'ul'})
        rd.patch({sel: 'ul', children: [{sel: 'li.__7'}]})
        rd.patch({sel: 'ul', children: [{sel: 'li.__1'}, {sel: 'li.__7'}]})
        rd.patch({
          sel: 'ul',
          children: [{sel: 'li.__1'}, {sel: 'li.__3'}, {sel: 'li.__7'}]
        })
        rd.patch({sel: 'ul', children: [{sel: 'li.__3'}, {sel: 'li.__7'}]})
        const actual = rd.getElm().outerHTML
        const expected = `<ul><li class="__3"></li><li class="__7"></li></ul>`
        assert.equal(actual, expected)
      })
      it('should set internal text', () => {
        const elm = new Patcher({
          sel: 'div',
          children: ['APPLE']
        })
        const actual = elm.getElm().outerHTML
        const expected = `<div>APPLE</div>`
        assert.equal(actual, expected)
      })
      it('should update internal text', () => {
        const elm = new Patcher({
          sel: 'div',
          children: ['A']
        })
        elm.patch({
          sel: 'div',
          children: ['B']
        })
        const actual = elm.getElm().outerHTML
        const expected = `<div>B</div>`
        assert.equal(actual, expected)
      })

      context('elements swapped', () => {
        it.skip('should not recreate dom nodes', () => {
          const rd = new Patcher({
            sel: 'ul',
            children: [
              {sel: 'li.__0', key: '0'},
              {sel: 'li.__1', key: '1'},
              {sel: 'li.__2', key: '2'}
            ]
          })
          // const node0 = rd.getElm().childNodes[2]
          rd.patch({
            sel: 'ul',
            children: [
              {sel: 'li.__2', key: '2'},
              {sel: 'li.__1', key: '1'},
              {sel: 'li.__0', key: '0'}
            ]
          })
          const actual = rd.getElm().outerHTML
          const expected = `<ul><li class="__2"></li><li class="__1"></li><li class="__0"></li></ul>`
          // console.log(actual)
          assert.equal(actual, expected)
          // const node1 = rd.getElm().childNodes[3]
          // assert.strictEqual(node0, node1)
        })
      })

      context('element removed', () => {
        it('should not recreate dom nodes', () => {
          const rd = new Patcher({
            sel: 'ul',
            children: [
              {sel: 'li.__0', key: '0'},
              {sel: 'li.__1', key: '1'},
              {sel: 'li.__2', key: '2'}
            ]
          })
          const [node00, _0, node02] = rd.getElm().childNodes
          rd.patch({
            sel: 'ul',
            children: [{sel: 'li.__0', key: '0'}, {sel: 'li.__2', key: '2'}]
          })
          const [node10, node11] = rd.getElm().childNodes
          assert.strictEqual(node00, node10)
          assert.strictEqual(node02, node11)
        })
      })
      context('element added', () => {
        it('should insert in between', () => {
          const rd = new Patcher({
            sel: 'ul',
            children: [{sel: 'li.__0', key: '0'}, {sel: 'li.__2', key: '2'}]
          })
          rd.patch({
            sel: 'ul',
            children: [
              {sel: 'li.__0', key: '0'},
              {sel: 'li.__1', key: '1'},
              {sel: 'li.__2', key: '2'}
            ]
          })
          const actual = rd.getElm().outerHTML
          const expected = `<ul><li class="__0"></li><li class="__1"></li><li class="__2"></li></ul>`
          assert.equal(actual, expected)
        })

        it('should not update existing node', () => {
          const rd = new Patcher({
            sel: 'ul',
            children: [{sel: 'li.__0', key: '0'}, {sel: 'li.__2', key: '2'}]
          })
          const [node00, node01] = rd.getElm().childNodes
          rd.patch({
            sel: 'ul',
            children: [
              {sel: 'li.__0', key: '0'},
              {sel: 'li.__1', key: '1'},
              {sel: 'li.__2', key: '2'}
            ]
          })
          const [node10, node11, node12] = rd.getElm().childNodes
          assert.strictEqual(node00, node10)
          assert.strictEqual(node01, node12)
        })
      })
    })
  })
})
