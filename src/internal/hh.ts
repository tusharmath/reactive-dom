import * as O from 'observable-air'
import {IObserver, IScheduler, ISubscription} from 'observable-air'
import {ChildObserver} from './ChildObserver'
import {ELMContext} from './ELMContext'
import {hStatic} from './hStatic'
import {Insertable} from './Insertable'
import {isObservable} from './isObservable'

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
    : t.length === 2
      ? t[1] instanceof Array
        ? new HH(t[0], {}, t[1])
        : new HH(t[0], t[1], [])
      : new HH(t[0], {}, [])
}
