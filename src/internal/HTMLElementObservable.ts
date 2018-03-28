import * as O from 'observable-air'
import {
  CompositeSubscription,
  IObservable,
  IObserver,
  IScheduler,
  ISubscription
} from 'observable-air'
import {ChildObserver} from './ChildObserver'

export type Optional<T> = {[P in keyof T]?: T[P]}
export interface NodeInternalData {
  style?: IObservable<Optional<CSSStyleDeclaration>>
  attrs?: IObservable<{[key: string]: string}>
  props?: IObservable<{[key: string]: any}>
  append?: IObservable<HTMLElement>
}
export type ReactiveElement = HTMLElement | string | number
export type NodeWithId = {node: ReactiveElement; id: number}

export class HTMLElementObservable implements IObservable<HTMLElement> {
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
