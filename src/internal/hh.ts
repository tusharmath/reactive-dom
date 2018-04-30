import * as O from 'observable-air'
import {CompositeSubscription, IObserver, IScheduler, ISubscription} from 'observable-air'
import {LinkedListNode} from 'observable-air/src/internal/LinkedList'
import {createElement} from './createElement'
import {Set} from './Set'
import {toNode} from './toNode'

export type Insertable = Node | HTMLElement | string | number

class ElmContainer {
  private dispatched = false
  private readonly elm: HTMLElement
  private set = new Set()
  private elmMap = new Map<number, Node>()
  private expected = 0
  constructor(sel: string, private sink: O.IObserver<Insertable>) {
    this.elm = createElement(sel)
  }

  expect() {
    this.expected++
  }

  attach(elm: Node, id: number) {
    const child = elm
    if (this.set.has(id)) this.elm.replaceChild(child, this.elm.childNodes[id])
    else if (Number.isFinite(this.set.gte(id))) this.elm.insertBefore(child, this.elmMap.get(this.set.gte(id)) as Node)
    else this.elm.appendChild(child)
    if (this.dispatched === false && this.elm.childNodes.length === 1) {
      this.sink.next(this.elm)
      this.dispatched = true
    }
    this.set = this.set.add(id)
    this.elmMap.set(id, child)
  }

  detach(id: number) {
    this.elm.removeChild(this.elmMap.get(id) as Node)
    this.expected--
    if (this.expected === 0) this.sink.complete()
  }
}

class ChildObserver implements IObserver<Insertable> {
  ref?: LinkedListNode<ISubscription>
  constructor(
    private id: number,
    private parent: ElmContainer,
    private sink: IObserver<HTMLElement>,
    private cSub: CompositeSubscription
  ) {
    this.parent.expect()
  }

  complete(): void {
    this.parent.detach(this.id)
    this.cSub.remove(this.ref)
  }

  error(err: Error): void {
    this.sink.error(err)
  }

  next(val: Insertable): void {
    this.parent.attach(toNode(val), this.id)
  }
}

class HH implements O.IObservable<Insertable> {
  constructor(private sel: string, private data: hData, private children: hChildren) {}
  subscribe(observer: IObserver<Insertable>, scheduler: IScheduler): ISubscription {
    const cSub = new O.CompositeSubscription()
    const node = new ElmContainer(this.sel, observer)
    for (var i = 0; i < this.children.length; i++) {
      const childObserver = new ChildObserver(i, node, observer, cSub)
      childObserver.ref = cSub.add(this.children[i].subscribe(childObserver, scheduler))
    }
    return cSub
  }
}

/**
 * hyperscript function
 */
export type hChildren = Array<O.IObservable<Insertable>>
export type hReturnType = O.IObservable<HTMLElement>
export type hData = {
  attrs?: O.IObservable<{[key: string]: string}>
  css?: {[key: string]: O.IObservable<boolean>}
  style?: O.IObservable<{[key in keyof CSSStyleDeclaration]: CSSStyleDeclaration[key]}>
}

export function h(sel: string): hReturnType
export function h(sel: string, data: hData): hReturnType
export function h(sel: string, children: hChildren): hReturnType
export function h(sel: string, data: hData, children: hChildren): hReturnType
export function h(...t: any[]): hReturnType {
  return t.length === 3
    ? new HH(t[0], t[1], t[2])
    : t.length === 2 ? (t[1] instanceof Array ? new HH(t[0], {}, t[1]) : new HH(t[0], t[1], [])) : new HH(t[0], {}, [])
}
