import * as O from 'observable-air'
import {IObserver, IScheduler, ISubscription} from 'observable-air'
import {createElement} from './createElement'
import {Set} from './Set'
import {toNode} from './toNode'

export type Insertable = Node | HTMLElement | string | number
export type ElementWithId = {elm: Insertable; id: number}

class ChildObserver implements O.IObserver<ElementWithId> {
  private dispatched = false
  private readonly elm: HTMLElement
  private set = new Set()
  private elmMap: {[ke: number]: Node} = {}
  constructor(sel: string, private sink: O.IObserver<Insertable>) {
    this.elm = createElement(sel)
  }
  complete(): void {
    this.sink.complete()
  }

  error(err: Error): void {
    this.sink.error(err)
  }

  next(val: ElementWithId): void {
    const child = toNode(val.elm)
    if (this.set.has(val.id)) this.elm.replaceChild(child, this.elm.childNodes[val.id])
    else if (Number.isFinite(this.set.gte(val.id))) this.elm.insertBefore(child, this.elmMap[this.set.gte(val.id)])
    else this.elm.appendChild(child)
    if (this.dispatched === false && this.elm.childNodes.length === 1) {
      this.sink.next(this.elm)
      this.dispatched = true
    }
    this.set = this.set.add(val.id)
    this.elmMap[val.id] = child
  }
}

class HH implements O.IObservable<Insertable> {
  constructor(private sel: string, private data: hData, private children: hChildren) {}
  subscribe(observer: IObserver<Insertable>, scheduler: IScheduler): ISubscription {
    return O.merge(...this.children.map(($, id) => O.map(elm => ({elm, id}), $))).subscribe(
      new ChildObserver(this.sel, observer),
      scheduler
    )
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
