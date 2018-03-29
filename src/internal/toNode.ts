import {createElement} from './createElement'
import {ReactiveElement} from './HTMLElementObservable'

export const toNode = (el: ReactiveElement) => {
  if (el instanceof Node) return el
  const node = createElement('span')
  node.textContent = el.toString()
  return node
}
