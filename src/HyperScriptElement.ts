import * as O from 'observable-air'
import {IObserver, IScheduler, ISubscription} from 'observable-air'
import {ChildObserver} from './internal/ChildObserver'
import {ELMContext} from './internal/ELMContext'
import {hStatic} from './internal/helpers/hStatic'
import {isObservable} from './internal/helpers/isObservable'
import {Insertable} from './internal/Insertable'

class HyperScriptElement implements O.IObservable<Insertable> {
  constructor(
    private sel: string,
    private data: hData,
    private children: hChildren
  ) {}
  subscribe(
    observer: IObserver<Insertable>,
    scheduler: IScheduler
  ): ISubscription {
    const ctx = new ELMContext(this.sel, observer, scheduler)
    const {on, attrs, style, props} = this.data
    if (attrs) ctx.attach(ctx.setAttrs, attrs)
    if (style) ctx.attach(ctx.setStyle, style)
    if (props) ctx.attach(ctx.setProps, props)
    if (on) ctx.addListeners(on)
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
    | O.IObservable<
        {[key in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[key]}
      >
    | {[key in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[key]}
  props?: O.IObservable<{[key: string]: any}> | {[key: string]: any}
  on?: {[key: string]: EventListener}
}

export function h(sel: string): hReturnType
export function h(sel: string, data: hData): hReturnType
export function h(sel: string, children: hChildren): hReturnType
export function h(sel: string, data: hData, children: hChildren): hReturnType
export function h(...t: any[]): hReturnType {
  return t.length === 3
    ? new HyperScriptElement(t[0], t[1], t[2])
    : t.length === 2
      ? t[1] instanceof Array
        ? new HyperScriptElement(t[0], {}, t[1])
        : new HyperScriptElement(t[0], t[1], [])
      : new HyperScriptElement(t[0], {}, [])
}
