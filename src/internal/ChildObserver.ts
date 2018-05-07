/**
 * Created by tushar on 04/05/18
 */

import {IObserver, ISubscription} from 'observable-air'
import {LinkedListNode} from 'observable-air/src/internal/LinkedList'
import {ELMContext} from './ELMContext'
import {Insertable} from './Insertable'
import {toNode} from './toNode'

export class ChildObserver implements IObserver<Insertable> {
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
