import {assert} from 'chai'
import {createElement} from '../src/createElement'

describe('createElement', () => {
  it('should create a new dom element', () => {
    const el = createElement('div.container.wrapper')
    console.log(el)
    const actual = el.nodeName
    const expected = 'DIV'
    assert.strictEqual(actual, expected)
  })
})