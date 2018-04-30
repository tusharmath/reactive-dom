/**
 * Created by tushar on 30/04/18
 */

import * as assert from 'assert'
import {Set} from '../../src/internal/Set'

describe('Set', () => {
  it('should be able to add number', () => {
    const cont = new Set().add(1).add(2)
    assert.ok(cont.has(1))
  })

  describe('add()', () => {
    it('should return an immutable', () => {
      const a = new Set()
      const b = a.add(1)
      assert.notStrictEqual(a, b)
    })
  })

  describe('has()', () => {
    it('should return false when value does not exist', () => {
      const actual = new Set()
        .add(1)
        .add(5)
        .has(8)
      assert.equal(actual, false)
    })

    it('should return false when value does not exist', () => {
      const actual = new Set()
        .add(1)
        .add(5)
        .has(5)
      assert.equal(actual, true)
    })
  })

  describe('next()', () => {
    it('should return the nearest neigbour', () => {
      const actual = new Set()
        .add(1)
        .add(5)
        .nearest(3)
      assert.equal(actual, 5)
    })

    it('should return the nearest neigbour', () => {
      const actual = new Set()
        .add(1)
        .add(5)
        .nearest(6)
      assert.equal(actual, -Infinity)
    })
  })

  describe('remove()', () => {
    it('should remove the element', () => {
      const actual = new Set()
        .add(1)
        .add(5)
        .remove(5)
        .has(5)
      assert.ok(!actual)
    })

    it('should return an immutable', () => {
      const a = new Set().add(1)
      const b = a.remove(1)
      assert.notStrictEqual(a, b)
    })
  })
})
