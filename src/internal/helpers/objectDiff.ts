/**
 * Created by tushar on 04/05/18
 */

/**
 * Calculates the diff between two objects
 * @param {Set} curr
 * @param {Set} prev
 * @returns {{add: any[]; del: any[], com: any[]}}
 */
export const objectDiff = <T>(curr: Set<T>, prev: Set<T>) => {
  const add: Array<T> = []
  const del: Array<T> = []
  const com: Array<T> = []

  for (var i of curr) {
    if (prev.has(i)) com.push(i)
    else add.push(i)
  }

  for (var i of prev) {
    if (!curr.has(i)) del.push(i)
  }
  return {add, del, com}
}
