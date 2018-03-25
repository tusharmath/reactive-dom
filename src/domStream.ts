import * as O from 'observable-air'
import {IObservable, ISubscription, Observable} from 'observable-air'
import {ChildObserver} from './ChildObserver'

export type Optional<T> = {[P in keyof T]?: T[P]}
export interface NodeProps {
  style?: IObservable<Optional<CSSStyleDeclaration>>
  attrs?: IObservable<{[key: string]: string}>
  props?: IObservable<{[key: string]: any}>
}
export type ReactiveElement = Node | string | number
export type NodeWithId = {node: ReactiveElement; id: number}

export const domStream = (
  sel: string,
  props: NodeProps,
  children: Array<IObservable<ReactiveElement>>
) =>
  new Observable((observer, scheduler) => {
    const childObserver = new ChildObserver(sel, props, observer, scheduler)
    const cSub: Array<ISubscription> = [childObserver]
    cSub.push(
      O.merge(
        ...children.map((child$, id) => O.map(node => ({id, node}), child$))
      ).subscribe(childObserver, scheduler)
    )
    return () => cSub.forEach(i => i.unsubscribe())
  })
