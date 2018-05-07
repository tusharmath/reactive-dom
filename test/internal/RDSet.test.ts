/**
 * Created by tushar on 30/04/18
 */

import * as assert from 'assert'
import {RDSet} from '../../src/internal/RDSet'

describe('Set', () => {
  it('should be able to add number', () => {
    const cont = new RDSet().add(1).add(2)
    assert.ok(cont.has(1))
  })

  describe('add()', () => {
    it('should return an immutable', () => {
      const a = new RDSet()
      const b = a.add(1)
      assert.notStrictEqual(a, b)
    })
  })

  describe('has()', () => {
    it('should return false when value does not exist', () => {
      const actual = new RDSet()
        .add(1)
        .add(5)
        .has(8)
      assert.equal(actual, false)
    })

    it('should return true when value does exist', () => {
      const actual = new RDSet()
        .add(1)
        .add(5)
        .has(5)
      assert.equal(actual, true)
    })

    context('beyond 32', () => {
      it('should throw an error', () => {
        assert.throws(() => new RDSet().add(32), 'id should remain between 0-31')
      })

      // TODO: skip until BigInt() support is available on chrome
      it.skip('should handle large numbers', () => {
        const set = new RDSet().add(32)
        assert.equal(set.has(0), false)
      })
    })
  })

  describe('gte()', () => {
    it('should return the gte neighbour', () => {
      const actual = new RDSet()
        .add(1)
        .add(5)
        .gte(3)
      assert.equal(actual, 5)
    })

    it('should return the gte neighbour', () => {
      const actual = new RDSet()
        .add(1)
        .add(5)
        .gte(6)
      assert.equal(actual, -Infinity)
    })
  })

  describe('remove()', () => {
    it('should remove the element', () => {
      const actual = new RDSet()
        .add(1)
        .add(5)
        .remove(5)
        .has(5)
      assert.ok(!actual)
    })

    it('should return an immutable', () => {
      const a = new RDSet().add(1)
      const b = a.remove(1)
      assert.notStrictEqual(a, b)
    })
  })
})
