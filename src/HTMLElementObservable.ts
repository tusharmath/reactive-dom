import * as O from 'observable-air'
import {IObservable, IObserver, IScheduler, ISubscription} from 'observable-air'
import {ChildObserver} from './internal/ChildObserver'
import {CompositeSubscription} from 'observable-air/src/internal/Subscription'

export type Optional<T> = {[P in keyof T]?: T[P]}
export interface NodeInternalData {
  style?: IObservable<Optional<CSSStyleDeclaration>>
  attrs?: IObservable<{[key: string]: string}>
  props?: IObservable<{[key: string]: any}>
}
export type ReactiveElement = HTMLElement | string | number
export type NodeWithId = {node: ReactiveElement; id: number}

class HTMLElementObservable implements IObservable<HTMLElement> {
  constructor(
    private sel: string,
    private props: NodeInternalData,
    private children: Array<IObservable<ReactiveElement>>
  ) {}
  subscribe(
    observer: IObserver<HTMLElement>,
    scheduler: IScheduler
  ): ISubscription {
    const cSub = new CompositeSubscription()
    cSub.add(
      O.merge(
        ...this.children.map((child$, id) =>
          O.map(node => ({id, node}), child$)
        )
      ).subscribe(
        new ChildObserver(this.sel, this.props, observer, scheduler, cSub),
        scheduler
      )
    )

    return cSub
  }
}

export const elm = (
  sel: string,
  prop: NodeInternalData,
  children: Array<IObservable<ReactiveElement>>
) => new HTMLElementObservable(sel, prop, children)
