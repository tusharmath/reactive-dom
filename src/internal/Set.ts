/**
 * Created by tushar on 30/04/18
 */

const MAX_NUM = Math.pow(2, 32) - 1

/**
 * Set is custom immutable implementation of ES6 Set which is designed for performance.
 * It is limited to 32 elements only. This is reasonable for all practical purposes.
 *
 * — insert complexity = O(1)
 * — remove complexity = O(1)
 * — find complexity   = O(1)
 * — gte complexity    = O(1)
 */
export class Set {
  constructor(private status = 0) {}

  /**
   * Checks if the id exists in the set
   * @param {number} id
   * @returns {boolean}
   */
  has(id: number) {
    const a = 1 << id
    return (this.status & a) === a
  }

  /**
   * Inserts the id into the Set
   * @param {number} id
   * @returns {Set}
   */
  add(id: number) {
    return new Set(this.status | (1 << id))
  }

  /**
   * Removes an id from the set
   * @param {number} id
   * @returns {Set}
   */
  remove(id: number) {
    return new Set((~(1 << id) >>> 0) & this.status)
  }

  /**
   * Lookups for id greater than the given id in the Set
   * @param {number} id
   * @returns {number}
   */
  gte(id: number) {
    const a = ((MAX_NUM << id) >>> 0) & this.status
    return Math.log2(-a & a)
  }
}
