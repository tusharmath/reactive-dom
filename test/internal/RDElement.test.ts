/**
 * Created by tushar on 12/05/18
 */

import {assert} from 'chai'
import {RDElement} from '../../src/internal/RDElement'

describe('RDElement', () => {
  describe('patch', () => {
    it('should update attributes', () => {
      const elm = new RDElement()
      elm.patch({
        sel: 'div.container',
        attrs: {
          data: 'carbon-di-oxide'
        }
      })
      const actual = elm.getElm().outerHTML
      assert.equal(actual, `<div class="container" data="carbon-di-oxide"></div>`)
    })
    it('should update props', () => {
      const elm = new RDElement()
      elm.patch({
        sel: 'div.container',
        props: {
          id: 'carbon-di-oxide'
        }
      })
      assert.equal(elm.getElm().id, 'carbon-di-oxide')
    })

    it('should update styles', () => {
      const elm = new RDElement()
      elm.patch({
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
      const elm = new RDElement()
      elm.patch({
        sel: 'div.container',
        on: {
          click: onClick
        }
      })
      elm.getElm().dispatchEvent(new Event('click'))
      assert.equal(count, 1, 'No event listeners were attached')
    })
  })
})
