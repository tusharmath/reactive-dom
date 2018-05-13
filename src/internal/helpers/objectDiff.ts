/**
 * Created by tushar on 04/05/18
 */

/**
 * Calculates the diff between two objects
 * @param curr
 * @param prev
 * @returns {{add: String[]; del: String[], com: String[]}}
 */
export const objectDiff = (curr: any, prev?: any) => {
  const add: Array<string> = []
  const del: Array<string> = []
  const com: Array<string> = []
  if (prev)
    for (let i in prev)
      if (prev.hasOwnProperty(i) && !curr.hasOwnProperty(i)) del.push(i)
      else com.push(i)
  for (let i in curr) if (curr.hasOwnProperty(i) && (!prev || prev[i] !== curr[i])) add.push(i)
  return {add, del, com}
}
