/**
 * Created by tushar on 15/05/18
 */

import {IObservable, IObserver, IScheduler, ISubscription} from 'observable-air'
import {RDAttributes, RDEventListeners, RDProps, RDStyles, VNode} from './VNode'

export type ReactiveElementProperties = {
  key?: string
  attrs?: RDAttributes
  props?: RDProps
  style?: RDStyles
  on?: RDEventListeners
}

export class ReactiveElement implements IObservable<VNode> {
  constructor(
    private sel: string,
    private props: ReactiveElementProperties,
    private children: Array<IObservable<VNode>>
  ) {}

  subscribe(observer: IObserver<VNode>, scheduler: IScheduler): ISubscription {
    return undefined
  }
}
