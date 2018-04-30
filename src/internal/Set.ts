/**
 * Created by tushar on 30/04/18
 */

const MAX_NUM = Math.pow(2, 32) - 1

Object.defineProperties(Number.prototype, {
  bin: {
    get() {
      var sign = this < 0 ? '-' : ' '
      var result = Math.abs(this).toString(2)
      while (result.length < 32) {
        result = '0' + result
      }
      return sign + result
    }
  }
})

export class Set {
  constructor(private status = 0) {}

  has(id: number) {
    const a = 1 << id
    return (this.status & a) === a
  }

  add(id: number) {
    return new Set(this.status | (1 << id))
  }

  remove(id: number) {
    const a = -(1 << id) >>> 0
    const b = ~(1 << id) >>> 0
    const c = b & this.status
    return new Set(c)
  }

  nearest(id: number) {
    const a = ((MAX_NUM << id) >>> 0) & this.status
    return Math.log2(-a & a)
  }
}
