/**
 * Created by tushar on 04/05/18
 */

import {CompositeSubscription, IScheduler, ISubscription} from 'observable-air'
import * as O from 'observable-air'
import {LinkedListNode} from 'observable-air/src/internal/LinkedList'
import {Insertable} from './Insertable'
import {isObservable} from './isObservable'
import {MetaObserver} from './MetaObserver'
import {RDElement} from './RDElement'
import {toNode} from './toNode'

export class ELMContext extends CompositeSubscription {
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
          super.remove(ref)
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

  addListeners(on: {[p: string]: EventListener}) {
    this.elm.setListeners(on)
    this.dispatch()
  }

  unsubscribe() {
    this.elm.setListeners({})
    super.unsubscribe()
  }
}
