import {ReactiveElement} from '../HTMLElementObservable'
import {createElement} from './createElement'

export const toNode = (el: ReactiveElement) => {
  if (el instanceof Node) return el
  const node = createElement('span')
  node.textContent = el.toString()
  return node
}
