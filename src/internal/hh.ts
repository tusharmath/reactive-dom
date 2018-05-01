import * as O from 'observable-air'
import {CompositeSubscription, IObserver, IScheduler, ISubscription} from 'observable-air'
import {LinkedListNode} from 'observable-air/src/internal/LinkedList'
import {createElement} from './createElement'
import {Set} from './Set'
import {toNode} from './toNode'

export type Insertable = Node | HTMLElement | string | number

class ELMSubscription extends CompositeSubscription {
  private dispatched = false
  private readonly elm: HTMLElement
  private set = new Set()
  private elmMap = new Map<number, Node>()
  constructor(sel: string, private sink: O.IObserver<Insertable>) {
    super()
    this.elm = createElement(sel)
  }

  addChild(elm: Node, id: number) {
    const child = elm
    if (this.set.has(id)) this.elm.replaceChild(child, this.elm.childNodes[id])
    else if (Number.isFinite(this.set.gte(id))) this.elm.insertBefore(child, this.elmMap.get(this.set.gte(id)) as Node)
    else this.elm.appendChild(child)
    this.set = this.set.add(id)
    this.elmMap.set(id, child)
    this.dispatch()
  }

  removeChild(id: number) {
    this.elm.removeChild(this.elmMap.get(id) as Node)
  }

  setAttrs(attrs: {[k: string]: string}) {
    // remove old ones
    for (var i = 0; i < this.elm.attributes.length; i++) {
      const attr = this.elm.attributes.item(i)
      if (!attrs[attr.name]) this.elm.removeAttribute(attr.name)
    }

    // remove old ones
    for (var k in attrs) if (attrs[k] !== this.elm.getAttribute(k)) this.elm.setAttribute(k, attrs[k])
    this.dispatch()
  }

  private dispatch() {
    if (!this.dispatched) {
      this.sink.next(this.elm)
      this.dispatched = true
    }
  }

  remove(d?: LinkedListNode<ISubscription>): number | void {
    super.remove(d)
    if (this.length() === 0 && !this.closed) this.sink.complete()
  }
}

class AttrObserver implements IObserver<{[k: string]: string}> {
  ref?: LinkedListNode<ISubscription>
  constructor(private sink: IObserver<any>, private parent: ELMSubscription) {}
  complete(): void {
    this.parent.setAttrs({})
    this.parent.remove(this.ref)
  }

  error(err: Error): void {
    this.sink.next(err)
  }

  next(val: {[p: string]: string}): void {
    this.parent.setAttrs(val)
  }
}

class ChildObserver implements IObserver<Insertable> {
  ref?: LinkedListNode<ISubscription>
  constructor(private id: number, private parent: ELMSubscription, private sink: IObserver<HTMLElement>) {}

  complete(): void {
    this.parent.removeChild(this.id)
    this.parent.remove(this.ref)
  }

  error(err: Error): void {
    this.sink.error(err)
  }

  next(val: Insertable): void {
    this.parent.addChild(toNode(val), this.id)
  }
}

class HH implements O.IObservable<Insertable> {
  constructor(private sel: string, private data: hData, private children: hChildren) {}
  subscribe(observer: IObserver<Insertable>, scheduler: IScheduler): ISubscription {
    const sub = new ELMSubscription(this.sel, observer)
    const {attrs, props, style, css} = this.data
    if (attrs) {
      const attrO = new AttrObserver(observer, sub)
      attrO.ref = sub.add(attrs.subscribe(attrO, scheduler))
    }
    for (var j = 0; j < this.children.length; j++) {
      const childObserver = new ChildObserver(j, sub, observer)
      childObserver.ref = sub.add(this.children[j].subscribe(childObserver, scheduler))
    }
    return sub
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
  props?: O.IObservable<{[k: string]: any}>
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
