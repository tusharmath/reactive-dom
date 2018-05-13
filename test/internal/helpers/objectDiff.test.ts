/**
 * Created by tushar on 13/05/18
 */

import {assert} from 'chai'
import {objectDiff} from '../../../src/internal/helpers/objectDiff'

describe('objectDiff', () => {
  it('should return common', () => {
    const {com} = objectDiff({a: 1}, {b: 2, a: 20})
    assert.deepEqual(com, ['a'])
  })
})