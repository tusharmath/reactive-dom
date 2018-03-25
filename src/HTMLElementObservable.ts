import * as O from 'observable-air'
import {IObservable, IObserver, IScheduler, ISubscription} from 'observable-air'
import {ChildObserver} from './internal/ChildObserver'

export type Optional<T> = {[P in keyof T]?: T[P]}
export interface NodeProps {
  style?: IObservable<Optional<CSSStyleDeclaration>>
  attrs?: IObservable<{[key: string]: string}>
  props?: IObservable<{[key: string]: any}>
}
export type ReactiveElement = Node | string | number
export type NodeWithId = {node: ReactiveElement; id: number}

class DomStreamSubscription implements ISubscription {
  constructor(private subs: Array<ISubscription>) {}
  closed = false

  unsubscribe(): void {
    for (var i = 0; i < this.subs.length; i++) {
      this.subs[i].unsubscribe()
    }
    this.closed = true
  }
}

export class HTMLElementObservable implements IObservable<HTMLElement> {
  constructor(
    private sel: string,
    private props: NodeProps,
    private children: Array<IObservable<ReactiveElement>>
  ) {}
  subscribe(
    observer: IObserver<HTMLElement>,
    scheduler: IScheduler
  ): ISubscription {
    const childObserver = new ChildObserver(
      this.sel,
      this.props,
      observer,
      scheduler
    )
    const cSub: Array<ISubscription> = [
      childObserver,
      O.merge(
        ...this.children.map((child$, id) =>
          O.map(node => ({id, node}), child$)
        )
      ).subscribe(childObserver, scheduler)
    ]
    return new DomStreamSubscription(cSub)
  }
}
