/**
 * Created by tushar on 04/05/18
 */

/**
 * Calculates the diff between two objects
 * @param curr
 * @param prev
 * @returns {{add: any[]; del: any[]}}
 */
export const objectDiff = (curr: any, prev?: any) => {
  const add = []
  const del = []
  if (prev) for (let i in prev) if (prev.hasOwnProperty(i) && !curr.hasOwnProperty(i)) del.push(i)
  for (let i in curr) if (curr.hasOwnProperty(i) && (!prev || prev[i] !== curr[i])) add.push(i)
  return {add, del}
}
