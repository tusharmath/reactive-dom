import {ReactiveElement} from './hh'

export const toNode = (el: ReactiveElement) =>
  el instanceof Node ? el : document.createTextNode(el.toString())
