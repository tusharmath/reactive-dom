import {NodeProps, NodeWithId, ReactiveElement} from '../HTMLElementObservable'
import {IObserver, IScheduler, ISubscription} from 'observable-air'
import {createElement} from './createElement'
import {AttributeObserver} from './AttributeObserver'
import {StyleObserver} from './StyleObserver'

const toNode = (el: ReactiveElement) => {
  if (el instanceof Node) return el
  const node = createElement('span')
  node.textContent = el.toString()
  return node
}

export class ChildObserver implements IObserver<NodeWithId>, ISubscription {
  // child positions
  public closed = false
  private readonly pos = new Set<number>()
  public readonly elm: HTMLElement
  private started = false
  private subs: Array<ISubscription> = []

  constructor(
    selector: string,
    private props: NodeProps,
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
    if (this.pos.has(child.id)) {
      const childNode = this.elm.childNodes[child.id]

      // node is of text type and is different
      if (
        typeof child.node === 'string' &&
        childNode.textContent !== child.node
      ) {
        childNode.textContent = child.node
      } else {
        // node is a new HTMLElement
        this.elm.removeChild(childNode)
        this.insert(child)
      }
    } else {
      // node doesn't exist and needs to be inserted
      this.insert(child)
    }

    // update position
    this.pos.add(child.id)

    if (this.started === false) {
      // subscribe to meta streams

      // subscribe to attribute stream
      if (this.props.attrs) {
        this.subs.push(
          this.props.attrs.subscribe(
            new AttributeObserver(this.elm, this.sink),
            this.sch
          )
        )
      }

      // subscribe to style stream
      if (this.props.style) {
        this.subs.push(
          this.props.style.subscribe(
            new StyleObserver(this.elm, this.sink),
            this.sch
          )
        )
      }

      this.sink.next(this.elm)
      this.started = true
    }
  }

  private insert(child: NodeWithId) {
    const newChild = toNode(child.node)
    const htmlElement = this.elm
    if (htmlElement.childNodes.length > child.id) {
      htmlElement.insertBefore(newChild, htmlElement.childNodes[child.id])
    } else {
      htmlElement.appendChild(newChild)
    }
  }

  unsubscribe() {
    for (var i = 0; i < this.subs.length; i++) {
      this.subs[i].unsubscribe()
    }
    this.closed = true
  }
}
