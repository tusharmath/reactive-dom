import {IObservable, IObserver} from 'observable-air'
import {createElement} from './createElement'
import {toNode} from './toNode'

export type NodeWithId = {node: ReactiveElement; id: number}
export type DomMutationObject<T> = {type: MutationType; params: T}
export type Optional<T> = {[P in keyof T]?: T[P]}
export type ReactiveElement = HTMLElement | string | number
export interface NodeInternalData {
  append?: IObservable<ReactiveElement>
  attrs?: IObservable<{[key: string]: string}>
  insertAt?: IObservable<NodeWithId>
  props?: IObservable<{[key: string]: any}>
  removeAt?: IObservable<number>
  replaceAt?: IObservable<NodeWithId>
  style?: IObservable<Optional<CSSStyleDeclaration>>
  text?: IObservable<number | string>
}

export enum MutationType {
  APPEND,
  ATTRS,
  INSERT_AT,
  PROPS,
  REMOVE_AT,
  REPLACE_AT,
  STYLE,
  UPDATE_TEXT
}

export class ChildObserver implements IObserver<DomMutationObject<any>> {
  public readonly elm: HTMLElement
  private started = false

  constructor(
    selector: string,
    private nodeData: NodeInternalData,
    private sink: IObserver<HTMLElement>
  ) {
    this.elm = createElement(selector)
  }

  complete(): void {
    this.sink.complete()
  }

  error(err: Error): void {
    this.sink.error(err)
  }

  next(mutation: DomMutationObject<any>): void {
    switch (mutation.type) {
      case MutationType.APPEND:
        this.append(mutation.params)
        break
      case MutationType.INSERT_AT:
        this.insertAt(mutation.params)
        break
      case MutationType.ATTRS:
        this.updateATTR(mutation.params)
        break
      case MutationType.STYLE:
        this.updateSTY(mutation.params)
        break
      case MutationType.REMOVE_AT:
        this.removeAt(mutation.params)
        break
      case MutationType.UPDATE_TEXT:
        this.updateText(mutation.params)
        break
      case MutationType.PROPS:
        this.onProps(mutation.params)
        break
      case MutationType.REPLACE_AT:
        this.replaceAt(mutation.params)
        break
    }
    if (!this.started && this.elm.childNodes.length > 0) {
      this.sink.next(this.elm)
      this.started = true
    }
  }

  private updateATTR(attrs: any) {
    const elm = this.elm
    for (var name in attrs) {
      const value = attrs[name]
      if (attrs.hasOwnProperty(name) && elm.getAttribute(name) !== value) {
        elm.setAttribute(name, value)
      }
    }
  }

  private updateSTY(style: any) {
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

  private updateText(text: string | number) {
    const nodeString = text.toString()
    if (this.elm.textContent !== nodeString) {
      this.elm.textContent = nodeString
    }
  }

  private currentNode(id: number) {
    return this.elm.childNodes[id]
  }

  private removeAt(id: number) {
    this.elm.removeChild(this.currentNode(id))
  }

  private insertAt(child: NodeWithId) {
    const newChild = toNode(child.node)
    const htmlElement = this.elm
    if (child.id > -1 && htmlElement.childNodes.length > child.id) {
      htmlElement.insertBefore(newChild, htmlElement.childNodes[child.id])
    } else {
      htmlElement.appendChild(newChild)
    }
  }

  private replaceAt(params: NodeWithId) {
    this.elm.replaceChild(toNode(params.node), this.currentNode(params.id))
  }

  private append(params: ReactiveElement) {
    this.insertAt({node: params, id: -1})
  }
}
