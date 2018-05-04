import * as O from 'observable-air'
import {CompositeSubscription, IObserver, IScheduler, ISubscription, Observable} from 'observable-air'
import {LinkedListNode} from 'observable-air/src/internal/LinkedList'
import {isObservable} from './isObservable'
import {RDElement} from './RDElement'
import {toNode} from './toNode'

export const hStatic = (text: Insertable) => new Observable<Insertable>(observer => observer.next(text))
export type Insertable = Node | HTMLElement | string | number

class ELMContext extends CompositeSubscription {
  private dispatched = false
  private readonly elm = new RDElement(this.sel)
  constructor(private sel: string, private sink: O.IObserver<Insertable>, private sh: IScheduler) {
    super()
  }

  private dispatch() {
    if (!this.dispatched) {
      this.sink.next(this.elm.elm)
      this.dispatched = true
    }
  }

  attach(method: (t: any) => void, source: any) {
    if (isObservable(source)) {
      const ob = new MetaObserver(this, method)
      ob.ref = this.add(source.subscribe(ob, this.sh))
    } else {
      const ref = this.add(
        this.sh.asap(() => {
          method.call(this, source)
          this.remove(ref)
        })
      )
    }
  }

  checkComplete() {
    if (this.length() === 0 && !this.closed) this.sink.complete()
  }

  remove(ref?: LinkedListNode<ISubscription>) {
    super.remove(ref)
    this.checkComplete()
  }

  removeChild(id: number) {
    this.elm.removeChild(id)
  }

  error(err: Error) {
    this.sink.error(err)
  }

  addChild(val: Insertable, id: number) {
    this.elm.addChild(toNode(val), id)
    this.dispatch()
  }

  setAttrs(val: any) {
    this.elm.setAttrs(val)
    this.dispatch()
  }

  setStyle(val: any) {
    this.elm.setStyle(val)
    this.dispatch()
  }

  setProps(val: any) {
    this.elm.setProps(val)
    this.dispatch()
  }
}

class MetaObserver implements IObserver<any> {
  public ref?: LinkedListNode<ISubscription>
  constructor(private ctx: ELMContext, private apELM: (val: any) => void) {}

  complete(): void {
    this.apELM.call(this.ctx, {})
    this.ctx.remove(this.ref)
  }

  error(err: Error): void {
    this.ctx.error(err)
  }

  next(val: any): void {
    this.apELM.call(this.ctx, val)
  }
}

class ChildObserver implements IObserver<Insertable> {
  ref?: LinkedListNode<ISubscription>
  constructor(private id: number, private ctx: ELMContext) {}

  complete(): void {
    this.ctx.removeChild(this.id)
    this.ctx.remove(this.ref)
  }

  error(err: Error): void {
    this.ctx.error(err)
  }

  next(val: Insertable): void {
    this.ctx.addChild(toNode(val), this.id)
  }
}

class HH implements O.IObservable<Insertable> {
  constructor(private sel: string, private data: hData, private children: hChildren) {}
  subscribe(observer: IObserver<Insertable>, scheduler: IScheduler): ISubscription {
    const ctx = new ELMContext(this.sel, observer, scheduler)
    const {attrs, style, prop} = this.data
    if (attrs) ctx.attach(ctx.setAttrs, attrs)
    if (style) ctx.attach(ctx.setStyle, style)
    if (prop) ctx.attach(ctx.setProps, prop)
    for (var j = 0; j < this.children.length; j++) {
      const childObserver = new ChildObserver(j, ctx)
      const t = this.children[j]
      const child = isObservable(t) ? t : hStatic(t)
      childObserver.ref = ctx.add(child.subscribe(childObserver, scheduler))
    }
    return ctx
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
