import * as O from 'observable-air'
import {IObservable, IObserver, IScheduler, ISubscription} from 'observable-air'
import {
  ChildObserver,
  DomMutationObject,
  MutationType,
  NodeInternalData,
  NodeWithId,
  Optional,
  ReactiveElement
} from './ChildObserver'

const TRANSFORMERS: {
  [T in keyof NodeInternalData]: (p: any) => DomMutationObject<any>
} = {
  attrs: (params: Object) => ({params, type: MutationType.ATTRS}),
  insertAt: (params: NodeWithId) => ({params, type: MutationType.INSERT_AT}),
  props: (params: Object) => ({params, type: MutationType.PROPS}),
  removeAt: (params: number) => ({params, type: MutationType.REMOVE_AT}),
  style: (params: Optional<CSSStyleDeclaration>) => ({
    params,
    type: MutationType.STYLE
  }),
  text: (params: string | number) => ({params, type: MutationType.UPDATE_TEXT}),
  append: (params: ReactiveElement) => ({params, type: MutationType.APPEND}),
  replaceAt: (params: NodeWithId) => ({params, type: MutationType.REPLACE_AT})
}

/**
 * Low level API for making DOM mutations
 */
class HH implements IObservable<HTMLElement> {
  constructor(private sel: string, private data: NodeInternalData) {}
  subscribe(
    observer: IObserver<HTMLElement>,
    scheduler: IScheduler
  ): ISubscription {
    const dmo = []

    for (var i in this.data) {
      if (this.data.hasOwnProperty(i)) {
        dmo.push(O.map((<any>TRANSFORMERS)[i], (<any>this.data)[i]))
      }
    }

    return O.merge(...dmo).subscribe(
      new ChildObserver(this.sel, this.data, observer),
      scheduler
    )
  }
}

export const hh = (sel: string, data: NodeInternalData) => new HH(sel, data)
