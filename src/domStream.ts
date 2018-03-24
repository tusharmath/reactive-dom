import * as O from 'observable-air'
import {IObservable, Observable} from 'observable-air'
import {createElement} from './createElement'

export interface NodeProps {}
export type ReactiveElement = Node | string | number
export type NodeWithId = {node: ReactiveElement; id: number}

const toNode = (el: ReactiveElement) => {
  if (el instanceof Node) return el
  const node = createElement('span')
  node.textContent = el.toString()
  return node
}

const insertNode = (node: Node, child: NodeWithId) => {
  const newChild = toNode(child.node)
  // append before someone
  if (node.childNodes.length > child.id) {
    node.insertBefore(newChild, node.childNodes[child.id])
  } else {
    // default case: append to last
    node.appendChild(newChild)
  }
}

const removeNode = (node: Node, child: NodeWithId) => {
  node.removeChild(node.childNodes[child.id])
}

function updateNodeWithChild(node: Node, child: NodeWithId) {
  if (typeof child.node === 'string') {
    node.childNodes[child.id].textContent = child.node
  } else {
    removeNode(node, child)
    insertNode(node, child)
  }
}

export const domStream = (
  sel: string,
  prop: NodeProps,
  children: Array<IObservable<ReactiveElement>>
) =>
  new Observable((observer, scheduler) => {
    var node: Node
    const childMap: {[key: number]: boolean} = {}
    const childObserver = {
      next: (child: NodeWithId) => {
        if (childMap[child.id]) {
          updateNodeWithChild(node, child)
        } else {
          if (!node) {
            node = createElement(sel)
            insertNode(node, child)
            observer.next(node)
          } else {
            insertNode(node, child)
          }
        }
        childMap[child.id] = true
      },
      complete: () => observer.complete(),
      error: (err: Error) => observer.error(err)
    }
    return O.merge(
      ...children.map((child$, id) => O.map(node => ({id, node}), child$))
    ).subscribe(childObserver, scheduler)
  })
