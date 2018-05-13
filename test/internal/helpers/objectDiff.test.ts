/**
 * Created by tushar on 13/05/18
 */

import {assert} from 'chai'
import {objectDiff} from '../../../src/internal/helpers/objectDiff'

describe('objectDiff', () => {
  it('should return common', () => {
    const {add, com, del} = objectDiff(new Set(['a', 'c']), new Set(['a', 'b']))
    assert.deepEqual(com, ['a'])
    assert.deepEqual(del, ['b'])
    assert.deepEqual(add, ['c'])
  })
})