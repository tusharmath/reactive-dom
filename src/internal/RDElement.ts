/**
 * Created by tushar on 04/05/18
 */

import {createElement} from './helpers/createElement'
import {objectDiff} from './helpers/objectDiff'
import {RDSet} from './RDSet'
import {RDAttributes, RDEventListeners, RDProps, RDStyles, VNode} from './VNode'

export class RDElement {
  private _elm?: HTMLElement
  private set = new RDSet()
  private elmMap = new Map<number, Node>()
  private _prevStyle?: any
  private _prevAttrs?: any
  private _on: RDEventListeners = {}

  getElm() {
    if (this._elm) return this._elm
    throw new Error('Element has not be initialized')
  }

  init(sel: string) {
    this._elm = createElement(sel)
  }

  addChild(elm: Node, id: number) {
    const child = elm
    if (this.set.has(id)) this.getElm().replaceChild(child, this.getElm().childNodes[id])
    else if (Number.isFinite(this.set.gte(id)))
      this.getElm().insertBefore(child, this.elmMap.get(this.set.gte(id)) as Node)
    else this.getElm().appendChild(child)
    this.set = this.set.add(id)
    this.elmMap.set(id, child)
  }

  removeChild(id: number) {
    const node = this.elmMap.get(id)
    if (node) this.getElm().removeChild(node)
  }

  setAttrs(attrs: RDAttributes) {
    const {add, del} = objectDiff(attrs, this._prevAttrs)
    del.forEach(_ => this.getElm().removeAttribute(_))
    add.forEach(_ => this.getElm().setAttribute(_, attrs[_]))
    this._prevAttrs = attrs
  }

  setStyle(style: RDStyles) {
    const {add, del} = objectDiff(style, this._prevStyle)
    del.forEach(_ => this.getElm().style.removeProperty(_))
    add.forEach(_ => this.getElm().style.setProperty(_, (style as any)[_]))
    this._prevStyle = style
  }

  setProps(props: RDProps) {
    const elm = this.getElm() as any
    const {add, del} = objectDiff(props, elm)
    del.forEach(_ => delete elm[_])
    add.forEach(_ => (elm[_] = props[_]))
  }

  setListeners(on: RDEventListeners) {
    const {add, del} = objectDiff(on, this._on)
    del.forEach(_ => this.getElm().removeEventListener(_, this._on[_]))
    add.forEach(_ => this.getElm().addEventListener(_, on[_]))
    this._on = on
  }

  patch(node: VNode) {
    if (!this._elm) this.init(node.sel)
    if (node.attrs) this.setAttrs(node.attrs)
    if (node.props) this.setProps(node.props)
    if (node.style) this.setStyle(node.style)
    if (node.on) this.setListeners(node.on)
  }
}
