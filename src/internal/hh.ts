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

class HH implements O.IObservable<Insertable> {
  constructor(private sel: string, private data: hData, private children: hChildren) {}
  subscribe(observer: IObserver<Insertable>, scheduler: IScheduler): ISubscription {
    const sub = new ELMSubscription(this.sel, observer)
    const {attrs, style, prop} = this.data
    if (attrs) {
      if (isObservable(attrs)) {
        const ob = new AttrObserver(observer, sub)
        ob.ref = sub.add(attrs.subscribe(ob, scheduler))
      } else {
        const ref = sub.add(
          scheduler.asap(() => {
            sub.setAttrs(attrs)
            sub.remove(ref)
          })
        )
      }
    }
    if (style) {
      if (isObservable(style)) {
        const ob = new StyleObserver(observer, sub)
        ob.ref = sub.add(style.subscribe(ob, scheduler))
      } else {
        const ref = sub.add(
          scheduler.asap(() => {
            sub.setStyle(style)
            sub.remove(ref)
          })
        )
      }
    }
    if (prop) {
      if (isObservable(prop)) {
        const ob = new PropObserver(observer, sub)
        ob.ref = sub.add(prop.subscribe(ob, scheduler))
      } else {
        const ref = sub.add(
          scheduler.asap(() => {
            sub.setProps(prop)
            sub.remove(ref)
          })
        )
      }
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
