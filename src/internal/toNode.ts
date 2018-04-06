import {ReactiveElement} from './ChildObserver'

export const toNode = (el: ReactiveElement) =>
  el instanceof Node ? el : document.createTextNode(el.toString())
