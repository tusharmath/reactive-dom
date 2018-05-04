import * as O from 'observable-air'
import {CompositeSubscription, IObserver, IScheduler, ISubscription, Observable} from 'observable-air'
import {LinkedListNode} from 'observable-air/src/internal/LinkedList'
import {isObservable} from './isObservable'
import {RDElement} from './RDElement'
import {toNode} from './toNode'

export const hStatic = (text: Insertable) => new Observable<Insertable>(observer => observer.next(text))
export type Insertable = Node | HTMLElement | string | number

class ELMSubscription extends CompositeSubscription {
  private dispatched = false
  private readonly elm: RDElement
  constructor(sel: string, private sink: O.IObserver<Insertable>) {
    super()
    this.elm = new RDElement(sel)
  }

  addChild(elm: Node, id: number) {
    this.elm.addChild(elm, id)
    this.dispatch()
  }

  removeChild(id: number) {
    this.elm.removeChild(id)
  }

  setAttrs(attrs: {[k: string]: string}) {
    this.elm.setAttrs(attrs)
    this.dispatch()
  }

  private dispatch() {
    if (!this.dispatched) {
      this.sink.next(this.elm.elm)
      this.dispatched = true
    }
  }

  remove(d?: LinkedListNode<ISubscription>): number | void {
    super.remove(d)
    if (this.length() === 0 && !this.closed) this.sink.complete()
  }

  setStyle(style: {[key in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[key]}) {
    this.elm.setStyle(style)
    this.dispatch()
  }

  setProps(props: any) {
    this.elm.setProps(props)
    this.dispatch()
  }
}

class MetaObserver implements IObserver<any> {
  private _ref?: LinkedListNode<ISubscription>
  constructor(private sink: IObserver<any>, protected elm: ELMSubscription, private apELM: (val: any) => void) {}

  complete(): void {
    this.apELM.call(this.elm, {})
    this.elm.remove(this._ref)
  }

  error(err: Error): void {
    this.sink.next(err)
  }

  next(val: any): void {
    this.apELM.call(this.elm, val)
  }

  set ref(ref: LinkedListNode<ISubscription>) {
    this._ref = ref
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

const setMetadata = (
  sub: ELMSubscription,
  observer: IObserver<any>,
  scheduler: IScheduler,
  method: (t: any) => void,
  metaDATA: any
) => {
  if (isObservable(metaDATA)) {
    const ob = new MetaObserver(observer, sub, method)
    ob.ref = sub.add(metaDATA.subscribe(ob, scheduler))
  } else {
    const ref = sub.add(
      scheduler.asap(() => {
        method.call(sub, metaDATA)
        sub.remove(ref)
      })
    )
  }
}

class HH implements O.IObservable<Insertable> {
  constructor(private sel: string, private data: hData, private children: hChildren) {}
  subscribe(observer: IObserver<Insertable>, scheduler: IScheduler): ISubscription {
    const sub = new ELMSubscription(this.sel, observer)
    const {attrs, style, prop} = this.data
    if (attrs) setMetadata(sub, observer, scheduler, sub.setAttrs, attrs)
    if (style) setMetadata(sub, observer, scheduler, sub.setStyle, style)
    if (prop) setMetadata(sub, observer, scheduler, sub.setProps, prop)
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
  attrs?: O.IObservable<{[key: string]: string}> | {[key: string]: string}
  style?:
    | O.IObservable<{[key in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[key]}>
    | {[key in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[key]}
  prop?: O.IObservable<{[key: string]: any}> | {[key: string]: any}
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
