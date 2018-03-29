import * as O from 'observable-air'
import {CompositeSubscription, IObserver, IScheduler} from 'observable-air'
import {createElement} from './createElement'
import {
  NodeInternalData,
  NodeWithId,
  ReactiveElement
} from './HTMLElementObservable'
import {isHTMLElement} from './isHTMLElement'
import {toNode} from './toNode'

export class ChildObserver implements IObserver<NodeWithId> {
  // child positions
  private readonly pos = new Set<number>()
  public readonly elm: HTMLElement
  private started = false

  constructor(
    selector: string,
    private nodeData: NodeInternalData,
    private sink: IObserver<HTMLElement>,
    private sch: IScheduler,
    private cSub: CompositeSubscription
  ) {
    this.elm = createElement(selector)
  }

  complete(): void {
    this.sink.complete()
  }

  error(err: Error): void {
    this.sink.error(err)
  }

  next(child: NodeWithId): void {
    // node exists at a particular position and needs updating
    if (this.canRemove(child)) this.remove(child)
    if (this.canUpdate(child)) this.updateText(child)
    if (this.canInsert(child)) this.insertAt(child)

    if (this.started === false) {
      this.attachMeta$()
      this.sink.next(this.elm)
      this.started = true
    }
  }

  private onAttrs(attrs: any) {
    const elm = this.elm
    for (var name in attrs) {
      const value = attrs[name]
      if (attrs.hasOwnProperty(name) && elm.getAttribute(name) !== value) {
        elm.setAttribute(name, value)
      }
    }
  }

  private onStyle(style: any) {
    const nodeStyle: any = this.elm.style
    for (var i in style) {
      const styleElement = style[i]
      if (style.hasOwnProperty(i) && nodeStyle[i] !== styleElement)
        nodeStyle[i] = styleElement
    }
  }

  private onProps(props: any) {
    Object.assign(this.elm, props)
  }

  private onAppend(node: ReactiveElement) {
    this.insertAt({node, id: -1})
  }

  private attachMeta$() {
    const data: any = this.nodeData
    const onEvent: any = {
      attrs: this.onAttrs,
      style: this.onStyle,
      props: this.onProps,
      append: this.onAppend
    }

    for (var i in data) {
      if (data.hasOwnProperty(i)) {
        this.cSub.add(O.forEach(onEvent[i].bind(this), data[i], this.sch))
      }
    }
  }

  private canInsert(child: NodeWithId) {
    return (
      child.node !== '' &&
      ((this.pos.has(child.id) && isHTMLElement(child.node)) ||
        !this.pos.has(child.id))
    )
  }

  private canUpdate(child: NodeWithId) {
    return this.pos.has(child.id) && !isHTMLElement(typeof child.node)
  }

  private canRemove(child: NodeWithId) {
    return (
      this.pos.has(child.id) && (child.node === '' || isHTMLElement(child.node))
    )
  }

  private updateText(child: NodeWithId) {
    const currentNode = this.currentNode(child)
    const nodeString = child.node.toString()
    if (currentNode && currentNode.textContent !== nodeString) {
      currentNode.textContent = nodeString
    }
  }

  private currentNode(child: NodeWithId) {
    return this.elm.childNodes[child.id]
  }

  private remove(child: NodeWithId) {
    this.elm.removeChild(this.currentNode(child))
    this.pos.delete(child.id)
  }

  private insertAt(child: NodeWithId) {
    const newChild = toNode(child.node)
    const htmlElement = this.elm
    if (child.id > -1 && htmlElement.childNodes.length > child.id) {
      htmlElement.insertBefore(newChild, htmlElement.childNodes[child.id])
    } else {
      htmlElement.appendChild(newChild)
    }
    this.pos.add(child.id)
  }
}
