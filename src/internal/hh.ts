import * as O from 'observable-air'
import {CompositeSubscription, IObservable, IObserver, IScheduler, ISubscription, Observable} from 'observable-air'
import {LinkedListNode} from 'observable-air/src/internal/LinkedList'
import {createElement} from './createElement'
import {Set} from './Set'
import {toNode} from './toNode'

export const hStatic = (text: Insertable) => new Observable<Insertable>(observer => observer.next(text))
export type Insertable = Node | HTMLElement | string | number

class ELMSubscription extends CompositeSubscription {
  private dispatched = false
  private readonly elm: HTMLElement
  private set = new Set()
  private elmMap = new Map<number, Node>()
  private _prevStyle?: any
  private _prevProps?: any
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

    // add new ones
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

  setStyle(style: any) {
    const elmStyle: any = this.elm.style

    // remove old ones
    if (this._prevStyle) for (let i in this._prevStyle) if (!style[i]) elmStyle.removeProperty(i)

    // add new ones
    for (let i in style) if (elmStyle[i] !== style[i]) elmStyle[i] = style[i]

    this._prevStyle = style
    this.dispatch()
  }

  setProps(props: any) {
    const elm: any = this.elm

    // remove old ones
    if (this._prevProps) for (let i in this._prevProps) if (!props[i]) delete elm[i]

    // add new ones
    for (let i in props) if (props[i] !== elm[i]) elm[i] = props[i]

    this._prevProps = props
    this.dispatch()
  }
}

class AttrObserver implements IObserver<{[k: string]: string}> {
  ref?: LinkedListNode<ISubscription>
  constructor(private sink: IObserver<any>, private elm: ELMSubscription) {}
  complete(): void {
    this.elm.setAttrs({})
    this.elm.remove(this.ref)
  }

  error(err: Error): void {
    this.sink.next(err)
  }

  next(val: {[p: string]: string}): void {
    this.elm.setAttrs(val)
  }
}

class StyleObserver implements IObserver<{[key in keyof CSSStyleDeclaration]: CSSStyleDeclaration[key]}> {
  public ref?: LinkedListNode<ISubscription>
  constructor(private sink: IObserver<any>, private elm: ELMSubscription) {}

  complete(): void {
    this.elm.setStyle({})
    this.elm.remove(this.ref)
  }

  error(err: Error): void {
    this.sink.next(err)
  }

  next(val: {[key in keyof CSSStyleDeclaration]: CSSStyleDeclaration[key]}): void {
    this.elm.setStyle(val)
  }
}

class PropObserver implements IObserver<any> {
  public ref?: LinkedListNode<ISubscription>
  constructor(private sink: IObserver<any>, private elm: ELMSubscription) {}

  complete(): void {
    this.elm.setProps({})
    this.elm.remove(this.ref)
  }

  error(err: Error): void {
    this.sink.next(err)
  }

  next(val: any): void {
    this.elm.setProps(val)
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

function isObservable(t: any): t is IObservable<any> {
  return typeof t.subscribe === 'function'
}

class HH implements O.IObservable<Insertable> {
  constructor(private sel: string, private data: hData, private children: hChildren) {}
  subscribe(observer: IObserver<Insertable>, scheduler: IScheduler): ISubscription {
    const sub = new ELMSubscription(this.sel, observer)
    const {attrs, style, prop} = this.data
    if (attrs) {
      const ob = new AttrObserver(observer, sub)
      ob.ref = sub.add(attrs.subscribe(ob, scheduler))
    }
    if (style) {
      const ob = new StyleObserver(observer, sub)
      ob.ref = sub.add(style.subscribe(ob, scheduler))
    }
    if (prop) {
      const ob = new PropObserver(observer, sub)
      ob.ref = sub.add(prop.subscribe(ob, scheduler))
    }
    for (var j = 0; j < this.children.length; j++) {
      const childObserver = new ChildObserver(j, sub, observer)
      const t = this.children[j]
      const child = isObservable(t) ? t : hStatic(t)
      childObserver.ref = sub.add(child.subscribe(childObserver, scheduler))
    }
    return sub
  }
}

/**
 * hyperscript function
 */
export type hChildren = Array<O.IObservable<Insertable> | Insertable>
export type hReturnType = O.IObservable<HTMLElement>
export type hData = {
  attrs?: O.IObservable<{[key: string]: string}>
  style?: O.IObservable<{[key in keyof CSSStyleDeclaration]: CSSStyleDeclaration[key]}>
  prop?: O.IObservable<{[key: string]: any}>
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
