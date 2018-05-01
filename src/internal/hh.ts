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

  hold() {
    this.expected++
  }

  add(elm: Node, id: number) {
    const child = elm
    if (this.set.has(id)) this.elm.replaceChild(child, this.elm.childNodes[id])
    else if (Number.isFinite(this.set.gte(id))) this.elm.insertBefore(child, this.elmMap.get(this.set.gte(id)) as Node)
    else this.elm.appendChild(child)
    this.set = this.set.add(id)
    this.elmMap.set(id, child)
  }

  remove(id: number) {
    this.elm.removeChild(this.elmMap.get(id) as Node)
  }

  release() {
    this.expected--
    if (this.expected === 0) this.sink.complete()
  }

  setAttrs = (attrs: {[k: string]: string}) => {
    // remove old ones
    for (var i = 0; i < this.elm.attributes.length; i++) {
      const attr = this.elm.attributes.item(i)
      if (!attrs[attr.name]) this.elm.removeAttribute(attr.name)
    }

    // remove old ones
    for (var k in attrs) if (attrs[k] !== this.elm.getAttribute(k)) this.elm.setAttribute(k, attrs[k])
  }

  dispatch() {
    if (!this.dispatched) {
      this.sink.next(this.elm)
      this.dispatched = true
    }
  }
}

class DataObserver<T> implements IObserver<T> {
  ref?: LinkedListNode<ISubscription>
  constructor(
    private sink: IObserver<any>,
    private cSub: CompositeSubscription,
    private parent: ElmContainer,
    private ap: (t: T) => void
  ) {}
  complete(): void {
    this.cSub.remove(this.ref)
  }

  error(err: Error): void {
    this.sink.next(err)
  }

  next(val: T): void {
    this.ap(val)
    this.parent.dispatch()
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
    this.parent.hold()
  }

  complete(): void {
    this.parent.remove(this.id)
    this.parent.release()
    this.cSub.remove(this.ref)
  }

  error(err: Error): void {
    this.sink.error(err)
  }

  next(val: Insertable): void {
    this.parent.add(toNode(val), this.id)
    this.parent.dispatch()
  }
}

class HH implements O.IObservable<Insertable> {
  constructor(private sel: string, private data: hData, private children: hChildren) {}
  subscribe(observer: IObserver<Insertable>, scheduler: IScheduler): ISubscription {
    const cSub = new O.CompositeSubscription()
    const node = new ElmContainer(this.sel, observer)
    this._data(cSub, node, observer, scheduler)
    for (var j = 0; j < this.children.length; j++) {
      const childObserver = new ChildObserver(j, node, observer, cSub)
      childObserver.ref = cSub.add(this.children[j].subscribe(childObserver, scheduler))
    }
    return cSub
  }

  private _data(cSub: CompositeSubscription, node: ElmContainer, sink: IObserver<any>, scheduler: IScheduler) {
    const {attrs, props, style, css} = this.data
    if (attrs) {
      const dataObserver = new DataObserver(sink, cSub, node, node.setAttrs)
      dataObserver.ref = cSub.add(attrs.subscribe(dataObserver, scheduler))
    }
    // if (props) cSub.add(props.subscribe(new PropsObserver(node), scheduler))
    // if (style) cSub.add(style.subscribe(new StyleObserver(node), scheduler))
    // if (css)
    //   for (var i in css)
    //     if (css.hasOwnProperty(i)) {
    //       cSub.add(css[i].subscribe(new CssObserver(node), scheduler))
    //     }
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
