/**
 * Created by tushar on 04/05/18
 */

import {IObserver, ISubscription} from 'observable-air'
import {LinkedListNode} from 'observable-air/src/internal/LinkedList'
import {ELMContext} from './ELMContext'

export class MetaObserver implements IObserver<any> {
  public ref?: LinkedListNode<ISubscription>
  constructor(private ctx: ELMContext, private apELM: (val: any) => void) {}

  complete(): void {
    this.apELM.call(this.ctx, {})
    this.ctx.remove(this.ref)
  }

  error(err: Error): void {
    this.ctx.error(err)
  }

  next(val: any): void {
    this.apELM.call(this.ctx, val)
  }
}
