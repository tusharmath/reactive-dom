import {NodeInternalData, NodeWithId} from '../HTMLElementObservable'
import {IObserver, IScheduler, ISubscription} from 'observable-air'
import {createElement} from './createElement'
import {NodeDataObserver} from './NodeDataObserver'
import {updateAttrs} from './updateAttributes'
import {updateStyle} from './updateStyle'
import {toNode} from './toNode'
import {updateProps} from './updateProps'

export class ChildObserver implements IObserver<NodeWithId>, ISubscription {
  // child positions
  public closed = false
  private readonly pos = new Set<number>()
  public readonly elm: HTMLElement
  private started = false
  private subs: Array<ISubscription> = []

  constructor(
    selector: string,
    private nodeData: NodeInternalData,
    private sink: IObserver<HTMLElement>,
    private sch: IScheduler
  ) {
    this.elm = createElement(selector)
  }

  complete(): void {
    this.sink.complete()
    this.closed = true
  }

  error(err: Error): void {
    this.sink.error(err)
  }

  next(child: NodeWithId): void {
    // node exists at a particular position and needs updating
    if (this.canRemove(child)) this.remove(child)
    if (this.canUpdate(child)) this.updateText(child)
    if (this.canInsert(child)) this.insert(child)

    if (this.started === false) {
      this.attachMeta$()
      this.sink.next(this.elm)
      this.started = true
    }
  }

  private attachMeta$() {
    const P: any = {attrs: updateAttrs, style: updateStyle, props: updateProps}
    const props: any = this.nodeData
    for (var i in props) {
      const observer = new NodeDataObserver(this.elm, this.sink, P[i])
      this.subs.push(props[i].subscribe(observer, this.sch))
    }
  }

  private canInsert(child: NodeWithId) {
    return (
      (this.pos.has(child.id) && typeof child.node !== 'string') ||
      !this.pos.has(child.id)
    )
  }

  private canUpdate(child: NodeWithId) {
    return this.pos.has(child.id) && typeof child.node === 'string'
  }

  private canRemove(child: NodeWithId) {
    return (
      this.pos.has(child.id) &&
      (child.node === '' || typeof child.node !== 'string')
    )
  }

  private updateText(child: NodeWithId) {
    const currentNode = this.currentNode(child)
    if (
      currentNode &&
      typeof child.node === 'string' &&
      currentNode.textContent !== child.node
    ) {
      currentNode.textContent = child.node
    }
  }

  private currentNode(child: NodeWithId) {
    return this.elm.childNodes[child.id]
  }

  private remove(child: NodeWithId) {
    this.elm.removeChild(this.currentNode(child))
    this.pos.delete(child.id)
  }

  private insert(child: NodeWithId) {
    if (child.node !== '') {
      const newChild = toNode(child.node)
      const htmlElement = this.elm
      if (htmlElement.childNodes.length > child.id) {
        htmlElement.insertBefore(newChild, htmlElement.childNodes[child.id])
      } else {
        htmlElement.appendChild(newChild)
      }
      // update position
      this.pos.add(child.id)
    }
  }

  unsubscribe() {
    for (var i = 0; i < this.subs.length; i++) {
      this.subs[i].unsubscribe()
    }
    this.closed = true
  }
}
